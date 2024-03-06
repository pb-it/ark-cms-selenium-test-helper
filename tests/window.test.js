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

    it('#test canvas/modal/panel/form', async function () {
        this.timeout(30000);

        const app = helper.getApp();
        await app.setDebugMode(true);
        const window = app.getWindow();
        const sidemenu = window.getSideMenu();
        await sidemenu.click('Data');
        await TestHelper.delay(1000);
        await sidemenu.click('_registry');
        await TestHelper.delay(1000);
        await sidemenu.click('Show');
        await TestHelper.delay(1000);
        await sidemenu.click('All');
        await TestHelper.delay(1000);

        const canvas = await window.getCanvas();
        assert.notEqual(canvas, null);
        var panels = await canvas.getPanels();
        assert.ok(panels.length > 0);
        var elem;
        var text;
        var panel;
        for (var p of panels) {
            elem = await p.getElement().findElement(webdriver.By.xpath('./div/p'));
            text = await elem.getText();
            if (text === '<key: version>') {
                panel = p;
                break;
            }
        }
        assert.notEqual(panel, null);
        var contextmenu = await panel.openContextMenu();
        await TestHelper.delay(1000);
        await contextmenu.click('Details');
        await TestHelper.delay(1000);

        var modal = await window.getTopModal();
        assert.notEqual(modal, null);
        panel = await modal.getPanel();
        assert.notEqual(panel, null);
        var button = await panel.getButton('Edit');
        assert.notEqual(panel, null);
        await button.click();
        await TestHelper.delay(1000);

        panel = await modal.getPanel();
        assert.notEqual(panel, null);
        var form = await panel.getForm();
        assert.notEqual(form, null);
        var input = await form.getFormInput('value');
        assert.notEqual(input, null);
        await input.clear();
        await TestHelper.delay(1000);
        button = await panel.getButton('Update');
        assert.notEqual(panel, null);
        await button.click();
        await TestHelper.delay(1000);

        modal = await window.getTopModal();
        assert.notEqual(modal, null);
        var element = modal.getElement();
        /*driver.executeScript(function () {
            arguments[0].style.backgroundColor = 'lightblue';
        }, element);*/
        await TestHelper.delay(1000);
        button = await element.findElement(webdriver.By.xpath(`.//button[text()="OK"]`));
        assert.notEqual(button, null);
        await button.click();
        await TestHelper.delay(1000);

        modal = await window.getTopModal();
        assert.notEqual(modal, null);
        await modal.closeModal();
        await TestHelper.delay(1000);

        modal = await window.getTopModal();
        assert.equal(modal, null);

        return Promise.resolve();
    });
});