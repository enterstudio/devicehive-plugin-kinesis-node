const BaseStreamProvider = require('../../src/BaseStreamProvider');

class AWSFirehoseProvider extends BaseStreamProvider {
    _request(record, streamName, callback = (err, response) => {}) {
        const payload = {
            DeliveryStreamName: streamName,
            Record: this._composeRecordData(record)
        };
        return this._provider.putRecord(payload, callback);
    }

    _batchRequest(records, streamName, callback = () => {}) {
        return this._provider.putRecordBatch({
            DeliveryStreamName: streamName,
            Records: records
        }, callback);
    }

    _composeRecordData(record) {
        return {
            Data: JSON.stringify(record)
        };
    }
}

module.exports = AWSFirehoseProvider;