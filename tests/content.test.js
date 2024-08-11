const path = require('path');
const fs = require('fs');

const assert = require('assert');
const webdriver = require('selenium-webdriver');
//const test = require('selenium-webdriver/testing');

const config = require('./config/test-config.js');
const TestHelper = require('../src/test-helper.js');

describe('Testsuit - Content', function () {

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

        await app.setDebugMode(false);

        const str = fs.readFileSync(path.join(__dirname, './data/models/note.json'), 'utf8');
        const model = JSON.parse(str);
        const id = await app.getModelController().addModel(model);
        assert.notEqual(id, null);

        return Promise.resolve();
    });

    /*after('#teardown', async function () {
        return driver.quit();
    });*/

    afterEach(function () {
        if (global.allPassed)
            allPassed = allPassed && (this.currentTest.state === 'passed');
    });

    it('#test create content', async function () {
        this.timeout(30000);

        const app = helper.getApp();
        const window = app.getWindow();
        const sidemenu = window.getSideMenu();
        await sidemenu.click('Data');
        await TestHelper.delay(1000);
        await sidemenu.click('note');
        await TestHelper.delay(1000);
        await sidemenu.click('Create');
        await app.waitLoadingFinished(10);
        await TestHelper.delay(1000);

        var canvas = await window.getCanvas();
        assert.notEqual(canvas, null);
        var panel = await canvas.getPanel();
        assert.notEqual(panel, null);
        var form = await panel.getForm();
        assert.notEqual(form, null);
        var input = await form.getFormInput('title');
        assert.notEqual(input, null);
        await input.sendKeys('TestNote');
        await TestHelper.delay(1000);

        var button = await panel.getButton('Create');
        assert.notEqual(button, null);
        await button.click();
        await app.waitLoadingFinished(10);
        await TestHelper.delay(1000);

        canvas = await window.getCanvas();
        assert.notEqual(canvas, null);
        var panels = await canvas.getPanels();
        assert.equal(panels.length, 1);

        return Promise.resolve();
    });

    it('#test delete content', async function () {
        this.timeout(30000);

        const app = helper.getApp();
        const window = app.getWindow();
        const sidemenu = window.getSideMenu();
        await sidemenu.click('Data');
        await TestHelper.delay(1000);
        await sidemenu.click('note');
        await TestHelper.delay(1000);
        await sidemenu.click('Show');
        await TestHelper.delay(1000);
        await sidemenu.click('All');
        await app.waitLoadingFinished(10);
        await TestHelper.delay(1000);

        var canvas = await window.getCanvas();
        assert.notEqual(canvas, null);
        var panels = await canvas.getPanels();
        assert.equal(panels.length, 1);

        var contextmenu = await panels[0].openContextMenu();
        await TestHelper.delay(1000);
        await contextmenu.click('Delete');
        await TestHelper.delay(1000);

        var modal = await app.getWindow().getTopModal();
        assert.notEqual(modal, null);
        var panel = await modal.getPanel();
        assert.notEqual(panel, null);
        var button = await panel.getButton('Confirm');
        assert.notEqual(button, null);
        await button.click();
        await app.waitLoadingFinished(10);

        modal = await app.getWindow().getTopModal();
        assert.equal(modal, null);

        canvas = await window.getCanvas();
        assert.notEqual(canvas, null);
        panels = await canvas.getPanels();
        assert.equal(panels.length, 0);

        return Promise.resolve();
    });
});