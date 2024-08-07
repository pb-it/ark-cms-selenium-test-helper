const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');

const config = require('./config/test-config.js');
const TestHelper = require('../src/test-helper.js');

describe('Testsuit', function () {

    let driver;

    before('#setup', async function () {
        this.timeout(30000);

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

    it('#login', async function () {
        this.timeout(30000);

        const app = helper.getApp();
        await app.logout();
        await TestHelper.delay(1000);
        assert.equal(await app.isLoggedIn(), false);

        const window = app.getWindow();
        var modal = await window.getTopModal();
        assert.notEqual(modal, null, 'Login modal not open');

        await app.login('admin', '?');
        await TestHelper.delay(1000);

        await driver.wait(webdriver.until.alertIsPresent());
        var alert = await driver.switchTo().alert();
        var text = await alert.getText();
        assert.equal(text, 'Login failed');
        await alert.accept();
        await TestHelper.delay(1000);
        assert.equal(await app.isLoggedIn(), false);

        modal = await window.getTopModal();
        assert.notEqual(modal, null);

        await app.login();
        await TestHelper.delay(1000);
        modal = await window.getTopModal();
        if (modal) {
            var head;
            try {
                const xpathHeader = './div[@class="modal-content"]/div[@class="panel"]/div/h2';
                head = await modal.getElement().findElement(webdriver.By.xpath(xpathHeader));
            } catch (error) {
                ;
            }
            if (head) {
                var text = await head.getText();
                if (['Cache', 'Info', 'Welcome'].includes(text)) {
                    await modal.closeModal();
                    modal = await window.getTopModal();
                }
            }
        }
        assert.equal(modal, null);
        assert.equal(await app.isLoggedIn(), true);

        const ac = app.getApiController();
        await ac.restart(true);
        assert.equal(await app.isLoggedIn(), false);

        await app.reload();
        await TestHelper.delay(1000);
        modal = await window.getTopModal();
        assert.notEqual(modal, null);

        var err;
        try {
            await ac.restart(true);
        } catch (error) {
            err = error;
        }
        assert.ok(err && err['message'] == 'Login required');

        return Promise.resolve();
    });

    it('#login2', async function () {
        this.timeout(30000);

        const app = helper.getApp();
        await app.logout();
        await TestHelper.delay(1000);
        assert.equal(await app.isLoggedIn(), false);

        const window = app.getWindow();
        var modal = await window.getTopModal();
        assert.notEqual(modal, null, 'Login modal not open');

        await app.login2('admin', 'admin');
        await TestHelper.delay(1000);
        await app.reload();
        await TestHelper.delay(1000);
        assert.equal(await app.isLoggedIn(), true);

        modal = await window.getTopModal();
        assert.equal(modal, null);

        return Promise.resolve();
    });

    it('#prepare', async function () {
        this.timeout(30000);

        const app = helper.getApp();
        await app.logout();
        await TestHelper.delay(1000);
        assert.equal(await app.isLoggedIn(), false);

        const response = await driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];

            localStorage.setItem('appVersion', '0');
            //localStorage.removeItem('appVersion')
            callback('OK');
        });
        assert.equal(response, 'OK');

        await app.reload();
        await TestHelper.delay(1000);
        assert.equal(await app.isLoggedIn(), false);

        const window = app.getWindow();
        var modal = await window.getTopModal();
        assert.notEqual(modal, null, 'Login modal not open');

        await app.prepare(config['api'], config['username'], config['password'], true);
        await TestHelper.delay(1000);
        assert.equal(await app.isLoggedIn(), true);

        modal = await window.getTopModal();
        assert.equal(modal, null);

        return Promise.resolve();
    });
});