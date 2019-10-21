var deployHelper = require('../helpers/deployHelper.js');
let deployResult = {}
describe('RPD test', async function () {
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
                    amount: deployHelper.getRandomArbitrary(1, 9999999),
                    recipient: address(accounts.testAccount)
                }
            ],
            fee: 600000,
            assetId: deployResult.assets.neutrinoAssetId
        }, deployResult.accounts.neutrinoContract)

        await broadcast(massNeutrinoTx);
        await waitForTx(massNeutrinoTx.id);
    });
    it('Lock neutrino', async function () {
        const balance = await assetBalance(deployResult.assets.neutrinoAssetId, address(accounts.testAccount))

        const tx = invokeScript({
            dApp: address(deployResult.accounts.rpdContract),
            call: { function: "lockNeutrino" },
            payment: [{ assetId: deployResult.assets.neutrinoAssetId, amount: balance }]
        }, accounts.testAccount);

        await broadcast(tx);
        await waitForTx(tx.id);

        const state = await stateChanges(tx.id);
        const data = deployHelper.convertDataStateToObject(state.data)


        if (data["rpd_balance_" + deployResult.assets.neutrinoAssetId] != balance)
            throw "invalid rpd balance"
        else if (data["rpd_balance_" + deployResult.assets.neutrinoAssetId + "_" + address(accounts.testAccount) ] !=  balance)
            throw "invalid rpd user balance"
        else if (data["rpd_balance_" + deployResult.assets.neutrinoAssetId  + "_" + address(accounts.testAccount) + "_0"] !=  balance)
            throw "invalid rpd user balance by syncIndex"
        else if (data["balance_history_" + address(accounts.testAccount)] !=  "0_")
            throw "invalid rpd user history"
    })
    it('Unlock neutrino', async function () {
        const data = await accountData(address(deployResult.accounts.rpdContract))
        const balance = data["rpd_balance_" + deployResult.assets.neutrinoAssetId + "_" + address(accounts.testAccount)].value

        const tx = invokeScript({
            dApp: address(deployResult.accounts.rpdContract),
            call: { 
                function: "unlockNeutrino", 
                args:[
                    { type:"integer", value: balance },
                    { type: "string", value: deployResult.assets.neutrinoAssetId }
                ] 
            },
            payment:[]
        }, accounts.testAccount);

        await broadcast(tx);
        await waitForTx(tx.id);

        const state = await stateChanges(tx.id);
        const dataState = deployHelper.convertDataStateToObject(state.data)
    

        if (dataState["rpd_balance_" + deployResult.assets.neutrinoAssetId] != 0)
            throw "invalid rpd balance"
        else if (dataState["rpd_balance_" + deployResult.assets.neutrinoAssetId  + "_" + address(accounts.testAccount) ] !=  0)
            throw "invalid rpd user balance"
        else if (dataState["rpd_balance_" + deployResult.assets.neutrinoAssetId  + "_" + address(accounts.testAccount) + "_0"] !=  0)
            throw "invalid rpd user balance by syncIndex"
        else if (dataState["balance_history_" + address(accounts.testAccount)] !=  "0_")
            throw "invalid rpd user history"
    })
})