const AWS = require('aws-sdk');
const merge = require('lodash.merge');

const KinesisUtils = require('./lib/KinesisUtils');
const AWSFirehoseProvider = require('./firehose');
const AWSKinesisDataStreamsProvider = require('./dataStreams');

const defaultConfig = require('./config');

module.exports = {
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

        return provider;
    }
};