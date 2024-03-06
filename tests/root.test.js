const config = require('./config/test-config.js');
const TestHelper = require('../src/test-helper.js');

describe("Root Suite", function () {

    let driver;

    before('#setup', async function () {
        this.timeout(10000);

        if (!global.helper) {
            global.helper = new TestHelper();
            await helper.setup(config);
        }
        driver = helper.getBrowser().getDriver();

        global.allPassed = true;

        return Promise.resolve();
    });

    after('#teardown', async function () {
        if (allPassed)
            await driver.quit();
        return Promise.resolve();
    });

    require('./clear.test.js');
    require('./basic.test.js');
    require('./api.test.js');
    require('./tools.test.js');
    require('./data-service.test.js');
    require('./models.test.js');
    require('./sidemenu.test.js');
    require('./top-navigation-bar.test.js');
    require('./contextmenu.test.js');
    require('./window.test.js');
});