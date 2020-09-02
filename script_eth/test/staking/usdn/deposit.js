const truffleAssert = require('truffle-assertions');

const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN deposit", async accounts => {
  it(`should fail if caller is not the owner`, async function () {
    const contract = await USDN.deployed();
    await truffleAssert.reverts(
      contract.deposit(accounts[0], 1, {from: accounts[1]}),
      "VM Exception while processing transaction: revert Ownable: caller is not the owner or admin -- Reason given: Ownable: caller is not the owner or admin."
    )
  });

  it(`should fail if amount is 0`, async function () {
    const contract = await USDN.deployed();
    await truffleAssert.reverts(
      contract.deposit(accounts[3], 0),
      "VM Exception while processing transaction: revert amount should be > 0 -- Reason given: amount should be > 0."
    )
  });

  it(`should deposit 1 and 2 USDN`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 1);
    await contract.deposit(accounts[1], 2);
    assert.equal((await contract.totalSupply()).toNumber(), 3);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1);
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 2);
  });

  it(`should many deposit for one address`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[2], 1);
    await contract.deposit(accounts[2], 2);
    await contract.deposit(accounts[2], 3);
    assert.equal((await contract.totalSupply()).toNumber(), 9); // 6 + 3 from prev test
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 6);
  });
});
