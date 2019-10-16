const wvs = 10 ** 8;

const symbolNeutrino = "BTC-N"
const symbolBond = "BTC-NB"
const descriptionNeutrino = "Bitcoin neutrino asset" 
const descriptionBond = "Bitcoin neutrino bond asset" 
const nodeAddress = ""

const accounts = 
    {
        oracles: [ wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed()] ,
        admins: [wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed(), wavesCrypto.randomSeed()],
        auctionContract: wavesCrypto.randomSeed(),
        neutrinoContract: wavesCrypto.randomSeed(),
        rpdContract: wavesCrypto.randomSeed(),
        controlContract: wavesCrypto.randomSeed()
    }
describe('Deploy', async function () {
    before(async function () {
        console.log("Seeds:")

        for(let i = 0; i < accounts.oracles.length; i++)
            console.log('Oracle ' + (i+1) + ': ' + accounts.oracles[i])
        
        for(let i = 0; i < accounts.admins.length; i++)
            console.log('Admin ' + (i+1) + ': ' + accounts.admins[i])
    
        console.log("Auction contract: " + accounts.auctionContract)
        console.log("Neutrino contract: " + accounts.neutrinoContract)
        console.log("RPD contract: " + accounts.rpdContract)
        console.log("Control contract: " + accounts.controlContract)
        
        console.log("Addresses:")
      
        for(let i = 0; i < accounts.oracles.length; i++)
            console.log('Oracle ' + (i+1) + ': ' + address(accounts.oracles[i]))

        for(let i = 0; i < accounts.admins.length; i++)
            console.log('Admin ' + (i+1) + ': ' + address(accounts.admins[i]))
        
        console.log("Auction contract: " + address(accounts.auctionContract))
        console.log("Neutrino contract: " + address(accounts.neutrinoContract))
        console.log("RPD contract: " + address(accounts.rpdContract))
        console.log("Control contract: " + accounts.controlContract)

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
                },
                {
                    amount: 1500000,
                    recipient: address(accounts.controlContract),
                }
            ],
            fee: 800000
        }, env.SEED)

        await broadcast(massTx)
        await waitForTx(massTx.id)

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
            quantity: "1000000000000",
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

        let oraclesAddress = ""
        for(let i = 0; i < accounts.oracles.length; i++){
            if(oraclesAddress != "")
                oraclesAddress += ","
            oraclesAddress += address(accounts.oracles[i])
        }

        let adminsAddress = ""
        for(let i = 0; i < accounts.admins.length; i++){
            if(adminsAddress != "")
                adminsAddress += ","
            adminsAddress += address(accounts.admins[i])
        }
        
        const neutrinoDataTx = data({
            data: [
                { key: "control_contract", value: address(accounts.controlContract) },
                { key: 'neutrino_asset_id', value: neutrinoAssetId },
                { key: 'bond_asset_id', value: bondAssetId },
                { key: 'auction_contract', value: address(accounts.auctionContract) },
                { key: "balance_lock_interval", value: 30 },
                { key: "vote_interval", value: 10 },
                { key: "min_waves_swap_amount", value: 100000000 },
                { key: "min_neutrino_swap_amount", value: 10000 },
                { key: 'rpd_contract', value: address(accounts.rpdContract) },
                { key: 'node_address', value: nodeAddress },
                { key: 'leasing_interval', value: 10080 }
            ],
            fee: 500000
        }, accounts.neutrinoContract);

        await broadcast(neutrinoDataTx);
        await waitForTx(neutrinoDataTx.id);

        const controlDataTx = data({
            data: [
                { key: "price_offset", value: 1000000 },
                { key: "providing_interval", value: 5 },
                { key: 'oracles', value: oraclesAddress},
                { key: 'admins', value: adminsAddress },
                { key: 'coefficient_oracle', value: 3 },
                { key: 'coefficient_admin', value: 3 },
                { key: 'script_update_interval', value: 30 },
                { key: 'price', value: 100 }
            ],
            fee: 500000
        }, accounts.controlContract);

        await broadcast(controlDataTx);
        await waitForTx(controlDataTx.id);

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
        const scriptNeutrino = compile(file('../script/neutrino.ride'));
        const setScriptNeutrino = setScript({ script: scriptNeutrino, fee: 1000000 ,}, accounts.neutrinoContract);
        await broadcast(setScriptNeutrino);
        await waitForTx(setScriptNeutrino.id)

        const scriptAuction = compile(file('../script/auction.ride'));
        const setScriptAuctionTx = setScript({ script: scriptAuction, fee: 1000000,}, accounts.auctionContract);        
        await broadcast(setScriptAuctionTx);
        await waitForTx(setScriptAuctionTx.id)

        const scriptControl = compile(file('../script/control.ride'));
        const setScriptControlTx = setScript({ script: scriptControl, fee: 1000000,}, accounts.controlContract);        
        await broadcast(setScriptControlTx);
        await waitForTx(setScriptControlTx.id)

        const scriptRPD = compile(file('../script/rpd.ride'));
        const setScriptRPDTx = setScript({ script: scriptRPD, fee: 1000000,}, accounts.rpdContract);        
        await broadcast(setScriptRPDTx);
        await waitForTx(setScriptRPDTx.id)
    })
})
