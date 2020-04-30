const fs = require('fs');
const axios = require('axios')
const { sponsorship, broadcast, setScript, issue } = require('@waves/waves-transactions');
const { assert } = require('console');

const nodeUrl = 'https://testnode1.wavesnodes.com';
const WAVES_DECIMAL = 1e8;
const chainId = 'T';
const seed = 'tone repeat unlock increase slush expect element same river pretty pizza axis elegant split tornado'


describe('some suite', () => {
    const desiredPrice = 91;
    const upperBound = 75;
    let assetId = 'HzWJjh9Fzqq6LkN2CnYcvTC2RqBW5rv2P6zPBDEDKnDr'

    const checkComputedMinAssetFee = async (controlPrice) => {
        const increaseBy = (value, percent) => value + (percent / 100) * value;

        const sponsorData = {
            assetId: assetId,
            minSponsoredAssetFee: increaseBy(controlPrice, upperBound) * 10,
            chainId: 'T',
            fee: 100400000
        };

        const signedTx = sponsorship(sponsorData, seed);

        try {
            const res = await broadcast(signedTx, nodeUrl);
            console.log(res)
        } catch (err) {
            console.log(`Error: ${err}`);
        }
    };

    // it('create test asset', async () => {
    //     const params = {
    //         name: 'USDNTT',
    //         description: 'Testnet Neutrino',
    //         quantity: 1000000 * 1e6,
    //         reissuable: false,
    //         decimals: 6,
    //         chainId: chainId,
    //         fee: 100400000
    //     }

    //     const signedIssueTx = issue(params, seed)

    //     broadcast(signedIssueTx, nodeUrl)
    //         .then(res => {
    //             console.log(res)
    //             assetId = res.assetId
    //         })
    //         .catch(err => console.log(err))
    // })

    it('load script piece', async () => {
        const scriptfile = fs.readFileSync('script/neutrino.ride');
        const rawTextScript = scriptfile.toString();
        const priceRegexTemplate = '\\w+ mockedCurrentPrice \\= \\d+';
        const priceRegex = new RegExp(priceRegexTemplate);

        const priceMatch = rawTextScript.match(priceRegex)[0];
        const desiredPriceDeclaration = priceMatch.replace(/\d+/, '' + desiredPrice);

        const newTextScript = rawTextScript.replace(priceRegex, desiredPriceDeclaration);

        const compiledScript = await new Promise(resolve => {
            const path = '/utils/script/compileCode';

            axios.post(`${nodeUrl}${path}`, newTextScript)
                .then(response => {
                    resolve(response.data.script)
                })
                .catch(err => {
                    resolve(err)
                })
        })

        const params = {
            type: 13,
            fee: 1400000,
            script: compiledScript, //true
            chainId: chainId,
        };

        const signedTx = setScript(params, seed);

        try {
            const res = await broadcast(signedTx, nodeUrl);
            console.log(res)
        } catch (err) {
            console.log(`Error: ${err.message}`);
        }

        await checkComputedMinAssetFee(desiredPrice)
    });

    // it('check computed min asset fee', checkComputedMinAssetFee)
});
