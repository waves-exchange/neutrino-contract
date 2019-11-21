import {invokeScript, nodeInteraction, broadcast, waitForTx } from "@waves/waves-transactions"
import { NeutrinoContractKeys } from "./contractKeys/NeutrinoContractKeys";
import { ControlContractKeys } from "./contractKeys/ControlContractKeys";
import { Seed } from "@waves/waves-transactions/dist/seedUtils";
import { accountData, accountDataByKey } from "@waves/waves-transactions/dist/nodeInteraction";
import { OrderKeys } from "./contractKeys/OrderKeys";

export class NeutrinoApi {
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
        return new NeutrinoApi(nodeUrl, chainId, neutrinoContractAddress, auctionContractAddress, controlContractAddress, liquidationContract, neutrinoAssetId, bondAssetId)
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
    public async redeemWaves(neutrinoAmount: number, seed: string): Promise<string> {
        const tx = invokeScript({
            dApp: this.neutrinoContractAddress,
            call: {function: "swapNeutrinoToWaves"},
            chainId: this.chainId,
            payment: [{assetId: this.neutrinoAssetId, amount: neutrinoAmount }]
        }, seed);

        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    public async issueNeutrino(wavesAmount: number, seed: string): Promise<string> {
        const tx = invokeScript({
            dApp: this.neutrinoContractAddress,
            call: {function: "swapWavesToNeutrino"},
            chainId: this.chainId,
            payment: [{assetId: null, amount: wavesAmount }]
        }, seed);

        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    public async isPossibleWithdraw(address: String): Promise<boolean> {
        const contractData = await accountData(this.neutrinoContractAddress, this.nodeUrl);
        const unblockHeight = contractData[NeutrinoContractKeys.PrefixBalanceUnlockBlock + address].value
        const currentHeight = await nodeInteraction.currentHeight(this.nodeUrl);
        return currentHeight >= unblockHeight
    }
    public async withdraw(seed: string): Promise<string> {
        const userAddress = (new Seed(seed, this.chainId)).address;
        const contractData = await accountData(this.controlContractAddress, this.nodeUrl);
        const unblockHeight = (await accountDataByKey(NeutrinoContractKeys.PrefixBalanceUnlockBlock + userAddress, this.neutrinoContractAddress, this.nodeUrl)).value;
        let wihdrawIndex = 0;
        let heightByindex = 0;
        for(var key in contractData) {
            if(!key.startsWith(NeutrinoContractKeys.PrefixPriceIndexKey))
                continue;
            if(contractData[key].value >= heightByindex && contractData[key].value <= unblockHeight){
                wihdrawIndex = <number><unknown>key.replace(NeutrinoContractKeys.PrefixPriceIndexKey, "")
                heightByindex = <number>contractData[key].value;
            }
        }
        console.log(wihdrawIndex)
        const tx = invokeScript({
            dApp: this.neutrinoContractAddress,
            call: { function: "withdraw", args: [
                { type: "string", value: userAddress }, 
                { type: "integer", value: wihdrawIndex }
            ] },
            chainId: this.chainId
        }, seed);
        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    public async addLiquidationOrder(amount: number, seed: string): Promise<string> {
        const tx = invokeScript({
            dApp: this.liquidationContract,
            call: { function: "addLiquidationOrder" },
            payment: [{ assetId: this.bondAssetId, amount: amount }],
            chainId: this.chainId
        }, seed);

        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    public async addBuyBondOrder(amount: number, price: number, seed: string): Promise<string> {
        price = Math.floor(price * 100);
        console.log(price)
        const auctionData = await accountData(this.auctionContractAddress, this.nodeUrl);
        let position = 0;
        if(auctionData[OrderKeys.OrderbookKey] !== undefined) {
            let orders = (<string>auctionData[OrderKeys.OrderbookKey].value).split("_").filter(x=>x != "");
            position = orders.length;
            for(let i = orders.length-1; i >= 0; i--) {
                if(price > auctionData[OrderKeys.OrderPriceKey + orders[i]].value)
                    position = i;
                else   
                    break;
            }
        }
    
        const tx = invokeScript({
            dApp: this.auctionContractAddress,
            call: { function: "addBuyBondOrder", args: [{ type: "integer", value: price }, { type: "integer", value: position }] },
            payment: [{ assetId: this.neutrinoAssetId, amount: amount }],
            chainId: this.chainId
        }, seed);

        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    public async cancelLiquidationOrder(orderId: string, seed: string): Promise<string> {
        const tx = invokeScript({
            dApp: this.liquidationContract,
            call: { function: "cancelOrder", args: [{ type: "string", value: orderId }] },
            chainId: this.chainId
        }, seed);

        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    public async cancelBuyBondOrder(orderId: string, seed: string): Promise<string> {
        const tx = invokeScript({
            dApp: this.auctionContractAddress,
            call: { function: "cancelOrder", args: [{ type: "string", value: orderId }] },
            chainId: this.chainId
        }, seed);

        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    
}
