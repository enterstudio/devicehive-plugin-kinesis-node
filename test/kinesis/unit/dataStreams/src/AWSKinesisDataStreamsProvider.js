const assert = require('assert');
const sinon = require('sinon');

const crc = require('crc');

const DataStreamsProvider = require('../../../../../kinesis/dataStreams/src/AWSKinesisDataStreamsProvider');

const CONFIG = {
    buffering: false
};

let awsKinesisStub;
let dataStreamsProvider;

describe('AWS Kinesis Data Streams Provider', () => {
    beforeEach(() => {
        awsKinesisStub = {
            putRecord: sinon.spy(),
            putRecords: sinon.spy()
        };
        dataStreamsProvider = new DataStreamsProvider(awsKinesisStub, CONFIG);
    });

    it('Should put record in all Kinesis data streams assigned to commands group', () => {
        const data = {
            command: 'command name'
        };
        dataStreamsProvider.assignStreamsToCommands('command-stream-1', 'command-stream-2', 'command-stream-3');

        dataStreamsProvider.putCommand(data);

        assert(awsKinesisStub.putRecord.calledThrice);
        assert.equal(awsKinesisStub.putRecord.firstCall.args[0].StreamName, 'command-stream-1');
        assert.equal(awsKinesisStub.putRecord.secondCall.args[0].StreamName, 'command-stream-2');
        assert.equal(awsKinesisStub.putRecord.thirdCall.args[0].StreamName, 'command-stream-3');
    });

    it('Should put record in all Kinesis data streams assigned to notifications group', () => {
        const data = {
            notification: 'notification name'
        };
        dataStreamsProvider.assignStreamsToNotifications('notification-stream-1', 'notification-stream-2', 'notification-stream-3');

        dataStreamsProvider.putNotification(data);

        assert(awsKinesisStub.putRecord.calledThrice);
        assert.equal(awsKinesisStub.putRecord.firstCall.args[0].StreamName, 'notification-stream-1');
        assert.equal(awsKinesisStub.putRecord.secondCall.args[0].StreamName, 'notification-stream-2');
        assert.equal(awsKinesisStub.putRecord.thirdCall.args[0].StreamName, 'notification-stream-3');
    });

    it('Should put record in all Kinesis data streams assigned to command updates group', () => {
        const data = {
            command: 'command name'
        };
        dataStreamsProvider.assignStreamsToCommandUpdates('command-update-stream-1', 'command-update-stream-2', 'command-update-stream-3');

        dataStreamsProvider.putCommandUpdate(data);

        assert(awsKinesisStub.putRecord.calledThrice);
        assert.equal(awsKinesisStub.putRecord.firstCall.args[0].StreamName, 'command-update-stream-1');
        assert.equal(awsKinesisStub.putRecord.secondCall.args[0].StreamName, 'command-update-stream-2');
        assert.equal(awsKinesisStub.putRecord.thirdCall.args[0].StreamName, 'command-update-stream-3');
    });

    it('Should use CRC32 as PartitionKey', () => {
        const data = {
            command: 'command name'
        };
        const expected = crc.crc32(JSON.stringify(data)).toString(16);
        dataStreamsProvider.assignStreamsToCommands('commands');

        dataStreamsProvider.putCommand(data);

        assert.equal(awsKinesisStub.putRecord.firstCall.args[0].PartitionKey, expected);
    });

    it('Should execute callback on put', () => {
        const data = {
            test: 'test'
        };
        awsKinesisStub.putRecord = sinon.stub().callsFake((params, callback) => {
            const fakeErr = null;
            const fakeResponse = {};
            callback(fakeErr, fakeResponse);
        });
        dataStreamsProvider.assignStreamsToCommands('test');

        const callback = sinon.spy();
        dataStreamsProvider.onPut(callback);

        dataStreamsProvider.putCommand(data);

        assert(callback.calledWith(null, {}, 'test'));
    });

    it('Should buffer messages and put as batch by reaching specified size', () => {
        const config = {
            buffering: true,
            bufferSize: 3
        };
        const data = {
            command: 'command name'
        };
        dataStreamsProvider = new DataStreamsProvider(awsKinesisStub, config).assignStreamsToCommands('command-stream');

        dataStreamsProvider.putCommand(data);
        dataStreamsProvider.putCommand(data);
        dataStreamsProvider.putCommand(data);

        assert(awsKinesisStub.putRecords.calledOnce);
    });

    it('Should buffer messages and put as batch by timeout', done => {
        const config = {
            buffering: true,
            bufferTimeout: 10,
            bufferSize: 1000
        };
        const data = {
            command: 'command name'
        };
        dataStreamsProvider = new DataStreamsProvider(awsKinesisStub, config).assignStreamsToCommands('command-stream');

        dataStreamsProvider.putCommand(data);
        dataStreamsProvider.putCommand(data);
        dataStreamsProvider.putCommand(data);

        assert(awsKinesisStub.putRecords.notCalled);

        setTimeout(() => {
            assert(awsKinesisStub.putRecords.calledOnce);
            done();
        }, 10);
    });
});