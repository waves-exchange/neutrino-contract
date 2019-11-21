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
var OracleApi = /** @class */ (function () {
    function OracleApi(nodeUrl, chainId, neutrinoContractAddress, auctionContractAddress, controlContractAddress, liquidationContract, neutrinoAssetId, bondAssetId) {
        this.neutrinoContractAddress = neutrinoContractAddress;
        this.nodeUrl = nodeUrl;
        this.chainId = chainId;
        this.auctionContractAddress = auctionContractAddress;
        this.controlContractAddress = controlContractAddress;
        this.neutrinoAssetId = neutrinoAssetId;
        this.bondAssetId = bondAssetId;
        this.liquidationContract = liquidationContract;
    }
    OracleApi.create = function (nodeUrl, chainId, neutrinoContractAddress) {
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
                        return [2 /*return*/, new OracleApi(nodeUrl, chainId, neutrinoContractAddress, auctionContractAddress, controlContractAddress, liquidationContract, neutrinoAssetId, bondAssetId)];
                }
            });
        });
    };
    OracleApi.prototype.getPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, waves_transactions_1.nodeInteraction.accountDataByKey(ControlContractKeys_1.ControlContractKeys.PriceKey, this.controlContractAddress, this.nodeUrl)];
                    case 1: return [2 /*return*/, (_a.sent()).value / 100];
                }
            });
        });
    };
    OracleApi.prototype.forceSetCurrentPrice = function (price, controlContractSeed) {
        return __awaiter(this, void 0, void 0, function () {
            var height, newIndexData, newIndex, dataTx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        price = Math.floor(price * 100);
                        return [4 /*yield*/, waves_transactions_1.nodeInteraction.currentHeight(this.nodeUrl)];
                    case 1:
                        height = _a.sent();
                        return [4 /*yield*/, waves_transactions_1.nodeInteraction.accountDataByKey(ControlContractKeys_1.ControlContractKeys.PriceIndexKey, this.controlContractAddress, this.nodeUrl)];
                    case 2:
                        newIndexData = _a.sent();
                        newIndex = 1;
                        if (newIndexData !== null)
                            newIndex = newIndexData.value + 1;
                        dataTx = waves_transactions_1.data({
                            data: [
                                { key: "price", value: price },
                                { key: 'price_' + height, value: price },
                                { key: 'is_pending_price', value: false },
                                { key: 'price_index', value: newIndex },
                                { key: 'price_index_' + newIndex, value: height }
                            ],
                            fee: 500000
                        }, controlContractSeed);
                        return [4 /*yield*/, waves_transactions_1.broadcast(dataTx, this.nodeUrl)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(dataTx.id, { apiBase: this.nodeUrl })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, dataTx.id];
                }
            });
        });
    };
    OracleApi.prototype.executeBuyBondOrder = function (seed) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.auctionContractAddress,
                            call: { "function": "sellBond" },
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
    OracleApi.prototype.executeLiquidationOrder = function (seed) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.liquidationContract,
                            call: { "function": "liquidateBond" },
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
    OracleApi.prototype.transferToAuction = function (seed) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = waves_transactions_1.invokeScript({
                            dApp: this.neutrinoContractAddress,
                            call: { "function": "transferToAuction" },
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
    OracleApi.WAVELET = (Math.pow(10, 8));
    OracleApi.PAULI = Math.pow(10, 2);
    return OracleApi;
}());
exports.OracleApi = OracleApi;
