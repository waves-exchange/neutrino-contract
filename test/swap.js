const deployHelper = require('../helpers/deployHelper.js');
const neutrinoHelper = require('../api/NeutrinoApi.js');

let price = 0;
let deployResult = {}
let neutrinoApi = null;
describe('Swap test', async function () {
    before(async function () {
        deployResult = await deployHelper.deploy("TST-N", "TST-NB", "test asset", "test bond asset", "")
        setupAccounts({
            testAccount: 100000 * deployHelper.WAVELET
        })
        var massTx = massTransfer({
            transfers: [
                {
                    amount: 500000,
                    recipient: address(deployResult.accounts.controlContract)
                }
            ],
            fee: 800000
        }, env.SEED)
        await broadcast(massTx);
        await waitForTx(massTx.id);

        price = deployHelper.getRandomArbitrary(1, 9999)
        
        const priceDataTx = data({
            data: [
                { key: "price", value: price },
                { key: "price_index_0", value: 1 },
                { key: "price_1", value: price }
            ],
            fee: 500000
        }, deployResult.accounts.controlContract);

        await broadcast(priceDataTx);

        await waitForTx(priceDataTx.id);
        neutrinoApi = await neutrinoHelper.NeutrinoApi.create(env.API_BASE, env.CHAIN_ID, address(deployResult.accounts.neutrinoContract));
    });
    
    it('Swap Waves to Neutrino', async function () {
        let amount = deployHelper.getRandomArbitrary(1, 9999) * deployHelper.WAVELET
        let id = await neutrinoApi.issueNeutrino(amount, accounts.testAccount);
        const state = await stateChanges(id);
        const dataState = deployHelper.convertDataStateToObject(state.data)
        if(dataState["balance_waves_" + address(accounts.testAccount)] != amount)
            throw "invalid user balance"
        if(dataState["balance_waves"] != amount)
            throw "invalid total locked balance"
    })    

    it('Withdraw neutrino', async function () {
        const priceDataTx = data({
            data: [
                { key: "balance_block_" + address(accounts.testAccount), value: (await currentHeight()) - 1 }
            ],
            fee: 500000
        }, deployResult.accounts.neutrinoContract);
        
        await broadcast(priceDataTx);
        await waitForTx(priceDataTx.id);

        let id = await neutrinoApi.withdraw(accounts.testAccount)
        const dataState = deployHelper.convertDataStateToObject((await stateChanges(id)).data)
        if(dataState["balance_waves_" + address(accounts.testAccount)] != 0)
            throw "invalid user balance"
        if(dataState["balance_waves"] != 0)
            throw "invalid total locked balance"
    })    
    
    it('Swap Neutrino to Waves', async function () {
        let amount = deployHelper.getRandomArbitrary(1, 9999) * deployHelper.PAULI
        let id = await neutrinoApi.redeemWaves(amount, accounts.testAccount);
        const state = await stateChanges(id);
        const dataState = deployHelper.convertDataStateToObject(state.data)
        if(dataState["balance_" + deployResult.assets.neutrinoAssetId + "_" + address(accounts.testAccount)] != amount)
            throw "invalid user balance"
        if(dataState["balance_" + deployResult.assets.neutrinoAssetId] != amount)
            throw "invalid total locked balance"
    })
})