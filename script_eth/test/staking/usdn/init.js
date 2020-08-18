const USDN = artifacts.require("./staking/usdn/USDN");

contract("USDN init contract", async accounts => {
  it("totalSupply should be equal 0", async () => {
    const contract = await USDN.deployed();
    assert.equal((await contract.totalSupply()).toNumber(), 0)
    assert.equal((await contract.balanceOf(accounts[0])).toNumber(), 0);
  });
});