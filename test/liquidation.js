const deployHelper = require('../neutrino-api/ContractHelper.js').ContractHelper;
const neutrinoHelper = require('../neutrino-api/NeutrinoApi.js').NeutrinoApi;
const oracleHelper = require('../neutrino-api/OracleApi.js').OracleApi;
const testHelper = require('../helpers/TestHelper.js');

let deployResult = {}
let orderCount = 4;
let neutrinoApi = null;
let oracleApi = null;
describe('Liqidate test', async function () {
    before(async function () {
        deployResult =  await deployHelper.deploy(env.SEED, env.API_BASE, env.CHAIN_ID, "./script/", "TST-N", "TST-B", "","", "", true) 

        setupAccounts({
            testAccount: 100000 * neutrinoHelper.WAVELET
        })

        var massTx = massTransfer({
            transfers: [
                {
                    amount: 600000,
                    recipient: deployResult.accounts.neutrinoContract.address
                }
            ],
            fee: 500000
        }, env.SEED)
        await broadcast(massTx);
        await waitForTx(massTx.id);

        var massNeutrinoTx = massTransfer({
            transfers: [
                {
                    amount: 10000,
                    recipient: address(accounts.testAccount)
                }
            ],
            fee: 600000,
            assetId: deployResult.assets.bondAssetId
        }, deployResult.accounts.neutrinoContract.phrase)
        await broadcast(massNeutrinoTx);

        await waitForTx(massNeutrinoTx.id);
        neutrinoApi = await neutrinoHelper.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);
        oracleApi = await oracleHelper.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);
    });
    it('Add first orders', async function () {
            const amount = Math.floor(testHelper.getRandomNumber(11, 1000))

            const id = await neutrinoApi.addLiquidationOrder(amount, accounts.testAccount)
        
            const state = await stateChanges(id);
            const stateObject = testHelper.convertDataStateToObject(state.data)

            console.log(stateObject)

            if (stateObject["order_total_" + orderHash] != amount)
                throw "invalid order total"
            else if (stateObject["order_owner_" + orderHash] != address(accounts.testAccount))
                throw "invalid order owner"
            else if (stateObject["order_status_" + orderHash] != "new")
                throw "invalid order status"
    })
})