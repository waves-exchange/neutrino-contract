const deployHelper = require('../../neutrino-api/ContractHelper.js').ContractHelper;

const wvs = 10 ** 8;

const symbolNeutrino = "USD-TN"
const symbolBond = "USD-TNB"
const descriptionNeutrino = "USD test neutrino asset" 
const descriptionBond = "USD test neutrino bond asset" 
const nodeAddress = ""

describe('Deploy', async function () {
    it('Deploy', async function () {
        const result = await deployHelper.deploy(env.SEED, env.API_BASE, env.CHAIN_ID, "./script/", symbolNeutrino, symbolBond, descriptionNeutrino,descriptionBond, nodeAddress) 
        console.log(JSON.stringify(result))
    });
})
