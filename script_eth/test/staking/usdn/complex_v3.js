const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN complex v6", async accounts => {
  it(`complex should be success`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 100);
    await contract.deposit(accounts[1], 1);
    await contract.deposit(accounts[2], 1);
    assert.equal((await contract.totalSupply()).toNumber(), 102)
    await contract.stake(102);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 100)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 1)
    assert.equal((await contract.totalSupply()).toNumber(), 102)
    await contract.stake(102);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 200)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 2)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 2)
    await contract.withdraw(accounts[0]);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 2)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 2)
    assert.equal((await contract.totalSupply()).toNumber(), 4)
    await contract.stake(4);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 4)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 4)
    assert.equal((await contract.totalSupply()).toNumber(), 8)
  });
});