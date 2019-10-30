var deployHelper = require('../helpers/deployHelper.js');
let deployResult = {}

describe('Deficit and surplus test', async function () {
    before(async function () {
        setupAccounts({
            testAccount: 100000 * deployHelper.WAVELET
        })

        deployResult = await deployHelper.deploy("TST-N", "TST-NB", "test asset", "test bond asset", "")
    });
    it('Deficit test', async function () {
   /*     const dataAccount = await accountData(address(deployResult.accounts.controlContract))
        let amountWaves = deployHelper.getRandomArbitrary(1, 99999) * deployHelper.WAVELET
        let neutrinoAmount = deployHelper.getRandomArbitrary(amountWaves + 1, 99999) * deployHelper.WAVELET

        var neutrinoTransferTx = transfer({
            amount: neutrinoAmount,
            recipient: address(deployResult.accounts.auctionContract),
            fee: 600000,
            assetId: deployResult.assets.bondAssetId
        }, deployResult.accounts.neutrinoContract)
        await broadcast(neutrinoTransferTx);
        await waitForTx(neutrinoTransferTx.id);

        var neutrinoTransferTx = transfer({
            amount: amountWaves,
            recipient: address(deployResult.accounts.neutrinoContract),
            fee: 600000,
            assetId: deployResult.assets.bondAssetId
        }, accounts.testAccount)
        await broadcast(neutrinoTransferTx);
        await waitForTx(neutrinoTransferTx.id);*/

   /*     const dificit = neutrinoAmount - (*dataAccount.price.WAVELET amountWaves*price/100*deployHelper.PAULI/deployHelper.WAVELET 
        const state = await stateChanges(tx.id);
        const data = deployHelper.convertDataStateToObject(state.data)
        
        if(data.lease_tx_hash != leaseTx.id)
            throw("invalid leasing tx hash")
        else if(data.leasing_amount != leaseTx.amount)
            throw("invalid leasing amount")*/
    })
    it('Surplus test', async function () {
       
    })
})