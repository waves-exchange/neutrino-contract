const USDN = artifacts.require("USDN");

module.exports = function (deployer) {
  deployer.deploy(USDN);
};