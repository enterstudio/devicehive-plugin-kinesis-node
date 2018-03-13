const EventEmitter = require('events');
const crc = require('crc');

class AWSKinesisDataStreamsBuffer extends EventEmitter {
    constructor(awsKinesisDataStreams, params) {
        super();

        this._dataStreams = awsKinesisDataStreams;
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
            this._putBatchToStream(streamName);
        }

        return Promise.resolve(null);
    }

    _initTimeout() {
        if (this._timeout === null && this._params.timeout) {
            this._timeout = setInterval(() => {
                Object.keys(this._messagesByStream).forEach(streamName => this._putBatchToStream(streamName));
            }, this._params.timeout);
        }
    }

    _putBatchToStream(streamName) {
        const records = [];

        this._messagesByStream[streamName].forEach(record => {
            const data = JSON.stringify(record);
            records.push({
                Data: data,
                PartitionKey: crc.crc32(data).toString(16)
            });
        });

        if (records.length) {
            this._dataStreams.putRecords({
                StreamName: streamName,
                Records: records
            }, (err, response) => {
                this.emit('putBatch', err, response, streamName);
            });

            this._messagesByStream[streamName] = [];
        }
    }
}

module.exports = AWSKinesisDataStreamsBuffer;