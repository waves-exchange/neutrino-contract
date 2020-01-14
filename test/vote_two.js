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

    it('Vote 2/5', async function () {
        for(let i = 0; i < 2; i++){
            var voteTx = invokeScript({
                dApp: deployResult.accounts.controlContract.address,
                call: { function: "vote", args: [{ type: "string", value: "block" }, { type: "string", value: "true" }] }
            }, deployResult.accounts.admins[i].phrase);
            await broadcast(voteTx)
            await waitForTx(voteTx.id)
        }
    })

    it('Vote not admin', async function () {
        var voteTx = invokeScript({
            dApp: deployResult.accounts.controlContract.address,
            call: { function: "vote", args: [{ type: "string", value: "block" }, { type: "string", value: "true" }] }
        }, deployResult.accounts.oracles[0].phrase);
        try{
            await broadcast(voteTx)
            await waitForTx(voteTx.id)
            throw("test fail")
        }catch(ex){
            if(ex.message != "Error while executing account-script: user is not admin")
                throw "test fail: " + ex.message
        }
    })

    it('Aleready vote', async function () {
        var voteTx = invokeScript({
            dApp: deployResult.accounts.controlContract.address,
            call: { function: "vote", args: [{ type: "string", value: "block" }, { type: "string", value: "true" }] }
        }, deployResult.accounts.admins[0].phrase);
        try{
            await broadcast(voteTx)
            await waitForTx(voteTx.id)
            throw "test fail"
        }catch(ex){
            if(ex.message != "Error while executing account-script: vote already cast")
                throw "test fail: " + ex.message
        }
    })

    it('Finalize 2/5 vote #1', async function () {
        var voteTx = invokeScript({
            dApp: deployResult.accounts.controlContract.address,
            call: { function: "finalizeVote", args: [{ type: "string", value: "block" }, { type: "string", value: "true" }] }
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
    
    it('Finalize 2/5 vote #2 invalid argument', async function () {
        var voteTx = invokeScript({
            dApp: deployResult.accounts.controlContract.address,
            call: { function: "finalizeVote", args: [{ type: "string", value: "block" }, { type: "string", value: "false" }] }
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
    
})