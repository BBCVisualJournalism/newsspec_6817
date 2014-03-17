// Map Class used to create and draw an instance of an SVG map using the d3 library
define(['lib/news_special/bootstrap', 'model/model', 'lib/vendors/d3/d3.v3.min', 'lib/vendors/topojson/topojson.v1.min'], function(news, Model, d3NameSpace, topojsonNameSpace) {
	// NB: d3 and topojson are not AMD modules so don't match their dependency file to a namespace
	// d3 has the global variable d3, topojson has the global variable topojson
	// TODO: could put a define at bottom of js file similar to jquery so it can be used as a module also
	var RESET_TEXT = document.getElementById("mapcta2").innerHTML;
	var NO_DATA_TEXT = "No data";
	// Map constructor
	// Argument - MapVO - object containing following properties
	
	/*
	 w: 564,
	 h: 370,
	 path: "/news/special/2013/newsspec_6079/data/map/world.json",
	 mapId: "#map_container",
	 infoboxId: "#info_box",
	 category: "rank"};
	
	*/
	// TODO: add country border width, x and y to mapVO
	// if x is not defined then x = this.width/2
	// if y is not defined then y = this.height/2
	var Map = function(mapVO) {
		this.centered = null;
		this.path = null;
		this.svg = null;
		this.g = null;
		this.width = mapVO.w;
		this.height = mapVO.h;
		this.tx = this.width / 2;
		this.ty = this.height / 2;
		this.scale = 100;
		this.cssBoundaryWidth = 1;
		if (mapVO.hasOwnProperty('tx')) { this.tx += mapVO.tx; }
		if (mapVO.hasOwnProperty('ty')) { this.ty += mapVO.ty; }
		if (mapVO.hasOwnProperty('scale')) { this.scale = mapVO.scale; }
		if (mapVO.hasOwnProperty('cssBoundaryWidth')) { this.cssBoundaryWidth = mapVO.cssBoundaryWidth; }

		this.MAP_PATH = mapVO.path;
		this.MAP_ID = mapVO.mapId;
		this.MAP_CONTAINER = "#" + mapVO.mapId;
		this.INFOBOX_ID = mapVO.infoboxId;
		this.INFOBOX_CONTAINER = "#" + mapVO.infoboxId;
		this.displayField = mapVO.category;
		var that = this;
		news.pubsub.on('updateMapDisplayField', function () { that.updateMapColours(); });
		window.addEventListener("resize", function () {
                that.resizeMap();
            }, false);

		return this;

	}


	// call init from the controller if different maps are needed
	// otherwise load one map in the controller and then call initMap instead
	
	// NB the use of self. if i just called this.initMap then the init function wouldn't work for multiple instances of the Map class
	Map.prototype.init = function() {
		var self = this;
	    // inside closure use that instead of this
	    d3.json(this.MAP_PATH, function (error, world) {
	    	self.initMap(error, world);
		});
	}
	

	// resize map to fill #map_nav_container
	Map.prototype.resizeMap = function () {
		var instance = this;
		// get width of #map_nav_container after window has been resized
		var w = document.getElementById("map_nav_container").offsetWidth;
		var h = w * 0.467;
		instance.svg.attr("width", w);
		instance.svg.attr("height", h);

	}

	// drawing a map code and comments taken from tutorial on http://bost.ocks.org/mike/map/
	// data stored in topoJSON format, needs to be converted to geoJSON
	Map.prototype.initMap = function(world) {
		var instance = this;
		news.$(instance.MAP_CONTAINER).html("");
		var viewboxSize = "0,0,"+instance.width+","+instance.height;
		instance.svg = d3.select(instance.MAP_CONTAINER).append("svg").attr("width", instance.width).attr("height", instance.height).attr("preserveAspectRatio", "xMidYMid").attr("viewBox", viewboxSize);
		// not sure why this.g is needed instead of svg but i couldn't get click to zoom to work until i added this line
		// then changed all references of svg to this.g e.g svg.append() became this.g.append() etc...
		instance.g = instance.svg.append("g");
		/* 
		While our data can be stored more efficiently in TopoJSON, we must convert back to GeoJSON for display. 
		Breaking this step out to make it explicit:
		*/
		// we can extract the definition of the projection to make the code clearer:
		var subunits = topojson.feature(world, world.objects.subunits);
		// And likewise the path generator:
		//var projection = d3.geo.mercator().scale(500).translate([this.width / 2, this.height / 2]);
		var projection = d3.geo.mercator().scale(instance.scale).translate([instance.tx, instance.ty]);
		var projection = d3.geo.equirectangular().scale(instance.scale).translate([instance.tx, instance.ty]);

		// And the path element, to which we bind the GeoJSON data, and then use selection.attr to set the "d" attribute to the formatted path data:
		instance.path = d3.geo.path().projection(projection);
		instance.g.append("path").datum(subunits).attr("d", instance.path);

		/*
		Here's an explanation on setting the projection, in this example for UK.
		With the code so structured, we can now change the projection to something more suitable for the United Kingdom. T
		he Albers equal-area conic projection is a good choice, with standard parallels of 50°N and 60°N.
		To position the map, we rotate longitude by +4.4° and set the center to 0°W 55.4°N, 
		giving an effective origin of 4.4°W 55.4°N, somewhere in a field in Scotland.

		var projection = d3.geo.albers()
		  .center([0, 55.4])
		  .rotate([4.4, 0])
		  .parallels([50, 60])
		  .scale(6000)
		  .translate([width / 2, height / 2]);
		*/


		// give each country it's own path element
		// add an id and a class ( not sure if i need the class as i'm not styling via CSS )
		instance.g.selectAll(".subunit").data(subunits.features)
			.enter().append("path")
			.attr("id", function(d) { return instance.MAP_ID + "_" + d.id; })
			.attr("class", function(d) { return "subunit " + d.id; })
			.attr("d", instance.path)
			.on("mouseover", function() { instance.countryRollover(this); } )
			.on("mouseout", function() { instance.countryRollout(this); } )
			.on("click", function(d) { instance.clicked(d); } )
			.append("text")
			.text(function(d) { return d.properties.name;});




		// add country boundary styling
		this.g.append("path")
			.datum(topojson.mesh(world, world.objects.subunits, function(a, b) { return true; }))
			.attr("d", instance.path)
			.attr("class", "subunit-boundary");
			

		document.getElementById(this.MAP_ID).onmousemove = function(ev) { instance.displayMapTooltip(ev, this); } 
		//news.$(instance.MAP_CONTAINER).mousemove(function( ev ) { instance.displayMapTooltip(ev, this); });
		//news.$(instance.INFOBOX_CONTAINER).mouseover( function() { instance.countryRollout(); });

		//add reset button for map e.g. document.getElementById("map1_reset").onclick = function () { mainMap.resetMap(); };
		// add after id = this.MAP_ID or this.MAP_CONTAINER if using jQuery
		//this.addHTMLResetButton(this.MAP_ID);
		news.$(this.MAP_CONTAINER).after( this.addHTMLTooltip() );
		
		news.$(this.MAP_CONTAINER).after( this.addHTMLResetButton(this.MAP_ID) );
		document.getElementById(this.MAP_ID + "_reset").onclick = function () {
			instance.resetMap();
			news.pubsub.emit('resetClicked', ["Reset clicked: " + instance.MAP_CONTAINER]);
		}
		

		//Click map to zoom
		news.$(".ns__click_zoom").text("Click on the map to zoom");

		this.resizeMap();
		this.colourAllCountries();

	}

	//create html for tooltip for instance of map. Example code below:-
	Map.prototype.addHTMLTooltip = function () {
		return '<div class="info_box" id="' + this.INFOBOX_ID +'"><div class="map_info_box_name"></div><div class="map_info_box_val"></div></div>';
	}
	
	// build HTML for reset button for instance of map
	Map.prototype.addHTMLResetButton = function (id) {
		var htmlNode = '<span class="reset" id="' + id + '_reset">' + RESET_TEXT + '</span>';
		return htmlNode;
	}


	Map.prototype.displayMapTooltip = function (e, countryNode) {
		if (Model.model.isMapInteractive) {
			var offsetTooltipX = 32; // number of pixels to position tooltip horizontally from mouse
			var offsetTooltipY = 0; // number of pixels to position tooltip vertically from mouse
			// get height of infobox container
			// if y + height > map height then y = map height - infobox height;
			var infoNode = document.getElementById(this.INFOBOX_ID);
			var infoHeight = document.getElementById(this.INFOBOX_ID).offsetHeight;
			//var infoHeight = (this.INFOBOX_CONTAINER).offsetHeight();


			var x = (e.pageX - news.$(this.MAP_CONTAINER).offset().left);
			var y = (e.pageY - news.$(this.MAP_CONTAINER).offset().top) + offsetTooltipY;

			if ( (y + infoHeight) > this.height ) {
				y = this.height - infoHeight;
			}

			y = y + "px";
			if (x > (this.width - 200) ){
				x = this.width - x + offsetTooltipX + "px";
				news.$(this.INFOBOX_CONTAINER).css( {position: "absolute", top: y, right: x, left: "auto", bottom: "auto" } );
			} else {
				x = x + offsetTooltipX + "px";
				news.$(this.INFOBOX_CONTAINER).css( {position: "absolute", top: y, left: x, right: "auto", bottom: "auto" } );
			}
		}
	}

	// TODO: should this be a seperate view class?
	// eg. TooltipView
	Map.prototype.countryRollover = function (countryNode) {
		if (Model.model.isMapInteractive) {
			// 1) get map ID and country code
			var idStr = countryNode.id;
			var countryCode = idStr.slice(-3);
			var mapID = idStr.substring(0, idStr.length-4);

			// 2) get display name for country
			//var countryObj = Model.model.data[countryCode];
			var countryName = Model.model.countryNames[countryCode];

			//var countryName = "NO COUNTRY NAME HERE";
			//console.log('countryrollover', countryName);
			if (countryName!=null) {
				//countryName = countryObj.Country;
			
				var infoElem = "#info_box";

				var countryText = "";
				news.$(infoElem + " .map_info_box_name").html(countryName);
				var str = this.getLaws(countryCode);
				if (str != "") {
					news.$(infoElem + " .map_info_box_val").html(str);
				}
				else {
					news.$(infoElem + " .map_info_box_val").html("");
				}
				news.$(infoElem + ".info_box").show();
			};
		}
	}

	// get the categories for selected country ID
	Map.prototype.getLaws = function (countryID) {
		// get data for country
		var cats = [];
		var str = "";
		var countryData = Model.model.data[countryID];
		if (typeof countryData === 'object') {
			// check what categories applies to selected country
			for (var catId in Model.model.categoryKeys) {
				var fieldName = Model.model.categoryKeys[catId].displayedField;
				if (countryData[fieldName] != null) {
					cats.push(catId);
				}
			}
		
			//category IDs applicable to selected country are now stored in cats[]
			//use these categoey Ids to grab the text from the nav buttons
			var l = cats.length;
			var nodeId = "";
			var colIndex = 8;
			if (l>0){
				nodeId = Model.model.categoryKeys[cats[0]].button;
				var colIndex = Model.model.categoryKeys[cats[0]].key;
				str = '<p><span class="ns__key_block ns__key_' + colIndex + '"></span> ' + news.$("#"+nodeId).text() + '</p>';
				if (countryData.popuptext != null){
					var popupTextId = "#" + countryData.popuptext;
					//var popupText = '<p><span class="ns__key_block ns__key_8"></span> ' + news.$(popupTextId).text() + '</p>';
					//str = '<p class="popup_extra_text">' + popupText + '</p>' + str;

					var popupText = '<p class="popup_extra_text">' + news.$(popupTextId).text() + '</p>';
					str = popupText + str;
				}
				
			}
			if (l==2){
				nodeId = Model.model.categoryKeys[cats[1]].button;
				var colIndex = Model.model.categoryKeys[cats[1]].key;
				str += '<p><span class="ns__key_block ns__key_' + colIndex + '"></span> '+news.$("#"+nodeId).text() + '</p>';
			}
		}
		return str;
	}

	Map.prototype.countryRollout = function (countryNode) {
		//console.log("countryRollout");
		if (Model.model.isMapInteractive) {
			var idStr = countryNode.id;
			var countryCode = idStr.slice(-3);
			var mapID = idStr.substring(0, idStr.length-4);
			var infoElem = "#info_box";
			if (mapID == "map_container2") {
				infoElem = "#info_box2"
			}
			news.$(infoElem + ".info_box").hide();
			//news.$(".info_box").hide();
		}
	}

	Map.prototype.updateMapColours = function() {
		this.colourMapUsingData(Model.model.mapVO.categories, Model.model.mapVO.mapList);
		//this.colourMapUsingData(Model.mapVO.categories, Model.mapVO.mapList);
	}

	// use data from country name vocab file to initially colour in every country on the map
	// some of these countries will not be in the Model.data so need to colour them with the no data otherwise they will appear uncoloured
	Map.prototype.colourAllCountries = function () {
		for (var id in Model.model.countryNames){
			var countryID = this.MAP_CONTAINER + "_" + id;
			this.g.select(countryID).attr("fill", "#ededed");
		}
	}

	Map.prototype.colourMapUsingData = function (categories, mapList) {
		// loop through Model.data
		// grab IDs
		var countryVO;
		var val;
		var col;
		var hasCategory = false;
		var hasMixed = false;
		var category = categories[0];
		var catName;
		// display colours of map if map in Model's maplist
		var categoryList = ["", "death_penalty", "imprisonment", "anti_law", "age_consent", "legal_acts", "anti_discrimination", "marriage_subsitute", "marriage"];
		if (news.$.inArray(this.MAP_ID, mapList) >= 0) {
			for(var id in Model.model.data){
				countryVO = Model.model.data[id];
				hasCategory = false;
				col = "#cccccc";
				// for each countries check if a selected category matches to country
				for (var c=0; c<categories.length; c++){
					category = categories[c];
					// T.M. edit
					if (category == "all") {
						this.colourMapUsingData(
							["death_penalty", "imprisonment", "anti_law", "age_consent", "legal_acts", "anti_discrimination", "marriage_subsitute", "marriage"],
							["map_container"]
						);
						return;
					}
					catName = Model.model.categoryKeys[category].displayedField;
					val = countryVO[catName];
					if (val != null) {
						hasCategory = true;
						if (countryVO.two_categories != null){
							col = "#8b528f";
							var colIndex = countryVO.two_categories;
							if ((colIndex >= 1) && (colIndex <= 8) ) {
								var catRef = categoryList[colIndex];
								col = Model.model.categoryKeys[catRef].colour;
							}
							hasMixed = true;
						} else {
							hasMixed = false;
							col = Model.model.categoryKeys[category].colour;
						}
					}
				}

				var countryID = this.MAP_CONTAINER + "_" + id;
				this.g.select(countryID).attr("fill", col);


			}
		}
	}

	// CODE taken from http://bl.ocks.org/mbostock/2206590 and http://www.d3noob.org/2013/03/a-simple-d3js-map-explained.html
	Map.prototype.clicked = function (d) {
		if (Model.model.isMapInteractive) {
			//this.countryRollout();
			var x, y, k;
			if (d && this.centered !== d) {
				var centroid = this.path.centroid(d);
				x = centroid[0];
				y = centroid[1];
				k = 5;
				this.centered = d;
				this.showResetButton();

				//iStats add
				news.pubsub.emit('countryClicked', [d.id]);
			} else {
				x = this.tx;
				y = this.ty;
				k = 1;
				this.centered = null;
				this.hideResetButton();
			}

			var lineStroke = (this.cssBoundaryWidth / k) + "px";

			// NB stroke is added to path. I had set the stroke in the CSS now I'm hard coding it in to the JS. Not happy about this.
			// I wonder if I can add a class instead and let the CSS handle this.
			this.g.selectAll("path")
				.classed("active", this.centered && function(d) { return d === this.centered; })
				.style("stroke-width", lineStroke);

			// transform seems to work like a matrix multiplication so there are 2 translations
			// transition 1) translate map to centre, 2) scale, 3) translate map back to desired position
			this.g.transition()
				.duration(250)
				.attr("transform", "translate(" + this.tx + "," + this.ty + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
		}
	}

	// TODO: this code is duplicated from clicked function above but without passing in the parameter d
	// i've removed the call to classed - need to find out what that does
	Map.prototype.resetMap = function () {
		var lineStroke = (this.cssBoundaryWidth) + "px";

		this.g.selectAll("path")
			.style("stroke-width", lineStroke);

		this.g.transition()
			.duration(250)
			.attr("transform", "translate(this.tx, this.ty)scale(1)translate(-this.tx, -this.y)");

		this.hideResetButton();
	}

	Map.prototype.showResetButton = function() {
		news.$(this.MAP_CONTAINER + "_reset").show();
	}

	Map.prototype.hideResetButton = function() {
		news.$(this.MAP_CONTAINER + "_reset").hide();	
	}


	return Map;

});