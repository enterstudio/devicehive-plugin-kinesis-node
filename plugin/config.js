const configurator = require('json-evn-configurator');

const firehoseConf = configurator(require('../firehoseConfig/config'), 'firehose');

module.exports = {
    firehose: firehoseConf
};