const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN ruslan v3", async accounts => {
  it(`ruslan v3 should be happy`, async function () {
    const contract = await USDN.deployed();
    // 1
    await contract.deposit(accounts[0], 100);
    await contract.withdraw(accounts[0]);
    await contract.deposit(accounts[0], 1000);
    await contract.deposit(accounts[1], 1000);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1000)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1000)
    assert.equal((await contract.totalSupply()).toNumber(), 2000)

    // 2
    await contract.stake(100);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1000)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1000)
    assert.equal((await contract.totalSupply()).toNumber(), 2000)

    // 3
    await contract.deposit(accounts[2], 1000);
    await contract.stake(100);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1050)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1050)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 1000)
    assert.equal((await contract.totalSupply()).toNumber(), 3100)

    // 4
    await contract.withdraw(accounts[2]);
    await contract.stake(100);
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 1100)
    assert.equal((await contract.balanceOf(accounts[1])).toNumber(), 1100)
    assert.equal((await contract.balanceOf(accounts[2])).toNumber(), 0)
    assert.equal((await contract.totalSupply()).toNumber(), 2200)
  });
});