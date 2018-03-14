const configurator = require('json-evn-configurator');

const IGNORE_CONFIG_CASE = true;
const kinesisConf = configurator(require('../kinesisConfig/config'), 'kinesis', IGNORE_CONFIG_CASE);

module.exports = {
    kinesis: kinesisConf
};