import {invokeScript, nodeInteraction, broadcast, waitForTx } from "@waves/waves-transactions"
import { NeutrinoContractKeys } from "./contractKeys/NeutrinoContractKeys";
import { ControlContractKeys } from "./contractKeys/ControlContractKeys";
import { Seed } from "@waves/waves-transactions/dist/seedUtils";
import { accountData, accountDataByKey } from "@waves/waves-transactions/dist/nodeInteraction";
import { OrderKeys } from "./contractKeys/OrderKeys";

export class OracleApi {
    static readonly WAVELET: number = (10 ** 8);
    static readonly PAULI: number = 10**2;
    neutrinoContractAddress: string;
    auctionContractAddress: string;
    controlContractAddress: string;
    nodeUrl: string;
    chainId: string;
    neutrinoAssetId: string;
    bondAssetId: string;
    liquidationContract: string;

    public static async create(nodeUrl: string, chainId: string, neutrinoContractAddress: string){
        const accountDataState = await nodeInteraction.accountData(neutrinoContractAddress, nodeUrl);
        const auctionContractAddress = <string>accountDataState[NeutrinoContractKeys.AuctionContractAddressKey].value
        const controlContractAddress = <string>accountDataState[NeutrinoContractKeys.ControlContractAddressKey].value
        const neutrinoAssetId = <string>accountDataState[NeutrinoContractKeys.NeutrinoAssetIdKey].value
        const bondAssetId = <string>accountDataState[NeutrinoContractKeys.BondAssetIdKey].value
        const liquidationContract = <string>accountDataState[NeutrinoContractKeys.LiquidationContractAddressKey].value
        return new OracleApi(nodeUrl, chainId, neutrinoContractAddress, auctionContractAddress, controlContractAddress, liquidationContract, neutrinoAssetId, bondAssetId)
    }
    
    public constructor(nodeUrl: string, chainId: string, neutrinoContractAddress: string, auctionContractAddress: string, controlContractAddress: string, liquidationContract: string, neutrinoAssetId: string, bondAssetId: string){
        this.neutrinoContractAddress = neutrinoContractAddress;
        this.nodeUrl = nodeUrl;
        this.chainId = chainId;
        this.auctionContractAddress = auctionContractAddress;
        this.controlContractAddress = controlContractAddress;
        this.neutrinoAssetId = neutrinoAssetId;
        this.bondAssetId = bondAssetId;
        this.liquidationContract = liquidationContract;
    }
    
    public async getPrice(): Promise<number> {
        return <number>(await nodeInteraction.accountDataByKey(ControlContractKeys.PriceKey, this.controlContractAddress, this.nodeUrl)).value/100;
    }

    /*public async setCurrentPrice(): Promise<string> {

    }
    public async isPricePending(): Promise<string> {
        
    }

    public async isFinilizeCurrentPrice(): Promise<string> {
        
    }

    public async finilizeCurrentPrice(): Promise<string> {
        
    }

    public async sell(): Promise<string> {
        
    }*/
    

    
}
