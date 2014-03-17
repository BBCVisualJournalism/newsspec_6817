/* TODO : remove the dependency on Dev and call to Dev.init() in release version - Dev is used to build the JSON file and console log it */

define(['lib/news_special/bootstrap', 'data/data9'], function(news, AppData) {

    var model = {};

    model.categoryKeys = {
        "death_penalty": { displayName: "Death penalty", displayedField: "death_penalty", colour: "#cc3333", button: "death_penalty_btn", key: 1},
        "imprisonment": { displayName: "Imprisonment", displayedField: "imprisonment", colour: "#f79833", button: "imprisonment_btn", key: 2},
        "anti_law": { displayName: "Anti propaganda law", displayedField: "anti_propaganda_law", colour: "#f8b519", button: "anti_law_btn", key: 3},
        "age_consent": { displayName: "Age of consent", displayedField: "age_of_consent", colour: "#f6d173", button: "age_consent_btn", key: 4},
        "legal_acts": { displayName: "legal", displayedField: "legal", colour: "#cad8c9", button: "legal_acts_btn", key: 5},
        "anti_discrimination": { displayName: "Anti-discrimination", displayedField: "anti_discrimination", colour: "#b4c8d5", button: "anti_discrimination_btn", key: 6},
        "marriage_subsitute": { displayName: "Marriage substitute", displayedField: "marriage_substitute", colour: "#768892", button: "marriage_subsitute_btn", key: 7},
        "marriage" : { displayName: "Marriage", displayedField: "marriage", colour: "#576c78", button: "marriage_btn", key: 8}
    }
    model.isMapInteractive = true;

    // NB: mapList is not needed, it was used in other projects when a nav selection could update more than one map on the page
    model.mapVO = {categories: ["death_penalty", "imprisonment", "anti_law", "age_consent", "legal_acts", "anti_discrimination", "marriage_subsitute", "marriage"], mapList: ["map_container"]};
    model.data = AppData;
    model.isMobile = true;
    model.countryNames={};

    // valid form submitted so update Model then emit events of updated values
    function update() {
        news.pubsub.emit('update');
        //send out istats
        /*news.istats.log(
            'navigation', // action type
            "newsSpecial", // action name
            {
                "view": 'results displyed' // view/description
            }
        );*/
    }

    function switchMapInteractivity(isActive) {
        model.isMapInteractive = isActive;
    }

    // what fields need to be displayed in the thematic map
    function updateMapDisplayField(fieldName, clearCategories, mapList) {
        model.mapVO.mapList = mapList;
        if (model.isMapInteractive == false) { model.mapVO.categories = []; }

        // add/remove selected category to array
        var match = findMatch(model.mapVO.categories, fieldName);
        if (match == -1) {
            model.mapVO.categories.push(fieldName);
        } else {
            model.mapVO.categories.splice(match, 1);
        }
        news.pubsub.emit('updateMapDisplayField');
    }

    function findMatch(arr, val) {
        var match = -1;
        for (var i=0; i<arr.length; i++){
            if (arr[i] == val) {
                match = i;
            }
        }
        return match;
    }

    // controller calls init() to set up some values in the model. 
    function init(thisIsMobile, countryNamesVocab) {
        model.isMobile = thisIsMobile;
        model.countryNames = countryNamesVocab;
        //NB: in other map projects some views would initilise when the model was ready by listening for this init event.
        //news.pubsub.emit('init');
    }

    function getIsMobile() {
        return model.isMobile;
    }

    //public api
    return {
        model: model,
        init: init,
        update: update,
        getIsMobile: getIsMobile,
        updateMapDisplayField: updateMapDisplayField,
        switchMapInteractivity: switchMapInteractivity
    };

});