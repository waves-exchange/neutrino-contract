var deployHelper = require('../../helpers/deployHelper.js');

const wvs = 10 ** 8;

const symbolNeutrino = "ABC-N"
const symbolBond = "ABC-NB"
const descriptionNeutrino = "ABC neutrino asset" 
const descriptionBond = "ABC neutrino bond asset" 
const nodeAddress = ""

describe('Deploy', async function () {
    it('Deploy', async function () {
        await deployHelper.deploy(symbolNeutrino, symbolBond, descriptionNeutrino, descriptionBond, nodeAddress)
    });
})
