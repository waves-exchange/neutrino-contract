const wvs = 10 ** 8;

const symbolNeutrino = "BTC-N"
const symbolBond = "BTC-NB"
const descriptionNeutrino = "Bitcoin neutrino asset" 
const descriptionBond = "Bitcoin neutrino bond asset" 

const accounts = 
    {
        auctionContract: "",
        neutrinoContract: "",
        rpdContract: ""
    }
describe('Deploy', async function () {
    before(async function () {
       
    });
    it('Finalizing', async function () { 
        const scriptNeutrino = compile(file('../script/neutrino.ride'));
        const setScriptNeutrino = setScript({ script: scriptNeutrino, fee: 1400000 ,}, accounts.neutrinoContract);
        await broadcast(setScriptNeutrino);
        await waitForTx(setScriptNeutrino.id)

        const scriptAuction = compile(file('../script/auction.ride'));
        const setScriptAuctionTx = setScript({ script: scriptAuction, fee: 1400000,}, accounts.auctionContract);        
        await broadcast(setScriptAuctionTx);
        await waitForTx(setScriptAuctionTx.id)

        const scriptRPD = compile(file('../script/rpd.ride'));
        const setScriptRPDTx = setScript({ script: scriptRPD, fee: 1400000,}, accounts.rpdContract);        
        await broadcast(setScriptRPDTx);
        await waitForTx(setScriptRPDTx.id)
    })
})
