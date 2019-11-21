import { invokeScript, data, nodeInteraction, broadcast, waitForTx } from "@waves/waves-transactions"
import { NeutrinoContractKeys } from "./contractKeys/NeutrinoContractKeys";
import { ControlContractKeys } from "./contractKeys/ControlContractKeys";

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

    public async forceSetCurrentPrice(price: number, controlContractSeed: string): Promise<string> {
        price = Math.floor(price*100)
        const height = await nodeInteraction.currentHeight(this.nodeUrl);
        const newIndexData = await nodeInteraction.accountDataByKey(ControlContractKeys.PriceIndexKey, this.controlContractAddress, this.nodeUrl);
        let newIndex = 1;
        if(newIndexData !== null)
            newIndex = <number>newIndexData.value + 1;
        const dataTx = data({
            data: [
                { key: "price", value: price },
                { key: 'price_' + height, value: price },
                { key: 'is_pending_price', value: false },
                { key: 'price_index', value: newIndex },
                { key: 'price_index_' + newIndex, value: height }
            ],
            fee: 500000
        }, controlContractSeed)

        await broadcast(dataTx, this.nodeUrl)
        await waitForTx(dataTx.id, { apiBase: this.nodeUrl })
        return dataTx.id;
    }
    public async executeBuyBondOrder(seed: string): Promise<string> {
        const tx = invokeScript({
            dApp: this.auctionContractAddress,
            call: { function: "sellBond" },
            chainId: this.chainId
        }, seed);

        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    public async executeLiquidationOrder(seed: string): Promise<string> {
        const tx = invokeScript({
            dApp: this.liquidationContract,
            call: { function: "liquidateBond" },
            chainId: this.chainId
        }, seed);

        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    public async transferToAuction(seed: string): Promise<string> {
        const tx = invokeScript({
            dApp: this.neutrinoContractAddress,
            call: { function: "transferToAuction" },
            chainId: this.chainId
        }, seed);

        await broadcast(tx, this.nodeUrl);
        await waitForTx(tx.id, {apiBase: this.nodeUrl });
        return tx.id;
    }
    
}
