const firehose = require('../firehose');
const PluginService = require('./PluginService');

class FirehosePluginService extends PluginService {
    constructor(firehoseConfig) {
        super();

        this._firehoseConfig = firehoseConfig;
        this._firehose = null;
    }

    afterStart() {
        super.afterStart();
        this._firehose = firehose.createProvider(this._firehoseConfig);
    }

    handleCommand(command) {
        super.handleCommand(command);
        return this._firehose.putCommand(command);
    }

    handleNotification(notification) {
        super.handleNotification(notification);
        return this._firehose.putNotification(notification);
    }

    handleCommandUpdate(command) {
        super.handleCommandUpdate(command);
        return this._firehose.putCommandUpdate(command);
    }
}

module.exports = FirehosePluginService;