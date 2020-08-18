// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

interface Staking {
  function deposit(address account, uint256 amount) external returns (bool);

  function stake(uint256 reward) external returns (bool);

  function withdraw(address account) external returns (bool);

  event Reward(uint256 id, uint amount);
}