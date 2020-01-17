const deployHelper = require('../neutrino-api/ContractHelper.js');
const neutrinoHelper = require('../neutrino-api/NeutrinoApi.js');
const oracleHelper = require('../neutrino-api/OracleApi.js');


let deployResult = {}
let orderCount = 4;
let neutrinoApi = null;
let oracleApi = null;
describe('Liqidate test', async function () {
    before(async function () {
        deployResult = await deployHelper.deploy("TST-N", "TST-NB", "test asset", "test bond asset", "")

        setupAccounts({
            testAccount: 100000 * deployHelper.WAVELET
        })

        var massTx = massTransfer({
            transfers: [
                {
                    amount: 600000,
                    recipient: address(deployResult.accounts.neutrinoContract)
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
        }, deployResult.accounts.neutrinoContract)
        await broadcast(massNeutrinoTx);

        await waitForTx(massNeutrinoTx.id);
        neutrinoApi = await neutrinoHelper.NeutrinoApi.create(env.API_BASE, env.CHAIN_ID, address(deployResult.accounts.neutrinoContract));
        oracleApi = await oracleHelper.OracleApi.create(env.API_BASE, env.CHAIN_ID, address(deployResult.accounts.neutrinoContract));
    });
    it('Add orders', async function () {
        for (let i = 0; i < orderCount; i++) {
            const amount = Math.floor(deployHelper.getRandomArbitrary(11, 1000))

            const id = await neutrinoApi.addLiquidationOrder(amount, accounts.testAccount)
        
           /* const state = await stateChanges(id);
            const data = deployHelper.convertDataStateToObject(state.data)
            const orderHash = data.orderbook.split("_")[i] //TODO hash

            if (data["order_total_" + orderHash] != amount)
                throw "invalid order total"
            else if (data["order_owner_" + orderHash] != address(accounts.testAccount))
                throw "invalid order owner"
            else if (data["order_status_" + orderHash] != "new")
                throw "invalid order status"*/
        }
    })
    it('Cancel order', async function () {
        const index = deployHelper.getRandomArbitrary(0, orderCount - 2)
        const data = await accountData(address(deployResult.accounts.liquidationContract))
        const orders = data["orderbook"].value.split("_")
        const id = await neutrinoApi.cancelLiquidationOrder(orders[index], accounts.testAccount)

        const state = await stateChanges(id);
        const dataState = deployHelper.convertDataStateToObject(state.data)

        const newOrderbookItems = data["orderbook"].value.split(orders[index] + "_")
        const newOrderbook = newOrderbookItems[0] + newOrderbookItems[1]

        const amount = data["order_total_" + orders[index]].value
        if (dataState.orderbook != newOrderbook)
            throw "invalid order total"
        else if (dataState["order_status_" + orders[index]] != "canceled")
            throw "invalid order status"
        else if (state.transfers[0].address != address(accounts.testAccount))
            throw "invalid receiver address"
        else if (state.transfers[0].amount != amount)
            throw "invalid receiver amount"
        else if (state.transfers[0].asset != deployResult.assets.bondAssetId)
            throw "invalid asset"
    })
    it('Partially filled order', async function () {
        const data = await accountData(address(deployResult.accounts.liquidationContract))
        const orderHash = data.orderbook.value.split("_")[0]
        const totalOrder = Math.floor(data["order_total_" + orderHash].value / 2)

        var transferTx = transfer({
            amount: totalOrder * deployHelper.WAVELET,
            recipient: address(deployResult.accounts.neutrinoContract)
        }, env.SEED)
            
        await broadcast(transferTx);
        await waitForTx(transferTx.id);

        await oracleApi.transferToAuction(accounts.testAccount);
        let id = await oracleApi.executeLiquidationOrder(accounts.testAccount);

        const state = await stateChanges(id);
        const dataState = deployHelper.convertDataStateToObject(state.data)

        const transferToOrderOwner = state.transfers.find(x => x.address == address(accounts.testAccount))
      
        if (dataState.orderbook != data.orderbook.value)
            throw "invalid orderbook"
        else if (dataState["order_status_" + orderHash] != "new")
            throw "invalid order status"
        else if (transferToOrderOwner == null)
            throw "not find transfer to order owner"
        else if (transferToOrderOwner.amount != totalOrder * deployHelper.PAULI)
            throw "invalid receiver amount to order owner"
        else if (transferToOrderOwner.asset != deployResult.assets.neutrinoAssetId)
            throw "invalid asset to order owner"

    })
    it('Fully filled order', async function () {
        const data = await accountData(address(deployResult.accounts.liquidationContract))
        const orderHash = data.orderbook.value.split("_")[0]
        const totalOrder = data["order_total_" + orderHash].value

        var transferTx = transfer({
            amount: totalOrder * deployHelper.WAVELET,
            recipient: address(deployResult.accounts.neutrinoContract)
        }, env.SEED)
            
        await broadcast(transferTx);
        await waitForTx(transferTx.id);

        await oracleApi.transferToAuction(accounts.testAccount);
        let id = await oracleApi.executeLiquidationOrder(accounts.testAccount);
        const state = await stateChanges(id);
        const dataState = deployHelper.convertDataStateToObject(state.data)

        const transferToOrderOwner = state.transfers.find(x => x.address == address(accounts.testAccount))

        const orderbookElements = data.orderbook.value.split(orderHash + "_")
        const newOrderbook = orderbookElements[0] + orderbookElements[1]

        if (dataState.orderbook != newOrderbook)
            throw "invalid orderbook"
        else if (dataState["order_status_" + orderHash] != "filled")
            throw "invalid order status"
        else if (transferToOrderOwner == null)
            throw "not find transfer to order owner"
        else if (transferToOrderOwner.amount != totalOrder * deployHelper.PAULI)
            throw "invalid receiver amount to order owner"
        else if (transferToOrderOwner.asset != deployResult.assets.neutrinoAssetId)
            throw "invalid asset to order owner"
    })
})