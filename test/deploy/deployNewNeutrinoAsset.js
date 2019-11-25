const deployHelper = require('../../api/ContractHelper.js').ContractHelper;

const wvs = 10 ** 8;

const symbolNeutrino = "ABC-N"
const symbolBond = "ABC-NB"
const descriptionNeutrino = "ABC neutrino asset" 
const descriptionBond = "ABC neutrino bond asset" 
const nodeAddress = ""

describe('Deploy', async function () {
    it('Deploy', async function () {
        const result = await deployHelper.deploy(env.SEED, env.API_BASE, env.CHAIN_ID, "./script/", "TST-N", "TST-NB", "test asset", "test bond asset", "") 
        console.log(JSON.stringify(result))
    });
})
