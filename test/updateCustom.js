const wvs = 10 ** 8;
let assetId = ""
let bondAssetId = ""
let main = "waves private node seed with waves tokens"
let seed = "minute sail fortune shuffle gun submit reveal few fever nest chunk slow actor peanut warm"
let nc = seed + "neutrino"
let ac = seed + "auction"
let rpd = seed + "rpd"
//minute sail fortune shuffle gun submit reveal few fever nest chunk slow actor peanut warmoracle_one
//minute sail fortune shuffle gun submit reveal few fever nest chunk slow actor peanut warmoracle_two
//minute sail fortune shuffle gun submit reveal few fever nest chunk slow actor peanut warmoracle_three
let oracleOneAddress = seed + "oracle_one"
let oracleTwoAddress = seed + "oracle_two"
let oracleThreeAddress = seed + "oracle_three"
describe('Deploy', async function () {
    before(async function () {
        let accountOne = seed + "1"
       /* var massTx = massTransfer({
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
                    recipient: address(rpd)
                },
                {
                    amount: 10 * wvs,
                    recipient: address(accountOne)
                }
            ]
        }, main)

        await broadcast(massTx);
        await waitForTx(massTx.id)

        await broadcast(dataTx);
        await waitForTx(dataTx.id)*/
        return;
        // set startup neutrino  variable
        const neutrinoDataTx = data({
            data: [
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
                { key: 'admin_2', value: address(oracleThreeAddress) }
            ],
            fee: 500000
        }, nc);

        await broadcast(neutrinoDataTx);
        await waitForTx(neutrinoDataTx.id)
    });
    it('Finalizing', async function () {

       
        
        const scriptNeutrino = compile(file('../neutrino.ride'));
        const setNeutrinoScriptTx = setScript({ script: scriptNeutrino, fee: 1400000 ,}, nc);
        await broadcast(setNeutrinoScriptTx);
        await waitForTx(setNeutrinoScriptTx.id)
        
        const script = compile(file('../auction.ride'));
        const ssTx = setScript({ script: script, fee: 1400000 ,}, ac);
              
        await broadcast(ssTx);
        await waitForTx(ssTx.id)
        const scriptRPD = compile(file('../rpd.ride'));
        const scriptRPDTx = setScript({ script: scriptRPD, fee: 1400000 ,}, rpd);
        await broadcast(scriptRPDTx);
        await waitForTx(scriptRPDTx.id)
        console.log('Script has been set')

    })
})
