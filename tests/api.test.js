//const path = require('path');
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

        var modal = await app.getTopModal();
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

    it('#test restart', async function () {
        this.timeout(120000);

        const snippet = `async function test() {
    controller.setRestartRequest();
    return Promise.resolve('OK');
};
module.exports = test;`;
        const ac = helper.getApiController();
        var response = await ac.getTools().serverEval(snippet);
        assert.equal(response, 'OK', 'Setting RestartRequest failed');

        response = await ac.getInfo();
        assert.equal(response['state'], 'openRestartRequest', 'Verifying RestartRequest failed');

        await ac.processOpenRestartRequest();

        var err;
        try {
            response = await ac.getInfo();
        } catch (error) {
            //console.log(error);
            err = error;
        }
        const app = helper.getApp();
        const api = await app.getApiUrl();
        assert.equal(err['message'], 'HttpError: 401: Unauthorized - ' + api + '/sys/info');

        await app.reload();
        await TestHelper.delay(1000);
        await app.login();
        await TestHelper.delay(1000);

        response = await ac.getInfo();
        assert.equal(response['state'], 'running', 'Verifying RestartRequest failed');

        return Promise.resolve();
    });

    it('#check read', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        const data = await app.read('_model');
        console.log(data);
        assert.equal(data.length > 0, true);

        return Promise.resolve();
    });
});