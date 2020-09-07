const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN complex v1", async accounts => {
  it(`complex should be success`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 100);
    await contract.deposit(accounts[1], 100);
    await contract.stake(20);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 100)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 100)
    assert.equal((await contract.totalSupply()).toNumber(), 200)
    await contract.transfer(accounts[1], 100);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 200)
    assert.equal((await contract.totalSupply()).toNumber(), 200)
    await contract.stake(80);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 280)
    assert.equal((await contract.totalSupply()).toNumber(), 280)
    await contract.transfer(accounts[0], 140, {from: accounts[1]});
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 140)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 140)
    assert.equal((await contract.totalSupply()).toNumber(), 280)
    await contract.deposit(accounts[2], 140);
    await contract.transfer(accounts[1], 140);
    await contract.stake(140);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 420)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 140)
    assert.equal((await contract.totalSupply()).toNumber(), 560)
  });
});
