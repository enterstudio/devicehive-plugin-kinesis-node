const Buffer = require('./AWSFirehoseBuffer');

class AWSFirehoseProvider {
    constructor(awsFirehose, config) {
        this._firehose = awsFirehose;
        this._config = JSON.parse(JSON.stringify(config));
        this._streamGroups = new Map();
        this._buffer = new Buffer(this._firehose, {
            maxSize: this._config.bufferSize || 0
        });        

        if (Array.isArray(this._config.commandStreams)) {
            this.assignStreamsToCommands(this._config.commandStreams);
        }

        if (Array.isArray(this._config.notificationStreams)) {
            this.assignStreamsToNotifications(this._config.notificationStreams);
        }

        if (Array.isArray(this._config.commandUpdatesStreams)) {
            this.assignStreamsToCommandUpdates(this._config.commandUpdatesStreams);
        }
    }

    putCommand(commandData) {
        return this.putEntity(AWSFirehoseProvider.COMMAND_GROUP, commandData);
    }

    putNotification(notificationData) {
        return this.putEntity(AWSFirehoseProvider.NOTIFICATION_GROUP, notificationData);
    }

    putCommandUpdate(commandUpdateData) {
        return this.putEntity(AWSFirehoseProvider.COMMAND_UPDATES_GROUP, commandUpdateData);
    }

    putEntity(groupName, data) {
        const streams = this._streamGroups.get(groupName) || [];
        const puts = streams.map(s => this._config.buffering ? this._buffer.put(data, s) : this.put(data, s));

        return puts.length ? Promise.all(puts) : Promise.resolve(null);
    }

    put(data, streamName) {
        const record = {
            DeliveryStreamName: streamName,
            Record: {
                Data: JSON.stringify(data)
            }
        };

        return new Promise((resolve, reject) => {
            this._firehose.putRecord(record, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    }

    assignStreamsToCommands(...streamNames) {
        return this._assignStreamsToGroup(AWSFirehoseProvider.COMMAND_GROUP, ...streamNames);
    }

    assignStreamsToNotifications(...streamNames) {
        return this._assignStreamsToGroup(AWSFirehoseProvider.NOTIFICATION_GROUP, ...streamNames);
    }

    assignStreamsToCommandUpdates(...streamNames) {
        return this._assignStreamsToGroup(AWSFirehoseProvider.COMMAND_UPDATES_GROUP, ...streamNames);
    }

    _assignStreamsToGroup(group, ...streamNames) {
        const names = Array.isArray(streamNames[0]) ? streamNames[0] : streamNames;

        this._streamGroups.set(group, names);

        return this;
    }

    static get COMMAND_GROUP() { return 'commands'; }
    static get NOTIFICATION_GROUP() { return 'notifications'; }
    static get COMMAND_UPDATES_GROUP() { return 'commandUpdates'; }
}

module.exports = AWSFirehoseProvider;