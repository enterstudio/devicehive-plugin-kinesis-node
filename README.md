# devicehive-plugin-kinesis-node
DeviceHive Kinesis Streaming plugin written in Node.js
# Overview
This plugin allows you to stream data in Kinesis Data Streams and Firehose Delivery Streams as it goes through DeviceHive.

# How it works

 1. Start DeviceHive
 2. Create following .env file. **Replace username, password, plugin topic, localhost, AWS region, keys and streams** and set provider you want to use: **firehose** or **dataStreams**

        ENVSEPARATOR=_
        plugin_user_login=username
        plugin_user_password=password
        plugin_plugin_topic=plugin topic
        plugin_device_hive_plugin_ws_endpoint=ws://localhost:3001
        plugin_device_hive_auth_service_api_url=http://localhost:8090/dh/rest
        kinesis_provider=firehose
        kinesis_aws_region=region
        kinesis_aws_accessKeyId=access_key_id
        kinesis_aws_secretAccessKey=secret_access_key
        kinesis_custom_commandStreams=command_streams
        kinesis_custom_notificationStreams=notification_streams
        kinesis_custom_commandUpdatesStreams=command_updates_streams

 3. Run `docker-compose up`
 4. Issue notification through DeviceHive
 5. Observe data in your AWS monitoring console

# Configuration
## Plugin
Plugin part of configuration you can find [here](https://github.com/devicehive/devicehive-plugin-core-node#configuration).
## Kinesis
You can configure Kinesis part of plugin in two ways:

 - Share `./kinesisConfig` directory as volume with docker container
 - Set configs through environment variables

<br />
Config file example:

    {
       "provider": "firehose",

       "aws": {
          "region": "",
          "accessKeyId": "",
          "secretAccessKey": ""
       },

       "custom": {
          "buffering": true,
          "bufferSize": 10,
          "bufferTimeout": 1000,
          "commandStreams": "stream-1, stream-2",
          "notificationStreams": "stream-3",
          "commandUpdatesStreams": "stream-4"
       }
    }

 - `provider` — String, can be *firehose* for Kinesis Firehose Delivery Streams or *dataStreams* for Kinesis Data Streams
 - `aws` — Your AWS configuration, please refer [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Kinesis.html#constructor-property) or [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Firehose.html#constructor-property) for details (both are the same)
 - `custom` — Object of custom configs
	 - `buffering` — Boolean, if true will buffer messages instead of immediate put. Messages will be sent as single batch by reaching max buffer size or buffer timeout
	 - `bufferSize` — Number, max amount of messages for one stream buffer must reach to trigger put to stream
	 - `bufferTimeout` — Number, timeout that must occur to trigger put to stream
	 - `commandStreams` — Comma separated strings, streams that will be used for putting commands
	 - `notificationStreams` — Array or comma separated strings, streams that will be used for putting notifications
	 - `commandUpdatesStreams` — Array or comma separated strings, streams that will be used for putting command updates

Example of configuration using environment variables:

        ENVSEPARATOR=_
        DEBUG=kinesisstreamprovider
        plugin_user_login=dhadmin
        plugin_user_password=dhadmin_#911
        plugin_plugin_topic=plugin_topic_a28fcdee-02a1-4535-a97a-f37468461872
        plugin_device_hive_plugin_ws_endpoint=ws://192.168.152.174:3001
        plugin_device_hive_auth_service_api_url=http://192.168.152.174:8090/dh/rest
        plugin_subscription_group=kinesis_plugin
        kinesis_aws_region=us-east-2
        kinesis_aws_accessKeyId=myAccessKey
        kinesis_aws_secretAccessKey=mySecretAccessKey
        kinesis_custom_buffering=true
        kinesis_custom_commandStreams=stream-1, stream-2
        kinesis_custom_notificationStreams=stream-3
        kinesis_custom_commandUpdatesStreams=stream-1
        kinesis_custom_bufferTimeout=10000
        kinesis_custom_bufferSize=5
        kinesis_provider=dataStreams
To set config property using environment variable please use *kinesis* as prefix and defined ENVSEPARATOR for nesting.