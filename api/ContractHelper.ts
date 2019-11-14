import { broadcast, data, seedUtils, massTransfer, waitForTx, issue, setScript} from "@waves/waves-transactions"
import { NeutrinoContractAccounts } from "./models/NeutrinoContractAccounts";
import fs from 'fs';

export class ContractHelper{
    static readonly neutrinoContractsPath = "neutrinoContracts/"
    static async deploy(distributorSeed, nodeUrl, chainId, symbolNeutrino, symbolBond, descriptionNeutrino, descriptionBond, nodeAddress, nodeOracleProvider = nodeAddress, leasingInterval = 10080): Promise<NeutrinoContractAccounts>{
        let accounts: NeutrinoContractAccounts = 
        {
            oracles: Array(5).fill(null).map(() => new seedUtils.Seed(seedUtils.generateNewSeed(), chainId)),
            admins: Array(5).fill(null).map(() => new seedUtils.Seed(seedUtils.generateNewSeed(),chainId)),
            auctionContract: new seedUtils.Seed(seedUtils.generateNewSeed(), chainId),
            neutrinoContract: new seedUtils.Seed(seedUtils.generateNewSeed(), chainId),
            rpdContract: new seedUtils.Seed(seedUtils.generateNewSeed(), chainId),
            controlContract: new seedUtils.Seed(seedUtils.generateNewSeed(), chainId),
            liquidationContract: new seedUtils.Seed(seedUtils.generateNewSeed(), chainId)
        }

        var massTx = massTransfer({
            transfers: [
                {
                    amount: 1500000,
                    recipient: accounts.auctionContract.address,
                },
                {
                    amount: 201500000,
                    recipient: accounts.neutrinoContract.address,
                },
                {
                    amount: 1500000,
                    recipient: accounts.rpdContract.address,
                },
                {
                    amount: 1500000,
                    recipient:  accounts.controlContract.address,
                },
                {
                    amount: 1500000,
                    recipient: accounts.liquidationContract.address
                }
               
            ],
            fee: 800000
        }, distributorSeed)

        await broadcast(massTx, nodeUrl)
        await waitForTx(massTx.id, nodeUrl)

        let oraclesAddress = ""
        for(let i = 0; i < accounts.oracles.length; i++){
            if(oraclesAddress != "")
                oraclesAddress += ","
            oraclesAddress += accounts.oracles[i].address
        }
        let adminsAddress = ""
        for(let i = 0; i < accounts.admins.length; i++){
            if(adminsAddress != "")
                adminsAddress += ","
            adminsAddress += accounts.admins[i].address
        }

        const issueTx = issue({
            name: symbolNeutrino,
            description: descriptionNeutrino,
            quantity: "100000000000000",
            decimals: 2,
            chainId: chainId
        }, accounts.neutrinoContract.phrase)

        const neutrinoAssetId = issueTx.id;

        const issueBondTx = issue({
            name: symbolBond,
            description: descriptionBond,
            quantity: "1000000000000",
            decimals: 0,
            chainId: chainId
        }, accounts.neutrinoContract.phrase);

        const bondAssetId = issueBondTx.id;
        
        const neutrinoDataTx = data({
            data: [
                { key: "control_contract", value: accounts.controlContract.address },
                { key: 'neutrino_asset_id', value: neutrinoAssetId },
                { key: 'bond_asset_id', value: bondAssetId },
                { key: 'auction_contract', value: accounts.auctionContract.address },
                { key: "balance_lock_interval", value: 30 },
                { key: "vote_interval", value: 10 },
                { key: "min_waves_swap_amount", value: 100000000 },
                { key: "min_neutrino_swap_amount", value: 10000 },
                { key: 'rpd_contract', value: accounts.rpdContract.address },
                { key: 'node_address', value: nodeAddress },
                { key: 'leasing_interval', value: leasingInterval },
                { key: "liquidation_contract", value: accounts.liquidationContract.address },
                { key: 'oracle_node_provider', value: nodeOracleProvider}
            ],
            fee: 500000
        }, accounts.neutrinoContract.phrase);

        const auctionDataTx = data({
            data: [
                { key: 'neutrino_contract', value: accounts.neutrinoContract.address },
            ],
            fee: 500000
        }, accounts.auctionContract.phrase);
        
        const liquidationDataTx = data({
            data: [
                { key: 'neutrino_contract', value: accounts.neutrinoContract.address },
            ],
            fee: 500000
        }, accounts.liquidationContract.phrase);

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
        }, accounts.controlContract.phrase);

        const rpdDataTx = data({
            data: [
                { key: 'neutrino_contract', value: accounts.neutrinoContract.address },
            ],
            fee: 500000
        }, accounts.rpdContract.phrase);

    
        await broadcast(issueTx, nodeUrl);
        await broadcast(issueBondTx, nodeUrl);
        await broadcast(auctionDataTx, nodeUrl);
        await broadcast(liquidationDataTx, nodeUrl)
        await broadcast(neutrinoDataTx, nodeUrl)
        await broadcast(controlDataTx, nodeUrl);
        await broadcast(rpdDataTx, nodeUrl);

        const scriptNeutrinoContract = fs.readFileSync(this.neutrinoContractsPath + "neutrino.data",'utf8');
        const setScriptNeutrinoTx = setScript({ script: scriptNeutrinoContract, fee: 1000000, chainId: chainId }, accounts.neutrinoContract.phrase);
        const scriptLiquidationContract = fs.readFileSync(this.neutrinoContractsPath + "liquidation.data",'utf8');
        const setScriptLiquidationTx = setScript({ script: scriptLiquidationContract, fee: 1000000, chainId: chainId }, accounts.liquidationContract.phrase);    
        const scriptAuctionContract = fs.readFileSync(this.neutrinoContractsPath + "auction.data",'utf8');
        const setScriptAuctionTx = setScript({ script: scriptAuctionContract, fee: 1000000, chainId: chainId }, accounts.auctionContract.phrase);
        const scriptControlContract = fs.readFileSync(this.neutrinoContractsPath + "control.data",'utf8');
        const setScriptControlTx = setScript({ script: scriptControlContract, fee: 1000000, chainId: chainId }, accounts.controlContract.phrase);       
        const scriptRPDContract = fs.readFileSync(this.neutrinoContractsPath + "rpd.data",'utf8');
        const setScriptRPDTx = setScript({ script: scriptRPDContract, fee: 1000000, chainId: chainId }, accounts.rpdContract.phrase);        
        
        await broadcast(setScriptNeutrinoTx, nodeUrl);
        await broadcast(setScriptAuctionTx, nodeUrl);
        await broadcast(setScriptLiquidationTx, nodeUrl);
        await broadcast(setScriptControlTx, nodeUrl);
        await broadcast(setScriptRPDTx, nodeUrl);

        
        await waitForTx(issueTx.id, nodeUrl)
        await waitForTx(issueBondTx.id, nodeUrl)

        await waitForTx(auctionDataTx.id, nodeUrl)
        await waitForTx(neutrinoDataTx.id, nodeUrl);
        await waitForTx(controlDataTx.id, nodeUrl);
        await waitForTx(rpdDataTx.id, nodeUrl);

        await waitForTx(setScriptNeutrinoTx.id, nodeUrl)
        await waitForTx(setScriptAuctionTx.id, nodeUrl)
        await waitForTx(setScriptLiquidationTx.id, nodeUrl)
        await waitForTx(setScriptControlTx.id, nodeUrl)
        await waitForTx(setScriptRPDTx.id, nodeUrl)

        return accounts;
    }
}