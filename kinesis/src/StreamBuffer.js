const EventEmitter = require('events');

class BaseBuffer extends EventEmitter {
    constructor(params) {
        super();

        this._params = params;
        this._messagesByStream = {};
        this._timeout = null;
    }

    put(data, streamName) {
        this._initTimeout();

        if (!this._messagesByStream[streamName]) {
            this._messagesByStream[streamName] = [];
        }

        this._messagesByStream[streamName].push(data);

        if (this._messagesByStream[streamName].length >= this._params.maxSize) {
            this._flushStreamBuffer(streamName);
        }

        return Promise.resolve(null);
    }

    _initTimeout() {
        if (this._timeout === null && this._params.timeout) {
            this._timeout = setInterval(() => {
                Object.keys(this._messagesByStream).forEach(streamName => this._flushStreamBuffer(streamName));
            }, this._params.timeout);
        }
    }

    _flushStreamBuffer(streamName) {
        this.emit('putBatch', this._messagesByStream[streamName], streamName);
        this._messagesByStream[streamName] = [];
    }
}


module.exports = BaseBuffer;