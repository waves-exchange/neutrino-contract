class AuctionHelper{
    auctionData;
    constructor(auctionData){
        this.auctionData = auctionData;
    }
    getIndexByPrice(price) {
        if(this.auctionData["orderbook"] === undefined)
            return 0;
        
        let orders = this.auctionData.orderbook.value.split("_").filter(x=>x != "");
        let index = orders.length;
        for(let i = orders.length-1; i >= 0; i--){
            if(price > this.getPriceByHash(orders[i]))
                index = i;
            else   
                break;
        }   
        return index;
    }
    getHashByIndex(index) {
        return this.auctionData.orderbook.value.split("_")[index]
    }
    getPriceByHash(hash){
        return this.auctionData["order_price_" + hash].value
    }
    geTotalByHash(hash){
        return this.auctionData["order_total_" + hash].value
    }
    getOwnerByHash(hash){
        return this.auctionData["order_owner_" + hash].value
    }
    getStatusByHash(hash){
        return this.auctionData["order_status_" + hash].value
    }
 
}


module.exports.AuctionHelper = AuctionHelper