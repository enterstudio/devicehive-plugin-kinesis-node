class FirehoseUtils {
    static formatStreamGroups(config) {
        config.commandStreams = FirehoseUtils.commaSeparatedToArray(config.commandStreams);
        config.notificationStreams = FirehoseUtils.commaSeparatedToArray(config.notificationStreams);
        config.commandUpdatesStreams = FirehoseUtils.commaSeparatedToArray(config.commandUpdatesStreams);

        return config;
    }

    static commaSeparatedToArray(str) {
        if (typeof str !== 'string') {
            return str;
        }

        return str.split(',').map(s => s.trim());
    }
}

module.exports = FirehoseUtils;