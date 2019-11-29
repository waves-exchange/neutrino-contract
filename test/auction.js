const deployHelper = require('../api/ContractHelper.js').ContractHelper;
const NeutrinoApi = require('../api/NeutrinoApi.js').NeutrinoApi;
const neutrinoHelper = require('../api/NeutrinoApi.js');
const oracleHelper = require('../api/OracleApi.js');
const testHelper = require('../helpers/testHelper.js');

let deployResult = {}
const orderCount = 1;
let neutrinoApi = null;
describe('Auction test', async function () {
    before(async function () {
        deployResult = await deployHelper.deploy(env.SEED, env.API_BASE, env.CHAIN_ID, "./script/", "TST-N", "TST-NB", "test asset", "test bond asset", "") 
        setupAccounts({
            testAccount: 100000 * NeutrinoApi.WAVELET
        })

        var massTx = massTransfer({
            transfers: [
                {
                    amount: 1800000,
                    recipient: deployResult.accounts.neutrinoContract.address
                },
                {
                    amount: 500000,
                    recipient: deployResult.accounts.controlContract.address
                }
            ],
            fee: 600000
        }, env.SEED)
        await broadcast(massTx);
        await waitForTx(massTx.id);

        var massNeutrinoTx = massTransfer({
            transfers: [
                {
                    amount: testHelper.getRandomArbitary(1, 9999) * NeutrinoApi.WAVELET * NeutrinoApi.PAULI,
                    recipient: address(accounts.testAccount)
                }
            ],
            fee: 600000,
            assetId: deployResult.assets.neutrinoAssetId
        }, deployResult.accounts.neutrinoContract.phrase)
        await broadcast(massNeutrinoTx);

        await waitForTx(massNeutrinoTx.id);

        price = testHelper.getRandomArbitary(1, 9999) * NeutrinoApi.WAVELET
        neutrinoApi = await neutrinoHelper.NeutrinoApi.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);
        oracleApi = await oracleHelper.OracleApi.create(env.API_BASE, env.CHAIN_ID, deployResult.accounts.neutrinoContract.address);
        await oracleApi.forceSetCurrentPrice(100, deployResult.accounts.controlContract.phrase)
    });
    it('Add orders', async function () {
        for (let i = 0; i < orderCount; i++) {
            const orderPrice = testHelper.getRandomArbitary(51, 99)/100
            const balance = await assetBalance(deployResult.assets.neutrinoAssetId, address(accounts.testAccount));
            const amount = Math.floor(balance / (testHelper.getRandomArbitary(2, 10)))

            let id = await neutrinoApi.addBuyBondOrder(50, 0.6, accounts.testAccount)
           /*  const state = await stateChanges(id);
            const data = deployHelper.convertDataStateToObject(state.data)
           const orderHash = data.orderbook.split("_")[index] //TODO hash
            if (data["order_total_" + orderHash] != amount)
                throw "invalid order total"
            else if (data["order_owner_" + orderHash] != address(accounts.testAccount))
                throw "invalid order owner"
            else if (data["order_status_" + orderHash]!= "new")
                throw "invalid order status"*/
        }
    })
    it('Cancel order', async function () {
        const index = testHelper.getRandomArbitary(0, orderCount-1)
        const data = await accountData(deployResult.accounts.auctionContract.address)
        const orders = data.orderbook.value.split("_")
        
        let id = await neutrinoApi.cancelBuyBondOrder(orders[index], accounts.testAccount)

        const state = await stateChanges(id);
        const dataState = testHelper.convertDataStateToObject(state.data)

        const newOrderbookItems = data.orderbook.value.split(orders[index] + "_")
        const newOrderbook  = newOrderbookItems[0] + newOrderbookItems[1]

        const amount = data["order_total_" + orders[index]].value
        if (dataState.orderbook != newOrderbook)
            throw "invalid order total"
        else if (dataState["order_status_" + orders[index]] != "canceled")
            throw "invalid order status"
        else if(state.transfers[0].address != address(accounts.testAccount))
            throw "invalid receiver address"
        else if(state.transfers[0].amount != amount)
            throw "invalid receiver amount"
        else if(state.transfers[0].asset != deployResult.assets.neutrinoAssetId)
            throw "invalid asset"
    })
    it('Partially filled order', async function () {
        const data = await accountData(deployResult.accounts.auctionContract.address)
        console.log(data)
        const orderHash = data.orderbook.value.split("_")[0]
        console.log(orderHash)
        const price = data["order_price_" + orderHash].value
        const totalOrder = Math.floor(data["order_total_" + orderHash].value/2)
        const amount = Math.floor(totalOrder*100/price/NeutrinoApi.PAULI)
        const realTotal = Math.floor(amount*price*NeutrinoApi.PAULI/100)
        
        var transferTx = transfer({
            amount: amount,
            recipient: deployResult.accounts.auctionContract.address,
            fee: 600000,
            assetId: deployResult.assets.bondAssetId
        }, deployResult.accounts.neutrinoContract.phrase)
        await broadcast(transferTx);
        await waitForTx(transferTx.id);

        let id = await oracleApi.executeBuyBondOrder(accounts.testAccount);
        const state = await stateChanges(id);
        const dataState = testHelper.convertDataStateToObject(state.data)

        const transferToNeutrinoContract = state.transfers.find(x=>x.address == deployResult.accounts.neutrinoContract.address)
        const transferToOrderOwner = state.transfers.find(x=>x.address == address(accounts.testAccount))
        
        if (dataState.orderbook != data.orderbook.value)
            throw "invalid orderbook"
        else if (dataState["order_status_" + orderHash] != "new")
            throw "invalid order status"
        else if(transferToNeutrinoContract == null)
            throw "not find transfer to neutrino contract"
        else if(transferToOrderOwner == null)
            throw "not find transfer to order owner"
        else if(transferToNeutrinoContract.amount != realTotal)
            throw "invalid receiver amount transfer to neutrino contract"
        else if(transferToNeutrinoContract.asset != deployResult.assets.neutrinoAssetId)
            throw "invalid asset transfer to neutrino contract"
        else if(transferToOrderOwner.amount != amount)
            throw "invalid receiver amount to order owner"
        else if(transferToOrderOwner.asset != deployResult.assets.bondAssetId)
            throw "invalid asset to order owner"
        
    })
    it('Fully filled order', async function () {
        const data = await accountData(deployResult.accounts.auctionContract.address)
        const orderHash = data.orderbook.value.split("_")[0]
        const price = data["order_price_" + orderHash].value
        const totalOrder = data["order_total_" + orderHash].value - data["order_filled_total_" + orderHash].value
        const amount = Math.floor(totalOrder*100/price/NeutrinoApi.PAULI)
        const realTotal = Math.floor(amount*price*NeutrinoApi.PAULI/100)

        var transferTx = transfer({
            amount: amount,
            recipient: deployResult.accounts.auctionContract.address,
            fee: 600000,
            assetId: deployResult.assets.bondAssetId
        }, deployResult.accounts.neutrinoContract.phrase)
        await broadcast(transferTx);
        await waitForTx(transferTx.id);

        let id = await oracleApi.executeBuyBondOrder(accounts.testAccount);
        const state = await stateChanges(id);
        const dataState = testHelper.convertDataStateToObject(state.data)
        
        const transferToNeutrinoContract = state.transfers.find(x=>x.address == deployResult.accounts.neutrinoContract.address)
        const transferToOrderOwner = state.transfers.find(x=>x.address == address(accounts.testAccount))

        const orderbookElements = data.orderbook.value.split(orderHash + "_")
        const newOrderbook = orderbookElements[0] + orderbookElements[1]
        
        if (dataState.orderbook != newOrderbook)
            throw "invalid orderbook"
        else if (dataState["order_status_" + orderHash] != "filled")
            throw "invalid order status"
        else if(transferToNeutrinoContract == null)
            throw "not find transfer to neutrino contract"
        else if(transferToOrderOwner == null)
            throw "not find transfer to order owner"
        else if(transferToNeutrinoContract.amount != realTotal)
            throw "invalid amount transfer to neutrino contract"
        else if(transferToNeutrinoContract.asset != deployResult.assets.neutrinoAssetId)
            throw "invalid asset transfer to neutrino contract"
        else if(transferToOrderOwner.amount != amount)
            throw "invalid amount to order owner"
        else if(transferToOrderOwner.asset != deployResult.assets.bondAssetId)
            throw "invalid asset to order owner"
        
    })
})