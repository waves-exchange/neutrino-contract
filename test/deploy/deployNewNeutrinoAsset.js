var deployHelper = require('../helpers/deployHelper.js');

const wvs = 10 ** 8;

const symbolNeutrino = "BTC-N"
const symbolBond = "BTC-NB"
const descriptionNeutrino = "Bitcoin neutrino asset" 
const descriptionBond = "Bitcoin neutrino bond asset" 
const nodeAddress = ""

const accounts = 
    {
        oracles: [ wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed()] ,
        admins: [wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed()],
        auctionContract: wavesCrypto.randomSeed(),
        neutrinoContract: wavesCrypto.randomSeed(),
        rpdContract: wavesCrypto.randomSeed(),
        controlContract: wavesCrypto.randomSeed()
    }
describe('Deploy', async function () {
    before(async function () {
        deployHelper.depploy(symbolNeutrino, symbolBond, descriptionNeutrino, descriptionBond, nodeAddress)
    });
})
