// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title MotifToken
/// @notice 社区代币 MOTIF：治理投票（委托后生效）、投稿押金、发布与 Remix 奖励都用它。
/// @dev 所有者是 DAO 的时间锁：只有治理提案能增发，且总量永远不超过 MAX_SUPPLY。
contract MotifToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;

    error AllocationLengthMismatch();
    error MaxSupplyExceeded(uint256 requested, uint256 available);

    /// @param owner_ 增发权限的持有者，部署时传 DAO 时间锁。
    /// @param recipients 创世分配的接收地址。
    /// @param amounts 与 recipients 一一对应的数量，总和不超过 MAX_SUPPLY。
    constructor(address owner_, address[] memory recipients, uint256[] memory amounts)
        ERC20("Motif", "MOTIF")
        ERC20Permit("Motif")
        Ownable(owner_)
    {
        if (recipients.length != amounts.length) revert AllocationLengthMismatch();
        for (uint256 i; i < recipients.length; ++i) {
            _mintCapped(recipients[i], amounts[i]);
        }
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mintCapped(to, amount);
    }

    /// @dev 用时间戳而不是区块号计票：L2 的出块间隔不固定，投票期按秒设置才可预期。
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function _mintCapped(address to, uint256 amount) private {
        uint256 available = MAX_SUPPLY - totalSupply();
        if (amount > available) revert MaxSupplyExceeded(amount, available);
        _mint(to, amount);
    }
}
