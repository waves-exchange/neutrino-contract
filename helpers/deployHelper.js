const WAVELET = 10 ** 8;
const PAULI = 10**2;

const accounts = 
    {
        oracles: Array(5).fill(null).map(() => wavesCrypto.randomSeed()),
        admins: Array(5).fill(null).map(() => wavesCrypto.randomSeed()),
        auctionContract: wavesCrypto.randomSeed(),
        neutrinoContract: wavesCrypto.randomSeed(),
        rpdContract: wavesCrypto.randomSeed(),
        controlContract: wavesCrypto.randomSeed()
    }

async function deploy(symbolNeutrino, symbolBond, descriptionNeutrino, descriptionBond, nodeAddress, leasingInterval = 10080) {
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
        console.log("Control contract: " + address(accounts.controlContract))

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

        const issueTx = issue({
            name: symbolNeutrino,
            description: descriptionNeutrino,
            quantity: "100000000000000",
            decimals: 2
        }, accounts.neutrinoContract)

        const neutrinoAssetId = issueTx.id;

        const issueBondTx = issue({
            name: symbolBond,
            description: descriptionBond,
            quantity: "1000000000000",
            decimals: 0
        }, accounts.neutrinoContract)
;
        const bondAssetId = issueBondTx.id;
        
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
                { key: 'leasing_interval', value: leasingInterval }
            ],
            fee: 500000
        }, accounts.neutrinoContract);

        const auctionDataTx = data({
            data: [
                { key: 'neutrino_contract', value: address(accounts.neutrinoContract) },
            ],
            fee: 500000
        }, accounts.auctionContract);
        
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

        const rpdDataTx = data({
            data: [
                { key: 'neutrino_contract', value: address(accounts.neutrinoContract) },
            ],
            fee: 500000
        }, accounts.rpdContract);

    
        await broadcast(issueTx);
        await broadcast(issueBondTx);
        await broadcast(auctionDataTx);
        await broadcast(neutrinoDataTx)
        await broadcast(controlDataTx);
        await broadcast(rpdDataTx);

        const scriptNeutrino = compile(file('../script/neutrino.ride'));
        const setScriptNeutrinoTx = setScript({ script: scriptNeutrino, fee: 1000000 ,}, accounts.neutrinoContract);

        const scriptAuction = compile(file('../script/auction.ride'));
        const setScriptAuctionTx = setScript({ script: scriptAuction, fee: 1000000,}, accounts.auctionContract);        

        const scriptControl = compile(file('../script/control.ride'));
        const setScriptControlTx = setScript({ script: scriptControl, fee: 1000000,}, accounts.controlContract);        

        const scriptRPD = compile(file('../script/rpd.ride'));
        const setScriptRPDTx = setScript({ script: scriptRPD, fee: 1000000,}, accounts.rpdContract);        
        
        await broadcast(setScriptNeutrinoTx);
        await broadcast(setScriptAuctionTx);
        await broadcast(setScriptControlTx);
        await broadcast(setScriptRPDTx);

        
        await waitForTx(issueTx.id)
        await waitForTx(issueBondTx.id)

        await waitForTx(auctionDataTx.id)
        await waitForTx(neutrinoDataTx.id);
        await waitForTx(controlDataTx.id);
        await waitForTx(rpdDataTx.id);

        await waitForTx(setScriptNeutrinoTx.id)
        await waitForTx(setScriptAuctionTx.id)
        await waitForTx(setScriptControlTx.id)
        await waitForTx(setScriptRPDTx.id)

        return {
            accounts: accounts,
            assets: {
                neutrinoAssetId: neutrinoAssetId,
                bondAssetId: bondAssetId
            }
        }
}

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}
function convertDataStateToObject(array) {
    let newObject = {}
    for(var index in array) {
        newObject[array[index].key] = array[index].value;
    }
    return newObject;
}
exports.PAULI = PAULI
exports.WAVELET = WAVELET
exports.deploy = deploy
exports.getRandomArbitrary = getRandomArbitrary
exports.convertDataStateToObject = convertDataStateToObject