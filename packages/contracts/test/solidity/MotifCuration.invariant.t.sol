// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MotifCuration} from "../../contracts/MotifCuration.sol";
import {MotifRegistry} from "../../contracts/MotifRegistry.sol";
import {MotifToken} from "../../contracts/MotifToken.sol";
import {MotifBase} from "./MotifBase.sol";

/// @dev 随机地投稿、投票、撤回、关闭过期审核、提取奖励、推进时间，并独立记一本押金账。
contract CurationHandler is Test {
    MotifCuration internal immutable curation;
    MotifToken internal immutable token;
    address internal immutable treasury;
    address[] internal submitters;
    address[] internal curators;
    uint256[] internal items;
    uint256 internal nonce;

    /// @notice 进行中审核的押金之和（handler 自己记的账）。
    uint256 public openBonds;

    constructor(
        MotifCuration curation_,
        MotifToken token_,
        address treasury_,
        address[] memory submitters_,
        address[] memory curators_
    ) {
        curation = curation_;
        token = token_;
        treasury = treasury_;
        submitters = submitters_;
        curators = curators_;
    }

    function submit(uint256 submitterSeed) external {
        address submitter = submitters[submitterSeed % submitters.length];
        string memory slug = string.concat("item-", vm.toString(++nonce));
        vm.prank(submitter);
        uint256 itemId = curation.submit(
            slug,
            0,
            0,
            MotifRegistry.VersionInput({
                contentHash: keccak256(bytes(slug)),
                license: "MIT",
                upstreamRepo: "",
                upstreamCommit: bytes20(0)
            })
        );
        items.push(itemId);
        openBonds += curation.getReview(itemId, 1).bond;
    }

    function vote(uint256 itemSeed, uint256 curatorSeed, uint8 verdictSeed) external {
        (bool found, uint256 itemId, MotifCuration.Review memory review) = pickOpen(itemSeed);
        if (!found || block.timestamp > review.deadline) return;
        address curator = curators[curatorSeed % curators.length];
        if (curation.hasVoted(itemId, 1, curator)) return;
        vm.prank(curator);
        curation.vote(itemId, 1, MotifCuration.Verdict(verdictSeed % 3), bytes32(0));
        if (curation.getReview(itemId, 1).outcome != MotifCuration.Outcome.Open) openBonds -= review.bond;
    }

    function withdraw(uint256 itemSeed) external {
        (bool found, uint256 itemId, MotifCuration.Review memory review) = pickOpen(itemSeed);
        if (!found || review.approvals + review.rejections + review.violations != 0) return;
        vm.prank(review.submitter);
        curation.withdraw(itemId, 1);
        openBonds -= review.bond;
    }

    function expire(uint256 itemSeed) external {
        (bool found, uint256 itemId, MotifCuration.Review memory review) = pickOpen(itemSeed);
        if (!found || block.timestamp <= review.deadline) return;
        curation.expire(itemId, 1);
        openBonds -= review.bond;
    }

    function withdrawRewards(uint256 amount) external {
        amount = bound(amount, 0, curation.rewardPool());
        vm.prank(treasury);
        curation.withdrawRewards(treasury, amount);
    }

    function changeBond(uint256 bond) external {
        MotifCuration.Params memory params = curation.getParams();
        params.bond = bound(bond, 0, 1_000 ether);
        vm.prank(treasury);
        curation.setParams(params);
    }

    function warp(uint256 seconds_) external {
        vm.warp(block.timestamp + bound(seconds_, 0, 3 days));
    }

    function pickOpen(uint256 seed) internal view returns (bool, uint256, MotifCuration.Review memory review) {
        if (items.length == 0) return (false, 0, review);
        uint256 itemId = items[seed % items.length];
        review = curation.getReview(itemId, 1);
        return (review.outcome == MotifCuration.Outcome.Open, itemId, review);
    }
}

contract MotifCurationInvariantTest is MotifBase {
    CurationHandler internal handler;

    function setUp() public override {
        super.setUp();
        vm.startPrank(address(timelock));
        token.transfer(alice, 1_000_000 ether);
        token.transfer(bob, 1_000_000 ether);
        vm.stopPrank();

        address[] memory submitters = new address[](2);
        (submitters[0], submitters[1]) = (alice, bob);
        address[] memory curators = new address[](3);
        (curators[0], curators[1], curators[2]) = (carol, dave, erin);
        handler = new CurationHandler(curation, token, address(timelock), submitters, curators);
        targetContract(address(handler));
    }

    /// @notice 合约记的押金总额和 handler 独立记的账一致。
    function invariant_BondAccountingMatches() public view {
        assertEq(curation.totalBonded(), handler.openBonds());
    }

    /// @notice 押金永远有足额代币支撑：奖励和提取都没有动用押金。
    function invariant_BondsAreFullyBacked() public view {
        assertGe(token.balanceOf(address(curation)), curation.totalBonded());
    }
}
