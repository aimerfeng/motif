// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorPreventLateQuorum} from "@openzeppelin/contracts/governance/extensions/GovernorPreventLateQuorum.sol";
import {GovernorSettings} from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import {GovernorTimelockControl} from "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

/// @title MotifGovernor
/// @notice 社区治理：持有并委托了 MOTIF 的地址发起和表决提案，通过后交给时间锁排队执行。
///         能治理的事情包括：任免审核员和版主、调整审核参数与奖励、许可证白名单、增发、金库支出。
/// @dev 时间单位全部是秒（MotifToken 用时间戳时钟）。
///      GovernorPreventLateQuorum：如果法定人数在投票快结束时才达到，自动延长投票期，
///      防止有人在最后一刻突击投票让其他人来不及反应。
contract MotifGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorPreventLateQuorum,
    GovernorTimelockControl
{
    struct Config {
        uint48 votingDelay;
        uint32 votingPeriod;
        uint256 proposalThreshold;
        uint256 quorumPercent;
        uint48 lateQuorumExtension;
    }

    constructor(IVotes token, TimelockController timelock, Config memory config)
        Governor("Motif Governor")
        GovernorSettings(config.votingDelay, config.votingPeriod, config.proposalThreshold)
        GovernorVotes(token)
        GovernorVotesQuorumFraction(config.quorumPercent)
        GovernorPreventLateQuorum(config.lateQuorumExtension)
        GovernorTimelockControl(timelock)
    {}

    // 以下都是多重继承要求的显式覆写，行为与父合约一致。

    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function quorum(uint256 timepoint) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(timepoint);
    }

    function proposalDeadline(uint256 proposalId)
        public
        view
        override(Governor, GovernorPreventLateQuorum)
        returns (uint256)
    {
        return super.proposalDeadline(proposalId);
    }

    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function _tallyUpdated(uint256 proposalId) internal override(Governor, GovernorPreventLateQuorum) {
        super._tallyUpdated(proposalId);
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }
}
