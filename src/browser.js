const os = require('os');
const path = require('path');
const { Builder, Capabilities } = require('selenium-webdriver');
const selProxy = require('selenium-webdriver/proxy');

const sleep = require('util').promisify(setTimeout);

/**
 * https://www.selenium.dev/documentation/webdriver/
 */
class Browser {

    _config;
    _proxy;
    _driver;

    constructor(config) {
        this._config = config;
    }

    setProxy(config) {
        this._proxy = selProxy.manual(config);
    }

    async setupDriver() {
        if (!this._driver) {
            if (this._config) {
                if (this._config['proxy'])
                    this._proxy = selProxy.manual(this._config['proxy']);

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
                            .setProxy(this._proxy)
                            .build();
                        break;
                    case 'chrome':
                    default:
                        //this._driver = await new Builder().withCapabilities(Capabilities.chrome()).build();
                        var chrome = require("selenium-webdriver/chrome");
                        var options = new chrome.Options();
                        if (this._config['binary'])
                            options.setChromeBinaryPath(this._config['binary']);
                        if (this._config['profile-directory'])
                            options.addArguments('profile-directory=' + this._config['profile-directory']);
                        if (this._config['user-data-dir'])
                            options.addArguments('user-data-dir=' + this._config['user-data-dir']);
                        if (this._config['download.default_directory'])
                            options.addArguments('download.default_directory=' + this._config['download.default_directory']);
                        if (this._config['arguments'])
                            options.addArguments(this._config['arguments']);
                        this._driver = await new Builder()
                            .forBrowser('chrome')
                            .setChromeOptions(options)
                            .setProxy(this._proxy)
                            .build();
                }
                const TIMEOUT = 300000000;
                await this._driver.manage().setTimeouts({
                    //implicit: TIMEOUT,
                    //pageLoad: TIMEOUT,
                    script: TIMEOUT
                });

                await this._driver.manage().window().maximize();
            }
        }
        return Promise.resolve(this._driver);
    }

    async teardown() {
        await this._driver.quit();
        this._driver = null;
        return Promise.resolve();
    }

    getDriver() {
        return this._driver;
    }

    async getDownloads(bWaitFinished) {
        const handle = await this._driver.getWindowHandle();
        await this._driver.switchTo().newWindow('tab');

        var downloads;
        try {
            if (this._config['name'] === 'chrome' || this._config['name'] === 'chromium')
                await this._driver.get("chrome://downloads/");
            else
                assert.fail('Function only available for Chrome browser');

            await sleep(1000);

            const response = await this._driver.executeAsyncScript(async (bWaitFinished) => {
                const callback = arguments[arguments.length - 1];

                function sleep(milliseconds) {
                    return new Promise(resolve => setTimeout(resolve, milliseconds));
                }

                var tmp;
                var version;
                var parts = navigator.userAgent.split(/\s+/);
                if (parts.length > 1) {
                    tmp = parts[parts.length - 2];
                    if (tmp.startsWith('Chrome/')) {
                        tmp = tmp.substring(7);
                        parts = tmp.split('.');
                        version = parseInt(parts[0]);
                    }
                }

                var selector;
                if (version && version >= 130)
                    selector = '#mainContainer > cr-infinite-list';
                else
                    selector = '#mainContainer > iron-list';

                const res = [];
                var items;
                var root, link, progress, show;
                var iCount = 0;
                var bProgress = true;
                do {
                    bProgress = false;
                    if (iCount > 0)
                        await sleep(1000);
                    items = document.querySelector('downloads-manager').shadowRoot.querySelector(selector).getElementsByTagName('downloads-item');
                    for (var item of items) {
                        tmp = {};
                        root = item.shadowRoot;
                        link = root.getElementById('file-link');
                        if (link)
                            tmp['name'] = link.textContent;
                        progress = root.getElementById('progress');
                        if (progress) {
                            tmp['progress'] = progress.value;
                            if (progress.value < 100)
                                bProgress = true;
                        }
                        show = root.getElementById('show');
                        if (show)
                            tmp['path'] = show.getAttribute('title');
                        res.push(tmp);
                    };
                    iCount++;
                    /*console.log(iCount);
                    if (iCount > 20)
                        debugger;*/
                } while (bWaitFinished && bProgress);

                callback(res);
            }, bWaitFinished);
            var dir;
            if (this._config['download.default_directory'])
                dir = this._config['download.default_directory'];
            else
                dir = os.homedir() + "/Downloads"; // "%USERPROFILE%/Downloads"
            if (dir) {
                downloads = response.map(function (x) {
                    if (x['path'])
                        return x['path'];
                    else
                        return path.join(dir, x['name']);
                });
            } else
                assert.fail('Could not determine download location');
        } catch (error) {
            console.error(error);
        } finally {
            await this._driver.close();
            await this._driver.switchTo().window(handle);
        }
        return Promise.resolve(downloads);
    }

    async getUserAgent() {
        /*const details = await driver.sendAndGetDevToolsCommand('Browser.getVersion', {});
        return details['userAgent'];*/
        return this._driver.executeScript(
            function () {
                return navigator.userAgent;
            }
        );
    }
}

module.exports = Browser;