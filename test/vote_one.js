const deployHelper = require('../neutrino-api/ContractHelper.js').ContractHelper;
const NeutrinoApi = require('../neutrino-api/NeutrinoApi.js').NeutrinoApi;

describe('Auction test', async function () {
    before(async function () {
        deployResult = await deployHelper.deploy(env.SEED, env.API_BASE, env.CHAIN_ID, "./script/", "TST-N", "TST-NB", "test asset", "test bond asset", "") 

        var massTx = massTransfer({
            transfers: [
                {
                    amount: 500000,
                    recipient: deployResult.accounts.controlContract.address
                },
                {
                    amount: 1 * NeutrinoApi.WAVELET,
                    recipient: deployResult.accounts.admins[0].address
                },
                {
                    amount: 1 * NeutrinoApi.WAVELET,
                    recipient: deployResult.accounts.admins[1].address
                },
                {
                    amount: 1 * NeutrinoApi.WAVELET,
                    recipient: deployResult.accounts.admins[2].address
                },
                {
                    amount: 1 * NeutrinoApi.WAVELET,
                    recipient: deployResult.accounts.oracles[0].address
                },
            ],
            fee: 600000
        }, env.SEED)
        await broadcast(massTx);
        await waitForTx(massTx.id);
    });

    let updateTx = {}

    it('Vote 3/5', async function () {
        updateTx = data({
            data: [
                { key: 'test_vote', value: true }
            ],
            fee: 500000,
            senderPublicKey: deployResult.accounts.controlContract.keyPair.publicKey
        }, deployResult.accounts.neutrinoContract.phrase);

        for(let i = 0; i < 3; i++){
            var voteTx = invokeScript({
                dApp: deployResult.accounts.controlContract.address,
                call: { function: "vote", args: [{ type: "string", value: "confirm_tx" }, { type: "string", value: updateTx.id }] }
            }, deployResult.accounts.admins[i].phrase);
            await broadcast(voteTx)
            await waitForTx(voteTx.id)
        }
    })

    it('Finalize 3/5 vote #1 invalid argument', async function () {
        var voteTx = invokeScript({
            dApp: deployResult.accounts.controlContract.address,
            call: { function: "finalizeVote", args: [{ type: "string", value: "confirm_tx" }, { type: "string", value: "123123" }] }
        }, deployResult.accounts.admins[0].phrase);
        try{
            await broadcast(voteTx)
            await waitForTx(voteTx.id)
            throw("test fail")
        }catch(ex){
            if(ex.message != "Error while executing account-script: voteCount < bftCoefficientAdmin")
                throw "test fail: " + ex.message
        }
    })
    
    it('Finalize 3/5 vote #2', async function () {
        var voteTx = invokeScript({
            dApp: deployResult.accounts.controlContract.address,
            call: { function: "finalizeVote", args: [{ type: "string", value: "confirm_tx" }, { type: "string", value: updateTx.id }] }
        }, deployResult.accounts.admins[0].phrase);
        await broadcast(voteTx)
        await waitForTx(voteTx.id)
    })

    it('Fail update contracts', async function () {
        var tx = data({
            data: [
                { key: 'asdasd', value: true }
            ],
            fee: 500000,
            senderPublicKey: deployResult.accounts.controlContract.keyPair.publicKey
        }, deployResult.accounts.neutrinoContract.phrase);
        try{
            await broadcast(tx)
            await waitForTx(tx.id)
            throw("test fail")
        }catch(ex){
            if(ex.message != "Transaction is not allowed by account-script")
                throw "test fail: " + ex.message
        }
    })

    it('Update contract', async function () {
        await broadcast(updateTx)
        await waitForTx(updateTx.id)
    })
    
})