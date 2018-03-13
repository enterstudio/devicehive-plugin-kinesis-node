const kinesis = require('../kinesis');
const PluginService = require('./PluginService');

class KinesisPluginService extends PluginService {
    constructor(kinesisConfig) {
        super();

        this._kinesisConfig = kinesisConfig;
        this._streamProvider = null;
    }

    afterStart() {
        super.afterStart();
        this._streamProvider = kinesis.createProvider(this._kinesisConfig);
    }

    handleCommand(command) {
        super.handleCommand(command);
        return this._streamProvider.putCommand(command);
    }

    handleNotification(notification) {
        super.handleNotification(notification);
        return this._streamProvider.putNotification(notification);
    }

    handleCommandUpdate(command) {
        super.handleCommandUpdate(command);
        return this._streamProvider.putCommandUpdate(command);
    }
}

module.exports = KinesisPluginService;