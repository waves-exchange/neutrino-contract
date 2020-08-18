const truffleAssert = require('truffle-assertions');

const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN withdrawal", async accounts => {
  it(`should fail if caller is not the owner`, async function () {
    const contract = await USDN.deployed();
    await truffleAssert.reverts(
      contract.withdraw(accounts[1], {from: accounts[1]}),
      "VM Exception while processing transaction: revert Ownable: caller is not the owner or admin -- Reason given: Ownable: caller is not the owner or admin."
    )
  });

  it(`should fail if amount is 0`, async function () {
    const contract = await USDN.deployed();
    await truffleAssert.reverts(
      contract.withdraw(accounts[1]),
      "VM Exception while processing transaction: revert balance should be > 0 -- Reason given: balance should be > 0."
    )
  });

  it(`withdrawal should success burn`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 1,)
    await contract.withdraw(accounts[0])
    // assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 0)
  });

  it(`withdrawal should success after re-deposit`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 2);
    const tx1 = await contract.withdraw(accounts[0])
    // assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 0)
  });

  it(`withdrawal should success after stakingReward`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 1);
    await contract.stake(1);
    const tx1 = await contract.withdraw(accounts[0])
    // assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 0)
  });

  it(`withdrawal should success for complex test`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 2);
    // assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 2)
    await contract.stake(2);
    // assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 2)
    const tx1 = await contract.withdraw(accounts[0])
    assert.equal((await contract.totalSupply()).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
  });
});