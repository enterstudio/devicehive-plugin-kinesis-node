class StreamProviderLogger {
    constructor(log) {
        this._log = log;
    }

    attach(streamProvider) {
        const me = this;

        const putEntity = streamProvider._putEntity;
        streamProvider._putEntity = function(groupName, data) {
            const streamNames = this._streamGroups.get(groupName) || [];

            if (!streamNames.length) {
                me._log(`No streams assigned to group ${groupName}`);
            } else {
                me._log(`Putting data ${JSON.stringify(data)} to streams: ${streamNames.join()}`);
            }

            return putEntity.call(streamProvider, groupName, data);
        };

        streamProvider.onPut((err, response, streamName) => {
            if (err) {
                this._log(`Error on purring to ${streamName}: ${JSON.stringify(err)}`);
            } else {
                this._log(`Successfully put to ${streamName}: ${JSON.stringify(response)}`);
            }
        });
    }
}

module.exports = StreamProviderLogger;