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
        const userAgent = await helper.getBrowser().getUserAgent();
        console.log(userAgent);
        if (ua)
            assert.equal(userAgent, ua, 'UserAgent missmatch');
        else
            this.skip();

        return Promise.resolve();
    });

    it('#check title', async function () {
        this.timeout(10000);

        const title = 'ARK-CMS';
        var tmp = await driver.getTitle();
        assert.equal(tmp, title, 'Title missmatch');

        return Promise.resolve();
    });
});