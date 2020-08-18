// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

abstract contract Detailable {
  function name() public pure returns (string memory) {
    return "Neutrino";
  }

  function symbol() public pure returns (string memory) {
    return "USDN";
  }

  function decimals() public pure returns (uint8) {
    return 18;
  }
}
