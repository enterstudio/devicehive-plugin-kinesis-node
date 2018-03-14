const assert = require('assert');
const sinon = require('sinon');

const StreamBuffer = require('../../../../kinesis/src/StreamBuffer');

describe('Stream Buffer', () => {
    it('Should emit "putBatch" event when buffer has put records to AWS Stream Provider as batch', () => {
        const config = {
            timeout: 60000,
            maxSize: 2
        };
        const data = {
            command: 'command name'
        };
        const awsStreamProviderStub = {};
        awsStreamProviderStub.composeRecordData = sinon.stub().returns({
            Data: 'data'
        });
        awsStreamProviderStub.batchRequest = sinon.stub().callsFake((records, stream, callback) => {
            const fakeErr = null;
            const fakeResponse = {};
            callback(fakeErr, fakeResponse);
        });
        const streamBuffer = new StreamBuffer(awsStreamProviderStub, config);
        streamBuffer.emit = sinon.spy();

        streamBuffer.put(data, 'test-stream');
        streamBuffer.put(data, 'test-stream');

        assert(streamBuffer.emit.calledOnce);
        assert(streamBuffer.emit.calledWith('putBatch', null, {}, 'test-stream'));
    });
});