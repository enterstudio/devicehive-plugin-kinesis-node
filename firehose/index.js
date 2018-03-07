const AWS = require('aws-sdk');
const merge = require('lodash.merge');

const AWSFirehoseProvider = require('./src/AWSFirehoseProvider');

const defaultConfig = require('./config');

module.exports = {
    createProvider(userConfig) {
        const config = merge({}, defaultConfig, userConfig);
        const awsFirehose = new AWS.Firehose(config.aws);

        return new AWSFirehoseProvider(awsFirehose, config.custom);
    }
};