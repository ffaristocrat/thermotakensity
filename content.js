$.thermotakensity = {

    applyThermotakensity: function(node) {
        node = $(node);

        let actions = node
            .find('div.ProfileTweet-actionCountList:first');

        if (!actions) return;

        let replyCount = parseFloat(actions
            .find('span.ProfileTweet-action--reply')
            .find('span.ProfileTweet-actionCount')
            .attr('data-tweet-stat-count'));

        let retweetCount = Math.max(1.0, parseFloat(actions
            .find('span.ProfileTweet-action--retweet')
            .find('span.ProfileTweet-actionCount')
            .attr('data-tweet-stat-count')));

        let favoriteCount = Math.max(1.0, parseFloat(actions
            .find('span.ProfileTweet-action--favorite')
            .find('span.ProfileTweet-actionCount')
            .attr('data-tweet-stat-count')));

        let totalInteractions = favoriteCount + retweetCount + replyCount;

        // Definitions vary as to whether you should use RTs or Likes
        // I use the average of the two for the denominator
        let theRatio = (replyCount / ((retweetCount + favoriteCount) / 2.0));

        // Only flag posts with a ratio or more than handful of interactions
        if ((theRatio <= 1.00) || (totalInteractions <= 25)) return;

        // Slight variation of the Ratio Richter
        // https://www.dataforprogress.org/the-ratio-richter-scale/
        let thermotakensity = Number(
            Math.log(theRatio) * Math.log(totalInteractions) / Math.LN10
        ).toFixed(1);

        let icon = '🔥';

        // Tweets with few interactions can often create false positives.
        // In these cases, we'll simply flag the tweet as worth watching
        if ((totalInteractions < 250.0)) {
            thermotakensity = '';
            icon = '⚠️';
        }

        // Create a new node showing the thermotakensity
        let newNode = $(
            '<div class="ProfileTweet-action ProfileTweet-action--thermotakensity">' +
                '<div class="ProfileTweet-actionButton">' +
                    '<div class="IconContainer js-tooltip" data-original-title="Thermotakensity (Ingraham Scale)">' +
                        '<span role="presentation">' + icon + '</span>' +
                    '</div>' +
                    '<span class="ProfileTweet-actionCount">' +
                        '<span class="ProfileTweet-actionCountForPresentation" aria-hidden="true">' +
                            thermotakensity + '</span>' +
                    '</span>' +
                '</div>' +
            '</div>'
        );

        // Insert it between likes & message
        $(node)
            .find('div.ProfileTweet-action--favorite')
            .after(newNode);
    },

    processMutations: function(mutations) {
        // Search each new or changed node for hot takes
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                $(node)
                    .find('div.tweet')
                    .each(function (i, tweet) {
                        $.thermotakensity.applyThermotakensity(tweet);
                    });
            });
        });
    },

    start: function() {
        console.log('$.thermotakensity: start');
        // Do a pass on existing tweets on start-up
        $(document)
            .find('div.tweet')
            .each(function (i, node) {
                $.thermotakensity.applyThermotakensity(node);
            });

        // Setup an observer to monitor for hot takes
        $.thermotakensity.observer = new MutationObserver($.thermotakensity.processMutations)
            .observe(document.body, {
                subtree: true,
                childList: true
            });
    },

    cleanup: function() {
        $.thermotakensity.observer.disconnect()
    }
};

$(document).ready(function () {
    $.thermotakensity.start();
});

$('body').bind('beforeunload',function(){
    $.thermotakensity.cleanup();
});
