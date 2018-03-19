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

        if (!this._provider) {
            this.onError('AWS Stream Provider has not been initialized, please check "provider" property in configuration');
        } else {
            this._provider.onPut((err, res, stream) => {
                if (err) {
                    this.onError(`Error putting to ${stream}`);
                    this.onError(err);
                }
            });
        }
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