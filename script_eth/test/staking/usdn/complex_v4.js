const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN ruslan v2", async accounts => {
  it(`ruslan v2 should be happy`, async function () {
    const contract = await USDN.deployed();
    // 1
    await contract.deposit(accounts[0], 1000100);
    await contract.deposit(accounts[1], 1);
    await contract.stake(100);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1000100)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 1000101)

    // 2
    await contract.deposit(accounts[1], 99);
    await contract.deposit(accounts[2], 25);
    await contract.deposit(accounts[3], 4000000);
    await contract.withdraw(accounts[0]);
    await contract.deposit(accounts[1], 4900);
    await contract.deposit(accounts[2], 9975);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 5000)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 10000)
    assert.equal((await contract.balanceOf(accounts[3])).toNumber(), 4000000)
    assert.equal((await contract.totalSupply()).toNumber(), 4015000)
    await contract.stake(100000);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 105000)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 10000)
    assert.equal((await contract.balanceOf(accounts[3])).toNumber(), 4000000)
    assert.equal((await contract.totalSupply()).toNumber(), 4115000)
  });
});