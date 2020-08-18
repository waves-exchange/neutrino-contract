const truffleAssert = require('truffle-assertions');

const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN complex v7", async accounts => {
  it(`complex should be success`, async function () {
    const contract = await USDN.deployed();
    await contract.deprecate();

    await truffleAssert.reverts(
      contract.deposit(accounts[0], 1),
      "VM Exception while processing transaction: revert Deprecateble: contract is deprecated -- Reason given: Deprecateble: contract is deprecated."
    )
    await truffleAssert.reverts(
      contract.stake(1),
      "VM Exception while processing transaction: revert Deprecateble: contract is deprecated -- Reason given: Deprecateble: contract is deprecated."
    )
    await truffleAssert.reverts(
      contract.withdraw(accounts[0]),
      "VM Exception while processing transaction: revert Deprecateble: contract is deprecated -- Reason given: Deprecateble: contract is deprecated."
    )
    await truffleAssert.reverts(
      contract.transfer(accounts[1], 2),
      "VM Exception while processing transaction: revert Deprecateble: contract is deprecated -- Reason given: Deprecateble: contract is deprecated."
    )
    await truffleAssert.reverts(
      contract.transferFrom(accounts[1], accounts[1], 2),
      "VM Exception while processing transaction: revert Deprecateble: contract is deprecated -- Reason given: Deprecateble: contract is deprecated."
    )

    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0);
    assert.equal((await contract.totalSupply()).toNumber(), 0);
  });
});