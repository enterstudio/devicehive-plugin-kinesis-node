const crc = require('crc');

const BaseStreamProvider = require('../../src/BaseStreamProvider');
const DataStreamsBuffer = require('./AWSKinesisDataStreamsBuffer');

class AWSKinesisDataStreamsProvider extends BaseStreamProvider {
    _streamBufferClass() {
        return DataStreamsBuffer;
    }

    _request(data, streamName, callback = () => {}) {
        const stringData = JSON.stringify(data);
        const record = {
            StreamName: streamName,
            Data: stringData,
            PartitionKey: crc.crc32(stringData).toString(16)
        };

        return this._provider.putRecord(record, callback);
    }
}

module.exports = AWSKinesisDataStreamsProvider;