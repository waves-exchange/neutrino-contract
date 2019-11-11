class LiquidationHelper{
    liquidationData;
    constructor(liquidationData){
        this.liquidationData = liquidationData;
    }
    getHashByIndex(index) {
        return this.liquidationData.orderbook.value.split("_")[index]
    }
    geTotalByHash(hash){
        return this.liquidationData["order_total_" + hash].value
    }
    getOwnerByHash(hash){
        return this.liquidationData["order_owner_" + hash].value
    }
    getStatusByHash(hash){
        return this.liquidationData["order_status_" + hash].value
    }
}

module.exports.LiquidationHelper = LiquidationHelper