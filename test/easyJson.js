const wvs = 10 ** 8;
let startJson = '{"index":0,"guid":"26f9c2f5-ab86-48b7-b1e9-d9f30e059692","isActive":false,"age":27,"eyeColor":"green","longitude":-123.305802,"tags":["dolore","ad","irure","Lorem","fugiat","anim","voluptate"],"friends":[{"id":0,"name":"Becker Raymond"},{"id":1,"name":"Cain Bright"},{"id":2,"name":"Sheppard Bridges"}],"greeting":{"a":"1","b":{"c":"sss"}},"favoriteFruit":"banana"}'
let json = ''
describe('Deploy', async function () {
    before(async function () {
        await setupAccounts(
            {
                contract: 3 * wvs,
                account: 1 * wvs
            }
        );
        
        const scriptContract = compile(file('../easyJson.ride'));
        const setScriptTx = setScript({ script: scriptContract }, accounts.contract);
        await broadcast(setScriptTx);
        await waitForTx(setScriptTx.id)
    });
    it('TestJson', async function () {
        json = startJson
        const jsonTestTx = invokeScript({
            dApp: address(accounts.contract),
            call: {
                function: "get", args:[
                    { type:"string", value: json },
                    { type:"string", value: "greeting" }
                ]
            },
        }, accounts.accountOne);
    
        await broadcast(jsonTestTx);
        await waitForTx(jsonTestTx.id);
        
        let state = await stateChanges(jsonTestTx.id);

        json = state.data[0].value
        console.log(state.data[0].value)

    });
    it('TestJson2', async function () {
        json = '{"a":{"b":{}}zxczadasd}'
        const jsonTestTx = invokeScript({
            dApp: address(accounts.contract),
            call: {
                function: "get", args:[
                    { type:"string", value: json },
                    { type:"string", value: "a" }
                ]
            },
        }, accounts.accountOne);
    
        await broadcast(jsonTestTx);
        await waitForTx(jsonTestTx.id);
        
        let state = await stateChanges(jsonTestTx.id);

        json = state.data[0].value
        console.log(state.data[0].value)

    })
})
