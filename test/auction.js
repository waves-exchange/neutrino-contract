const wvs = 10 ** 8;
let assetId = ""
let bondAssetId = ""

describe('Auction test', async function () {
    before(async function () {
        await setupAccounts(
            {
                accountOne: 10 * wvs,
                accountTwo: 10 * wvs,
                contract: 10 * wvs,
                neutrinoContract: 1 * wvs
            }
        );

        // issue Neutrino
        const issueTx = issue({
            name: 'Neutrino ELS',
            description: 'Neutrino Test ELS',
            quantity: "100000000000000000",
            decimals: 8
        }, accounts.accountTwo)

        await broadcast(issueTx);
        await waitForTx(issueTx.id)
        assetId = issueTx.id;

        const transferTx = transfer({
            amount: 1000000000,
            recipient: address(accounts.accountOne),
            assetId: assetId
        }, accounts.accountTwo)

        await broadcast(transferTx);
        await waitForTx(transferTx.id)

        // issue Bond
        const issueBondTx = issue({
            name: 'Neutrino BELS',
            description: 'Neutrino Bond ELS',
            quantity: "100000000000000000",
            decimals: 0
        }, accounts.accountTwo)

        await broadcast(issueBondTx);
        await waitForTx(issueBondTx.id)
        bondAssetId = issueBondTx.id;

        // set startup variable
        const dataTx = data({ 
            data: [
                { key: 'neutrino_asset_id', value: assetId},
                { key: 'neutrino_contract_address', value: address(accounts.neutrinoContract)},
                { key: 'bond_asset_id', value: bondAssetId}
            ]
        }, accounts.contract);

        await broadcast(dataTx);
        await waitForTx(dataTx.id)

        // set script
        const script = compile(file('../auction.ride'));
        const ssTx = setScript({script}, accounts.contract);
            
        await broadcast(ssTx);
        await waitForTx(ssTx.id)

        console.log('Script has been set')
    });

    it('Add first order', async function () {
        const tx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "setOrder", args:[{type:"integer", value: 0.5 * wvs},{type:"integer", value: 0}] },
            payment: [{assetId: assetId, amount: 1 * wvs}]
        }, accounts.accountOne);

        await broadcast(tx);
        await waitForTx(tx.id);
    })

    it('Add second order', async function () {
        const tx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "setOrder", args:[{type:"integer", value: 0.4 * wvs},{type:"integer", value: 1}] },
            payment: [{assetId: assetId, amount: 1 * wvs}]
        }, accounts.accountOne);

        await broadcast(tx);
        await waitForTx(tx.id);
    })
    let thirdOrderId = "";
    it('Add third order', async function () {
        const tx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "setOrder", args:[{type:"integer", value: 0.45 * wvs},{type:"integer", value: 1}] },
            payment: [{assetId: assetId, amount: 0.1 * wvs}]
        }, accounts.accountOne);

        await broadcast(tx);
        await waitForTx(tx.id);

        let state = await stateChanges(tx.id);
        thirdOrderId = state.data[1].key.replace("order_price_", "")
    })

    it('Cancel third order', async function () {
        const tx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "cancelOrder", args:[{type:"string", value: thirdOrderId}] },
            payment: [{assetId: null, amount: 0.1 * wvs}]
        }, accounts.accountOne);

        await broadcast(tx);
        await waitForTx(tx.id);
    })

    it('Excexute full order', async function () {

        const transferTx = transfer({
            amount: 200000000,
            recipient: address(accounts.contract),
            assetId: bondAssetId
        }, accounts.accountTwo)

        await broadcast(transferTx);
        await waitForTx(transferTx.id)

        const tx = invokeScript({
            dApp: address(accounts.contract),
            call: {function: "execute" }
        }, accounts.accountOne);

        await broadcast(tx);
        await waitForTx(tx.id);
    })
})