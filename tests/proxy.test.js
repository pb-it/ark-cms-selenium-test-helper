const selProxy = require('selenium-webdriver/proxy');
const BrowserMob = require('browsermob-proxy-client');

const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');

const config = require('./config/test-config.js');
const TestHelper = require('../src/test-helper.js');

describe('Testsuit', function () {

    let driver;

    /*before('#setup', async function () {
        this.timeout(30000);

        return Promise.resolve();
    });*/

    /*after('#teardown', async function () {
        return driver.quit();
    });*/

    afterEach(function () {
        if (global.allPassed)
            allPassed = allPassed && (this.currentTest.state === 'passed');
    });

    xit('#proxy', async function () {
        this.timeout(30000);

        const conf = {
            browserMob: { // *optional* details on where browsermob is running
                host: 'localhost',
                port: 8080,
                protocol: 'http'
            },
            proxy: { // *optional*
                trustAllServers: true,
                port: 8081,
                //bindAddress: `127.0.0.1`
            }
        };
        const defaultProxy = BrowserMob.createClient(conf);
        await defaultProxy.start();

        if (global.helper)
            await helper.teardown();
        else
            global.helper = new TestHelper();

        if (config['browser']['arguments']) {
            var bFound = false;
            for (var arg of config['browser']['arguments']) {
                if (arg === 'ignore-certificate-errors') {
                    bFound = true;
                    break;
                }
            }
            if (!bFound)
                config['browser']['arguments'].push('ignore-certificate-errors');
        } else
            config['browser']['arguments'] = ['ignore-certificate-errors', 'disable-web-security', 'allow-insecure-localhost', 'allow-running-insecure-content'];
        config['browser']['proxy'] = selProxy.manual({
            http: 'localhost:' + defaultProxy.proxy.port,
            https: 'localhost:' + defaultProxy.proxy.port
        });

        await helper.setup(config);
        driver = helper.getBrowser().getDriver();
        await TestHelper.delay(1000);

        const opt = {
            'captureHeaders': true,
            'captureContent': true,
            'captureBinaryContent': true
        };
        await defaultProxy.createHar(opt);

        //await driver.get(config['host']);
        await driver.get('https://example.com/');
        await TestHelper.delay(1000);

        const har = await defaultProxy.getHar();
        //console.log(har);
        assert.equal(har['log']['pages'].length, 1);
        //console.log(har['log']['entries'].length);
        var bFound = false;
        for (var ent of har['log']['entries']) {
            //console.log(ent);
            //console.log(ent['request']['url']);
            if (ent['request']['url'] === 'https://example.com/') { // config['host']
                bFound = true;
                break;
            }
        }
        assert.ok(bFound);

        await defaultProxy.closeProxies();
        await defaultProxy.end();

        await helper.teardown();
        global.helper = null;

        return Promise.resolve();
    });
});