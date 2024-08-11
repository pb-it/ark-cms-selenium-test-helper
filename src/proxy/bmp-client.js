//const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const sleep = require('util').promisify(setTimeout);
const kill = require('tree-kill');

const Proxy = require('./proxy.js');

class BmpClient extends Proxy {

    _config;
    _uri;
    _port;

    _process;
    _bOpened;

    constructor(config) {
        super();
        this._config = config;
        this._uri = `${this._config['bmp']['protocol']}://${this._config['bmp']['host']}:${this._config['bmp']['port']}`;
        this._port = this._config['options'] ? this._config['options']['port'] : null;
    }

    async setup() {
        var list;
        try {
            list = await this._getProxyList();
            console.log(list);
        } catch (error) {
            if (error && error['code'] !== 'ECONNREFUSED')
                console.error(error);
        }
        if (!list) {
            const exec = this._config['bmp']['executable'];
            if (exec && fs.existsSync(exec)) {
                this._process = spawn(exec, ['-port', this._config['bmp']['port']], { stdio: 'ignore' });
                /*this._process.on('exit', (code, signal) => {
                    console.log(`Process ended with exit code ${code} (${signal})`);
                });
                console.log(this._process.pid);*/
                await sleep(2000);
                try {
                    list = await this._getProxyList();
                } catch (error) {
                    if (error && error['code'] !== 'ECONNREFUSED')
                        console.error(error);
                }
            }
        }
        if (list) {
            if (!this._port || list.map((x) => x['port']).indexOf(this._port) === -1) {
                const res = await this._open();
                this._port = res['port'];
                this._bOpened = true;
            }
        } else
            throw new Error('Proxy: Connection refused');
        return Promise.resolve();
    }

    async teardown() {
        if (this._process) {
            //this._process.kill('SIGKILL'); // default: SIGTERM
            kill(this._process.pid);
            this._process = null;
        } else if (this._bOpened) {
            try {
                await this._close();
            } catch (error) {
                if (error && error['code'] !== 'ECONNREFUSED')
                    console.error(error);
                else
                    throw error;
            }
        }
        return Promise.resolve();
    }

    getProxyConfig() {
        var host;
        if (this._config['options'] && this._config['options']['host'])
            host = this._config['options']['host'];
        else
            host = this._config['bmp']['host'];
        return {
            http: `${host}:${this._port}`,
            https: `${host}:${this._port}`
        };
    }

    async _getProxyList() {
        const url = 'proxy/';
        const obj = await this._request(url, 'GET');
        return Promise.resolve(obj['proxyList']);
    }

    async _open() {
        const url = `proxy/`;
        return this._request(url, 'POST', this._config['options']);
    }

    async _close() {
        const url = `proxy/${this._port}/`;
        return this._request(url, 'DELETE');
    }

    async startHar(opt) {
        const url = `proxy/${this._port}/har`;
        return this._request(url, 'PUT', opt);
    }

    async endHar() {
        const url = `proxy/${this._port}/har`;
        return this._request(url, 'GET');
    }

    async _request(url, method, data) {
        const params = {
            'method': method
        };
        if (data) {
            params['headers'] = { 'Content-Type': 'application/x-www-form-urlencoded' };
            params['body'] = new URLSearchParams(data);
        }
        const response = await fetch(`${this._uri}/${url}`, params);
        const type = response.headers.get('content-type');
        if (type && type === 'application/json')
            return response.json();
        else
            return response.text();
    }
}

module.exports = BmpClient;