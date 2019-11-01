# Neutrino: an algorithmic price-stable cryptocurrency protocol collateralized by native PoS token
This project contains several contracts:

* neutrino.ride - protocols's main smart contract (actions: swaps, bonds liquidation, leasing)
* control.ride - the smart contract for price oracles and emergency oracles actions
* auction.ride - the smart contract describing the bond auction in ordebook
* rpd.ride - (rewards payouts distribution) the smart contract implementing neutrino staking and staking payouts withdrawals by users


# Actors
* user - waves keeper users
* price oracles - 5 predetermined anonimous accounts providing market price feed to the blockchain
* pacemaker oracles - any account (bot) who is triggering transactions and processing complex computations and paying fees
* node - lPoS node for neutrino dApp which accumulates and distributes block rewards
* emergency oracles - 3 accounts who are able to stop protocol's operations and reactivate it

# Description of Callable methods

#### neutrino.ride:

* swapWavesToNeutrino() [called by user] - Instant swap WAVES to Neutrino token for current price on SC

* swapNeutrinoToWaves() [called by user] - Swap request Neutrino to WAVES. After {balanceLockInterval} blocks WAVES tokens will be available for withdraw with {withdraw(account : String)} method with price at the moment of {balanceLockInterval} has reached

* withdraw(account : String, index: Int) [called by user] - Withdraw WAVES from SC after {swapNeutrinoToWaves()} request is reached {balanceLockInterval} height with price at the moment of {balanceLockInterval} has reached.

* generateBond() [called by pacemaker oracles] - transfering bonds from main SC to auction.ride to fill 'buy bonds' orders. It's calling n-times untill all orders on auction.ride will be executed during deficit stage

* setOrder() [called by user] - Set 'bonds liquidation order' (bond -> neutrino 1:1 exchange) to the liquidation queue

* cancelOrder(orderId : String) [called by user] - Cancel 'bonds liquidation order' (bond -> neutrino 1:1 exchange) from the liquidation queue

* executeOrder() [called by pacemaker oracles] - Executing bond -> neutrino 1:1 exchange from the liquidation queue if SC has reached proficit in collateral cap. It's calling n-times untill all orders from the liquidation queue will be executed during proficit stage

* nodeReward() [called by node] Transfer neutrino tokens to the rpd.ride smart contact (rewards payouts distribution) generated from waves in the result of leasing profit

* transfer(account: String) [called by user] - transfer tokens from one address to another through smart contact

* registrationLeaseTx(senderPublicKey: String, fee: Int, timestamp: Int, leaseTxHash: String) [called by pacemaker oracles] - Start leasing tx registration of almost all amount of waves on the main smart contract to the node account. See @Verifier's LeaseTransaction of the current script

* cancelStuckLeaseTx(txHash: String) [called by pacemaker oracles] - Cancel leasing tx registration record. This method can be called only if appropriate LeaseTransaction never happend during time interval after registrationLeaseTx() call

* registrationUnleaseTx(chainIdString: String, senderPublicKey: String, fee: Int, timestamp: Int, leaseTxHash: String) [called by pacemaker oracles] - Registration unlease tx in the kv-storage. This method can be called only if appropriate LeaseCancelTransaction happend.


#### control.ride:

* setCurrentPrice(newPrice : Int) [called by price oracles] - Gathering prices from oracles during 5 min period

* finalizeCurrentPrice() [called by pacemaker oracles] - Computing avegarge price for current price feed

* vote(action: String) [called by emergency oracles] - Voting for STOP/REACTIVATION in case of emergency event


#### auction.ride:

* setOrder(price : Int, position: Int) [called by user] - Set buy bonds order

* cancelOrder(orderId : String) [called by user] - Cancel buy bonds order

* executeOrder() [called by pacemaker oracles] - Executing buy bonds orders from the bonds orderbook if SC has reached deficit in collateral cap. It's calling n-times untill all orders from the lbonds orderbook will be executed during deficit stage


#### rpd.ride:

* lockNeutrino() [called by user] - Start neutrino staking

* unlockNeutrino(unlockAmount: Int, assetIdString: String) [called by user] - Cancel neutrino staking

* withdraw(profitSyncIndex: Int, historyIndex: Int) [called by user] - Withdraw neutrino rewards from staking


# Inter-contracts dependencies

## By tokens transfers

* from [node] to neutrino.ride WAVES tokens & from [neutrino.ride] to [rpd.ride] Nutrino tokens by nodeReward()
* from [auction.ride] Neutrino tokens to [neutrino.ride] by executeOrder()
* from [neutrino.ride] Bond tokens to [auction.ride] by generateBond()

