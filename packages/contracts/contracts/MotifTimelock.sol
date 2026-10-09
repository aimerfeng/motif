// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

/// @title MotifTimelock
/// @notice DAO 的金库和执行者：通过的提案在这里排队，等最短延迟过去才执行，给社区留出退出和反应的时间。
///         其余合约的管理员角色、代币的增发权、被罚没的押金都归它。
/// @dev 只是给 OpenZeppelin 的 TimelockController 起个名字，好让部署和 ABI 导出有一份自己的构建产物。
contract MotifTimelock is TimelockController {
    constructor(uint256 minDelay, address[] memory proposers, address[] memory executors, address admin)
        TimelockController(minDelay, proposers, executors, admin)
    {}
}
