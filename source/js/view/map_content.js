// Graph Class used to create and draw an instance of an graph
// Originally this will be just a straight image swap
define(['lib/news_special/bootstrap', 'model/model'], function(news, Model) {


	// Graph constructor
	var MapContent = function(mapId) {
		this.MAP_ID = mapId;
		this.MAP_CONTAINER = "#" + mapId;
		var that = this;
		news.pubsub.on('updateMapDisplayField', function () { that.updateMapContent(); });
		return this;
	}

	// drawing a map code and comments taken from tutorial on http://bost.ocks.org/mike/map/
	// data stored in topoJSON format, needs to be converted to geoJSON
	MapContent.prototype.initMapContent = function(error, world) {
		this.updateMapContent();
	}

	// update graph image
	MapContent.prototype.updateMapContent = function() {
		// get category from model
		var vaccineId = Model.mapVO.vaccine;
		var category = Model.vaccines[vaccineId].displayedField;

		// HTML ids match the categories
		var nodeId = "#map_content_" + category;

		var textNode = nodeId + " .map_information";
		var colourKeyNode = nodeId + " .ns__key_legend";
		var colourKeyToCopy = news.$(colourKeyNode).html();
		var textToCopy = news.$(textNode).html();



		// copy static content into dynamic container
		news.$(this.MAP_CONTAINER + "  .ns__key_legend").html(colourKeyToCopy);
		news.$(this.MAP_CONTAINER + " .map_information").html(textToCopy);
		//var imageId = "graph_" + category + ""; // prefix + category + suffix. This is unecessary if prefix and suffix are blank
		// use category to find image with id = displayField2
		//var imgSrc = document.getElementById(imageId).src;
		//var imgHTML = document.getElementById(imageId).innerHTML;
		// add image to the graph container
		//news.$(this.GRAPH_CONTAINER).html(imgHTML);
	}

	return MapContent;

});