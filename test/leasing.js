var deployHelper = require('../helpers/deployHelper.js');
let deployResult = {}

describe('Leasing test', async function () {
    before(async function () {
        setupAccounts({
            testAccount: 100000 * deployHelper.WAVELET
        })

        deployResult = await deployHelper.deploy("TST-N", "TST-NB", "test asset", "test bond asset", address(accounts.testAccount), 10)

        let amount = deployHelper.getRandomArbitrary(1, 99999) * deployHelper.WAVELET

        var massTx = massTransfer({
            transfers: [
                {
                    amount: amount,
                    recipient: address(deployResult.accounts.neutrinoContract)
                }
            ],
            fee: 500000
        }, env.SEED)
        await broadcast(massTx);
        await waitForTx(massTx.id);
    });
    it('Lease', async function () {
        const balanceWaves = await balance(address(deployResult.accounts.neutrinoContract))
        const amount = Math.floor(Math.floor(balanceWaves * 90 / 100) / 10)
        const leaseTx = lease({
            amount: amount,
            recipient: address(accounts.testAccount),
            fee: 500000,
            timestamp: Date.now() + 2400000
        }, deployResult.accounts.neutrinoContract)

        const tx = invokeScript({
            dApp: address(deployResult.accounts.neutrinoContract),
            call: {
                function: "registrationLeaseTx",
                args: [
                    { type: "string", value: leaseTx.senderPublicKey },
                    { type: "integer", value: leaseTx.fee },
                    { type: "integer", value: leaseTx.timestamp },
                    { type: "string", value: leaseTx.id }
                ]
            },
            payment: []
        }, accounts.testAccount);

        await broadcast(tx);
        await waitForTx(tx.id);

        await broadcast(leaseTx);
        await waitForTx(leaseTx.id);

        const state = await stateChanges(tx.id);
        const data = deployHelper.convertDataStateToObject(state.data)

        if (data["lease_tx_status_" + leaseTx.id] != "new")
            throw ("invalid status leasing tx")
        else if (data.leasing_amount != amount)
            throw ("invalid leasing amount")
    })
    it('Unlease', async function () {
        /*const dataAccount = await accountData(address(deployResult.accounts.neutrinoContract))

        const height = await currentHeight()
        const dataTx = data({
            data: [
                { key: "leasing_expire_block", value: height - 1 }
            ],
            fee: 500000
        }, deployResult.accounts.neutrinoContract);
        await broadcast(dataTx);
        await waitForTx(dataTx.id);

        const cancelLeaseTx = cancelLease({
            leaseId: dataAccount.lease_tx_hash.value,
            fee: 500000
        }, deployResult.accounts.neutrinoContract)

        await broadcast(cancelLeaseTx);
        await waitForTx(cancelLeaseTx.id);

        const tx = invokeScript({
            dApp: address(deployResult.accounts.neutrinoContract),
            call: {
                function: "registrationUnleaseTx",
                args: [
                    { type: "string", value: "R" },
                    { type: "string", value: cancelLeaseTx.senderPublicKey },
                    { type: "integer", value: cancelLeaseTx.fee },
                    { type: "integer", value: cancelLeaseTx.timestamp },
                    { type: "string", value: cancelLeaseTx.leaseId }
                ]
            },
            payment: []
        }, accounts.testAccount);

        await broadcast(tx);
        await waitForTx(tx.id);

        const state = await stateChanges(tx.id);
        const dataState = deployHelper.convertDataStateToObject(state.data)

        if (dataState["lease_tx_status_" + leaseTx.id] != "new")
            throw ("invalid status leasing tx")
        else if (dataState.leasing_amount != leaseTx.amount)
            throw ("invalid leasing amount")*/
    })
})