const BaseStreamBuffer = require('../../src/BaseStreamBuffer');
const crc = require('crc');

class AWSKinesisDataStreamsBuffer extends BaseStreamBuffer {
    _composeRecordData(record) {
        const data = JSON.stringify(record);
        return {
            Data: data,
            PartitionKey: crc.crc32(data).toString(16)
        };
    }

    _batchRequest(records, streamName, callback = () => {}) {
        return this._provider.putRecords({
            StreamName: streamName,
            Records: records
        }, callback);
    }
}

module.exports = AWSKinesisDataStreamsBuffer;