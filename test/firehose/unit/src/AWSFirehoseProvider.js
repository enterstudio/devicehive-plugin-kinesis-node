const assert = require('assert');
const sinon = require('sinon');

const FirehoseProvider = require('../../../../firehose/src/AWSFirehoseProvider');

const CONFIG = {
    buffering: false
};

let awsFirehoseStub;
let firehoseProvider;

describe('AWS Firehose Provider', () => {
    beforeEach(() => {
        awsFirehoseStub = {
            putRecord: sinon.spy()
        };
        firehoseProvider = new FirehoseProvider(awsFirehoseStub, CONFIG);
    });

    it('Should put record in Firehose stream', () => {
        const data = {
            test: 'my test data'
        };

        firehoseProvider.put(data, 'my-stream');

        const expectedRecord = {
            Data: '{"test":"my test data"}'
        };
        assert(awsFirehoseStub.putRecord.calledOnce);

        assert('Record' in awsFirehoseStub.putRecord.firstCall.args[0]);
        assert.deepEqual(awsFirehoseStub.putRecord.firstCall.args[0].Record, expectedRecord);
    });

    it('Should put record in all Firehose streams assigned to commands group', () => {
        const data = {
            command: 'command name'
        };
        firehoseProvider.assignStreamsToCommands('command-stream-1', 'command-stream-2', 'command-stream-3');

        firehoseProvider.putCommand(data);

        assert(awsFirehoseStub.putRecord.calledThrice);
        assert.equal(awsFirehoseStub.putRecord.firstCall.args[0].DeliveryStreamName, 'command-stream-1');
        assert.equal(awsFirehoseStub.putRecord.secondCall.args[0].DeliveryStreamName, 'command-stream-2');
        assert.equal(awsFirehoseStub.putRecord.thirdCall.args[0].DeliveryStreamName, 'command-stream-3');
    });

    it('Should put record in all Firehose streams assigned to notifications group', () => {
        const data = {
            notification: 'notification name'
        };
        firehoseProvider.assignStreamsToNotifications('notification-stream-1', 'notification-stream-2', 'notification-stream-3');

        firehoseProvider.putNotification(data);

        assert(awsFirehoseStub.putRecord.calledThrice);
        assert.equal(awsFirehoseStub.putRecord.firstCall.args[0].DeliveryStreamName, 'notification-stream-1');
        assert.equal(awsFirehoseStub.putRecord.secondCall.args[0].DeliveryStreamName, 'notification-stream-2');
        assert.equal(awsFirehoseStub.putRecord.thirdCall.args[0].DeliveryStreamName, 'notification-stream-3');
    });

    it('Should put record in all Firehose streams assigned to command updates group', () => {
        const data = {
            command: 'command name'
        };
        firehoseProvider.assignStreamsToCommandUpdates('command-update-stream-1', 'command-update-stream-2', 'command-update-stream-3');

        firehoseProvider.putCommandUpdate(data);

        assert(awsFirehoseStub.putRecord.calledThrice);
        assert.equal(awsFirehoseStub.putRecord.firstCall.args[0].DeliveryStreamName, 'command-update-stream-1');
        assert.equal(awsFirehoseStub.putRecord.secondCall.args[0].DeliveryStreamName, 'command-update-stream-2');
        assert.equal(awsFirehoseStub.putRecord.thirdCall.args[0].DeliveryStreamName, 'command-update-stream-3');
    });
});