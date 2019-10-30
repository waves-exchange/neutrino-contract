# Neutrino: an algorithmic price-stable cryptocurrency protocol collateralized by WAVES token
This project contains several contracts:

* auction.ride - the smart contract implementing the Neutrino Bond auction
* neutrino.ride - Neutrino's main contract

# Description of Callable methods
#### Auction:
* setOrder(price : Int, position: Int) - set the order into a specified position
* cancelOrder(orderId : String) - cancel the order
* executeOrder() - execute the order (sell Token-NB)

#### Neutrino:
* setCurrentPrice(newPrice : Int) - to set the price (available only to oracles)
* finalizeCurrentPrice() - finalize the price supplied by the oracles
* adminUnlock(newPrice : Int) - unlock the platform with the specified price (it will be unlocked if 2/3 of admins voted)
* adminLock() - lock the platform (it will be locked if 2/3 of admins voted)
* swapWavesToNeutrino() - swap waves for neutrino
* swapNeutrinoToWaves() - swap neutrino for waves
* withdraw(account : String) - withdraw from the contract
* generateBond() - generate Neutrino Bond
* setOrder() - set an order to liquidate the Neutrino Bond
* cancelOrder(orderId : String) - cancel the liquidation order
* executeOrder() - execute the first Neutrino Bond liquidation order


# Neutrino contests: Instruction
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
