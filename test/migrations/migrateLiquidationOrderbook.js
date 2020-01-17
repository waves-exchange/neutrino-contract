const deployHelper = require('../../neutrino-api/ContractHelper.js').ContractHelper;
const neutrinoHelper = require('../../neutrino-api/NeutrinoApi.js').NeutrinoApi;
const oracleHelper = require('../../neutrino-api/OracleApi.js').OracleApi;
const testHelper = require('../../helpers/TestHelper.js');
var assert = require('assert')

let neutrinoApi = null;
let oracleApi = null;
let orderCount = 0;

describe('Migrate liquidation orderbook test', async function () {
    before(async function () {
        await setupAccounts({
            testAccount: 100 * neutrinoHelper.WAVELET,
            migrationContract: 100 * neutrinoHelper.WAVELET
        })

        orderCount = Math.floor(testHelper.getRandomNumber(3, 10))
        let orderbook = ""
        for(let i = 0; i < orderCount; i++){
            orderbook += i + "_"
        }

        const dataTx = data({
            data: [
                { key: "orderbook", value:orderbook },
            ],
            fee: 500000
        }, accounts.migrationContract);


        let contractFile = compile(file("../script/migrations/migrateLiquidationOrderbook.ride"))
        const contractTx = setScript({ script: contractFile, fee: 1000000 }, accounts.migrationContract);   
        await broadcast(dataTx) 
        await broadcast(contractTx);
        await waitForTx(contractTx.id)
        await waitForTx(dataTx.id)
    });

    it('Migrate first order', async function () {
            const contractState = await accountData(address(accounts.migrationContract))

            const tx = invokeScript({
                dApp: address(accounts.migrationContract),
                call: {
                    function: "migrateOrder",
                    args: []
                },
                payment: []
            }, accounts.testAccount);

            await broadcast(tx)
            await waitForTx(tx.id)

            const state = await stateChanges(tx.id);
            const stateObject = testHelper.convertDataStateToObject(state.data)

            let orderHash = contractState["orderbook"].value.split("_")[0] 

            assert.equal(stateObject["order_first"], orderHash, "invalid first order in list")

            assert.equal(stateObject["order_prev_"], "", "invalid prev order")
            assert.equal(stateObject["order_next_" + orderHash], "", "invalid next order")

            assert.equal(stateObject["order_last"], orderHash, "invalid last order in list")
    })

    it('Migrate next orders', async function () {
        for(let i = 0; i < orderCount-1; i++){
            const contractState = await accountData(address(accounts.migrationContract))

            const tx = invokeScript({
                dApp: address(accounts.migrationContract),
                call: {
                    function: "migrateOrder",
                    args: []
                },
                payment: []
            }, accounts.testAccount);

            await broadcast(tx)
            await waitForTx(tx.id)


            const txState = await stateChanges(tx.id);
            const txStateObject = testHelper.convertDataStateToObject(txState.data)
            const beforeLastOrder = contractState["order_last"].value

            let orderHash =  contractState["orderbook"].value.split("_")[0] 

            assert.equal(contractState["order_first"].value, txStateObject["order_first"], "invalid first order in list")

            assert.equal(txStateObject["order_prev_" + beforeLastOrder], orderHash, "invalid prev order")
            assert.equal(txStateObject["order_next_" + orderHash], beforeLastOrder, "invalid next order")

            assert.equal(txStateObject["order_last"], orderHash, "invalid last order in list")
        }
    })
          
})