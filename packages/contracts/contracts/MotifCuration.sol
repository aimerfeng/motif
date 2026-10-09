// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {MotifIdentity} from "./MotifIdentity.sol";
import {MotifRegistry} from "./MotifRegistry.sol";

/// @title MotifCuration
/// @notice 社区投稿与审核的入口。
///
///         1. 投稿：任何人押上 MOTIF 押金提交新条目或新版本，登记到 MotifRegistry，状态为待审核。
///         2. 审核：DAO 任命的审核员逐个投票（通过 / 驳回 / 违规），票数先达到法定数的一方胜出。
///            审核员看的是“效果质量第一”和“许可证先行”：默认参数是否好看、调参范围内是否都不难看、
///            来源和许可证是否真实可再分发。
///         3. 结算：
///            - 通过：退押金；新条目的作者得到发布奖励和声誉；如果是 Remix，被 Remix 版本的作者也得到奖励和声誉。
///            - 驳回：退押金（质量问题不罚钱，鼓励尝试）。
///            - 违规（违规票多于普通驳回票）：押金罚没进金库，扣作者声誉。用于抄袭、许可证造假、恶意代码、垃圾投稿。
///            - 无人投票时投稿者可撤回；超过审核期无结论，任何人可以关闭并退押金。
///
///         押金和奖励池在同一个代币余额里，用 totalBonded 记账：奖励只能从“余额 − 押金总额”里发，
///         永远不会动用别人的押金。
contract MotifCuration is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    bytes32 public constant REASON_PUBLISH = "publish";
    bytes32 public constant REASON_REMIX = "remix";
    bytes32 public constant REASON_CURATE = "curate";
    bytes32 public constant REASON_VIOLATION = "violation";

    uint32 public constant MIN_REVIEW_PERIOD = 1 hours;
    uint32 public constant MAX_REVIEW_PERIOD = 90 days;

    enum Verdict {
        Approve,
        Reject,
        Violation
    }

    enum Outcome {
        None,
        Open,
        Approved,
        Rejected,
        Slashed,
        Withdrawn,
        Expired
    }

    struct Params {
        /// 每次投稿的押金。
        uint256 bond;
        /// 一方达到多少票即可结算。
        uint8 quorum;
        /// 审核期（秒），过期后任何人可以关闭并退押金。
        uint32 reviewPeriod;
        /// 新条目通过时给作者的 MOTIF。
        uint256 publishReward;
        /// Remix 通过时给被 Remix 版本作者的 MOTIF。
        uint256 remixReward;
        uint256 publishReputation;
        uint256 remixReputation;
        /// 审核员每投一票得到的声誉：奖励参与而不是“站对边”，避免审核员跟风。
        uint256 curatorReputation;
        uint256 violationPenalty;
    }

    struct Review {
        address submitter;
        uint64 deadline;
        /// 开审时的法定票数快照，治理中途改参数不影响进行中的审核。
        uint8 quorum;
        uint8 approvals;
        uint8 rejections;
        uint8 violations;
        Outcome outcome;
        /// 开审时的押金快照。
        uint256 bond;
    }

    IERC20 public immutable token;
    MotifRegistry public immutable registry;
    MotifIdentity public immutable identity;

    /// @notice 罚没押金的去处，部署时为 DAO 时间锁。
    address public treasury;
    /// @notice 进行中审核的押金总额。
    uint256 public totalBonded;

    Params private _params;
    mapping(uint256 itemId => mapping(uint32 version => Review)) private _reviews;
    mapping(uint256 itemId => mapping(uint32 version => mapping(address curator => bool))) public hasVoted;

    event ReviewOpened(
        uint256 indexed itemId, uint32 indexed version, address indexed submitter, uint256 bond, uint64 deadline
    );
    event Voted(uint256 indexed itemId, uint32 indexed version, address indexed curator, Verdict verdict, bytes32 noteHash);
    event ReviewClosed(uint256 indexed itemId, uint32 indexed version, Outcome outcome);
    /// @param paid 实际发放数量；奖励池不足时少于 owed，不足部分不补发。
    event RewardPaid(address indexed to, uint256 indexed itemId, uint256 paid, uint256 owed);
    event ParamsUpdated(Params params);
    event TreasuryUpdated(address treasury);
    event RewardsWithdrawn(address indexed to, uint256 amount);

    error ZeroAddress();
    error InvalidParams();
    error ReviewNotOpen(uint256 itemId, uint32 version);
    error ReviewPeriodOver(uint256 itemId, uint32 version);
    error ReviewPeriodNotOver(uint256 itemId, uint32 version);
    error AlreadyVoted(uint256 itemId, uint32 version, address curator);
    error ConflictOfInterest(uint256 itemId, uint32 version, address curator);
    error NotSubmitter(uint256 itemId, uint32 version, address account);
    error ReviewHasVotes(uint256 itemId, uint32 version);
    error InvalidOutcome(Outcome outcome);
    error InsufficientRewardPool(uint256 requested, uint256 available);

    /// @param admin 管理员，部署时直接传 DAO 时间锁（本合约部署后不需要再接线）。
    /// @param moderator 初始版主（应急多签），address(0) 表示暂不设置。
    /// @param curators 创世审核员。之后的任免都走治理提案。
    constructor(
        address admin,
        IERC20 token_,
        MotifRegistry registry_,
        MotifIdentity identity_,
        address treasury_,
        address moderator,
        address[] memory curators,
        Params memory params_
    ) {
        if (
            admin == address(0) || address(token_) == address(0) || address(registry_) == address(0)
                || address(identity_) == address(0)
        ) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        if (moderator != address(0)) _grantRole(MODERATOR_ROLE, moderator);
        for (uint256 i; i < curators.length; ++i) {
            _grantRole(CURATOR_ROLE, curators[i]);
        }
        token = token_;
        registry = registry_;
        identity = identity_;
        _setTreasury(treasury_);
        _setParams(params_);
    }

    // ---------------------------------------------------------------- 投稿

    /// @notice 投一个新条目。调用前需要 approve 押金（getParams().bond）给本合约。
    /// @param parentId Remix 自哪个条目，0 表示不是 Remix。
    function submit(
        string calldata slug,
        uint256 parentId,
        uint32 parentVersion,
        MotifRegistry.VersionInput calldata input
    ) external whenNotPaused nonReentrant returns (uint256 itemId) {
        itemId = registry.createItem(msg.sender, slug, parentId, parentVersion, input);
        _open(itemId, 1);
    }

    /// @notice 维护者为已上架的条目投一个新版本。
    function submitVersion(uint256 itemId, MotifRegistry.VersionInput calldata input)
        external
        whenNotPaused
        nonReentrant
        returns (uint32 version)
    {
        version = registry.addVersion(itemId, msg.sender, input);
        _open(itemId, version);
    }

    /// @notice 还没有任何审核员投票时，投稿者可以撤回并取回押金。
    /// @dev 有票之后不能撤回，否则眼看要被判违规的人可以撤回逃避罚没。暂停时也能撤回：押金永远不会被锁住。
    function withdraw(uint256 itemId, uint32 version) external nonReentrant {
        Review storage review = _requireOpen(itemId, version);
        if (msg.sender != review.submitter) revert NotSubmitter(itemId, version, msg.sender);
        if (review.approvals != 0 || review.rejections != 0 || review.violations != 0) {
            revert ReviewHasVotes(itemId, version);
        }
        _closeWithoutDecision(itemId, version, review, Outcome.Withdrawn);
    }

    /// @notice 审核期结束仍无结论时，任何人都可以关闭审核，押金退还投稿者。
    function expire(uint256 itemId, uint32 version) external nonReentrant {
        Review storage review = _requireOpen(itemId, version);
        if (block.timestamp <= review.deadline) revert ReviewPeriodNotOver(itemId, version);
        _closeWithoutDecision(itemId, version, review, Outcome.Expired);
    }

    // ---------------------------------------------------------------- 审核

    /// @param noteHash 审核意见全文的 sha256（意见由站点托管），驳回和违规时应当填写。
    function vote(uint256 itemId, uint32 version, Verdict verdict, bytes32 noteHash)
        external
        onlyRole(CURATOR_ROLE)
        nonReentrant
    {
        Review storage review = _requireOpen(itemId, version);
        if (block.timestamp > review.deadline) revert ReviewPeriodOver(itemId, version);
        if (hasVoted[itemId][version][msg.sender]) revert AlreadyVoted(itemId, version, msg.sender);
        if (msg.sender == review.submitter || _isRemixedAuthor(itemId, version, msg.sender)) {
            revert ConflictOfInterest(itemId, version, msg.sender);
        }

        hasVoted[itemId][version][msg.sender] = true;
        if (verdict == Verdict.Approve) ++review.approvals;
        else if (verdict == Verdict.Reject) ++review.rejections;
        else ++review.violations;
        emit Voted(itemId, version, msg.sender, verdict, noteHash);

        identity.award(msg.sender, _params.curatorReputation, REASON_CURATE);

        if (review.approvals >= review.quorum) {
            _approve(itemId, version, review);
        } else if (review.rejections + review.violations >= review.quorum) {
            _reject(itemId, version, review, review.violations > review.rejections);
        }
    }

    // ---------------------------------------------------------------- 治理

    /// @notice 治理直接裁定一个进行中的审核（申诉、审核员僵持、紧急情况）。
    function resolve(uint256 itemId, uint32 version, Outcome outcome)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        Review storage review = _requireOpen(itemId, version);
        if (outcome == Outcome.Approved) _approve(itemId, version, review);
        else if (outcome == Outcome.Rejected) _reject(itemId, version, review, false);
        else if (outcome == Outcome.Slashed) _reject(itemId, version, review, true);
        else revert InvalidOutcome(outcome);
    }

    function setParams(Params calldata params_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setParams(params_);
    }

    function setTreasury(address treasury_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTreasury(treasury_);
    }

    /// @notice 取回奖励池里的 MOTIF（不能动押金）。
    function withdrawRewards(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        uint256 available = rewardPool();
        if (amount > available) revert InsufficientRewardPool(amount, available);
        emit RewardsWithdrawn(to, amount);
        token.safeTransfer(to, amount);
    }

    /// @notice 遭遇垃圾投稿潮时暂停新投稿。审核、撤回、过期关闭不受影响。
    function pause() external onlyRole(MODERATOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(MODERATOR_ROLE) {
        _unpause();
    }

    // ---------------------------------------------------------------- 查询

    function getParams() external view returns (Params memory) {
        return _params;
    }

    function getReview(uint256 itemId, uint32 version) external view returns (Review memory) {
        return _reviews[itemId][version];
    }

    /// @notice 可用于发奖励的余额（合约余额减去进行中审核的押金）。
    function rewardPool() public view returns (uint256) {
        return token.balanceOf(address(this)) - totalBonded;
    }

    // ---------------------------------------------------------------- 内部

    function _open(uint256 itemId, uint32 version) private {
        uint256 bond = _params.bond;
        uint64 deadline = uint64(block.timestamp) + _params.reviewPeriod;
        _reviews[itemId][version] = Review({
            submitter: msg.sender,
            deadline: deadline,
            quorum: _params.quorum,
            approvals: 0,
            rejections: 0,
            violations: 0,
            outcome: Outcome.Open,
            bond: bond
        });
        totalBonded += bond;
        emit ReviewOpened(itemId, version, msg.sender, bond, deadline);
        if (bond != 0) token.safeTransferFrom(msg.sender, address(this), bond);
    }

    function _approve(uint256 itemId, uint32 version, Review storage review) private {
        address submitter = review.submitter;
        uint256 bond = review.bond;
        review.outcome = Outcome.Approved;
        totalBonded -= bond;
        registry.setVersionStatus(itemId, version, MotifRegistry.Status.Approved);
        emit ReviewClosed(itemId, version, Outcome.Approved);
        // 先退押金再发奖励：此时 totalBonded 已经扣掉这笔押金，先转走才不会被 rewardPool 算进去。
        if (bond != 0) token.safeTransfer(submitter, bond);

        // 奖励只发给新条目；版本更新只退押金，避免靠频繁小改刷奖励。
        if (version != 1) return;
        Params storage params_ = _params;
        identity.award(submitter, params_.publishReputation, REASON_PUBLISH);
        _payReward(submitter, itemId, params_.publishReward);

        (uint256 parentId, address parentAuthor) = _remixParent(itemId);
        // Remix 自己的作品不给 Remix 奖励。
        if (parentId == 0 || parentAuthor == submitter) return;
        identity.award(parentAuthor, params_.remixReputation, REASON_REMIX);
        _payReward(parentAuthor, itemId, params_.remixReward);
    }

    function _reject(uint256 itemId, uint32 version, Review storage review, bool slash) private {
        address submitter = review.submitter;
        uint256 bond = review.bond;
        Outcome outcome = slash ? Outcome.Slashed : Outcome.Rejected;
        review.outcome = outcome;
        totalBonded -= bond;
        registry.setVersionStatus(itemId, version, MotifRegistry.Status.Rejected);
        emit ReviewClosed(itemId, version, outcome);
        if (slash) {
            identity.penalize(submitter, _params.violationPenalty, REASON_VIOLATION);
            if (bond != 0) token.safeTransfer(treasury, bond);
        } else if (bond != 0) {
            token.safeTransfer(submitter, bond);
        }
    }

    function _closeWithoutDecision(uint256 itemId, uint32 version, Review storage review, Outcome outcome) private {
        uint256 bond = review.bond;
        review.outcome = outcome;
        totalBonded -= bond;
        registry.setVersionStatus(itemId, version, MotifRegistry.Status.Withdrawn);
        emit ReviewClosed(itemId, version, outcome);
        if (bond != 0) token.safeTransfer(review.submitter, bond);
    }

    function _payReward(address to, uint256 itemId, uint256 owed) private {
        if (owed == 0) return;
        uint256 available = rewardPool();
        uint256 paid = owed < available ? owed : available;
        emit RewardPaid(to, itemId, paid, owed);
        if (paid != 0) token.safeTransfer(to, paid);
    }

    /// @dev 新条目（第 1 版）是 Remix 时，返回父条目和被 Remix 版本的作者。
    function _remixParent(uint256 itemId) private view returns (uint256 parentId, address parentAuthor) {
        MotifRegistry.Item memory item = registry.getItem(itemId);
        parentId = item.parentId;
        if (parentId != 0) parentAuthor = registry.getVersion(parentId, item.parentVersion).author;
    }

    /// @dev 被 Remix 的作者会拿到 Remix 奖励，不能审核这次投稿。
    function _isRemixedAuthor(uint256 itemId, uint32 version, address account) private view returns (bool) {
        if (version != 1) return false;
        (uint256 parentId, address parentAuthor) = _remixParent(itemId);
        return parentId != 0 && parentAuthor == account;
    }

    function _requireOpen(uint256 itemId, uint32 version) private view returns (Review storage review) {
        review = _reviews[itemId][version];
        if (review.outcome != Outcome.Open) revert ReviewNotOpen(itemId, version);
    }

    function _setParams(Params memory params_) private {
        if (
            params_.quorum == 0 || params_.reviewPeriod < MIN_REVIEW_PERIOD
                || params_.reviewPeriod > MAX_REVIEW_PERIOD
        ) revert InvalidParams();
        _params = params_;
        emit ParamsUpdated(params_);
    }

    function _setTreasury(address treasury_) private {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }
}
