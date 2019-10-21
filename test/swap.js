var deployHelper = require('../helpers/deployHelper.js');

let price = 0;
let deployResult = {}

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
                { key: "price", value: price }
            ],
            fee: 500000
        }, deployResult.accounts.controlContract);

        await broadcast(priceDataTx);

        await waitForTx(priceDataTx.id);
    });
    
    it('Swap Waves to Neutrino', async function () {
        let amount = deployHelper.getRandomArbitrary(1, 9999)
        const tx = invokeScript({
            dApp: address(deployResult.accounts.neutrinoContract),
            call: {function: "swapWavesToNeutrino"},
            payment: [{assetId: null, amount: amount * deployHelper.WAVELET }]
        }, accounts.testAccount);

        await broadcast(tx);
        await waitForTx(tx.id);

        let expectedNeutrinoAmount = amount * price * deployHelper.PAULI/100

        let state = await stateChanges(tx.id);
        if(state.transfers[0].address != address(accounts.testAccount))
            throw "transfer address not equals sender address"
        if(state.transfers[0].asset != deployResult.assets.neutrinoAssetId)
            throw "transfer asset error"
        
        if(expectedNeutrinoAmount != state.transfers[0].amount)
            throw "expected neutrino amount not equals real neutrino amount" 
    })    
    
    it('Swap Neutrino to Waves', async function () {
        let amount = await assetBalance(deployResult.assets.neutrinoAssetId, address(accounts.testAccount));

        const tx = invokeScript({
            dApp: address(deployResult.accounts.neutrinoContract),
            call: {function: "swapNeutrinoToWaves"},
            payment: [{assetId: deployResult.assets.neutrinoAssetId , amount: amount}]
        }, accounts.testAccount);

        await broadcast(tx);
        await waitForTx(tx.id);

        let expectedWavesAmount = amount*100/price*deployHelper.WAVELET/deployHelper.PAULI
        
        let state = await stateChanges(tx.id);
        if(expectedWavesAmount != state.data.find(obj => obj.key === "waves_"+address(accounts.testAccount) ).value)
            throw "expected waves amount not equals real waves amount" 
    })
})