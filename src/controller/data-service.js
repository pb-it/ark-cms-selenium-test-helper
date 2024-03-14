class DataService {

    _helper
    _driver;

    constructor(helper) {
        this._helper = helper;
        this._driver = this._helper.getBrowser().getDriver();
    }

    async request(method, path, options, data) {
        return this._driver.executeAsyncScript(async function (method, path, options, data) {
            const callback = arguments[arguments.length - 1];
            var res;
            try {
                const apiClient = app.getController().getApiController().getApiClient()
                res = await apiClient.request(method, path, options, data);
            } catch (error) {
                res = error;
            }
            callback(res);
        }, method, path, options, data);
    }

    async read(dataType, id, where, sort, limit, filters, search, bIgnoreCache) {
        const result = await this._driver.executeAsyncScript(async function (dataType, id, where, sort, limit, filters, search, bIgnoreCache) {
            const callback = arguments[arguments.length - 1];
            var res;
            try {
                res = await app.getController().getDataService().fetchData(dataType, id, where, sort, limit, filters, search, bIgnoreCache);
            } catch (error) {
                console.error(error);
                res = null;
            }
            callback(res);
        }, dataType, id, where, sort, limit, filters, search, bIgnoreCache);
        if (!result)
            throw new Error('Empty response! Take a look at the browser log for more details.');
        return Promise.resolve(result);
    }

    async create(dataType, data) {
        const result = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];
            var res;
            try {
                const obj = new CrudObject(arguments[0], arguments[1]);
                res = await obj.create();
            } catch (error) {
                console.error(error);
                res = null;
            }
            callback(res);
        }, dataType, data);
        if (!result)
            throw new Error('Empty response! Take a look at the browser log for more details.');
        return Promise.resolve(result);
    }

    async update(dataType, id, data) {
        const result = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];
            var res;
            try {
                const obj = new CrudObject(arguments[0], { 'id': arguments[1] });
                res = await obj.update(arguments[2]);
            } catch (error) {
                console.error(error);
                res = null;
            }
            callback(res);
        }, dataType, id, data);
        if (!result)
            throw new Error('Empty response! Take a look at the browser log for more details.');
        return Promise.resolve(result);
    }

    async delete(dataType, id) {
        const result = await this._driver.executeAsyncScript(async () => {
            const callback = arguments[arguments.length - 1];
            var res;
            try {
                const obj = new CrudObject(arguments[0], { 'id': arguments[1] });
                res = await obj.delete();
            } catch (error) {
                console.error(error);
                res = null;
            }
            callback(res);
        }, dataType, id);
        if (!result)
            throw new Error('Empty response! Take a look at the browser log for more details.');
        return Promise.resolve(result);
    }
}

module.exports = DataService;