const path = require('path');
const fs = require('fs');

const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');

const itif = (condition) => condition ? it : it.skip;

const config = require('./config/test-config.js');
const TestHelper = require('../src/test-helper.js');

describe('Testsuit - Proxy', function () {

    let bSetup;
    let driver;

    before('#setup', async function () {
        this.timeout(30000);

        if (config['proxy']) {
            if (!global.allPassed)
                global.allPassed = true;

            if (!global.helper) {
                global.helper = new TestHelper();
                bSetup = true;
            }/* else {
            //await helper.teardown();
            //await helper.getBrowser().teardown();
        }*/

            const requiredArgs = ['proxy-bypass-list=<-loopback>', 'ignore-certificate-errors'];
            //const requiredArgs = ['proxy-bypass-list=<-loopback>', 'ignore-certificate-errors', 'disable-web-security', 'allow-insecure-localhost', 'allow-running-insecure-content']
            if (config['browser']['arguments']) {
                var bFound;
                for (var arg of requiredArgs) {
                    bFound = false;
                    for (var a of config['browser']['arguments']) {
                        if (a === arg) {
                            bFound = true;
                            break;
                        }
                    }
                    if (!bFound)
                        config['browser']['arguments'].push(arg);
                }
            } else
                config['browser']['arguments'] = requiredArgs;

            await helper.setup(config, true);
            driver = helper.getBrowser().getDriver();
            const app = helper.getApp();
            await TestHelper.delay(1000);

            await app.prepare(config['api'], config['username'], config['password']);
            await TestHelper.delay(1000);

            const modal = await app.getWindow().getTopModal();
            assert.equal(modal, null);
        }

        return Promise.resolve();
    });

    after('#teardown', async function () {
        if (helper && bSetup && global.allPassed) {
            await helper.teardown();
            global.helper = null;
        }
        return Promise.resolve();
        //return driver.quit();
    });

    afterEach(function () {
        if (global.allPassed)
            allPassed = allPassed && (this.currentTest.state === 'passed'); // || this.currentTest.state === 'pending'
    });

    /**
     * 'ignore-certificate-errors'
     */
    itif(config['proxy'])('#proxy example.com', async function () {
        this.timeout(30000);

        const proxy = helper.getProxy();
        await proxy.startHar();

        await driver.get('https://example.com/');
        await TestHelper.delay(1000);

        const har = await proxy.endHar();
        //console.log(har);
        assert.equal(har['log']['pages'].length, 1);
        //console.log(har['log']['entries'].length);
        var bFound = false;
        for (var ent of har['log']['entries']) {
            //console.log(ent);
            //console.log(ent['request']['url']);
            if (ent['request']['url'] === 'https://example.com/') {
                bFound = true;
                break;
            }
        }
        assert.ok(bFound);

        return Promise.resolve();
    });

    /**
     * 'proxy-bypass-list=<-loopback>'
     */
    itif(config['proxy'])('#proxy host/localhost', async function () {
        this.timeout(30000);

        const proxy = helper.getProxy();
        const opt = {
            'captureHeaders': true,
            'captureContent': true,
            'captureBinaryContent': true
        };
        await proxy.startHar(opt);

        await driver.get(config['host']);
        await TestHelper.delay(1000);

        const har = await proxy.endHar();
        //console.log(har);
        fs.writeFileSync(path.resolve(__dirname, `./tmp/har.json`), JSON.stringify(har, null, '\t'));
        assert.equal(har['log']['pages'].length, 1);
        //console.log(har['log']['entries'].length);
        var bFound = false;
        for (var ent of har['log']['entries']) {
            //console.log(ent);
            //console.log(ent['request']['url']);
            if (ent['request']['url'] === config['host'] + '/') {
                bFound = true;
                break;
            }
        }
        assert.ok(bFound);

        return Promise.resolve();
    });
});