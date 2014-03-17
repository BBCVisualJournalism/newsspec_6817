var svgSupport = (!! document.createElementNS && !! document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect) ? true : false;

define(['lib/news_special/bootstrap', 'model/model', 'view/map', 'data/worldmap2_multiline', 'lib/vendors/topojson/topojson.v1.min'],
    function (news, Model, Map, WorldMap) {
		/* variables for Steve's share code */
		var shareModel;
        var shareView;
        var mainMap;
		function init(isMobile, countryNames) {
            if (svgSupport) {
    			Model.init(isMobile, countryNames);
                // Create 2 maps
                //w: width, h: height, tx: -20, ty: 50, scale: 115,
                //var mapVO = { w: 642, h: 300, tx: -20, ty: 50, cssBoundaryWidth: 1, scale: 115, path: "data/map/world_multiline.json", mapId: "map_container", infoboxId: "info_box", category: "rank"};
                var mapVO = { w: 642, h: 300, tx: -30, ty: 0, cssBoundaryWidth: 1, scale: 100, mapId: "map_container", infoboxId: "info_box"};
                //var mapVO = { w: 321, h: 150, tx: -10, ty: 25, cssBoundaryWidth: 1, scale: 50, mapId: "map_container", infoboxId: "info_box"};
                mainMap = new Map(mapVO);
                mainMap.initMap(WorldMap);
                
                
                // toggle button off then back on again to initiate pressing a category to colour in map
                mapButtonClicked("death_penalty", ["map_container"]);
                mapButtonClicked("death_penalty", ["map_container"]);

                addUserEvents();

            } else {
                news.$(".js_svg_content").hide();
                news.$("#newsspec_6079.ns__desktop .static_container").show();
            }
            getBrowserWidth();
		}

		function addUserEvents() {
            document.getElementById("death_penalty_btn").onclick = function () { mapButtonClicked("death_penalty", ["map_container"], "measles_nav_top"); };
            document.getElementById("imprisonment_btn").onclick = function () { mapButtonClicked("imprisonment", ["map_container"], "measles_nav_top"); };
            document.getElementById("anti_law_btn").onclick = function () { mapButtonClicked("anti_law", ["map_container"], "measles_nav_top"); };
            document.getElementById("age_consent_btn").onclick = function () { mapButtonClicked("age_consent", ["map_container"], "measles_nav_top"); };
            document.getElementById("legal_acts_btn").onclick = function () { mapButtonClicked("legal_acts", ["map_container"], "measles_nav_top"); };
            document.getElementById("anti_discrimination_btn").onclick = function () { mapButtonClicked("anti_discrimination", ["map_container"], "measles_nav_top"); };
            document.getElementById("marriage_subsitute_btn").onclick = function () { mapButtonClicked("marriage_subsitute", ["map_container"], "measles_nav_top"); };
            document.getElementById("marriage_btn").onclick = function () { mapButtonClicked("marriage", ["map_container"], "measles_nav_top"); };
            //document.getElementById("map1_reset").onclick = function () { mainMap.resetMap(); };
            window.addEventListener("resize", function () { getBrowserWidth(); }, false);
            document.getElementById("map_select_list").onchange = function() {mapSelectionListChanged(); };
		}

        // selection list should appear in place of the nav buttons on browsers<780px
        // nav buttons can toggle categories on/off whereas this selection list just displays the selected category
        function mapSelectionListChanged() {
            var node = document.getElementById("map_select_list");
            var categoryId = node.options[node.selectedIndex].value;
            mapButtonClicked(categoryId, ["map_container"], categoryId);
        }


        // when the browser window < 780 stop click and rollover actions on the map
        function getBrowserWidth() {
            var windowWidth = news.$(window).width(); 
            if (windowWidth<650){ // 780
                Model.switchMapInteractivity (false);
            } else {
                Model.switchMapInteractivity (true);
            }
        }


        function mapButtonClicked(fieldName, mapList, iStatsComment) {
            news.pubsub.emit('categoryClicked', [iStatsComment]);
            var clearCategories = false;
            Model.updateMapDisplayField(fieldName, clearCategories, mapList);
            // this should be called by event being fired from Model
            hightlightNav();
        }

        // quick hack for nav view to highlight selected tabs
        function hightlightNav() {
            // clear class nav_selected from 8 tabs
            news.$("#death_penalty_btn").removeClass("nav_selected");
            news.$("#imprisonment_btn").removeClass("nav_selected");
            news.$("#anti_law_btn").removeClass("nav_selected");
            news.$("#age_consent_btn").removeClass("nav_selected");
            news.$("#legal_acts_btn").removeClass("nav_selected");
            news.$("#anti_discrimination_btn").removeClass("nav_selected");
            news.$("#marriage_subsitute_btn").removeClass("nav_selected");
            news.$("#marriage_btn").removeClass("nav_selected");

            // add clear to 2 tabs
            // loop through model to find out what categories need to highlighted
            var categories = Model.model.mapVO.categories;
            for (var i=0; i<categories.length; i++){
                news.$("#" + categories[i] + "_btn").addClass("nav_selected");
            }
        }

        news.pubsub.on('resetClicked', function (resetAction) {
            /*news.istats.log(
                'navigation', // action type
                "newsSpecial", // action name
                {
                    "view": resetAction // view/description
                }
            );*/
        });

        news.pubsub.on('countryClicked', function (countryAction) {
            /*news.istats.log(
                'navigation', // action type
                "newsSpecial", // action name
                {
                    "view": countryAction // view/description
                }
            );*/
        });

        news.pubsub.on('categoryClicked', function (categoryAction) {
            /*news.istats.log(
                'navigation', // action type
                "newsSpecial", // action name
                {
                    "view": categoryAction // view/description
                }
            );*/
        });




        return {
            init: init
        };
    });