const path = require('path');
const fs = require('fs');

const assert = require('assert');
//const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');

const config = require('./config/test-config.js');
const TestHelper = require('../src/test-helper.js');

describe('Testsuit', function () {

    let driver;

    before('#setup', async function () {
        this.timeout(10000);

        if (!global.helper) {
            global.helper = new TestHelper();
            await helper.setup(config);
        }
        driver = helper.getBrowser().getDriver();
        const app = helper.getApp();
        await TestHelper.delay(1000);

        await app.prepare(config['api'], config['username'], config['password']);
        await TestHelper.delay(1000);

        const modal = await app.getWindow().getTopModal();
        assert.equal(modal, null);

        return Promise.resolve();
    });

    /*after('#teardown', async function () {
        return driver.quit();
    });*/

    afterEach(function () {
        if (global.allPassed)
            allPassed = allPassed && (this.currentTest.state === 'passed');
    });

    it('#install extension', async function () {
        this.timeout(30000);

        const ext = 'echo';
        const file = path.resolve(__dirname, "./tmp/" + ext + ".zip");
        if (fs.existsSync(file)) {
            const app = helper.getApp();
            await app.getExtensionController().addExtension(ext, file, true);

            await app.reload();
            await TestHelper.delay(1000);

            await app.login();
            await TestHelper.delay(1000);

            const modal = await app.getWindow().getTopModal();
            assert.equal(modal, null);

            const response = await driver.executeAsyncScript(async () => {
                const callback = arguments[arguments.length - 1];

                const controller = app.getController();
                const ac = controller.getApiController();
                const client = ac.getApiClient();
                const res = await client.request('POST', '/api/ext/echo', null, 'hello world');
                callback(res);
            });
            assert.equal(response, 'hello world');
        } else
            this.skip();

        return Promise.resolve();
    });

    it('#delete extension', async function () {
        this.timeout(30000);

        const ext = 'echo';
        const app = helper.getApp();
        const ds = app.getDataService();
        var data = await ds.read('_extension', null, 'name=' + ext);
        if (data.length == 1) {
            const app = helper.getApp();
            await app.getExtensionController().deleteExtension(ext, true);

            data = await ds.read('_extension', null, 'name=' + ext);
            assert.ok(data.length == 0);

            /*const response = await driver.executeAsyncScript(async () => {
                const callback = arguments[arguments.length - 1];

                const controller = app.getController();
                const ac = controller.getApiController();
                const client = ac.getApiClient();
                const res = await client.request('POST', '/api/ext/echo', null, 'hello world');
                callback(res);
            });
            assert.equal(response, 'hello world');*/
        } else
            this.skip();

        return Promise.resolve();
    });
});