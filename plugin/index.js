const { DeviceHivePlugin } = require(`devicehive-plugin-core`);

const config = require(`./plugin-config`);
const kinesisConfig = require(`./config`).kinesis;
const KinesisPluginService = require('./KinesisPluginService');

DeviceHivePlugin.start(new KinesisPluginService(kinesisConfig), config);
