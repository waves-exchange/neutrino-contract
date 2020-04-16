const deployHelper = require('../neutrino-api/ContractHelper.js').ContractHelper;
const neutrinoHelper = require('../neutrino-api/NeutrinoApi.js').NeutrinoApi;
const oracleHelper = require('../neutrino-api/OracleApi.js').OracleApi;
const testHelper = require('../helpers/TestHelper.js');
var assert = require('assert')

let deployResult = {}
let orderCount = 4;
let neutrinoApi = null;
let oracleApi = null;
describe('Auction test', async function () {
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

        var transferTx = transfer({
            amount: 10000 *neutrinoHelper.PAULI,
            recipient: address(accounts.testAccount),
            assetId: deployResult.assets.neutrinoAssetId,
            fee: 500000
        }, deployResult.accounts.neutrinoContract.phrase)

        await broadcast(transferTx);
        await waitForTx(transferTx.id);

        neutrinoApi = await neutrinoHelper.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);
        oracleApi = await oracleHelper.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);

        console.log("here: ", oracleApi)


        await oracleApi.transferToAuction(accounts.testAccount);
    });

    it('Add first order', async function () {
            const amount = Math.floor(testHelper.getRandomNumber(10, 100)) * neutrinoHelper.WAVELET
            const price = Math.floor(testHelper.getRandomNumber(10, 15))

            const id = await neutrinoApi.addBuyBondOrder(amount, price, accounts.testAccount)
        
            const state = await stateChanges(id);
            const stateObject = testHelper.convertDataStateToObject(state.data)

            let orderHash = stateObject["last_order_owner_" + address(accounts.testAccount)]
            assert.equal(stateObject["order_first"], orderHash, "invalid first order in list")

            assert.equal(stateObject["order_next_"], "", "invalid next order")
            assert.equal(stateObject["order_prev_" + orderHash], "", "invalid prev order")

            assert.equal(stateObject["order_total_" + orderHash], amount, "invalid order total")
            assert.equal(stateObject["order_owner_" + orderHash], address(accounts.testAccount), "invalid order owner")
            assert.equal(stateObject["order_status_" + orderHash], "new", "invalid order status")
    })

    it('Add next orders', async function () {
        const count = Math.floor(testHelper.getRandomNumber(2, 4))
        let price = Math.floor(testHelper.getRandomNumber(5, 10))
        
        let contractState = await accountData(deployResult.accounts.auctionContract.address)

        let firstOrder = contractState["order_first"].value;
        let prevOrder = firstOrder;
        for(let i = 0; i < count; i++){
            contractState = await accountData(deployResult.accounts.auctionContract.address)
            const amount = Math.floor(testHelper.getRandomNumber(10, 100)) * neutrinoHelper.WAVELET

            const id = await neutrinoApi.addBuyBondOrder(amount, price, accounts.testAccount)

            const txState = await stateChanges(id);
            const txStateObject = testHelper.convertDataStateToObject(txState.data)

            let orderHash = txStateObject["last_order_owner_" + address(accounts.testAccount)] 
            assert.equal(firstOrder, txStateObject["order_first"], "invalid first order in list")

            assert.equal(txStateObject["order_next_" + prevOrder], orderHash, "invalid next order")
            assert.equal(txStateObject["order_prev_" + orderHash], prevOrder, "invalid prev order")

            assert.equal(txStateObject["order_total_" + orderHash], amount, "invalid order total")
            assert.equal(txStateObject["order_owner_" + orderHash], address(accounts.testAccount), "invalid order owner")
            assert.equal(txStateObject["order_status_" + orderHash], "new", "invalid order status")

            price -= 1;
            prevOrder = orderHash;
        }
    })

    it('Drop first orders', async function () {
        const contractState = await accountData(deployResult.accounts.auctionContract.address)
        const beforeFirstOrder = contractState["order_first"].value
        const beforeNextOrder = contractState["order_next_" + beforeFirstOrder].value
        const id = await neutrinoApi.cancelBuyBondOrder(beforeFirstOrder, accounts.testAccount)

        const txState = await stateChanges(id);
        const txStateObject = testHelper.convertDataStateToObject(txState.data)
        const prevNextOrder = txStateObject["order_prev_" + beforeNextOrder]

        assert.equal(txStateObject["order_first"], beforeNextOrder, "invalid first order in list")
        assert.equal(prevNextOrder, "", "invalid prev order")
        assert.equal(txStateObject["order_status_" + beforeFirstOrder], "canceled", "invalid order status")
    })

    it('Drop middle orders', async function () {
        const contractState = await accountData(deployResult.accounts.auctionContract.address)
        const beforeFirstOrder = contractState["order_first"].value
        const cancelOrder = contractState["order_next_" + beforeFirstOrder].value
        const nextOrder = contractState["order_next_" + cancelOrder].value
        const prevOrder = contractState["order_prev_" + cancelOrder].value
        const id = await neutrinoApi.cancelBuyBondOrder(cancelOrder, accounts.testAccount)

        const txState = await stateChanges(id);
        const txStateObject = testHelper.convertDataStateToObject(txState.data)

        assert.equal(txStateObject["order_first"], contractState["order_first"].value, "invalid first order in list")
        assert.equal(txStateObject["order_next_" + prevOrder], nextOrder, "invalid next order")
        assert.equal(txStateObject["order_prev_" + nextOrder], prevOrder, "invalid prev order")
    })
          
})