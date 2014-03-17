define(['lib/news_special/bootstrap', 'app'],  function (news, app) {

    beforeEach(function () {
        news.$('body').append('<li id="death_penalty_btn" class="map_button active"><span>Death penalty</span></li>');
    });

    afterEach(function () {
        //news.$('.main').remove();
    });

    describe('app', function () {
        app.init();
        it('', function () {
            expect(true).toBeTruthy();
        });
    });

});