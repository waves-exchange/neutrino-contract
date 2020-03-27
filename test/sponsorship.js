const WAVES_DECIMAL = 1e8

describe('some suite', () => {
    const seed = process.argv[1]

    it('logs something', async () => {
        // console.log('foo')

        const controlPrice = 90
        const increaseBy = (value, percent) => value + (percent / 100) * value

        const sponsorData = {
            assetId: '4uK8i4ThRGbehENwa6MxyLtxAjAo1Rj9fduborGExarC',
            minSponsoredAssetFee: increaseBy(controlPrice, 75) * 10,
            fee: 1400000,
            chainId: 'T',
        }

        const signedTx = sponsorship(sponsorData, seed)
        console.log(signedTx)

        try {
            const res = await broadcast(signedTx)
            console.log(res)
        } catch (err) {
            console.log(err)
        }
    })
})