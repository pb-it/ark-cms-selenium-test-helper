const assert = require('assert');
const webdriver = require('selenium-webdriver');
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

    it('#open filter', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        const window = app.getWindow();
        const tnb = window.getTopNavigationBar();

        await app.navigate('/data/movies');
        await TestHelper.delay(1000);

        var modal = await window.getTopModal();
        assert.equal(modal, null);
        await tnb.openApplyFilter();
        await TestHelper.delay(1000);
        modal = await window.getTopModal();
        assert.notEqual(modal, null);

        await modal.closeModal();
        await TestHelper.delay(1000);
        modal = await window.getTopModal();
        assert.equal(modal, null);

        return Promise.resolve();
    });

    it('#test search', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        const window = app.getWindow();
        const tnb = window.getTopNavigationBar();
        const sb = tnb.getSearchBox();

        await app.navigate('/data/movies');
        await TestHelper.delay(1000);

        const xpathPanel = `//*[@id="canvas"]/ul/li/div[contains(@class, 'panel')]`;
        var panels = await driver.findElements(webdriver.By.xpath(xpathPanel));
        assert.equal(panels.length, 5);

        await sb.search('pirate');
        await TestHelper.delay(1000);
        panels = await driver.findElements(webdriver.By.xpath(xpathPanel));
        assert.equal(panels.length, 1);
        const elements = await panels[0].findElements(webdriver.By.xpath('div/p'));
        assert.equal(elements.length, 1);
        const text = await elements[0].getText();
        assert.equal(text, 'Pirates of the Caribbean');

        return Promise.resolve();
    });
});