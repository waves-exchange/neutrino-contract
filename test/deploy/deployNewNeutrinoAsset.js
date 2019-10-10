const wvs = 10 ** 8;
const symbolNeutrino = "BTC-N"
const symbolBond = "BTC-NB"
const descriptionNeutrino = "Bitcoin neutrino asset" 
const descriptionBond = "Bitcoin neutrino bond asset" 

describe('Deploy', async function () {
    before(async function () {
        await setupAccounts(
            {
                oracleOne: 0,
                oracleTwo: 0,
                oracleThree: 0,
                adminOne: 0,
                adminTwo: 0,
                adminThree: 0,
                auctionContract: 1500000,
                neutrinoContract: 201500000,
                rpdContract: 1500000
            }
        );

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
