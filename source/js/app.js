define(['lib/news_special/bootstrap', 'lib/news_special/share_tools/controller', 'controller/controller'], function (news, shareTools, controller) {

    return {
        init: function (storyPageUrl, countryNames) {
           // news.pubsub.emit('istats', ['App initiated', true]);

            //shareTools.init('.main', storyPageUrl, 'Custom message');

            news.setIframeHeight(600);

            news.hostPageSetup(function () {
                // console.log('do something in the host page');
            });

            controller.init(false, countryNames);

        }
    };

});