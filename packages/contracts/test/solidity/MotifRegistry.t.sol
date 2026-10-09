// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {MotifRegistry} from "../../contracts/MotifRegistry.sol";

/// @dev 单独部署登记簿，测试合约自己充当审核合约（CURATION_ROLE），只测登记簿本身的规则。
contract MotifRegistryTest is Test {
    MotifRegistry internal registry;
    address internal moderator = makeAddr("moderator");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        bytes32[] memory licenses = new bytes32[](2);
        licenses[0] = "MIT";
        licenses[1] = "Apache-2.0";
        registry = new MotifRegistry(address(this), moderator, licenses);
        registry.grantRole(registry.CURATION_ROLE(), address(this));
    }

    function input(string memory seed) internal pure returns (MotifRegistry.VersionInput memory) {
        return MotifRegistry.VersionInput({
            contentHash: keccak256(bytes(seed)),
            license: "MIT",
            upstreamRepo: "",
            upstreamCommit: bytes20(0)
        });
    }

    function create(string memory slug) internal returns (uint256) {
        return registry.createItem(alice, slug, 0, 0, input(slug));
    }

    function createApproved(string memory slug) internal returns (uint256 itemId) {
        itemId = create(slug);
        registry.setVersionStatus(itemId, 1, MotifRegistry.Status.Approved);
    }

    // ---------------------------------------------------------------- 登记

    function test_CreateItemRecordsItemAndPendingVersion() public {
        MotifRegistry.VersionInput memory v = MotifRegistry.VersionInput({
            contentHash: keccak256("border-beam"),
            license: "MIT",
            upstreamRepo: "https://github.com/magicuidesign/magicui",
            upstreamCommit: bytes20(hex"1234567890abcdef1234567890abcdef12345678")
        });
        vm.expectEmit(address(registry));
        emit MotifRegistry.ItemCreated(1, "border-beam", alice, 0, 0);
        vm.expectEmit(address(registry));
        emit MotifRegistry.VersionSubmitted(
            1, 1, alice, v.contentHash, v.license, v.upstreamRepo, v.upstreamCommit
        );
        uint256 itemId = registry.createItem(alice, "border-beam", 0, 0, v);

        MotifRegistry.Item memory item = registry.getItem(itemId);
        assertEq(item.maintainer, alice);
        assertEq(item.slug, "border-beam");
        assertEq(item.versionCount, 1);
        assertEq(item.currentVersion, 0);
        MotifRegistry.Version memory version = registry.getVersion(itemId, 1);
        assertEq(version.contentHash, v.contentHash);
        assertEq(version.author, alice);
        assertEq(uint8(version.status), uint8(MotifRegistry.Status.Pending));
        assertEq(registry.itemIdOfSlug("border-beam"), itemId);
        assertEq(registry.itemIdOfContent(v.contentHash), itemId);
        assertFalse(registry.isListed(itemId));
    }

    function test_InvalidSlugsRevert() public {
        string[6] memory bad = ["", "Mesh", "-mesh", "mesh-", "mesh--gradient", "mesh_gradient"];
        for (uint256 i; i < bad.length; ++i) {
            vm.expectRevert(abi.encodeWithSelector(MotifRegistry.InvalidSlug.selector, bad[i]));
            registry.createItem(alice, bad[i], 0, 0, input(string.concat("seed", vm.toString(i))));
        }
        string memory tooLong = "a234567890123456789012345678901234567890123456789012345678901234x";
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.InvalidSlug.selector, tooLong));
        registry.createItem(alice, tooLong, 0, 0, input("long"));
    }

    function test_SlugMustBeUnique() public {
        uint256 itemId = create("mesh-gradient");
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.SlugTaken.selector, "mesh-gradient", itemId));
        registry.createItem(bob, "mesh-gradient", 0, 0, input("other content"));
    }

    function test_ContentMustBeUnique() public {
        uint256 itemId = create("mesh-gradient");
        bytes32 hash = keccak256("mesh-gradient");
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.ContentAlreadyRegistered.selector, hash, itemId));
        registry.createItem(bob, "copied", 0, 0, input("mesh-gradient"));
    }

    function test_ZeroContentHashReverts() public {
        MotifRegistry.VersionInput memory v = input("x");
        v.contentHash = bytes32(0);
        vm.expectRevert(MotifRegistry.ZeroContentHash.selector);
        registry.createItem(alice, "empty", 0, 0, v);
    }

    function test_LicenseMustBeAllowed() public {
        MotifRegistry.VersionInput memory v = input("agpl-thing");
        v.license = "AGPL-3.0-only";
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.LicenseNotAllowed.selector, v.license));
        registry.createItem(alice, "agpl-thing", 0, 0, v);

        // 治理可以调整白名单。
        registry.setLicenseAllowed("ISC", true);
        v.license = "ISC";
        registry.createItem(alice, "isc-thing", 0, 0, v);
    }

    function test_UpstreamRepoAndCommitGoTogether() public {
        MotifRegistry.VersionInput memory v = input("half");
        v.upstreamRepo = "https://github.com/example/repo";
        vm.expectRevert(MotifRegistry.InvalidUpstream.selector);
        registry.createItem(alice, "half", 0, 0, v);

        v.upstreamRepo = "";
        v.upstreamCommit = bytes20(uint160(1));
        vm.expectRevert(MotifRegistry.InvalidUpstream.selector);
        registry.createItem(alice, "half", 0, 0, v);
    }

    function test_OnlyCurationCanWrite() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, alice, registry.CURATION_ROLE()
            )
        );
        vm.prank(alice);
        registry.createItem(alice, "sneaky", 0, 0, input("sneaky"));
    }

    // ---------------------------------------------------------------- 状态

    function test_ApprovalListsItem() public {
        uint256 itemId = createApproved("mesh-gradient");
        assertEq(registry.getItem(itemId).currentVersion, 1);
        assertTrue(registry.isListed(itemId));
    }

    function test_StatusCanOnlyLeavePendingOnce() public {
        uint256 itemId = createApproved("mesh-gradient");
        vm.expectRevert(
            abi.encodeWithSelector(
                MotifRegistry.InvalidStatusTransition.selector, MotifRegistry.Status.Approved, MotifRegistry.Status.Rejected
            )
        );
        registry.setVersionStatus(itemId, 1, MotifRegistry.Status.Rejected);
    }

    function test_CannotSetStatusBackToPending() public {
        uint256 itemId = create("mesh-gradient");
        vm.expectRevert(
            abi.encodeWithSelector(
                MotifRegistry.InvalidStatusTransition.selector, MotifRegistry.Status.Pending, MotifRegistry.Status.Pending
            )
        );
        registry.setVersionStatus(itemId, 1, MotifRegistry.Status.Pending);
    }

    function test_RejectedFirstVersionReleasesSlugAndContent() public {
        uint256 itemId = create("mesh-gradient");
        vm.expectEmit(address(registry));
        emit MotifRegistry.SlugReleased(itemId, "mesh-gradient");
        registry.setVersionStatus(itemId, 1, MotifRegistry.Status.Rejected);

        assertEq(registry.itemIdOfSlug("mesh-gradient"), 0);
        assertEq(registry.itemIdOfContent(keccak256("mesh-gradient")), 0);
        // 没有通过版本的条目不能追加版本，只能重新投稿。
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.NoApprovedVersion.selector, itemId));
        registry.addVersion(itemId, alice, input("retry"));
        assertEq(create("mesh-gradient"), 2);
    }

    function test_RejectedLaterVersionKeepsSlug() public {
        uint256 itemId = createApproved("mesh-gradient");
        registry.addVersion(itemId, alice, input("v2"));
        registry.setVersionStatus(itemId, 2, MotifRegistry.Status.Rejected);

        assertEq(registry.itemIdOfSlug("mesh-gradient"), itemId);
        assertEq(registry.itemIdOfContent(keccak256("v2")), 0);
        assertEq(registry.getItem(itemId).currentVersion, 1);
        assertTrue(registry.isListed(itemId));
    }

    function test_OnlyOnePendingVersionAtATime() public {
        uint256 itemId = createApproved("mesh-gradient");
        registry.addVersion(itemId, alice, input("v2"));
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.VersionPending.selector, itemId, 2));
        registry.addVersion(itemId, alice, input("v3"));
    }

    function test_UnknownItemAndVersionRevert() public {
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.UnknownItem.selector, 0));
        registry.getItem(0);
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.UnknownItem.selector, 7));
        registry.getItem(7);
        uint256 itemId = create("mesh-gradient");
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.UnknownVersion.selector, itemId, 2));
        registry.getVersion(itemId, 2);
    }

    // ---------------------------------------------------------------- Remix

    function test_RemixRecordsLineage() public {
        uint256 parentId = createApproved("mesh-gradient");
        uint256 remixId = registry.createItem(bob, "mesh-gradient-aurora", parentId, 1, input("aurora"));
        MotifRegistry.Item memory remix = registry.getItem(remixId);
        assertEq(remix.parentId, parentId);
        assertEq(remix.parentVersion, 1);
    }

    function test_RemixRequiresApprovedListedParent() public {
        // 不存在的父条目
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.InvalidParent.selector, 9, 1));
        registry.createItem(bob, "orphan", 9, 1, input("orphan"));

        // 父版本还在审核中
        uint256 pendingId = create("pending-parent");
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.InvalidParent.selector, pendingId, 1));
        registry.createItem(bob, "too-early", pendingId, 1, input("too-early"));

        // 父条目已下架
        uint256 parentId = createApproved("mesh-gradient");
        vm.prank(moderator);
        registry.setDelisted(parentId, true, bytes32(0));
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.InvalidParent.selector, parentId, 1));
        registry.createItem(bob, "from-delisted", parentId, 1, input("from-delisted"));

        // 不是 Remix 时版本号必须为 0
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.InvalidParent.selector, 0, 3));
        registry.createItem(bob, "confused", 0, 3, input("confused"));
    }

    // ---------------------------------------------------------------- 下架

    function test_ModeratorCanDelistAndRelist() public {
        uint256 itemId = createApproved("mesh-gradient");
        vm.prank(moderator);
        registry.setDelisted(itemId, true, keccak256("report #12"));
        assertFalse(registry.isListed(itemId));

        // 下架的条目不能再追加版本。
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.ItemIsDelisted.selector, itemId));
        registry.addVersion(itemId, alice, input("v2"));

        vm.prank(moderator);
        registry.setDelisted(itemId, false, bytes32(0));
        assertTrue(registry.isListed(itemId));
    }

    function test_OnlyModeratorCanDelist() public {
        uint256 itemId = createApproved("mesh-gradient");
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, alice, registry.MODERATOR_ROLE()
            )
        );
        vm.prank(alice);
        registry.setDelisted(itemId, true, bytes32(0));
    }

    // ---------------------------------------------------------------- 维护权

    function test_MaintainerTransferIsTwoStep() public {
        uint256 itemId = createApproved("mesh-gradient");

        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.NotMaintainer.selector, itemId, bob));
        vm.prank(bob);
        registry.transferMaintainer(itemId, bob);

        vm.prank(alice);
        registry.transferMaintainer(itemId, bob);
        assertEq(registry.getItem(itemId).maintainer, alice);

        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.NotPendingMaintainer.selector, itemId, alice));
        vm.prank(alice);
        registry.acceptMaintainer(itemId);

        vm.prank(bob);
        registry.acceptMaintainer(itemId);
        MotifRegistry.Item memory item = registry.getItem(itemId);
        assertEq(item.maintainer, bob);
        assertEq(item.pendingMaintainer, address(0));

        // 新维护者可以提交版本，原维护者不行。
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.NotMaintainer.selector, itemId, alice));
        registry.addVersion(itemId, alice, input("v2"));
        registry.addVersion(itemId, bob, input("v2"));
    }
}
