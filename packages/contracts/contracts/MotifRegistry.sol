// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Slug} from "./libraries/Slug.sol";

/// @title MotifRegistry
/// @notice 市场条目的链上登记簿：slug、维护者、每个版本的内容哈希与许可证、Remix 谱系。
///
///         源码不上链。站点托管条目的 ItemSource（清单 + 全部文件），链上只存它的 sha256
///         （计算方式见 本包 src/content-hash.ts 的 contentHash）。任何人都可以下载源码、重算哈希，
///         确认站点给的代码就是社区审核通过的那一份。
///
///         写入只走两条路：审核合约（CURATION_ROLE）登记投稿和审核结果；版主（MODERATOR_ROLE）下架。
///         维护者自己能做的只有转交维护权。
contract MotifRegistry is AccessControl {
    bytes32 public constant CURATION_ROLE = keccak256("CURATION_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    uint256 public constant SLUG_MAX_LENGTH = 64;

    enum Status {
        None,
        Pending,
        Approved,
        Rejected,
        Withdrawn
    }

    struct Item {
        address maintainer;
        /// 已提交的版本数，版本号从 1 开始连续递增。
        uint32 versionCount;
        /// 最新一个审核通过的版本，0 表示还没有。
        uint32 currentVersion;
        /// Remix 自父条目的哪个版本；parentId 为 0 时无意义。
        uint32 parentVersion;
        /// Remix 自哪个条目，0 表示不是 Remix。
        uint256 parentId;
        address pendingMaintainer;
        bool delisted;
        string slug;
    }

    struct Version {
        /// sha256(JCS({ manifest, files }))，见 本包 src/content-hash.ts 的 contentHash。
        bytes32 contentHash;
        /// SPDX 标识符的 bytes32 形式（左对齐、右补零），例如 "MIT"。
        bytes32 license;
        /// 提交这个版本的人；Remix 奖励和署名都归这个地址。
        address author;
        uint64 submittedAt;
        Status status;
    }

    struct VersionInput {
        bytes32 contentHash;
        bytes32 license;
        /// 整合自上游时的仓库地址和固定 commit；原创条目两者都留空。
        /// 它们已经包含在内容哈希里，这里再写进事件，方便索引器不下载源码也能展示来源。
        string upstreamRepo;
        bytes20 upstreamCommit;
    }

    uint256 public itemCount;
    mapping(uint256 itemId => Item) private _items;
    mapping(uint256 itemId => mapping(uint32 version => Version)) private _versions;
    mapping(bytes32 slugKey => uint256 itemId) private _itemIdOfSlug;
    /// @notice 同一份内容只能登记一次，防止原样搬运别人的条目换个 slug 再投。
    mapping(bytes32 contentHash => uint256 itemId) public itemIdOfContent;
    /// @notice 允许的许可证（SPDX，bytes32）。只收允许再分发的许可证，与 schema 包的 ALLOWED_SPDX 同源。
    mapping(bytes32 license => bool) public licenseAllowed;

    event ItemCreated(
        uint256 indexed itemId, string slug, address indexed maintainer, uint256 indexed parentId, uint32 parentVersion
    );
    event VersionSubmitted(
        uint256 indexed itemId,
        uint32 indexed version,
        address indexed author,
        bytes32 contentHash,
        bytes32 license,
        string upstreamRepo,
        bytes20 upstreamCommit
    );
    event VersionStatusChanged(uint256 indexed itemId, uint32 indexed version, Status status);
    event SlugReleased(uint256 indexed itemId, string slug);
    event ItemDelisted(uint256 indexed itemId, bool delisted, bytes32 reasonHash);
    event MaintainerTransferStarted(uint256 indexed itemId, address indexed from, address indexed to);
    event MaintainerTransferred(uint256 indexed itemId, address indexed from, address indexed to);
    event LicenseAllowedSet(bytes32 indexed license, bool allowed);

    error InvalidSlug(string slug);
    error SlugTaken(string slug, uint256 itemId);
    error UnknownItem(uint256 itemId);
    error UnknownVersion(uint256 itemId, uint32 version);
    error InvalidParent(uint256 parentId, uint32 parentVersion);
    error ZeroContentHash();
    error ContentAlreadyRegistered(bytes32 contentHash, uint256 itemId);
    error LicenseNotAllowed(bytes32 license);
    error InvalidUpstream();
    error NotMaintainer(uint256 itemId, address account);
    error NotPendingMaintainer(uint256 itemId, address account);
    error NoApprovedVersion(uint256 itemId);
    error VersionPending(uint256 itemId, uint32 version);
    error ItemIsDelisted(uint256 itemId);
    error InvalidStatusTransition(Status from, Status to);

    /// @param admin 管理员（部署时先是部署者，接好角色后交给 DAO 时间锁）。
    /// @param moderator 初始版主（应急多签），address(0) 表示暂不设置。
    /// @param licenses 初始许可证白名单，部署脚本从 schema 包的 ALLOWED_SPDX 生成。
    constructor(address admin, address moderator, bytes32[] memory licenses) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        if (moderator != address(0)) _grantRole(MODERATOR_ROLE, moderator);
        for (uint256 i; i < licenses.length; ++i) {
            licenseAllowed[licenses[i]] = true;
            emit LicenseAllowedSet(licenses[i], true);
        }
    }

    // ---------------------------------------------------------------- 审核合约写入

    /// @notice 登记一个新条目和它的第 1 个版本（待审核）。
    function createItem(
        address author,
        string calldata slug,
        uint256 parentId,
        uint32 parentVersion,
        VersionInput calldata input
    ) external onlyRole(CURATION_ROLE) returns (uint256 itemId) {
        if (!Slug.isValid(slug, 1, SLUG_MAX_LENGTH)) revert InvalidSlug(slug);
        bytes32 slugKey = Slug.key(slug);
        uint256 existing = _itemIdOfSlug[slugKey];
        if (existing != 0) revert SlugTaken(slug, existing);
        _checkParent(parentId, parentVersion);

        itemId = ++itemCount;
        _itemIdOfSlug[slugKey] = itemId;
        Item storage item = _items[itemId];
        item.maintainer = author;
        item.parentId = parentId;
        item.parentVersion = parentVersion;
        item.slug = slug;
        emit ItemCreated(itemId, slug, author, parentId, parentVersion);

        _addVersion(itemId, item, author, input);
    }

    /// @notice 维护者为已上架的条目提交新版本（待审核）。同一时间只能有一个待审核版本。
    function addVersion(uint256 itemId, address author, VersionInput calldata input)
        external
        onlyRole(CURATION_ROLE)
        returns (uint32 version)
    {
        Item storage item = _requireItem(itemId);
        if (author != item.maintainer) revert NotMaintainer(itemId, author);
        if (item.delisted) revert ItemIsDelisted(itemId);
        // 第 1 版没通过的条目已经释放了 slug，不能再往上追加版本，重新投稿即可。
        if (item.currentVersion == 0) revert NoApprovedVersion(itemId);
        uint32 latest = item.versionCount;
        if (_versions[itemId][latest].status == Status.Pending) revert VersionPending(itemId, latest);
        return _addVersion(itemId, item, author, input);
    }

    /// @notice 审核结束后更新版本状态：通过、驳回或撤回（含超时）。
    /// @dev 没通过的内容会释放内容哈希；第 1 版没通过还会释放 slug，被驳回的投稿不占用任何东西。
    function setVersionStatus(uint256 itemId, uint32 version, Status status) external onlyRole(CURATION_ROLE) {
        Item storage item = _requireItem(itemId);
        Version storage v = _requireVersion(itemId, version);
        if (v.status != Status.Pending || status == Status.None || status == Status.Pending) {
            revert InvalidStatusTransition(v.status, status);
        }
        v.status = status;
        emit VersionStatusChanged(itemId, version, status);

        if (status == Status.Approved) {
            // 版本号单调递增，且同时只有一个待审核版本，所以通过的一定是最新版本。
            item.currentVersion = version;
            return;
        }
        delete itemIdOfContent[v.contentHash];
        if (item.currentVersion == 0) {
            delete _itemIdOfSlug[Slug.key(item.slug)];
            emit SlugReleased(itemId, item.slug);
        }
    }

    // ---------------------------------------------------------------- 版主与治理

    /// @notice 下架或重新上架。下架只改变展示状态，历史版本和署名记录保留。
    function setDelisted(uint256 itemId, bool delisted, bytes32 reasonHash) external onlyRole(MODERATOR_ROLE) {
        _requireItem(itemId).delisted = delisted;
        emit ItemDelisted(itemId, delisted, reasonHash);
    }

    function setLicenseAllowed(bytes32 license, bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        licenseAllowed[license] = allowed;
        emit LicenseAllowedSet(license, allowed);
    }

    // ---------------------------------------------------------------- 维护者

    /// @notice 转交维护权（两步：对方接受后才生效）。传 address(0) 取消。
    function transferMaintainer(uint256 itemId, address to) external {
        Item storage item = _requireItem(itemId);
        if (msg.sender != item.maintainer) revert NotMaintainer(itemId, msg.sender);
        item.pendingMaintainer = to;
        emit MaintainerTransferStarted(itemId, msg.sender, to);
    }

    function acceptMaintainer(uint256 itemId) external {
        Item storage item = _requireItem(itemId);
        if (msg.sender != item.pendingMaintainer) revert NotPendingMaintainer(itemId, msg.sender);
        address from = item.maintainer;
        item.maintainer = msg.sender;
        item.pendingMaintainer = address(0);
        emit MaintainerTransferred(itemId, from, msg.sender);
    }

    // ---------------------------------------------------------------- 查询

    function getItem(uint256 itemId) external view returns (Item memory) {
        return _requireItem(itemId);
    }

    function getVersion(uint256 itemId, uint32 version) external view returns (Version memory) {
        return _requireVersion(itemId, version);
    }

    /// @notice slug 当前属于哪个条目；0 表示没有被占用。
    function itemIdOfSlug(string calldata slug) external view returns (uint256) {
        return _itemIdOfSlug[Slug.key(slug)];
    }

    /// @notice 条目是否应该出现在市场里：有通过的版本且没被下架。
    function isListed(uint256 itemId) external view returns (bool) {
        Item storage item = _requireItem(itemId);
        return item.currentVersion != 0 && !item.delisted;
    }

    // ---------------------------------------------------------------- 内部

    function _addVersion(uint256 itemId, Item storage item, address author, VersionInput calldata input)
        private
        returns (uint32 version)
    {
        if (input.contentHash == bytes32(0)) revert ZeroContentHash();
        uint256 owner = itemIdOfContent[input.contentHash];
        if (owner != 0) revert ContentAlreadyRegistered(input.contentHash, owner);
        if (!licenseAllowed[input.license]) revert LicenseNotAllowed(input.license);
        // 仓库和 commit 要么都填（上游条目），要么都空（原创）。
        if ((bytes(input.upstreamRepo).length == 0) != (input.upstreamCommit == bytes20(0))) revert InvalidUpstream();

        version = ++item.versionCount;
        itemIdOfContent[input.contentHash] = itemId;
        _versions[itemId][version] = Version({
            contentHash: input.contentHash,
            license: input.license,
            author: author,
            submittedAt: uint64(block.timestamp),
            status: Status.Pending
        });
        emit VersionSubmitted(
            itemId, version, author, input.contentHash, input.license, input.upstreamRepo, input.upstreamCommit
        );
    }

    /// @dev Remix 只能基于已上架条目里审核通过的版本。
    function _checkParent(uint256 parentId, uint32 parentVersion) private view {
        if (parentId == 0) {
            if (parentVersion != 0) revert InvalidParent(parentId, parentVersion);
            return;
        }
        if (parentId > itemCount) revert InvalidParent(parentId, parentVersion);
        Item storage parent = _items[parentId];
        if (parent.delisted || _versions[parentId][parentVersion].status != Status.Approved) {
            revert InvalidParent(parentId, parentVersion);
        }
    }

    function _requireItem(uint256 itemId) private view returns (Item storage item) {
        if (itemId == 0 || itemId > itemCount) revert UnknownItem(itemId);
        return _items[itemId];
    }

    function _requireVersion(uint256 itemId, uint32 version) private view returns (Version storage v) {
        Item storage item = _requireItem(itemId);
        if (version == 0 || version > item.versionCount) revert UnknownVersion(itemId, version);
        return _versions[itemId][version];
    }
}
