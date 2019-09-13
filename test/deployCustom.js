const wvs = 10 ** 8;
let assetId = ""
let bondAssetId = ""
let main = "waves private node seed with waves tokens"
let seed = "minute sail fortune shuffle gun submit reveal few fever nest chunk slow actor peanut warm"
let nc = seed + "neutrino"
let ac = seed + "auction"
let leaseContract = seed + "lease"
let nodeProviderContract = seed + "nodeProvider|1"
let nodeAddress = seed + "nodeProvider1Address"

describe('Deploy', async function () {
    before(async function () {
        return;
        let accountOne = seed + "1"
        let accountTwo = seed + "2"
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
                    recipient: address(leaseContract)
                  },
                {
                    amount: 10 * wvs,
                    recipient: address(accountOne),
                },
                {
                    amount: 10 * wvs,
                    recipient: address(accountTwo),
                },
                {
                    amount: 10 * wvs,
                    recipient: address(nodeProviderContract)
                }
              ]
        }, main)

        await broadcast(massTx);
        await waitForTx(massTx.id)

        // issue Neutrino
        const issueTx = issue({
            name: 'XXX-NXXUXXXXE',
            description: 'XXX-NXXUXXXXE',
            quantity: "100000000000000000",
            decimals: 8,
            fee: 100400000
        }, nc)

        await broadcast(issueTx);
        await waitForTx(issueTx.id)
        assetId = issueTx.id;

        // issue Bond
        const issueBondTx = issue({
            name: 'N-USDB',
            description: 'Neutrino USD Bond',
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
         //       { key: 'neutrino_asset_id', value: assetId},
                { key: 'neutrino_contract', value: address(nc)},
        //        { key: 'bond_asset_id', value: bondAssetId},
            ],
            fee: 500000
        }, ac);

        await broadcast(dataTx);
        let height = (await waitForTx(dataTx.id)).height

        // set startup auction variable
        const leaseDataTx = data({ 
            data: [
        //        { key: 'neutrino_asset_id', value: assetId},
                { key: 'neutrino_contract', value: address(nc)},
    //            { key: 'lease_block', value: height},
                { key: 'lease_block_wait', value: 5}
            ],
            fee: 500000
        }, leaseContract);

        await broadcast(leaseDataTx);
        await waitForTx(leaseDataTx.id)

        // set startup neutrino  variable
        const neutrinoDataTx = data({ 
            data: [
       //         { key: 'neutrino_asset_id', value: assetId },
        //        { key: 'bond_asset_id', value: bondAssetId},
                { key: 'auction_contract', value: address(ac) },
                { key: 'lease_contract', value: address(leaseContract)}
            ],
            fee: 500000
        }, nc);
    
        await broadcast(neutrinoDataTx);
        await waitForTx(neutrinoDataTx.id);

        // set startup nodeProvider variable
        const nodeProviderDataTx = data({ 
            data: [
                { key: 'neutrino_contract', value: address(nc) },
                { key: 'lease_contract', value: address(leaseContract)},
                { key: 'node_address', value: address(nodeAddress)}
            ],
            fee: 500000
        }, nodeProviderContract);
    
        await broadcast(nodeProviderDataTx);
        await waitForTx(nodeProviderDataTx.id);
    });
    it('Finalizing', async function () {


        const scriptNodeProvider = compile(file('../nodeProvider.ride'));
        const setNodeProviderScript = setScript({ script: scriptNodeProvider, fee: 1400000 }, nodeProviderContract);
        await broadcast(setNodeProviderScript);
        await waitForTx(setNodeProviderScript.id)

        console.log('Script has been set. NodeProvider:' + address(nodeProviderContract))
  
        const script = compile(file('../auction.ride'));
        const ssTx = setScript({ script: script, fee: 1400000 }, ac);
              
        await broadcast(ssTx);
        await waitForTx(ssTx.id)
        
        const scriptLease = compile(file('../lease.ride'));
        const setLeaseScriptTx = setScript({ script: scriptLease, fee: 1400000 }, leaseContract);
        await broadcast(setLeaseScriptTx);
        await waitForTx(setLeaseScriptTx.id)
        
        const scriptNeutrino = compile(file('../neutrino.ride'));
        const setNeutrinoScriptTx = setScript({ script: scriptNeutrino, fee: 1400000 }, nc);
        await broadcast(setNeutrinoScriptTx);
        await waitForTx(setNeutrinoScriptTx.id)

    })
})
