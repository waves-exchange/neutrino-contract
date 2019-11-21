const deployHelper = require('../api/ContractHelper.js').ContractHelper;
const NeutrinoApi = require('../api/NeutrinoApi.js').NeutrinoApi;
const oracleHelper = require('../api/OracleApi.js');
const testHelper = require('../helpers/testHelper.js');

let deployResult = {}
let neutrinoApi = null;
let oracleApi = null;

describe('Swap test', async function () {
    before(async function () {
        deployResult = await deployHelper.deploy(env.SEED, env.API_BASE, env.CHAIN_ID, "./script/", "TST-N", "TST-NB", "test asset", "test bond asset", "") 
  
        neutrinoApi = await NeutrinoApi.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);
        oracleApi = await oracleHelper.OracleApi.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);

        setupAccounts({
            testAccount: 100000 * NeutrinoApi.WAVELET
        })
        var massTx = massTransfer({
            transfers: [
                {
                    amount: 1000000,
                    recipient: deployResult.accounts.controlContract.address
                }
            ],
            fee: 800000
        }, env.SEED)
        await broadcast(massTx);
        await waitForTx(massTx.id);

        price = testHelper.getRandomArbitary(1, 9999)
       
        await oracleApi.forceSetCurrentPrice(100, deployResult.accounts.controlContract.phrase)
    });
    
    it('Swap Waves to Neutrino', async function () {
        let amount = testHelper.getRandomArbitary(1, 9999) * NeutrinoApi.WAVELET
        let id = await neutrinoApi.issueNeutrino(amount, accounts.testAccount);
        const state = await stateChanges(id);
        console.log(state)
        const dataState = testHelper.convertDataStateToObject(state.data)
        console.log(dataState["balance_lock_waves_" + address(accounts.testAccount)])
        console.log(amount)
        if(dataState["balance_lock_waves_" + address(accounts.testAccount)] != amount)
            throw "invalid user balance"
        if(dataState["balance_lock_waves"] != amount)
            throw "invalid total locked balance"
    })    

    it('Withdraw neutrino', async function () {
        await oracleApi.forceSetCurrentPrice(100, deployResult.accounts.controlContract.phrase)
        const priceDataTx = data({
            data: [
                { key: "balance_block_" + address(accounts.testAccount), value: (await currentHeight()) }
            ],
            fee: 500000
        }, deployResult.accounts.neutrinoContract.phrase);
        
        await broadcast(priceDataTx);
        await waitForTx(priceDataTx.id);

        let id = await neutrinoApi.withdraw(accounts.testAccount)
        const dataState = testHelper.convertDataStateToObject((await stateChanges(id)).data)
        if(dataState["balance_lock_waves_" + address(accounts.testAccount)] != 0)
            throw "invalid user balance"
        if(dataState["balance_lock_waves"] != 0)
            throw "invalid total locked balance"
    })    
    
    it('Swap Neutrino to Waves', async function () {
        let amount = testHelper.getRandomArbitary(1, 9999) * NeutrinoApi.PAULI
        let id = await neutrinoApi.redeemWaves(amount, accounts.testAccount);
        const state = await stateChanges(id);
        const dataState = testHelper.convertDataStateToObject(state.data)
        if(dataState["balance_lock_neutrino_" + deployResult.assets.neutrinoAssetId + "_" + address(accounts.testAccount)] != amount)
            throw "invalid user balance"
        if(dataState["balance_lock_neutrino" + deployResult.assets.neutrinoAssetId] != amount)
            throw "invalid total locked balance"
    })
})