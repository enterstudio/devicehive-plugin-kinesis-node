const kinesis = require('../kinesis');
const PluginService = require('./PluginService');

class KinesisPluginService extends PluginService {
    constructor(kinesisConfig) {
        super();

        this._kinesisConfig = kinesisConfig;
        this._provider = null;
    }

    afterStart() {
        super.afterStart();
        this._provider = kinesis.createProvider(this._kinesisConfig);
    }

    handleCommand(command) {
        super.handleCommand(command);
        return this._provider.putCommand(command);
    }

    handleNotification(notification) {
        super.handleNotification(notification);
        return this._provider.putNotification(notification);
    }

    handleCommandUpdate(command) {
        super.handleCommandUpdate(command);
        return this._provider.putCommandUpdate(command);
    }
}

module.exports = KinesisPluginService;