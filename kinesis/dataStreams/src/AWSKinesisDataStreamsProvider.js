const EventEmitter = require('events');
const crc = require('crc');

const DataStreamsBuffer = require('./AWSKinesisDataStreamsBuffer');

class AWSKinesisDataStreamsProvider {
    constructor(awsKinesisDataStreams, config) {
        this._dataStreams = awsKinesisDataStreams;
        this._config = JSON.parse(JSON.stringify(config));
        this._streamGroups = new Map();
        this._buffer = new DataStreamsBuffer(this._dataStreams, {
            maxSize: this._config.bufferSize || 0,
            timeout: this._config.bufferTimeout
        });
        this._eventEmitter = new EventEmitter();

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
        return this._putEntity(AWSKinesisDataStreamsProvider.COMMAND_GROUP, commandData);
    }

    putNotification(notificationData) {
        return this._putEntity(AWSKinesisDataStreamsProvider.NOTIFICATION_GROUP, notificationData);
    }

    putCommandUpdate(commandUpdateData) {
        return this._putEntity(AWSKinesisDataStreamsProvider.COMMAND_UPDATES_GROUP, commandUpdateData);
    }

    _putEntity(groupName, data) {
        const streams = this._streamGroups.get(groupName) || [];
        const puts = streams.map(s => this._config.buffering ? this._buffer.put(data, s) : this._put(data, s));

        return puts.length ? Promise.all(puts) : Promise.resolve(null);
    }

    _put(data, streamName) {
        const stringData = JSON.stringify(data);
        const record = {
            StreamName: streamName,
            Data: stringData,
            PartitionKey: crc.crc32(stringData).toString(16)
        };

        return new Promise((resolve, reject) => {
            this._dataStreams.putRecord(record, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }

                this._eventEmitter.emit('put', err, response, streamName);
            });
        });
    }

    onPut(callback) {
        if (callback && typeof callback === 'function') {
            if (this._config.buffering) {
                this._buffer.on('putBatch', callback);
            } else {
                this._eventEmitter.on('put', callback);
            }
        }

        return this;
    }

    assignStreamsToCommands(...streamNames) {
        return this._assignStreamsToGroup(AWSKinesisDataStreamsProvider.COMMAND_GROUP, ...streamNames);
    }

    assignStreamsToNotifications(...streamNames) {
        return this._assignStreamsToGroup(AWSKinesisDataStreamsProvider.NOTIFICATION_GROUP, ...streamNames);
    }

    assignStreamsToCommandUpdates(...streamNames) {
        return this._assignStreamsToGroup(AWSKinesisDataStreamsProvider.COMMAND_UPDATES_GROUP, ...streamNames);
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

module.exports = AWSKinesisDataStreamsProvider;