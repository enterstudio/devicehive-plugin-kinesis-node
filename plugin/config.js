const configurator = require('json-evn-configurator');

const IGNORE_CONFIG_CASE = true;
const firehoseConf = configurator(require('../firehoseConfig/config'), 'firehose', IGNORE_CONFIG_CASE);

module.exports = {
    firehose: firehoseConf
};