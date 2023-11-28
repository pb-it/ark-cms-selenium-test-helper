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

    it('#test eval', async function () {
        this.timeout(10000);

        const str = new Date().toISOString();
        const snippet = `const path = require('path');
const appRoot = controller.getAppRoot();
const Logger = require(path.join(appRoot, './src/common/logger/logger.js'));

async function test() {
    Logger.info('Date: ${str}');
    return Promise.resolve('OK');
};

module.exports = test;`;
        const response = await helper.getApiController().getTools().serverEval(snippet);
        assert.equal(response, 'OK', 'Response missmatch');

        const log = await helper.getApiController().getLog();
        assert(log.endsWith(`[INFO] Date: ${str}`));

        return Promise.resolve();
    });

    it('#test database backup/restore', async function () {
        this.timeout(120000);

        //TODO: take db ident

        const app = helper.getApp();
        const ac = helper.getApiController();
        const tools = ac.getTools();
        await tools.downloadBackup();

        const downloads = await helper.getBrowser().getDownloads();
        const file = downloads[0];
        console.log(file);
        assert.notEqual(file, undefined, 'Download failed');
        var i = 0;
        while (!fs.existsSync(file) && i < 5) {
            await TestHelper.delay(1000);
            i++;
        }

        await ac.clearDatabase();

        await ac.restart(true);
        await app.reload();
        await TestHelper.delay(1000);
        await app.login();
        await TestHelper.delay(1000);

        //TODO: verify new db

        await tools.restoreBackup(file);

        await ac.restart(true);
        await app.reload();
        await TestHelper.delay(1000);
        await app.login();
        await TestHelper.delay(1000);

        //TODO: confirm restored

        return Promise.resolve();
    });
});