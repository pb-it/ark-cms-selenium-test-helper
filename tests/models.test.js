const path = require('path');
const fs = require('fs');

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

    it('#test add model', async function () {
        this.timeout(30000);

        const app = helper.getApp();
        var data = await app.read('_model');
        var length = data.length;

        const str = fs.readFileSync(path.join(__dirname, './data/models/note.json'), 'utf8');
        const model = JSON.parse(str);
        const id = await helper.getModelController().addModel(model);
        console.log(id);

        await app.reload();
        await TestHelper.delay(1000);
        await app.login();
        await TestHelper.delay(1000);

        data = await app.read('_model');
        assert.equal(data.length, length + 1, 'Adding model failed');

        return Promise.resolve();
    });

    it('#test delete model', async function () {
        this.timeout(30000);

        const app = helper.getApp();
        var data = await app.read('_model');
        var length = data.length;

        const sidemenu = app.getSideMenu();
        await sidemenu.click('Models');
        await TestHelper.delay(1000);
        await sidemenu.click('note');
        await TestHelper.delay(1000);
        await sidemenu.click('Delete');
        await TestHelper.delay(1000);

        var modal = await app.getTopModal();
        assert.notEqual(modal, null);
        const button = await modal.findElement(webdriver.By.xpath('//button[text()="Delete"]'));
        assert.notEqual(button, null);
        await button.click();
        await TestHelper.delay(1000);
        modal = await app.getTopModal();
        assert.equal(modal, null);

        await app.reload();
        await TestHelper.delay(1000);
        await app.login();
        await TestHelper.delay(1000);

        data = await app.read('_model');
        assert.equal(data.length, length - 1, 'Deleting model failed');

        return Promise.resolve();
    });
});