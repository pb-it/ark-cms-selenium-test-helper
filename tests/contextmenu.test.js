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

    it('#test context menu', async function () {
        this.timeout(30000);

        const app = helper.getApp();
        await app.setDebugMode(true);
        const window = app.getWindow();

        const sidemenu = window.getSideMenu();
        await sidemenu.click('Data');
        await TestHelper.delay(1000);
        var menu = await sidemenu.getEntry('other');
        if (menu) {
            await sidemenu.click('other');
            await TestHelper.delay(1000);
        }
        await sidemenu.click('_user');
        await TestHelper.delay(1000);
        await sidemenu.click('Show');
        await TestHelper.delay(1000);
        await sidemenu.click('All');
        await TestHelper.delay(1000);

        const xpathPanel = `//*[@id="canvas"]/ul/li/div[contains(@class, 'panel')]`;
        var panels = await driver.findElements(webdriver.By.xpath(xpathPanel));
        assert.equal(panels.length, 1);

        var contextmenu = await window.openContextMenu(panels[0]);
        await TestHelper.delay(1000);
        await contextmenu.click('Details');
        await TestHelper.delay(1000);

        var modal = await window.getTopModal();
        xpath = `//p[text()="admin"]`;
        item = await driver.wait(webdriver.until.elementLocated({ 'xpath': xpath }), 1000);

        await modal.closeModal();
        modal = await window.getTopModal();
        assert.equal(modal, null);

        contextmenu = await window.openContextMenu(panels[0]);
        await TestHelper.delay(1000);
        await contextmenu.click('Show');
        await TestHelper.delay(1000);
        await contextmenu.click('roles');
        await TestHelper.delay(1000);

        const url = await driver.getCurrentUrl();
        assert.equal(url.endsWith('/data/_role?users_any=1'), true);

        return Promise.resolve();
    });
});