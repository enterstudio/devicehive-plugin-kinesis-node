const BaseStreamBuffer = require('../../src/BaseStreamBuffer');

class AWSFirehoseBuffer extends BaseStreamBuffer {
    _composeRecordData(record) {
        return {
            Data: JSON.stringify(record)
        };
    }

    _batchRequest(records, streamName, callback = () => {}) {
        return this._provider.putRecordBatch({
            DeliveryStreamName: streamName,
            Records: records
        }, callback);
    }
}

module.exports = AWSFirehoseBuffer;