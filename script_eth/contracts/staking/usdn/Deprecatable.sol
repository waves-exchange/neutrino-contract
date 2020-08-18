// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "./Ownable.sol";

abstract contract Deprecateble is Ownable {
  bool internal _deprecated;

  modifier onlyNotDeprecated() {
    require(!_deprecated, "Deprecateble: contract is deprecated");
    _;
  }

  function deprecate() public onlyOwner {
    _deprecated = true;
    emit Deprecate(msg.sender);
  }

  event Deprecate(address indexed account);
}
