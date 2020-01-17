const deployHelper = require('../neutrino-api/ContractHelper.js').ContractHelper;
const neutrinoHelper = require('../neutrino-api/NeutrinoApi.js').NeutrinoApi;
const oracleHelper = require('../neutrino-api/OracleApi.js').OracleApi;
const testHelper = require('../helpers/TestHelper.js');
var assert = require('assert')

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

        var massBondTx = massTransfer({
            transfers: [
                {
                    amount: 10000000,
                    recipient: address(accounts.testAccount)
                }
            ],
            fee: 600000,
            assetId: deployResult.assets.bondAssetId
        }, deployResult.accounts.neutrinoContract.phrase)
        await broadcast(massBondTx);

        await waitForTx(massBondTx.id);
        neutrinoApi = await neutrinoHelper.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);
        oracleApi = await oracleHelper.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);
    });
    it('Add first order', async function () {
            const amount = Math.floor(testHelper.getRandomNumber(10, 100))

            const id = await neutrinoApi.addLiquidationOrder(amount, accounts.testAccount)
        
            const state = await stateChanges(id);
            const stateObject = testHelper.convertDataStateToObject(state.data)

            let orderHash = stateObject["last_order_owner_" + address(accounts.testAccount)] 

            assert.equal(stateObject["order_first"], orderHash, "invalid first order in list")
            assert.equal(stateObject["order_first"], orderHash, "invalid first order in list")

            assert.equal(stateObject["order_prev_"], "", "invalid prev order")
            assert.equal(stateObject["order_next_" + orderHash], "", "invalid next order")

            assert.equal(stateObject["order_last"], orderHash, "invalid last order in list")
            assert.equal(stateObject["order_total_" + orderHash], amount, "invalid order total")
            assert.equal(stateObject["order_owner_" + orderHash], address(accounts.testAccount), "invalid order owner")
            assert.equal(stateObject["order_status_" + orderHash], "new", "invalid order status")
    })

    it('Add next orders', async function () {
        const count = Math.floor(testHelper.getRandomNumber(5, 10))
        for(let i = 0; i < count; i++){
            const contractState = await accountData(deployResult.accounts.liquidationContract.address)
            const amount = Math.floor(testHelper.getRandomNumber(10, 100))
            const id = await neutrinoApi.addLiquidationOrder(amount, accounts.testAccount)

            const txState = await stateChanges(id);
            const txStateObject = testHelper.convertDataStateToObject(txState.data)
            const beforeLastOrder = contractState["order_last"].value

            let orderHash = txStateObject["last_order_owner_" + address(accounts.testAccount)] 

            assert.equal(contractState["order_first"].value, txStateObject["order_first"], "invalid first order in list")

            assert.equal(txStateObject["order_prev_" + beforeLastOrder], orderHash, "invalid prev order")
            assert.equal(txStateObject["order_next_" + orderHash], beforeLastOrder, "invalid next order")

            assert.equal(txStateObject["order_last"], orderHash, "invalid last order in list")
            assert.equal(txStateObject["order_total_" + orderHash], amount, "invalid order total")
            assert.equal(txStateObject["order_owner_" + orderHash], address(accounts.testAccount), "invalid order owner")
            assert.equal(txStateObject["order_status_" + orderHash], "new", "invalid order status")
        }
    })

    it('Drop first orders', async function () {
        const contractState = await accountData(deployResult.accounts.liquidationContract.address)
        const beforeFirstOrder = contractState["order_first"].value
        const beforePrevOrder = contractState["order_prev_" + beforeFirstOrder].value
        const id = await neutrinoApi.cancelLiquidationOrder(beforeFirstOrder, accounts.testAccount)

        const txState = await stateChanges(id);
        const txStateObject = testHelper.convertDataStateToObject(txState.data)
        const prevNextOrder = txStateObject["order_next_" + beforePrevOrder]

        assert.equal(txStateObject["order_last"], contractState["order_last"].value, "invalid last order in list")
        assert.equal(txStateObject["order_first"], beforePrevOrder, "invalid first order in list")
        assert.equal(prevNextOrder, "", "invalid prev order")
        assert.equal(txStateObject["order_status_" + beforeFirstOrder], "canceled", "invalid order status")
    })

    it('Drop middle orders', async function () {
        const contractState = await accountData(deployResult.accounts.liquidationContract.address)
        const beforeFirstOrder = contractState["order_first"].value
        const cancelOrder = contractState["order_prev_" + beforeFirstOrder].value
        const nextOrder = contractState["order_next_" + cancelOrder].value
        const prevOrder = contractState["order_prev_" + cancelOrder].value
        const id = await neutrinoApi.cancelLiquidationOrder(cancelOrder, accounts.testAccount)

        const txState = await stateChanges(id);
        const txStateObject = testHelper.convertDataStateToObject(txState.data)

        assert.equal(txStateObject["order_last"], contractState["order_last"].value, "invalid last order in list")
        assert.equal(txStateObject["order_first"], contractState["order_first"].value, "invalid first order in list")
        assert.equal(txStateObject["order_next_" + prevOrder], nextOrder, "invalid next order")
        assert.equal(txStateObject["order_prev_" + nextOrder], prevOrder, "invalid prev order")
    })

    it('Drop last orders', async function () {
        const contractState = await accountData(deployResult.accounts.liquidationContract.address)
        const beforeLastOrder = contractState["order_last"].value
        const beforeNextOrder = contractState["order_next_" + beforeLastOrder].value
        const id = await neutrinoApi.cancelLiquidationOrder(beforeLastOrder, accounts.testAccount)

        const txState = await stateChanges(id);
        const txStateObject = testHelper.convertDataStateToObject(txState.data)
        const prevLastOrder = txStateObject["order_prev_" + beforeNextOrder]

        assert.equal(txStateObject["order_first"], contractState["order_first"].value, "invalid first order in list")
        assert.equal(txStateObject["order_last"], beforeNextOrder, "invalid last order in list")
        assert.equal(prevLastOrder, "", "invalid prev order in last")
        assert.equal(txStateObject["order_status_" + beforeLastOrder], "canceled", "invalid order status")
    })

    it('Partially filled order', async function () {
        const contractState = await accountData(deployResult.accounts.liquidationContract.address)
        const firstOrderHash = contractState["order_first"].value
        const totalOrder = Math.floor(contractState["order_total_" + firstOrderHash].value / 2)
        
        var transferTx = transfer({
                amount: totalOrder * neutrinoHelper.WAVELET,
                recipient: deployResult.accounts.neutrinoContract.address
        }, env.SEED)
                    
        await broadcast(transferTx);
        await waitForTx(transferTx.id);
        
        await oracleApi.transferToAuction(accounts.testAccount);
        let id = await oracleApi.executeLiquidationOrder(accounts.testAccount);
        
        const txState = await stateChanges(id);
        const txStateObject = testHelper.convertDataStateToObject(txState.data)
        const transferToOrderOwner = txState.transfers.find(x => x.address == address(accounts.testAccount))
   
        assert.equal(transferToOrderOwner != null, true, "invalid transfer to user")
        assert.equal(transferToOrderOwner.amount, totalOrder * neutrinoHelper.PAULI, "invalid amount transfer to user")
        assert.equal(transferToOrderOwner.asset, deployResult.assets.neutrinoAssetId, "invalid asset id transfer to user")
        assert.equal(txStateObject["order_first"], firstOrderHash, "invalid first order in list")
        assert.equal(txStateObject["order_status_" + firstOrderHash], "new", "invalid order status")
    })
    it('Fully filled order', async function () {
        const contractState = await accountData(deployResult.accounts.liquidationContract.address)
        const firstOrderHash = contractState["order_first"].value
        const totalOrder = Math.floor(contractState["order_total_" + firstOrderHash].value - contractState["order_filled_total_" + firstOrderHash].value)
        const beforePrevOrder = contractState["order_prev_" + firstOrderHash].value

        var transferTx = transfer({
                amount: totalOrder * neutrinoHelper.WAVELET,
                recipient: deployResult.accounts.neutrinoContract.address
        }, env.SEED)
                    
        await broadcast(transferTx);
        await waitForTx(transferTx.id);
        
        await oracleApi.transferToAuction(accounts.testAccount);
        let id = await oracleApi.executeLiquidationOrder(accounts.testAccount);
        
        const txState = await stateChanges(id);
        const txStateObject = testHelper.convertDataStateToObject(txState.data)
        const prevNextOrder = txStateObject["order_next_" + beforePrevOrder]
        
        const transferToOrderOwner = txState.transfers.find(x => x.address == address(accounts.testAccount))
   
        assert.equal(transferToOrderOwner != null, true, "invalid transfer to user")
        assert.equal(transferToOrderOwner.amount, totalOrder * neutrinoHelper.PAULI, "invalid amount transfer to user")
        assert.equal(transferToOrderOwner.asset, deployResult.assets.neutrinoAssetId, "invalid asset id transfer to user")
        assert.equal(txStateObject["order_status_" + firstOrderHash], "filled", "invalid order status")
        assert.equal(txStateObject["order_last"], contractState["order_last"].value, "invalid last order in list")
        assert.equal(txStateObject["order_first"], beforePrevOrder, "invalid first order in list")
        assert.equal(prevNextOrder, "", "invalid prev order")
    })
          
})