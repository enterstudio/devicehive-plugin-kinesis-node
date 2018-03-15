const EventEmitter = require('events');

const StreamBuffer = require('./StreamBuffer');

class BaseStreamProvider {
    /**
     * Constructs StreamProvider object
     * @param {AWS.Kinesis|AWS.Firehose} streamProvider
     * @param {Object} config
     */
    constructor(streamProvider, config) {
        this._provider = streamProvider;
        this._config = JSON.parse(JSON.stringify(config));
        this._streamGroups = new Map();
        this._buffer = this._createBuffer();
        this._eventEmitter = new EventEmitter();

        this._assignStreams();
        this._initializeBufferEvents();
    }

    /**
     * Creates buffer for this stream provider
     * @returns {StreamBuffer|null}
     * @private
     */
    _createBuffer() {
        if (this._config.buffering) {
            return new StreamBuffer({
                maxSize: this._config.bufferSize || 0,
                timeout: this._config.bufferTimeout
            });
        }

        return null;
    }

    /**
     * Assigns streams to groups based on config
     * @private
     */
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

    /**
     * Binds handlers to StreamBuffer events
     * @private
     */
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

    /**
     * Puts command to stream
     * @param {Object} commandData
     * @returns {*}
     */
    putCommand(commandData) {
        return this._putEntity(BaseStreamProvider.COMMAND_GROUP, commandData);
    }

    /**
     * Puts notification to stream
     * @param {Object} notificationData
     * @returns {*}
     */
    putNotification(notificationData) {
        return this._putEntity(BaseStreamProvider.NOTIFICATION_GROUP, notificationData);
    }

    /**
     * Puts command update to stream
     * @param {Object} commandUpdateData
     * @returns {*}
     */
    putCommandUpdate(commandUpdateData) {
        return this._putEntity(BaseStreamProvider.COMMAND_UPDATES_GROUP, commandUpdateData);
    }

    /**
     * Puts data to buffer if buffering is enabled else makes put request to AWS
     * @param {string} groupName
     * @param {*} data
     * @returns {Promise<*>}
     * @private
     */
    _putEntity(groupName, data) {
        const streams = this._streamGroups.get(groupName) || [];
        const puts = streams.map(s => this._buffer ? this._buffer.put(data, s) : this._put(data, s));

        return puts.length ? Promise.all(puts) : Promise.resolve(null);
    }

    /**
     * Promisify put request and emit event on put response
     * @param {*} data
     * @param {string} streamName
     * @returns {Promise<any>}
     * @private
     */
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

    /**
     * Makes put request to AWS
     * @param {*} data
     * @param {string} streamName
     * @param {Function} [callback]
     * @private
     * @abstract
     */
    _request(data, streamName, callback = (err, response) => {}) {
        throw new TypeError('_request is not implemented');
    }

    /**
     * Makes batched put request to AWS
     * @param {Array} records
     * @param {string} streamName
     * @param {Function} [callback]
     * @private
     * @abstract
     */
    _batchRequest(records, streamName, callback = () => {}) {
        throw new TypeError('_batchRequest is not implemented');
    }

    /**
     * Binds handler which will be executed when data is actually put to stream
     * @param {Function} callback
     * @returns {BaseStreamProvider}
     */
    onPut(callback) {
        if (callback && typeof callback === 'function') {
            this._eventEmitter.on('put', callback);
        }

        return this;
    }

    /**
     * Assigns streams to command group
     * @param {...string} streamNames
     * @returns {BaseStreamProvider}
     */
    assignStreamsToCommands(...streamNames) {
        return this._assignStreamsToGroup(BaseStreamProvider.COMMAND_GROUP, ...streamNames);
    }

    /**
     * Assigns streams to notification group
     * @param {...string} streamNames
     * @returns {BaseStreamProvider}
     */
    assignStreamsToNotifications(...streamNames) {
        return this._assignStreamsToGroup(BaseStreamProvider.NOTIFICATION_GROUP, ...streamNames);
    }

    /**
     * Assigns streams to command updates group
     * @param {...string} streamNames
     * @returns {BaseStreamProvider}
     */
    assignStreamsToCommandUpdates(...streamNames) {
        return this._assignStreamsToGroup(BaseStreamProvider.COMMAND_UPDATES_GROUP, ...streamNames);
    }

    /**
     * Assigns given streams to given group
     * @param {string} group
     * @param {...string} streamNames
     * @returns {BaseStreamProvider}
     * @private
     */
    _assignStreamsToGroup(group, ...streamNames) {
        const names = Array.isArray(streamNames[0]) ? streamNames[0] : streamNames;

        this._streamGroups.set(group, names);

        return this;
    }

    /**
     * Creates data object from given record
     * @param {Object} record
     * @private
     * @abstract
     */
    _composeRecordData(record) {
        throw new TypeError('_composeRecordData is not implemented');
    }

    static get COMMAND_GROUP() { return 'commands'; }
    static get NOTIFICATION_GROUP() { return 'notifications'; }
    static get COMMAND_UPDATES_GROUP() { return 'commandUpdates'; }
}


module.exports = BaseStreamProvider;