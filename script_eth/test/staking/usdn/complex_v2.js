const truffleAssert = require('truffle-assertions');

const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN complex v2", async accounts => {
  it(`complex should be success`, async function () {
    const contract = await USDN.deployed();
    await contract.deposit(accounts[0], 100);
    await contract.stake(20);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 100)
    await contract.transfer(accounts[1], 10);
    await contract.stake(10);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 99)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 11)
    assert.equal((await contract.totalSupply()).toNumber(), 110)
    await contract.transfer(accounts[1], 10);
    await contract.stake(10);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 97)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 22)
    assert.equal((await contract.totalSupply()).toNumber(), 120)
    await contract.transfer(accounts[1], 10);
    await contract.stake(10);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 94)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 34)
    assert.equal((await contract.totalSupply()).toNumber(), 130)
    await contract.transfer(accounts[1], 10);
    await contract.stake(10);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 90)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 47)
    assert.equal((await contract.totalSupply()).toNumber(), 140)
    await contract.transfer(accounts[1], 10);
    await contract.stake(10);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 85)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 61)
    assert.equal((await contract.totalSupply()).toNumber(), 150)
    await contract.transfer(accounts[1], 10);
    await contract.stake(10);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 80)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 75)
    assert.equal((await contract.totalSupply()).toNumber(), 160)
    await contract.transfer(accounts[1], 10);
    await contract.stake(10);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 74)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 90)
    assert.equal((await contract.totalSupply()).toNumber(), 170)
  });
});