// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {MotifCuration} from "../../contracts/MotifCuration.sol";
import {MotifRegistry} from "../../contracts/MotifRegistry.sol";
import {MotifBase} from "./MotifBase.sol";

contract MotifCurationTest is MotifBase {
    // ---------------------------------------------------------------- 投稿

    function test_SubmitTakesBondAndOpensReview() public {
        uint256 before = token.balanceOf(alice);
        vm.expectEmit(address(curation));
        emit MotifCuration.ReviewOpened(1, 1, alice, BOND, uint64(block.timestamp) + REVIEW_PERIOD);
        uint256 itemId = submit(alice, "mesh-gradient");

        assertEq(itemId, 1);
        assertEq(token.balanceOf(alice), before - BOND);
        assertEq(curation.totalBonded(), BOND);
        assertEq(curation.rewardPool(), REWARD_POOL);
        MotifCuration.Review memory review = curation.getReview(itemId, 1);
        assertEq(review.submitter, alice);
        assertEq(uint8(review.outcome), uint8(MotifCuration.Outcome.Open));
        assertEq(review.quorum, QUORUM);
        assertEq(uint8(registry.getVersion(itemId, 1).status), uint8(MotifRegistry.Status.Pending));
    }

    function test_SubmitWithoutAllowanceReverts() public {
        address stranger = makeAddr("stranger");
        vm.expectRevert();
        vm.prank(stranger);
        curation.submit("no-bond", 0, 0, input("no-bond"));
    }

    // ---------------------------------------------------------------- 通过

    function test_ApprovalRefundsBondAndPaysPublishReward() public {
        uint256 before = token.balanceOf(alice);
        uint256 itemId = submit(alice, "mesh-gradient");

        castVote(carol, itemId, 1, MotifCuration.Verdict.Approve);
        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Open));

        vm.expectEmit(address(curation));
        emit MotifCuration.RewardPaid(alice, itemId, PUBLISH_REWARD, PUBLISH_REWARD);
        castVote(dave, itemId, 1, MotifCuration.Verdict.Approve);

        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Approved));
        assertEq(token.balanceOf(alice), before + PUBLISH_REWARD);
        assertEq(curation.totalBonded(), 0);
        assertEq(curation.rewardPool(), REWARD_POOL - PUBLISH_REWARD);
        assertTrue(registry.isListed(itemId));
        assertEq(identity.reputationOf(alice), PUBLISH_REPUTATION);
        assertEq(identity.reputationOf(carol), CURATOR_REPUTATION);
        assertEq(identity.reputationOf(dave), CURATOR_REPUTATION);
    }

    function test_RemixRewardsTheRemixedAuthor() public {
        uint256 parentId = publish(alice, "mesh-gradient");
        uint256 aliceBefore = token.balanceOf(alice);
        uint256 bobBefore = token.balanceOf(bob);

        uint256 remixId = submitRemix(bob, "mesh-gradient-aurora", parentId, 1);
        castVote(carol, remixId, 1, MotifCuration.Verdict.Approve);
        castVote(erin, remixId, 1, MotifCuration.Verdict.Approve);

        assertEq(token.balanceOf(alice), aliceBefore + REMIX_REWARD);
        assertEq(token.balanceOf(bob), bobBefore + PUBLISH_REWARD);
        assertEq(identity.reputationOf(alice), PUBLISH_REPUTATION + REMIX_REPUTATION);
        assertEq(identity.reputationOf(bob), PUBLISH_REPUTATION);
        MotifRegistry.Item memory remix = registry.getItem(remixId);
        assertEq(remix.parentId, parentId);
        assertEq(remix.parentVersion, 1);
    }

    function test_RemixOfOwnItemEarnsNoRemixReward() public {
        uint256 parentId = publish(alice, "mesh-gradient");
        uint256 before = token.balanceOf(alice);
        uint256 remixId = submitRemix(alice, "mesh-gradient-dusk", parentId, 1);
        approve(remixId, 1);

        assertEq(token.balanceOf(alice), before + PUBLISH_REWARD);
        assertEq(identity.reputationOf(alice), 2 * PUBLISH_REPUTATION);
    }

    function test_VersionUpdateRefundsBondWithoutReward() public {
        uint256 itemId = publish(alice, "mesh-gradient");
        uint256 before = token.balanceOf(alice);

        vm.prank(alice);
        uint32 version = curation.submitVersion(itemId, input("mesh-gradient@2"));
        assertEq(version, 2);
        approve(itemId, 2);

        assertEq(token.balanceOf(alice), before);
        assertEq(identity.reputationOf(alice), PUBLISH_REPUTATION);
        assertEq(registry.getItem(itemId).currentVersion, 2);
    }

    function test_OnlyMaintainerCanSubmitVersions() public {
        uint256 itemId = publish(alice, "mesh-gradient");
        vm.expectRevert(abi.encodeWithSelector(MotifRegistry.NotMaintainer.selector, itemId, bob));
        vm.prank(bob);
        curation.submitVersion(itemId, input("hijack"));
    }

    // ---------------------------------------------------------------- 驳回与违规

    function test_RejectionRefundsBondAndReleasesSlug() public {
        uint256 before = token.balanceOf(alice);
        uint256 itemId = submit(alice, "mesh-gradient");
        castVote(carol, itemId, 1, MotifCuration.Verdict.Reject);
        castVote(dave, itemId, 1, MotifCuration.Verdict.Reject);

        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Rejected));
        assertEq(token.balanceOf(alice), before);
        assertEq(registry.itemIdOfSlug("mesh-gradient"), 0);
        assertFalse(registry.isListed(itemId));

        // 被驳回的投稿不占用 slug 和内容，改好之后可以重新投。
        uint256 again = submit(alice, "mesh-gradient");
        assertEq(again, 2);
    }

    function test_ViolationSlashesBondToTreasury() public {
        publish(alice, "mesh-gradient");
        uint256 treasuryBefore = token.balanceOf(address(timelock));
        uint256 itemId = submit(alice, "stolen-effect");

        castVote(carol, itemId, 1, MotifCuration.Verdict.Violation);
        castVote(dave, itemId, 1, MotifCuration.Verdict.Violation);

        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Slashed));
        assertEq(token.balanceOf(address(timelock)), treasuryBefore + BOND);
        // 原有 10 分，扣 20 分到 0 为止。
        assertEq(identity.reputationOf(alice), 0);
        assertEq(curation.totalBonded(), 0);
    }

    function test_SplitNegativeVotesDoNotSlash() public {
        uint256 before = token.balanceOf(alice);
        uint256 itemId = submit(alice, "borderline");
        castVote(carol, itemId, 1, MotifCuration.Verdict.Reject);
        castVote(dave, itemId, 1, MotifCuration.Verdict.Violation);

        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Rejected));
        assertEq(token.balanceOf(alice), before);
    }

    function test_FirstSideToReachQuorumWins() public {
        uint256 itemId = submit(alice, "contested");
        castVote(carol, itemId, 1, MotifCuration.Verdict.Reject);
        castVote(dave, itemId, 1, MotifCuration.Verdict.Approve);
        castVote(erin, itemId, 1, MotifCuration.Verdict.Approve);
        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Approved));
    }

    // ---------------------------------------------------------------- 投票限制

    function test_OnlyCuratorsCanVote() public {
        uint256 itemId = submit(alice, "mesh-gradient");
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, bob, curation.CURATOR_ROLE()
            )
        );
        vm.prank(bob);
        curation.vote(itemId, 1, MotifCuration.Verdict.Approve, bytes32(0));
    }

    function test_CuratorCannotVoteTwice() public {
        uint256 itemId = submit(alice, "mesh-gradient");
        castVote(carol, itemId, 1, MotifCuration.Verdict.Reject);
        vm.expectRevert(abi.encodeWithSelector(MotifCuration.AlreadyVoted.selector, itemId, 1, carol));
        vm.prank(carol);
        curation.vote(itemId, 1, MotifCuration.Verdict.Reject, bytes32(0));
    }

    function test_CuratorCannotReviewOwnSubmission() public {
        vm.prank(address(timelock));
        token.transfer(carol, BOND);
        vm.startPrank(carol);
        token.approve(address(curation), BOND);
        uint256 itemId = curation.submit("carol-effect", 0, 0, input("carol-effect"));
        vm.expectRevert(abi.encodeWithSelector(MotifCuration.ConflictOfInterest.selector, itemId, 1, carol));
        curation.vote(itemId, 1, MotifCuration.Verdict.Approve, bytes32(0));
        vm.stopPrank();
    }

    function test_RemixedAuthorCannotReviewTheRemix() public {
        // carol 先作为作者发布一个条目，再作为审核员审 bob 对它的 Remix。
        vm.prank(address(timelock));
        token.transfer(carol, BOND);
        vm.startPrank(carol);
        token.approve(address(curation), BOND);
        uint256 parentId = curation.submit("carol-effect", 0, 0, input("carol-effect"));
        vm.stopPrank();
        castVote(dave, parentId, 1, MotifCuration.Verdict.Approve);
        castVote(erin, parentId, 1, MotifCuration.Verdict.Approve);

        uint256 remixId = submitRemix(bob, "carol-effect-remix", parentId, 1);
        vm.expectRevert(abi.encodeWithSelector(MotifCuration.ConflictOfInterest.selector, remixId, 1, carol));
        vm.prank(carol);
        curation.vote(remixId, 1, MotifCuration.Verdict.Approve, bytes32(0));
    }

    function test_CannotVoteAfterReviewPeriod() public {
        uint256 itemId = submit(alice, "mesh-gradient");
        vm.warp(block.timestamp + REVIEW_PERIOD + 1);
        vm.expectRevert(abi.encodeWithSelector(MotifCuration.ReviewPeriodOver.selector, itemId, 1));
        vm.prank(carol);
        curation.vote(itemId, 1, MotifCuration.Verdict.Approve, bytes32(0));
    }

    function test_CannotVoteOnClosedReview() public {
        uint256 itemId = publish(alice, "mesh-gradient");
        vm.expectRevert(abi.encodeWithSelector(MotifCuration.ReviewNotOpen.selector, itemId, 1));
        vm.prank(erin);
        curation.vote(itemId, 1, MotifCuration.Verdict.Violation, bytes32(0));
    }

    // ---------------------------------------------------------------- 撤回与过期

    function test_SubmitterCanWithdrawBeforeAnyVote() public {
        uint256 before = token.balanceOf(alice);
        uint256 itemId = submit(alice, "mesh-gradient");
        vm.prank(alice);
        curation.withdraw(itemId, 1);

        assertEq(token.balanceOf(alice), before);
        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Withdrawn));
        assertEq(uint8(registry.getVersion(itemId, 1).status), uint8(MotifRegistry.Status.Withdrawn));
        assertEq(registry.itemIdOfSlug("mesh-gradient"), 0);
    }

    function test_CannotWithdrawOnceVotingStarted() public {
        uint256 itemId = submit(alice, "mesh-gradient");
        castVote(carol, itemId, 1, MotifCuration.Verdict.Violation);
        vm.expectRevert(abi.encodeWithSelector(MotifCuration.ReviewHasVotes.selector, itemId, 1));
        vm.prank(alice);
        curation.withdraw(itemId, 1);
    }

    function test_OnlySubmitterCanWithdraw() public {
        uint256 itemId = submit(alice, "mesh-gradient");
        vm.expectRevert(abi.encodeWithSelector(MotifCuration.NotSubmitter.selector, itemId, 1, bob));
        vm.prank(bob);
        curation.withdraw(itemId, 1);
    }

    function test_AnyoneCanExpireAStaleReview() public {
        uint256 before = token.balanceOf(alice);
        uint256 itemId = submit(alice, "mesh-gradient");

        vm.expectRevert(abi.encodeWithSelector(MotifCuration.ReviewPeriodNotOver.selector, itemId, 1));
        curation.expire(itemId, 1);

        vm.warp(block.timestamp + REVIEW_PERIOD + 1);
        vm.prank(bob);
        curation.expire(itemId, 1);
        assertEq(token.balanceOf(alice), before);
        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Expired));
    }

    // ---------------------------------------------------------------- 暂停

    function test_PauseBlocksSubmissionsButNotExits() public {
        uint256 itemId = submit(alice, "mesh-gradient");
        vm.prank(guardian);
        curation.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(bob);
        curation.submit("blocked", 0, 0, input("blocked"));

        // 押金永远不会被暂停锁住。
        vm.prank(alice);
        curation.withdraw(itemId, 1);

        vm.prank(guardian);
        curation.unpause();
        submit(bob, "allowed-again");
    }

    // ---------------------------------------------------------------- 奖励池

    function test_RewardsNeverTouchBonds() public {
        uint256 openItem = submit(bob, "pending-item");

        vm.prank(address(timelock));
        curation.withdrawRewards(address(timelock), REWARD_POOL);
        assertEq(curation.rewardPool(), 0);
        assertEq(token.balanceOf(address(curation)), BOND);

        vm.expectRevert(abi.encodeWithSelector(MotifCuration.InsufficientRewardPool.selector, 1, 0));
        vm.prank(address(timelock));
        curation.withdrawRewards(address(timelock), 1);

        // 奖励池空了，审核照常通过，只是奖励发 0。
        uint256 itemId = submit(alice, "mesh-gradient");
        castVote(carol, itemId, 1, MotifCuration.Verdict.Approve);
        vm.expectEmit(address(curation));
        emit MotifCuration.RewardPaid(alice, itemId, 0, PUBLISH_REWARD);
        castVote(dave, itemId, 1, MotifCuration.Verdict.Approve);
        assertTrue(registry.isListed(itemId));
        assertEq(curation.totalBonded(), BOND);
        assertEq(curation.getReview(openItem, 1).bond, BOND);
    }

    function test_PartialRewardWhenPoolRunsLow() public {
        vm.prank(address(timelock));
        curation.withdrawRewards(address(timelock), REWARD_POOL - 300 ether);
        uint256 before = token.balanceOf(alice);
        publish(alice, "mesh-gradient");
        assertEq(token.balanceOf(alice), before + 300 ether);
        assertEq(curation.rewardPool(), 0);
    }

    // ---------------------------------------------------------------- 治理

    function test_ParamChangesDoNotAffectOpenReviews() public {
        uint256 itemId = submit(alice, "mesh-gradient");

        MotifCuration.Params memory params = defaultParams();
        params.quorum = 3;
        params.bond = 500 ether;
        vm.prank(address(timelock));
        curation.setParams(params);

        // 进行中的审核仍按开审时的 2 票结算，退的也是开审时的押金。
        uint256 before = token.balanceOf(alice);
        castVote(carol, itemId, 1, MotifCuration.Verdict.Reject);
        castVote(dave, itemId, 1, MotifCuration.Verdict.Reject);
        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Rejected));
        assertEq(token.balanceOf(alice), before + BOND);
    }

    function test_ZeroEconomicsIsPlainRegistrationAndReview() public {
        // 第一阶段（ADR 0007）：押金和奖励都是 0。没有代币的人也能投稿，通过后只记声誉，奖励池一分不动。
        MotifCuration.Params memory params = defaultParams();
        params.bond = 0;
        params.publishReward = 0;
        params.remixReward = 0;
        vm.prank(address(timelock));
        curation.setParams(params);

        address stranger = makeAddr("stranger");
        uint256 pool = curation.rewardPool();
        uint256 itemId = submit(stranger, "no-bond");
        assertEq(curation.totalBonded(), 0);
        approve(itemId, 1);
        assertTrue(registry.isListed(itemId));

        uint256 bobBefore = token.balanceOf(bob);
        uint256 remixId = submitRemix(bob, "no-bond-remix", itemId, 1);
        approve(remixId, 1);

        assertEq(token.balanceOf(stranger), 0);
        assertEq(token.balanceOf(bob), bobBefore);
        assertEq(curation.rewardPool(), pool);
        assertEq(identity.reputationOf(stranger), PUBLISH_REPUTATION + REMIX_REPUTATION);
        assertEq(identity.reputationOf(bob), PUBLISH_REPUTATION);
    }

    function test_InvalidParamsRevert() public {
        MotifCuration.Params memory params = defaultParams();
        params.quorum = 0;
        vm.expectRevert(MotifCuration.InvalidParams.selector);
        vm.prank(address(timelock));
        curation.setParams(params);

        params = defaultParams();
        params.reviewPeriod = 91 days;
        vm.expectRevert(MotifCuration.InvalidParams.selector);
        vm.prank(address(timelock));
        curation.setParams(params);
    }

    function test_GovernanceCanResolveOpenReview() public {
        uint256 treasuryBefore = token.balanceOf(address(timelock));
        uint256 itemId = submit(alice, "disputed");
        castVote(carol, itemId, 1, MotifCuration.Verdict.Approve);

        vm.prank(address(timelock));
        curation.resolve(itemId, 1, MotifCuration.Outcome.Slashed);
        assertEq(uint8(curation.getReview(itemId, 1).outcome), uint8(MotifCuration.Outcome.Slashed));
        assertEq(token.balanceOf(address(timelock)), treasuryBefore + BOND);
    }

    function test_ResolveRejectsNonDecisionOutcomes() public {
        uint256 itemId = submit(alice, "disputed");
        vm.expectRevert(
            abi.encodeWithSelector(MotifCuration.InvalidOutcome.selector, MotifCuration.Outcome.Withdrawn)
        );
        vm.prank(address(timelock));
        curation.resolve(itemId, 1, MotifCuration.Outcome.Withdrawn);
    }

    function test_OnlyGovernanceCanChangeParams() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, guardian, curation.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(guardian);
        curation.setParams(defaultParams());
    }
}
