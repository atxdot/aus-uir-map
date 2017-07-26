require([
  "esri/map",
  "esri/SpatialReference",
  "esri/dijit/Legend",
  "esri/dijit/BasemapToggle",
  "esri/dijit/Basemap",
  "esri/layers/ArcGISTiledMapServiceLayer",
  "esri/dijit/BasemapLayer",
  "esri/layers/FeatureLayer",
  "esri/basemaps",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/dijit/PopupTemplate",
  "esri/tasks/QueryTask",
  "esri/tasks/query",
  "esri/dijit/InfoWindow",
  "esri/dijit/editing/Editor",
  "esri/InfoTemplate",
  "esri/dijit/AttributeInspector",
  "esri/dijit/editing/TemplatePicker",
  "esri/tasks/GeometryService",
  "esri/arcgis/OAuthInfo",
  "esri/IdentityManager",
  "dojo/parser",
  "dojo/query",
  "dojo",
  "dojo/on",
  "dojo/dom",
  "esri/geometry/geodesicUtils",
  "dojo/_base/array",
  "esri/symbols/SimpleLineSymbol",
  "esri/Color",
  "esri/toolbars/edit",
  "esri/renderers/UniqueValueRenderer",
  "esri/layers/WMSLayer",
  "esri/dijit/HomeButton",
  "esri/config",
  "esri/layers/WMTSLayer",
  "esri/layers/WMTSLayerInfo",
  "dojo/domReady!"
], function(
  Map,
  SpatialReference,
  Legend,
  BasemapToggle,
  Basemap,
  ArcGISTiledMapServiceLayer,
  BasemapLayer,
  FeatureLayer,
  esriBasemaps,
  SimpleRenderer,
  SimpleMarkerSymbol,
  PopupTemplate,
  QueryTask,
  Query,
  InfoWindow,
  Editor,
  InfoTemplate,
  AttributeInspector,
  TemplatePicker,
  GeometryService,
  OAuthInfo,
  IdentityManager,
  parser,
  query,
  dojo,
  on,
  dom,
  geodesicUtils,
  array,
  SimpleLineSymbol,
  Color,
  Edit,
  UniqueValueRenderer,
  WMSLayer,
  HomeButton,
  esriConfig,
  WMTSLayer,
  WMTSLayerInfo
) {

  parser.parse();

// Add the Statewide Planning Map basemap to the JavaScript basemap library
  esriBasemaps.SPM = {
    baseMapLayers: [
      {url: "http://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/Statewide_Planning_Map/MapServer"}
    ],
    title : "TxDOT",
    thumbnailUrl : "http://maps.dot.state.tx.us/AGO_Template/TxDOT_Viewer/images/Basemaps/SPM.png"
  };

// Enables the use of the WMS Google Imagery layer - esriConfig.defaults.io.proxyUrl = "/proxy/";
  //esriConfig.defaults.io.corsEnabledServers = ["https://txgi.tnris.org"];
  /*Local Proxy call*/
  esriConfig.defaults.io.proxyUrl = "/apps/statewide_mapping/facilities/AGS_Proxy/proxy.ashx";


// Set the spatial reference of the map
  var spatialReference = new SpatialReference(4326);

// Create the map
  var map = new Map("divMap", {
    basemap : "SPM",
    center : [-100, 31.5],
    zoom : 7,
    logo : false,
    showAttribution : false,
    spatialReference : spatialReference
  });

// Add Home Button
  var home = new HomeButton({
    map: map
  }, "HomeButton");
  home.startup();

/*Google Imagery WMTS layer info*/
var layerInfo = new WMTSLayerInfo({
  identifier: "texas",
  tileMatrixSet: "0to20",
  format: "png"
});

var options = {
  serviceMode: "KVP",
  layerInfo: layerInfo
};

/*Add Google Imagery WMTS layer*/
var wmtsLayer = new WMTSLayer("https://txgi.tnris.org/login/path/pegasus-horizon-castro-comrade/wmts", options);

// Perform functions on load
  map.on("load", function(){
    map.disableDoubleClickZoom();
  });

// Disable geometry editing after single-click on map
  map.on("click", function(){
    editToolbar.deactivate();
    array.forEach(layerList, function(layer){
      layer.clearSelection();
    });
  });

//  Create the Basemap Toggle
  var toggle = new BasemapToggle({
    map: map,
    basemap: "satellite"
  }, "divBasemapToggle");
  // toggle.startup();

// Mask Template Picker until zoomed in far enough AND Turn on Google Imagery when zoomed past level 17
  map.on("zoom-end", function(result){
    var zoom = result.level;
    var div = document.getElementById("templateMaskDiv");
    if (zoom >= 17) {
      div.style.display = "none";
      document.getElementById("instructions").innerHTML = "Choose an icon to start editing";
      map.addLayer(wmtsLayer);
      // toggle.hide();
    } else if (zoom < 17) {
      div.style.display = "block";
      document.getElementById("instructions").innerHTML = "Zoom in to enable editing";
      // toggle.show();
      map.removeLayer(wmtsLayer);
    }
  });


// Create marker symbols for office points renderer
  var symbolStateHQ = new SimpleMarkerSymbol({"color":[255,255,0,255],"size":7,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS","style":"esriSMSDiamond","outline":{"color":[255,153,0,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"}});

  var symbolDistrict = new SimpleMarkerSymbol({"color":[0,128,0,255],"size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS","style":"esriSMSDiamond","outline":{"color":[255,255,255,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"}});

  var symbolArea = new SimpleMarkerSymbol({"color":[0,0,0,255],"size":8,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS","style":"esriSMSSquare","outline":{"color":[255,255,255,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"}});

  var symbolMaint = new SimpleMarkerSymbol({"color":[30,144,255,255],"size":7,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS","style":"esriSMSCircle","outline":{"color":[255,255,255,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"}});

  var symbolOther = new SimpleMarkerSymbol({"color":[120,120,120,255],"size":7,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS","style":"esriSMSCircle","outline":{"color":[255,255,255,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"}});

  var defaultSymbol = new SimpleMarkerSymbol({"color":[50,50,50,255],"size":7,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS","style":"esriSMSCircle","outline":{"color":[255,255,255,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"}});

  var symbolInactive = new SimpleMarkerSymbol({"color":[255,0,0,255],"size":6,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS","style":"esriSMSX","outline":{"color":[255,0,0,255],"width":2,"type":"esriSLS","style":"esriSLSSolid"}});



// Create renderers for office point layers
  // Create Unique Value Renderer as an alternative method for rendering office points in a single layer
  var renderer = new UniqueValueRenderer(defaultSymbol, "FCLTY_TYPE", "STAT", null, ":");
  renderer.addValue({
    value:"HQ:A",
    symbol: symbolStateHQ,
    label: "State Headquarters"
  });
  renderer.addValue({
    value:"DIST:A",
    symbol: symbolDistrict,
    label: "District Office"
  });
  renderer.addValue({
    value:"DIST_AREA:A",
    symbol: symbolDistrict,
    label: "District and Area Office"
  });
  renderer.addValue({
    value:"DIST_AREA_MNT:A",
    symbol: symbolDistrict,
    label: "District, Area, & Maintenance Office"
  });
  renderer.addValue({
    value:"DIST_MNT:A",
    symbol: symbolDistrict,
    label: "District and Maintenance Office"
  });
  renderer.addValue({
    value:"AREA:A",
    symbol: symbolArea,
    label: "Area Office"
  });
  renderer.addValue({
    value:"AREA_MNT:A",
    symbol: symbolArea,
    label: "Area and Maintenance Office"
  });
  renderer.addValue({
    value: "MNT:A",
    symbol: symbolMaint,
    label: "Maintenance Office"
  });
  renderer.addValue({
    value:"OTHER:A",
    symbol: symbolOther,
    label: "Other TxDOT Facility"
  });
  renderer.addValue({
    value:"HQ:I",
    symbol: symbolInactive,
    label: "State Headquarters"
  });
  renderer.addValue({
    value:"DIST:I",
    symbol: symbolInactive,
    label: "District Office"
  });
  renderer.addValue({
    value:"DIST_AREA:I",
    symbol: symbolInactive,
    label: "District and Area Office"
  });
  renderer.addValue({
    value:"DIST_AREA_MNT:I",
    symbol: symbolInactive,
    label: "District, Area, & Maintenance Office"
  });
  renderer.addValue({
    value:"DIST_MNT:I",
    symbol: symbolInactive,
    label: "District and Maintenance Office"
  });
  renderer.addValue({
    value:"AREA:I",
    symbol: symbolInactive,
    label: "Area Office"
  });
  renderer.addValue({
    value:"AREA_MNT:I",
    symbol: symbolInactive,
    label: "Area and Maintenance Office"
  });
  renderer.addValue({
    value: "MNT:I",
    symbol: symbolInactive,
    label: "Maintenance Office"
  });
  renderer.addValue({
    value:"OTHER:I",
    symbol: symbolInactive,
    label: "Other TxDOT Facility"
  });

// Create renderer for Inactive office locations
  var inactive = new UniqueValueRenderer(symbolInactive, "STAT");
  inactive.addValue({
    value: "I",
    symbol: symbolInactive,
    label: "Inactive"
  });

// Add layers
  OfficeLayerEdits = "http://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Offices_EDITS/FeatureServer/0";
  BuildingsLayer = "http://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Building_Footprints/FeatureServer/0";
  BoundariesLayer = "http://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Facility_Boundaries/FeatureServer/0";

  var Districts = new FeatureLayer ("http://arcgis-indot-1663538641.us-east-1.elb.amazonaws.com/arcgis/rest/services/TxDOT_Districts/FeatureServer/0",{
    outFields : ["*"]
  });

  var Boundaries = new FeatureLayer (BoundariesLayer,{
    outFields : ["*"]
  });

  var Buildings = new FeatureLayer (BuildingsLayer,{
    outFields : ["*"]
  });

  var Offices = new FeatureLayer (OfficeLayerEdits,{
      outFields : ["*"]
  });
  Offices.setRenderer(renderer);
  Offices.setDefinitionExpression("NOT FCLTY_TYPE IS NULL");

  // Facility Points layer for prepopulating facility name field in newly drawn features - does not show in map
  var FacilityPointsQuery = new FeatureLayer (OfficeLayerEdits,{
    outFields : ["FCLTY_SITE_NM"]
  });

  // District layer for prepopulating district name field in newly drawn features - does not show in map
  var DistrictBoundary = new FeatureLayer("http://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Districts_AGO/FeatureServer/0",{
    outFields : ["DIST_NM"]
  });

  var inactiveOffices = new FeatureLayer (OfficeLayerEdits,{
      outFields : ["*"]
  });
  inactiveOffices.setRenderer(inactive);
  inactiveOffices.setDefinitionExpression("STAT = 'I'");

  map.addLayers([Boundaries, Buildings, Offices, Districts]);


// Create Legend
  var legendLayers = [{
    layer: inactiveOffices,
    title: "Status",
    defaultSymbol: false
  },{layer: Offices,
    title: "Office Types",
    defaultSymbol: false
  }];

  map.on("layers-add-result", function (evt) {
    var layerInfo = array.map(evt.layers, function (layer, index) {
      return {layer:layer.layer, title:layer.layer.name};
    });
    layers: layerInfo;
    if (layerInfo.length > 0) {
      var legendDijit = new Legend({
        map: map,
        layerInfos: legendLayers,
        respectCurrentMapScale: true
      }, "divLegend");
      legendDijit.startup();
    }
  });

  document.getElementById("legend").onclick = function() {showLegend()};

  function showLegend() {
    var state = document.getElementById("divLegend").style.display;
    console.log(state);
    if (state == "none"){
      document.getElementById("divLegend").style.display = "block";
    } if (state == ""){
      document.getElementById("divLegend").style.display = "block";
    } else if (state == "block") {
      document.getElementById("divLegend").style.display = "none";
    }
  }

  var layerList = [Buildings, Boundaries, Offices];

// Set up editor
// Set up layerInfos to use in editor widget popup dialog boxes for editing attributes
  var layerInfos = [{
      featureLayer: Offices,
      fieldInfos: [
        {fieldName: "FCLTY_SITE_NM", isEditable: true, tooltip: 'e.g. ALPINE Maintenance Facility', label: 'Office Name:'},
        {fieldName: "ST_ADDR", isEditable: true, tooltip: 'Enter street address, excluding City, State, and Zip', label: 'Street Address:'},
        {fieldName: "CITY_ADDR", isEditable: true, label: 'City:'},
        {fieldName: "STATE_ADDR", isEditable: false, label: 'State:'},
        {fieldName: "ZIP_ADDR", isEditable: true, label: 'Zip Code:'},
        {fieldName: "TXDOT_DIST_NM", isEditable: false, label: 'District:'},
        {fieldName: "FCLTY_TYPE", isEditable: true, tooltip: 'IMPORTANT! Choose a type that includes all office functions', label: 'Facility Type:'},
        {fieldName: "STAT", isEditable: true, label: 'Status:'},
        {fieldName: "OFFICE_LAT", isEditable: false, label: 'Latitude:'},
        {fieldName: "OFFICE_LON", isEditable: false, label: 'Longitude:'},
        {fieldName: "CMNT", isEditable: true, tooltip: 'Enter Comments', label: 'Comment:'}
      ]
    },
    {
      featureLayer: Buildings,
      fieldInfos: [
        {fieldName: "BLDG_NM", isEditable: true, tooltip: 'Enter the building name (e.g. Signs Shop)', label: 'Building Name:'},
        {fieldName: "SQ_FT", isEditable: false,  label: 'Square Feet:'},
        {fieldName: "SITE_NM", isEditable: true, tooltip: 'Enter the site name (e.g. SIERRA BLANCA Maintenance Facility)', label: 'Site Name:'},
        {fieldName: "DIST_NM", isEditable: false, tooltip: 'Enter the full district name (e.g. Fort Worth)', label: 'District Name:'},
        {fieldName: "BLDG_ID", isEditable: true, tooltip: 'Enter a building ID, if known', label: 'Building ID:'},
        {fieldName: "STAT", isEditable: true, label: 'Status:'},
        {fieldName: "CMNT", isEditable: true, tooltip: 'Enter Comments', label: 'Comment:'}
      ]
    },
    {
      featureLayer: Boundaries,
      fieldInfos: [
        {fieldName: "SITE_NM", isEditable: true, tooltip: 'Enter the site name (e.g. SIERRA BLANCA Maintenance Facility)', label: 'Site Name:'},
        {fieldName: "ACRE", isEditable: false,  label: 'Acres:'},
        {fieldName: "DIST_NM", isEditable: false, tooltip: 'Enter the full district name (e.g. Fort Worth)', label: 'District Name:'},
        {fieldName: "SITE_ID", isEditable: true, tooltip: 'Enter a site ID, if known', label: 'Site ID:'},
        {fieldName: "CMNT", isEditable: true, tooltip: 'Enter Comments', label: 'Comment:'},
        {fieldName: "STAT", isEditable: true, label: 'Status:'}
      ]
    }
  ];

// Call in the AGO geometry service
  var geomServ = new GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

// Set up the template picker and call in the layers that will be editible
  var template = new TemplatePicker({
    columns : 1,
    grouping : false,
    style : "width:100px; height:200px; color: dimgray; font-size: .85em; font-weight: bold;",
    featureLayers : [Offices, Buildings, Boundaries]
  }, "divTemplatePicker");
  template.startup();

// Settings for editor widget
  var settings = {
    map : map,
    geometryService: geomServ,
    templatePicker : template,
    toolbarVisible : false,
    layerInfos : layerInfos,
    createOptions : {polygonDrawTools: [Editor.CREATE_TOOL_FREEHAND_POLYGON, Editor.CREATE_TOOL_RECTANGLE]},
    toolbarOptions: {reshapeVisible: true}
  };

  var params = {settings : settings};

// Set up editor widget
  var editorWidget = new Editor(params, "divEditor");
  editorWidget.startup();

// Use the Editor Widget's on style event to trigger styling on certain editor widget elements
// Change pointer over Template Picker
  editorWidget.on("load", function() {
    dojo.query(".templatePicker .grid .item").style("cursor", "pointer");
  });

// Set cursor to pointer when hovering over a feature in the map
  array.forEach(layerList, cursorPointer);
  array.forEach(layerList, cursorDefault);

  function cursorPointer(layer){
    layer.on("mouse-over", function(){
      map.setMapCursor ("pointer");
    });
  }
  function cursorDefault(layer){
    layer.on("mouse-out", function(){
      map.setMapCursor ("default");
    });
  }

// Fix padding problem on popup and remove the Delete button
  map.infoWindow.on("show", changePopupStyling);
  function changePopupStyling(){
    dojo.query(".esriPopup .contentPane").style("padding-bottom", "8px");
    // dojo.query(".atiButtons").style("display", "none");
  }

// Prepopulate Site and District Name in polygon layers
  template.on("selection-change", logLocation);

  var flag = 0;
  var distName;
  var siteName;
  function logLocation (template){
    console.log(flag);
    map.on("click", runDistNameQuery);
    function runDistNameQuery (clickEvent){
      if (flag == 0){
        console.log("flag set to 0");
        console.log(clickEvent);
        geometry = clickEvent.mapPoint;
        var query = new Query();
        query.geometry = geometry;
        console.log(query);
        // Get District Name
        DistrictBoundary.queryFeatures(query, function updateDistName (results){
          console.log(results);
          var dist = results.features[0].attributes.DIST_NM;
          distName = dist;
          console.log(distName);
          // Get Site Name
          Boundaries.queryFeatures(query, function updateSiteName (results){
            var site = results.features[0].attributes.SITE_NM;
            console.log(site);
            siteName = site;
          });
        });
      } else if (flag == 1) {
        console.log("not running query");
      }
      flag = 1;
    }
  }

// Prepopulate Acreage and Square Footage fields after drawing a new polygon
  Boundaries.on("before-apply-edits", setBoundariesFields);
  Buildings.on("before-apply-edits", setBoundariesFields);

  function setBoundariesFields (results){
    var adds = results.adds;
    array.forEach(adds, function(i){
      console.log(i);
      var fixedAcres = esri.geometry.webMercatorToGeographic(i.geometry);
      var fixedSqFt = esri.geometry.webMercatorToGeographic(i.geometry);
      var acres = geodesicUtils.geodesicAreas([fixedAcres], esri.Units.ACRES);
      var sqft = geodesicUtils.geodesicAreas([fixedSqFt], esri.Units.SQUARE_FEET);
      console.log(acres[0]);
      console.log(sqft[0]);
      i.attributes.SQ_FT = sqft[0].toFixed(1);
      i.attributes.ACRE = acres[0].toFixed(1);
      i.attributes.DIST_NM = distName;
      i.attributes.SITE_NM = siteName;
    });
    flag = 0;
    distName = "";
    siteName = "";
  }

// Prepopulate Lat/Long, District and State Name in Offices layer
  Offices.on("before-apply-edits", setOfficesFields);

  function setOfficesFields (result){
    console.log(result);
    var adds = result.adds;
    var updates = result.updates;
    array.forEach(adds, function(i){
      // Calculate Lat/Lon
      var Lat = esri.geometry.xyToLngLat(i.geometry.y);
      var Lon = esri.geometry.xyToLngLat(i.geometry.x);
      i.attributes.OFFICE_LAT = Lat[0].toFixed(6);
      i.attributes.OFFICE_LON = Lon[0].toFixed(6);
      // Set State name
      i.attributes.STATE_ADDR = "TX";
      // Set District name
      i.attributes.TXDOT_DIST_NM = distName;
    });
    array.forEach(updates, function(i){
      // Recalculate Lat/Lon
      if (i.geometry !== undefined){
        var Lat = esri.geometry.xyToLngLat(i.geometry.y);
        var Lon = esri.geometry.xyToLngLat(i.geometry.x);
        i.attributes.OFFICE_LAT = Lat[0].toFixed(6);
        i.attributes.OFFICE_LON = Lon[0].toFixed(6);
      }
    });
  }

// Enable editing of vertices upon double click
  Buildings.on("dbl-click", activateToolbar);
  Boundaries.on("dbl-click", activateToolbar);

  var editToolbar = new Edit(map);
  function activateToolbar(graphic) {
    map.infoWindow.hide();
    var selectedFeature = graphic.graphic;
    var ghostLine = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([201,201,201]), 2);
    var options = {
      allowAddVertices: true,
      allowDeleteVertices: true,
      ghostLineSymbol: ghostLine
    };
    editToolbar.activate(Edit.EDIT_VERTICES, selectedFeature, options);
  }

  editToolbar.on("vertex-move-stop", updateAreaAndLength);
  editToolbar.on('scale-stop', updateAreaAndLength);

  function updateAreaAndLength(i){
    console.log(i);
    var selectedFeature = i.graphic;
    if (i.graphic._layer.name == "Facility Boundary"){
      console.log(i.graphic);
      var fixedAcres = esri.geometry.webMercatorToGeographic(i.graphic.geometry);
      var acres = geodesicUtils.geodesicAreas([fixedAcres], esri.Units.ACRES);
      console.log(acres[0]);
      i.graphic.attributes.ACRE = acres[0].toFixed(1);
      Boundaries.applyEdits(null, [selectedFeature], null);
      console.log("edits applied");
    }
    if (i.graphic._layer.name == "Building"){
      var fixedSqFt = esri.geometry.webMercatorToGeographic(i.graphic.geometry);
      var sqft = geodesicUtils.geodesicAreas([fixedSqFt], esri.Units.SQUARE_FEET);
      console.log(sqft[0]);
      i.graphic.attributes.SQ_FT = sqft[0].toFixed(1);
      Buildings.applyEdits(null, [selectedFeature], null);
      console.log("edits applied");
    }
  }

// Open and Close Help Window
  on(dom.byId("btnHelp"), "click", openHelpWindow);
    function openHelpWindow(){
      document.getElementById("maskDiv").style.display="block";
      document.getElementById("helpDiv").style.display="block";
      document.getElementById("btnHelp").style.display="none";
    }
  on(dom.byId("btnClose"), "click", closeHelpWindow);
    function closeHelpWindow(){
      document.getElementById("maskDiv").style.display="none";
      document.getElementById("helpDiv").style.display="none";
      document.getElementById("btnHelp").style.display="block";
    }


  // Start up Identify Manager to handle permissions for layers with TxDOT-only access
  var info = new OAuthInfo({
            appId: "e3wxOtpVVLlk4mAZ",
            portalUrl: "https://txdot.maps.arcgis.com",
            popup: false
        });
    IdentityManager.registerOAuthInfos([info]);
    IdentityManager.getCredential(info.portalUrl + "/sharing");
});
