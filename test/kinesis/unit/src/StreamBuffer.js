const assert = require('assert');
const sinon = require('sinon');

const StreamBuffer = require('../../../../kinesis/src/StreamBuffer');

describe('Stream Buffer', () => {
    it('Should emit "putBatch" event when buffer has reached maximum capacity for some stream', () => {
        const config = {
            timeout: 60000,
            maxSize: 2
        };
        const data = {
            command: 'command name'
        };
        const streamBuffer = new StreamBuffer(config);
        streamBuffer.emit = sinon.spy();

        streamBuffer.put(data, 'test-stream');
        streamBuffer.put(data, 'test-stream');

        assert(streamBuffer.emit.calledOnce);
        assert(streamBuffer.emit.calledWith('putBatch', [ data, data ], 'test-stream'));
    });

    it('Should emit "putBatch" event when buffer timeout takes place', done => {
        const config = {
            timeout: 1,
            maxSize: 1000
        };
        const data = {
            command: 'command name'
        };
        const streamBuffer = new StreamBuffer(config);
        streamBuffer.emit = sinon.spy();

        streamBuffer.put(data, 'test-stream');
        streamBuffer.put(data, 'test-stream');

        asyncAssertion(() => {
            assert(streamBuffer.emit.calledOnce);
            assert(streamBuffer.emit.calledWith('putBatch', [ data, data ], 'test-stream'));
            done();
        });
    });
});

function asyncAssertion(callback) {
    setTimeout(callback, 0);
}