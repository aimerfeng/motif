// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Slug} from "../../contracts/libraries/Slug.sol";

contract SlugTest is Test {
    bytes internal constant ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

    function isValid(string memory value) internal pure returns (bool) {
        return Slug.isValid(value, 1, 64);
    }

    function test_AcceptsSchemaSlugs() public pure {
        assertTrue(isValid("a"));
        assertTrue(isValid("mesh-gradient"));
        assertTrue(isValid("3d-globe"));
        assertTrue(isValid("text-effect-2"));
    }

    function test_RejectsMalformedSlugs() public pure {
        assertFalse(isValid(""));
        assertFalse(isValid("-"));
        assertFalse(isValid("Mesh"));
        assertFalse(isValid("mesh-"));
        assertFalse(isValid("-mesh"));
        assertFalse(isValid("mesh--gradient"));
        assertFalse(isValid("mesh gradient"));
        assertFalse(isValid("mesh_gradient"));
        assertFalse(isValid(unicode"网格"));
    }

    function test_LengthBounds() public pure {
        assertFalse(Slug.isValid("ab", 3, 32));
        assertTrue(Slug.isValid("abc", 3, 32));
        assertTrue(Slug.isValid("a2345678901234567890123456789012", 3, 32));
        assertFalse(Slug.isValid("a23456789012345678901234567890123", 3, 32));
    }

    /// @dev 用随机字节拼出合法 slug：每段 1 个以上字母数字，段之间单个连字符。
    function testFuzz_GeneratedSlugsAreValid(bytes memory seed) public pure {
        vm.assume(seed.length > 0 && seed.length <= 40);
        bytes memory out = new bytes(seed.length);
        uint256 length;
        for (uint256 i; i < seed.length; ++i) {
            uint8 b = uint8(seed[i]);
            // 约 1/8 的概率放一个连字符，但不放在开头、不连着放。
            bool hyphen = b % 8 == 0 && length != 0 && out[length - 1] != "-" && i != seed.length - 1;
            out[length++] = hyphen ? bytes1("-") : ALPHABET[b % ALPHABET.length];
        }
        assertTrue(isValid(string(out)));
    }

    /// @dev 合法 slug 里任意位置换成一个不允许的字符，都必须被拒绝。
    function testFuzz_AnyForeignCharacterIsRejected(uint8 position, bytes1 foreign) public pure {
        bool allowed = (foreign >= "a" && foreign <= "z") || (foreign >= "0" && foreign <= "9") || foreign == "-";
        vm.assume(!allowed);
        bytes memory slug = bytes("mesh-gradient-aurora");
        slug[position % slug.length] = foreign;
        assertFalse(isValid(string(slug)));
    }
}
