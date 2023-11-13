const assert = require('assert');
const webdriver = require('selenium-webdriver');

const config = require('./config.js');
const TestSetup = require('../src/test-setup.js');
const TestHelper = require('../src/test-helper.js');

var driver;
var helper;

describe('Testsuit', function () {

    before('#setup', async function () {
        this.timeout(10000);
        driver = await new TestSetup(config).getDriver();
        helper = new TestHelper(driver);

        await TestHelper.delay(1000);

        return Promise.resolve();
    });

    it('#login', async function () {
        this.timeout(10000);

        const title = 'WING-CMS';
        var tmp = await driver.getTitle();
        assert.equal(tmp, title, 'Title missmatch');

        var elements = await driver.findElements(webdriver.By.xpath('/html/head/title'));
        assert.equal(elements.length, 1);
        tmp = elements[0].getText()
        assert.equal(tmp, title, 'Title missmatch');

        await helper.login();

        var modal = await helper.getTopModal();
        assert.equal(modal == null, true);

        return Promise.resolve();
    });

});