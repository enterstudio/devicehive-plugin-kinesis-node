const assert = require('assert');
const sinon = require('sinon');

const crc = require('crc');

const DataStreamsBuffer = require('../../../../../kinesis/dataStreams/src/AWSKinesisDataStreamsBuffer');

describe('AWS Kinesis Data Streams Buffer', () => {
    let awsKinesisStub;

    beforeEach(() => {
        awsKinesisStub = {};
        awsKinesisStub.putRecords = sinon.stub().callsFake((params, callback = () => {}) => {
            const fakeErr = null;
            const fakeResponse = {};
            callback(fakeErr, fakeResponse);
        });
    });

    it('Should emit "putBatch" event when buffer has put records to Kinesis data stream as batch', () => {
        const config = {
            timeout: 60000,
            maxSize: 2
        };
        const data = {
            command: 'command name'
        };
        const dataStreamsRecordBuffer = new DataStreamsBuffer(awsKinesisStub, config);
        dataStreamsRecordBuffer.emit = sinon.spy();

        dataStreamsRecordBuffer.put(data, 'test-stream');
        dataStreamsRecordBuffer.put(data, 'test-stream');

        assert(dataStreamsRecordBuffer.emit.calledOnce);
        assert(dataStreamsRecordBuffer.emit.calledWith('putBatch', null, {}, 'test-stream'));
    });

    it('Should use CRC32 as PartitionKey', () => {
        const config = {
            timeout: 60000,
            maxSize: 2
        };
        const data = {
            command: 'command name'
        };
        const expected = crc.crc32(JSON.stringify(data)).toString(16);
        const dataStreamsRecordBuffer = new DataStreamsBuffer(awsKinesisStub, config);

        dataStreamsRecordBuffer.put(data, 'test-stream');
        dataStreamsRecordBuffer.put(data, 'test-stream');

        assert.equal(awsKinesisStub.putRecords.firstCall.args[0].Records[0].PartitionKey, expected);
    });
});