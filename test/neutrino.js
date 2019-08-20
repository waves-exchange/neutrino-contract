const wvs = 10 ** 8;
let price = 2 * wvs;
let assetId = ""
let bondAssetId = ""

describe('Neutrino test', async function () {
    before(async function () {
        await setupAccounts(
            {
                accountOne: 3 * wvs,
                accountTwo: 1 * wvs,
                contract: 2.1 * wvs
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

        // issue Bond
        const issueBondTx = issue({
            name: 'Neutrino BELS',
            description: 'Neutrino Bond ELS',
            quantity: "100000000000000000",
            decimals: 0
        }, accounts.contract)

        await broadcast(issueBondTx);
        await waitForTx(issueBondTx.id)
        bondAssetId = issueBondTx.id;

        // set startup variable
        const dataTx = data({ 
            data: [
                { key: 'neutrino_asset_id', value: assetId },
                { key: 'bond_asset_id', value: bondAssetId}
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
    
    it('Start auction bond', async function () {
        price = 0.1 * wvs;
        const setPriceTx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "setCurrentPrice", args:[{type:"integer", value: price}] },
        }, accounts.accountOne);
    
        await broadcast(setPriceTx);
        await waitForTx(setPriceTx.id);

        const tx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "setBondOrder", args:[{type:"integer", value: 0.5 * wvs}]},
            payment: [{assetId: null, amount: 1.9 * wvs}]
        }, accounts.accountOne);

        await broadcast(tx);
        await waitForTx(tx.id);
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