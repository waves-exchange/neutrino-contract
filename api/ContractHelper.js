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
var fs_1 = require("fs");
var ride_js_1 = require("@waves/ride-js");
var ContractHelper = /** @class */ (function () {
    function ContractHelper() {
    }
    ContractHelper.deploy = function (distributorSeed, nodeUrl, chainId, dirScriptsPath, symbolNeutrino, symbolBond, descriptionNeutrino, descriptionBond, nodeAddress, nodeOracleProvider, leasingInterval) {
        if (nodeOracleProvider === void 0) { nodeOracleProvider = nodeAddress; }
        if (leasingInterval === void 0) { leasingInterval = 10080; }
        return __awaiter(this, void 0, void 0, function () {
            var deployInfo, massTx, oraclesAddress, i, adminsAddress, i, issueTx, issueBondTx, neutrinoDataTx, auctionDataTx, liquidationDataTx, controlDataTx, rpdDataTx, scriptNeutrinoContract, setScriptNeutrinoTx, scriptLiquidationContract, setScriptLiquidationTx, scriptAuctionContract, setScriptAuctionTx, scriptControlContract, setScriptControlTx, scriptRPDContract, setScriptRPDTx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deployInfo = {
                            accounts: {
                                oracles: Array(5).fill(null).map(function () { return new waves_transactions_1.seedUtils.Seed(waves_transactions_1.seedUtils.generateNewSeed(), chainId); }),
                                admins: Array(5).fill(null).map(function () { return new waves_transactions_1.seedUtils.Seed(waves_transactions_1.seedUtils.generateNewSeed(), chainId); }),
                                auctionContract: new waves_transactions_1.seedUtils.Seed(waves_transactions_1.seedUtils.generateNewSeed(), chainId),
                                neutrinoContract: new waves_transactions_1.seedUtils.Seed(waves_transactions_1.seedUtils.generateNewSeed(), chainId),
                                rpdContract: new waves_transactions_1.seedUtils.Seed(waves_transactions_1.seedUtils.generateNewSeed(), chainId),
                                controlContract: new waves_transactions_1.seedUtils.Seed(waves_transactions_1.seedUtils.generateNewSeed(), chainId),
                                liquidationContract: new waves_transactions_1.seedUtils.Seed(waves_transactions_1.seedUtils.generateNewSeed(), chainId)
                            },
                            assets: {
                                neutrinoAssetId: null,
                                bondAssetId: null
                            }
                        };
                        massTx = waves_transactions_1.massTransfer({
                            transfers: [
                                {
                                    amount: 1500000,
                                    recipient: deployInfo.accounts.auctionContract.address
                                },
                                {
                                    amount: 201500000,
                                    recipient: deployInfo.accounts.neutrinoContract.address
                                },
                                {
                                    amount: 1500000,
                                    recipient: deployInfo.accounts.rpdContract.address
                                },
                                {
                                    amount: 1500000,
                                    recipient: deployInfo.accounts.controlContract.address
                                },
                                {
                                    amount: 1500000,
                                    recipient: deployInfo.accounts.liquidationContract.address
                                }
                            ],
                            fee: 800000
                        }, distributorSeed);
                        return [4 /*yield*/, waves_transactions_1.broadcast(massTx, nodeUrl)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(massTx.id, { apiBase: nodeUrl })];
                    case 2:
                        _a.sent();
                        oraclesAddress = "";
                        for (i = 0; i < deployInfo.accounts.oracles.length; i++) {
                            if (oraclesAddress != "")
                                oraclesAddress += ",";
                            oraclesAddress += deployInfo.accounts.oracles[i].address;
                        }
                        adminsAddress = "";
                        for (i = 0; i < deployInfo.accounts.admins.length; i++) {
                            if (adminsAddress != "")
                                adminsAddress += ",";
                            adminsAddress += deployInfo.accounts.admins[i].address;
                        }
                        issueTx = waves_transactions_1.issue({
                            name: symbolNeutrino,
                            description: descriptionNeutrino,
                            quantity: "100000000000000",
                            decimals: 2,
                            chainId: chainId
                        }, deployInfo.accounts.neutrinoContract.phrase);
                        deployInfo.assets.neutrinoAssetId = issueTx.id;
                        issueBondTx = waves_transactions_1.issue({
                            name: symbolBond,
                            description: descriptionBond,
                            quantity: "1000000000000",
                            decimals: 0,
                            chainId: chainId
                        }, deployInfo.accounts.neutrinoContract.phrase);
                        deployInfo.assets.bondAssetId = issueBondTx.id;
                        neutrinoDataTx = waves_transactions_1.data({
                            data: [
                                { key: "control_contract", value: deployInfo.accounts.controlContract.address },
                                { key: 'neutrino_asset_id', value: deployInfo.assets.neutrinoAssetId },
                                { key: 'bond_asset_id', value: deployInfo.assets.bondAssetId },
                                { key: 'auction_contract', value: deployInfo.accounts.auctionContract.address },
                                { key: "min_waves_swap_amount", value: 100000000 },
                                { key: "min_neutrino_swap_amount", value: 10000 },
                                { key: "balance_waves_lock_interval", value: 1 },
                                { key: "balance_neutrino_lock_interval", value: 5 },
                                { key: 'rpd_contract', value: deployInfo.accounts.rpdContract.address },
                                { key: "liquidation_contract", value: deployInfo.accounts.liquidationContract.address },
                                { key: 'node_oracle_provider', value: nodeOracleProvider }
                            ],
                            fee: 500000
                        }, deployInfo.accounts.neutrinoContract.phrase);
                        auctionDataTx = waves_transactions_1.data({
                            data: [
                                { key: 'neutrino_contract', value: deployInfo.accounts.neutrinoContract.address },
                            ],
                            fee: 500000
                        }, deployInfo.accounts.auctionContract.phrase);
                        liquidationDataTx = waves_transactions_1.data({
                            data: [
                                { key: 'neutrino_contract', value: deployInfo.accounts.neutrinoContract.address },
                            ],
                            fee: 500000
                        }, deployInfo.accounts.liquidationContract.phrase);
                        controlDataTx = waves_transactions_1.data({
                            data: [
                                { key: "price_offset", value: 1000000 },
                                { key: "providing_interval", value: 5 },
                                { key: 'oracles', value: oraclesAddress },
                                { key: 'admins', value: adminsAddress },
                                { key: 'coefficient_oracle', value: 3 },
                                { key: 'coefficient_admin', value: 3 },
                                { key: 'script_update_interval', value: 30 },
                                { key: 'price', value: 100 }
                            ],
                            fee: 500000
                        }, deployInfo.accounts.controlContract.phrase);
                        rpdDataTx = waves_transactions_1.data({
                            data: [
                                { key: 'neutrino_contract', value: deployInfo.accounts.neutrinoContract.address },
                            ],
                            fee: 500000
                        }, deployInfo.accounts.rpdContract.phrase);
                        return [4 /*yield*/, waves_transactions_1.broadcast(issueTx, nodeUrl)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.broadcast(issueBondTx, nodeUrl)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.broadcast(auctionDataTx, nodeUrl)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.broadcast(liquidationDataTx, nodeUrl)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.broadcast(neutrinoDataTx, nodeUrl)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.broadcast(controlDataTx, nodeUrl)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.broadcast(rpdDataTx, nodeUrl)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, ride_js_1.compile(fs_1.readFileSync(dirScriptsPath + "neutrino.ride", 'utf8'))];
                    case 10:
                        scriptNeutrinoContract = (_a.sent()).result.base64;
                        setScriptNeutrinoTx = waves_transactions_1.setScript({ script: scriptNeutrinoContract, fee: 1000000, chainId: chainId }, deployInfo.accounts.neutrinoContract.phrase);
                        return [4 /*yield*/, waves_transactions_1.broadcast(setScriptNeutrinoTx, nodeUrl)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, ride_js_1.compile(fs_1.readFileSync(dirScriptsPath + "liquidation.ride", 'utf8'))];
                    case 12:
                        scriptLiquidationContract = (_a.sent()).result.base64;
                        setScriptLiquidationTx = waves_transactions_1.setScript({ script: scriptLiquidationContract, fee: 1000000, chainId: chainId }, deployInfo.accounts.liquidationContract.phrase);
                        return [4 /*yield*/, waves_transactions_1.broadcast(setScriptLiquidationTx, nodeUrl)];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, ride_js_1.compile(fs_1.readFileSync(dirScriptsPath + "auction.ride", 'utf8'))];
                    case 14:
                        scriptAuctionContract = (_a.sent()).result.base64;
                        setScriptAuctionTx = waves_transactions_1.setScript({ script: scriptAuctionContract, fee: 1000000, chainId: chainId }, deployInfo.accounts.auctionContract.phrase);
                        return [4 /*yield*/, waves_transactions_1.broadcast(setScriptAuctionTx, nodeUrl)];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, ride_js_1.compile(fs_1.readFileSync(dirScriptsPath + "control.ride", 'utf8'))];
                    case 16:
                        scriptControlContract = (_a.sent()).result.base64;
                        setScriptControlTx = waves_transactions_1.setScript({ script: scriptControlContract, fee: 1000000, chainId: chainId }, deployInfo.accounts.controlContract.phrase);
                        return [4 /*yield*/, waves_transactions_1.broadcast(setScriptControlTx, nodeUrl)];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, ride_js_1.compile(fs_1.readFileSync(dirScriptsPath + "rpd.ride", 'utf8'))];
                    case 18:
                        scriptRPDContract = (_a.sent()).result.base64;
                        setScriptRPDTx = waves_transactions_1.setScript({ script: scriptRPDContract, fee: 1000000, chainId: chainId }, deployInfo.accounts.rpdContract.phrase);
                        return [4 /*yield*/, waves_transactions_1.broadcast(setScriptRPDTx, nodeUrl)];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(issueTx.id, { apiBase: nodeUrl })];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(issueBondTx.id, { apiBase: nodeUrl })];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(auctionDataTx.id, { apiBase: nodeUrl })];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(liquidationDataTx.id, { apiBase: nodeUrl })];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(neutrinoDataTx.id, { apiBase: nodeUrl })];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(controlDataTx.id, { apiBase: nodeUrl })];
                    case 25:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(rpdDataTx.id, { apiBase: nodeUrl })];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(setScriptNeutrinoTx.id, { apiBase: nodeUrl })];
                    case 27:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(setScriptAuctionTx.id, { apiBase: nodeUrl })];
                    case 28:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(setScriptLiquidationTx.id, { apiBase: nodeUrl })];
                    case 29:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(setScriptControlTx.id, { apiBase: nodeUrl })];
                    case 30:
                        _a.sent();
                        return [4 /*yield*/, waves_transactions_1.waitForTx(setScriptRPDTx.id, { apiBase: nodeUrl })];
                    case 31:
                        _a.sent();
                        return [2 /*return*/, deployInfo];
                }
            });
        });
    };
    return ContractHelper;
}());
exports.ContractHelper = ContractHelper;
