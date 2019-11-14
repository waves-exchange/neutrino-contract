import {invokeScript, nodeInteraction, seedUtils, broadcast, waitForTx } from "@waves/waves-transactions"
import { NeutrinoContractKeys } from "./contractKeys/NeutrinoContractKeys";
import { ControlContractKeys } from "./contractKeys/ControlContractKeys";
import { ContractHelper } from "./ContractHelper";
import { NeutrinoContractAccounts } from "./models/NeutrinoContractAccounts";

export class OracleApi {
    readonly WAVELET: number = (10 ** 8);
    readonly PAULI: number = 10**2;

    neutrinoContractAddress: string;
    auctionContractAddress: string;
    controlContractAddress: string;
    nodeUrl: string;
    chainId: string;
    neutrinoAssetId: string;
    bondAssetId: string;

    public static async create(nodeUrl: string, chainId: string, neutrinoContractAddress: string){
        const accountDataState = ContractHelper.convertDataStateToObject(await nodeInteraction.accountData(neutrinoContractAddress, nodeUrl));
        const auctionContractAddress = accountDataState[NeutrinoContractKeys.AuctionContractAddressKey]
        const controlContractAddress = accountDataState[NeutrinoContractKeys.ControlContractAddressKey]
        const neutrinoAssetId = accountDataState[NeutrinoContractKeys.NeutrinoAssetIdKey]
        const bondAssetId = accountDataState[NeutrinoContractKeys.BondAssetIdKey]
        return new OracleApi(nodeUrl, chainId, neutrinoContractAddress, auctionContractAddress, controlContractAddress, neutrinoAssetId, bondAssetId)
    }
    
    public constructor(nodeUrl: string, chainId: string, neutrinoContractAddress: string, auctionContractAddress: string, controlContractAddress: string, neutrinoAssetId: string, bondAssetId: string){
        this.neutrinoContractAddress = neutrinoContractAddress;
        this.nodeUrl = nodeUrl;
        this.chainId = chainId;
        this.auctionContractAddress = auctionContractAddress;
        this.controlContractAddress = controlContractAddress;
        this.neutrinoAssetId = neutrinoAssetId;
        this.bondAssetId = bondAssetId;
    }
    
}
