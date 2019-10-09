const wvs = 10 ** 8;
let assetId = ""
let bondAssetId = ""
let main = "waves private node seed with waves tokens"
let seed = "minute sail fortune shuffle gun submit reveal few fever nest chunk slow actor peanut warm"
let nc = seed + "neutrino"
let ac = seed + "auction"
let oracleOneAddress = seed + "oracle_one"
let oracleTwoAddress = seed + "oracle_two"
let oracleThreeAddress = seed + "oracle_three"
describe('Deploy', async function () {
    before(async function () {
        let accountOne = seed + "1"
        var massTx = massTransfer({
            transfers: [
                {
                    amount: 10 * wvs,
                    recipient: address(nc),
                },
                {
                    amount: 10 * wvs,
                    recipient: address(ac)
                },
                {
                    amount: 10 * wvs,
                    recipient: address(oracleOneAddress)
                },
                {
                    amount: 10 * wvs,
                    recipient: address(oracleTwoAddress),
                },
                {
                    amount: 10 * wvs,
                    recipient: address(oracleThreeAddress),
                },
                {
                    amount: 10 * wvs,
                    recipient: address(accountOne)
                }
            ]
        }, main)

        await broadcast(massTx);
        await waitForTx(massTx.id)

        // issue Neutrino
        const issueTx = issue({
            name: 'EUR-N',
            description: 'Neutrino EUR Alpha 0.0.1',
            quantity: "100000000000000000",
            decimals: 8,
            fee: 100400000
        }, nc)

        await broadcast(issueTx);
        await waitForTx(issueTx.id)
        assetId = issueTx.id;

        // issue Bond
        const issueBondTx = issue({
            name: 'N-EURB',
            description: 'Neutrino EUR Bond Alpha 0.0.1',
            quantity: "1000000000",
            decimals: 0,
            fee: 100400000
        }, nc)

        await broadcast(issueBondTx);
        await waitForTx(issueBondTx.id)
        bondAssetId = issueBondTx.id;

        // set startup auction variable
        const dataTx = data({
            data: [
                { key: 'neutrino_asset_id', value: assetId },
                { key: 'neutrino_contract', value: address(nc) },
                { key: 'bond_asset_id', value: bondAssetId }
            ],

            fee: 500000
        }, ac);

        await broadcast(dataTx);
        await waitForTx(dataTx.id)

        // set startup neutrino  variable
        const neutrinoDataTx = data({
            data: [
                { key: 'neutrino_asset_id', value: assetId },
                { key: 'bond_asset_id', value: bondAssetId },
                { key: 'auction_contract', value: address(ac) },
                { key: "balance_lock_interval", value: 1 },
                { key: "vote_interval", value: 5 },
                { key: "min_swap_amount", value: 100000000 },
                { key: "price_offset", value: 10000000 },
                { key: "providing_interval", value: 5 },
                { key: 'oracle_0', value: address(oracleOneAddress) },
                { key: 'oracle_1', value: address(oracleTwoAddress) },
                { key: 'oracle_2', value: address(oracleThreeAddress) },
                { key: 'admin_0', value: address(oracleOneAddress) },
                { key: 'admin_1', value: address(oracleTwoAddress) },
                { key: 'admin_2', value: address(oracleThreeAddress) },
                { key: 'price', value: 100 },
            ],
            fee: 500000
        }, nc);

        await broadcast(neutrinoDataTx);
        await waitForTx(neutrinoDataTx.id)

    });
    it('Finalizing', async function () {

        const script = compile(file('../auction.ride'));
        const ssTx = setScript({ script: script, fee: 1400000 ,}, ac);
              
        await broadcast(ssTx);
        await waitForTx(ssTx.id)
        
        const scriptNeutrino = compile(file('../neutrino.ride'));
        const setNeutrinoScriptTx = setScript({ script: scriptNeutrino, fee: 1400000 ,}, nc);
        await broadcast(setNeutrinoScriptTx);
        await waitForTx(setNeutrinoScriptTx.id)

    })
})
