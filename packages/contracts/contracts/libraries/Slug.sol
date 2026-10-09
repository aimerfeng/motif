// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Slug
/// @notice 条目 slug 和创作者 handle 的格式校验，规则与 schema 包的 SLUG 正则一致：
///         `^[a-z0-9]+(?:-[a-z0-9]+)*$`。链上也校验，是因为 slug 会出现在站点 URL、registry 路径和
///         Skill 名字里，不能只信任前端。
library Slug {
    /// @dev 只允许小写字母、数字和单个连字符；不能以连字符开头或结尾。
    function isValid(string memory value, uint256 minLength, uint256 maxLength) internal pure returns (bool) {
        bytes memory b = bytes(value);
        if (b.length < minLength || b.length > maxLength) return false;
        // 视作“前一个字符是连字符”开始，这样开头的连字符会被拒绝。
        bool afterHyphen = true;
        for (uint256 i; i < b.length; ++i) {
            bytes1 c = b[i];
            if (c == "-") {
                if (afterHyphen) return false;
                afterHyphen = true;
            } else if ((c >= "a" && c <= "z") || (c >= "0" && c <= "9")) {
                afterHyphen = false;
            } else {
                return false;
            }
        }
        return !afterHyphen;
    }

    /// @dev 映射的键用哈希，避免把变长字符串当 mapping 键时每次都要拷贝。
    function key(string memory value) internal pure returns (bytes32) {
        return keccak256(bytes(value));
    }
}
