const assert = require('assert');
const sinon = require('sinon');

const FirehoseBuffer = require('../../../../firehose/src/AWSFirehoseBuffer');

describe('AWS Firehose Buffer', () => {
    it('Should emit "putBatch" event when buffer has put records to Firehose as batch', () => {
        const config = {
            timeout: 60000,
            maxSize: 2
        };
        const data = {
            command: 'command name'
        };
        const awsFirehoseStub = {};
        awsFirehoseStub.putRecordBatch = sinon.stub().callsFake((params, callback = () => {}) => {
            const fakeErr = null;
            const fakeResponse = {};
            callback(fakeErr, fakeResponse);
        });
        const firehoseRecordBuffer = new FirehoseBuffer(awsFirehoseStub, config);
        firehoseRecordBuffer.emit = sinon.spy();

        firehoseRecordBuffer.put(data, 'test-stream');
        firehoseRecordBuffer.put(data, 'test-stream');

        assert(firehoseRecordBuffer.emit.calledOnce);
        assert(firehoseRecordBuffer.emit.calledWith('putBatch'));
    });
});