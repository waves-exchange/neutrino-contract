const wvs = 10 ** 8;
let price = 2.1 * wvs;
let assetId = ""
describe('Neutrino test', async function () {
    before(async function () {
        await setupAccounts(
            {
                accountOne: 1 * wvs,
                accountTwo: 1 * wvs,
                contract: 1.1 * wvs
            }
        );

        // issue Neutrino
        const issueTx = issue({
            name: 'Neutrino ELS',
            description: 'Neutrino Test ELS',
            quantity: "100000000000000000",
            decimals: 8
        }, accounts.contract)

        await broadcast(issueTx);
        await waitForTx(issueTx.id)
        assetId = issueTx.id;

        // set startup variable
        const dataTx = data({ 
            data: [
                { key: 'neutrino_asset_id', value: issueTx.id },
            ]
        }, accounts.contract);

        await broadcast(dataTx);
        await waitForTx(dataTx.id)

        // set script
        const script = compile(file('../neutrino.ride'));
        const ssTx = setScript({script}, accounts.contract);
            
        await broadcast(ssTx);
        await waitForTx(ssTx.id)

        // set price 
        const setPriceTx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "setCurrentPrice", args:[{type:"integer", value: price}] },
        }, accounts.accountOne);
    
        await broadcast(setPriceTx);
        await waitForTx(setPriceTx.id);

        console.log('Script has been set')
    });
    
    it('Swap Waves to Neutrino', async function () {
        let amount =  0.1 * wvs;
        const tx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "swapWavesToNeutrino"},
            payment: [{assetId: null, amount: amount}]
        }, accounts.accountOne);

        await broadcast(tx);
        await waitForTx(tx.id);

        let expectedNeutrinoAmount = amount*price;

        let state = await stateChanges(tx.id);
        if(state.transfers[0].address != address(accounts.accountOne))
            throw "transfer address not equals sender address"
        if(state.transfers[0].asset != assetId)
            throw "transfer asset error"
        let realNeutrinoAmount = state.transfers[0].amount;

        if(expectedNeutrinoAmount != realNeutrinoAmount)
            throw "expected neutrino amount not equals real neutrino amount" 
    })
    
    it('Swap Neutrino to Waves', async function () {
        let amount = await assetBalance(assetId, address(accounts.accountOne));
        const tx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "swapNeutrinoToWaves"},
            payment: [{assetId: assetId, amount: amount}]
        }, accounts.accountOne);

        await broadcast(tx);
        await waitForTx(tx.id);

        let expectedWavesAmount = amount/price;

        let state = await stateChanges(tx.id);
        if(state.transfers[0].address != address(accounts.accountOne))
            throw "transfer address not equals sender address"
        if(state.transfers[0].asset != null)
            throw "transfer asset error"
        let realWavesAmount = state.transfers[0].amount;

        if(expectedWavesAmount != realWavesAmount)
            throw "expected waves amount not equals real waves amount" 
    })
})