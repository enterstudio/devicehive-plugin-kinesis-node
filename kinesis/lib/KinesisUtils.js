class KinesisUtils {
    static formatStreamGroups(config) {
        config.commandStreams = KinesisUtils.commaSeparatedToArray(config.commandStreams);
        config.notificationStreams = KinesisUtils.commaSeparatedToArray(config.notificationStreams);
        config.commandUpdatesStreams = KinesisUtils.commaSeparatedToArray(config.commandUpdatesStreams);

        return config;
    }

    static commaSeparatedToArray(str) {
        if (typeof str !== 'string') {
            return str;
        }

        return str.split(',').map(s => s.trim());
    }
}

module.exports = KinesisUtils;