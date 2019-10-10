const wvs = 10 ** 8;

const symbolNeutrino = "BTC-N"
const symbolBond = "BTC-NB"
const descriptionNeutrino = "Bitcoin neutrino asset" 
const descriptionBond = "Bitcoin neutrino bond asset" 

const accounts = 
    {
        oracleOne: wavesCrypto.randomSeed(),
        oracleTwo: wavesCrypto.randomSeed(),
        oracleThree: wavesCrypto.randomSeed(),
        adminOne: wavesCrypto.randomSeed(),
        adminTwo: wavesCrypto.randomSeed(),
        adminThree: wavesCrypto.randomSeed(),
        auctionContract: wavesCrypto.randomSeed(),
        neutrinoContract: wavesCrypto.randomSeed(),
        rpdContract: wavesCrypto.randomSeed()
    }
describe('Deploy', async function () {
    before(async function () {
        var massTx = massTransfer({
            transfers: [
                {
                    amount: 1500000,
                    recipient: address(accounts.auctionContract),
                },
                {
                    amount: 201500000,
                    recipient: address(accounts.neutrinoContract),
                },
                {
                    amount: 1500000,
                    recipient: address(accounts.rpdContract),
                }
            ],
            fee: 700000
        }, env.SEED)

        await broadcast(massTx)
        await waitForTx(massTx.id)

        console.log("Seeds:")
        console.log("Oracle one: " + accounts.oracleOne)
        console.log("Oracle two: " + accounts.oracleTwo)
        console.log("Oracle three: " + accounts.oracleThree)
        console.log("Address one: " + accounts.adminOne)
        console.log("Address two: " + accounts.adminTwo)
        console.log("Address three: " + accounts.adminThree)

        console.log("Auction contract: " + accounts.auctionContract)
        console.log("Neutrino contract: " + accounts.neutrinoContract)
        console.log("RPD contract: " + accounts.rpdContract)

        console.log("Addresses:")
        console.log("Oracle one: " + address(accounts.oracleOne))
        console.log("Oracle two: " + address(accounts.oracleTwo))
        console.log("Oracle three: " + address(accounts.oracleThree))
        console.log("Address one: " + address(accounts.adminOne))
        console.log("Address two: " + address(accounts.adminTwo))
        console.log("Address three: " + address(accounts.adminThree))

        console.log("Auction contract: " + address(accounts.auctionContract))
        console.log("Neutrino contract: " + address(accounts.neutrinoContract))
        console.log("RPD contract: " + address(accounts.rpdContract))

        const issueTx = issue({
            name: symbolNeutrino,
            description: descriptionNeutrino,
            quantity: "100000000000000",
            decimals: 2
        }, accounts.neutrinoContract)

        await broadcast(issueTx);
        await waitForTx(issueTx.id)
        const neutrinoAssetId = issueTx.id;

        const issueBondTx = issue({
            name: symbolBond,
            description: descriptionBond,
            quantity: "1000000000",
            decimals: 0
        }, accounts.neutrinoContract)

        await broadcast(issueBondTx);
        await waitForTx(issueBondTx.id)
        const bondAssetId = issueBondTx.id;

        const auctionDataTx = data({
            data: [
                { key: 'neutrino_contract', value: address(accounts.neutrinoContract) },
            ],
            fee: 500000
        }, accounts.auctionContract);

        await broadcast(auctionDataTx);
        await waitForTx(auctionDataTx.id)

        const neutrinoDataTx = data({
            data: [
                { key: 'neutrino_asset_id', value: neutrinoAssetId },
                { key: 'bond_asset_id', value: bondAssetId },
                { key: 'auction_contract', value: address(accounts.auctionContract) },
                { key: "balance_lock_interval", value: 30 },
                { key: "vote_interval", value: 10 },
                { key: "min_waves_swap_amount", value: 100000000 },
                { key: "min_neutrino_swap_amount", value: 10000 },
                { key: "price_offset", value: 25 },
                { key: "providing_interval", value: 5 },
                { key: 'oracle_0', value: address(accounts.oracleOne) },
                { key: 'oracle_1', value: address(accounts.oracleTwo)  },
                { key: 'oracle_2', value: address(accounts.oracleThree)  },
                { key: 'admin_0', value: address(accounts.adminOne) },
                { key: 'admin_1', value: address(accounts.adminTwo) },
                { key: 'admin_2', value: address(accounts.adminThree) },
                { key: 'rpd_contract', value: address(accounts.rpdContract) },
                { key: 'price', value: 100 },
            ],
            fee: 500000
        }, accounts.neutrinoContract);

        await broadcast(neutrinoDataTx);
        await waitForTx(neutrinoDataTx.id);

        const rpdDataTx = data({
            data: [
                { key: 'neutrino_contract', value: address(accounts.neutrinoContract) },
            ],
            fee: 500000
        }, accounts.rpdContract);

        await broadcast(rpdDataTx);
        await waitForTx(rpdDataTx.id)

    });
    it('Finalizing', async function () { 
        const scriptNeutrino = compile(file('../neutrino.ride'));
        const setScriptNeutrino = setScript({ script: scriptNeutrino, fee: 1000000 ,}, accounts.neutrinoContract);
        await broadcast(setScriptNeutrino);
        await waitForTx(setScriptNeutrino.id)

        const scriptAuction = compile(file('../auction.ride'));
        const setScriptAuctionTx = setScript({ script: scriptAuction, fee: 1000000,}, accounts.auctionContract);        
        await broadcast(setScriptAuctionTx);
        await waitForTx(setScriptAuctionTx.id)

        const scriptRPD = compile(file('../rpd.ride'));
        const setScriptRPDTx = setScript({ script: scriptRPD, fee: 1000000,}, accounts.rpdContract);        
        await broadcast(setScriptRPDTx);
        await waitForTx(setScriptRPDTx.id)
    })
})
