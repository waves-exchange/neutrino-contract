var deployHelper = require('../helpers/deployHelper.js');
var auctionHelpers = require('../helpers/AuctionHelper.js');


let deployResult = {}
const orderCount = 4;
describe('Auction test', async function () {
    before(async function () {
        deployResult = await deployHelper.deploy("TST-N", "TST-NB", "test asset", "test bond asset", "")
        setupAccounts({
            testAccount: 100000 * deployHelper.WAVELET
        })

        var massTx = massTransfer({
            transfers: [
                {
                    amount: 1800000,
                    recipient: address(deployResult.accounts.neutrinoContract)
                },
                {
                    amount: 500000,
                    recipient: address(deployResult.accounts.controlContract)
                }
            ],
            fee: 500000
        }, env.SEED)
        await broadcast(massTx);
        await waitForTx(massTx.id);

        var massNeutrinoTx = massTransfer({
            transfers: [
                {
                    amount: deployHelper.getRandomArbitrary(1, 9999) * deployHelper.PAULI,
                    recipient: address(accounts.testAccount)
                }
            ],
            fee: 600000,
            assetId: deployResult.assets.neutrinoAssetId
        }, deployResult.accounts.neutrinoContract)
        await broadcast(massNeutrinoTx);

        await waitForTx(massNeutrinoTx.id);

        price = deployHelper.getRandomArbitrary(1, 9999)
         
       /* const priceDataTx = data({
             data: [
                 { key: "price", value: price }
             ],
             fee: 500000
        }, deployResult.accounts.controlContract);
 
        await broadcast(priceDataTx);
 
        await waitForTx(priceDataTx.id);*/
    });
    it('Add orders', async function () {
        for (let i = 0; i < orderCount; i++) {
            const auctionData = await accountData(address(deployResult.accounts.auctionContract))
            const auctionHelper = new auctionHelpers.AuctionHelper(auctionData);
            const orderPrice = deployHelper.getRandomArbitrary(51, 99)
            const balance = await assetBalance(deployResult.assets.neutrinoAssetId, address(accounts.testAccount));
            const amount = Math.floor(balance / (deployHelper.getRandomArbitrary(2, 10)))
            const index = auctionHelper.getIndexByPrice(orderPrice);
            
            const tx = invokeScript({
                dApp: address(deployResult.accounts.auctionContract),
                call: { function: "setOrder", args: [{ type: "integer", value: orderPrice }, { type: "integer", value: index }] },
                payment: [{ assetId: deployResult.assets.neutrinoAssetId, amount: amount }]
            }, accounts.testAccount);

            await broadcast(tx);
            await waitForTx(tx.id);

            const state = await stateChanges(tx.id);
            const data = deployHelper.convertDataStateToObject(state.data)
            const orderHash = data.orderbook.split("_")[index] //TODO hash

            if (data["order_total_" + orderHash] != amount)
                throw "invalid order total"
            else if (data["order_owner_" + orderHash] != address(accounts.testAccount))
                throw "invalid order owner"
            else if (data["order_status_" + orderHash]!= "new")
                throw "invalid order status"
        }
    })
    it('Cancel order', async function () {
        const index = deployHelper.getRandomArbitrary(0, orderCount-1)
        const data = await accountData(address(deployResult.accounts.auctionContract))
        const orders = data.orderbook.value.split("_")
        
        const tx = invokeScript({
            dApp: address(deployResult.accounts.auctionContract),
            call: { function: "cancelOrder", args: [{ type: "string", value: orders[index] }] }
        }, accounts.testAccount);

        await broadcast(tx);
        await waitForTx(tx.id);

        const state = await stateChanges(tx.id);
        const dataState = deployHelper.convertDataStateToObject(state.data)

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
        const data = await accountData(address(deployResult.accounts.auctionContract))
        const orderHash = data.orderbook.value.split("_")[0]
        const price = data["order_price_" + orderHash].value
        const totalOrder = Math.floor(data["order_total_" + orderHash].value/2)
        const amount = Math.floor(totalOrder*100/price/deployHelper.PAULI)
        const realTotal = Math.floor(amount*price*deployHelper.PAULI/100)
        
        var transferTx = transfer({
            amount: amount,
            recipient: address(deployResult.accounts.auctionContract),
            fee: 600000,
            assetId: deployResult.assets.bondAssetId
        }, deployResult.accounts.neutrinoContract)
        await broadcast(transferTx);
        await waitForTx(transferTx.id);

        const tx = invokeScript({
            dApp: address(deployResult.accounts.auctionContract),
            call: { function: "executeOrder" }
        }, accounts.testAccount);

        await broadcast(tx);
        await waitForTx(tx.id);

        const state = await stateChanges(tx.id);
        const dataState = deployHelper.convertDataStateToObject(state.data)

        const transferToNeutrinoContract = state.transfers.find(x=>x.address == address(deployResult.accounts.neutrinoContract))
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
        const data = await accountData(address(deployResult.accounts.auctionContract))
        const orderHash = data.orderbook.value.split("_")[0]
        const price = data["order_price_" + orderHash].value
        const totalOrder = data["order_total_" + orderHash].value - data["order_filled_total_" + orderHash].value
        const amount = Math.floor(totalOrder*100/price/deployHelper.PAULI)
        const realTotal = Math.floor(amount*price*deployHelper.PAULI/100)

        var transferTx = transfer({
            amount: amount,
            recipient: address(deployResult.accounts.auctionContract),
            fee: 600000,
            assetId: deployResult.assets.bondAssetId
        }, deployResult.accounts.neutrinoContract)
        await broadcast(transferTx);
        await waitForTx(transferTx.id);

        const tx = invokeScript({
            dApp: address(deployResult.accounts.auctionContract),
            call: { function: "executeOrder" }
        }, accounts.testAccount);

        await broadcast(tx);
        await waitForTx(tx.id);

        const state = await stateChanges(tx.id);
        const dataState = deployHelper.convertDataStateToObject(state.data)
        
        const transferToNeutrinoContract = state.transfers.find(x=>x.address == address(deployResult.accounts.neutrinoContract))
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