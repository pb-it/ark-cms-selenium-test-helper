const assert = require('assert');

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

    it('#test read', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        const ds = app.getDataService();
        var data = await ds.read('_model');
        assert.equal(data.length > 0, true);

        data = await ds.read('_model', null, 'id_gt=100');
        assert.ok(data && Array.isArray(data) && data.length == 0);

        var err;
        try {
            data = await ds.read('_model', 100);
        } catch (error) {
            err = error;
        }
        assert.equal(err['message'], 'Empty response! Take a look at the browser log for more details.');

        return Promise.resolve();
    });

    it('#test create unknown model', async function () {
        this.timeout(10000);

        const app = helper.getApp();
        const ds = app.getDataService();
        var err;
        try {
            data = await ds.create('dummy', { 'foo': 'bar' });
        } catch (error) {
            err = error;
        }

        return Promise.resolve();
    });
});