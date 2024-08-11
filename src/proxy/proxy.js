/**
 * Abstract Class Proxy
 * @class Proxy
 */
class Proxy {

    constructor() {
        if (this.constructor === Proxy) { // new.target === Proxy
            throw new TypeError("Cannot create an instance of abstract class.");
        }
    }

    getProxyConfig() {
        throw new Error("Abstract method!");
    }

    async startHar() {
        throw new Error("Abstract method!");
    }

    async endHar() {
        throw new Error("Abstract method!");
    }
}

module.exports = Proxy;