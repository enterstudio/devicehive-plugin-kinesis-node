const EventEmitter = require('events');

const StreamBuffer = require('./StreamBuffer');

class BaseStreamProvider {
    constructor(streamProvider, config) {
        this._provider = streamProvider;
        this._config = JSON.parse(JSON.stringify(config));
        this._streamGroups = new Map();
        this._buffer = this._createBuffer();
        this._eventEmitter = new EventEmitter();

        this._assignStreams();
        this._initializeBufferEvents();
    }

    _createBuffer() {
        if (this._config.buffering) {
            return new StreamBuffer({
                maxSize: this._config.bufferSize || 0,
                timeout: this._config.bufferTimeout
            });
        }

        return null;
    }

    _assignStreams() {
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

    _initializeBufferEvents() {
        if (!this._buffer) {
            return;
        }

        this._buffer.on('putBatch', (bufferedRecords, streamName) => {
            const records = [];

            bufferedRecords.forEach(record => {
                records.push(this._composeRecordData(record));
            });

            if (records.length) {
                this._batchRequest(records, streamName, (err, response) => {
                    this._eventEmitter.emit('put', err, response, streamName);
                });
            }
        });
    }

    putCommand(commandData) {
        return this._putEntity(BaseStreamProvider.COMMAND_GROUP, commandData);
    }

    putNotification(notificationData) {
        return this._putEntity(BaseStreamProvider.NOTIFICATION_GROUP, notificationData);
    }

    putCommandUpdate(commandUpdateData) {
        return this._putEntity(BaseStreamProvider.COMMAND_UPDATES_GROUP, commandUpdateData);
    }

    _putEntity(groupName, data) {
        const streams = this._streamGroups.get(groupName) || [];
        const puts = streams.map(s => this._buffer ? this._buffer.put(data, s) : this._put(data, s));

        return puts.length ? Promise.all(puts) : Promise.resolve(null);
    }

    _put(data, streamName) {
        return new Promise((resolve, reject) => {
            this._request(data, streamName, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }

                this._eventEmitter.emit('put', err, response, streamName);
            });
        });
    }

    _request(data, streamName, callback = (err, response) => {}) {
        throw new TypeError('_request is not implemented');
    }

    _batchRequest(records, streamName, callback = () => {}) {
        throw new TypeError('_batchRequest is not implemented');
    }

    onPut(callback) {
        if (callback && typeof callback === 'function') {
            this._eventEmitter.on('put', callback);
        }

        return this;
    }

    assignStreamsToCommands(...streamNames) {
        return this._assignStreamsToGroup(BaseStreamProvider.COMMAND_GROUP, ...streamNames);
    }

    assignStreamsToNotifications(...streamNames) {
        return this._assignStreamsToGroup(BaseStreamProvider.NOTIFICATION_GROUP, ...streamNames);
    }

    assignStreamsToCommandUpdates(...streamNames) {
        return this._assignStreamsToGroup(BaseStreamProvider.COMMAND_UPDATES_GROUP, ...streamNames);
    }

    _assignStreamsToGroup(group, ...streamNames) {
        const names = Array.isArray(streamNames[0]) ? streamNames[0] : streamNames;

        this._streamGroups.set(group, names);

        return this;
    }

    _composeRecordData(record) {
        throw new TypeError('_composeRecordData is not implemented');
    }

    static get COMMAND_GROUP() { return 'commands'; }
    static get NOTIFICATION_GROUP() { return 'notifications'; }
    static get COMMAND_UPDATES_GROUP() { return 'commandUpdates'; }
}


module.exports = BaseStreamProvider;