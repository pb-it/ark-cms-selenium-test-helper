//const os = require('os');
const { Builder, Capabilities } = require('selenium-webdriver');

const sleep = require('util').promisify(setTimeout);

/**
 * https://www.selenium.dev/documentation/webdriver/
 */
class Browser {

    _config;
    _bSetupDone = false;
    _driver;

    constructor(config) {
        this._config = config;
    }

    async setupDriver() {
        if (!this._bSetupDone) {
            if (this._config) {
                switch (this._config['name']) {
                    case 'firefox':
                        //driver = new Builder().withCapabilities(Capabilities.firefox()).build();
                        const firefox = require('selenium-webdriver/firefox');
                        var options = new firefox.Options();
                        if (this._config['binary'])
                            options.setBinary(this._config['binary']);
                        if (this._config['profile'])
                            options.setProfile(this._config['profile']);
                        this._driver = await new Builder()
                            .forBrowser('firefox')
                            .setFirefoxOptions(options)
                            .build();
                        break;
                    case 'chrome':
                    default:
                        //this._driver = await new Builder().withCapabilities(Capabilities.chrome()).build();
                        var chrome = require("selenium-webdriver/chrome");
                        var options = new chrome.Options();
                        if (this._config['user-data-dir'])
                            options.addArguments('user-data-dir=' + this._config['user-data-dir']);
                        if (this._config['profile-directory'])
                            options.addArguments('profile-directory=' + this._config['profile-directory']);
                        if (this._config['download.default_directory'])
                            options.addArguments('download.default_directory=' + this._config['download.default_directory']);
                        this._driver = await new Builder()
                            .forBrowser('chrome')
                            .setChromeOptions(options)
                            .build();
                }
                const TIMEOUT = 300000000;
                await this._driver.manage().setTimeouts({
                    //implicit: TIMEOUT,
                    //pageLoad: TIMEOUT,
                    script: TIMEOUT
                });

                await this._driver.manage().window().maximize();

                this._bSetupDone = true;
            }
        }
        return Promise.resolve(this._driver);
    }

    getDriver() {
        return this._driver;
    }

    async getDownloads() {
        const handle = await this._driver.getWindowHandle();
        await this._driver.switchTo().newWindow('tab');

        if (this._config['name'] === 'chrome')
            await this._driver.get("chrome://downloads/");
        else
            assert.fail('Function only available for Chrome browser');

        await sleep(1000);

        const script = function () {
            return [...document.querySelector('downloads-manager').shadowRoot.querySelector('#mainContainer > iron-list').getElementsByTagName("downloads-item")].map((el) => el.shadowRoot.getElementById("show").getAttribute("title"));
        };
        const webElement = await this._driver.executeScript(script);

        await this._driver.close();
        await this._driver.switchTo().window(handle);

        return Promise.resolve(webElement);
    }
}

module.exports = Browser;