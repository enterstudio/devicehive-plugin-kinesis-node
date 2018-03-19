class KinesisUtils {
    /**
     * Formats stream assignment to groups from comma separated strings to array
     * @param config
     * @returns {*}
     */
    static formatStreamGroups(config) {
        config.commandStreams = KinesisUtils.commaSeparatedToArray(config.commandStreams);
        config.notificationStreams = KinesisUtils.commaSeparatedToArray(config.notificationStreams);
        config.commandUpdatesStreams = KinesisUtils.commaSeparatedToArray(config.commandUpdatesStreams);

        return config;
    }

    /**
     * Convert comma separated strings to array
     * @param str
     * @returns {*}
     */
    static commaSeparatedToArray(str) {
        if (typeof str !== 'string') {
            return str;
        }

        return str.split(',').map(s => s.trim());
    }
}

module.exports = KinesisUtils;