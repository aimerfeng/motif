// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {MotifIdentity} from "../../contracts/MotifIdentity.sol";

contract MotifIdentityTest is Test {
    MotifIdentity internal identity;
    address internal issuer = makeAddr("issuer");
    address internal moderator = makeAddr("moderator");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        identity = new MotifIdentity(address(this), moderator);
        identity.grantRole(identity.ISSUER_ROLE(), issuer);
    }

    function register(address account, string memory handle) internal {
        vm.prank(account);
        identity.register(handle, keccak256(bytes(handle)));
    }

    // ---------------------------------------------------------------- 资料

    function test_RegisterStoresProfile() public {
        vm.expectEmit(address(identity));
        emit MotifIdentity.ProfileRegistered(alice, "alice", keccak256("alice"));
        register(alice, "alice");

        MotifIdentity.Profile memory profile = identity.profileOf(alice);
        assertEq(profile.handle, "alice");
        assertEq(profile.metadataHash, keccak256("alice"));
        assertEq(profile.registeredAt, block.timestamp);
        assertEq(identity.handleOwner(keccak256("alice")), alice);
    }

    function test_CannotRegisterTwice() public {
        register(alice, "alice");
        vm.expectRevert(abi.encodeWithSelector(MotifIdentity.AlreadyRegistered.selector, alice));
        vm.prank(alice);
        identity.register("alice-two", bytes32(0));
    }

    function test_HandleRules() public {
        string[5] memory bad = ["ab", "Alice", "al ice", "-alice", "a23456789012345678901234567890123"];
        for (uint256 i; i < bad.length; ++i) {
            vm.expectRevert(abi.encodeWithSelector(MotifIdentity.InvalidHandle.selector, bad[i]));
            vm.prank(alice);
            identity.register(bad[i], bytes32(0));
        }
    }

    function test_HandleIsUnique() public {
        register(alice, "studio");
        vm.expectRevert(abi.encodeWithSelector(MotifIdentity.HandleTaken.selector, "studio", alice));
        vm.prank(bob);
        identity.register("studio", bytes32(0));
    }

    function test_OldHandleStaysReservedAfterRename() public {
        register(alice, "alice");
        vm.prank(alice);
        identity.changeHandle("alice-studio");
        assertEq(identity.profileOf(alice).handle, "alice-studio");

        // 旧 handle 不会被别人抢走冒充，原主人可以改回去。
        vm.expectRevert(abi.encodeWithSelector(MotifIdentity.HandleTaken.selector, "alice", alice));
        vm.prank(bob);
        identity.register("alice", bytes32(0));
        vm.prank(alice);
        identity.changeHandle("alice");
        assertEq(identity.profileOf(alice).handle, "alice");
    }

    function test_UnregisteredCannotUpdate() public {
        vm.expectRevert(abi.encodeWithSelector(MotifIdentity.NotRegistered.selector, alice));
        vm.prank(alice);
        identity.updateMetadata(bytes32(uint256(1)));
        vm.expectRevert(abi.encodeWithSelector(MotifIdentity.NotRegistered.selector, alice));
        vm.prank(alice);
        identity.changeHandle("alice");
    }

    function test_UpdateMetadata() public {
        register(alice, "alice");
        vm.prank(alice);
        identity.updateMetadata(keccak256("new bio"));
        assertEq(identity.profileOf(alice).metadataHash, keccak256("new bio"));
    }

    // ---------------------------------------------------------------- 版主

    function test_ModerationBlocksHandle() public {
        register(alice, "official-motif");
        vm.prank(moderator);
        identity.moderateProfile(alice, keccak256("impersonation"));

        MotifIdentity.Profile memory profile = identity.profileOf(alice);
        assertEq(profile.handle, "");
        assertEq(profile.metadataHash, bytes32(0));
        assertTrue(identity.handleBlocked(keccak256("official-motif")));

        vm.expectRevert(abi.encodeWithSelector(MotifIdentity.HandleIsBlocked.selector, "official-motif"));
        vm.prank(bob);
        identity.register("official-motif", bytes32(0));

        // 账号保留，可以换个 handle 继续用。
        vm.prank(alice);
        identity.changeHandle("alice");
        assertEq(identity.profileOf(alice).handle, "alice");

        // 只有治理能解封。
        identity.unblockHandle("official-motif");
        assertFalse(identity.handleBlocked(keccak256("official-motif")));
    }

    function test_ModeratingEmptyProfileReverts() public {
        vm.expectRevert(abi.encodeWithSelector(MotifIdentity.NothingToModerate.selector, alice));
        vm.prank(moderator);
        identity.moderateProfile(alice, bytes32(0));
    }

    function test_OnlyModeratorCanModerate() public {
        register(alice, "alice");
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, bob, identity.MODERATOR_ROLE()
            )
        );
        vm.prank(bob);
        identity.moderateProfile(alice, bytes32(0));
    }

    // ---------------------------------------------------------------- 声誉

    function test_ReputationAwardAndPenalty() public {
        vm.startPrank(issuer);
        vm.expectEmit(address(identity));
        emit MotifIdentity.ReputationChanged(alice, 10, 10, "publish");
        identity.award(alice, 10, "publish");
        vm.expectEmit(address(identity));
        emit MotifIdentity.ReputationChanged(alice, -4, 6, "violation");
        identity.penalize(alice, 4, "violation");
        vm.stopPrank();
        assertEq(identity.reputationOf(alice), 6);
    }

    function test_PenaltyStopsAtZero() public {
        vm.startPrank(issuer);
        identity.award(alice, 3, "publish");
        identity.penalize(alice, 50, "violation");
        identity.penalize(alice, 50, "violation");
        vm.stopPrank();
        assertEq(identity.reputationOf(alice), 0);
    }

    function test_OnlyIssuerChangesReputation() public {
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, alice, identity.ISSUER_ROLE())
        );
        vm.prank(alice);
        identity.award(alice, 1_000, "self");
    }

    function testFuzz_ReputationNeverUnderflows(uint64 awarded, uint64 penalty) public {
        vm.startPrank(issuer);
        identity.award(alice, awarded, "publish");
        identity.penalize(alice, penalty, "violation");
        vm.stopPrank();
        assertEq(identity.reputationOf(alice), penalty >= awarded ? 0 : uint256(awarded) - penalty);
    }
}
