const BaseStreamProvider = require('../../src/BaseStreamProvider');

class AWSKinesisDataStreamsProvider extends BaseStreamProvider {
    _request(data, streamName, callback = (err, response) => {}) {
        const payload = {
            StreamName: streamName,
            ...this._composeRecordData(data)
        };

        return this._provider.putRecord(payload, callback);
    }

    _batchRequest(records, streamName, callback = (err, response) => {}) {
        return this._provider.putRecords({
            StreamName: streamName,
            Records: records
        }, callback);
    }

    _composeRecordData(record) {
        const data = JSON.stringify(record);
        return {
            Data: data,
            PartitionKey: require('crypto').createHash('md5').update(data).digest('hex')
        };
    }
}

module.exports = AWSKinesisDataStreamsProvider;