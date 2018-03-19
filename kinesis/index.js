const AWS = require('aws-sdk');
const merge = require('lodash.merge');
const debug = require('debug')('kinesisstreamprovider');

const KinesisUtils = require('./lib/KinesisUtils');
const AWSFirehoseProvider = require('./firehose');
const AWSKinesisDataStreamsProvider = require('./dataStreams');
const StreamProviderLogger = require('./src/StreamProviderLogger');

const defaultConfig = require('./config');

module.exports = {
    /**
     * Create provider based on provider type defined in config
     * @param {Object} userConfig
     * @returns {BaseStreamProvider}
     */
    createProvider(userConfig) {
        const config = merge({}, defaultConfig, userConfig);
        KinesisUtils.formatStreamGroups(config.custom);

        let provider = null;

        switch (userConfig.provider) {
            case 'firehose':
                const awsFirehose = new AWS.Firehose(config.aws);
                provider = new AWSFirehoseProvider(awsFirehose, config.custom);
                break;
            case 'dataStreams':
                const awsKinesis = new AWS.Kinesis(config.aws);
                provider = new AWSKinesisDataStreamsProvider(awsKinesis, config.custom);
                break;
        }

        new StreamProviderLogger(debug).attach(provider);

        if (provider.bufferingEnabled()) {
            debug('Buffering is enabled');
        } else {
            debug('Buffering is disabled');
        }

        return provider;
    }
};