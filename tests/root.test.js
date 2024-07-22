const config = require('./config/test-config.js');
const TestHelper = require('../src/test-helper.js');

describe("Root Suite", function () {

    before('#setup', async function () {
        this.timeout(10000);

        if (!global.helper) {
            global.helper = new TestHelper();
            await helper.setup(config);
        }

        global.allPassed = true;

        return Promise.resolve();
    });

    after('#teardown', async function () {
        this.timeout(10000);

        if (allPassed)
            await helper.getBrowser().teardown();
        return Promise.resolve();
    });

    require('./basic.test.js');
    require('./session.test.js');
    require('./clear.test.js');
    require('./common.test.js');
    require('./api.test.js');
    require('./tools.test.js');
    require('./data-service.test.js');
    require('./models.test.js');
    require('./sidemenu.test.js');
    require('./top-navigation-bar.test.js');
    require('./contextmenu.test.js');
    require('./window.test.js');
    require('./extensions.test.js');
    require('./proxy.test.js');
});