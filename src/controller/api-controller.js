const assert = require('assert');

const Tools = require('./tools.js');

class ApiController {

    _helper
    _driver;

    _tools;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();

        this._tools = new Tools(this._helper);
    }

    async getInfo() {
        const response = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];

            var res;
            try {
                const controller = app.getController();
                const ac = controller.getApiController();
                //const info = await ac.fetchApiInfo();
                const client = ac.getApiClient();
                const url = '/sys/info';
                res = await client.request('GET', url);
            } catch (error) {
                console.log(error);
                res = error;
            } finally {
                callback(res);
            }
        });
        var res;
        if (typeof response === 'string' || response instanceof String)
            res = JSON.parse(response);
        else {
            var msg;
            if (response['name']) {
                msg = response['name'] + ': ';
                if (response['response']) {
                    if (response['response']['status'])
                        msg += response['response']['status'] + ': ';
                    if (response['response']['statusText'])
                        msg += response['response']['statusText'];
                    if (response['response']['url'])
                        msg += ' - ' + response['response']['url'];
                }
            } else
                msg = 'An unexpected error has occurred';
            throw new Error(msg);
        }
        return Promise.resolve(res);
    }

    async getLog(severity, format, sort) {
        const searchParams = new URLSearchParams();
        if (severity)
            searchParams.append('severity', severity);
        if (format)
            searchParams.append('_format', format);
        if (sort)
            searchParams.append('_sort', sort);

        const response = await this._driver.executeAsyncScript(async (params) => {
            const callback = arguments[arguments.length - 1];

            const ac = app.getController().getApiController();
            const client = ac.getApiClient();
            var url = '/sys/log';
            if (params)
                url += '?' + params;
            const res = await client.request('GET', url);

            callback(res);
        }, searchParams.toString());

        var res;
        if (format === 'json')
            res = JSON.parse(response);
        else
            res = response
        return Promise.resolve(res);
    }

    getTools() {
        return this._tools;
    }

    async clearDatabase(schema) {
        const response = await this._driver.executeAsyncScript(async (schema) => {
            const callback = arguments[arguments.length - 1];

            var res;
            try {
                const data = {
                    'cmd': `const path = require('path');
const appRoot = controller.getAppRoot();
const Logger = require(path.join(appRoot, './src/common/logger/logger.js'));

async function test() {
    var res;
    var schema = ${schema};
    if (!schema)
        schema = controller.getDatabaseSettings()['connection']['database'];
    Logger.info("Clearing database '" + schema + "'");
    const knex = controller.getKnex();
    var rs = await knex.raw("DROP DATABASE " + schema + ";");
    rs = await knex.raw("CREATE DATABASE " + schema + ";");
    return Promise.resolve('OK');
};
module.exports = test;`};

                const ac = app.getController().getApiController();
                const client = ac.getApiClient();
                res = await client.request('POST', '/sys/tools/dev/eval?_format=text', data);
            } catch (error) {
                console.log(error);
            } finally {
                callback(res);
            }
        }, schema);
        assert.equal(response, 'OK', 'Clearing database failed');
        return Promise.resolve();
    }

    async restart() {
        const response = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];

            async function test(ac, retries, delay) {
                var bReady = false;
                var tmp;
                var i = 1;
                while (!bReady && i <= retries) {
                    console.log(i);
                    if (i > 1)
                        await sleep(delay);
                    try {
                        tmp = await ac.fetchApiInfo();
                        console.log(tmp);
                        if (tmp['state'] === 'running')
                            bReady = true;
                    } catch (error) {
                        console.log(error);
                        if (error instanceof HttpError && error['response'] && (error['response']['status'] == 401 || error['response']['status'] == 403))
                            bReady = true;
                    }
                    i++;
                }
                return Promise.resolve(bReady);
            }

            var res;
            try {
                const ac = app.getController().getApiController();
                await ac.restartApi();
                await sleep(5000);
                var bReady = await test(ac, 5, 3000);
                if (!bReady) {
                    await sleep(2000);
                    bReady = await test(ac, 5, 2000);
                    if (!bReady) {
                        await sleep(1000);
                        bReady = await test(ac, 5, 1000);
                    }
                }
                if (bReady)
                    res = 'OK';
            } catch (error) {
                console.log(error);
            } finally {
                callback(res);
            }
        });
        assert.equal(response, 'OK', 'Restart failed');
        return Promise.resolve();
    }

    async checkRestartRequest() {
        const info = await this.getInfo();
        if (info['state'] === 'openRestartRequest')
            await this.restart();
        return Promise.resolve();
    }
}

module.exports = ApiController;