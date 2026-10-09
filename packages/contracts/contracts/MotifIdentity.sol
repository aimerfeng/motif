// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {Slug} from "./libraries/Slug.sol";

/// @title MotifIdentity
/// @notice 创作者身份与声誉。
///         - 资料：一个地址一个 handle（站点上显示的用户名），外加资料 JSON 的 sha256。资料本身由站点托管，
///           链上的哈希让任何人都能校验站点没有篡改。
///         - 声誉：只能由审核合约（ISSUER_ROLE）增减的积分，不可转让、不可交易。
///           它衡量的是“对社区的贡献”，和 MOTIF 代币的持有量刻意分开，避免声誉被买卖。
contract MotifIdentity is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    uint256 public constant HANDLE_MIN_LENGTH = 3;
    uint256 public constant HANDLE_MAX_LENGTH = 32;

    struct Profile {
        string handle;
        bytes32 metadataHash;
        uint64 registeredAt;
    }

    mapping(address account => Profile) private _profiles;
    /// @notice handle 归谁所有。改名后旧 handle 仍归原地址，防止被别人抢注后冒充原作者。
    mapping(bytes32 handleKey => address) public handleOwner;
    /// @notice 被版主封禁的 handle，任何人都不能再用（解封需要治理）。
    mapping(bytes32 handleKey => bool) public handleBlocked;
    mapping(address account => uint256) public reputationOf;

    event ProfileRegistered(address indexed account, string handle, bytes32 metadataHash);
    event HandleChanged(address indexed account, string handle);
    event MetadataUpdated(address indexed account, bytes32 metadataHash);
    event ProfileModerated(address indexed account, string handle, bytes32 reasonHash);
    event HandleUnblocked(string handle);
    event ReputationChanged(address indexed account, int256 delta, uint256 total, bytes32 indexed reason);

    error AlreadyRegistered(address account);
    error NotRegistered(address account);
    error InvalidHandle(string handle);
    error HandleTaken(string handle, address owner);
    error HandleIsBlocked(string handle);
    error NothingToModerate(address account);

    /// @param admin 管理员（部署时先是部署者，接好角色后交给 DAO 时间锁）。
    /// @param moderator 初始版主（应急多签），address(0) 表示暂不设置。
    constructor(address admin, address moderator) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        if (moderator != address(0)) _grantRole(MODERATOR_ROLE, moderator);
    }

    // ---------------------------------------------------------------- 资料

    function register(string calldata handle, bytes32 metadataHash) external {
        Profile storage profile = _profiles[msg.sender];
        if (profile.registeredAt != 0) revert AlreadyRegistered(msg.sender);
        _claimHandle(msg.sender, handle);
        profile.handle = handle;
        profile.metadataHash = metadataHash;
        profile.registeredAt = uint64(block.timestamp);
        emit ProfileRegistered(msg.sender, handle, metadataHash);
    }

    function changeHandle(string calldata handle) external {
        Profile storage profile = _requireProfile(msg.sender);
        _claimHandle(msg.sender, handle);
        profile.handle = handle;
        emit HandleChanged(msg.sender, handle);
    }

    function updateMetadata(bytes32 metadataHash) external {
        _requireProfile(msg.sender).metadataHash = metadataHash;
        emit MetadataUpdated(msg.sender, metadataHash);
    }

    function profileOf(address account) external view returns (Profile memory) {
        return _profiles[account];
    }

    /// @notice 冒充、侵权、违法内容等情况下清空资料并封禁当前 handle。
    ///         账号本身和声誉保留，用户可以换一个 handle 继续使用。
    function moderateProfile(address account, bytes32 reasonHash) external onlyRole(MODERATOR_ROLE) {
        Profile storage profile = _profiles[account];
        string memory handle = profile.handle;
        if (bytes(handle).length == 0) revert NothingToModerate(account);
        handleBlocked[Slug.key(handle)] = true;
        profile.handle = "";
        profile.metadataHash = bytes32(0);
        emit ProfileModerated(account, handle, reasonHash);
    }

    function unblockHandle(string calldata handle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        handleBlocked[Slug.key(handle)] = false;
        emit HandleUnblocked(handle);
    }

    // ---------------------------------------------------------------- 声誉

    function award(address account, uint256 amount, bytes32 reason) external onlyRole(ISSUER_ROLE) {
        if (amount == 0) return;
        uint256 total = reputationOf[account] + amount;
        reputationOf[account] = total;
        emit ReputationChanged(account, SafeCast.toInt256(amount), total, reason);
    }

    /// @dev 扣到 0 为止，不会因为扣分失败而让整笔审核交易回滚。
    function penalize(address account, uint256 amount, bytes32 reason) external onlyRole(ISSUER_ROLE) {
        uint256 current = reputationOf[account];
        uint256 deducted = amount > current ? current : amount;
        if (deducted == 0) return;
        uint256 total = current - deducted;
        reputationOf[account] = total;
        emit ReputationChanged(account, -SafeCast.toInt256(deducted), total, reason);
    }

    // ---------------------------------------------------------------- 内部

    function _requireProfile(address account) private view returns (Profile storage profile) {
        profile = _profiles[account];
        if (profile.registeredAt == 0) revert NotRegistered(account);
    }

    function _claimHandle(address account, string calldata handle) private {
        if (!Slug.isValid(handle, HANDLE_MIN_LENGTH, HANDLE_MAX_LENGTH)) revert InvalidHandle(handle);
        bytes32 handleKey = Slug.key(handle);
        if (handleBlocked[handleKey]) revert HandleIsBlocked(handle);
        address owner = handleOwner[handleKey];
        if (owner != address(0) && owner != account) revert HandleTaken(handle, owner);
        handleOwner[handleKey] = account;
    }
}
