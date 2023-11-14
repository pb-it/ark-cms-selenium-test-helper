const assert = require('assert');
const webdriver = require('selenium-webdriver');

const config = require('./config.js');
const TestHelper = require('../src/test-helper.js');

describe('Testsuit', function () {

    let helper;
    let driver;

    before('#setup', async function () {
        this.timeout(10000);

        helper = new TestHelper();
        await helper.setup(config);
        driver = helper.getBrowser().getDriver();

        await TestHelper.delay(1000);

        return Promise.resolve();
    });

    after('#teardown', async function () {
        return driver.quit();
    });

    it('#login', async function () {
        this.timeout(10000);

        const title = 'WING-CMS';
        var tmp = await driver.getTitle();
        assert.equal(tmp, title, 'Title missmatch');

        await helper.login();

        await TestHelper.delay(1000);

        var modal = await helper.getTopModal();
        assert.equal(modal == null, true);

        return Promise.resolve();
    });

});