## By keys
* [neutrino.ride] from [control.ride] by key "getNumberByAddressAndKey(controlContract,PriceKey)" - Current price
* [neutrino.ride] from [control.ride] by key "getNumberByAddressAndKey(controlContract, PriceIndexKey)" - Current price index
* [neutrino.ride] from [control.ride] by key "getBoolByAddressAndKey(controlContract,IsBlockedKey)" - Current system status

* [neutrino.ride] from [rpd.ride] by key "getNumberByAddressAndKey(rpdContract, getRPDContractBalanceKey(assetId))"  - Current token balance
* [neutrino.ride] from [control.ride] by key "getNumberByAddressAndKey(rpdContract, getRPDContractBalanceKey(assetId))"  - Price at block
* [neutrino.ride] from [control.ride] by key "getNumberByAddressAndKey(rpdContract, getHeightPriceByIndexKey(index))"  - Price at index


* [auction.ride] from [neutrino.ride] by key "addressFromStringValue(getStringByKey(NeutrinoContractKey))" - Neutrino account from config
* [auction.ride] from [neutrino.ride] by key "addressFromStringValue(getStringByAddressAndKey(neutrinoContract, ControlContractKey))" - Control account from config
* [auction.ride] from [control.ride] by key "getNumberByAddressAndKey(controlContract, PriceKey)" - Current price
* [auction.ride] from [neutrino.ride] by key "getNumberByAddressAndKey(neutrinoContract, SwapLockedBalanceKey)" - заблокированный баланс для вывода в waves(поддержка старой логики вывода)
* [auction.ride] from [neutrino.ride] by key "getNumberByAddressAndKey(neutrinoContract, SwapNeutrinoLockedBalanceKey)" - заблокированный баланс для вывода в neutrino
* [auction.ride] from [neutrino.ride] by key "fromBase58String(getStringByAddressAndKey(neutrinoContract, NeutrinoAssetIdKey)" - neutrino asset id 
* [auction.ride] from [neutrino.ride] by key "fromBase58String(getStringByAddressAndKey(neutrinoContract, BondAssetIdKey))" - bond asset id


* [rpd.ride] from [neutrino.ride] by key "getStringByKey(NodeAddressKey)" - адрес ноды в которую лизяться средства
* [rpd.ride] from [neutrino.ride] by key "getStringByKey(NeutrinoContractKey)" - адрес neutrino contract 
* [rpd.ride] from [neutrino.ride] by key "fromBase58String(getStringByAddressAndKey(neutrinoContract, NeutrinoAssetIdKey))" - neutrino asset id 
* [rpd.ride] from [neutrino.ride] by key "getNumberByAddressAndKey(neutrinoContract, SyncIndexKey)" - номер следующего rpd чека(который будет напечатан в будущем)
* [rpd.ride] from [neutrino.ride] by key "getNumberByAddressAndKey(neutrinoContract, getSnapshotContractBalanceKey(count, assetId)" - Snapshot balance
* [rpd.ride] from [neutrino.ride] by key "getNumberByAddressAndKey(neutrinoContract, getProfitKey(count))" - Profit amount for payout


# *** Neutrino contests: Instruction ***
This little guide is aimed to help you interact with Neutrino smart contracts to experiment for the Neutrino contest: https://beta.ventuary.space/contests/e3a5a0f1-79e5-44d7-a930-b4e18e59529d/details 

## Step 1: Deploy Neutrino smart contracts on the testnet

#### 1. Install [Surfboard](https://github.com/wavesplatform/surfboard) for RIDE
Surfboard is a command line interface for working with RIDE programming language. Surfboard allows to compile RIDE scripts, deploy and run tests. Use NPM to install Surfboard on your machine: `npm install -g @waves/surfboard`

#### 2. Clone current repository
`git clone https://github.com/ventuary-lab/neutrino-contract/tree/contest`

#### 3. Put your Waves account seed into the smart contract
If you're creating your Waves account for the first time, we suggest using [Waves Keeper browser extension](https://wavesplatform.com/technology/keeper). Make sure that your Waves Keeper is set to the testnet mode and that the balance of your testnet account has at least 3 Waves left. To replenish the balance of testnet Waves token, you can use [Waves Faucet](https://wavesexplorer.com/testnet/faucet). In order to start deployment, please assign the *main seed of your Waves account* to the `mainSeed` variable in the file `test/deployNewNeutrinoAsset.js`.

#### 4. Make sure that your Surfboard is configured correctly
Your `surfboard.config.json` file has to point to a correct network ([testnet](https://docs.wavesplatform.com/en/waves-node/joining-testnet.html)). The `"defaultEnv"` key in the config object should be set to `"testnet"`. 

#### 5. Try to deploy a new asset onto the testnet
Use this command in your console: `surfboard test deployNewNeutrinoAsset.js`. The output of this command will provide you with the address of the deployed smart contracts, for example, *3Myqjf1D44wR8Vko4Tr5CwSzRNo2Vg9S7u7*. Save it somewhere - you will need this address for further experiments.
