"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var waves_transactions_1 = require("@waves/waves-transactions");
var NeutrinoContractKeys_1 = require("./contractKeys/NeutrinoContractKeys");
var ControlContractKeys_1 = require("./contractKeys/ControlContractKeys");
var seedUtils_1 = require("@waves/waves-transactions/dist/seedUtils");
var nodeInteraction_1 = require("@waves/waves-transactions/dist/nodeInteraction");
var OrderKeys_1 = require("./contractKeys/OrderKeys");
var NeutrinoApi = /** @class */ (function () {
    function NeutrinoApi(nodeUrl, chainId, neutrinoContractAddress, auctionContractAddress, controlContractAddress, liquidationContract, neutrinoAssetId, bondAssetId) {
        this.neutrinoContractAddress = neutrinoContractAddress;
        this.nodeUrl = nodeUrl;
        this.chainId = chainId;
        this.auctionContractAddress = auctionContractAddress;
        this.controlContractAddress = controlContractAddress;
        this.neutrinoAssetId = neutrinoAssetId;
        this.bondAssetId = bondAssetId;
        this.liquidationContract = liquidationContract;
    }
    NeutrinoApi.create = function (nodeUrl, chainId, neutrinoContractAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var accountDataState, auctionContractAddress, controlContractAddress, neutrinoAssetId, bondAssetId, liquidationContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, waves_transactions_1.nodeInteraction.accountData(neutrinoContractAddress, nodeUrl)];
                    case 1:
                        accountDataState = _a.sent();
                        auctionContractAddress = accountDataState[NeutrinoContractKeys_1.NeutrinoContractKeys.AuctionContractAddressKey].value;
                        controlContractAddress = accountDataState[NeutrinoContractKeys_1.NeutrinoContractKeys.ControlContractAddressKey].value;
                        neutrinoAssetId = accountDataState[NeutrinoContractKeys_1.NeutrinoContractKeys.NeutrinoAssetIdKey].value;
                        bondAssetId = accountDataState[NeutrinoContractKeys_1.NeutrinoContractKeys.BondAssetIdKey].value;
                        liquidationContract = accountDataState[NeutrinoContractKeys_1.NeutrinoContractKeys.LiquidationContractAddressKey].value;
                        return [2 /*return*/, new NeutrinoApi(nodeUrl, chainId, neutrinoContractAddress, auctionContractAddress, controlContractAddress, liquidationContract, neutrinoAssetId, bondAssetId)];
                }
            });
        });
    };
    NeutrinoApi.prototype.getPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, waves_transactions_1.nodeInteraction.accountDataByKey(ControlContractKeys_1.ControlContractKeys.PriceKey, this.controlContractAddress, this.nodeUrl)];
                    case 1: return [2 /*return*/, (_a.sent()).value / 100];
                }
            });
        });
    };
    NeutrinoApi.prototype.redeemWaves = function (neutrinoAmount, seed) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.neutrinoContractAddress,
                            call: { "function": "swapNeutrinoToWaves" },
                            chainId: this.chainId,
                            payment: [{ assetId: this.neutrinoAssetId, amount: neutrinoAmount }]
                        }, seed);
                        return [4 /*yield*/, waves_transactions_1.broadcast(tx, this.nodeUrl)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(tx.id, { apiBase: this.nodeUrl })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, tx.id];
                }
            });
        });
    };
    NeutrinoApi.prototype.issueNeutrino = function (wavesAmount, seed) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.neutrinoContractAddress,
                            call: { "function": "swapWavesToNeutrino" },
                            chainId: this.chainId,
                            payment: [{ assetId: null, amount: wavesAmount }]
                        }, seed);
                        return [4 /*yield*/, waves_transactions_1.broadcast(tx, this.nodeUrl)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(tx.id, { apiBase: this.nodeUrl })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, tx.id];
                }
            });
        });
    };
    NeutrinoApi.prototype.isPossibleWithdraw = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var contractData, unblockHeight, currentHeight;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, nodeInteraction_1.accountData(this.neutrinoContractAddress, this.nodeUrl)];
                    case 1:
                        contractData = _a.sent();
                        unblockHeight = contractData[NeutrinoContractKeys_1.NeutrinoContractKeys.PrefixBalanceUnlockBlock + address].value;
                        return [4 /*yield*/, waves_transactions_1.nodeInteraction.currentHeight(this.nodeUrl)];
                    case 2:
                        currentHeight = _a.sent();
                        return [2 /*return*/, unblockHeight > currentHeight];
                }
            });
        });
    };
    NeutrinoApi.prototype.withdraw = function (seed, assetId) {
        if (assetId === void 0) { assetId = null; }
        return __awaiter(this, void 0, void 0, function () {
            var userAddress, contractData, unblockHeight, wihdrawIndex, heightByindex, key, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userAddress = (new seedUtils_1.Seed(seed, this.chainId)).address;
                        return [4 /*yield*/, nodeInteraction_1.accountData({ address: this.controlContractAddress, match: NeutrinoContractKeys_1.NeutrinoContractKeys.PrefixPriceIndexKey + "([0-9]{1,7})" }, this.nodeUrl)];
                    case 1:
                        contractData = _a.sent();
                        return [4 /*yield*/, nodeInteraction_1.accountDataByKey(NeutrinoContractKeys_1.NeutrinoContractKeys.PrefixBalanceUnlockBlock + userAddress, this.neutrinoContractAddress, this.nodeUrl)];
                    case 2:
                        unblockHeight = (_a.sent()).value;
                        wihdrawIndex = 0;
                        heightByindex = 0;
                        for (key in contractData) {
                            if (contractData[key].value >= heightByindex && contractData[key].value < unblockHeight) {
                                wihdrawIndex = key.replace(NeutrinoContractKeys_1.NeutrinoContractKeys.PrefixPriceIndexKey, "");
                                heightByindex = contractData[key].value;
                            }
                        }
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.neutrinoContractAddress,
                            call: { "function": "withdraw", args: [
                                    { type: "string", value: userAddress },
                                    { type: "integer", value: wihdrawIndex },
                                    { type: "string", value: assetId == null ? "waves" : assetId }
                                ] },
                            chainId: this.chainId
                        }, seed);
                        return [4 /*yield*/, waves_transactions_1.broadcast(tx, this.nodeUrl)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(tx.id, { apiBase: this.nodeUrl })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, tx.id];
                }
            });
        });
    };
    NeutrinoApi.prototype.addLiquidationOrder = function (amount, seed) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.liquidationContract,
                            call: { "function": "addLiquidationOrder" },
                            payment: [{ assetId: this.bondAssetId, amount: amount }],
                            chainId: this.chainId
                        }, seed);
                        return [4 /*yield*/, waves_transactions_1.broadcast(tx, this.nodeUrl)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(tx.id, { apiBase: this.nodeUrl })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, tx.id];
                }
            });
        });
    };
    NeutrinoApi.prototype.addBuyBondOrder = function (amount, price, seed) {
        return __awaiter(this, void 0, void 0, function () {
            var auctionData, position, orders, i, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, nodeInteraction_1.accountData(this.auctionContractAddress, this.nodeUrl)];
                    case 1:
                        auctionData = _a.sent();
                        position = 0;
                        if (auctionData[OrderKeys_1.OrderKeys.OrderbookKey] !== undefined) {
                            orders = auctionData[OrderKeys_1.OrderKeys.OrderbookKey].value.split("_").filter(function (x) { return x != ""; });
                            position = orders.length;
                            for (i = orders.length - 1; i >= 0; i--) {
                                if (price > auctionData[OrderKeys_1.OrderKeys.OrderPriceKey + orders[i]].value)
                                    position = i;
                                else
                                    break;
                            }
                        }
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.auctionContractAddress,
                            call: { "function": "addBuyBondOrder", args: [{ type: "integer", value: price }, { type: "integer", value: position }] },
                            payment: [{ assetId: this.neutrinoAssetId, amount: amount }],
                            chainId: this.chainId
                        }, seed);
                        return [4 /*yield*/, waves_transactions_1.broadcast(tx, this.nodeUrl)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(tx.id, { apiBase: this.nodeUrl })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, tx.id];
                }
            });
        });
    };
    NeutrinoApi.prototype.cancelLiquidationOrder = function (orderId, seed) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.liquidationContract,
                            call: { "function": "cancelOrder", args: [{ type: "string", value: orderId }] },
                            chainId: this.chainId
                        }, seed);
                        return [4 /*yield*/, waves_transactions_1.broadcast(tx, this.nodeUrl)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(tx.id, { apiBase: this.nodeUrl })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, tx.id];
                }
            });
        });
    };
    NeutrinoApi.prototype.cancelBuyBondOrder = function (orderId, seed) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.auctionContractAddress,
                            call: { "function": "cancelOrder", args: [{ type: "string", value: orderId }] },
                            chainId: this.chainId
                        }, seed);
                        return [4 /*yield*/, waves_transactions_1.broadcast(tx, this.nodeUrl)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(tx.id, { apiBase: this.nodeUrl })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, tx.id];
                }
            });
        });
    };
    NeutrinoApi.WAVELET = (Math.pow(10, 8));
    NeutrinoApi.PAULI = Math.pow(10, 2);
    return NeutrinoApi;
}());
exports.NeutrinoApi = NeutrinoApi;
