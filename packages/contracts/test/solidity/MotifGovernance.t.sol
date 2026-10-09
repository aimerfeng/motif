// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MotifCuration} from "../../contracts/MotifCuration.sol";
import {MotifToken} from "../../contracts/MotifToken.sol";
import {MotifBase} from "./MotifBase.sol";

contract MotifGovernanceTest is MotifBase {
    address internal frank = makeAddr("frank");

    struct Proposal {
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        string description;
    }

    // ---------------------------------------------------------------- 部署后的权限结构

    function test_DeployerKeepsNoRoles() public view {
        bytes32 admin = registry.DEFAULT_ADMIN_ROLE();
        assertFalse(registry.hasRole(admin, deployer));
        assertFalse(identity.hasRole(admin, deployer));
        assertFalse(curation.hasRole(admin, deployer));
        assertFalse(timelock.hasRole(admin, deployer));

        assertTrue(registry.hasRole(admin, address(timelock)));
        assertTrue(identity.hasRole(admin, address(timelock)));
        assertTrue(curation.hasRole(admin, address(timelock)));
        // TimelockController 自己是自己的管理员：改角色也得走提案。
        assertTrue(timelock.hasRole(admin, address(timelock)));
        assertTrue(timelock.hasRole(timelock.PROPOSER_ROLE(), address(governor)));
        assertTrue(timelock.hasRole(timelock.EXECUTOR_ROLE(), address(0)));
        assertEq(token.owner(), address(timelock));
    }

    function test_VotesUseTimestamps() public view {
        assertEq(token.CLOCK_MODE(), "mode=timestamp");
        assertEq(governor.CLOCK_MODE(), "mode=timestamp");
        assertEq(token.clock(), block.timestamp);
    }

    // ---------------------------------------------------------------- 代币

    function test_GenesisAllocationIsCapped() public {
        address[] memory recipients = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        recipients[0] = alice;
        amounts[0] = token.MAX_SUPPLY() + 1;
        vm.expectRevert(abi.encodeWithSelector(MotifToken.MaxSupplyExceeded.selector, amounts[0], token.MAX_SUPPLY()));
        new MotifToken(address(this), recipients, amounts);
    }

    function test_OnlyTimelockCanMint() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        vm.prank(alice);
        token.mint(alice, 1);
    }

    function test_MintNeverExceedsCap() public {
        uint256 available = token.MAX_SUPPLY() - token.totalSupply();
        vm.startPrank(address(timelock));
        token.mint(frank, available);
        vm.expectRevert(abi.encodeWithSelector(MotifToken.MaxSupplyExceeded.selector, 1, 0));
        token.mint(frank, 1);
        vm.stopPrank();
    }

    function test_VotingPowerRequiresDelegation() public {
        assertEq(token.getVotes(voter), 0);
        vm.prank(voter);
        token.delegate(voter);
        assertEq(token.getVotes(voter), VOTER_ALLOCATION);
    }

    // ---------------------------------------------------------------- 提案

    function test_ProposalAppointsCuratorTunesParamsAndFundsRewards() public {
        Proposal memory p = curationProposal();
        uint256 poolBefore = curation.rewardPool();
        delegateAndWait(voter);

        vm.prank(voter);
        uint256 proposalId = governor.propose(p.targets, p.values, p.calldatas, p.description);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Pending));

        vm.warp(block.timestamp + VOTING_DELAY + 1);
        vm.prank(voter);
        governor.castVote(proposalId, 1);
        vm.warp(governor.proposalDeadline(proposalId) + 1);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Succeeded));

        bytes32 descriptionHash = keccak256(bytes(p.description));
        governor.queue(p.targets, p.values, p.calldatas, descriptionHash);
        // 时间锁延迟期内不能执行。
        vm.expectRevert();
        governor.execute(p.targets, p.values, p.calldatas, descriptionHash);

        vm.warp(block.timestamp + TIMELOCK_DELAY + 1);
        governor.execute(p.targets, p.values, p.calldatas, descriptionHash);

        assertTrue(curation.hasRole(curation.CURATOR_ROLE(), frank));
        assertEq(curation.getParams().quorum, 3);
        assertEq(curation.rewardPool(), poolBefore + 50_000 ether);
    }

    function test_ProposalWithoutQuorumIsDefeated() public {
        Proposal memory p = curationProposal();
        delegateAndWait(voter);
        vm.prank(alice);
        token.delegate(alice);

        vm.prank(voter);
        uint256 proposalId = governor.propose(p.targets, p.values, p.calldatas, p.description);
        vm.warp(block.timestamp + VOTING_DELAY + 1);
        // 只有 1 万票，远低于 4% 的法定人数。
        vm.prank(alice);
        governor.castVote(proposalId, 1);
        vm.warp(governor.proposalDeadline(proposalId) + 1);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Defeated));
    }

    function test_LateQuorumExtendsVoting() public {
        Proposal memory p = curationProposal();
        delegateAndWait(voter);
        vm.prank(voter);
        uint256 proposalId = governor.propose(p.targets, p.values, p.calldatas, p.description);
        uint256 originalDeadline = governor.proposalDeadline(proposalId);

        // 最后一小时才达到法定人数：投票期自动延长，其他人还有一天时间反应。
        vm.warp(originalDeadline - 1 hours);
        vm.prank(voter);
        governor.castVote(proposalId, 1);
        assertEq(governor.proposalDeadline(proposalId), block.timestamp + LATE_QUORUM_EXTENSION);
    }

    function test_SmallHoldersCannotPropose() public {
        Proposal memory p = curationProposal();
        delegateAndWait(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                IGovernor.GovernorInsufficientProposerVotes.selector, alice, CREATOR_ALLOCATION, PROPOSAL_THRESHOLD
            )
        );
        vm.prank(alice);
        governor.propose(p.targets, p.values, p.calldatas, p.description);
    }

    function test_TimelockCannotBeCalledDirectly() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, voter, timelock.PROPOSER_ROLE()
            )
        );
        vm.prank(voter);
        timelock.schedule(address(token), 0, "", bytes32(0), bytes32(0), TIMELOCK_DELAY);
    }

    // ---------------------------------------------------------------- 工具

    function delegateAndWait(address account) internal {
        vm.prank(account);
        token.delegate(account);
        // 发起提案时按上一秒的票数计算门槛。
        vm.warp(block.timestamp + 1);
    }

    function curationProposal() internal view returns (Proposal memory p) {
        MotifCuration.Params memory params = defaultParams();
        params.quorum = 3;
        p.targets = new address[](3);
        p.values = new uint256[](3);
        p.calldatas = new bytes[](3);
        (p.targets[0], p.calldatas[0]) =
            (address(curation), abi.encodeCall(IAccessControl.grantRole, (curation.CURATOR_ROLE(), frank)));
        (p.targets[1], p.calldatas[1]) = (address(curation), abi.encodeCall(MotifCuration.setParams, (params)));
        (p.targets[2], p.calldatas[2]) =
            (address(token), abi.encodeCall(IERC20.transfer, (address(curation), 50_000 ether)));
        p.description = "Appoint frank as curator, raise review quorum to 3, fund the reward pool";
    }
}
