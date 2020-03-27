const fs = require('fs');
const axios = require('axios')
const { sponsorship, broadcast, setScript } = require('@waves/waves-transactions');
const { assert } = require('console');

const nodeUrl = 'https://testnode1.wavesnodes.com';
const WAVES_DECIMAL = 1e8;
const chainId = 'T';
const seed = 'foil'

describe('some suite', () => {
    const desiredPrice = 93;

    const checkComputedMinAssetFee = async () => {
        const controlPrice = desiredPrice;
        const increaseBy = (value, percent) => value + (percent / 100) * value;

        const sponsorData = {
            assetId: '3yfJtVTEqsQUpNLGz4ztJmMgEsCCoyjCFx8VphKn3ZWc',
            minSponsoredAssetFee: increaseBy(controlPrice, 75) * 10,
            chainId: 'T',
        };

        const signedTx = sponsorship(sponsorData, seed);

        try {
            const res = await broadcast(signedTx, nodeUrl);
            console.log(res)
        } catch (err) {
            console.log(`Error: ${err.message}`);
        }
    };

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

        await checkComputedMinAssetFee()
    });
    // it('check computed min asset fee', checkComputedMinAssetFee)
});
