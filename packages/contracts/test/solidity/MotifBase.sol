// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MotifCuration} from "../../contracts/MotifCuration.sol";
import {MotifGovernor} from "../../contracts/MotifGovernor.sol";
import {MotifIdentity} from "../../contracts/MotifIdentity.sol";
import {MotifRegistry} from "../../contracts/MotifRegistry.sol";
import {MotifTimelock} from "../../contracts/MotifTimelock.sol";
import {MotifToken} from "../../contracts/MotifToken.sol";

/// @dev 按部署脚本（ignition/modules/motif.ts）的顺序装配整套系统，包括最后把管理权交给时间锁。
///      测试跑的就是上线后的权限结构：部署者手里不剩任何角色。
abstract contract MotifBase is Test {
    uint256 internal constant BOND = 100 ether;
    uint8 internal constant QUORUM = 2;
    uint32 internal constant REVIEW_PERIOD = 7 days;
    uint256 internal constant PUBLISH_REWARD = 1_000 ether;
    uint256 internal constant REMIX_REWARD = 200 ether;
    uint256 internal constant PUBLISH_REPUTATION = 10;
    uint256 internal constant REMIX_REPUTATION = 5;
    uint256 internal constant CURATOR_REPUTATION = 1;
    uint256 internal constant VIOLATION_PENALTY = 20;

    uint256 internal constant TIMELOCK_DELAY = 2 days;
    uint48 internal constant VOTING_DELAY = 1 days;
    uint32 internal constant VOTING_PERIOD = 5 days;
    uint256 internal constant PROPOSAL_THRESHOLD = 1_000_000 ether;
    uint256 internal constant QUORUM_PERCENT = 4;
    uint48 internal constant LATE_QUORUM_EXTENSION = 1 days;

    uint256 internal constant TREASURY_ALLOCATION = 600_000_000 ether;
    uint256 internal constant VOTER_ALLOCATION = 100_000_000 ether;
    uint256 internal constant CREATOR_ALLOCATION = 10_000 ether;
    uint256 internal constant REWARD_POOL = 100_000 ether;

    MotifTimelock internal timelock;
    MotifToken internal token;
    MotifGovernor internal governor;
    MotifIdentity internal identity;
    MotifRegistry internal registry;
    MotifCuration internal curation;

    address internal deployer;
    address internal guardian = makeAddr("guardian");
    address internal voter = makeAddr("voter");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal carol = makeAddr("carol");
    address internal dave = makeAddr("dave");
    address internal erin = makeAddr("erin");

    function setUp() public virtual {
        deployer = address(this);

        address[] memory proposers = new address[](0);
        // address(0) 作为执行者表示任何人都可以执行已经排队到期的提案。
        address[] memory executors = new address[](1);
        timelock = new MotifTimelock(TIMELOCK_DELAY, proposers, executors, deployer);

        address[] memory recipients = new address[](4);
        uint256[] memory amounts = new uint256[](4);
        (recipients[0], amounts[0]) = (address(timelock), TREASURY_ALLOCATION);
        (recipients[1], amounts[1]) = (voter, VOTER_ALLOCATION);
        (recipients[2], amounts[2]) = (alice, CREATOR_ALLOCATION);
        (recipients[3], amounts[3]) = (bob, CREATOR_ALLOCATION);
        token = new MotifToken(address(timelock), recipients, amounts);

        governor = new MotifGovernor(
            token,
            timelock,
            MotifGovernor.Config({
                votingDelay: VOTING_DELAY,
                votingPeriod: VOTING_PERIOD,
                proposalThreshold: PROPOSAL_THRESHOLD,
                quorumPercent: QUORUM_PERCENT,
                lateQuorumExtension: LATE_QUORUM_EXTENSION
            })
        );
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));

        identity = new MotifIdentity(deployer, guardian);
        registry = new MotifRegistry(deployer, guardian, licenses());
        address[] memory curators = new address[](3);
        (curators[0], curators[1], curators[2]) = (carol, dave, erin);
        curation = new MotifCuration(
            address(timelock), token, registry, identity, address(timelock), guardian, curators, defaultParams()
        );

        registry.grantRole(registry.CURATION_ROLE(), address(curation));
        identity.grantRole(identity.ISSUER_ROLE(), address(curation));

        bytes32 admin = registry.DEFAULT_ADMIN_ROLE();
        registry.grantRole(admin, address(timelock));
        registry.renounceRole(admin, deployer);
        identity.grantRole(admin, address(timelock));
        identity.renounceRole(admin, deployer);
        timelock.renounceRole(admin, deployer);

        // 上线后由治理提案从金库拨款到奖励池；这里直接以时间锁身份转账。
        vm.prank(address(timelock));
        token.transfer(address(curation), REWARD_POOL);

        vm.prank(alice);
        token.approve(address(curation), type(uint256).max);
        vm.prank(bob);
        token.approve(address(curation), type(uint256).max);
    }

    // ---------------------------------------------------------------- 参数

    function licenses() internal pure returns (bytes32[] memory list) {
        list = new bytes32[](8);
        list[0] = "MIT";
        list[1] = "Apache-2.0";
        list[2] = "ISC";
        list[3] = "BSD-2-Clause";
        list[4] = "BSD-3-Clause";
        list[5] = "Zlib";
        list[6] = "Unlicense";
        list[7] = "CC0-1.0";
    }

    function defaultParams() internal pure returns (MotifCuration.Params memory) {
        return MotifCuration.Params({
            bond: BOND,
            quorum: QUORUM,
            reviewPeriod: REVIEW_PERIOD,
            publishReward: PUBLISH_REWARD,
            remixReward: REMIX_REWARD,
            publishReputation: PUBLISH_REPUTATION,
            remixReputation: REMIX_REPUTATION,
            curatorReputation: CURATOR_REPUTATION,
            violationPenalty: VIOLATION_PENALTY
        });
    }

    // ---------------------------------------------------------------- 投稿与审核

    /// @dev 测试里的内容哈希只需要互不相同。用 keccak256（操作码）而不是 sha256：sha256 是预编译合约调用，
    ///      写在参数里会抢先消耗掉 vm.prank / vm.expectRevert。
    function input(string memory seed) internal pure returns (MotifRegistry.VersionInput memory) {
        return MotifRegistry.VersionInput({
            contentHash: keccak256(bytes(seed)),
            license: "MIT",
            upstreamRepo: "",
            upstreamCommit: bytes20(0)
        });
    }

    function submit(address author, string memory slug) internal returns (uint256 itemId) {
        vm.prank(author);
        itemId = curation.submit(slug, 0, 0, input(slug));
    }

    function submitRemix(address author, string memory slug, uint256 parentId, uint32 parentVersion)
        internal
        returns (uint256 itemId)
    {
        vm.prank(author);
        itemId = curation.submit(slug, parentId, parentVersion, input(slug));
    }

    function castVote(address curator, uint256 itemId, uint32 version, MotifCuration.Verdict verdict) internal {
        vm.prank(curator);
        curation.vote(itemId, version, verdict, bytes32(0));
    }

    function approve(uint256 itemId, uint32 version) internal {
        castVote(carol, itemId, version, MotifCuration.Verdict.Approve);
        castVote(dave, itemId, version, MotifCuration.Verdict.Approve);
    }

    function publish(address author, string memory slug) internal returns (uint256 itemId) {
        itemId = submit(author, slug);
        approve(itemId, 1);
    }
}
