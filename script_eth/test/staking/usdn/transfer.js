const truffleAssert = require('truffle-assertions');

const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN transfer", async accounts => {
  it(`should fail if amount is 0`, async function () {
    const contract = await USDN.deployed();
    await truffleAssert.reverts(
      contract.transfer(accounts[1], 0),
      "VM Exception while processing transaction: revert amount should be > 0 -- Reason given: amount should be > 0."
    )
  });

  it(`should fail if amount > balance`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 1);
    await truffleAssert.reverts(
      contract.transfer(accounts[1], 2),
      "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance -- Reason given: ERC20: transfer amount exceeds balance."
    )
  });

  it(`transfer should success`, async function () {
    const contract = await USDN.deployed();
    await contract.transfer(accounts[1], 1)
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1)
    assert.equal((await contract.totalSupply()).toNumber(), 1)
  });

  it(`withdrawal should success after re-deposit`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 2);
    await contract.transfer(accounts[1], 2)
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 3)
    assert.equal((await contract.totalSupply()).toNumber(), 3)
  });

  it(`withdrawal should success after stakingReward`, async function () {
    const contract = await USDN.deployed();
    await contract.stake(1);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 3)
    assert.equal((await contract.totalSupply()).toNumber(), 3)
    await contract.transfer(accounts[0], 3, {from: accounts[1]})
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 3)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 3)
  });

  it(`stakingReward should success after transfer`, async function () {
    const contract = await USDN.deployed();
    await contract.transfer(accounts[1], 2);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 2)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 3)
    await contract.stake(3);
    assert.equal((await contract.totalSupply()).toNumber(), 6)
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 2)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 4)
  });
});
