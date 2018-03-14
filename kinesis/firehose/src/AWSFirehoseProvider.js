const BaseStreamProvider = require('../../src/BaseStreamProvider');
const FirehoseBuffer = require('./AWSFirehoseBuffer');

class AWSFirehoseProvider extends BaseStreamProvider {
    _streamBufferClass() {
        return FirehoseBuffer;
    }

    _request(data, streamName, callback = () => {}) {
        const record = {
            DeliveryStreamName: streamName,
            Record: {
                Data: JSON.stringify(data)
            }
        };
        return this._provider.putRecord(record, callback);
    }
}

module.exports = AWSFirehoseProvider;