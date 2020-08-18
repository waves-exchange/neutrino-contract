const truffleAssert = require('truffle-assertions');

const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN stakingReward", async accounts => {
  it(`should fail if caller is not the owner`, async function () {
    const contract = await USDN.deployed();
    await truffleAssert.reverts(
      contract.stake(1, {from: accounts[1]}),
      "VM Exception while processing transaction: revert Ownable: caller is not the owner or admin -- Reason given: Ownable: caller is not the owner or admin."
    )
  });

  it(`should fail if reward is 0`, async function () {
    const contract = await USDN.deployed();
    await truffleAssert.reverts(
      contract.stake(0),
      "VM Exception while processing transaction: revert reward should be > 0 -- Reason given: reward should be > 0."
    )
  });

  it(`should stakingReward successefull for equal balances`, async function () {
    const contract = await USDN.deployed();
    assert.equal((await contract.totalSupply()).toNumber(), 0);
    await contract.deposit(accounts[0], 1);
    await contract.deposit(accounts[1], 1);
    await contract.deposit(accounts[2], 1);
    await contract.stake(3);
    assert.equal((await contract.totalSupply()).toNumber(), 3);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1);
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1);
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 1);
  });

  it(`should stakingReward successefull for many calls`, async function () {
    const contract = await USDN.deployed();
    await contract.stake(3);
    await contract.stake(3);
    await contract.stake(3);
    await contract.stake(3);
    await contract.stake(3);
    await contract.stake(3);
    await contract.stake(3);
    await contract.stake(3);
    await contract.stake(3);
    await contract.stake(3);
    assert.equal((await contract.totalSupply()).toNumber(), 33);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 11);
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 11);
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 11);
  });

  it(`should stakingReward successefull`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[3], 26);
    await contract.stake(6);
    assert.equal((await contract.totalSupply()).toNumber(), 65);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 13);
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 13);
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 13);
    assert.equal((await contract.balanceOf(accounts[3])).toNumber(), 26);
  });

  it(`should stakingReward successefull if reward > totalSupply`, async function () {
    const contract = await USDN.deployed();
    await contract.stake(6000);
    assert.equal((await contract.totalSupply()).toNumber(), 6065);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1213);
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1213);
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 1213);
    assert.equal((await contract.balanceOf(accounts[3])).toNumber(), 2426);
  });
});