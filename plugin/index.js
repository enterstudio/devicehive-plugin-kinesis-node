const { DeviceHivePlugin } = require(`devicehive-plugin-core`);

const config = require(`./plugin-config`);
const firehoseConfig = require(`./config`).firehose;
const FirehosePluginService = require('./FirehosePluginService');

DeviceHivePlugin.start(new FirehosePluginService(firehoseConfig), config);
