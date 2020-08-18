const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN complex v6", async accounts => {
  it(`complex should be success`, async function () {
    const contract = await USDN.deployed();
    // 1
    await contract.deposit(accounts[0], 100);
    await contract.deposit(accounts[1], 100);
    await contract.stake(2);
    await contract.transfer(accounts[2], 100);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 100)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 100)
    assert.equal((await contract.totalSupply()).toNumber(), 200)
    await contract.stake(2);

    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 101)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 101)
    assert.equal((await contract.totalSupply()).toNumber(), 202)

    await contract.transfer(accounts[1], 101, {from: accounts[2]});
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 202)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 202)
    await contract.stake(2);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 204)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 204)

    await contract.transfer(accounts[0], 102, {from: accounts[1]});
    await contract.transfer(accounts[2], 102, {from: accounts[1]});
    await contract.deposit(accounts[1], 102);
    await contract.stake(3);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 103)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 102)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 103)
    assert.equal((await contract.totalSupply()).toNumber(), 309)

    await contract.transfer(accounts[0], 102, {from: accounts[1]});
    await contract.withdraw(accounts[0]);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 103)
    assert.equal((await contract.totalSupply()).toNumber(), 104)
    await contract.deposit(accounts[1], 206);
    await contract.stake(3);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 206)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 105)
    assert.equal((await contract.totalSupply()).toNumber(), 313)

    await contract.transfer(accounts[0], 105, {from: accounts[2]});
    await contract.deposit(accounts[1], 206);
    await contract.deposit(accounts[2], 206);
    await contract.stake(1);
  });
});