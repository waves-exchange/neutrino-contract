var deployHelper = require('../helpers/deployHelper.js');
let deployResult = {}

describe('Oracle test', async function () {
    before(async function () {
        deployResult = await deployHelper.deploy("TST-N", "TST-NB", "test asset", "test bond asset", "")
        
        setupAccounts({
            testAccount: 100000 * deployHelper.WAVELET
        })

        var massTx = massTransfer({
            transfers: [
                {
                    amount: 100000000,
                    recipient: address(deployResult.accounts.oracles[0])
                },
                {
                    amount: 100000000,
                    recipient: address(deployResult.accounts.oracles[1])
                },
                {
                    amount: 100000000,
                    recipient: address(deployResult.accounts.oracles[2])
                },
                {
                    amount: 100000000,
                    recipient: address(deployResult.accounts.oracles[3])
                },
                {
                    amount: 100000000,
                    recipient: address(deployResult.accounts.oracles[4])
                },
            ],
            fee: 500000
        }, env.SEED)
        await broadcast(massTx);
        await waitForTx(massTx.id);
    });
    
    it('Vote oracles', async function () {
        let height = 0;
        let oraclesCount = deployHelper.getRandomArbitrary(3, 5)
        let expireBlock = 0
        let voteCount = 0;
        for(let i = 0; i < oraclesCount; i++) {
            height = await currentHeight()
            let price = deployHelper.getRandomArbitrary(1, 9999)
            const tx = invokeScript({
                dApp: address(deployResult.accounts.controlContract),
                call: { function: "setCurrentPrice", args: [{type: "integer", value: price }]},
                payment: []
            }, deployResult.accounts.oracles[i]);
    
            await broadcast(tx);
            await waitForTx(tx.id);

            const state = await stateChanges(tx.id);
            const dataState = deployHelper.convertDataStateToObject(state.data)
            voteCount++
            if(expireBlock != 0 && expireBlock != dataState.providing_expire_block && height <= dataState.providing_expire_block)
                throw "error expire block"
            else if(voteCount > 3 && !dataState.is_pending_price)
                throw "invalid pending price"
            else if(!dataState["oracle_is_provide_" + address(deployResult.accounts.oracles[i])])
                throw "invalid is oracle provide"
            else if(dataState["oracle_price_provide_" + address(deployResult.accounts.oracles[i])] != price)
                throw "invalid is oracle provide"
            
            expireBlock = dataState.providing_expire_block
        }  
    })    
    it('Finilize price', async function () {
        let height = 0
        const data = await accountData(address(deployResult.accounts.controlContract))

        console.log("wait height")
        while(height <= data.providing_expire_block.value)
            height = await currentHeight()
        
        let sumPrice = 0
        let countVote = 0
        for(let i = 0; i < 5; i++){
            if(data["oracle_is_provide_" + address(deployResult.accounts.oracles[i])].value){
                countVote++
                sumPrice += data["oracle_price_provide_" + address(deployResult.accounts.oracles[i])].value
            }
        }
        let price = Math.floor(sumPrice/countVote)

        const tx = invokeScript({
            dApp: address(deployResult.accounts.controlContract),
            call: { function: "finilizeCurrentPrice" },
            payment: []
        }, deployResult.accounts.oracles[0]);

        await broadcast(tx);
        await waitForTx(tx.id);
        
        const state = await stateChanges(tx.id);
        const dataState = deployHelper.convertDataStateToObject(state.data)
        if(dataState.price != price)
            throw "invalid price"
        else if(dataState.is_pending_price)
            throw "invalid pending price"
        
    })    
})