const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN ruslan v6", async accounts => {
  it(`ruslan v6 should be happy`, async function () {
    const contract = await USDN.deployed();
    // 1
    await contract.deposit(accounts[0], 1000100);
    await contract.deposit(accounts[1], 1);
    await contract.stake(100);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1000100)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 1000101)

    await contract.transfer(accounts[2], 500050, {from: accounts[0]});
    await contract.stake(100);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 500099)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 500099)
    assert.equal((await contract.totalSupply()).toNumber(), 1000201)

    await contract.deposit(accounts[0], 1000000000000);
    await contract.withdraw(accounts[2]);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1000000500099)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 1000000500102)

    await contract.stake(500000000000);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1499997500710)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 999797)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 1500000500102)

    await contract.withdraw(accounts[1]);
    await contract.transfer(accounts[1], 1124998125532, {from: accounts[0]});
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 374999375178)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1124998125532)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 1499999500305)

    await contract.stake(500000000000);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 499999208545)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1499997625632)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 1999999500305)
  });
});