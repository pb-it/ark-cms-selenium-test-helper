const assert = require('assert');
const webdriver = require('selenium-webdriver');

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

    it('#check API', async function () {
        if (helper.getConfig()['api']) {
            this.timeout(10000);

            const api = await helper.getApp().getApiUrl(true);
            console.log(api);
            assert.equal(api, config['api'], 'API missmatch'); // helper.getConfig()['api']
        } else
            this.skip();
        return Promise.resolve();
    });

    it('#reset LocalStorage', async function () {
        this.timeout(10000);

        const app = await helper.getApp();
        const backup = await app.getApiUrl();
        await app.resetLocalStorage();
        const api = await app.getApiUrl(true);
        console.log(api);
        assert.equal(api, null, 'Resetting LocalStorage failed');
        if (backup)
            await app.setApiUrl(backup);
        await app.reload();
        await TestHelper.delay(1000);
        const window = app.getWindow();
        const modal = await window.getTopModal(); // close tutorial modal
        assert.notEqual(modal, null);
        const button = await modal.findElement(webdriver.By.xpath('//button[text()="Skip"]'));
        assert.notEqual(button, null);
        await button.click();

        return Promise.resolve();
    });

    it('#wait loading finished', async function () {
        this.timeout(10000);

        response = await driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];

            const controller = app.getController();
            const route = {
                "regex": "^/sleep$",
                "fn": async function () {
                    const controller = app.getController();
                    controller.setLoadingState(true);
                    await new Promise(r => setTimeout(r, 5000));
                    controller.setLoadingState(false);
                    return Promise.resolve();
                }
            };
            controller.getRouteController().addRoute(route);

            callback('OK');
        });
        assert.equal(response, 'OK');

        const app = await helper.getApp();
        app.navigate('/sleep');

        const start = Date.now();
        await app.waitLoadingFinished();
        const duration = (Date.now() - start) / 1000;
        assert.ok(duration > 5 && duration < 6);

        app.navigate('/');
        await TestHelper.delay(1000);

        return Promise.resolve();
    });

    xit('#check downloads', async function () {
        this.timeout(10000);

        const downloads = await helper.getBrowser().getDownloads();
        console.log(downloads);

        return Promise.resolve();
    });

    it('#get settings', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        const settings = await app.getSettings();
        assert.equal(settings['api'], config['api']);

        return Promise.resolve();
    });

    it('#set debug mode', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        assert.equal(await app.isDebugModeActive(), false);
        const window = app.getWindow();
        var sidemenu = window.getSideMenu();
        var menu = await sidemenu.getEntry('Reload');
        assert.equal(menu, null);

        await app.setDebugMode(true);
        assert.equal(await app.isDebugModeActive(), true);
        sidemenu = window.getSideMenu();
        menu = await sidemenu.getEntry('Reload');
        assert.notEqual(menu, null);
        await TestHelper.delay(1000);

        await app.setDebugMode(false);
        assert.equal(await app.isDebugModeActive(), false);

        return Promise.resolve();
    });

    it('#prepare', async function () {
        this.timeout(30000);

        if (config['host'] === 'http://localhost:4000') {
            const testConfig = { ...config };
            testConfig['host'] = 'http://127.0.0.1:4000';
            testConfig['api'] = 'https://127.0.0.1:3002';

            await helper.teardown();
            await helper.setup(testConfig);

            driver = helper.getBrowser().getDriver();
            var app = helper.getApp();
            await TestHelper.delay(1000);

            await app.prepare(testConfig['api'], testConfig['username'], testConfig['password']);
            await app.waitLoadingFinished(10);

            var modal = await app.getWindow().getTopModal();
            assert.equal(modal, null);

            await helper.teardown();
            await helper.setup(config);

            driver = helper.getBrowser().getDriver();
            app = helper.getApp();
            await TestHelper.delay(1000);

            await app.prepare(config['api'], config['username'], config['password']);
            await app.waitLoadingFinished(10);

            modal = await app.getWindow().getTopModal();
            assert.equal(modal, null);
        } else
            this.skip();

        return Promise.resolve();
    });

    it('#reload', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        await app.reload(true);

        return Promise.resolve();
    });
});