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

        await TestHelper.delay(1000);

        return Promise.resolve();
    });

    /*after('#teardown', async function () {
        return driver.quit();
    });*/

    afterEach(function () {
        if (global.allPassed)
            allPassed = allPassed && (this.currentTest.state === 'passed');
    });

    it('#check userAgent', async function () {
        this.timeout(10000);

        var ua;
        const arguments = helper.getConfig()['browser']['arguments'];
        if (arguments && arguments.length > 0) {
            for (var arg of arguments) {
                if (arg.startsWith('user-agent=')) {
                    ua = arg.substring('user-agent='.length);
                    break;
                }
            }
        }
        if (ua) {
            const userAgent = await helper.getBrowser().getUserAgent();
            assert.equal(userAgent, ua, 'UserAgent missmatch');
        } else
            this.skip();

        return Promise.resolve();
    });

    it('#check title', async function () {
        this.timeout(10000);

        const title = 'WING-CMS';
        var tmp = await driver.getTitle();
        assert.equal(tmp, title, 'Title missmatch');

        return Promise.resolve();
    });

    it('#login', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        var modal = await app.getTopModal();
        assert.notEqual(modal, null, 'Login modal not open');

        await app.login('admin', '?');

        await TestHelper.delay(1000);

        await driver.wait(webdriver.until.alertIsPresent());
        var alert = await driver.switchTo().alert();
        var text = await alert.getText();
        assert.equal(text, 'Login failed');
        await alert.accept();

        modal = await app.getTopModal();
        assert.notEqual(modal, null);

        await app.login();

        await TestHelper.delay(1000);

        modal = await app.getTopModal();
        assert.equal(modal, null);

        return Promise.resolve();
    });

    it('#login2', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        var modal = await app.logout();
        await TestHelper.delay(1000);

        var modal = await app.getTopModal();
        assert.notEqual(modal, null, 'Login modal not open');

        await app.login2('admin', 'admin');
        await TestHelper.delay(1000);
        await app.reload();
        await TestHelper.delay(1000);

        modal = await app.getTopModal();
        assert.equal(modal, null);

        return Promise.resolve();
    });

    it('#check API', async function () {
        if (helper.getConfig()['api']) {
            this.timeout(10000);

            const api = await helper.getApp().getApiUrl(true);
            console.log(api);
            assert.equal(api, helper.getConfig()['api'], 'API missmatch');
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
        const modal = await app.getTopModal(); // close tutorial modal
        assert.notEqual(modal, null);
        const button = await modal.findElement(webdriver.By.xpath('//button[text()="Skip"]'));
        assert.notEqual(button, null);
        await button.click();

        return Promise.resolve();
    });

    xit('#check downloads', async function () {
        this.timeout(10000);

        const downloads = await helper.getBrowser().getDownloads();
        console.log(downloads);

        return Promise.resolve();
    });
});