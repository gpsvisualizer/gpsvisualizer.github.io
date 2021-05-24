/* FUNCTIONS FOR DRAWING GOOGLE MAPS WITH GPS VISUALIZER (http://www.gpsvisualizer.com/) */

if (!self.gvg) { gvg = []; }// GPS Visualizer Globals
gvg.listeners = [];
gvg.local_time_zone = new Date(); gvg.local_time_zone = 0-gvg.local_time_zone.getTimezoneOffset()/60;
var gmap;

var keyholders = ['google','thunderforest','ign']; gvg.api_keys = [];
for (var i=0; i<keyholders.length; i++) { if (eval('self.'+keyholders[i]+'_api_key')) { gvg.api_keys[keyholders[i]] = eval(keyholders[i]+'_api_key'); } }

if (window.location.toString().match(/gv.?.?debug/)) {
	gvg.debug = true;
	gvg.version = google.maps.version; alert('Google Maps API version = '+gvg.version);
}
gvg.secure_server = (window.location.protocol == 'https:') ? true : false;
gvg.geolocation_ok = (navigator.geolocation) ? true : false;
gvg.mobile_browser = (navigator.userAgent.match(/\b(Android|Blackberry|IEMobile|iPhone|iPad|iPod|Opera Mini|webOS)\b/i) || (screen && screen.width && screen.height && (screen.width <= 480 || screen.height <= 480))) ? true : false;
gvg.internet_explorer = (navigator.userAgent.match(/\b(MSIE|Trident)\b/)) ? true : false;

GV_Define_Styles(); // this needs to happen early so that user-defined styles don't get overridden

if (!self.gv_options) { GV_Setup_Global_Variables(); }

function GV_Setup_Global_Variables() {
	if (!self.gv_options) { gv_options = []; }
	
	if (gvg.internet_explorer) { gv_options.vector_markers = false; } // IE cannot handle embedded SVGs in Google Maps.  POSSIBLE SOLUTION: use non-embedded SVGs in that case?
	// if (gv_options.vector_markers) { gv_options.optimize_markers = false; } // optimization and SVG icons can get weird?
	if (gv_options.icon_directory) { gvg.icon_directory = gv_options.icon_directory; } else { gvg.icon_directory = (gvg.secure_server === false) ? 'http://maps.gpsvisualizer.com/google_maps/' : 'https://www.gpsvisualizer.com/google_maps/'; }
	gvg.icon_directory = gvg.icon_directory.replace(/http:\/\/www\.gpsvisualizer\.com\/google_maps\//,'http://maps.gpsvisualizer.com/google_maps/');
	gvg.icon_directory = gvg.icon_directory.replace(/gpsvisualizer\.com\/google_maps\/icons\//,'gpsvisualizer.com/google_maps/'); // BC
	if (!gvg.icon_directory.match(/\/$/)) { gvg.icon_directory += '/'; }
	if (gv_options.script_directory) { gvg.script_directory = gv_options.script_directory; } else { gvg.script_directory = (gvg.secure_server === false) ? 'http://maps.gpsvisualizer.com/google_maps/' : 'https://www.gpsvisualizer.com/google_maps/'; }
	if (gv_options.image_directory) { gvg.image_directory = gv_options.image_directory; } else { gvg.image_directory = (gvg.secure_server === false) ? 'http://maps.gpsvisualizer.com/google_maps/' : 'https://www.gpsvisualizer.com/google_maps/'; }
	// Define parameters of different marker types
	if (!gvg.icons) { gvg.icons = []; }
	gvg.icons['circle'] = { is:[11,11],ia:[5,5],ss:[13,13],iwa:[10,2],im:[0,0, 10,0, 10,10, 0,10, 0,0], circular:true };
	gvg.icons['pin'] = { is:[15,26],ia:[7.5,25],ss:[30,26],iwa:[7,1],im:[5,25, 5,15, 2,13, 1,12, 0,10, 0,5, 1,2, 2,1, 4,0, 10,0, 12,1, 13,2, 14,4, 14,10, 13,12, 12,13, 9,15, 9,25, 5,25 ] };
	gvg.icons['square'] = { is:[11,11],ia:[5,5],ss:[13,13],iwa:[10,2],im:[0,0, 10,0, 10,10, 0,10, 0,0] };
	gvg.icons['triangle'] = { is:[13,13],ia:[6.5,6.5],ss:[15,15],iwa:[11,3],im:[0,11, 6,0, 12,11, 0,11] };
	gvg.icons['diamond'] = { is:[13,13],ia:[6.5,6.5],ss:[13,13],iwa:[11,3],im:[6,0, 12,6, 6,12, 0,6, 6,0] };
	gvg.icons['star'] = { is:[19,19],ia:[9.5,10],ss:[19,19],iwa:[12,5],im:[9,1, 17,7, 14,17, 4,17, 1,7, 9,1] };
	gvg.icons['cross'] = { is:[13,13],ia:[6.5,6.5],ss:[15,15],iwa:[11,3],im:[4,0, 8,0, 8,4, 12,4, 12,8, 8,8, 8,12, 4,12, 4,8, 0,8, 0,4, 4,4, 4,0] };
	gvg.icons['airport'] = { is:[17,17],ia:[8.5,8.5],ss:[19,19],iwa:[13,3],im:[6,0, 10,0, 16,6, 16,10, 10,16, 6,16, 0,10, 0,6, 6,0], circular:true };
	gvg.icons['google'] = { is:[20,34],ia:[10,33],ss:[37,34],iwa:[9,2],im:[8,33, 8,23, 1,13, 1,6, 6,1, 13,1, 18,6, 18,13, 11,23, 11,33, 8,33] };
	gvg.icons['googleblank'] = { is:[20,34],ia:[10,33],ss:[37,34],iwa:[15,2],im:[8,33, 8,23, 1,13, 1,6, 6,1, 13,1, 18,6, 18,13, 11,23, 11,33, 8,33] };
	gvg.icons['googlemini'] = { is:[12,20],ia:[6,20],ss:[22,20],iwa:[5,1],im:[4,19, 4,14, 0,7, 0,3, 4,0, 7,0, 11,3, 11,7, 7,14, 7,19, 4,19] };
	gvg.icons['blankcircle'] = { is:[64,64],ia:[32,32],ss:[70,70],iwa:[55,8],im:[19,3, 44,3, 60,19, 60,44, 44,60, 19,60, 3,44, 3,19, 19,3] };
	gvg.icons['camera'] = { is:[17,13],ia:[8.5,6.5],ss:[19,15],iwa:[13,3],im:[1,3, 6,1, 10,1, 15,3, 15,11, 1,11, 1,3] };
	gvg.icons['arrow'] = { is:[19,19],ia:[9.5,9.5],ss:[21,21],iwa:[14,3],im:[5,0, 14,0, 19,6, 19,14, 14,19, 6,19, 0,14, 0,6, 5,0], rotatable:true, circular:true };
	gvg.icons['wedge'] = { is:[19,19],ia:[9.5,9.5],ss:[21,21],iwa:[14,3],im:[5,0, 14,0, 19,6, 19,14, 14,19, 6,19, 0,14, 0,6, 5,0], rotatable:true, circular:true };
	gvg.icons['tickmark'] = { is:[13,13],ia:[6.5,6.5],xss:[13,13],iwa:[11,3],im:[6,0, 12,6, 6,12, 0,6, 6,0], rotatable:true };
	GV_Define_Vector_Icons();
	GV_Define_Embedded_Images();
	gvg.named_html_colors = GV_Define_Named_Colors();
	gvg.garmin_icons = GV_Define_Garmin_Icons(gvg.icon_directory,gv_options.garmin_icon_set);
	
	// These may be important (why?)
	gv_options.info_window_width = parseFloat(gv_options.info_window_width) || 0;
	gv_options.thumbnail_width = parseFloat(gv_options.thumbnail_width) || 0;
	gv_options.photo_width = parseFloat(gv_options.photo_width) || 0;
	gv_options.photo_size = (gv_options.photo_size && gv_options.photo_size.length == 2 && gv_options.photo_size[0] > 0) ? gv_options.photo_size : null;
	
	// default marker options, possibly taken from an older gv_default_marker variable
	if (!gv_options.default_marker) {
		gv_options.default_marker = [];
		gv_options.default_marker.icon = (self.gv_default_marker && gv_default_marker.icon) ? gv_default_marker.icon : 'googlemini';
		gv_options.default_marker.color = (self.gv_default_marker && gv_default_marker.color) ? gv_default_marker.color : 'red';
		gv_options.default_marker.size = (self.gv_default_marker && gv_default_marker.size) ? gv_default_marker.size : null;
		gv_options.default_marker.anchor = (self.gv_default_marker && gv_default_marker.anchor) ? gv_default_marker.anchor : null;
		gv_options.default_marker.imagemap = (self.gv_default_marker && gv_default_marker.imagemap) ? gv_default_marker.imagemap : null;
		gv_options.default_marker.scale = (self.gv_default_marker && gv_default_marker.scale) ? gv_default_marker.scale : null;
	}
	gv_options.default_marker.color = (gv_options.default_marker.color) ? gv_options.default_marker.color.replace(/^#/,'') : 'red';
	gv_options.marker_link_target = (gv_options.marker_link_target) ? gv_options.marker_link_target : ((self.marker_link_target) ? marker_link_target : '');
	gv_options.info_window_width = (gv_options.info_window_width) ? gv_options.info_window_width : ((self.gv_max_info_window_width) ? gv_max_info_window_width : null);
	gv_options.driving_directions = (gv_options.driving_directions) ? gv_options.driving_directions : ((self.gv_driving_directions) ? gv_driving_directions : false);
	gv_options.label_offset = (gv_options.label_offset && gv_options.label_offset.length >= 2) ? gv_options.label_offset : ((self.gv_label_offset && self.gv_label_offset.length >= 2) ? gv_label_offset : [0,0]);
	gv_options.label_centered = (gv_options.label_centered) ? gv_options.label_centered : ((self.gv_label_centered) ? gv_label_centered : false);
	gv_options.hide_labels = (gv_options.hide_labels) ? gv_options.hide_labels : false;
	gv_options.editable_markers = (gv_options.editable_markers) ? true : false;
	gv_options.marker_tooltip_position = (gv_options.marker_tooltip_position) ? gv_options.marker_tooltip_position : 'right';
	
	// map control options
	if (!gv_options.map_type_control && gv_options.map_type_control !== false) { // very old code would use have gv_options.map_type_control as a boolean
		gv_options.map_type_control = [];
		gv_options.map_type_control.style = (self.maptypecontrol_style) ? maptypecontrol_style : 'menu';
		gv_options.map_type_control.filter = (self.filter_map_types) ? true : false;
	}
	gv_options.map_opacity = (self.gv_bg_opacity) ? gv_bg_opacity : ((gv_options.map_opacity > 1) ? gv_options.map_opacity/100 : gv_options.map_opacity);
	
	gvg.anizoom = (gv_options.animated_zoom === false) ? false : true;
	
	// Some stuff related to marker lists
	if (!gv_options.tracklist_options) { gv_options.tracklist_options = []; } // it needs to be created or the next statements will throw errors
	if (!gv_options.marker_list_options) { gv_options.marker_list_options = []; } // it needs to be created or the next statements will throw errors
	if (!gv_options.marker_filter_options) { gv_options.marker_filter_options = []; } // it needs to be created
	gvg.marker_list_text_tooltip = ''; gvg.marker_list_icon_tooltip = '';
	if (self.gv_marker_list_options && !gv_options.marker_list_options) { gv_options.marker_list_options = gv_marker_list_options; } // backward compatibility
	
	// Some stuff related to filtering markers
	gvg.filter_markers = false; gvg.filter_marker_list = false;
	if (self.gv_marker_filter_options) { gv_options.marker_filter_options = gv_marker_filter_options; } // backward compatibility
	if (gv_options.marker_filter_options) {
		gvg.filter_marker_list = (gv_options.marker_filter_options.update_list) ? true : false;
		gvg.filter_markers = (gv_options.marker_filter_options.filter === true || gv_options.marker_filter_options.enabled) ? true : false;
	}
	gvg.autopan = (gvg.filter_markers && (!gv_options.marker_filter_options || gv_options.marker_filter_options.disable_autopan !== false)) ? false : true;
	
	// Create a default icon for all markers
	gvg.default_icon = { icon:{}, shadow:{}, shape:{}, info_window:{} };
	gvg.icon_suffix = (gv_options.vector_markers) ? 'svg' : 'png';
	if (gv_options.default_marker.icon && gv_options.default_marker.icon.indexOf('/') > -1) {
		gvg.default_icon.icon.url = gv_options.default_marker.icon.replace(/^c:\//,'file:///c:/'); // fix local Windows file names
		gvg.default_icon.icon.size = (gv_options.default_marker.size && gv_options.default_marker.size[0] && gv_options.default_marker.size[1]) ? new google.maps.Size(gv_options.default_marker.size[0],gv_options.default_marker.size[1]) : new google.maps.Size(32,32);
		gvg.default_icon.icon.scaledSize = gvg.default_icon.icon.size;
		gvg.default_icon.icon.anchor = (gv_options.default_marker.anchor && gv_options.default_marker.anchor[0] != null && gv_options.default_marker.anchor[1] != null) ? new google.maps.Point(gv_options.default_marker.anchor[0],gv_options.default_marker.anchor[1]) : new google.maps.Point(gvg.default_icon.icon.size.width*0.5,gvg.default_icon.icon.size.height*0.5);
		gvg.icons[gv_options.default_marker.icon] = { is:[gvg.default_icon.icon.size.width,gvg.default_icon.icon.size.height],ia:[gvg.default_icon.icon.anchor.x,gvg.default_icon.icon.anchor.y],ss:null,im:gvg.default_icon.shape.coords };
		if (gv_options.default_marker.imagemap && gv_options.default_marker.imagemap.length > 5) {
			gvg.default_icon.shape.type = 'poly'; gvg.default_icon.shape.coords = [];
			for (var i=0; i<gv_options.default_marker.imagemap.length; i++) { gvg.default_icon.shape.coords[i] = gv_options.default_marker.imagemap[i]; }
		}
	} else {
		if (!gvg.icons[gv_options.default_marker.icon]) { gv_options.default_marker.icon = 'googlemini'; }
		gvg.default_icon.icon.url = (gv_options.vector_markers && gvg.icons[gv_options.default_marker.icon].vector) ? GV_Vector_Icon(gv_options.default_marker.icon,gv_options.default_marker.color) : gvg.icon_directory+'icons/'+gv_options.default_marker.icon+'/'+gv_options.default_marker.color.toLowerCase()+'.'+gvg.icon_suffix;
		gvg.default_icon.icon.size = new google.maps.Size(gvg.icons[gv_options.default_marker.icon].is[0],gvg.icons[gv_options.default_marker.icon].is[1]);
		gvg.default_icon.icon.anchor = new google.maps.Point(gvg.icons[gv_options.default_marker.icon].ia[0],gvg.icons[gv_options.default_marker.icon].ia[1]);
		if (gvg.icons[gv_options.default_marker.icon].im) {
			gvg.default_icon.shape.type = 'poly'; gvg.default_icon.shape.coords = [];
			// it must be copied one item at a time or there's a telepathic connection between gvg.icons[icon] and gvg.default_icon!
			for (var i=0; i<gvg.icons[gv_options.default_marker.icon].im.length; i++) { gvg.default_icon.shape.coords[i] = gvg.icons[gv_options.default_marker.icon].im[i]; }
		} else {
			gvg.default_icon.shape = null;
		}
	}
	if (gv_options.default_marker.scale && gv_options.default_marker.scale != 1) {
		var sc = gv_options.default_marker.scale*1;
		gvg.default_icon.icon.size.width *= sc; gvg.default_icon.icon.size.height *= sc;
		gvg.default_icon.icon.scaledSize = gvg.default_icon.icon.size;
		gvg.default_icon.icon.anchor.x *= sc; gvg.default_icon.icon.anchor.y *= sc;
		if (gvg.default_icon.shape && gvg.default_icon.shape.coords) {
			for (var i=0; i<gvg.default_icon.shape.coords.length; i++) { gvg.default_icon.shape.coords[i] *= sc; }
		}
	}
	gvg.default_icon.icon.gv_offset = new google.maps.Point(0,0);
	gvg.name_of_unnamed_marker = (gv_options.marker_list_options && typeof(gv_options.marker_list_options.unnamed) != 'undefined') ? gv_options.marker_list_options.unnamed : '[unnamed]';
	
	gvg.dimmed_color = '#aaaaaa'; // for tracklists and marker lists
	gvg.marker_count = 0;
	gvg.synthesize_fields_pattern = new RegExp('\{((?:<br *\/?>)*)([^\{]*)((?:<br *\/?>)*)\}','gi');
	
	if (gvg.mobile_browser) {
		gv_options.marker_tooltips = false;
		gv_options.marker_list_options.tooltips = false;
		gv_options.track_tooltips = false;
		gv_options.tracklist_options.tooltips = false;
	}
	
	gvg.info_window = new google.maps.InfoWindow();
	if (gvg.info_window) { gvg.info_window.setOptions({disableAutoPan:!gvg.autopan}); }
}

/*
// This might need to be done here or Google might get confused and not fill the map properly: (v3???)
if (1==2 && self.gv_options) {
	gv_options.map_div = (gv_options.map_div && $(gv_options.map_div)) ? gv_options.map_div : 'gmap_div';
	if ($(gv_options.map_div)) {
		if (gv_options.width) { $(gv_options.map_div).style.width = parseFloat(gv_options.width)+'px'; }
		if (gv_options.height) { $(gv_options.map_div).style.height = parseFloat(gv_options.height)+'px'; }
		$(gv_options.map_div).style.position = 'relative';
	}
}
*/

function GV_Setup_Map() {
	if (!self.gv_options) { return false; }
	
	gv_options.map_div = (gv_options.map_div) ? gv_options.map_div : 'gmap_div';
	if (!$(gv_options.map_div)) { return false; }
	
	if (!gv_options.full_screen) {
		if (!gv_options.width && !gv_options.height && ($(gv_options.map_div).style.width == '100%' || $(gv_options.map_div).style.height == '100%')) {
			gv_options.full_screen = true; // if they didn't give dimensions and their div is set to fill the screen in at least 1 dimension
		} else {
			var w = 600; var h = 600; // defaults
			if (!gv_options.width && parseFloat($(gv_options.map_div).style.width)) { gv_options.width = parseFloat($(gv_options.map_div).style.width); }
			if (!gv_options.height && parseFloat($(gv_options.map_div).style.height)) { gv_options.height = parseFloat($(gv_options.map_div).style.height); }
			if (!gv_options.width && !gv_options.height) { gv_options.width = w; gv_options.height = h; }
			else if (!gv_options.width) { gv_options.width = (gv_options.height) ? gv_options.height : w; }
			else if (!gv_options.height) { gv_options.height = (gv_options.width) ? gv_options.width : h; }
		}
	}
	if (gv_options.full_screen) {
		document.body.style.margin = '0px';
		document.body.style.overflow = 'hidden';
		GV_Fill_Window_With_Map(gv_options.map_div); // we may have already done this, and will probably do it again, but it doesn't hurt anything
		$(gv_options.map_div).style.margin = '0px';
	} else {
		if (gv_options.width) {
			$(gv_options.map_div).style.width = parseFloat(gv_options.width)+'px';
		}
		if (gv_options.height) {
			$(gv_options.map_div).style.height = parseFloat(gv_options.height)+'px';
			if ($('gv_marker_list_static') || (gv_options.marker_list_options && gv_options.marker_list_options.id_static && $(gv_options.marker_list_options.id_static)) ) {
				var marker_list_id = ($('gv_marker_list_static')) ? 'gv_marker_list_static' : gv_options.marker_list_options.id_static;
				if ($(marker_list_id).style && !$(marker_list_id).style.height) { $(marker_list_id).style.height = parseFloat(gv_options.height)+'px'; }
			}
		}
	}
	gmap = new google.maps.Map($(gv_options.map_div),{ disableDefaultUI:true }); // create map
	if (!gmap) { return false; }
	
	google.maps.event.trigger(gmap,'resize');
	gvg.overlay = new google.maps.OverlayView(); gvg.overlay.draw = function(){}; gvg.overlay.setMap(gmap); // we may need this dummy overlay for projections etc.
	gvg.zoom_minimum = (gv_options.zoom_min && gv_options.zoom_min >= 0 && gv_options.zoom_min <= 19) ? Math.floor(parseFloat(gv_options.zoom_min)) : 0;
	gvg.zoom_maximum = (gv_options.zoom_max && gv_options.zoom_max >= 2 && gv_options.zoom_max <= 21) ? Math.floor(parseFloat(gv_options.zoom_max)) : 21;

	gvg.current_map_min_zoom = gvg.zoom_minimum;
	gvg.current_map_max_zoom = gvg.zoom_maximum;
	
	// helpful functions for backwards compatibility
	gmap.zoomIn = function() { var z = this.getZoom(); if (z < gvg.zoom_maximum) { this.setZoom(z+1); } };
	gmap.zoomOut = function() { var z = this.getZoom(); if (z > gvg.zoom_minimum) { this.setZoom(z-1); } };
	gmap.getSize = function() { return new google.maps.Size(this.getDiv().clientWidth,this.getDiv().clientHeight); };
	gmap.addOverlay = function(overlay) { overlay.setMap(this); };
	gmap.removeOverlay = function(overlay) { overlay.setMap(null); };
	gmap.savePosition = function() { gvg.saved_center = gmap.getCenter(); gvg.saved_zoom = gmap.getZoom(); };
	gmap.returnToSavedPosition = function() { if (gvg.saved_center && gvg.saved_zoom) { this.setCenter(gvg.saved_center); this.setZoom(gvg.saved_zoom); } };
	gmap.openInfoWindowHtml = function(coords,html) { if (gvg.info_window) { gvg.info_window.setPosition(coords); gvg.info_window.setContent(html); gvg.info_window.open(gmap); } };
	gmap.closeInfoWindow = function() { if (gvg.info_window) { gvg.info_window.close(); } };
	gmap.getBoundsZoomLevel = getBoundsZoomLevel;
	gmap.getContainer = gmap.getDiv;
	GLatLng = google.maps.LatLng;
	GLatLngBounds = google.maps.LatLngBounds;
	GPoint = google.maps.Point;
	GSize = google.maps.Size;
	GEvent = google.maps.event;
	GPolyline = function(points,color,weight,opacity,options) { return new google.maps.Polyline({path:points,strokeColor:color,strokeWeight:weight,strokeOpacity:opacity}); };
	GPolygon = function(points,color,weight,opacity,fill_color,fill_opacity,options) { return (parseFloat(fill_opacity) > 0) ? new google.maps.Polygon({path:points,strokeColor:color,strokeWeight:weight,strokeOpacity:opacity,fillColor:fill_color,fillOpacity:fill_opacity}) : new google.maps.Polyline({path:points,strokeColor:color,strokeWeight:weight,strokeOpacity:opacity}); };
	GGroundOverlay = google.maps.GroundOverlay;
	GIcon = null;
	
	// Do this inside a setup function so they don't load before the API code comes in -- that would break things
	GV_Define_Background_Maps();
	// Set up listeners for the opacity screen
	google.maps.event.addListener(gmap,"idle",function() { GV_Background_Opacity(); }); // relies on a global gvg.bg_opacity variable
	google.maps.event.addListener(gmap,"maptypeid_changed",function() { if(gvg.opacity_screen_object){gvg.opacity_screen_object.setMap(null);} GV_Background_Opacity(); }); // relies on a global gvg.bg_opacity variable
	
	GV_Setup_Global_Variables(); // in the absence of gv_options, this would have already happened, but in most cases it'll need to be run now
	
	
	if (gv_options.page_scrolling === false) {
		gmap.setOptions({gestureHandling:'greedy'});
	} else {
		gmap.setOptions({gestureHandling:'auto'});
	}
	if (gv_options.doubleclick_zoom !== false && gv_options.doubleclick_center !== false) {
		gmap.setOptions({disableDoubleClickZoom:true});
		gvg.listeners['map_doubleclick'] = google.maps.event.addListener(gmap, "dblclick", function(click){ gmap.setCenter(click.latLng); gmap.zoomIn(); DeselectText(); });
	} else if (gv_options.doubleclick_center !== false) {
		gmap.setOptions({disableDoubleClickZoom:true});
		gvg.listeners['map_doubleclick'] = google.maps.event.addListener(gmap, "dblclick", function(click){ gmap.setCenter(click.latLng); DeselectText(); });
	} else if (gv_options.doubleclick_zoom !== false) {
		gmap.setOptions({disableDoubleClickZoom:false});
		gvg.listeners['map_doubleclick'] = google.maps.event.addListener(gmap, "dblclick", function(click){ DeselectText(); });
	}
	
	if (gv_options.tilt) {
		gmap.setOptions({ tilt:45 });
		var rcp = (gmap.get('zoomControlOptions') && gmap.get('zoomControlOptions').position) ? gmap.get('zoomControlOptions').position : google.maps.ControlPosition.LEFT_TOP;
		gmap.setOptions({ rotateControl:true, rotateControlOptions:{position:rcp} });
	} else {
		gmap.setOptions({ tilt:0 });
		gmap.setOptions({ rotateControl:false });
	}
	
	if (gv_options.scroll_zoom === false || gv_options.mousewheel_zoom === false) {
		gmap.setOptions({scrollwheel:false});
	} else if (gv_options.scroll_zoom == 'reverse') {
		gmap.setOptions({scrollwheel:false});
		google.maps.event.addDomListener(gmap.getDiv(),"DOMMouseScroll", GV_MouseWheelReverse); // mouse-wheel zooming for Firefox
		google.maps.event.addDomListener(gmap.getDiv(),"mousewheel", GV_MouseWheelReverse); // mouse-wheel zooming for IE
	}
	
	if (gv_options.rectangle_zoom && google.maps.drawing) {
		GV_Zoom_With_Rectangle(true);
	}
	
	if (!gv_options.center || gv_options.center.length < 2 || typeof(gv_options.center) != 'object') { gv_options.center = [40,-100]; gv_options.zoom == 'auto'; }
	if (typeof(gv_options.zoom) == 'undefined' || (!gv_options.zoom && gv_options.zoom != '0')) { gv_options.zoom = 'auto'; }
	if (gv_options.zoom == 'auto') {
		gvg.center = new google.maps.LatLng(gv_options.center[0],gv_options.center[1]); gvg.zoom = (gv_options.autozoom_default) ? parseFloat(gv_options.autozoom_default) : 8;
	} else {
		gvg.center = new google.maps.LatLng(gv_options.center[0],gv_options.center[1]); gvg.zoom = parseFloat(gv_options.zoom);
	}
	gmap.setCenter(gvg.center);
	gmap.setZoom(gvg.zoom);
	if (gv_options.disable_google_pois) {
		gmap.setOptions({ styles:[ {featureType:'poi',stylers:[{visibility:'off'}]}, {featureType:'landscape',stylers:[{visibility:'off'}]} ] });
	}
	
	// This must be done first so the map type and/or opacity selectors will "float" left of it; also, other controls may need to check for its presence
	if (gv_options.utilities_menu !== false) {
		if (typeof(gv_options.utilities_menu) != 'object') { // BC
			gv_options.utilities_menu = {};
			gv_options.utilities_menu['maptype'] = (gv_options.map_type_control && (gv_options.map_type_control.placement == 'map')) ? false : true;
			gv_options.utilities_menu['opacity'] = (gv_options.map_opacity_control == 'map' || gv_options.map_opacity_control === false) ? false : true;
			gv_options.utilities_menu['measure'] = (gv_options.measurement_tools == 'none' || gv_options.measurement_tools == 'map') ? false : true;
			gv_options.utilities_menu['geolocate'] = (gv_options.geolocation_control == 'none' || gv_options.geolocation_control == 'map') ? false : true;
			gv_options.utilities_menu['profile'] = (gv_options.profile_options === false || (gv_options.profile_options && (gv_options.profile_options.enabled === false || gv_options.profile_options.placement == 'map'))) ? false : true;
		}
		GV_Utilities_Button();
	}
	
	gvg.current_map_type = (gvg.bg[gv_options.map_type]) ? gv_options.map_type : google.maps.MapTypeId.HYBRID; // in case of invalid map_type
	var url_mt = GV_Maptype_From_URL(gv_options.centering_options); if (url_mt) { gvg.current_map_type = url_mt; } // needs to be up here separately because there's a control that depends on it
	var url_fmt = GV_Maptype_From_URL({maptype_key:'gv_force_maptype'}); if (url_fmt) { gvg.current_map_type = url_fmt; } // needs to be up here separately because there's a control that depends on it
	if (gv_options.map_type_control && gv_options.map_type_control.style != 'none' && gv_options.map_type_control.style !== 'false' && gv_options.map_type_control.style !== false && gv_options.map_type_control.placement != 'utilities' && gv_options.map_type_control.visible !== false) {
		var help = (gv_options.map_type_control.help && !gvg.mobile_browser) ? true : false;
		var mtc_div = GV_MapTypeControl('map',help);
		gvg.maptype_control = new GV_Control(mtc_div,'TOP_RIGHT',{left:0,right:5,top:6,bottom:6},2);
	}
	GV_Set_Map_Type(gvg.current_map_type); // handles multi-layer backgrounds
	
	if (typeof(gv_options.zoom_control) != 'undefined' && (gv_options.zoom_control == 'none' || gv_options.zoom_control === false)) {
		// no pan/zoom control was requested
	} else {
		if (gv_options.zoom_control == 'NEW') { gv_options.zoom_control == 'large'; }
		if (gv_options.zoom_control == 'large' || gv_options.zoom_control == 'small') { // large custom control
			var zc_div = GV_Zoom_Control(gv_options.zoom_control);
			gvg.zoom_control = new GV_Control(zc_div,'LEFT_TOP',{left:10,right:10,top:6,bottom:12},-1);
			gvg.listeners['zoom_control'] = google.maps.event.addListener(gmap, "zoom_changed",function(){ GV_Reset_Zoom_Control() });
		} else if (gv_options.zoom_control != 'false') { // small Google control
			gmap.setOptions({zoomControl:true,zoomControlOptions:{position:google.maps.ControlPosition.LEFT_TOP}});
		}
	}
	if (gv_options.street_view) {
		var svcp = (gmap.get('zoomControlOptions') && gmap.get('zoomControlOptions').position) ? gmap.get('zoomControlOptions').position : google.maps.ControlPosition.LEFT_TOP;
		gmap.setOptions({streetViewControl:true,streetViewControlOptions:{position:svcp}});
	} else {
		gmap.setOptions({streetViewControl:false});
	}
	if (gv_options.scale_control !== false) {
		gmap.setOptions({scaleControl:true});
		gmap.setOptions({scaleControlOptions:{position:google.maps.ControlPosition.BOTTOM_LEFT}});
	}
	
	if (gv_options.map_opacity_control && gv_options.map_opacity_control != 'false' && gv_options.map_opacity_control != 'none' && (gv_options.map_opacity_control == 'separate' || gv_options.map_opacity_control == 'map' || gv_options.map_opacity_control == 'both' || gv_options.map_opacity_control === true)) {
		var oc_div = GV_MapOpacityControl(gv_options.map_opacity,'map');
		gvg.map_opacity_control = new GV_Control(oc_div,'TOP_RIGHT',{left:0,right:5,top:6,bottom:6},3);
		GV_Background_Opacity(gv_options.map_opacity); // redundant if control has already been placed
	} else if (gv_options.map_opacity != 1 && gv_options.map_opacity != 100) {
		GV_Background_Opacity(gv_options.map_opacity); // redundant if control has already been placed
	} else {
		GV_Background_Opacity(1);
	}
	
	if (gv_options.tracklist_options && typeof(gv_options.tracklist_options) == 'boolean') { gv_options.tracklist_options = {enabled:gv_options.tracklist_options}; }
	else if (gv_options.tracklist || gv_options.track_list) { gv_options.tracklist_options = {enabled:true}; }
	if (gv_options.tracklist_options && (gv_options.tracklist_options.tracklist || gv_options.tracklist_options.enabled)) {
		var tlo = gv_options.tracklist_options;
		tlo.id = (tlo.id && $(tlo.id)) ? tlo.id : 'gv_tracklist';
		tlo.position = (tlo.position) ? tlo.position : ['RIGHT_TOP',4,32];
		if (tlo.id == 'gv_tracklist') {
			var d = (tlo.draggable === false) ? false : true;  var c = (tlo.collapsible === false) ? false : true;
			GV_Build_And_Place_Draggable_Box({base_id:tlo.id,class_name:'gv_tracklist',position:tlo.position,draggable:d,collapsible:c,min_width:tlo.min_width,max_width:tlo.max_width,min_height:tlo.min_height,max_height:tlo.max_height});
			if ($(tlo.id)) {
				if (!$(tlo.id).style.border) { $(tlo.id).style.border = 'solid #666666 1px'; }
				if (!$(tlo.id).style.padding) { $(tlo.id).style.padding = '4px'; }
			}
			if (tlo.collapsed && tlo.collapsible) {
				if ($(tlo.id+'_handle')) { $(tlo.id+'_handle').style.minWidth = '50px'; }
				GV_Windowshade_Toggle(tlo.id+'_handle',tlo.id,true);
			}
		}
		gv_options.tracklist_options = tlo;
	}
	
	gvg.marker_list_div_id = '';
	gvg.marker_list_exists = null;
	
	if (gv_options.marker_list_options && typeof(gv_options.marker_list_options) == 'boolean') { gv_options.marker_list_options = {enabled:gv_options.marker_list_options}; }
	else if (gv_options.marker_list || gv_options.markerlist) { gv_options.marker_list_options = {enabled:true}; }
	if (gv_options.marker_list_options) {
		var mlo = gv_options.marker_list_options;
		if (typeof(mlo) == 'boolean') { mlo = {enabled:mlo}; }
		if (gv_options.full_screen && mlo.floating !== false) { mlo.floating = true; }
		if (!mlo.id || !$(mlo.id)) {
			if (mlo.floating === false && mlo.id_static && $(mlo.id_static)) { mlo.id = mlo.id_static; }
			else if (mlo.floating && mlo.id_floating && $(mlo.id_floating)) { mlo.id = mlo.id_floating; }
			else { mlo.id = 'gv_marker_list'; }
		}
		gvg.marker_list_div_id = mlo.id;
		if (mlo.list === false || mlo.enabled === false) { // this trumps everything
			gvg.marker_list_exists = false;
			if ($(mlo.id)) { $(mlo.id).parentNode.removeChild($(mlo.id)); }
		} else if (mlo.list == true || mlo.enabled == true) {
			gvg.marker_list_exists = true;
		 }else {
			gvg.marker_list_exists = false;
		}
		if (gvg.marker_list_exists) {
			GV_Reset_Marker_List();
			if (mlo.floating) {
				if (mlo.width) { if (!mlo.max_width) { mlo.max_width = mlo.width; } if (!mlo.min_width) { mlo.min_width = mlo.width; } }
				if (mlo.height) { if (!mlo.max_height) { mlo.max_height = mlo.height; } if (!mlo.min_height) { mlo.min_height = 0; } }
				if (!mlo.position) { mlo.position = ['RIGHT_BOTTOM',3,40]; }
				if (mlo.draggable !== false) { mlo.draggable = true; }
				if (mlo.collapsible !== false) { mlo.collapsible = true; }
				GV_Build_And_Place_Draggable_Box({base_id:mlo.id,class_name:'gv_marker_list',position:mlo.position,draggable:mlo.draggable,collapsible:mlo.collapsible,min_width:mlo.min_width,max_width:mlo.max_width,min_height:mlo.min_height,max_height:mlo.max_height});
				if ($(mlo.id)) {
					if (!$(mlo.id).style.border) { $(mlo.id).style.border = 'solid #666666 1px'; }
					if (!$(mlo.id).style.padding) { $(mlo.id).style.padding = '4px'; }
				} else {
					gvg.marker_list_exists = false;
				}
				if (mlo.collapsed && mlo.collapsible) { GV_Windowshade_Toggle(mlo.id+'_handle',mlo.id,true); }
			} else {
				if ($(mlo.id)) {
					$(mlo.id).style.display = 'block';
					if (!$(mlo.id).style.width) {
						if (mlo.width) { $(mlo.id).style.width = mlo.width+'px'; }
						if (!$(mlo.id).style.maxWidth && mlo.max_width) { $(mlo.id).style.maxWidth = mlo.max_width+'px'; }
						if (!$(mlo.id).style.minWidth && mlo.min_width) { $(mlo.id).style.minWidth = mlo.min_width+'px'; }
					}
					if (!$(mlo.id).style.height) {
						if (mlo.height) { $(mlo.id).style.height = mlo.height+'px'; }
						if (!$(mlo.id).style.maxHeight) { $(mlo.id).style.maxHeight = gv_options.height+'px'; }
					}
					if (!$(mlo.id).style.overflow) { $(mlo.id).style.overflow = 'auto'; }
					if (!$(mlo.id).style.cssFloat) { $(mlo.id).style.cssFloat = 'left'; }
				} else {
					gvg.marker_list_exists = false;
				}
			}
			if (gvg.marker_list_exists && mlo.help_tooltips) {
				gvg.marker_list_text_tooltip = 'Click to '; gvg.marker_list_icon_tooltip = 'Click to ';
				if (mlo.center) { gvg.marker_list_text_tooltip += 'center + '; gvg.marker_list_icon_tooltip += 'center + '; }
				if (mlo.zoom) { gvg.marker_list_text_tooltip += 'zoom in + '; gvg.marker_list_icon_tooltip += 'zoom in + '; }
				if (mlo.toggle) { gvg.marker_list_text_tooltip += 'hide/show the marker + '; }
				if (mlo.url_links) { gvg.marker_list_text_tooltip += 'open the marker\'s link + '; }
				if (mlo.info_window !== false && !mlo.toggle) { gvg.marker_list_text_tooltip += 'open the info window'; }
				if (mlo.info_window !== false) { gvg.marker_list_icon_tooltip += 'open the info window'; }
				gvg.marker_list_text_tooltip = gvg.marker_list_text_tooltip.replace(/(Click to |, | \+ )$/,'');
				gvg.marker_list_icon_tooltip = gvg.marker_list_icon_tooltip.replace(/(Click to |, | \+ )$/,'');
			}
		}
		gv_options.marker_list_options = mlo;
	}
	
	if (gv_options.legend_options === true || (gv_options.legend && !gv_options.legend_options)) { gv_options.legend_options = {enabled:true}; }
	if (gv_options.legend_options && (gv_options.legend_options.legend || gv_options.legend_options.enabled)) {
		var opts = gv_options.legend_options;
		var id = (opts.id) ? opts.id : 'gv_legend';
		if (GV_BoxHasContent(id)) {
			var pos = (opts.position && opts.position.length >= 3) ? opts.position : ['G_ANCHOR_TOP_LEFT',70,6];
			var d = (opts.draggable === false) ? false : true;  var c = (opts.collapsible === false) ? false : true;
			GV_Build_And_Place_Draggable_Box({base_id:id,class_name:'gv_legend',position:gv_options.legend_options.position,draggable:d,collapsible:d});
			if (opts.collapsed && c) { GV_Windowshade_Toggle(id+'_handle',id,true); }
		} else if ($(id)) {
			GV_Delete(id);
		}
	}
	
	if (gv_options.infobox_options === true || (gv_options.infobox && !gv_options.infobox_options)) { gv_options.infobox_options = {enabled:true}; }
	if (gv_options.infobox_options && (gv_options.infobox_options.infobox || gv_options.infobox_options.enabled)) {
		var opts = gv_options.infobox_options;
		var id = (opts.id) ? opts.id : 'gv_infobox';
		if (GV_BoxHasContent(id)) {
			var pos = (opts.position && opts.position.length >= 3) ? opts.position : ['G_ANCHOR_TOP_LEFT',70,6];
			var d = (opts.draggable === false) ? false : true;  var c = (opts.collapsible === false) ? false : true;
			GV_Build_And_Place_Draggable_Box({base_id:id,class_name:'gv_infobox',position:pos,draggable:d,collapsible:c});
			if (opts.collapsed && c) { GV_Windowshade_Toggle(id+'_handle',id,true); }
		} else if ($(id)) {
			GV_Delete(id);
		}
	}
	
	if (gv_options.searchbox_options === true || (gv_options.searchbox && !gv_options.searchbox_options)) { gv_options.searchbox_options = {enabled:true}; }
	if (gv_options.searchbox_options && (gv_options.searchbox_options.searchbox || gv_options.searchbox_options.enabled)) {
		var opts = gv_options.searchbox_options;
		var id = (opts.id) ? opts.id : 'gv_searchbox';
		var zoom = (opts.zoom === false) ? 'false' : 'true';
		var html = '';
		if (!GV_BoxHasContent(id)) {
			html = '<div style="max-width:200px;">Re-center on an address:<br /><input id="gv_searchbox_input" type="text" size="20" style="font:11px Arial;" /> <input id="gv_searchbox_button" type="button" value="Find" style="font:10px Verdana;" onclick="GV_Center_On_Address({input_box:\'gv_searchbox_input\',button:\'gv_searchbox_button\',message_box:\'gv_searchbox_message\',found_template:\'\',unfound_template:\'\',zoom:'+zoom+'});" /><br /><span style="font:10px Arial;" id="gv_searchbox_message">&nbsp;</span></div>';
		} else {
			if ($(id).innerHTML.match(/GV_Center_On_Address *\( *\{ *\w/) && !$(id).innerHTML.match(/\bzoom:/)) {
				$(id).innerHTML = $(id).innerHTML.replace(/(GV_Center_On_Address *\( *\{ *)(\w)/,'$1'+'zoom:'+zoom+',$2');
			}
		}
		if ((GV_BoxHasContent(id) || html)) {
			if (opts.floating !== false) {
				var pos = (opts.position && opts.position.length >= 3) ? opts.position : ['G_ANCHOR_BOTTOM_LEFT',3,60];
				var d = (opts.draggable === false) ? false : true;  var c = (opts.collapsible === false) ? false : true;
				GV_Build_And_Place_Draggable_Box({base_id:id,class_name:'gv_searchbox',position:pos,draggable:d,collapsible:c,html:html});
				if (opts.collapsed && c) { GV_Windowshade_Toggle(id+'_handle',id,true); }
			} else {
				
			}
			GV_Enable_Return_Key('gv_searchbox_input','gv_searchbox_button');
		} else if ($(id)) {
			GV_Delete(id);
		}
	}
	
	gv_options.measurement_tools = (gv_options.measurement_tools === false || gv_options.measurement_tools == 'false' || gv_options.measurement_tools == 'none' || gv_options.measurement_tools == 'utilities') ? false : true;
	
	if (gv_options.center_coordinates !== false || gv_options.measurement_tools) {
		// set up and place the box that shows the center coordinates
		var center_coords_div;
		if (!$('gv_center_container')) {
			center_coords_div = document.createElement('div'); center_coords_div.id = 'gv_center_container';
			center_coords_div.style.display = 'none';
			var center_html = '';
			center_html += '<table style="cursor:crosshair; filter:alpha(opacity=80); -moz-opacity:0.80; -khtml-opacity:0.80; opacity:0.80;" cellspacing="0" cellpadding="0" border="0"><tr valign="middle">';
			if (typeof(gv_options.center_coordinates) == 'undefined' || gv_options.center_coordinates !== false) {
				center_html += '<td><div id="gv_center_coordinates" class="gv_center_coordinates" onclick="GV_Toggle(\'gv_crosshair\'); gvg.crosshair_temporarily_hidden = false;" title="Click here to turn center crosshair on or off"></div></td>';
			}
			if (gv_options.measurement_tools) {
				center_html += '<td><div id="gv_measurement_icon" style="display:block; width:23px; height:15px; margin-left:3px; cursor:pointer;"><img src="'+gvg.embedded_images['ruler']+'" width="19" height="13" border="0" vspace="1" onclick="GV_Place_Measurement_Tools(\'distance\');" title="Click here for measurement tools" class="gmnoprint" style="cursor:pointer;" /></div></td>';
			}
			center_html += '</tr></table>';
			center_coords_div.innerHTML = center_html;
			gmap.getDiv().appendChild(center_coords_div);
		} else {
			center_coords_div = $('gv_center_container');
		}
		gvg.center_coordinates_control = new GV_Control(center_coords_div,'LEFT_BOTTOM',{left:3,right:3,top:1,bottom:4},-2);
		
		// set up the box that holds the crosshair in the middle -- but use the GV_Setup_Crosshair function to center it
		if (gv_options.center_coordinates !== false) {
			if (!$('gv_crosshair_container')) {
				var url = (gv_options.crosshair_url) ? gv_options.crosshair_url : gvg.embedded_images['crosshair'];
				var size = (gv_options.crosshair_size) ? gv_options.crosshair_size : 15;
				var div = document.createElement('div'); div.id = 'gv_crosshair_container';
				div.style.display = 'none'; div.style.pointerEvents = "none"; div.className= 'gmnoprint';
				var inner_div = document.createElement('div'); inner_div.id = 'gv_crosshair';
				inner_div.style.width = size+'px'; inner_div.style.height = size+'px'; inner_div.style.display = 'block';
				//inner_div.innerHTML = //'<img src="'+crosshair_url+'" alt="" width="'+size+'" height="'+size+'" />';
				inner_div.style.backgroundImage = "url('"+url+"')";
				inner_div.style.backgroundRepeat = "no-repeat";
				inner_div.style.backgroundPosition = "center";
				inner_div.style.backgroundSize = "cover";
				inner_div.style.pointerEvents = "none";
				inner_div.style.display = (gv_options.crosshair_hidden) ? 'none' : 'block';
				gvg.hidden_crosshair_is_still_hidden = true;
				div.appendChild(inner_div);
				gmap.getDiv().appendChild(div);
			}
			GV_Setup_Crosshair({container_id:'gv_crosshair_container',size:15,center_coordinates_id:'gv_center_coordinates',fullscreen:gv_options.full_screen});
		}
	}
	if (gv_options.mouse_coordinates && !gvg.mobile_browser) {
		// set up and place the box that shows the mouse coordinates
		var mouse_div;
		if (!$('gv_mouse_container')) {
			mouse_div = document.createElement('div'); mouse_div.id = 'gv_mouse_container';
			mouse_div.style.display = 'none';
			mouse_div.innerHTML = '<table style="cursor:crosshair; filter:alpha(opacity=80); -moz-opacity:0.80; -khtml-opacity:0.80; opacity:0.80;" cellspacing="0" cellpadding="0" border="0"><tr><td><div id="gv_mouse_coordinates" class="gv_mouse_coordinates">Mouse:&nbsp;</div></td></tr></table>';
			gmap.getDiv().appendChild(mouse_div);
		} else {
			mouse_div = $('gv_mouse_container');
		}
		gvg.mouse_coordinates_control = new GV_Control(mouse_div,'LEFT_BOTTOM',{left:3,right:3,top:1,bottom:1},-1);
		google.maps.event.addListener(gmap, 'mousemove', function(mouse_coords) {
			if ($('gv_mouse_coordinates')) {
				$('gv_mouse_coordinates').innerHTML = 'Mouse: <span id="gv_mouse_coordinate_pair">'+mouse_coords.latLng.lat().toFixed(5)+','+mouse_coords.latLng.lng().toFixed(5)+'</span>';
			}
		});
	}
	if ((gv_options.measurement_tools || (gv_options.utilities_menu && gv_options.utilities_menu['measure'])) && ((gv_options.measurement_tools && gv_options.measurement_tools.visible) || (gv_options.measurement_options && gv_options.measurement_options.visible))) {
		GV_Place_Measurement_Tools(); // puts the box up on the screen, hides the ruler icon
	}
	if ($('gv_credit') && $('gv_credit').innerHTML.indexOf('gpsvisualizer.com') < 0) {
		var bogus_credit = $('gv_credit');
		bogus_credit.parentNode.removeChild(bogus_credit);
	}
	var credit_div;
	if (!$('gv_credit')) {
		credit_div = document.createElement('div'); credit_div.id = 'gv_credit';
		credit_div.style.cssText = 'display:none; line-height:1em; padding:1px; background-color:#ffffff; opacity:0.80; filter:alpha(opacity=80); -moz-opacity:0.80; -khtml-opacity:0.80;';
		credit_div.innerHTML = (gv_options.custom_credit && gv_options.custom_credit.indexOf('gpsvisualizer.com') > -1) ? gv_options.custom_credit : 'Map created at <a style="font:inherit;" target="_blank" href="https://www.gpsvisualizer.com/">GPSVisualizer.com</a>';
		gmap.getDiv().appendChild(credit_div);
	} else {
		credit_div = $('gv_credit');
	}
	if (gv_options.credit_position && gv_options.credit_position.length >= 3 && gv_options.credit_position[1] < gmap.getDiv().clientWidth && gv_options.credit_position[2] < gmap.getDiv().clientHeight) {
		gvg.credit_control = GV_Place_Div('gv_credit',gv_options.credit_position[1],gv_options.credit_position[2],gv_options.credit_position[0]);
	} else {
		gvg.credit_control = new GV_Control(credit_div,'RIGHT_BOTTOM',{left:4,right:1,top:3,bottom:2},-3);
		if (window.location.toString().match(/000webhost/)) { // move 000webhost tag to the left
			window.setTimeout('var cn = document.body.childNodes;for (var i=0; i<cn.length; i++) { if (cn[i].tagName =="DIV" && cn[i].innerHTML.match(/www.000webhost.com/)) { cn[i].style.textAlign="left"; cn[i].style.left="65px"; } }',2000);
		}
	}
	
	var copyright_div = document.createElement('div');
	copyright_div.id = "gv_copyright_container";
	copyright_div.style.cssText = 'display:none; height:14px; width:auto; overflow:hidden; margin:0px; padding:0px; background-color:transparent;';
	copyright_div.innerHTML = '<div style="position:absolute; white-space:nowrap; background-color:#f5f5f5; opacity:0.5; width:100%; height:100%"><!-- --></div>'; // white box
	copyright_div.innerHTML += '<div id="gv_map_copyright" style="padding:1px 3px 1px 3px; position:relative; white-space:nowrap;"></div>'; // text
	gmap.getDiv().appendChild(copyright_div);
	gvg.copyright_control = new GV_Control(copyright_div,'BOTTOM_RIGHT',{left:0,right:0,top:0,bottom:0},-4);
	GV_Show_Map_Copyright(gvg.bg[gvg.current_map_type]);

	var preload_div = document.createElement('div'); preload_div.id = 'gv_preload_infowindow'; preload_div.style.display = 'none';
	gmap.getDiv().appendChild(preload_div);
	
	gv_options.info_window_height_maximum = (gv_options.info_window_height_maximum) ? parseFloat(gv_options.info_window_height_maximum) : gmap.getContainer().clientHeight-120; // may as well do it here...
	gv_options.info_window_width_maximum = (gv_options.info_window_width_maximum) ? parseFloat(gv_options.info_window_width_maximum) : gmap.getDiv().clientWidth-40; // may as well do it here...
	gv_options.info_window_width = (parseFloat(gv_options.info_window_width) > gv_options.info_window_width_maximum) ? gv_options.info_window_width_maximum : parseFloat(gv_options.info_window_width);
	gvg.listeners['close_info_window'] = google.maps.event.addListener(gmap, "click", function(){
		GV_Utilities_Menu(false);
		if (gvg.info_window) { gvg.open_info_window_index = null; gvg.info_window.close(); }
		if (gvg.geolocation_info_window) { gvg.geolocation_info_window.close(); }
	});
	
	if (gv_options.rightclick_coordinates) {
		gvg.listeners['map_rightclick'] = google.maps.event.addListener(gmap, "rightclick", function(click){
			GV_Coordinate_Info_Window(click.latLng,gv_options.rightclick_coordinates_multiple);
		});
	}
	
	// Set these up so the individual map's code has a place to put stuff
	wpts = new Array();
	trk = new Array();
	trk_info = new Array();
	trk_segments = new Array();
	
}

function GV_Finish_Map() {
//GV_Debug ("* "+GV_Debug_Function_Name(arguments.callee)+" (called from "+GV_Debug_Function_Name(arguments.callee.caller)+")");
	if (!self.gv_options || !self.gmap) { return false; }
	
//GV_Debug ((!gvg.basic_setup_finished)?"about to do BASIC setup stuff":"skipping basic setup because it was done earlier");
	if (!gvg.basic_setup_finished) {
		if (!self.wpts) { eval('wpts = []'); }
		if (!self.trk) { eval('trk = []'); }
		
		if (gv_options.full_screen) {
			window.onresize = function(){ if (gmap.getDiv()) { GV_Fill_Window_With_Map(gmap.getDiv().id); google.maps.event.trigger(gmap,'resize'); } };
			window.setTimeout('google.maps.event.trigger(gmap,"resize"); if(!gvg.reloading_data && gvg.center){gmap.setCenter(gvg.center);}',100); // give the full-screen map a moment to think before filling the screen and recentering
		}
		
		if (window.location.toString().match(/[&\\?\#](gv_force_[a-z]+)=([^&]+)/)) {
			window.setTimeout("GV_Recenter_Per_URL({center_key:'gv_force_recenter',zoom_key:'gv_force_zoom',maptype_key:'gv_force_maptype'})",100);
		}
		if (gv_options.centering_options) {
			window.setTimeout("GV_Recenter_Per_URL(gv_options.centering_options)",100);
		}
		
		// DYNAMIC FILES
		gvg.dynamic_data = false;
		GV_Get_Dynamic_File_Info();
		
		gvg.basic_setup_finished = true;
	}
	
	if (gv_options.zoom == 'auto') {
		if (gvg.autozoom_elements && gvg.autozoom_elements.length >= 1) {
			GV_Autozoom({'adjustment':gv_options.autozoom_adjustment,'default_zoom':gv_options.autozoom_default,'margin':gv_options.autozoom_margin},gvg.autozoom_elements);
		} else {
			GV_Autozoom({'adjustment':gv_options.autozoom_adjustment,'default_zoom':gv_options.autozoom_default,'margin':gv_options.autozoom_margin},trk,wpts);
		}
		gv_options.center = [gmap.getCenter().lat(),gmap.getCenter().lng()];
	}
	gvg.dynamic_data_last_center = gmap.getCenter(); gvg.dynamic_data_last_zoom = gmap.getZoom(); // for reload-on-move purposes
	
	if (!gvg.marker_events_are_set_up) {
		gvg.marker_events_are_set_up = true;
		GV_Setup_Marker_Processing_Events();
	}
	
	if (gvg.filter_markers) {
		// processing should be done later by the "idle" listener, once everything has settled down
	} else {
		GV_Process_Markers();
	}
	if (gvg.dynamic_file_index < (gvg.dynamic_file_count-1) && !gvg.dynamic_file_single) {
		return; // don't do the final steps quite yet
	}
	if (gvg.dynamic_file_count && gvg.filter_markers) {
		// this needs to be done now because the "idle" listener was already tripped, before the new markers were loaded
		GV_Process_Markers();
	}
	
	
	// FINALLY, THE END:
	
	GV_Finish_Tracklist();
	if (Object.keys(trk).length == 0 || ($('gv_tracklist') && gvg.tracklist_count == 0)) {
		GV_Delete('gv_tracklist_container');
	}
	if (Object.keys(trk).length > 0) {
		for (var j in trk) {
			if (trk[j] && trk[j].info && trk[j].info.elevation) { gvg.profile_data = true; }
		}
	}
	if (gv_options.profile_options && gv_options.profile_options.icon && gvg.profile_data) {
		var profile_div = document.createElement('div'); profile_div.id = 'gv_profile_control';
		profile_div.className = 'gv_profile_button'; profile_div.style.cssText = "background-image:url('"+gvg.embedded_images['profile']+"'); background-repeat:no-repeat; background-position:center;";
		profile_div.title = "Draw an elevation profile"; profile_div.onclick = function(){ GV_Draw_Elevation_Profile(); }
		gvg.profile_control = new GV_Control(profile_div,'BOTTOM_LEFT',{left:6,right:6,top:0,bottom:6});
	}
	
	if (gv_options.profile_options && gv_options.profile_options.visible) {
//console.log('Drawing elevation profile upon initial Google map load...');
		GV_Draw_Elevation_Profile();
	}
	
	if (1==2 && wpts.length == 0 && !gvg.marker_list_count && !gvg.filter_markers && $('gv_marker_list_container')) {
		GV_Delete('gv_marker_list_container');
	}
	
	// Now that everything's settled down, that hidden crosshair can finally be shown (when the map is first moved)
	window.setTimeout("gvg.hidden_crosshair_is_still_hidden = false;",150);
	if(!gvg.saved_center && gmap.savePosition){ gmap.savePosition(); }
	
	gvg.dynamic_file_index = -1; // reset the counter for future reloads
	if (gvg.dynamic_data) {
		var ms = (gvg.idled_at_least_once) ? 100 : 1000;
		window.setTimeout("GV_Create_Dynamic_Reload_Listener()",ms);
	}
	
	if (gv_options.onload_function) {
		var ms = (gv_options.onload_function_delay) ? gv_options.onload_function_delay : 500;
		window.setTimeout(gv_options.onload_function.toString(),ms);
	}
	
	// Let people know why their keyless maps no longer work:
	if (!gvg.api_keys['google'] && typeof(self.google_api_key) != 'undefined') {
		gm_authFailure();
	}
}

function GV_Setup_Marker_Processing_Events() {
	if (!self.gmap || !self.wpts) { return false; }
	
	// ADD DYNAMIC-LOADING LISTENER THAT ONLY HAPPENS THE FIRST TIME THE MAP LOADS
	if (gvg.dynamic_load_on_open) {
		gvg.listeners['dynamic_reload'] = google.maps.event.addListenerOnce(gmap, "bounds_changed", function(){
			GV_Reload_Markers_From_All_Files(1);
		} );
	} else {
		gvg.dynamic_file_index = gvg.dynamic_file_count-1; // pretend we processed them all so the map can finish
	}
	
	// if the reloading process fails, the reload-on-move listener still needs to be put back
	if (gvg.dynamic_reload_on_move) {
		google.maps.event.addListener(gmap, "idle", function(){
			window.setTimeout("if (!gvg.listeners['dynamic_reload']) { GV_Create_Dynamic_Reload_Listener(); }",1000);
		} );
	}
	
	// Add a permanent listener that re-processes all the markers *every* time the map is idle
	if (gvg.filter_markers) {
		gvg.filtered_at_least_once = false;
		gvg.listeners['process_markers'] = google.maps.event.addListener(gmap, "idle", function() {
			gvg.filtered_at_least_once = true;
			GV_Process_Markers();
		});
	}
}

function GV_Create_Dynamic_Reload_Listener() {
	if (gvg.dynamic_reload_on_move) {
		if (!gvg.listeners['dynamic_reload']) {
			gvg.listeners['dynamic_reload'] = google.maps.event.addListenerOnce(gmap, 'idle', function() {
				gvg.idled_at_least_once = true;
				gvg.dynamic_reload_via_move = true;
				GV_Reload_Markers_From_All_Files(2);
			});
		}
	} else {
		if (gvg.listeners['dynamic_reload']) { google.maps.event.removeListener(gvg.listeners['dynamic_reload']); gvg.listeners['dynamic_reload'] = null; }
	}
}
function GV_Get_Dynamic_File_Info() {
	gvg.dynamic_file_count = 0;
	if (gv_options.dynamic_data) { // first-time setup of URLs and such
		if (typeof(gv_options.dynamic_data) == 'string') { // it's a bare URL
			gv_options.dynamic_data = [ { url:gv_options.dynamic_data } ];
		} else if (gv_options.dynamic_data.constructor != Array) { // make it into an array
			gv_options.dynamic_data = [ gv_options.dynamic_data ];
		}
		gvg.dynamic_file_count = gv_options.dynamic_data.length;
	}
	gvg.dynamic_load_on_open = false; gvg.dynamic_reload_on_move = false; gvg.dynamic_movement_threshold = 0;
	gvg.dynamic_reload_on_move_count = 0;
	if (gvg.dynamic_file_count > 0) {
		gvg.dynamic_data = true;
		for (var i=0; i<gv_options.dynamic_data.length; i++) {
			var ddf = gv_options.dynamic_data[i];
			var file_ok = (ddf && (ddf.url || ddf.google_spreadsheet)) ? true : false;
			if (file_ok && ddf.load_on_open !== false) { gvg.dynamic_load_on_open = true; } // must be explicitly false to not load on open
			if (file_ok && ddf.reload_on_move) { gvg.dynamic_reload_on_move = true; gvg.dynamic_reload_on_move_count += 1; } // any sort of true-ish value will allow loading upon movement
			if (file_ok && ddf.movement_threshold && ddf.movement_threshold > gvg.dynamic_movement_threshold) { gvg.dynamic_movement_threshold = ddf.movement_threshold; }
		}
	}
	if (gvg.dynamic_reload_on_move && gvg.info_window) { gvg.info_window.setOptions({disableAutoPan:true}); }
}

function GV_Update_Dynamic_File_Info(reload) { // this function is for pages that modify gv_options.dynamic_data after the map has loaded
	GV_Get_Dynamic_File_Info();
	GV_Create_Dynamic_Reload_Listener();
	if (typeof(reload) == 'number') {
		GV_Reload_Markers_From_File(reload);
	} else if (reload) {
		GV_Reload_Markers_From_All_Files();
	}
}

function GV_Process_Markers () {
	if (!self.gmap || !self.wpts) { return false; }
	
	gvg.info_window_open = false;
	if (gvg.info_window && gvg.info_window.getMap()) {
		gvg.info_window_open = true;
	}
	
	if (gvg.filter_markers) {
		GV_Filter_Markers_In_View();
	}
	
	for (var j=0; j<wpts.length; j++) {
		GV_Process_Marker(wpts[j]);
	}
	
	if (gvg.marker_list_exists && wpts.length > 0) {
		GV_Marker_List();
	}
	
	gvg.markers_processed = true;
	
}


//  **************************************************
//  * markers
//  **************************************************

function GV_Draw_Marker(info) {
	if (self.gmap && self.wpts) {
		var m = GV_Marker(info,null);
		if (m) {
			wpts.push(m);
			if (m.gvi.dynamic) {
				gvg.dynamic_marker_collection[gvg.dynamic_file_index].push(m.gvi.index);
			} else {
				gvg.static_marker_count += 1; // this might not be used for anything anymore
				GV_Process_Marker(wpts[wpts.length-1]);
			}
		}
	}
	if (m && m.gvi) { return (m.gvi.index); }
}
function GV_Marker(arg1,arg2) {
	// BC:
	var mi = {};
	if (arg1 && (arg1.lat != undefined || arg1.coords != undefined || arg1.address != undefined)) {
		mi = arg1;
	} else if (arg2 && (arg2.lat != undefined || arg2.coords != undefined || arg2.address != undefined)) {
		mi = arg2;
	} else {
		return null;
	}
	if (mi.coords && mi.coords.length == 2) { mi.lat = mi.coords[0]; mi.lon = mi.coords[1]; }
	else if (mi.coords && mi.coords.lat) { mi.lat = mi.coords.lat(); mi.lon = mi.coords.lng(); }
	if (mi.lng && !mi.lon) { mi.lon = mi.lng; }
	if (typeof(mi.lat) == 'undefined') { return false; }
	
	if (gv_options.synthesize_fields) {
		for (var f in gv_options.synthesize_fields) {
			if (gv_options.synthesize_fields[f] === true || gv_options.synthesize_fields[f] === false) {
				mi[f] = gv_options.synthesize_fields[f];
			} else if (gv_options.synthesize_fields[f]) {
				var template = gv_options.synthesize_fields[f];
				var m_to_ft = false;
				template = template.toString().replace(gvg.synthesize_fields_pattern,
					function (complete_match,br1,field_name,br2) {
						if (field_name.match(/^lat/i)) { field_name = 'lat'; } // (put these into a "normalize field name" function?)
						else if (field_name.match(/^(lon|lng)/i)) { field_name = 'lon'; }
						else if (field_name.match(/^(sym|symbol|icon)\b/i)) { field_name = 'icon'; }
						else if (field_name.match(/^(alt|elev)/i)) {
							if (field_name.match(/\b(feet|ft)\b/i)) { m_to_ft = true; }
							field_name = 'alt';
						}
						if (mi[field_name] || mi[field_name] == '0' || mi[field_name] === false) {
							var value = (m_to_ft) ? (3.28084*parseFloat(mi[field_name])).toFixed(1) : mi[field_name];
							return (br1+value+br2);
						} else {
							return ('');
						}
					}
				);
				mi[f] = (template.toString().match(/^\s*$/)) ? '' : template;
			}
		}
	}
	
	var tempIcon = Clone2DArray(gvg.default_icon);
	var default_scale = (gv_options.default_marker.scale > 0) ? gv_options.default_marker.scale : 1;
	var custom_scale = (mi.scale > 0 && (gv_options.default_marker.scale != mi.scale)) ? true : false;
	var scale = (mi.scale > 0) ? mi.scale : (gv_options.default_marker.scale) ? gv_options.default_marker.scale : 1;
	var opacity = (mi.opacity > 0) ? parseFloat(mi.opacity) : (gv_options.default_marker.opacity) ? gv_options.default_marker.opacity : 1;
	if (opacity > 1) { opacity = opacity/100; }
	var optimized = (mi.optimized === false || gv_options.optimize_markers === false) ? false : true;
	if (!mi.icon) { mi.icon = (mi.icon_url) ? mi.icon_url : gv_options.default_marker.icon; }
	if ((mi.icon && mi.icon.toString().match(/([\.\/]|^\s*(none|^no.?icon)\s*$)/i)) || (gvg.garmin_icons && gvg.garmin_icons[mi.icon])) {
		var x_offset = 0; var y_offset = 0; if (mi.icon_offset && mi.icon_offset[0] != null && mi.icon_offset[1] != null) { x_offset = mi.icon_offset[0]; y_offset = mi.icon_offset[1]; }
		if (mi.icon.toString().match(/^\s*(none|^no.?icon)\s*$/i)) {
			tempIcon.icon.url = gvg.embedded_images['pixel'];
			tempIcon.icon.size = new google.maps.Size(1,1);
			tempIcon.icon.scaledSize = tempIcon.icon.size;
			tempIcon.icon.anchor = new google.maps.Point(0,0);
			mi.no_icon = true;
		} else if (gvg.garmin_icons && gvg.garmin_icons[mi.icon] && gvg.garmin_icons[mi.icon].url) {
			tempIcon.icon.url = gvg.garmin_icons[mi.icon].url;
			tempIcon.icon.size = new google.maps.Size(16*scale,16*scale);
			tempIcon.icon.scaledSize = tempIcon.icon.size;
			var anchor_x = 8; var anchor_y = 8;
			if (gvg.garmin_icons[mi.icon].anchor && gvg.garmin_icons[mi.icon].anchor.length == 2) {
				anchor_x = gvg.garmin_icons[mi.icon].anchor[0]; anchor_y = gvg.garmin_icons[mi.icon].anchor[1];
			}
			if (gv_options.garmin_icon_set == '24x24') {
				tempIcon.icon.size = new google.maps.Size(24*scale,24*scale);
				tempIcon.icon.scaledSize = tempIcon.icon.size;
				anchor_x *= 1.5; anchor_y *= 1.5;
			}
			tempIcon.icon.anchor = new google.maps.Point(anchor_x*scale-x_offset,anchor_y*scale-y_offset);
			tempIcon.icon.gv_offset = new google.maps.Point(x_offset,y_offset);
		} else { // custom icon URL
			if (gv_options.default_marker.icon.indexOf('/') < 0) { // the default icon (now in tempIcon) is a GV built-in; wipe it out
				tempIcon = { icon:{url:'',size:{},scaledSize:{},anchor:{}}, shadow:{}, shape:{}, info_window:{} };
			}
			mi.icon = mi.icon.replace(/^c:\//,'file:///c:/'); // fix local Windows file names
			tempIcon.icon.url = mi.icon;
			var rsc = scale/default_scale; // relative scale (relative to default) (no longer used?)
			var ap_x = 0.5; var ap_y = 0.5; // anchor_proportions
			var w = (tempIcon.icon.size.width) ? tempIcon.icon.size.width : 32; var h = (tempIcon.icon.size.height) ? tempIcon.icon.size.height : 32;
				if (tempIcon.icon.url.match(/chart\.apis\.google\.com\/.*\bch\w+=[\w_]*pin\b/)) { w = 21; h = 34; } // is there a more efficient way to do this??
				else if (tempIcon.icon.url.match(/googleapis\.com\/.*wht-circle-blank-4x\.png/)) { w = 20; h = 20; }
				else if (tempIcon.icon.url.match(/googleapis\.com\/chart\b.*\bchst=d_map_spin/i) && tempIcon.icon.url.match(/chld=[\d\.]/)) {
					var icon_scale = tempIcon.icon.url.replace(/^.*chld=([\d\.]+).*$/i,'$1');
					w = Math.ceil(37*icon_scale); h = Math.ceil(66.1*icon_scale);
					ap_x = 0.48; ap_y = 0.97; // proportions, not pixels
				}
				else if (tempIcon.icon.url.match(/gpsvisualizer\.com\/google_maps\/icons\/tickmark\//i)) { w = 13; h = 13; }
				tempIcon.icon.size = (mi.icon_size && mi.icon_size[0] && mi.icon_size[1]) ? new google.maps.Size(mi.icon_size[0]*scale,mi.icon_size[1]*scale) : new google.maps.Size(w*scale,h*scale);
				tempIcon.icon.scaledSize = tempIcon.icon.size;
			var ax = tempIcon.icon.size.width*ap_x; var ay = tempIcon.icon.size.height*ap_y; // anchor x & y
				if (tempIcon.icon.url.match(/chart\.apis\.google\.com\/.*\bch\w+=[\w_]*pin\b/)) { ax = 10; ay = 33; } // is there a more efficient way to do this??
				ax = (gvg.marker_icon_anchor && gvg.marker_icon_anchor[0] != null) ? gvg.marker_icon_anchor[0] : ax;
				ay = (gvg.marker_icon_anchor && gvg.marker_icon_anchor[1] != null) ? gvg.marker_icon_anchor[1] : ay;
				tempIcon.icon.anchor = (mi.icon_anchor && mi.icon_anchor[0] != null && mi.icon_anchor[1] != null) ? new google.maps.Point(mi.icon_anchor[0]*scale-x_offset,mi.icon_anchor[1]*scale-y_offset) : new google.maps.Point(ax*scale-x_offset,ay*scale-y_offset);
			tempIcon.icon.gv_offset = new google.maps.Point(x_offset,y_offset);
		}
		tempIcon.shape = null;
		mi.noshadow = true;
	} else if ((mi.icon != gv_options.default_marker.icon) || mi.color || mi.letter || mi.icon_anchor || mi.icon_offset || custom_scale || typeof(mi.rotation) != 'undefined') {
		// it's a custom icon, but still a GPSV standard icon
		var i = (mi.icon && gvg.icons[mi.icon.toLowerCase()]) ? mi.icon.toLowerCase() : gv_options.default_marker.icon;
		var color = (mi.color) ? mi.color.toLowerCase() : gv_options.default_marker.color.toLowerCase(); color = color.replace(/^\#/,'');
		var x_offset = 0; var y_offset = 0; if (mi.icon_offset && mi.icon_offset[0] != null && mi.icon_offset[1] != null) { x_offset = mi.icon_offset[0]; y_offset = mi.icon_offset[1]; }
		tempIcon.icon.anchor = (mi.icon_anchor && mi.icon_anchor[0] != null && mi.icon_anchor[1] != null) ? new google.maps.Point(mi.icon_anchor[0]*scale-x_offset,mi.icon_anchor[1]*scale-y_offset) : (gvg.icons[i].ia ? new google.maps.Point(gvg.icons[i].ia[0]*scale-x_offset,gvg.icons[i].ia[1]*scale-y_offset) : new google.maps.Point(gvg.icons[i].is[0]*scale/2-x_offset,gvg.icons[i].is[1]*scale/2-y_offset));
		if (i != gv_options.default_marker.icon || custom_scale) { // these only need to be messed with if they're not using the default icon or if a scale has been specified; otherwise, they were set as part of "gvg.default_icon"
			tempIcon.icon.size = new google.maps.Size(gvg.icons[i].is[0]*scale,gvg.icons[i].is[1]*scale);
			tempIcon.icon.scaledSize = tempIcon.icon.size;
			if (scale != 0 && scale != 1 && gvg.icons[i].im) { // custom scale
				tempIcon.shape.type = 'poly'; tempIcon.shape.coords = [];
				for (var j=0; j<gvg.icons[i].im.length; j++) { tempIcon.shape.coords[j] = gvg.icons[i].im[j]*scale; }
			} else if (tempIcon.shape) { // scale=1
				if (gvg.icons[i].im) {
					tempIcon.shape.type = 'poly'; tempIcon.shape.coords = gvg.icons[i].im;
				} else {
					tempIcon.shape = null;
				}
			}
		}
		if (i.indexOf('/') < 0) { // is this ever NOT true?
			if (gv_options.vector_markers && gvg.icons[i].vector) {
				tempIcon.icon.url = GV_Vector_Icon(i,color,mi.rotation);
			} else {
				var base_url = (gvg.icons[i].directory) ? gvg.icons[i].directory : gvg.icon_directory+'icons/'+i;
				// rotation will be handled via the URL of the image:
				var rotation_text = (mi.rotation !== null && typeof(mi.rotation) != 'undefined' && gvg.icons[mi.icon] && gvg.icons[mi.icon].rotatable) ? '-r'+( 1000+( 5*Math.round(((parseFloat(mi.rotation)+360) % 360)/5)) ).toString().substring(1,4) : '';
				// BUILD THE IMAGE URL:
				tempIcon.icon.url = base_url+'/'+color.toLowerCase()+rotation_text+'.'+gvg.icon_suffix;
			}
		}
		tempIcon.icon.gv_offset = new google.maps.Point(x_offset,y_offset);
		mi.icon = i;
	}
	if (opacity != 1) { mi.noshadow = true; } // we could make the shadow semi-opaque, but the semi-opaque marker above it wouldn't be able to knock it out
	
	if (mi.type == 'tickmark' && !mi.z_index) {
		mi.z_index = -1;
	}
	//if (gvg.icons[mi.icon] && !gvg.icons[mi.icon].rotatable && mi.rotation && !gv_options.vector_markers) { // this probably won't do anything
	//	var r = ( 1000+( Math.round((parseFloat(mi.rotation)+360) % 360)) ).toString().substring(1,4);
	//	tempIcon.icon.url += (tempIcon.icon.url.match(/\?/)) ? "&rotation="+r : "?rotation="+r;
	//	optimized = false;
	//}
	if (tempIcon.icon.size && (tempIcon.icon.size.width == 10.5 || tempIcon.icon.size.height == 10.5)) { optimized = false; } // weird bug in Google Maps?
	var marker = new google.maps.Marker({
		position:new google.maps.LatLng(mi.lat,mi.lon)
		,'icon':tempIcon.icon
		,'shape':tempIcon.shape
		,'optimized':optimized
		// ,'title':mi.name
		,'opacity':opacity
		,'draggable':gv_options.editable_markers
	});
	marker.gv_hidden = function() { return (this.gv_oor || this.gv_hidden_by_click || this.gv_hidden_by_filter || this.gv_hidden_by_folder) ? true : false; };
	if (mi.z_index) { marker.setZIndex(parseFloat(mi.z_index)); }
	gvg.marker_count += 1;
	
	var target = (mi.link_target) ? mi.link_target : (gv_options.marker_link_target) ? gv_options.marker_link_target : '_blank';
	var target_attribute = 'target="'+target+'"';
	if (gv_options.no_marker_windows || mi.no_window) {
		if (mi.url) {
			google.maps.event.addListener(marker, "click", function(){ window.open(mi.url,target); });
		}
	} else {
		var iw_html = '';
		var url_quoted = (mi.url) ? mi.url.replace(/"/g,"&quot;") : '';
		if (mi.name) {
			if (mi.url && mi.url != null) { iw_html = iw_html + '<div class="gv_marker_info_window_name"><b><a '+target_attribute+' href="'+url_quoted+'" title="'+url_quoted+'">'+mi.name+'</a></b></div>'; }
			else { iw_html = iw_html + '<div class="gv_marker_info_window_name">'+mi.name+'</div>'; }
		}
		if (mi.thumbnail && !mi.photo && !mi.no_thumbnail_in_info_window) {
			mi.thumbnail = mi.thumbnail.replace(/\w+\.dropbox\.com\/s\//,'dl.dropboxusercontent.com\/s\/');
			var tn_style = (mi.thumbnail_width) ? ' style="width:'+parseFloat(mi.thumbnail_width)+'px;"' : (gv_options.thumbnail_width > 0) ? ' style="width:'+gv_options.thumbnail_width+'px;"' : '';
			var thumbnail = '<img class="gv_marker_thumbnail" src="'+mi.thumbnail+'"'+tn_style+'>';
			if (mi.url) { thumbnail = '<a '+target_attribute+' href="'+url_quoted+'">'+thumbnail+'</a>'; }
			iw_html = iw_html + thumbnail;
		} else if (mi.photo) {
			var photo_style = '';
			mi.photo = mi.photo.replace(/\w+\.dropbox\.com\/s\//,'dl.dropboxusercontent.com\/s\/');
			if (mi.photo_size) {
				if (mi.photo_size.length == 2) {
					photo_style = ' style="width:'+parseFloat(mi.photo_size[0])+'px; height:'+parseFloat(mi.photo_size[1])+'px;"';
				} else if (mi.photo_size.toString().match(/([0-9]+)[^0-9]+([0-9]+)/)) { 
					var parts = mi.photo_size.toString().match(/([0-9]+)[^0-9]+([0-9]+)/);
					photo_style = ' style="width:'+parseFloat(parts[1])+'px; height:'+parseFloat(parts[2])+'px;"';
				} else if (parseFloat(mi.photo_size) > 0) {
					photo_style = ' style="width:'+parseFloat(mi.photo_size)+'px;"';
				}
			} else if (gv_options.photo_size) { // if this isn't null, it's ALWAYS a 2-element array
				photo_style = ' style="width:'+parseFloat(gv_options.photo_size[0])+'px; height:'+parseFloat(gv_options.photo_size[1])+'px;"';
			}
			if (photo_style == '') {
				photo_style = (mi.photo_width) ? ' style="width:'+parseFloat(mi.photo_width)+'px;"' : (gv_options.photo_width > 0) ? ' style="width:'+gv_options.photo_width+'px;"' : '';
			}
			iw_html = iw_html + '<div><img class="gv_marker_photo" src="'+mi.photo+'"'+photo_style+'></div>';
		}
		if (mi.desc && mi.desc != '-') {
			iw_html = iw_html + '<div class="gv_marker_info_window_desc">' + mi.desc + '</div>';
		}
		if (mi.dd || (gv_options.driving_directions && mi.dd!==false)) {
			// var dd_name = (mi.name) ? ' ('+mi.name.replace(/<[^>]*>/g,'').replace(/\(/g,'[').replace(/\)/g,']').replace(/"/g,"&quot;")+')' : '';
			var dd_name = '';
			var saddr = (gv_options.driving_directions_start) ? gv_options.driving_directions_start.replace(/"/g,"&quot;") : '';
			iw_html = iw_html + '<table class="gv_driving_directions" cellspacing="0" cellpadding="0" border="0"><tr><td><form action="https://www.google.com/maps" target="_blank" style="margin:0px;">';
			iw_html = iw_html + '<input type="hidden" name="daddr" value="'+(mi.dd_lat?mi.dd_lat:mi.lat)+','+(mi.dd_lon?mi.dd_lon:mi.lon)+dd_name+'">';
			iw_html = iw_html + '<p class="gv_driving_directions_heading" style="margin:2px 0px 4px 0px; white-space:nowrap">Driving directions to this point</p>';
			iw_html = iw_html + '<p style="margin:0px; white-space:nowrap;">Enter your starting address:<br /><input type="text" size="20" name="saddr" value="'+saddr+'">&nbsp;<input type="submit" value="Go"></p>';
			iw_html = iw_html + '</td></tr></table>';
		}
		var ww = 0; // window width
		var mww = parseFloat(mi.window_width);
		if (mww > 0) { ww = (mww < gv_options.info_window_width_maximum) ? mww : gv_options.info_window_width_maximum; }
		else if (gv_options.info_window_width > 0) { ww = gv_options.info_window_width; }
		if (ww > 0 && ww < 200) { ww = 200; } // apparently you can't make it less than 217 (let's leave 17 for the close box though)
		var width_style = (ww > 0) ? 'max-width:'+ww+'px;' : '';
		var info_window_html = '<div style="text-align:left; max-height:'+gv_options.info_window_height_maximum+'px; '+width_style+'" class="gv_marker_info_window">'+iw_html+'</div>';
		
		if (iw_html) {
			google.maps.event.addListener(marker, 'click', function() { GV_Open_Marker_Window(marker); });
		}
	}
	
	if (gvg.icons[mi.icon] && gvg.icons[mi.icon].ss && gv_options.marker_shadows !== false && !mi.noshadow && !mi.no_shadow && mi.type != 'trackpoint' && (!isNumeric(mi.rotation) || gvg.icons[mi.icon].circular)) {
		mi.default_scale = gv_options.default_marker.scale; // the shadow function needs to know if a global scale was set
		marker.shadow_overlay = new GV_Shadow_Overlay(mi);
	}
	if (mi.label || mi.label_id) { // draw a permanent label
		var label_text = (mi.label) ? mi.label : mi.name;
		if (label_text != '') {
			var label_id = (mi.label_id) ? mi.label_id : 'wpts_label['+(gvg.marker_count-1)+']';
			var label_class = (mi.label_class) ? 'gv_label '+mi.label_class : 'gv_label';
			var label_style = (mi.label_color) ? 'background-color:#ffffff; border-color:'+mi.label_color+'; color:'+(mi.label_text_color?mi.label_text_color:mi.label_color)+';' : '';
			var label_hidden = (gv_options.hide_labels) ? true : false;
			var offset_x = gv_options.label_offset[0]; var offset_y = gv_options.label_offset[1];
			var label_centered = gv_options.label_centered; var label_left = gv_options.label_left;
			var label_centered_vertical = (gv_options.label_centered_vertical) ? true : false;
			if (mi.no_icon) {
				label_centered = true;
				label_centered_vertical = true;
			}
			if (mi.label_offset && mi.label_offset.length > 1) { offset_x = mi.label_offset[0]; offset_y = mi.label_offset[1]; }
			if (mi.label_center || mi.label_center === false) { mi.label_centered = mi.label_center; }
			if ((mi.label_centered == true && !label_centered) || (mi.label_centered === false && label_centered)) { label_centered = mi.label_centered; }
			if ((mi.label_left == true && !label_left) || (mi.label_left === false && label_left)) { label_left = mi.label_left; label_centered = false; }
			var label = new GV_Label({map:gmap,coords:new google.maps.LatLng(mi.lat,mi.lon),html:label_text,class_name:label_class,icon:tempIcon.icon,label_offset:new google.maps.Size(offset_x,offset_y),opacity:100,overlap:true,behind_markers:gv_options.labels_behind_markers,id:label_id,hidden:label_hidden,style:label_style,left:label_left,centered:label_centered,centered_vertical:label_centered_vertical});
			marker.label_object = label;
		}
	}
	marker.gv_tooltip = '';
	if (gv_options.marker_tooltips !== false && (mi.name || mi.thumbnail || (mi.desc && gv_options.marker_tooltips_desc))) {
		// adapted from http://www.econym.demon.co.uk/googlemaps/tooltips4.htm
		if (!gvg.marker_tooltip_object) { gvg.marker_tooltip_object = GV_Initialize_Marker_Tooltip(); } // initialize it if it hasn't been done yet
		var tooltip_html = (gv_options.marker_tooltips_desc) ? '<b>'+mi.name+'</b> ' : mi.name+' ';
		if (mi.thumbnail) {
			var tn_style = (mi.thumbnail_width) ? ' style="width:'+parseFloat(mi.thumbnail_width)+'px;"' : (gv_options.thumbnail_width > 0) ? ' style="width:'+gv_options.thumbnail_width+'px;"' : '';
			tooltip_html += '<img class="gv_marker_thumbnail" src="'+mi.thumbnail+'"'+tn_style+'>';
		}
		if (mi.photo) { tooltip_html += '<img class="gv_marker_photo" src="'+mi.photo+'">'; } // photo is hidden in tooltip but gets pre-loaded!
		if (gv_options.marker_tooltips_desc && mi.desc) {
			tooltip_html += '<div class="gv_tooltip_desc">'+mi.desc+'</div>';
		}
		marker.gv_tooltip = '<div class="gv_tooltip">'+tooltip_html+'</div>';
		google.maps.event.addListener(marker,'mouseover', function() { GV_Create_Marker_Tooltip(marker); });
		if (mi.desc && mi.desc.toString().match(/<img/i)) {
			google.maps.event.addListener(marker,"mouseover", function() { GV_Preload_Info_Window(marker); });
		}
		google.maps.event.addListener(marker,'mouseout', function() { GV_Hide_Marker_Tooltip(); });
	}
	if (mi.folder) {
		if ((gvg.marker_list_folder_state && gvg.marker_list_folder_state[mi.folder] && gvg.marker_list_folder_state[mi.folder].hidden) || (gv_options.marker_list_options && gv_options.marker_list_options.folders_hidden)) {
			marker.gv_hidden_by_folder = true;
		}
	}
	
	// This info can be used by other functions, like the "marker list":
	marker.gvi = {}; // gvi = GPS Visualizer info
	marker.gvi.index = gvg.marker_count-1;
	marker.gvi.name = (mi.name) ? mi.name : '';
	marker.gvi.desc = (mi.desc) ? mi.desc : '';
	marker.gvi.label = (mi.label) ? mi.label : '';
	marker.gvi.tooltip = marker.gv_tooltip;
	marker.gvi.url = (mi.url) ? mi.url : '';
	marker.gvi.shortdesc = (mi.shortdesc) ? mi.shortdesc : '';
	marker.gvi.info_window_contents = info_window_html;
	marker.gvi.window_width = (mi.window_width) ? mi.window_width : '';
	marker.gvi.color = (mi.color) ? mi.color.toLowerCase() : gv_options.default_marker.color.toLowerCase();
	marker.gvi.opacity = (opacity) ? opacity : 1;
	marker.gvi.icon = (mi.icon) ? mi.icon : gv_options.default_marker.icon;
	marker.gvi.width = tempIcon.icon.size.width;
	marker.gvi.height = tempIcon.icon.size.height;
	marker.gvi.scale = mi.scale;
	marker.gvi.image = tempIcon.icon.url;
	marker.gvi.coords = new google.maps.LatLng(mi.lat,mi.lon);
	marker.gvi.thumbnail = (mi.thumbnail) ? mi.thumbnail : '';
	marker.gvi.thumbnail_width = (mi.thumbnail_width) ? mi.thumbnail_width : '';
	marker.gvi.type = (mi.type) ? mi.type : '';
	marker.gvi.zoom_level = (mi.zoom_level) ? mi.zoom_level : '';
	marker.gvi.folder = (mi.folder) ? mi.folder : '';
	marker.gvi.dynamic = (mi.dynamic) ? mi.dynamic : false;
	marker.gvi.nolist = (mi.nolist) ? true : false;
	marker.gvi.noshadow = (mi.no_shadow || mi.noshadow) ? true : false;
	if (mi.circle_radius) { marker.gvi.circle_radius = mi.circle_radius; }
	if (typeof(mi.alt != 'undefined')) { marker.gvi.alt = mi.alt; }
	else if (typeof(mi.ele != 'undefined')) { marker.gvi.alt = mi.ele; }
	
	
	if (gvg.marker_list_exists && (mi.type != 'tickmark' || gv_options.marker_list_options.include_tickmarks) && (mi.type != 'trackpoint' || gv_options.marker_list_options.include_trackpoints) && !mi.nolist) {
		marker.gvi.list_html = GV_Marker_List_Item(marker,'wpts['+marker.gvi.index+']');
		if (gv_options.marker_list_options.limit && gv_options.marker_list_options.limit > 0 && gvg.marker_list_count >= gv_options.marker_list_options.limit) {
			// do nothing; we're over the limit
		} else {
			if (typeof(marker.gvi.list_html) != 'undefined') {
				GV_Update_Marker_List_With_Marker(marker);
			}
		}
	}
	if (mi.circle_radius) {
		marker = GV_Draw_Circles_Around_Marker(marker);
	}
	if (mi.track_number && trk[mi.track_number]) {
		if (!trk[mi.track_number].overlays) { trk[mi.track_number].overlays = []; }
		trk[mi.track_number].overlays.push(marker);
		if (trk[mi.track_number].info && trk[mi.track_number].info.bounds && trk[mi.track_number].info.bounds.extend) { trk[mi.track_number].info.bounds.extend(marker.position); }
		if (trk[mi.track_number].info && trk[mi.track_number].info.hidden) {
			marker.gv_hidden_by_click = true;
		}
	}
	return marker;
}

function GV_Vector_Icon(icon,color,rotation) { // colorizes an SVG and then base64-encodes it
	if (gvg.icons[icon].vector) {
		color = color.toLowerCase(); if (!gvg.named_html_colors[color] && !color.match(/^#/)) { color = '#'+color; }
		var white_icon = (gvg.icons[icon+'-r'] && isNumeric(rotation)) ? gvg.icons[icon+'-r'].vector.replace(/rotate\(0/,'rotate('+rotation) : gvg.icons[icon].vector;
		var colored_icon = white_icon.replace(/="white"/g,'="'+color+'"').replace(/stop-color:white\b/g,'stop-color:'+color);
		return 'data:image/svg+xml;base64,'+GV_Base64(colored_icon);
	} else {
		return '';
	}
}

function GV_Draw_Circles_Around_Marker(m) {
	if (!m.gvi.circle_radius) { return m; }
	if (!m.circles) { m.circles = []; }
	var cr_array = m.gvi.circle_radius.toString().split(',');
	for (var i=cr_array.length-1; i>=0; i--) {
		var cr = cr_array[i].replace(/["']/g,'');
		var radius_pattern = new RegExp('^.*?([\\d\\.]+)\\s*(\\w.*)?','i');
		var radius_match = radius_pattern.exec(cr.toString());
		if (radius_match) {
			var r = parseFloat(radius_match[1]); var u = radius_match[2];
			if (u) {
				if (u.match(/\b(naut|nm|n\.m)/i)) { r = r*1852; } else if (u.match(/\bmi/i)) { r = r*1609.34; } else if (u.match(/\b(feet|foot|ft)/i)) { r = r*0.3048; } else if (u.match(/\b(km|kil)/i)) { r = r*1000; }
			}
			var circle = new google.maps.Circle({
				map:gmap,
				strokeColor:m.gvi.color, strokeOpacity:m.gvi.opacity, strokeWeight:2,
				fillColor:m.gvi.color, fillOpacity:0.0,
				center:m.gvi.coords, radius:r,
				clickable:true, zIndex:1000+(m.gvi.index*10)-i
			});
			circle.title = cr+' around '+m.gvi.name;
			circle.info_window_contents = '<div style="text-align:left;" class="gv_marker_info_window">'+circle.title+'</div>';
			google.maps.event.addListener(circle, 'click', function(click) { GV_Open_Circle_Window(click,this); });
			m.circles.push(circle);
		}
	}
	return m;
}
function GV_Open_Circle_Window(click,circle) {
	if (!click || !circle || !circle.info_window_contents) { return; }
	if (gv_options.multiple_info_windows) {
		if (!circle.info_window) {
			circle.info_window = new google.maps.InfoWindow({ content:circle.info_window_contents,maxWidth:gv_options.info_window_width_maximum });
		}
		circle.info_window.setPosition(click.latLng);
		circle.info_window.open(gmap);
	} else {
		gvg.info_window.setOptions({maxWidth:gv_options.info_window_width_maximum,content:circle.info_window_contents,position:click.latLng});
		gvg.info_window.open(gmap);
		gvg.open_info_window_index = null;
	}
}

function GV_Open_Marker_Window(marker) {
	if (!marker || !marker.gvi) { return; }
	if (marker.gvi.info_window_contents) {
		if (gv_options.multiple_info_windows) {
			if (!marker.info_window) {
				marker.info_window = new google.maps.InfoWindow({ content:marker.gvi.info_window_contents, maxWidth:gv_options.info_window_width_maximum });
				if (!gvg.autopan || gvg.dynamic_reload_on_move) { marker.info_window.setOptions({disableAutoPan:true}); }
			}
			marker.info_window.open(gmap,marker);
		} else {
			gvg.info_window.setOptions({maxWidth:gv_options.info_window_width_maximum});
			gvg.info_window.setContent(marker.gvi.info_window_contents);
			gvg.info_window.open(gmap,marker);
			gvg.open_info_window_index = marker.gvi.index;
		}
	}
}

function GV_Toggle_Marker(marker,link,link_color,dimmed_color) {
	marker.gv_hidden_by_click = (marker.gv_hidden_by_click) ? false : true;
	GV_Process_Marker(marker);
	if (link_color && link.style.color) {
		link_color = GV_Color_Hex2CSS(link_color);
		dimmed_color = (dimmed_color) ? GV_Color_Hex2CSS(dimmed_color) : GV_Color_Hex2CSS('#999999');
		if (marker.gv_hidden_by_click) { link.style.color = dimmed_color; }
		else { link.style.color = link_color; }
	}
}
function GV_Toggle_All_Labels(force_show) {
	if (!self.wpts) { return false; }
	var visible = null;
	if (force_show || (gv_options.hide_labels && force_show !== false)) {
		visible = true;
		gvg.labels_are_visible = true;
		gv_options.hide_labels = false;
	} else {
		visible = false;
		gvg.labels_are_visible = false;
		gv_options.hide_labels = true;
	}
	if (wpts.length > 0) {
		for (var i=0; i<wpts.length; i++) {
			if (wpts[i]) {
				var vis = (wpts[i].gv_hidden()) ? false : visible;
				GV_Label_Visibility(wpts[i],vis);
			}
		}
	}
}
function GV_Label_Visibility(m,visible) {
	if (m.label_object) {
		if (visible) { m.label_object.show(); }
		else { m.label_object.hide(); }
	}
}
function GV_Preload_Info_Window(m) {
	if ($('gv_preload_infowindow') && m && m.gvi && m.gvi.desc && m.gvi.desc.match(/<img/i)) {
		$('gv_preload_infowindow').innerHTML = m.gvi.info_window_contents;
	}
}

function GV_Coordinate_Info_Window(coords,multiple) {
	var html = '<div class="gv_click_window" style="max-width:200px;">'+coords.lat().toFixed(6)+','+coords.lng().toFixed(6)+'<'+'/div>';
	if (multiple !== false) {
		var ciw = new google.maps.InfoWindow({position:coords,content:html});
		ciw.open(gmap);
	} else {
		if (gvg.coordinate_info_window) { gvg.coordinate_info_window.close(); }
		else { gvg.coordinate_info_window = new google.maps.InfoWindow(); }
		gvg.coordinate_info_window.setPosition(coords);
		gvg.coordinate_info_window.setContent(html);
		gvg.coordinate_info_window.open(gmap);
	}
}


//  **************************************************
//  * marker lists
//  **************************************************

function GV_Marker_List() {
	if (gvg.marker_list_exists) {
		var mlo = gv_options.marker_list_options;
		var header = (mlo.header) ? '<div id="gv_marker_list_header" class="gv_marker_list_header">'+mlo.header+'</div>' : '';
		var footer = (mlo.footer) ? '<div id="gv_marker_list_footer" class="gv_marker_list_footer">'+mlo.footer+'</div>' : '';
		var top_border = (mlo.dividers) ? '<div class="gv_marker_list_border_top"></div>' : '';
		var folders = '';
		if (!gvg.marker_list_folder_state) { gvg.marker_list_folder_state = {}; }
		if (!gvg.marker_list_folder_number) { gvg.marker_list_folder_number = {}; }
		if (!gvg.marker_list_folder_name) { gvg.marker_list_folder_name = {}; }
		if (gvg.marker_list_folders) {
			var fcount = 0;
			var minus_graphic = gvg.embedded_images['minus'];
			var plus_graphic = gvg.embedded_images['plus'];
			var folder_triangle_open = gvg.embedded_images['folder_triangle_open']+'';
			var folder_triangle_closed = gvg.embedded_images['folder_triangle_closed']+'';
			var open_graphic = folder_triangle_open; var closed_graphic = folder_triangle_closed;
			var toggle_message = "show/hide this folder's markers";
			var collapse_message = "open/close this folder";
			// These next variables are defaults for when the folders are pre-collapsed when the map first loads
			for (var fname in gvg.marker_list_folders) { // gvg.marker_list_folders is an array of HTML marker lists
				fcount += 1;
				if (!gvg.marker_list_folder_state[fname]) { gvg.marker_list_folder_state[fname] = {}; }
				if (mlo.folders_collapsed && typeof(gvg.marker_list_folder_state[fname].collapsed) == 'undefined') { gvg.marker_list_folder_state[fname].collapsed = true; }
				if (mlo.folders_hidden && typeof(gvg.marker_list_folder_state[fname].hidden) == 'undefined') { gvg.marker_list_folder_state[fname].hidden = true; }
				var c = (gvg.marker_list_folder_state[fname] && gvg.marker_list_folder_state[fname].collapsed) ? true : false;
				var h = (gvg.marker_list_folder_state[fname] && gvg.marker_list_folder_state[fname].hidden) ? true : false;
				gvg.marker_list_folder_state[fname] = {collapsed:c,hidden:h}; // just to make sure they both have T/F values
				gvg.marker_list_folder_number[fname] = fcount;
				gvg.marker_list_folder_name[fcount] = fname;
				var initial_icon = (c) ? closed_graphic : open_graphic;
				var initial_contents_display = (c) ? 'none' : 'block';
				var initial_checkbox_checked = (h) ? '' : 'checked';
				var initial_opacity = (h) ? 40 : 100;
				var initial_opacity_style = 'filter:alpha(opacity='+initial_opacity+'); -moz-opacity:'+(initial_opacity/100)+'; -khtml-opacity:'+(initial_opacity/100)+'; opacity:'+(initial_opacity/100)+';';
				var collapse_onclick = "GV_Folder_Collapse_Toggle("+fcount+");";
				var toggle_onclick = "GV_Folder_Visibility_Toggle("+fcount+");";
				var folder_name_onclick = toggle_onclick; var folder_name_message = toggle_message;
				var n = (gv_options.folder_titles && gv_options.folder_titles[fname]) ? gv_options.folder_titles[fname] : fname;
				var folder_name_displayed = (mlo.count_folder_items) ? n+' <span class="gv_marker_list_folder_item_count">('+gvg.marker_list_folder_item_count[fname]+')</span>' : n;
				if (typeof(mlo.folder_name_click) != 'undefined') {
					if (mlo.folder_name_click.match(/coll/i)) { folder_name_onclick = collapse_onclick; folder_name_message = toggle_message; }
					else if (mlo.folder_name_click.match(/toggle|vis|viz/i)) { folder_name_onclick = toggle_onclick; folder_name_message = toggle_message; }
					else if (mlo.folder_name_click === false || mlo.folder_name_click.match(/no/i)) { folder_name_onclick = ''; folder_name_message = ''; }
				}
				var this_folder = '<div class="gv_marker_list_folder" id="folder_'+fcount+'">';
				this_folder += '<div class="gv_marker_list_folder_header" id="folder_header_'+fcount+'"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tr valign="top">';
				this_folder += '<td align="left" nowrap><img src="'+initial_icon+'" width="11" height="11" hspace="2" vspace="0" id="gv_folder_collapse_'+fcount+'" style="cursor:pointer" title="'+collapse_message+'" onclick="'+collapse_onclick+'"></td>';
				this_folder += '<td align="left"><input type="checkbox" id="gv_folder_checkbox_'+fcount+'" class="gv_marker_list_folder_checkbox" style="width:12px; height:12px; padding:0px; margin:0px 2px 0px 0px;" '+initial_checkbox_checked+' title="'+toggle_message+'" onclick="'+toggle_onclick+'"></td>';
				this_folder += '<td width="99%" align="left"><div class="gv_marker_list_folder_name" id="gv_folder_name_'+fcount+'" title="'+folder_name_message+'" onclick="'+folder_name_onclick+'" style="cursor:pointer; max-width:100%; '+initial_opacity_style+'">'+folder_name_displayed+'</div></td>'; // this has to be a DIV with a width or max-width, otherwise IE won't adjust its opacity
				this_folder += '</tr></table></div>';
				this_folder += '<div class="gv_marker_list_folder_contents" id="gv_folder_contents_'+fcount+'" style="display:'+initial_contents_display+'; max-width:100%; '+initial_opacity_style+'">'+gvg.marker_list_folders[fname]+'</div>';
				this_folder += '</div>';
				folders = folders + this_folder;
			}
		}
		top_border = (!gvg.marker_list_html) ? '' : top_border;
		$(gvg.marker_list_div_id).innerHTML = header+top_border+folders+gvg.marker_list_html+footer;
		
		// This is done AFTER the folders are created because collapsed/hidden folders may have been specified by number rather than name
		// (Also, we need to hide the markers in should-be-hidden folders)
		if (!gvg.folders_have_been_initialized) { // brand new map; use gv_options to set state of individual folders
			gvg.folders_have_been_initialized = true;
			
			if (mlo && mlo.folders_collapsed) {
				for (var fname in gvg.marker_list_folders) { GV_Folder_Collapse_Toggle(fname,true); }
			}
			if (mlo && mlo.folders_hidden) {
				for (var fname in gvg.marker_list_folders) { GV_Folder_Visibility_Toggle(fname,true); }
			}
			// These only work with folder names, not numbers, because we don't know yet what their numbers will be and besides, we may need to create them on the fly
			if (mlo && mlo.collapsed_folders && mlo.collapsed_folders.length) {
				for (var i=0; i<mlo.collapsed_folders.length; i++) {
					var fname = mlo.collapsed_folders[i];
					if (!gvg.marker_list_folder_state[fname]) { gvg.marker_list_folder_state[fname] = {}; }
					gvg.marker_list_folder_state[fname].collapsed = true; // set it even if the folder doesn't exist yet
					GV_Folder_Collapse_Toggle(fname,true);
				}
			}
			if (mlo && mlo.hidden_folders && mlo.hidden_folders.length) {
				for (var i=0; i<mlo.hidden_folders.length; i++) {
					var fname = mlo.hidden_folders[i];
					if (!gvg.marker_list_folder_state[fname]) { gvg.marker_list_folder_state[fname] = {}; }
					gvg.marker_list_folder_state[fname].hidden = true; // set it even if the folder doesn't exist yet
					GV_Folder_Visibility_Toggle(fname,true);
				}
			}
		}
		gvg.marker_list_count = 0;
		gv_options.marker_list_options = mlo;
	}
}
function GV_Reset_Marker_List() {
	if (!gvg) { return false; }
	gvg.marker_list_html = '';
	gvg.marker_list_count = 0;
	gvg.marker_list_folders = {};
	gvg.marker_list_folder_number = {};
	gvg.marker_list_folder_name = {};
	gvg.marker_list_folder_item_count = {};
	// gvg.folders_have_been_initialized = false; // don't set this; it should only happen the FIRST time the map is loaded
	// gvg.marker_list_folder_state = {}; // don't clear this; it should be remembered even if/while the folder is rebuilt
}
function GV_Remove_Marker_List() {
	GV_Reset_Marker_List();
	if ($('gv_marker_list_container')) { GV_Delete('gv_marker_list_container'); }
	if (gv_options.marker_list_options) { gv_options.marker_list_options.enabled = false; }
	gvg.marker_list_exists = false;
}

function GV_Update_Marker_List_With_Marker(m) {
	if (!m) { return false; }
	if (m.gvi.folder) {
		if (!m.gv_hidden() || (m.gv_hidden_by_folder && !m.gv_hidden_by_filter)) {
			if (!gvg.marker_list_folders[m.gvi.folder]) {
				gvg.marker_list_folders[m.gvi.folder] = m.gvi.list_html;
				gvg.marker_list_folder_item_count[m.gvi.folder] = 1;
			} else {
				gvg.marker_list_folders[m.gvi.folder] += m.gvi.list_html;
				gvg.marker_list_folder_item_count[m.gvi.folder] += 1;
			}
		}
	} else {
		if (!m.gv_hidden()) {
			gvg.marker_list_html += m.gvi.list_html;
		}
	}
	gvg.marker_list_count += 1;
}
function GV_Folder_Collapse_Toggle(index,force_collapse) {
	var fname = GV_Get_Folder_Name(index);
	if (!fname || !gvg.marker_list_folder_state) { return false; }
	var fn = GV_Get_Folder_Number(fname);
	var open_graphic = gvg.embedded_images['folder_triangle_open'];
	var closed_graphic = gvg.embedded_images['folder_triangle_closed'];
	if (!gvg.marker_list_folder_state[fname]) { gvg.marker_list_folder_state[fname] = {}; }
	if((gvg.marker_list_folder_state[fname].collapsed && force_collapse !== true) || force_collapse === false) {
		$('gv_folder_collapse_'+fn).src = open_graphic;
		$('gv_folder_contents_'+fn).style.display = 'block';
		gvg.marker_list_folder_state[fname].collapsed = false;
	} else {
		$('gv_folder_collapse_'+fn).src = closed_graphic;
		$('gv_folder_contents_'+fn).style.display = 'none';
		gvg.marker_list_folder_state[fname].collapsed = true;
	}
}
function GV_Collapse_Folder(index) {
	GV_Folder_Collapse_Toggle(index,true);
}
function GV_Expand_Folder(index) {
	GV_Folder_Collapse_Toggle(index,false);
}

function GV_Collapse_All_Folders() {
	if (gvg.marker_list_folders) {
		for (var fname in gvg.marker_list_folders) { GV_Folder_Collapse_Toggle(fname,true); }
	}
}
function GV_Expand_All_Folders() {
	if (gvg.marker_list_folders) {
		for (var fname in gvg.marker_list_folders) { GV_Folder_Collapse_Toggle(fname,false); }
	}
}

function GV_Folder_Visibility_Toggle(index,force_hidden) {
	var fname = GV_Get_Folder_Name(index);
	if (!fname || !gvg.marker_list_folder_state) { return false; }
	var fn = GV_Get_Folder_Number(fname);
	if (!gvg.marker_list_folder_state[fname]) { gvg.marker_list_folder_state[fname] = {}; }
	if((gvg.marker_list_folder_state[fname].hidden && force_hidden !== true) || force_hidden === false) {
		if ($('gv_folder_checkbox_'+fn)) {
			$('gv_folder_checkbox_'+fn).checked = true;
			GV_Adjust_Opacity('gv_folder_contents_'+fn,100);
			GV_Adjust_Opacity('gv_folder_name_'+fn,100);
			for (var j=0; j<wpts.length; j++) {
				if (wpts[j] && wpts[j].gvi.folder && wpts[j].gvi.folder == fname) {
					wpts[j].gv_hidden_by_folder = false;
					GV_Process_Marker(wpts[j]);
				}
			}
		}
		gvg.marker_list_folder_state[fname].hidden = false;
	} else {
		if ($('gv_folder_checkbox_'+fn)) {
			$('gv_folder_checkbox_'+fn).checked = false;
			GV_Adjust_Opacity('gv_folder_contents_'+fn,40);
			GV_Adjust_Opacity('gv_folder_name_'+fn,40);
			for (var j=0; j<wpts.length; j++) {
				if (wpts[j] && wpts[j].gvi.folder && wpts[j].gvi.folder == fname) {
					wpts[j].gv_hidden_by_folder = true;
					GV_Process_Marker(wpts[j]);
				}
			}
		}
		gvg.marker_list_folder_state[fname].hidden = true;
	}
}
function GV_Hide_Folder(index) {
	GV_Folder_Visibility_Toggle(index,true);
}
function GV_Show_Folder(index) {
	GV_Folder_Visibility_Toggle(index,false);
}
function GV_Toggle_Folder(index,force_hidden) {
	GV_Folder_Visibility_Toggle(index,force_hidden);
}

function GV_Set_Folder_State(index,opts) {
	if (index == '' || !opts) { return false; }
	var fname = GV_Get_Folder_Name(index); if (!fname) { return false; }
	if (!gvg.marker_list_folder_state) { gvg.marker_list_folder_state = {}; }
	if (!gvg.marker_list_folder_state[fname]) { gvg.marker_list_folder_state[fname] = {}; }
	for (var property in opts) {
		gvg.marker_list_folder_state[fname][property] = opts[property];
	}
}
function GV_Get_Folder_Number(index) {
	var fnum = null;
	if (gvg.marker_list_folder_name && gvg.marker_list_folder_name[index]) { // a valid folder number was supplied
		fnum = index;
	} else if (gvg.marker_list_folder_number && gvg.marker_list_folder_number[index]) { // a valid folder name was supplied
		fnum = gvg.marker_list_folder_number[index];
	}
	return (fnum);
}
function GV_Get_Folder_Name(index) {
	var fname = null;
	if (gvg.marker_list_folder_number && gvg.marker_list_folder_number[index]) { // a valid folder name was supplied
		fname = index;
	} else if (gvg.marker_list_folder_name && gvg.marker_list_folder_name[index]) { // a valid folder number was supplied
		fname = gvg.marker_list_folder_name[index];
	}
	return (fname);
}

function GV_Marker_List_Item(m,marker_name) { // marker_name is something like "wpts[1]"
	if (!m.gvi) { return false; }
	var mlo = gv_options.marker_list_options;
	var default_color = (mlo.default_color) ? mlo.default_color : '';
	var color = (mlo.colors) ? m.gvi.color : default_color;
	var color_style = (color) ? 'color:'+color : '';
	
	var unhide = '';
	var center = (mlo.center) ? 'gmap.setCenter('+marker_name+'.position); ' : '';
	var zoom_in = '';
	if (mlo.zoom && (mlo.zoom_level || m.gvi.zoom_level)) {
		var zoom_level = (m.gvi.zoom_level) ? parseFloat(m.gvi.zoom_level) : parseFloat(mlo.zoom_level);
		zoom_in = 'gmap.setZoom('+zoom_level+'); ';
	}
	else if (mlo.zoom) { zoom_in = 'gmap.zoomIn(); '; }
	var hide_crosshair = (mlo.center && $('gv_crosshair')) ? "$('gv_crosshair').style.display = 'none'; gvg.crosshair_temporarily_hidden = true; " : '';
	var text_toggle = (mlo.toggle) ? 'GV_Toggle_Marker('+marker_name+',this,\''+color+'\');' : ''; // only affects marker list text, not the icon
	var text_open_info_window = (mlo.info_window !== false && !mlo.toggle) ? 'GV_Open_Marker_Window('+marker_name+'); ' : ''; // disable info windows upon text clicking if "toggle" is activated
	var icon_open_info_window = (mlo.info_window !== false) ? 'GV_Open_Marker_Window('+marker_name+'); ' : '';
	
	if (gvg.filter_markers && (center || zoom_in)) {
		text_open_info_window = "window.setTimeout('"+text_open_info_window.replace(/'/g,"\\'")+"',100); ";
		icon_open_info_window = "window.setTimeout('"+icon_open_info_window.replace(/'/g,"\\'")+"',100); ";
	}
	var tooltips = (mlo.tooltips === false) ? false : true; var mouseover = ''; var mouseout = '';
	if (tooltips) {
		mouseover = 'onmouseover="GV_Create_Marker_Tooltip('+marker_name+'); GV_Preload_Info_Window('+marker_name+');" ';
		mouseout = 'onmouseout="gvg.marker_tooltip_object.style.visibility = \'hidden\';" ';
	}
	
	var text_click = unhide+text_toggle+zoom_in+center+hide_crosshair+text_open_info_window;
	var icon_click = unhide+zoom_in+center+hide_crosshair+icon_open_info_window;
	
	var thumbnail = '';
	if (m.gvi.thumbnail && mlo.preload_thumbnails !== false) {
		var tn_display = (mlo.thumbnails) ? 'display:block; ' : '';
		var tn_width = (m.gvi.thumbnail_width) ? 'width:'+m.gvi.thumbnail_width+'px; ' : '';
		thumbnail = '<div class="gv_marker_list_thumbnail" style="'+tn_display+'"><img class="gv_marker_thumbnail" src="'+m.gvi.thumbnail+'" style="'+tn_width+tn_display+'"></div>';
	}
	
	var css_wrap_style = ''; var table_wrap_style = ''; var border_class_top = ''; var border_class_bottom = '';
	var icon_margin_right = 4;
	if (mlo.wrap_names === false) { css_wrap_style = 'white-space:nowrap; '; table_wrap_style ='nowrap'; }
	var icon_scaling = 'width:'+m.gvi.width+'px; height:'+m.gvi.height+'px';
	var icon = (mlo.icons !== false) ? '<img title="'+gvg.marker_list_icon_tooltip+'" class="gv_marker_list_item_icon" '+mouseover+mouseout+'onclick="'+icon_click+'" style="'+icon_scaling+'" src="'+m.gvi.image+'" alt="">' : '';
	var target = (gv_options.marker_link_target) ? 'target="'+gv_options.marker_link_target+'"' : '';
	var n = (m.gvi.name) ? m.gvi.name : gvg.name_of_unnamed_marker;
	var name_html = '<div title="'+gvg.marker_list_text_tooltip+'" '+mouseover+mouseout+'onclick="'+text_click+'" class="gv_marker_list_item_name" style="'+color_style+';">'+n + thumbnail + '</div>';
	name_html = (mlo.url_links && m.gvi.url) ? '<a '+target+' href="'+m.gvi.url+'" title="'+m.gvi.url+'">'+name_html+'</a>' : name_html;
	var d = (m.gvi.shortdesc) ? m.gvi.shortdesc : m.gvi.desc;
	var desc_html = (mlo.desc && d && d != '-') ? '<div class="gv_marker_list_item_desc" style="white-space:normal; '+color_style+'">'+d+'</div>' : '';
	// NOTE: the only reason 'gv_marker_list_first_item' and 'gv_marker_list_item_bottom' still exist is for backwards compatibility with the old style-based way of adding borders.
	var first_class = (gvg.marker_count != 1) ? '' : ' gv_marker_list_first_item';
	var bottom_border_class = (mlo.dividers) ? 'gv_marker_list_border_bottom' : '';
	var html = '<div id="gv_list:'+marker_name+'" class="gv_marker_list_item'+first_class+'"><table cellspacing="0" cellpadding="0" border="0"><tr valign="top" align="left"><td>' + icon + '</td><td style="'+css_wrap_style+'">' + name_html + desc_html + '</td></tr></table></div><div class="gv_marker_list_item_bottom '+bottom_border_class+'" style="clear:both;"></div>'+"\n";
	return (html);
}



//  **************************************************
//  * marker filtering
//  **************************************************

function GV_Process_Marker (m) {
	if (m) {
		if (m.gv_hidden()) {
			GV_Remove_Marker(m);
		} else {
			GV_Place_Marker(m);
		}
	}
}
function GV_Remove_Marker (m) {
	if (!m) { return false; }
	if (m.label_object) { m.label_object.hide(); m.label_object.setMap(null); }
	if (m.circles) { for(i=m.circles.length-1;i>=0;i--) { m.circles[i].setVisible(false); m.circles[i].setMap(null); } }
	if (m.shadow_overlay) { m.shadow_overlay.setMap(null); }
	m.setMap(null);
}
function GV_Place_Marker (m) {
	if (m.label_object) {
		m.label_object.setMap(gmap); 
		if(gv_options.hide_labels) {
			window.setTimeout("if(wpts["+m.gvi.index+"]&&wpts["+m.gvi.index+"].label_object){wpts["+m.gvi.index+"].label_object.hide()}",0); // for some reason this works more reliably in a time-delay function, even with a delay of 0
		} else {
			window.setTimeout("if(wpts["+m.gvi.index+"]&&wpts["+m.gvi.index+"].label_object){wpts["+m.gvi.index+"].label_object.show()}",0); // for some reason this works more reliably in a time-delay function, even with a delay of 0
		}
	}
	if (m.circles) { for(i=m.circles.length-1;i>=0;i--) { m.circles[i].setVisible(true); m.circles[i].setMap(gmap); } }
	if (m.shadow_overlay && !m.shadow_overlay.getMap()) { m.shadow_overlay.setMap(gmap); }
	if (!m.getMap()) { m.setMap(gmap); }
}
GV_Show_Marker = GV_Place_Marker;
GV_Hide_Marker = GV_Remove_Marker;

function GV_Remove_All_Markers(n) {
	if (!self.gmap || !self.wpts) { return false; }
	n = (n) ? n : 0;  // 'n' is how many should be kept at the beginning
	for (var j=n; j<wpts.length; j++) {
		GV_Remove_Marker(wpts[j]); // takes care of shadows and labels too
	}
	if (gvg.marker_list_exists) {
		GV_Reset_Marker_List();
		GV_Marker_List();
	}
}

function GV_Delete_All_Markers(n) { // This is harsher; it doesn't just hide the waypoints, it removes all traces of them
	n = (n) ? n : 0; // 'n' is how many should be kept at the beginning
	GV_Remove_All_Markers(n);
	wpts.length = n;
	gvg.marker_count = n;
}

function GV_Filter_Markers_With_Text (opts) {
	// Works with these fields: name,desc,url,shortdesc,icon,color,image,thumbnail,type,lat,lon,coords,folder
	if (typeof(opts) == 'string') { var p = opts; opts = {}; opts.pattern = p; }
	if (!opts) { opts = {}; } // in case NOTHING is passed into the function for unfiltering
	if (!self.gmap || !self.wpts) { return false; }
	var pattern = (opts.pattern) ? opts.pattern : '';
	var simple_match = (opts.simple_match) ? true : false; // if this is true, the pattern is NOT evaluated as a RegExp
	var autozoom = (opts.autozoom) ? true : (opts.zoom) ? true : false; // autozoom, basically
	var zoom_adjustment = (opts.zoom_adjustment) ? opts.zoom_adjustment : 0;
	var labels_visible = (opts.labels) ? true : false;
	var field = (opts.field) ? opts.field : 'namedesc'; // if no field specified, search name AND desc
	if (field.indexOf('lat') == 0) { field = 'latitude'; }
	else if (field.indexOf('lon') == 0 || field.indexOf('lng') == 0) { field = 'longitude'; }
	else if (field.indexOf('desc') == 0) { field = 'desc'; }
	if (field == 'namedesc' && !simple_match) { pattern = pattern.replace('$','[$|\\t]'); }
	var pattern_regexp = new RegExp(pattern,'i');
	
	var update_list = (gv_options.marker_filter_options.update_list) ? true : false;
	var sort_list_by_distance = (gv_options.marker_filter_options.sort_list_by_distance) ? true : false;
	var limit = (gv_options.marker_filter_options.limit > 0) ? gv_options.marker_filter_options.limit : 0;
	
	if (gvg.marker_list_exists && update_list) {
		GV_Reset_Marker_List();
	}
	
	var to_be_added = [];
	var new_bounds = null;
	
	// Check for an open window; we'll re-open it if needed
	gvg.info_window_open = false;
	if (gvg.info_window && gvg.info_window.getMap()) {
		gvg.info_window_open = true;
	}
	
	// First, remove all points
	for (var j=0; j<wpts.length; j++) {
		var m = wpts[j];
		m.gv_hidden_by_filter = true;
		var text = '';
		// possible future feature: make this a loop that can have multiple field/pattern combos
		if (field == 'latitude') { text = m.position.lat().toString(); }
		else if (field == 'longitude') { text = m.position.lng().toString(); }
		else if (field == 'coords') { text = m.position.toString(); }
		else if (field == 'namedesc') { text = m.gvi.name + "\t" + m.gvi.desc; }
		else if (m.gvi && m.gvi[field]) { text = m.gvi[field]; }
		if ((pattern == '' || (simple_match && text == pattern) || (!simple_match && text.match(pattern_regexp)))) {
			if (limit > 0 || sort_list_by_distance) {
				m.gvi.dist_from_center = google.maps.geometry.spherical.computeDistanceBetween(gmap.getCenter(),m.position);
				var key = (m.gvi.dist_from_center/10000000).toFixed(8);
				to_be_added.push(key+' '+j);
			} else {
				to_be_added.push(j);
			}
			if (new_bounds) { new_bounds.extend(m.position); } else { new_bounds = new google.maps.LatLngBounds(m.position,m.position); }
		} else {
			if (gvg.info_window_open && gvg.open_info_window_index != null && typeof(gvg.open_info_window_index) != 'undefined' && gvg.open_info_window_index == j) {
				gvg.info_window_open = false;
				gvg.open_info_window_index = null;
				if (gvg.info_window) { gvg.info_window.close(); }
			}
		}
		// end possible future feature loop
	}
	// Then, sort them by distance if that's what the options say
	if (limit > 0 || (sort_list_by_distance && update_list)) {
		to_be_added = to_be_added.sort();
		if (limit > 0 && limit < to_be_added.length) { to_be_added.length = limit; }
		for (var j=0; j<to_be_added.length; j++) {
			var parts = to_be_added[j].split(' ');
			to_be_added[j] = parseInt(parts[1]);
		}
		if (!sort_list_by_distance) { // back to the original order
			to_be_added = to_be_added.sort(function(a,b){ return(a-b) });
		}
	}
	// Then, put the appropriate ones back
	for (var j=0; j<to_be_added.length; j++) {
		var m = wpts[to_be_added[j]];
		m.gv_hidden_by_filter = false;
		if (gvg.marker_list_exists && update_list && (m.gvi.type != 'tickmark' || gv_options.marker_list_options.include_tickmarks) && (m.gvi.type != 'trackpoint' || gv_options.marker_list_options.include_trackpoints) && !m.gvi.nolist) {
			if (typeof(m.gvi.list_html) != 'undefined') {
				GV_Update_Marker_List_With_Marker(m);
			}
		}
	}
	if (autozoom && new_bounds) {
		var new_zoom = getBoundsZoomLevel(new_bounds);
		new_zoom = (new_zoom > 18) ? 15+zoom_adjustment : new_zoom+zoom_adjustment;
		gmap.setCenter(new_bounds.getCenter());
		gmap.setZoom(new_zoom);
	}
	
	// This will both place the markers AND call the GV_Marker_List function:
	GV_Process_Markers();

	// If labels are supposed to be visible, we need to re-do them after filtering
	if (gvg.labels_are_visible) {
		GV_Toggle_All_Labels(true);
	}
	
	if (gvg.info_window_open && gvg.open_info_window_index != null) {
		google.maps.event.trigger(wpts[gvg.open_info_window_index],"click");
		google.maps.event.trigger(wpts[gvg.open_info_window_index],"mouseout");
	}
}
GV_Filter_Waypoints_With_Text = GV_Filter_Markers_With_Text; // BC

function GV_Filter_Markers_In_View() {
	if (!self.gmap || !self.wpts) { return false; }
	var limit = (gv_options.marker_filter_options.limit > 0) ? gv_options.marker_filter_options.limit : 0;
	var update_list = (gv_options.marker_filter_options.update_list) ? true : false;
	var sort_list_by_distance = (gv_options.marker_filter_options.sort_list_by_distance) ? true : false;
	var bounds = null; if (gmap.getBounds) { bounds = gmap.getBounds(); }
	if (bounds) {
		gvg.marker_filter_current_position = gmap.getCenter();
		gvg.marker_filter_current_zoom = gmap.getZoom();
		gvg.marker_filter_moved_enough = true;
		if (gv_options.marker_filter_options.movement_threshold && gvg.marker_filter_last_position && gmap.getBounds) {
			var width_in_meters = google.maps.geometry.spherical.computeDistanceBetween(gmap.getCenter(),new google.maps.LatLng(gmap.getCenter().lat(),gmap.getBounds().getNorthEast().lng())) * 2;
			var moved_in_meters = google.maps.geometry.spherical.computeDistanceBetween(gvg.marker_filter_current_position,gvg.marker_filter_last_position);
			var fraction_moved = moved_in_meters/width_in_meters;
			var pixels_moved = gmap.getDiv().clientWidth * fraction_moved;
			if (gv_options.marker_filter_options.movement_threshold) {
				if (gvg.marker_filter_current_zoom != gvg.marker_filter_last_zoom || (pixels_moved == 0 && self.gv_options && gv_options.dynamic_data && gvg.dynamic_file_index >= 0 && gv_options.dynamic_data[gvg.dynamic_file_index] && gv_options.dynamic_data[gvg.dynamic_file_index].url)) {
					gvg.marker_filter_moved_enough = true;
				} else { // zoom was the same
					if (pixels_moved < parseFloat(gv_options.marker_filter_options.movement_threshold)) {
						gvg.marker_filter_moved_enough = false;
					}
				}
			}
		}
	} else {
		gvg.marker_filter_moved_enough = true;
	}
	if (gvg.marker_filter_moved_enough) {
		if (gvg.marker_list_exists && update_list) {
			GV_Reset_Marker_List();
		}
		var min_zoom = (gv_options.marker_filter_options.min_zoom && gv_options.marker_filter_options.min_zoom > 0) ? gv_options.marker_filter_options.min_zoom : 0;
		var show_no_markers = (gmap.getZoom() >= min_zoom) ? false : true;
		var to_be_added = [];
		
		// First, mark all points as to-be-removed
		for (var j=0; j<wpts.length; j++) {
			if (wpts[j]) {
				var m = wpts[j];
				m.gv_oor = true; // oor = out of range
				// While iterating through the points looking for ones to remove, record which ones should eventually be put back
				if (show_no_markers) {
					// we're in "don't show anything" mode, so there's no point in doing calculations
				} else {
					if (bounds && !bounds.contains(m.position)) {
						m.gv_oor = true; // do nothing; it's out of range
					} else {
						if (m.gvi.folder && gvg.marker_list_folder_state && gvg.marker_list_folder_state[m.gvi.folder]) { // not sure why this needs to be here, but it does
							if (gvg.marker_list_folder_state[m.gvi.folder].hidden) { m.gv_hidden_by_folder = true; }
						}
						if (!limit && !update_list) { // add everything that's in the viewport
							m.gv_oor = false;
							to_be_added.push(j);
						} else {
							if (limit > 0 || sort_list_by_distance) {
								m.gvi.dist_from_center = google.maps.geometry.spherical.computeDistanceBetween(gmap.getCenter(),m.position);
								var key = (m.gvi.dist_from_center/10000000).toFixed(8);
								m.gv_oor = false;
								to_be_added.push(key+' '+j);
							} else {
								m.gv_oor = false;
								to_be_added.push(j);
							}
						}
					}
				}
			}
		}
		// Then, put the appropriate ones back
		if (show_no_markers && update_list) {
			if (gmap.getZoom() < min_zoom) {
				if (gv_options.marker_list_options.zoom_message && gv_options.marker_list_options.zoom_message != '') {
					gvg.marker_list_html = gv_options.marker_list_options.zoom_message;
				} else if (gv_options.marker_filter_options.zoom_message && gv_options.marker_filter_options.zoom_message != '') {
					gvg.marker_list_html = gv_options.marker_filter_options.zoom_message;
				} else {
					gvg.marker_list_html = '<p>Zoom in further to see markers.</p>';
				}
			}
		} else {
			if (limit > 0 || (sort_list_by_distance && update_list)) {
				to_be_added = to_be_added.sort();
				if (limit > 0 && limit < to_be_added.length) { to_be_added.length = limit; }
				for (var j=0; j<to_be_added.length; j++) {
					var parts = to_be_added[j].split(' ');
					to_be_added[j] = parseInt(parts[1]);
				}
				if (!sort_list_by_distance) { // back to the original order
					to_be_added = to_be_added.sort(function(a,b){ return(a-b) });
				}
			}
			for (var j=0; j<to_be_added.length; j++) {
				var m = wpts[to_be_added[j]];
				m.gv_oor = false; // oor = out of range
				if (gvg.marker_list_exists && update_list && (m.type != 'tickmark' || gv_options.marker_list_options.include_tickmarks) && (m.type != 'trackpoint' || gv_options.marker_list_options.include_trackpoints) && !m.gvi.nolist) {
					if (limit > 0 && gvg.marker_list_count >= limit) {
						// do nothing; we're over the limit
					} else {
						if (typeof(m.gvi.list_html) != 'undefined') {
							GV_Update_Marker_List_With_Marker(m);
						}
					}
				}
			}
		}
		if (gvg.open_info_window_index != null && typeof(gvg.open_info_window_index) != 'undefined' && wpts[gvg.open_info_window_index].gv_oor) {
			gvg.info_window_open = false;
			gvg.open_info_window_index = null;
		}
		gvg.marker_filter_last_position = gmap.getCenter();
		gvg.marker_filter_last_zoom = gmap.getZoom();
	} // end if (gvg.marker_filter_moved_enough)
}


//  **************************************************
//  * tracks & tracklists
//  **************************************************

function GV_Draw_Track(tn) {
	if (!self.gmap || (!trk_segments[tn] && !trk[tn].segments) || (!trk_info[tn] && !trk[tn].info)) { return false; }
	if (!trk[tn]) { trk[tn] = {}; } trk[tn].overlays = [];
	if (!trk[tn].segments) { trk[tn].segments = []; } if (trk_segments[tn]) { trk[tn].segments = trk_segments[tn]; }
	if (!trk[tn].info) { trk[tn].info = {}; } if (trk_info[tn]) { trk[tn].info = trk_info[tn]; }
	trk[tn].elevations = [];
	trk[tn].info.index = tn;
	var trk_color = (trk[tn].info.color) ? GV_Color_Name2Hex(trk[tn].info.color) : '#ff0000'; trk[tn].info.color = trk_color;
	var trk_fill_color = (trk[tn].info.fill_color) ? GV_Color_Name2Hex(trk[tn].info.fill_color) : trk_color; trk[tn].info.fill_color = trk_fill_color;
	var trk_opacity = (trk[tn].info.opacity) ? parseFloat(trk[tn].info.opacity) : 1;
	var trk_fill_opacity = (trk[tn].info.fill_opacity) ? parseFloat(trk[tn].info.fill_opacity) : 0;
	var trk_width = (trk[tn].info.width) ? parseFloat(trk[tn].info.width) : 3; if (trk_width <= 0.1) { trk_width = 0; }
	var trk_outline_color = (trk[tn].info.outline_color) ? GV_Color_Name2Hex(trk[tn].info.outline_color) : '#000000';
	var trk_outline_opacity = (trk[tn].info.outline_opacity) ? parseFloat(trk[tn].info.outline_opacity) : 1;
	var trk_outline_width = (trk[tn].info.outline_width) ? parseFloat(trk[tn].info.outline_width) : 0;
	var trk_geodesic = (trk[tn].info.geodesic) ? true : false;
	var trk_draggable = (trk[tn].info.draggable) ? true : false;
	var bounds = new google.maps.LatLngBounds(); var coord_count = 0; var lats = []; var lons = [];
	var segment_points = [];
	var outline_segments = [];
	var outline_zindex = (trk[tn].info.z_index) ? parseFloat(trk[tn].info.z_index)-1 : -1;
	var last_eos;
	for (var s=0; s<trk[tn].segments.length; s++) {
		if (trk[tn].segments[s] && trk[tn].segments[s].points && trk[tn].segments[s].points.length > 0) {
			segment_points[s] = [];
			for (var p=0; p<trk[tn].segments[s].points.length; p++) {
				var lat = trk[tn].segments[s].points[p][0]; var lon = trk[tn].segments[s].points[p][1];
				var pt = new google.maps.LatLng(lat,lon);
				if (trk[tn].segments[s].points[p].length > 2) {
					if (!trk[tn].elevations[s]) { trk[tn].elevations[s] = []; }
					trk[tn].elevations[s][p] = trk[tn].segments[s].points[p][2];
				}
				segment_points[s].push(pt); bounds.extend(pt);
				lats.push(lat); lons.push(lon); coord_count += 1;
			}
		}
		if (trk_outline_width > 0 && trk[tn].segments[s].outline !== false) {
			// This is optimized such that conterminous outline segments are merged; but still, Google screws up the rendering beyond about 385 points.
			var start;
			if (!last_eos || !segment_points[s][0].equals(last_eos)) {
				start = 0; outline_segments.push([]); // start a new segment
			} else {
				start = 1; // don't repeat the first point of the new segment if it matches the last
			}
			for (var sps=start; sps<segment_points[s].length; sps++) {
				outline_segments[outline_segments.length-1].push(segment_points[s][sps]);
			}
			last_eos = lastItem(segment_points[s]);
		}
	}
	if (outline_segments.length) {
		for (var os=0; os<outline_segments.length; os++) {
			trk[tn].overlays.push (new google.maps.Polyline({path:outline_segments[os],strokeColor:trk_outline_color,strokeWeight:trk_outline_width,strokeOpacity:trk_outline_opacity,clickable:false,geodesic:trk_geodesic,draggable:trk_draggable,zIndex:outline_zindex}));
			lastItem(trk[tn].overlays).gv_outline = true;
			lastItem(trk[tn].overlays).setMap(gmap);
		}
	}
	
	for (var s=0; s<trk[tn].segments.length; s++) {
		if (segment_points[s] && segment_points[s].length > 0) {
			var segment_color = (trk[tn].segments[s].color) ? GV_Color_Name2Hex(trk[tn].segments[s].color) : trk_color;
			var segment_opacity = (trk[tn].segments[s].opacity) ? parseFloat(trk[tn].segments[s].opacity) : trk_opacity;
			var segment_width = (trk[tn].segments[s].width) ? parseFloat(trk[tn].segments[s].width) : trk_width;
			// var segment_outline_width = (trk[tn].segments[s].outline_width) ? parseFloat(trk[tn].segments[s].outline_width) : trk_outline_width; // this actually does nothing because outlines have already been drawn for the entire track at once
			if (trk_fill_opacity > 0) { // segments can't have their own fill opacity (yet?)
				trk[tn].overlays.push (new google.maps.Polygon({path:segment_points[s],strokeColor:segment_color,strokeWeight:segment_width,strokeOpacity:segment_opacity,fillColor:trk_fill_color,fillOpacity:trk_fill_opacity,clickable:false,geodesic:trk_geodesic,draggable:trk_draggable}));
			} else {
				trk[tn].overlays.push (new google.maps.Polyline({path:segment_points[s],strokeColor:segment_color,strokeWeight:segment_width,strokeOpacity:segment_opacity,clickable:false,geodesic:trk_geodesic,draggable:trk_draggable}));
			}
			if (trk[tn].info.z_index) {
				lastItem(trk[tn].overlays).setOptions({zIndex:parseFloat(trk[tn].info.z_index)});
			}
			lastItem(trk[tn].overlays).gv_segment_index = s;
			lastItem(trk[tn].overlays).setMap(gmap);
		}
	}
	trk[tn].info.is_polygon = (trk_fill_opacity > 0) ? true : false;
	if (!trk[tn].info.bounds && coord_count > 0) { trk[tn].info.bounds = bounds; }
	if (!trk[tn].info.center && coord_count > 0) { trk[tn].info.center = GV_Track_Center(trk[tn],lats,lons); }
	
	GV_Finish_Track(tn);
	
	trk[tn] = trk[tn]; // why? BC??
}

function GV_Finish_Track(tn) { // used by both "GV_Draw_Track" and the dynamic functions
	if (!self.gmap || !self.trk || (!self.trk_info && !trk[tn].info)) { return false; }
	if (!trk[tn].info) { trk[tn].info = trk_info[tn]; }
	if (!$('gv_track_tooltip')) { gvg.track_tooltip_object = GV_Initialize_Track_Tooltip(gmap); } // initialize it if it hasn't been done yet
	if (!trk[tn].info.info_window_contents) {
		var ww = 0; if (gv_options.info_window_width > 0) { ww = gv_options.info_window_width; } if (ww > 0 && ww < 200) { ww = 200; } // window width 
		var width_style = (ww > 0) ? 'max-width:'+ww+'px;' : '';
		var name = trk[tn].info.name;
		if (trk[tn].info.url) {
			var target = (trk[tn].info.link_target) ? trk[tn].info.link_target : (gv_options.marker_link_target) ? gv_options.marker_link_target : '_blank';
			name = '<a target="'+target+'" href="'+trk[tn].info.url+'">'+name+'</a>';
		}
		trk[tn].info.info_window_contents = '<div style="text-align:left; max-height:'+gv_options.info_window_height_maximum+'px; '+width_style+'" class="gv_marker_info_window"><div class="gv_marker_info_window_name">'+name+'</div><div class="gv_marker_info_window_desc">'+trk[tn].info.desc+'</div>';
		if (trk[tn].info.elevation && gv_options.track_profiles !== false) {
			trk[tn].info.info_window_contents += '<div class="gv_marker_info_window_profile"><a href="javascript:void(0);" title="Draw this track&apos;s elevation profile" onclick="GV_Draw_Elevation_Profile({tn:\''+tn+'\'});"><img src="'+gvg.embedded_images['profile']+'" border="0" /></a></div>';
		}
	}
	GV_Make_Track_Clickable(tn);
	GV_Make_Track_Mouseoverable(tn);
	if (trk[tn].info.hidden) {
		GV_Toggle_Overlays(trk[tn],false); // just the overlays because the tracklist probably isn't built yet
		trk[tn].gv_hidden_by_click = true;
	}
	trk[tn].gv_hidden = function() { return (this.gv_hidden_by_click) ? true : false; };
}
function GV_Track_Center(t,lats,lons) {
	var tc = null;
	if (t.info.is_polygon) {
		var max_area = 0; var biggest = -1;
		for (var o=0; o<t.overlays.length; o++) {
			if (!t.overlays[o].gv_outline) {
				var area = google.maps.geometry.spherical.computeArea(t.overlays[o].getPath());
				if (area && area > max_area) { biggest = o; max_area = area; }
			}
		}
		if (biggest >= 0) {
			var biggest_center = t.overlays[biggest].getBounds().getCenter();
			if (google.maps.geometry.poly.containsLocation(biggest_center,t.overlays[biggest])) { tc = biggest_center; }
		}
	}
	if (!tc) {
		if (!lats.length || !lons.length || lats.length != lons.length) {
			tc = null;
		} else {
			var n = lats.length;
			if (n % 2 == 1) {
				var mid = Math.floor((n-1)/2);
				tc = new google.maps.LatLng(lats[mid],lons[mid]);
			} else {
				var mid1 = Math.floor((n-1)/2); var mid2 = mid1+1;
				var lat = (lats[mid1]+lats[mid2])/2; var lon = (lons[mid1]+lons[mid2])/2;
				tc = new google.maps.LatLng(lat,lon);
			}
		}
	}
	return tc;
}
function GV_Make_Track_Clickable(tn) {
	if (!trk[tn].info || !trk[tn].overlays || trk[tn].info.clickable === false || (!trk[tn].info.name && !trk[tn].info.desc)) { return false; }
	for (var i=0; i<trk[tn].overlays.length; i++) {
		var track_part = trk[tn].overlays[i];
		track_part.setOptions({clickable:true});
		track_part.click_listener = google.maps.event.addListener(track_part, "click", function(click){
			GV_Open_Track_Window(tn,click);
		});
	}
}
function GV_Make_Track_Mouseoverable(tn) {
	if (!trk[tn].info || !trk[tn].overlays) { return false; }
	if ((gv_options.track_tooltips === true || trk[tn].info.tooltip === true) && trk[tn].info.name) {
		for (var i=0; i<trk[tn].overlays.length; i++) {
			var track_part = trk[tn].overlays[i];
			track_part.mouseover_listener = google.maps.event.addListener(track_part, "mouseover", function(mouse){ GV_Create_Track_Tooltip(tn,mouse); GV_Highlight_Track(tn,true); });
			track_part.mousemove_listener = google.maps.event.addListener(track_part, "mousemove", function(mouse){ GV_Create_Track_Tooltip(tn,mouse); });
			track_part.mouseout_listener = google.maps.event.addListener(track_part, "mouseout", function(){ GV_Hide_Track_Tooltip(); GV_Highlight_Track(tn,false); });
		}
	} else {
		return false;
	}
}
function GV_Open_Track_Window(tn,click) { // tn = track number
	if (!tn || !trk[tn]) { return; }
	if (trk[tn].info && trk[tn].info.info_window_contents) {
		var coords;
		if (click && click.latLng) {
			coords = click.latLng;
		} else if (trk[tn].info.center) {
			coords = trk[tn].info.center;
		}
		if (coords) {
			if (gv_options.multiple_info_windows) {
				if (!trk[tn].info_window) { trk[tn].info_window = new google.maps.InfoWindow(); }
				trk[tn].info_window.setPosition(coords); trk[tn].info_window.setContent(trk[tn].info.info_window_contents); trk[tn].info_window.open(gmap);
			} else {
				gvg.info_window.close(); gvg.open_info_window_index = null;
				gvg.info_window.setOptions({position:coords,maxWidth:gv_options.info_window_width_maximum,content:trk[tn].info.info_window_contents});
				gvg.info_window.open(gmap);
			}
		}
	}
}

gvg.tracklist_count = 0;
function GV_Add_Track_to_Tracklist(opts) { // opts is a collection of info about the track
	if (!self.gmap || !opts) { return false; }
	if (gv_options.tracklist_options && (gv_options.tracklist_options.tracklist === false || gv_options.tracklist_options.enabled === false)) { return false; }
	var tlo = (gv_options.tracklist_options) ? gv_options.tracklist_options : [];
	var tracklinks_id = (opts.div_id && $(opts.div_id)) ? opts.div_id : tlo.id;  // default is 'gv_tracklist'
	if (!$(tracklinks_id)) { return false; }
	if (!$('gv_track_tooltip')) { gvg.track_tooltip_object = GV_Initialize_Track_Tooltip(); } // initialize it if it hasn't been done yet
	var tracklinks = $(tracklinks_id);
	var tracklist_background_color = ($('gv_tracklist') && $('gv_tracklist').style.backgroundColor) ? GV_Color_Hex2CSS($('gv_tracklist').style.backgroundColor).replace(/ /g,'') : GV_Color_Hex2CSS('#ffffff').replace(/ /g,'');
	var this_color_as_css = GV_Color_Hex2CSS(GV_Color_Name2Hex(opts.color)).replace(/ /g,'');
	var alternate_color = (tracklist_background_color == 'rgb(204,204,204)') ? '#999999' : '#CCCCCC';
	if (tracklist_background_color == this_color_as_css) { opts.color = alternate_color; }
	
	if (opts.number && !opts.id) { opts.id = (opts.number.toString().match(/[^0-9]/)) ? 'trk[\''+opts.number+'\']' : 'trk['+opts.number+']'; } else if (!opts.number && opts.id) { opts.number = opts.id.replace(/.*trk\[\'?(\d+)\'?\].*/,'$1'); }
	if (!eval('self.'+opts.id)) { return false; }
	var tn = opts.number;
	var tn_text = (tn.toString().match(/[^0-9]/)) ? "'"+tn+"'" : tn;
	if (!opts.name) { opts.name = (tn) ? '[track '+tn+']' : '[track]'; }
	if (opts.shortdesc) { opts.desc = (opts.shortdesc == '-') ? '' : opts.shortdesc; }
	
	var show_desc = (tlo.desc) ? true : false;
	var info_id = opts.id+'.info';
	var id_escaped = opts.id.replace(/'/g,"\\'");
	var info_id_htmlescaped = info_id.replace(/"/g,"&quot;");
	var tooltips = (tlo.tooltips === false) ? false : true;
	var tracklist_tooltip_show = (tooltips) ? ' GV_Create_Track_Tooltip('+tn_text+');' : '';
	var tracklist_tooltip_hide = (tooltips) ? ' GV_Hide_Track_Tooltip();' : '';
	var highlight = (tlo.highlighting) ? true : false;
	var tracklist_highlight = (highlight) ? ' GV_Highlight_Track('+tn_text+',true);' : '';
	var tracklist_unhighlight = (highlight) ? ' GV_Highlight_Track('+tn_text+',false);' : '';
	var zoom_link = ''; if (tlo.zoom_links !== false) {
		if (eval('self.'+info_id) && eval(info_id+"['bounds']")) { opts.bounds = eval(info_id+"['bounds']"); } // backhandedly get the bounds from the track id
		if (opts.bounds && opts.bounds.getSouthWest && opts.bounds.getSouthWest().lng() == 180 && opts.bounds.getNorthEast().lng() == -180) { opts.bounds = null; }
		if (opts.bounds && opts.bounds.getCenter) {
			var center_lat = opts.bounds.getCenter().lat(); var center_lon = opts.bounds.getCenter().lng();
			var size = new google.maps.Size(gmap.getDiv().clientWidth-50,gmap.getDiv().clientHeight-50); // allow for a little margin
			var zoom = getBoundsZoomLevel(opts.bounds,size);
			zoom_link = '<img src="'+gvg.embedded_images['tracklist_goto']+'" width="9" height="9" border="0" alt="" title="zoom to this track" onclick="GV_Recenter('+center_lat+','+center_lon+','+zoom+');" style="padding-left:3px; cursor:crosshair;">';
		}
	}
	var toggle_click = 'GV_Toggle_Track('+tn_text+',null,\''+opts.color+'\');';
	var window_click = (tlo.info_window === false) ? '' : 'GV_Open_Track_Window('+tn_text+');';
	var name_click = (tlo.toggle !== false && tlo.toggle_names !== false) ? toggle_click : window_click;
	var toggle_box = ''; if (tlo.checkboxes || tlo.toggle_links) {
		var checked = (trk[tn] && trk[tn].gv_hidden_by_click) ? '' : 'checked';
		toggle_box = '<input id="trk['+tn_text+']_tracklist_toggle" type="checkbox" style="width:12px; height:12px; padding:0px; margin:0px 4px 0px 0px;" '+checked+' onclick="'+toggle_click+'" title="click to hide/show this track" />';
	}
	var display_color = (trk[tn] && trk[tn].gv_hidden_by_click) ? gvg.dimmed_color : GV_Color_Name2Hex(opts.color);
	var name_mouseover = 'this.style.textDecoration=\'underline\'; '; var name_mouseout = 'this.style.textDecoration=\'none\'; ';
	var bullet = (toggle_box) ? toggle_box : opts.bullet.replace(/ <\//g,'&nbsp;</').replace(/ $/,'&nbsp;');
	var html = '';
	html += '<div class="gv_tracklist_item">';
	html += '<table cellspacing="0" cellpadding="0" border="0">';
	html += '<tr valign="top">';
	html += '<td class="gv_tracklist_item_name" nowrap>'+bullet+'</td>';
	html += '<td class="gv_tracklist_item_name">';
	var title = (tlo.toggle !== false && tlo.toggle_names !== false) ? 'click to hide/show this track' : '';
	title = (!show_desc && opts.desc) ? opts.desc.replace(/"/g,"&quot;").replace(/(<br ?\/?>|<\/p>)/,' ').replace(/<[^>]*>/g,'') : title;
	html += '<span id="'+opts.id+'_tracklist_item" style="color:'+display_color+';" onclick="'+name_click+'" onmouseover="'+name_mouseover+tracklist_tooltip_show+tracklist_highlight+'" onmouseout="'+name_mouseout+tracklist_tooltip_hide+tracklist_unhighlight+'" title="'+title+'">'+opts.name+'</span>'+zoom_link;
	html += '</td></tr>';
	if (show_desc && opts.desc) {
		var op = (trk[tn].gv_hidden_by_click) ? '0.5' : '1.0';
		html += '<tr valign="top"><td></td><td id="'+opts.id+'_tracklist_desc" class="gv_tracklist_item_desc" style="opacity:'+op+';">'+opts.desc+'</td></tr>';
	}
	html += '</table>';
	html += '</div>';
	
	if (!gvg.tracklinks_html) { gvg.tracklinks_html = []; }
	if (!gvg.tracklinks_html[tracklinks_id]) { gvg.tracklinks_html[tracklinks_id] = ''; }
	gvg.tracklinks_html[tracklinks_id] += html;
	
	gvg.tracklist_count += 1;
}

function GV_Finish_Tracklist() {
	var tlo = gv_options.tracklist_options;
	if (gvg.tracklinks_html) {
		if (tlo.id && $(tlo.id) && !$('gv_tracklist_header') && tlo.header) {
			var header_html = '<div id="gv_tracklist_header" class="gv_tracklist_header">'+tlo.header+'</div>';
			$(tlo.id).innerHTML = header_html + $(tlo.id).innerHTML;
		}
		for (var id in gvg.tracklinks_html) {
			if ($(id)) { $(id).innerHTML += gvg.tracklinks_html[id]; }
		}
		if (tlo.id && $(tlo.id) && !$('gv_tracklist_footer') && tlo.footer) {
			var footer_html = '<div id="gv_tracklist_footer" class="gv_tracklist_footer">'+tlo.footer+'</div>';
			$(tlo.id).innerHTML = $(tlo.id).innerHTML + footer_html;
		}
	}
}

function GV_TrackIndex(tn) {
	if (!self.trk || Object.keys(trk).length == 0) { return null; }
	if (tn.toString().indexOf('trk') > -1) {
		var i = tn.replace(/.*trk\[\'?([^\'\[\]]+)\'?\].*/,'$1');
		if (trk[i]) { return i; }
	} else {
		if (trk[tn]) { return tn; }
	}
	// we'll only reach this point if the previous tests failed
	var j=0; var found=null;
	for (var j in trk) { if (found==null && trk[j] && trk[j].info && trk[j].info.name == tn) { found = j; }	}
	return found; // will be null if no match was found
}
function GV_Show_Track(tn) { GV_Toggle_Track(tn,true); }
function GV_Hide_Track(tn) { GV_Toggle_Track(tn,false); }
function GV_Show_All_Tracks() { GV_Toggle_All_Tracks(true); }
function GV_Hide_All_Tracks() { GV_Toggle_All_Tracks(false); }
function GV_Toggle_Track(tn,force,color) {
	tn = GV_TrackIndex(tn); if (tn == null) { return false; }
	if (self.trk && trk[tn]) {
		if (!color && trk[tn].info) { color = trk[tn].info.color; }
		GV_Toggle_Overlays(trk[tn],force);
		GV_Toggle_Tracklist_Item_Opacity(tn,color,force);
	}
}

function GV_Show_Tracks() {
	var tns = GV_Match_Tracks(arguments);
	for (var j=0; j<tns.length; j++) { GV_Toggle_Track(tns[j],true); }
}
function GV_Hide_Tracks() {
	var tns = GV_Match_Tracks(arguments);
	for (var j=0; j<tns.length; j++) { GV_Toggle_Track(tns[j],false); }
}
function GV_Toggle_Tracks() {
	var tns = GV_Match_Tracks(arguments);
	for (var j=0; j<tns.length; j++) { GV_Toggle_Track(tns[j]); }
}
function GV_Match_Tracks(args) {
	var patterns = []; var numbers = []; var matching_tns = [];
	if(args.length > 1) {
		for (j=0; j<args.length; j++) {
			if(!isNaN(args[j])) { numbers.push(args[j]); }
		}
	} else if(args[0] && typeof(args[0]) == 'number') {
		numbers.push(args[0]);
	} else if(args[0] && typeof(args[0]) == 'string') {
		patterns['name'] = args[0];
	} else if(args[0] && typeof(args[0]) == 'object') {
		patterns = args[0];
	} else {
		return false;
	}
	if (numbers.length > 0) {
		for (var j=0; j<numbers.length; j++) { matching_tns.push(numbers[j]); }
		return matching_tns;
	} else if (Object.keys(patterns).length > 0) {
		var trk_ok = []; for (var tn in trk) { trk_ok[tn] = true; }
		for (var field in patterns) {
			var p = new RegExp(patterns[field],'i'); // p.exec(something.toString())
			for (var tn in trk_ok) {
				if (!trk[tn].info[field] || !p.exec(trk[tn].info[field].toString())) {
					delete trk_ok[tn];
				}
			}
		}
		for (var tn in trk_ok) { matching_tns.push(tn); }
		return matching_tns;
	} else {
		return false;
	}
	
}

function GV_Delete_All_Tracks() {
	for (var id in gvg.tracklinks_html) {
		gvg.tracklinks_html[id] = '';
		if ($(id)) { $(id).innerHTML = ''; }
	}
	for (var tn in trk) {
		if (trk[tn] && trk[tn].info) { GV_Hide_Track(tn); }
		trk[tn] = null;
	}
}

function GV_Toggle_All_Tracks(force) {
	if (!self.gmap || !self.trk) { return false; }
	for (var tn in trk) {
		if (trk[tn] && trk[tn].info) {
			GV_Toggle_Track(tn,force);
		}
	}
}
function GV_Toggle_Track_And_Tracklist_Item(tn,color,force) { // BC
	GV_Toggle_Track(tn,force,color);
}
function GV_Toggle_Track_And_Label(map,id,color,force) { // BC
	GV_Toggle_Track(id,force,color);
}
function GV_Toggle_Overlays(overlay_array,force) {
	if (!gmap || !overlay_array) { return false; }
	if (!overlay_array.gv_hidden_by_click && force) {
		return false; // do nothing; it's not hidden and we're trying to turn it on
	} else if (overlay_array.gv_hidden_by_click && force === false) {
		return false; // do nothing; it IS hidden and we're trying to turn it off
	}
	if (typeof(overlay_array.length) == 'number' && !overlay_array.updated_to_new_format) { // old map; force the track's overlays into the new structure
		if (!overlay_array.overlays) { overlay_array.overlays = []; }
		for (var i=0; i<overlay_array.length; i++) { overlay_array.overlays.push(overlay_array[i]); }
		overlay_array.updated_to_new_format = true;
	}
	if (overlay_array.gv_hidden_by_click) {
		if (!overlay_array.gv_oor) { // don't turn it on if it's "out of range"
			for (var j=0; j<overlay_array.overlays.length; j++) {
				if (overlay_array.overlays[j].position) { // marker
					overlay_array.overlays[j].gv_hidden_by_click = false;
					GV_Process_Marker(overlay_array.overlays[j]);
					// minor issue: this doesn't affect the marker list, but maybe it should
				} else { // track
					overlay_array.overlays[j].gv_hidden_by_click = false;
					overlay_array.overlays[j].setMap(gmap);
				}
			}
		}
		overlay_array.gv_hidden_by_click = false;
	} else if (overlay_array.overlays) {
		for (var j=0; j<overlay_array.overlays.length; j++) {
			if (overlay_array.overlays[j].position) { // marker
				overlay_array.overlays[j].gv_hidden_by_click = true;
				GV_Process_Marker(overlay_array.overlays[j]);
				// minor issue: this doesn't affect the marker list, but maybe it should
			} else { // track
				overlay_array.overlays[j].gv_hidden_by_click = true;
				overlay_array.overlays[j].setMap(null);
			}
		}
		overlay_array.gv_hidden_by_click = true;
	}
}
function GV_Toggle_Tracklist_Item_Opacity(tn,original_color,force) { // for track labels in the tracklist
	var tn_text = (tn.toString().match(/[^0-9]/)) ? "'"+tn+"'" : tn;
	var label = $('trk['+tn_text+']_tracklist_item');
	if (!label || !label.style) { return false; }
	if (!trk[tn].overlays || !trk[tn].overlays.length) { return false; }
	if (trk[tn].gv_hidden_by_click) {
		label.style.color = gvg.dimmed_color;
		if ($('trk['+tn_text+']_tracklist_desc')) { $('trk['+tn_text+']_tracklist_desc').style.opacity = 0.5; }
		if ($('trk['+tn_text+']_tracklist_toggle')) { $('trk['+tn_text+']_tracklist_toggle').checked = false; }
	} else {
		label.style.color = original_color;
		if ($('trk['+tn_text+']_tracklist_desc')) { $('trk['+tn_text+']_tracklist_desc').style.opacity = 1.0; }
		if ($('trk['+tn_text+']_tracklist_toggle')) { $('trk['+tn_text+']_tracklist_toggle').checked = true; }
	}
}

gvg.original_track_widths = [];
function GV_Highlight_Track(tn,highlight) {
	tn = GV_TrackIndex(tn); if (tn == null) { return false; }
	if (!trk[tn] || !trk[tn].overlays || !trk[tn].overlays.length || !trk[tn].info) { return false; }
	var original_width = (trk[tn].info.width) ? trk[tn].info.width : 3;
	var original_fo = (trk[tn].info.fill_opacity) ? trk[tn].info.fill_opacity : 0; var new_fo = original_fo+((1-original_fo)/4);
	if (highlight) {
		gvg.original_track_widths[tn] = [];
		for (var j=0; j<trk[tn].overlays.length; j++) {
			gvg.original_track_widths[tn][j] = trk[tn].overlays[j].strokeWeight;
			if (trk[tn].overlays[j].getPath) {
				trk[tn].overlays[j].setOptions({strokeWeight:trk[tn].overlays[j].strokeWeight+3});
				if (original_fo) { trk[tn].overlays[j].setOptions({fillOpacity:new_fo}); }
			}
		}
	} else {
		if (gvg.original_track_widths[tn]) {
			for (var j=0; j<trk[tn].overlays.length; j++) {
				if (trk[tn].overlays[j].getPath) {
					trk[tn].overlays[j].setOptions({strokeWeight:gvg.original_track_widths[tn][j]});
					if (original_fo) { trk[tn].overlays[j].setOptions({fillOpacity:original_fo}); }
				}
			}
		} else {
			for (var j=0; j<trk[tn].overlays.length; j++) {
				if (trk[tn].overlays[j].getPath) {
					trk[tn].overlays[j].setOptions({strokeWeight:original_width});
					if (original_fo) { trk[tn].overlays[j].setOptions({fillOpacity:original_fo}); }
				}
			}
		}
		gvg.original_track_widths[tn] = [];
	}
}


// tracklist_tooltip_show += ' '+id_escaped+'.overlays[0].setOptions({strokeWeight:10});';




//  **************************************************
//  * dynamic markers & tracks
//  **************************************************
gvg.dynamic_file_index = -1; gvg.reloading_data = false; gvg.idled_at_least_once = false; gvg.static_marker_count = 0; gvg.dynamic_marker_collection = []; // global variables that need to be set just once

function GV_Reload_Markers_From_All_Files(mode) {
	if (!self.gmap) { return false; }
	
	gvg.dynamic_trigger = mode; // 1 = initial, 2 = on move, 0/null = manual
	gvg.autozoom_elements = [];
	
	if (gvg.listeners['dynamic_reload']) { google.maps.event.removeListener(gvg.listeners['dynamic_reload']); gvg.listeners['dynamic_reload'] = null; }
	
	// GV_Get_Dynamic_File_Info(); // do it again in case anything changed; is this necessary?
	
	// This whole next block is simply for the purpose of seeing if the map moved enough to bother reloading the points
	if (gvg.dynamic_reload_on_move) {
		var current_bounds = gmap.getBounds(); var current_center = gmap.getCenter(); var current_zoom = gmap.getZoom();
		var lat_center = current_center.lat().toFixed(7); var lon_center = current_center.lng().toFixed(7);
		var SW = current_bounds.getSouthWest(); var NE = current_bounds.getNorthEast();
		gvg.dynamic_pixels_moved = 0;
		if (gvg.dynamic_data_last_center) {
			var width_in_meters = google.maps.geometry.spherical.computeDistanceBetween(current_center,new google.maps.LatLng(gmap.getCenter().lat(),gmap.getBounds().getNorthEast().lng())) * 2;
			var moved_in_meters = google.maps.geometry.spherical.computeDistanceBetween(current_center,gvg.dynamic_data_last_center);
			var fraction_moved = moved_in_meters/width_in_meters;
			gvg.dynamic_pixels_moved = gmap.getDiv().clientWidth * fraction_moved;
		}
		if (gvg.dynamic_data_last_zoom) {
			gvg.dynamic_zoom_moved = current_zoom - gvg.dynamic_data_last_zoom;
		}
	}
	gvg.dynamic_zoom_moved_enough = false;
	if (!gvg.dynamic_pixels_moved || !mode) { gvg.dynamic_zoom_moved_enough = true; } // manual reload
	else if (gvg.dynamic_zoom_moved) { gvg.dynamic_zoom_moved_enough = true; } // zoom change
	else if (gvg.dynamic_pixels_moved && gvg.dynamic_pixels_moved >= gvg.dynamic_movement_threshold) { gvg.dynamic_zoom_moved_enough = true; }
	
	if (!gvg.dynamic_zoom_moved_enough) {
		gvg.dynamic_file_index = -1;
		window.setTimeout("GV_Create_Dynamic_Reload_Listener()",100);
		return;
	}
	
	// Remove all non-dynamic markers from the map... but maybe this should be done on a file-by-file basis
	/*
	for (var i=0; i<wpts.length; i++) {
		if (wpts[i] && wpts[i].gvi.dynamic) { // keep any "static" markers
			GV_Remove_Marker(wpts[i]);
			wpts[i] = null;
		}
	}
	*/
	for (var i=0; i<gv_options.dynamic_data.length; i++) { gv_options.dynamic_data[i].processed = false; }
	
	// This just starts the ball rolling.  It's up to the data-loading subroutines to call the next file.
	if (gv_options.dynamic_data && gv_options.dynamic_data[gvg.dynamic_file_index+1] && (gv_options.dynamic_data[gvg.dynamic_file_index+1].url || gv_options.dynamic_data[gvg.dynamic_file_index+1].google_spreadsheet) && !gv_options.dynamic_data[gvg.dynamic_file_index+1].processed) {
		gvg.dynamic_file_index = 0; gvg.reloading_data = true;
		GV_Load_Markers_From_File(); // this will call something that will eventually call GV_Finish_Map
		return;
	}
}

function GV_Reload_Markers_From_File(index,et_al) { // no longer used, but included for BC
	GV_Load_Markers_From_File(index);
}

function GV_Load_Markers_From_File(file_index) {
	if (!self.gmap || !self.gv_options || !gv_options.dynamic_data) { return false; }
	if (!self.wpts) { wpts = []; }
	if (file_index != null && typeof(file_index) != 'undefined') {
		gvg.dynamic_trigger = 0; // 1 = initial, 2 = on move, 0/null = manual
		gvg.dynamic_file_index = parseInt(file_index);
		gvg.dynamic_file_single = true;
	} else { // it was called without a number or an existing index, so just start from the beginning and do all of them
		if (gvg.dynamic_file_index < 0) { gvg.dynamic_file_index = 0; }
		gvg.dynamic_file_single = false;
	}
	if (!gv_options.dynamic_data[gvg.dynamic_file_index]) {
		gvg.dynamic_file_index = -1; // reset it for future reloads
		return false;
	}
	var opts = gv_options.dynamic_data[gvg.dynamic_file_index];
	var google_spreadsheet = false;
	var google_kml = false;
	// Some options for special cases:
	if (opts.google_spreadsheet && !opts.url) {
		opts.url = opts.google_spreadsheet;
		google_spreadsheet = true;
	}
	if (!opts.url) { return; }
	
	
	var ok_to_load = true;
	if (gvg.dynamic_trigger == 1 && opts.load_on_open === false) {
		ok_to_load = false;
	} else if (gvg.dynamic_trigger == 2 && !opts.reload_on_move) {
		ok_to_load = false;
	}
	
	if (ok_to_load) {
		// remove all markers belonging to this file, if applicable
		if (gvg.dynamic_file_count == 1) {
			GV_Delete_All_Markers(gvg.static_marker_count); // leave the static markers
		} else if (gvg.dynamic_marker_collection[gvg.dynamic_file_index]) {
			for (var d=0; d<gvg.dynamic_marker_collection[gvg.dynamic_file_index].length; d++) {
				var i = gvg.dynamic_marker_collection[gvg.dynamic_file_index][d];
				if (wpts[i]) {
					GV_Remove_Marker(wpts[i]);
					wpts[i] = null;
				}
			}
		}
		gvg.dynamic_marker_collection[gvg.dynamic_file_index] = [];
	} else if (!ok_to_load && gvg.dynamic_file_single) {
		return;
	} else { // !ok_to_load
		GV_Load_Next_Dynamic_File();
		return;
	}
	
	opts.url = opts.url.replace(/^\s*<?(.*)>?\s*$/,'$1'); // remove white space and possible brackets
	if (opts.url.match(/^https?:\/\/maps\.google\.|google\.\w+\/maps\//)) { // Google directions, My Maps, etc.; but output=kml doesn't work with Google Maps anymore.
		var query_punctuation = (opts.url.indexOf('?') > -1) ? '&' : '?';
		// opts.url = opts.url+query_punctuation+'output=kml';
		opts.url = 'https://www.google.com/maps/d/kml?forcekml=1&mid='+opts.url.replace(/^.*\bmid=([^&]+).*$/,'$1');
		if (opts.url.match(/&ll=[0-9\.\-]+,[0-9\.\-]+/) && opts.url.match(/&z=[0-9]+/)) {
			var center_lat = parseFloat( opts.url.replace(/^.*&ll=([0-9\.\-]+),([0-9\.\-]+).*$/,'$1') );
			var center_lon = parseFloat( opts.url.replace(/^.*&ll=([0-9\.\-]+),([0-9\.\-]+).*$/,'$2') );
			var zoom = parseInt( opts.url.replace(/^.*&z=([0-9]+).*$/,'$1') );
		}
		google_kml = true;
	} else if (google_spreadsheet || (opts.url && (opts.url.match(/(docs?\d*|drive\d*|spreadsheets?\d*)\.google\.com/) && !opts.url.match(/dynamic_data\?/)))) { // Google spreadsheet
		opts.root_tag = (opts.root_tag) ? opts.root_tag : 'feed';
		opts.marker_tag = (opts.marker_tag) ? opts.marker_tag : 'entry';
		opts.tag_prefix = (opts.tag_prefix) ? opts.tag_prefix : 'gsx$';
		opts.content_tag = (opts.content_tag) ? opts.content_tag : '$t';
		opts.tagnames_stripped = (opts.tagnames_stripped === false) ? false : true;
		opts.prevent_caching = false; // it mucks up Google Docs URLs
		google_spreadsheet = true;
	} else if (opts.url && opts.url.match(/http.*twitter\.com\//)) {
		// Re-write twitter URLs to format: https://twitter.com/statuses/user_timeline/USERNAME.json?callback=GV_JSON_Callback
		if (opts.url.match(/\.json/)) {
			// it's already probably fine
		} else if (opts.url.match(/^.*twitter\.com\/(\#\!\/search\/)*(\w+\/)*([A-Za-z0-9\._-]+).*?/)) {
			opts.url = opts.url.replace(/^.*twitter\.com\/(\#\!\/search\/)*(\w+\/)*([A-Za-z0-9\._-]+).*?/,'https://twitter.com/statuses/user_timeline/'+'$3'+'.json');
		} else if (opts.url.match(/^.*twitter\.com\/(\#\!\/)?([A-Za-z0-9\._-]+).*?/)) {
			opts.url = opts.url.replace(/^.*twitter\.com\/(\#\!\/)?([A-Za-z0-9\._-]+).*?/,'https://twitter.com/statuses/user_timeline/'+'$2'+'.json');
		}
	} else if (opts.url && opts.url.match(/http.*flickr\.com\/.*(id=|photos\/)/i)) {
		// Re-write flickr URLs to format: https://api.flickr.com/services/feeds/geo/?id=USER_ID&format=json&jsoncallback=GV_JSON_Callback
		var flickr_id = (opts.url.match(/.*(\bid=|flickr\.com\/photos\/)([^\&\/]*).*/i)) ? opts.url.replace(/.*(\bid=|flickr\.com\/photos\/)([^\&\/]*).*/,'$2') : '';
		var flickr_tag = (opts.url.match(/.*(\btags=|\/tags\/)([^\&\/]*).*/i)) ? opts.url.replace(/.*(\btags=|\/tags\/)([^\&\/]*).*/,'$2') : '';
		opts.url = 'https://api.flickr.com/services/feeds/geo/?id='+flickr_id+'&tags='+flickr_tag+'&format=json&jsoncallback=GV_JSON_Callback';
	} else if (opts.url.match(/^http.*instamapper\.com\/api/i)) { // Instamapper JSON data
		opts.root_tag = 'positions';
		opts.marker_tag = (typeof(opts.marker_tag) != 'undefined' && opts.marker_tag != '') ? opts.marker_tag : 'root_tag';
		opts.track_tag = (typeof(opts.track_tag) != 'undefined' && opts.track_tag != '') ? opts.track_tag : 'none';
		opts.track_segment_tag = (typeof(opts.track_segment_tag) != 'undefined' && opts.track_segment_tag != '') ? opts.track_segment_tag : 'none';
		opts.track_point_tag = (typeof(opts.track_point_tag) != 'undefined' && opts.track_point_tag != '') ? opts.track_point_tag : 'root_tag';
		opts.tag_prefix = '';
		opts.content_tag = '';
		opts.tagnames_stripped = false;
		if (opts.track_options && !opts.track_options.name) { opts.track_options.name = 'Instamapper positions'; }
		if (opts.synthesize_fields && !opts.synthesize_fields.name) { opts.synthesize_fields.name = '{timestamp}'; }
		opts.time_stamp = (typeof(opts.time_stamp) != 'undefined' && opts.time_stamp != '') ? opts.time_stamp : 'timestamp';
	} else if (opts.url.match(/findmespot\.com\/messageService/i)) { // SPOT feeds
		opts.root_tag = 'messageList';
		opts.marker_tag = (typeof(opts.marker_tag) != 'undefined' && opts.marker_tag != '') ? opts.marker_tag : 'message';
		opts.track_tag = (typeof(opts.track_tag) != 'undefined' && opts.track_tag != '') ? opts.track_tag : 'none';
		opts.track_segment_tag = (typeof(opts.track_segment_tag) != 'undefined' && opts.track_segment_tag != '') ? opts.track_segment_tag : 'none';
		opts.track_point_tag = (typeof(opts.track_point_tag) != 'undefined' && opts.track_point_tag != '') ? opts.track_point_tag : 'message';
		opts.tag_prefix = '';
		opts.content_tag = '';
		opts.tagnames_stripped = false;
		if (opts.track_options && !opts.track_options.name) { opts.track_options.name = 'SPOT positions'; }
		if (opts.synthesize_fields && !opts.synthesize_fields.name) { opts.synthesize_fields.name = '{timestamp}'; }
		// opts.time_stamp = (typeof(opts.time_stamp) != 'undefined' && opts.time_stamp != '') ? opts.time_stamp : 'timestamp';
	}
	gv_options.dynamic_data[gvg.dynamic_file_index] = opts;
	
	if (gvg.marker_list_exists) {
		GV_Reset_Marker_List();
		
		if (gvg.dynamic_file_index == 0) {
			$(gvg.marker_list_div_id).innerHTML = 'Loading markers...';
		}
		for (var s=0; s<wpts.length; s++) {
			var m = wpts[s];
			if (m && m.gvi && typeof(m.gvi.list_html) != 'undefined') {
				GV_Update_Marker_List_With_Marker(m);
			}
		}
	}
	
	gvg.dynamic_data_last_center = gmap.getCenter();
	gvg.dynamic_data_last_zoom = gmap.getZoom();
	
	if (google_spreadsheet || opts.url.match(/json\b|\.js\b|-js\b/i) || opts.url.match(/callback=GV_/i) || opts.url.match(/http.*instamapper\.com\/api/)) {
		GV_Load_Markers_From_JSON(opts.url);
	} else if (!google_spreadsheet && (google_kml || opts.url.match(/\.(xml|kml|kmz|gpx)$/i) || opts.url.match(/=(xml|kml|kmz|gpx)\b/i))) {
		GV_Load_Markers_From_XML_File(opts.url);
	} else {
		GV_Load_Markers_From_XML_File(opts.url);
	}
	
}
function gid_to_wid(gid) { // from https://stackoverflow.com/questions/11290337/
	var xorval = (gid > 31578) ? 474 : 31578;
	var letter = (gid > 31578) ? 'o' : '';
	return letter+parseInt((gid ^ xorval)).toString(36);
}

function GV_Load_Markers_From_JSON(url) {
	if (typeof(url) == 'object') { // this is actually being used as a JSON callback!
		var url = '';
	}
	var google_docs_key = ''; var sheet_id = ''; var full_url;
	if (url.match(/^(http|\/\/)/) && url.match(/(spreadsheets?\d*|docs?\d*|drive\d*)\.google\.\w+\//i)) {
		if (url.match(/\/spreadsheets\/d\/e\/2PACX/)) { // Google Sheets "Publish to the Web" links don't work!
			full_url = '';
			var msg = "<div id=\"pttw_error\" style=\"width:300px; padding:8px; border:1px solid red; background:white;\"><div style=\"text-align:right; padding-bottom:4px; color:red; cursor:pointer;\" onclick=\"GV_Delete('pttw_error');\"><b>&#215;</b></div>The URL that Google Docs gives you when you 'Publish to the Web' does not work as a dynamic data source.  Please use the URL shown in your browser's location bar.</div>";
			GV_Place_HTML({html:msg,x:100,y:100,anchor:'center'} );
		} else if (url.match(/\/spreadsheets\/d\/([A-Za-z0-9\._-]+)\b/)) { // new Google Sheets
			google_docs_key = url.replace(/^.*\/spreadsheets\/d\/([A-Za-z0-9\._-]+)\b.*/,'$1');
			// sheet_id = (url.match(/gid=([^&]+)/i)) ? url.replace(/^.*gid=([^&#]+).*/i,'$1') : '0';
			sheet_id = (url.match(/gid=([^&]+)/i)) ? url.replace(/^.*gid=([^&#]+).*/i,'$1') : 'default';
			if (sheet_id != 'default') {
				sheet_id = gid_to_wid(sheet_id);
			}
			//if (!sheet_id.match(/^[1-9]$/)) {
			//	// Google made a change on 7/1/14: gid can no longer be used in the /feeds/list/{sheet_id} URL; instead they can be either sequentially numbered or use a 7-character key like "o4uxj6" (derived from a base-36 transformation)
			//	sheet_id = gid_to_wid(sheet_id);
			//}
		} else if (url.match(/\bkey=/)) { // old Google Docs/Drive spreadsheet
			// THIS PROBABLY WON'T WORK ANYMORE BECAUSE GOOGLE UPGRADED THE DOCUMENTS AND CHANGED THE KEYS
			google_docs_key = url.replace(/^.*\bkey=([A-Za-z0-9\._-]+).*/,'$1');
			sheet_id = (url.match(/gid=([^&]+)/i)) ? url.replace(/^.*gid=([^&#]+).*/i,'$1') : 'default';
			if (sheet_id != 'default') {
				sheet_id = gid_to_wid(sheet_id);
			}
		} else if (url.indexOf('/feeds/') > -1) { // old spreadsheet feed URL
			google_docs_key = url.replace(/^.*\/feeds\/\w+\/([A-Za-z0-9\._-]+).*/,'$1');
			sheet_id = url.replace(/^.*\/feeds\/\w+\/[A-Za-z0-9\._-]+\/(\w+).*/,'$1');
		}
	} else if (url.match(/(^http.*google\..*latitude\/apps\/badge|\bgeojson|^http.*instamapper\.com\/api|\/mesowest\/)/i) && !url.match(/callback=/i)) {
		// Google Mobiles's "Latitude" tracking system or Instamapper feeds (or other), which are known to have no ability to specify a callback function
		if (url.match(/^http.*instamapper\.com\/api/i) && !url.match(/format=json/i)) {
			url = url.replace(/format=[^&]*?/i,'') + '&format=json';
		}
		var proxy_program = 'https://www.gpsvisualizer.com/google_maps/json_callback.cgi?callback=GV_JSON_Callback&url=';
		full_url = proxy_program+uri_escape(url);
	} else if (url.match(/^http|^\/|\.js\b|json\b/i)) {
		// non-google.com JSON URLs
		var query_punctuation = (url.indexOf('?') > -1) ? '&' : '?';
		full_url = url + query_punctuation;
		if (!full_url.match(/callback=GV_/)) { full_url += 'callback=GV_JSON_Callback'; }
	}
	if (google_docs_key) {
		full_url = 'https://spreadsheets.google.com/feeds/list/'+google_docs_key+'/'+sheet_id+'/public/values?alt=json-in-script&callback=GV_JSON_Callback';
	}
	if (!full_url) { return false; }
	
	var use_bounds = (gv_options.dynamic_data[gvg.dynamic_file_index].database === false || gv_options.dynamic_data[gvg.dynamic_file_index].use_bounds === false) ? false : true;
	if (use_bounds) { // set to false for cases where adding the viewport info to the URL would cause problems
		full_url = GV_Add_Bounds_To_Dynamic_URL(full_url);
	}
	var clean = (gv_options.dynamic_data[gvg.dynamic_file_index].prevent_caching == false) ? true : false;
	gvg.json_script = new JSONscriptRequest( full_url, {'clean':clean} );
	gvg.json_script.buildScriptTag(); // Build the dynamic script tag
	gvg.json_script.addScriptTag(); // Add the script tag to the page
}

function GV_Load_Markers_From_XML_File(url) {
	if (!self.gmap) { return false; }
	var local_file = false;
	if (url.indexOf('http') != 0 && url.indexOf('//') != 0) {
		local_file = true; // it didn't start with "http", so hopefully this local URL exists on the server
	} else { // it DID start with 'http'
		var server_parser = document.createElement('a'); server_parser.href = window.location.toString(); var server = server_parser.host;
		var url_parser = document.createElement('a'); url_parser.href = url; var url_host = url_parser.host;
		if (url_host == server && !url.match(/csv$/i)) {
			local_file = true; // we can go ahead and grab XML files if they're on the same server
		}
	}
	if (local_file) {
		var use_bounds = (gv_options.dynamic_data[gvg.dynamic_file_index].database === false || gv_options.dynamic_data[gvg.dynamic_file_index].use_bounds === false) ? false : true;
		if (use_bounds) { // set to false for cases where adding the viewport info to the URL would cause problems
			url = GV_Add_Bounds_To_Dynamic_URL(url);
		}
		getURL(url,null,GV_Load_Markers_From_XML_File_callback);
		return;
	} else { // remote file
		// Because JavaScript does not allow retrieving non-JS files from other servers, this will have to be done with a XML-to-JSON proxy program on gpsvisualizer.com
		if (!gv_options.dynamic_data[gvg.dynamic_file_index].reload_on_move) { // reload-on-move database queries might very well work with NON-local files via the XML-to-JSON proxy, but we're not going to allow it!
			var proxy_program;
			if (url.match(/(csv$|NavApiCSV)/i)) { proxy_program = 'https://www.gpsvisualizer.com/google_maps/csv-json.php?url='; }
			else { proxy_program = 'https://www.gpsvisualizer.com/google_maps/xml-json.js?url='; }
			GV_Load_Markers_From_JSON(proxy_program+uri_escape(url));
			return;
		}
	}
}
function GV_Add_Bounds_To_Dynamic_URL(url) {
	// problem: gmap.getBounds() doesn't work right away
	if (gmap.getBounds()) {
		var SW = gmap.getBounds().getSouthWest(); var NE = gmap.getBounds().getNorthEast();
		var query_punctuation = (url.indexOf('?') > -1) ? '&' : '?';
		url = url+query_punctuation+'lat_min='+(SW.lat().toFixed(6)*1)+'&lat_max='+(NE.lat().toFixed(6)*1)+'&lon_min='+(SW.lng().toFixed(6)*1)+'&lon_max='+(NE.lng().toFixed(6)*1)+'&lat_center='+(gmap.getCenter().lat().toFixed(6)*1)+'&lon_center='+(gmap.getCenter().lng().toFixed(6)*1)+'&zoom='+gmap.getZoom();
		url += (parseFloat(gv_options.dynamic_data[gvg.dynamic_file_index].limit) > 0) ? '&limit='+parseFloat(gv_options.dynamic_data[gvg.dynamic_file_index].limit) : '';
		url += (typeof(gv_options.dynamic_data[gvg.dynamic_file_index].sort) != 'undefined' && gv_options.dynamic_data[gvg.dynamic_file_index].sort != '') ? '&sort='+gv_options.dynamic_data[gvg.dynamic_file_index].sort : '';
		url += (typeof(gv_options.dynamic_data[gvg.dynamic_file_index].sort_numeric) != 'undefined') ? '&sort_numeric='+(gv_options.dynamic_data[gvg.dynamic_file_index].sort_numeric?1:0) : '';
		url += (typeof(gv_options.dynamic_data[gvg.dynamic_file_index].output_sort) != 'undefined' && gv_options.dynamic_data[gvg.dynamic_file_index].output_sort != '') ? '&output_sort='+gv_options.dynamic_data[gvg.dynamic_file_index].output_sort : '';
		url += (typeof(gv_options.dynamic_data[gvg.dynamic_file_index].output_sort_numeric) != 'undefined') ? '&output_sort_numeric='+(gv_options.dynamic_data[gvg.dynamic_file_index].output_sort_numeric?1:0) : '';
	} else {
		// can't do anything because gmap.getBounds does not exist yet
	}
	var prevent_caching = (gv_options.dynamic_data && gv_options.dynamic_data[gvg.dynamic_file_index].prevent_caching == false) ? false : true;
	if (prevent_caching) {
		var query_punctuation = (url.indexOf('?') > -1) ? '&' : '?';
		var timestamp = new Date();
		url = url+query_punctuation+'gv_nocache='+timestamp.valueOf();
	}
	return (url);
}
function GV_Load_Markers_From_XML_File_callback(text) {
	var data_from_xml_file = [];
	if (text) {
		var xml_data = parseXML(text);
		var json_data = xml2json(xml_data,'','');
		eval('data_from_xml_file = '+json_data);
	}
	GV_Load_Markers_From_Data_Object(data_from_xml_file);
}

function GV_Load_Markers_From_Data_Object(data) {
	if (!gv_options.dynamic_data[gvg.dynamic_file_index]) { return; }
	if (!self.gmap || !data) { return false; }
	var opts = gv_options.dynamic_data[gvg.dynamic_file_index];
	var root_tag, track_tag, track_segment_tag, track_point_tag, marker_tag, tag_prefix, prefix_length, content_tag, tagnames_stripped;
	
	if (typeof(data) == 'string') { return false;}
	if (data['gv_error'] && data['gv_error']['callback']) {
		var gv_error = data['gv_error']; var func = data['gv_error']['callback'].replace(/^\s*(\w+).*$/,'$1');
		if (self[func]) {
			eval(data['gv_error']['callback']);
		}
		return;
	}
	root_tag = (opts.root_tag) ? opts.root_tag : '';
	track_tag = (opts.track_tag) ? opts.track_tag : '';
	track_segment_tag = (opts.track_segment_tag) ? opts.track_segment_tag : '';
	track_point_tag = (opts.track_point_tag) ? opts.track_point_tag : '';
	marker_tag = (opts.marker_tag) ? opts.marker_tag : '';
	tag_prefix = (opts.tag_prefix) ? opts.tag_prefix : ''; prefix_length = tag_prefix.length;
	content_tag = (opts.content_tag) ? opts.content_tag : '';
	tagnames_stripped = (opts.tagnames_stripped) ? true : false;
	
	// if (gvg.json_script) { gvg.json_script.removeScriptTag(); } // this fouls things up if multiple files are loaded almost simultaneously!
	
	var marker_default_fields = ['icon','color','opacity','icon_size','icon_anchor','scale'];
	if (opts.default_marker) {
		if (opts.default_marker.size) { opts.default_marker.icon_size = opts.default_marker.size; }
		if (opts.default_marker.anchor) { opts.default_marker.icon_anchor = opts.default_marker.anchor; }
		if (opts.default_marker.icon_size && opts.default_marker.icon_size.length < 2 && opts.default_marker.icon_size.match(/([0-9]+)[^0-9]+([0-9]+)/)) {
			var parts = opts.default_marker.icon_size.match(/([0-9-]+)[^0-9-]+([0-9-]+)/);
			opts.default_marker.icon_size  = [parts[1],parts[2]];
		}
		if (opts.default_marker.icon_anchor && opts.default_marker.icon_anchor.length < 2 && opts.default_marker.icon_anchor.match(/([0-9]+)[^0-9]+([0-9]+)/)) {
			var parts = opts.default_marker.icon_anchor.match(/([0-9-]+)[^0-9-]+([0-9-]+)/);
			opts.default_marker.icon_anchor  = [parts[1],parts[2]];
		}
	}
	
	var filter_regexp = null; var filter_field = null;
	if (opts.filter && opts.filter.field && opts.filter.pattern) {
		filter_regexp = new RegExp(opts.filter.pattern,'i');
		filter_field = (tagnames_stripped) ? opts.filter.field.replace(/[^A-Za-z0-9\.-]/gi,'').toLowerCase() : opts.filter.field.toLowerCase();
	}
	
	if (!self.trk) { trk = []; }
	var trk_count_baseline = Object.keys(trk).length;
	if (trk_count_baseline == 0) { trk[0] = null; } // trk index will start at 1
	if (!self.wpts) { wpts = []; }
	var wpt_count_baseline = wpts.length;
	
	if (!root_tag) {
		if (marker_tag && data[marker_tag] && data[marker_tag].constructor == Array) {
			root_tag = 'gv_markers';
			data[root_tag] = []; data[root_tag][marker_tag] = data[marker_tag];
		} else if (track_point_tag && data[track_point_tag] && data[track_point_tag].constructor == Array) {
			root_tag = 'gv_trackpoints';
			data[root_tag] = []; data[root_tag][track_point_tag] = data[track_point_tag];
		} else {
			for (var rt in data) {
				if (!root_tag) { // keep looking
					if (data[rt]) { root_tag = rt; }
				}
			}
		}
	}
	
	// Detect twitter files via opts.url and completely re-arrange their data into a GPX-like format
	if (opts.url.match(/http.*twitter\.com/)) {
		var new_data = [];
		new_data.markers = [];
		new_data.markers.marker = [];
		for (var i=0; i<data.length; i++) {
			var tweet = data[i];
			var m = tweet;
			if (m.geo && m.geo.coordinates && m.geo.coordinates.length > 1) {
				m.latitude = m.geo.coordinates[0];
				m.longitude = m.geo.coordinates[1];
				m.name = (m.created_at) ? m.created_at : 'tweet';
				m.desc = (m.text) ? m.text : '';
				if (m.desc.match(/(https?:\/\/\w+\.\w+[^ ]+\.(?:jpg|png))/)) { m.desc = m.desc.replace(/(https?:\/\/\w+\.\w+[^ ]+\.(?:jpg|png))/g,'<br /><img height="300" src="$1" />'); }
				else if(m.desc.match(/(https?:\/\/\w+\.\w+[^ ]+)/)) { m.desc = m.desc.replace(/(https?:\/\/\w+\.\w+[^ ]+)/g,'<a target="_blank" href="$1">$1</a>'); }
				if (m.user) {
					for (var u in m.user) { m['user:'+u] = m.user[u]; }
					m.feed_url = 'https://twitter.com/#!/'+m['user:screen_name'];
					m.user = m['user:screen_name'];
				}
				new_data.markers.marker.push(m);
			}
		}
		root_tag = 'markers';
		marker_tag = 'marker';
		data = new_data;
	}
	
	// Detect flickr files via opts.url and completely re-arrange their data into a GPX-like format
	if (opts.url.match(/http.*flickr\.com\/services\/feeds\/geo\//i)) {
		var new_data = [];
		new_data.markers = [];
		new_data.markers.marker = [];
		if (data.items && data.items.length) {
			for (var i=0; i<data.items.length; i++) {
				var photo = data.items[i];
				var m = photo;
				if (m.latitude && m.longitude) {
					m.name = (m.title) ? m.title : 'Flickr photo';
					m.desc = (m.description) ? m.description : '';
					if (m.media) {
						for (var media in m.media) { m['media:'+media] = m.media[media]; }
						if (m['media:t']) { m.thumbnail = m['media:t']; }
						else if (m['media:m']) { m.thumbnail = m['media:m'].replace(/_m\.jpg$/,'_t.jpg'); }
						else if (m['media:s']) { m.thumbnail = m['media:s'].replace(/_s\.jpg$/,'_t.jpg'); }
						else if (m['media:l']) { m.thumbnail = m['media:l'].replace(/_l\.jpg$/,'_t.jpg'); }
						m.media = (m['media:m']) ? m['media:m'] : [];
						m['media:s'] = (!m['media:s'] && m.thumbnail) ? m.thumbnail.replace(/_t\.jpg$/,'_s.jpg') : m['media:s'];
					}
					if (m.desc.match(/jpg/i)) { m.no_thumbnail_in_info_window = true; }
					new_data.markers.marker.push(m);
				}
			}
			root_tag = 'markers';
			marker_tag = 'marker';
			data = new_data;
		}
	}
	
	// re-process GeoJSON files into GPX (http://geojson.org/geojson-spec.html)
	if ((root_tag == 'type' && data[root_tag] == 'FeatureCollection') || root_tag == 'features') {
		var gpx = {wpt:[],trk:[]};
		for (var i=0; i<data.features.length; i++) {
			var feature = data.features[i];
			if (feature.geometry && feature.geometry.type && feature.geometry.type == 'Point' && feature.geometry.coordinates && feature.geometry.coordinates.length == 2) {
				var w = [];
				w.lon = feature['geometry'].coordinates[0];
				w.lat = feature['geometry'].coordinates[1];
				if (feature['properties']) {
					for (var prop in feature['properties']) {
						w[prop] = feature['properties'][prop];
					}
					if (feature['properties']['photoUrl']) { wpt.photo = feature['properties']['photoUrl']; }
					if (feature['properties']['photoWidth'] && feature['properties']['photoHeight']) { wpt.photo_size = feature['properties']['photoWidth']+','+feature['properties'].photoHeight; } else if (feature['properties'].photoWidth) { m.photo_width = feature['properties']['photoHeight']; }
					if (feature['properties']['placardUrl']) { wpt.icon = feature['properties']['placardUrl']; }
					if (feature['properties']['placardWidth'] && feature['properties']['placardHeight']) {
						w.icon_size = feature['properties']['placardWidth']+','+feature['properties']['placardHeight'];
						if (feature['properties']['placardUrl'] && feature['properties']['placardUrl'].match(/google\..*\/latitude\/apps\/badge.*photo_placard/)) {
							w.icon_anchor = parseInt(0.5+feature['properties']['placardWidth']/2)+','+feature['properties']['placardHeight'];
						}
					}
				}
				gpx.wpt.push(w);
			} else if (feature.geometry && feature.geometry.type && feature.geometry.type == 'LineString' && feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
				var t = []; t.trkseg = [];
				t.name = (feature.properties && feature.properties.name) ? feature.properties.name : 'Track';
				t.trkseg = [ {trkpt:[]} ];
				for (var i=0; i<feature.geometry.coordinates.length; i++) {
					if (feature.geometry.coordinates[i].length) {
						var c = feature.geometry.coordinates[i];
						var p = {}; if (c.length >= 2) { p.lon = parseFloat(c[0]); p.lat = parseFloat(c[1]); if (c[2]) { p.alt = parseFloat(c[2]); } }
						if (p.lat && p.lon) { t.trkseg[0].trkpt.push(p); }
					}
				}
				gpx.trk.push(t);
			} else if (feature.geometry && feature.geometry.type && (feature.geometry.type == 'MultiLineString' || feature.geometry.type == 'Polygon') && feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
				var t = []; t.trkseg = [];
				t.name = (feature.properties && feature.properties.name) ? feature.properties.name : 'Track';
				if (feature.geometry.type = 'Polygon') { t.fill_opacity = 0.3; }
				t.trkseg = [];
				for (var i=0; i<feature.geometry.coordinates.length; i++) {
					var s = {trkpt:[]};
					for (var j=0; j<feature.geometry.coordinates[i].length; j++) {
						if (feature.geometry.coordinates[i][j].length) {
							var c = feature.geometry.coordinates[i][j];
							var p = {}; if (c.length >= 2) { p.lon = parseFloat(c[0]); p.lat = parseFloat(c[1]); if (c[2]) { p.alt = parseFloat(c[2]); } }
							if (p.lat || p.lon) { s.trkpt.push(p); }
						}
					}
					t.trkseg.push(s);
				}
				gpx.trk.push(t);
			}
		}
		root_tag = 'gpx';
		data = {'gpx':gpx};
	}
	
	// Set things properly for GPX files
	if (root_tag == 'gpx') {
		marker_tag = (marker_tag != '') ? marker_tag : 'wpt';
		track_tag = (track_tag != '') ? track_tag : 'trk';
		track_segment_tag = (track_segment_tag != '') ? track_segment_tag : 'trkseg';
		track_point_tag = (track_point_tag != '') ? track_point_tag : 'trkpt';
		tag_prefix = ''; content_tag = ''; tagnames_stripped = false;
	}
	
	if (typeof(data[root_tag]) == 'string') { // it's really just a single point
		var single_point = data;
		root_tag = 'gv_markers'; marker_tag = 'gv_marker';
		data[root_tag] = {}; data[root_tag][marker_tag] = [ single_point ];
	} else if (root_tag && (marker_tag == 'root_tag' || track_point_tag == 'root_tag') && data[root_tag].length >= 1) {
		data[root_tag][root_tag] = data[root_tag];
		if (marker_tag == 'root_tag') { marker_tag = root_tag; }
		if (track_point_tag == 'root_tag') { track_point_tag = root_tag; }
	} else if (root_tag && !track_point_tag && !marker_tag) {
		if (root_tag == 'feed' && data[root_tag]['entry']) {
			marker_tag = 'entry';
		} else {
			for (var mt in data[root_tag]) {
				if (!marker_tag && data[root_tag][mt] && typeof(data[root_tag][mt]) != 'string') { marker_tag = mt; }
			}
			if (!marker_tag) { // there's STILL no marker tag defined, so look again, but this time taking the first string-like data available
				for (var mt in data[root_tag]) {
					if (!marker_tag && typeof(data[root_tag][marker_tag]) == 'string') { // it's not a proper list, but a hash-like array
						root_tag = 'gv_markers'; marker_tag = 'gv_marker';
						data[root_tag] = {}; data[root_tag][marker_tag] = [];
						for (var key in data) { data['gv_markers']['gv_marker'].push(data[key]); }
					}
				}
			}
		}
	}
	if (track_point_tag == 'marker_tag') { track_point_tag = marker_tag; }
	
	if ((root_tag == 'Document' || root_tag == 'Folder') && data[root_tag]['Placemark']) { // really badly-built KML file with no <kml> tag
		data['kml'] = data[root_tag]; root_tag = 'kml';
	}
	
	if (root_tag == 'kml') { // it's a KML file
		if (data[root_tag]['Document'] || data[root_tag]['Folder'] || data[root_tag]['Placemark']) {
			if (!data[root_tag]['Document']) { // there's no "Document" tag!
				data[root_tag]['Document'] = [ data[root_tag] ];
			} else if (!data[root_tag]['Document'].length) { // if there's only one, it has no length; make it into an array
				data[root_tag]['Document'] = [ data[root_tag]['Document'] ];
			}
			var marker_count = 0;
			var marker_styles = [];
			var track_styles = [];
			var polygon_styles = [];
			for (var i=0; i<data[root_tag]['Document'].length; i++) {
				var doc = data[root_tag]['Document'][i];
				if (doc['Style']) { // record all global styles for future reference
					if (!doc['Style'].length) { doc['Style'] = [ doc['Style'] ]; } // if there's only one, it has no length; make it into an array
					for (var j=0; j<doc['Style'].length; j++) {
						if (doc['Style'][j]['id'] && doc['Style'][j]['IconStyle']) { // marker styles
							var ist = doc['Style'][j]['IconStyle'];
							var this_style = [];
							this_style['icon'] = (ist['Icon'] && ist['Icon']['href']) ? ist['Icon']['href'].replace(/&amp;/g,'&') : null;
							this_style['scale'] = (ist['scale']) ? parseFloat(ist['scale']) : null;
							if (ist['color'] && ist['color'].length == 8) {
								this_style['color'] = '#'+ist['color'].replace(/\w\w(\w\w)(\w\w)(\w\w)/,'$3$2$1');
								this_style['opacity'] = parseInt(ist['color'].replace(/(\w\w)\w\w\w\w\w\w/,'$1'),16)/255;
							}
							if (ist['hotSpot'] && ist['hotSpot']['xunits'] && ist['hotSpot']['yunits'] && ist['hotSpot']['xunits'] == 'pixels' && ist['hotSpot']['yunits'] == 'pixels') {
								this_style['icon_anchor'] = [parseFloat(ist['hotSpot']['x']),32-parseFloat(ist['hotSpot']['y'])];
							} else if (ist['hotSpot'] && ist['hotSpot']['xunits'] && ist['hotSpot']['yunits'] && ist['hotSpot']['xunits'] == 'fraction' && ist['hotSpot']['yunits'] == 'fraction') {
								this_style['icon_anchor'] = [32*parseFloat(ist['hotSpot']['x']),32*(1-parseFloat(ist['hotSpot']['y']))];
							}
							marker_styles[ doc['Style'][j]['id'] ] = this_style;
						}
						if (doc['Style'][j]['id'] && doc['Style'][j]['LineStyle']) { // track/polyline styles
							var lst = doc['Style'][j]['LineStyle'];
							var this_style = [];
							if (lst['color'] && lst['color'].length == 8) {
								this_style['color'] = '#'+lst['color'].replace(/\w\w(\w\w)(\w\w)(\w\w)/,'$3$2$1');
								this_style['opacity'] = parseInt(lst['color'].replace(/(\w\w)\w\w\w\w\w\w/,'$1'),16)/255;
							}
							if (lst['width']) { this_style['width'] = parseFloat(lst['width']); }
							track_styles[ doc['Style'][j]['id'] ] = this_style;
						}
						if (doc['Style'][j]['id'] && doc['Style'][j]['PolyStyle']) { // polygon fill styles
							var pst = doc['Style'][j]['PolyStyle'];
							var this_style = new Array();
							if (pst['color'] && pst['color'].length == 8) {
								this_style['fill_color'] = '#'+pst['color'].replace(/\w\w(\w\w)(\w\w)(\w\w)/,'$3$2$1');
								this_style['fill_opacity'] = parseInt(pst['color'].replace(/(\w\w)\w\w\w\w\w\w/,'$1'),16)/255;
							}
							polygon_styles[ doc['Style'][j]['id'] ] = this_style;
						}
					}
				}
				if (doc['StyleMap']) { // Examine <StyleMap> tags and see if they have existing style URLs in them; if so, we can handle that
					if (!doc['StyleMap'].length) { doc['StyleMap'] = [ doc['StyleMap'] ]; } // if there's only one, it has no length; make it into an array
					for (var j=0; j<doc['StyleMap'].length; j++) {
						var sm = doc['StyleMap'][j];
						if (sm['Pair']) {
							if (!sm['Pair'].length) { sm['Pair'] = [ sm['Pair'] ]; } // if there's only one, it has no length; make it into an array
							for (var k=0; k<sm['Pair'].length; k++) {
								if (sm['Pair'][k]['key'] && sm['Pair'][k]['key'] == 'normal' && sm['Pair'][k]['styleUrl']) {
									var style_id = sm['Pair'][k]['styleUrl'].replace(/^#/,'');
									if (marker_styles[style_id]) { marker_styles[sm['id']] = marker_styles[style_id]; }
									if (track_styles[style_id]) { track_styles[sm['id']] = track_styles[style_id]; }
									if (polygon_styles[style_id]) { polygon_styles[sm['id']] = polygon_styles[style_id]; }
								}
							}
						}
					}
				}
				if (doc['Folder']) {
					if (!doc['Placemark']) { doc['Placemark'] = []; } // Placemarks must be made into a proper array, because things need to be "push"ed into it
					else if (doc['Placemark'] && !doc['Placemark'].length) { doc['Placemark'] = [ doc['Placemark'] ]; } // Placemarks must be made into a proper array, because things need to be "push"ed into it
					if (!doc['Folder'].length) { doc['Folder'] = [ doc['Folder'] ]; } // if there's only one, it has no length; make it into an array
					for (var j1=0; j1<doc['Folder'].length; j1++) {
						var folder = doc['Folder'][j1];
						var fname = (folder['name']) ? folder['name'] : '';
						if (folder['Placemark']) {
							if (!folder['Placemark'].length) { folder['Placemark'] = [ folder['Placemark'] ]; }
							for (var k1=0; k1<folder['Placemark'].length; k1++) {
								var pm = folder['Placemark'][k1];
								pm['folder'] = fname;
								doc['Placemark'].push(pm);
							}
						}
						// we'll look for two levels of folders below the top level, but no more than that!!
						if (folder['Folder']) {
							if (!folder['Folder'].length) { folder['Folder'] = [ folder['Folder'] ]; } // if there's only one, it has no length; make it into an array
							for (var j2=0; j2<folder['Folder'].length; j2++) {
								var subfolder = folder['Folder'][j2];
								var subfolder_name = (subfolder['name']) ? subfolder['name'] : '';
								if (subfolder['Placemark']) {
									if (!subfolder['Placemark'].length) { subfolder['Placemark'] = [ subfolder['Placemark'] ]; }
									for (var k2=0; k2<subfolder['Placemark'].length; k2++) {
										var pm = subfolder['Placemark'][k2];
										pm['folder'] = subfolder_name;
										doc['Placemark'].push(pm);
									}
								}
								// okay, maybe one more...
								if (subfolder['Folder']) {
									if (!subfolder['Folder'].length) { subfolder['Folder'] = [ subfolder['Folder'] ]; } // if there's only one, it has no length; make it into an array
									for (var j3=0; j3<subfolder['Folder'].length; j3++) {
										var subsubfolder = subfolder['Folder'][j3];
										var subsubfolder_name = (subsubfolder['name']) ? subsubfolder['name'] : '';
										if (subsubfolder['Placemark']) {
											if (!subsubfolder['Placemark'].length) { subsubfolder['Placemark'] = [ subsubfolder['Placemark'] ]; }
											for (var k3=0; k3<subsubfolder['Placemark'].length; k3++) {
												var pm = subsubfolder['Placemark'][k3];
												pm['folder'] = subsubfolder_name;
												doc['Placemark'].push(pm);
											}
										}
									}
								}
							}
						}
					}
				}
				if (doc['Placemark']) {
					if (!doc['Placemark'].length) { doc['Placemark'] = [ doc['Placemark'] ]; } // if there's only one, it has no length; make it into an array
					var alias = [];
					var synth_keywords = [];
					for (var f in opts.synthesize_fields) {
						var template = opts.synthesize_fields[f];
						var blanks = template.match(/\{([^\}]+)\}/g);
						if (blanks && blanks.length) { for (var b=0; b<blanks.length; b++) { synth_keywords.push(blanks[b].replace(/\{|\}/g,'')); } }
					}
					for (var s=0; s<synth_keywords.length; s++) {
						var kw = synth_keywords[s];
						var fa = GV_Field_Alias(kw); if (fa) { alias[kw] = fa; }
					}
					for (var j=0; j<doc['Placemark'].length; j++) {
						var pm = doc['Placemark'][j];
						var mi = []; // marker info
						if ((pm['Point'] && pm['Point']['coordinates']) || (pm['MultiGeometry'] && pm['MultiGeometry']['Point'] && pm['MultiGeometry']['Point']['coordinates']) || (pm['GeometryCollection'] && pm['GeometryCollection']['Point'] && pm['GeometryCollection']['Point']['coordinates'])) { // WAYPOINT
							if (!pm['Point']) { pm['Point'] = []; } else if (!pm['Point'].length) { pm['Point'] = [ pm['Point'] ]; }
							if (pm['MultiGeometry'] && pm['MultiGeometry']['Point'] && pm['MultiGeometry']['Point']['coordinates']) { // dump these into the general Point collection
								if(!pm['MultiGeometry']['Point'].length) { pm['MultiGeometry']['Point'] = [ pm['MultiGeometry']['Point'] ]; }
								for (var k=0; k<pm['MultiGeometry']['Point'].length; k++) {
									pm['Point'].push(pm['MultiGeometry']['Point'][k]);
								}
							}
							if (pm['GeometryCollection'] && pm['GeometryCollection']['Point']) { // dump these into the general LineString collection
								if (!pm['GeometryCollection']['Point'].length) { pm['GeometryCollection']['Point'] = [ pm['GeometryCollection']['Point'] ]; }
								for (var k=0; k<pm['GeometryCollection']['Point'].length; k++) {
									pm['Point'].push(pm['GeometryCollection']['Point'][k]);
								}
							}
							for (var p=0; p<pm['Point'].length; p++) {
								if (pm['Point'][p]['coordinates']) {
									var parts = pm['Point'][p]['coordinates'].split(',');
									mi.lon = parseFloat(parts[0]);
									mi.lat = parseFloat(parts[1]);
									mi.alt = parseFloat(parts[2]); if(isNaN(mi.alt)) { mi.alt = null; }
									if (isNaN(mi.lat) || isNaN(mi.lon) || (mi.lat == 0 && mi.lon == 0) || Math.abs(mi.lat) > 90 || Math.abs(mi.lon) > 180 || mi.lat == undefined || mi.lon == undefined) {
										// invalid coordinates; but note that bad coordinates are the ONLY thing that will prevent a marker from being added to the map
									} else {
										mi.name = (pm['name']) ? (pm['name']) : '';
										mi.desc = (pm['description']) ? pm['description'].replace(/(&nbsp;)+$/g,'') : '';
										mi.name = mi.name.replace(/\&lt;/g,'<').replace(/\&gt;/g,'>').replace(/\&quot;/g,'"').replace(/\&apos;/g,"'");
										mi.desc = mi.desc.replace(/\&lt;/g,'<').replace(/\&gt;/g,'>').replace(/\&quot;/g,'"').replace(/\&apos;/g,"'");
										if (!mi.desc && pm['Style'] && pm['Style']['BalloonStyle'] && pm['Style']['BalloonStyle']['text'] && !pm['Style']['BalloonStyle']['text'].match(/\$\[/)) {
											mi.desc = pm['Style']['BalloonStyle']['text'];
										}
										mi.folder = (pm['folder']) ? (pm['folder']) : '';
										if (pm['ExtendedData'] && pm['ExtendedData']['Data']) {
											for (var j=0; j<pm['ExtendedData']['Data'].length; j++) {
												var d = pm['ExtendedData']['Data'][j];
												if (d['name'] && !mi[d['name'].toLowerCase()] && d['value'] != '') {
													mi[d['name'].toLowerCase()] = d['value'];
												}
											}
										}
										if (opts.ignore_styles) {
											// colors, icons, etc. in the remote data will be ignored
										} else {
											if (pm['styleUrl']) { // check for a global style that might be applied
												var style_id = pm['styleUrl'].replace(/^#/,'');
												if (marker_styles[style_id]) {
													for (var attr in marker_styles[style_id]) {
														mi[attr] = marker_styles[style_id][attr];
													}
												}
											}
											if (pm['Style'] && pm['Style']['IconStyle']) { // local styles override globals
												var ist = pm['Style']['IconStyle'];
												if (ist['Icon'] && ist['Icon']['href']) {
													mi.icon = ist['Icon']['href'].replace(/&amp;/g,'&');
												}
												if (ist['scale']) { mi.scale = parseFloat(ist['scale']); }
												if (ist['color'] && ist['color'].length == 8) {
													mi.color = '#'+ist['color'].replace(/\w\w(\w\w)(\w\w)(\w\w)/,'$3$2$1');
													mi.opacity = parseInt(ist['color'].replace(/(\w\w)\w\w\w\w\w\w/,'$1'),16)/255;
												}
												if (ist['hotSpot'] && ist['hotSpot']['xunits'] && ist['hotSpot']['yunits'] && ist['hotSpot']['xunits'] == 'pixels' && ist['hotSpot']['yunits'] == 'pixels') {
													mi.icon_anchor = [parseFloat(ist['hotSpot']['x']),32-parseFloat(ist['hotSpot']['y'])];
												} else if (ist['hotSpot'] && ist['hotSpot']['xunits'] && ist['hotSpot']['yunits'] && ist['hotSpot']['xunits'] == 'fraction' && ist['hotSpot']['yunits'] == 'fraction') {
													mi.icon_anchor = [32*parseFloat(ist['hotSpot']['x']),32*(1-parseFloat(ist['hotSpot']['y']))];
												}
											} else if (pm['StyleMap'] && pm['StyleMap']['Pair']) {
												if (!pm['StyleMap']['Pair'].length) { pm['StyleMap']['Pair'] = [ pm['StyleMap']['Pair'] ]; } // if there's only one, it has no length; make it into an array
												for (var k=0; k<pm['StyleMap']['Pair'].length; k++) {
													if (pm['StyleMap']['Pair'][k]['key'] && pm['StyleMap']['Pair'][k]['key'] == 'normal' && pm['StyleMap']['Pair'][k]['Style']) {
														var st = pm['StyleMap']['Pair'][k]['Style'];
														if (st['IconStyle']) {
															var ist = st['IconStyle'];
															if (ist['Icon'] && ist['Icon']['href']) { mi.icon = ist['Icon']['href'].replace(/&amp;/g,'&'); }
															if (ist['scale']) { mi.scale = parseFloat(ist['scale']); }
															if (ist['color'] && ist['color'].length == 8) {
																mi.color = '#'+ist['color'].replace(/\w\w(\w\w)(\w\w)(\w\w)/,'$3$2$1');
																mi.opacity = parseInt(ist['color'].replace(/(\w\w)\w\w\w\w\w\w/,'$1'),16)/255;
															}
															if (ist['hotSpot'] && ist['hotSpot']['xunits'] && ist['hotSpot']['yunits'] && ist['hotSpot']['xunits'] == 'pixels' && ist['hotSpot']['yunits'] == 'pixels') {
																mi.icon_anchor = [parseFloat(ist['hotSpot']['x']),32-parseFloat(ist['hotSpot']['y'])];
															} else if (ist['hotSpot'] && ist['hotSpot']['xunits'] && ist['hotSpot']['yunits'] && ist['hotSpot']['xunits'] == 'fraction' && ist['hotSpot']['yunits'] == 'fraction') {
																mi.icon_anchor = [32*parseFloat(ist['hotSpot']['x']),32*(1-parseFloat(ist['hotSpot']['y']))];
															}
														}
														if (st['BalloonStyle']) {
															var bst = st['BalloonStyle'];
															var balloon_text = bst['text'].replace(/\$\[(\w+)\]/g, function (complete_match,field_name) { return (pm[field_name]) ? pm[field_name] : ''; } );
															balloon_text = balloon_text.replace(/\s*(<br\/?>\s*|&#160;\s*)*\s*$/g,''); // remove white space from end of "balloon"
															if (balloon_text) { mi.desc = balloon_text; }
														}
													}
												}
											}
										}
										if (opts.synthesize_fields) {
											for (var f in opts.synthesize_fields) {
												if (opts.synthesize_fields[f] === true || opts.synthesize_fields[f] === false) {
													mi[f] = opts.synthesize_fields[f];
												} else if (opts.synthesize_fields[f]) {
													var template = opts.synthesize_fields[f];
													template = template.toString().replace(gvg.synthesize_fields_pattern,
														function (complete_match,br1,field_name,br2) {
															field_name = field_name.toLowerCase();
															if (mi[field_name] || mi[field_name] == '0' || mi[field_name] === false) {
																return (br1+mi[field_name]+br2);
															} else if (mi[alias[field_name]] || mi[alias[field_name]] == '0' || mi[alias[field_name]] === false) {
																return (br1+mi[alias[field_name]]+br2);
															} else {
																return ('');
															}
														}
													);
													mi[f] = (template.toString().match(/^\s*$/)) ? '' : template;
												}
											}
										}
										if (mi.icon) {
											if (mi.icon.match(/\/google_maps\/icons\/(\w+)\//)) {
												var sym = mi.icon.toString().replace(/^.*\/google_maps\/icons\/(\w+)\/.*?$/,'$1');
												if (gvg.icons[sym]) { mi.icon_size = gvg.icons[sym].is; mi.icon_anchor = gvg.icons[sym].ia; }
											} else if (mi.icon.match(/google|gstatic/)) {
												mi = GV_KML_Icon_Anchors(mi);
											}
										}
										var marker_ok = true;
										if (filter_regexp && filter_field) {
											if (mi[filter_field] && mi[filter_field].toString().match(filter_regexp)) {
												marker_ok = true;
											} else {
												marker_ok = false;
											}
										}
										if (marker_ok) {
											mi.dynamic = gvg.dynamic_file_index + 1; // +1 so we can test for its presence!
											// wpts.push( GV_Marker(mi) );
											GV_Draw_Marker(mi);
											marker_count++;
										}
									} // end if valid coordinates
								} // end if pm['Point'][p]['coordinates']
							} // end for loop (pm['Point'].length)
						} else if ((pm['MultiGeometry'] && pm['MultiGeometry']['LineString']) || (pm['MultiGeometry'] && pm['MultiGeometry']['Polygon']) || (pm['GeometryCollection'] && pm['GeometryCollection']['LineString']) || pm['LineString'] || pm['Polygon']) { // TRACK
							var tn = (!trk.length) ? 1 : trk.length + 1; // tn = track number
							trk[tn] = { info:{},segments:[],overlays:[] };
							trk[tn].info.name = (pm['name']) ? pm['name'] : '[track]';
							trk[tn].info.desc = (pm['description']) ? pm['description'].replace(/(&nbsp;)+$/g,'') : '';
							trk[tn].info.name = trk[tn].info.name.replace(/\&lt;/g,'<').replace(/\&gt;/g,'>');
							trk[tn].info.desc = trk[tn].info.desc.replace(/\&lt;/g,'<').replace(/\&gt;/g,'>');
							trk[tn].info.width = (opts.track_options && opts.track_options.width) ? parseFloat(opts.track_options.width) : 4; // defaults
							trk[tn].info.color = '#e60000';
							if (opts.track_options && opts.track_options.color && typeof(opts.track_options.color) == 'string') {
								trk[tn].info.color = opts.track_options.color;
							} else if (opts.track_options && opts.track_options.color && typeof(opts.track_options.color) == 'object') {
								trk[tn].info.color = opts.track_options.color[0];
							}
							trk[tn].info.opacity = (opts.track_options && opts.track_options.opacity) ? parseFloat(opts.track_options.opacity) : 0.8; // defaults
							if (pm['Polygon'] || (pm['MultiGeometry'] && pm['MultiGeometry']['Polygon'])) {
								trk[tn].info.fill_color = (opts.track_options && opts.track_options.fill_color) ? opts.track_options.fill_color : ''; // defaults
								trk[tn].info.fill_opacity = (opts.track_options && opts.track_options.fill_opacity) ? parseFloat(opts.track_options.fill_opacity) : 0; // defaults
							}
							trk[tn].info.clickable = (opts.track_options && opts.track_options.clickable === false) ? false : true; // defaults
							trk[tn].info.geodesic = (opts.track_options && opts.track_options.geodesic) ? true : false;
							if (opts.track_options && opts.track_options.z_index) { trk[tn].info.z_index = opts.track_options.z_index; }
							if (opts.ignore_styles) {
								// colors, icons, etc. in the remote data will be ignored
							} else {
								if (pm['styleUrl']) { // check for a global style that might be applied
									var style_id = pm['styleUrl'].replace(/^#/,'');
									if (track_styles[style_id]) {
										for (var attr in track_styles[style_id]) { trk[tn].info[attr] = track_styles[style_id][attr]; }
									}
									if ((pm['Polygon'] || (pm['MultiGeometry'] && pm['MultiGeometry']['Polygon'])) && polygon_styles[style_id]) {
										for (var attr in polygon_styles[style_id]) { trk[tn].info[attr] = polygon_styles[style_id][attr]; }
									}
								}
								if (pm['Style'] && pm['Style']['LineStyle']) { // local styles override globals
									var lst = pm['Style']['LineStyle'];
									if (lst['color'] && lst['color'].length == 8) {
										trk[tn].info.color = '#'+lst['color'].replace(/\w\w(\w\w)(\w\w)(\w\w)/,'$3$2$1');
										trk[tn].info.opacity = parseInt(lst['color'].replace(/(\w\w)\w\w\w\w\w\w/,'$1'),16)/255;
									}
									if (lst['width']) { trk[tn].info.width = parseFloat(lst['width']); }
								}
								if ((pm['Polygon'] || (pm['MultiGeometry'] && pm['MultiGeometry']['Polygon'])) && pm['Style'] && pm['Style']['PolyStyle']) { // local styles override globals
									var pst = pm['Style']['PolyStyle'];
									if (pst['color'] && pst['color'].length == 8) {
										trk[tn].info.fill_color = '#'+pst['color'].replace(/\w\w(\w\w)(\w\w)(\w\w)/,'$3$2$1');
										trk[tn].info.fill_opacity = parseInt(pst['color'].replace(/(\w\w)\w\w\w\w\w\w/,'$1'),16)/255;
									}
								}
							}
							if (!pm['LineString']) { // there are no LineStrings in the Placemark yet
								pm['LineString'] = [ ];
							} else if (pm['LineString'] && !pm['LineString'].length) { // if there's only one, it has no length; make it into an array
								pm['LineString'] = [ pm['LineString'] ];
							}
							if (pm['MultiGeometry'] && pm['MultiGeometry']['LineString']) { // dump these into the general LineString collection
								if(!pm['MultiGeometry']['LineString'].length) { pm['MultiGeometry']['LineString'] = [ pm['MultiGeometry']['LineString'] ]; }
								for (var k=0; k<pm['MultiGeometry']['LineString'].length; k++) {
									pm['LineString'].push(pm['MultiGeometry']['LineString'][k]);
								}
							}
							if (pm['GeometryCollection'] && pm['GeometryCollection']['LineString']) { // dump these into the general LineString collection
								if (!pm['GeometryCollection']['LineString'].length) { pm['GeometryCollection']['LineString'] = [ pm['GeometryCollection']['LineString'] ]; }
								for (var k=0; k<pm['GeometryCollection']['LineString'].length; k++) {
									pm['LineString'].push(pm['GeometryCollection']['LineString'][k]);
								}
							}
							if (pm['Polygon'] && pm['Polygon']['outerBoundaryIs'] && pm['Polygon']['outerBoundaryIs']['LinearRing']) {
								var polygon_boundary = pm['Polygon']['outerBoundaryIs'];
								if (polygon_boundary['LinearRing'] && !polygon_boundary['LinearRing'].length) { polygon_boundary['LinearRing'] = [ polygon_boundary['LinearRing'] ]; }
								for (var k=0; k<polygon_boundary['LinearRing'].length; k++) {
									pm['LineString'].push(polygon_boundary['LinearRing'][k]);
								}
							}
							if (pm['MultiGeometry'] && pm['MultiGeometry']['Polygon']) {
								if (!pm['MultiGeometry']['Polygon'].length) { pm['MultiGeometry']['Polygon'] = [ pm['MultiGeometry']['Polygon'] ]; }
								for (var k=0; k<pm['MultiGeometry']['Polygon'].length; k++) {
									if (pm['MultiGeometry']['Polygon'][k]['outerBoundaryIs'] && pm['MultiGeometry']['Polygon'][k]['outerBoundaryIs']['LinearRing']) {
										var polygon_boundary = pm['MultiGeometry']['Polygon'][k]['outerBoundaryIs'];
										if (polygon_boundary['LinearRing'] && !polygon_boundary['LinearRing'].length) { polygon_boundary['LinearRing'] = [ polygon_boundary['LinearRing'] ]; }
										for (var l=0; l<polygon_boundary['LinearRing'].length; l++) {
											pm['LineString'].push(polygon_boundary['LinearRing'][l]);
										}
									}
								}
							}
							for (var k=0; k<pm['LineString'].length; k++) {
								if (pm['LineString'][k]['coordinates']) {
									var pts = [];
									if (pm['LineString'][k]['coordinates'].match(/, /)) { pm['LineString'][k]['coordinates'] = pm['LineString'][k]['coordinates'].replace(/, +/g,','); }
									var coords = pm['LineString'][k]['coordinates'].split(/\s+/);
									var last_point = null;
									for (var l=0; l<coords.length; l++) {
										var parts = coords[l].split(','); var lon = parseFloat(parts[0]); var lat = parseFloat(parts[1]); var alt = (parts.length > 2) ? parseFloat(parts[2]) : null;
										if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
											if (alt !== null) { pts.push([lat,lon,alt]); trk[tn].info.elevation = true; }
											else { pts.push([lat,lon]); }
										}
									}
									if (pts.length > 0) {
										trk[tn].segments.push({ points:pts });
										add_to_tracklist = true;
									}
								}
							}
							trk[tn].info.is_polygon = (trk[tn].info.fill_opacity && trk[tn].info.fill_opacity > 0) ? true : false;
							GV_Draw_Track(tn);
							if (!trk[tn].info.no_list && !trk[tn].info.nolist ) {
								var tn_text = (tn.toString().match(/[^0-9]/)) ? "'"+tn+"'" : tn;
								GV_Add_Track_to_Tracklist({bullet:'- ',name:trk[tn].info.name,desc:trk[tn].info.desc,color:trk[tn].info.color,id:"trk["+tn_text+"]"});
							}
						}
					}
				}
			}
		}
		
	} else { // not a KML file
		
		if (data && data[root_tag] && ( (track_tag && data[root_tag][track_tag]) || (track_point_tag && data[root_tag][track_point_tag]))) {
			if (track_tag && data[root_tag][track_tag] && !data[root_tag][track_tag].length) { data[root_tag][track_tag] = [ data[root_tag][track_tag] ]; }
			if (track_point_tag && data[root_tag][track_point_tag] && !data[root_tag][track_point_tag].length) { data[root_tag][track_point_tag] = [ data[root_tag][track_point_tag] ]; }
			var trk_default_name = (opts.track_options && opts.track_options.name) ? opts.track_options.name : '[track]'; // defaults
			var trk_default_desc = (opts.track_options && opts.track_options.desc) ? opts.track_options.desc : ''; // defaults
			var trk_default_width = (opts.track_options && opts.track_options.width) ? parseFloat(opts.track_options.width) : 3; // defaults
			var trk_default_colors = ['#e60000'];
			if (opts.track_options && opts.track_options.color && typeof(opts.track_options.color) == 'string') {
				trk_default_colors = [opts.track_options.color];
			} else if (opts.track_options && opts.track_options.color && typeof(opts.track_options.color) == 'object' && opts.track_options.color.length) {
				trk_default_colors = opts.track_options.color;
			}
			var trk_default_opacity = (opts.track_options && opts.track_options.opacity) ? parseFloat(opts.track_options.opacity) : 0.8; // defaults
			var trk_default_fill_color = (opts.track_options && opts.track_options.fill_color) ? opts.track_options.fill_color : '#e60000'; // defaults
			var trk_default_fill_opacity = (opts.track_options && opts.track_options.fill_opacity) ? parseFloat(opts.track_options.fill_opacity) : 0; // defaults
			if (!track_tag) { track_tag = 'gv_tracks'; data[root_tag]['gv_tracks'] = [ data[root_tag] ]; }
			var tracks = (track_tag && data[root_tag][track_tag]) ? data[root_tag][track_tag] : [ data[root_tag] ];
			for (var i=0; i<tracks.length; i++) {
				var this_trk = tracks[i];
				var color_index = 0;  if (trk_default_colors.length > 1) { color_index = i % trk_default_colors.length; }
				var trk_default_color = trk_default_colors[color_index];
				var add_to_tracklist = false;
				if ((track_segment_tag && this_trk[track_segment_tag]) || (track_point_tag && this_trk[track_point_tag])) {
					var tn = trk.length + 0; // tn = track number
					trk[tn] = { info:{},segments:[],overlays:[],elevations:[] };
					trk[tn].info.name = (this_trk['name']) ? this_trk['name'] : trk_default_name;
					trk[tn].info.desc = (this_trk['desc']) ? this_trk['desc'] : trk_default_desc;
					trk[tn].info.name = trk[tn].info.name.replace(/\&lt;/g,'<').replace(/\&gt;/g,'>');
					trk[tn].info.desc = trk[tn].info.desc.replace(/\&lt;/g,'<').replace(/\&gt;/g,'>');
					trk[tn].info.clickable = (opts.track_options && opts.track_options.clickable === false) ? false : true; // defaults
					trk[tn].info.geodesic = (opts.track_options && opts.track_options.geodesic) ? true : false; // defaults
					trk[tn].info.no_list = ((opts.track_options && opts.track_options.no_list) || this_trk['no_list']) ? true : false; // defaults
					if (opts.ignore_styles) {
						trk[tn].info.width = trk_default_width;
						trk[tn].info.color = trk_default_color;
						trk[tn].info.opacity = trk_default_opacity;
						trk[tn].info.fill_color = trk_default_fill_color;
						trk[tn].info.fill_opacity = trk_default_fill_opacity;
					} else {
						if (this_trk['extensions']) { // The GPX styles schema includes <trk><extensions><line> and <fill>
							if (this_trk['extensions']['line']) {
								if (this_trk['extensions']['line']['width']) { this_trk['width'] = this_trk['extensions']['line']['width']; }
								if (this_trk['extensions']['line']['color']) { this_trk['color'] = this_trk['extensions']['line']['color']; }
								if (this_trk['extensions']['line']['opacity']) { this_trk['opacity'] = this_trk['extensions']['line']['opacity']; }
							}
							if (this_trk['extensions']['fill']) {
								if (this_trk['extensions']['fill']['color']) { this_trk['fill_color'] = this_trk['extensions']['fill']['color']; }
								if (this_trk['extensions']['fill']['opacity']) { this_trk['fill_opacity'] = this_trk['extensions']['fill']['opacity']; }
							}
							if (this_trk['extensions']['gpxx:TrackExtension'] && this_trk['extensions']['gpxx:TrackExtension']['gpxx:DisplayColor']) { // Garmin extensions
								this_trk['color'] = this_trk['extensions']['gpxx:TrackExtension']['gpxx:DisplayColor'].toLowerCase();
							}
							if (this_trk['extensions']['override_color']) {
								if (this_trk['extensions']['override_color']['content']) { this_trk['color'] = this_trk['extensions']['override_color']['content']; }
								else { this_trk['color'] = this_trk['extensions']['override_color']; }
							}
							if (this_trk['color'] && typeof(this_trk['color'])!='string') { delete this_trk['color']; }
							if (this_trk['fill_color'] && typeof(this_trk['fill_color'])!='string') { delete this_trk['fill_color']; }
						}
						if (this_trk['opacity'] && this_trk['opacity'] > 1 && this_trk['opacity'] <= 100) { this_trk['opacity'] /= 100; }
						if (this_trk['fill_opacity'] && this_trk['fill_opacity'] > 1 && this_trk['fill_opacity'] <= 100) { this_trk['fill_opacity'] /= 100; }
						trk[tn].info.width = (this_trk['width']) ? parseFloat(this_trk['width']) : trk_default_width;
						trk[tn].info.color = (this_trk['color']) ? GV_Color_Name2Hex(this_trk['color']) : trk_default_color;
						trk[tn].info.opacity = (this_trk['opacity']) ? parseFloat(this_trk['opacity']) : trk_default_opacity;
						trk[tn].info.fill_color = (this_trk['fill_color']) ? GV_Color_Name2Hex(this_trk['fill_color']) : trk_default_fill_color;
						trk[tn].info.fill_opacity = (this_trk['fill_opacity']) ? parseFloat(this_trk['fill_opacity']) : trk_default_fill_opacity;
					}
					trk[tn].info.clickable = (opts.track_options && opts.track_options.clickable === false) ? false : true; // defaults
					trk[tn].info.geodesic = (opts.track_options && opts.track_options.geodesic) ? true : false; // defaults
					if (opts.track_options && opts.track_options.z_index) { trk[tn].info.z_index = opts.track_options.z_index; }
					var sn = -1;
					if (track_segment_tag && this_trk[track_segment_tag]) {
						if (this_trk[track_segment_tag] && !this_trk[track_segment_tag].length) { this_trk[track_segment_tag] = [ this_trk[track_segment_tag] ]; } // force it into an array
						var lat_alias = 'lat'; var lon_alias = 'lon'; var alt_alias = 'ele';
						if (this_trk[track_segment_tag][0][track_point_tag]) {
							for (var field in this_trk[track_segment_tag][0][track_point_tag][0]) { // for efficiency, only search the first point for latitude & longitude tags
								var field_cropped = field.substring(prefix_length);
								if (field_cropped.match(/^(lati?|latt?itude)\b/i)) { lat_alias = field_cropped; }
								else if (field_cropped.match(/^(long?|lng|long?t?itude)\b/i)) { lon_alias = field_cropped; }
								else if (field_cropped.match(/^(alt|altitude|ele|elevation)\b/i)) { alt_alias = field_cropped; }
							}
							for (var j=0; j<this_trk[track_segment_tag].length; j++) {
								sn += 1;
								var trkseg = this_trk[track_segment_tag][j];
								if (trkseg[track_point_tag] && !trkseg[track_point_tag].length) { trkseg[track_point_tag] = [ trkseg[track_point_tag] ]; } // force it into an array
								var pts = [];
								for (var k=0; k<trkseg[track_point_tag].length; k++) {
									var lat = 91; var lon = 181; var alt = null;
									if (content_tag) {
										if (trkseg[track_point_tag][k][tag_prefix+lat_alias] && trkseg[track_point_tag][k][tag_prefix+lat_alias][content_tag]) {
											lat = parseFloat(ParseCoordinate(trkseg[track_point_tag][k][tag_prefix+lat_alias][content_tag]));
											lon = parseFloat(ParseCoordinate(trkseg[track_point_tag][k][tag_prefix+lon_alias][content_tag]));
											if (trkseg[track_point_tag][k][tag_prefix+alt_alias][content_tag]) {
												alt = parseFloat(trkseg[track_point_tag][k][tag_prefix+alt_alias][content_tag]);
											}
										}
									} else if (trkseg[track_point_tag][k][tag_prefix+lat_alias] || trkseg[track_point_tag][k][tag_prefix+lon_alias]) {
										lat = parseFloat(ParseCoordinate(trkseg[track_point_tag][k][tag_prefix+lat_alias]));
										lon = parseFloat(ParseCoordinate(trkseg[track_point_tag][k][tag_prefix+lon_alias]));
										if (trkseg[track_point_tag][k][tag_prefix+alt_alias]) {
											alt = parseFloat(trkseg[track_point_tag][k][tag_prefix+alt_alias]);
										}
									}
									if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
										if (alt !== null) { pts.push([lat,lon,alt]); trk[tn].info.elevation = true; }
										else { pts.push([lat,lon]); }
									}
								}
								if (pts.length > 0) {
									trk[tn].segments.push({ points:pts });
									add_to_tracklist = true;
								}
							}
						}
						
					} else { // trackpoints are directly under the track tag (no segments)
						if (!this_trk[track_point_tag].length) { this_trk[track_point_tag] = [ this_trk[track_point_tag] ]; }
						var pts = [];
						var lat_alias = 'lat'; var lon_alias = 'lon'; var alt_alias = 'ele';
						if (this_trk[track_point_tag] && this_trk[track_point_tag].length) {
							for (var field in this_trk[track_point_tag][0]) { // for efficiency, only search the first point for latitude & longitude tags
								var field_cropped = field.substring(prefix_length);
								if (field_cropped.match(/^(lati?|latt?itude)\b/i)) { lat_alias = field_cropped; }
								else if (field_cropped.match(/^(long?|lng|long?t?itude)\b/i)) { lon_alias = field_cropped; }
								else if (field_cropped.match(/^(alt|altitude|ele|elevation)\b/i)) { alt_alias = field_cropped; }
							}
							for (var k=0; k<this_trk[track_point_tag].length; k++) {
								var lat = 91; var lon = 181; var alt = null;
								if (content_tag) {
									if (this_trk[track_point_tag][k][tag_prefix+lat_alias] && this_trk[track_point_tag][k][tag_prefix+lat_alias][content_tag]) {
										lat = parseFloat(ParseCoordinate(this_trk[track_point_tag][k][tag_prefix+lat_alias][content_tag]));
										lon = parseFloat(ParseCoordinate(this_trk[track_point_tag][k][tag_prefix+lon_alias][content_tag]));
										if (trkseg[track_point_tag][k][tag_prefix+alt_alias][content_tag]) {
											alt = parseFloat(this_trk[track_point_tag][k][tag_prefix+alt_alias][content_tag]);
										}
									}
								} else if (this_trk[track_point_tag][k][tag_prefix+lat_alias]) {
									lat = parseFloat(ParseCoordinate(this_trk[track_point_tag][k][tag_prefix+lat_alias]));
									lon = parseFloat(ParseCoordinate(this_trk[track_point_tag][k][tag_prefix+lon_alias]));
									if (this_trk[track_point_tag][k][tag_prefix+alt_alias]) {
										alt = parseFloat(this_trk[track_point_tag][k][tag_prefix+alt_alias]);
									}
								}
								if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
									if (alt !== null) { pts.push([lat,lon,alt]); trk[tn].info.elevation = true; }
									else { pts.push([lat,lon]); }
								}
							}
							if (pts.length > 0) {
								trk[tn].segments.push({ points:pts });
								add_to_tracklist = true;
							}
						}
					}
					trk[tn].info.is_polygon = (trk[tn].info.fill_opacity && trk[tn].info.fill_opacity > 0) ? true : false;
					GV_Draw_Track(tn);
					if (add_to_tracklist && !trk[tn].info.no_list && !trk[tn].info.nolist ) {
						var tn_text = (tn.toString().match(/[^0-9]/)) ? "'"+tn+"'" : tn;
						GV_Add_Track_to_Tracklist({bullet:'- ',name:trk[tn].info.name,desc:trk[tn].info.desc,color:trk[tn].info.color,id:"trk["+tn_text+"]"});
					}
				} // end "if there are segments or trackpoints"
			} // end 0->tracks.length loop
		}
		
		if (data && data[root_tag] && data[root_tag][marker_tag]) {
			var alias = [];
			var numeric = {lat:true,lon:true,scale:true,opacity:true,rotation:true};
			if (!data[root_tag][marker_tag].length) { // if there's only one, it has no length; make it into an array
				data[root_tag][marker_tag] = [ data[root_tag][marker_tag] ];
			}
			var row1 = data[root_tag][marker_tag][0];
			// This is potentially problematic: only the FIRST marker (row) is scanned for non-standard field names.  Keep an eye on that.
			// However, note that with Google Spreadsheets, the feed doesn't even WORK if it's not row 1:header, row2:data!
			for (var tag in row1) {
				if (tag_prefix == '' || tag.indexOf(tag_prefix) == 0) {
					var field = tag.substring(prefix_length);
					var fa = GV_Field_Alias(field); if (fa) { alias[field] = fa; }
				}
			}
			// A few extra "universal" aliases that might not be in the first row:
			alias.description = 'desc'; alias.sym = 'icon'; alias.symbol = 'icon'; alias.colour = 'color'; alias.link = 'url';
			alias.latitude = 'lat'; alias.longitude = 'lon'; alias.long = 'lon'; alias.lng = 'lon'; alias.heading = 'course';
			if (opts.field_alias) {
				for (var field in opts.field_alias) {
					alias[opts.field_alias[field]] = field; // note that this eliminates the former column.  I.e., if alias.folder == 'icon', then icon ceases to exist. Therefore synthesize_fields may be preferable.
				}
			}

			var marker_count = 0; var marker_start_index = 0; var marker_end_index = data[root_tag][marker_tag].length;
			if (opts.first) {
				if (parseInt(opts.first) < data[root_tag][marker_tag].length) { marker_end_index = parseInt(opts.first); }
			} else if (opts.last) {
				if (parseInt(opts.last) < data[root_tag][marker_tag].length) { marker_start_index = data[root_tag][marker_tag].length - parseInt(opts.last) }
			}
			
			// ADD SOMETHING HERE FOR A FUTURE "waypoint_options" (OR "marker_options") PARAMETER?
			
			for (var i=marker_start_index; i<marker_end_index; i++) {
				var row = data[root_tag][marker_tag][i];
				var mi = [];
				for (var tag in row) {
					if (tag.indexOf(tag_prefix) == 0) {
						var field = tag.substring(prefix_length); var original_field = field;
						field = (alias[field] && typeof(alias[field]) == 'string') ? alias[field].toLowerCase() : field.toLowerCase();
						var value = (content_tag) ? row[tag][content_tag] : row[tag];
						if (tag == 'link' && row['link']['href']) { value = row['link']['href'].replace(/&amp;/g,'&'); } // Garmin's <link> tag uses an href attribute to hold the URL
						if (value != null && typeof(value) != 'object' && value.toString().match(/\S/)) {
							// special processing of certain fields
							if (field  == 'georss:point' || field  == 'georss_point') {
								var coordinates = value.split(/[^0-9\.\-]/);
								if (coordinates[0] && coordinates[1]) {
									mi.lat = parseFloat(coordinates[0]);
									mi.lon = parseFloat(coordinates[1]);
								}
							} else if (field  == 'lat' || field == 'lon') {
								mi[field] = parseFloat(ParseCoordinate(value));
							} else if (field  == 'ele') {
								mi[field] = parseFloat(value);
							} else if (field == 'gv_marker_options') {
								try {
									eval('var extra_marker_list_options = {'+value+'};');
									for (var opt in extra_marker_list_options) { mi[opt] = extra_marker_list_options[opt]; }
								} catch(error) {}
							} else if (field == 'icon_size' || field == 'icon_anchor' || field == 'label_offset' || field == 'icon_offset' || field == 'thumbnail_size' || field == 'photo_size') {
								var numbers = FindOneOrTwoNumbersInString(value);
								if (numbers.length == 1) { mi[field] = [numbers[0],numbers[0]]; }
								else if (numbers.length == 2) { mi[field] = [numbers[0],numbers[1]]; }
							} else if (opts.time_stamp && (opts.time_stamp.toLowerCase() == field || alias[opts.time_stamp] == field) && value && value.toString().match(/^(\d+\D\d+\D\d+|\d\d\d\d\d\d\d\d\d\d)/)) {
								mi[field] = GV_Format_Time(value,opts.time_zone,opts.time_zone_text,opts.time_12hour);
							} else {
								if (numeric[field] || parseFloat(value).toString() == value.toString()) {
									mi[field] = parseFloat(value);
								} else if (value.toString().toLowerCase() == 'true') {
									mi[field] = true;
								} else if (value.toString().toLowerCase() == 'false') {
									mi[field] = false;
								} else if (value == undefined) {
									mi[field] = '';
								} else if (value.match(/\&[gl]t;/)) {
									mi[field] = value.replace(/\&lt;/g,'<').replace(/\&gt;/g,'>');
								} else {
									if (value.match(/[\r\n]/)) { value = value.replace(/\r?\n/g,'<br/>'); }
									mi[field] = value;
								}
							}
						} else {
							mi[field] = null;
						}
						if (original_field != field && !mi[original_field]) { mi[original_field] = mi[field]; } // for field synthesis using original column names
					}
				}
				if (mi.icon) {
					if (mi.icon.match(/\/google_maps\/icons\/(\w+)\//)) {
						var sym = mi.icon.toString().replace(/^.*\/google_maps\/icons\/(\w+)\/.*?$/,'$1');
						if (gvg.icons[sym]) { mi.icon_size = gvg.icons[sym].is; mi.icon_anchor = gvg.icons[sym].ia; }
					} else if (mi.icon.match(/google|gstatic/)) {
						mi = GV_KML_Icon_Anchors(mi);
					}
				}
				if (typeof(mi.course) != 'undefined' && (mi.rotation == '' || typeof(mi.rotation) == 'undefined') && gvg.icons[mi.icon] && gvg.icons[mi.icon].rotatable) {
					mi.rotation = parseFloat(mi.course);
					if (mi.icon == 'tickmark') { mi.type = 'tickmark'; }
				}
				if (opts.synthesize_fields) {
					for (var f in opts.synthesize_fields) {
						if (opts.synthesize_fields[f] === true || opts.synthesize_fields[f] === false) {
							mi[f] = opts.synthesize_fields[f];
						} else if (opts.synthesize_fields[f]) {
							var template = opts.synthesize_fields[f];
							template = template.toString().replace(gvg.synthesize_fields_pattern,
								function (complete_match,br1,field_name,br2) {
									field_name = (tagnames_stripped) ? field_name.replace(/[^A-Za-z0-9\.-]/gi,'').toLowerCase() : field_name.toLowerCase();
									if (mi[field_name] || mi[field_name] == '0' || mi[field_name] === false) {
										return (br1+mi[field_name]+br2);
									} else if (mi[alias[field_name]] || mi[alias[field_name]] == '0' || mi[alias[field_name]] === false) {
										return (br1+mi[alias[field_name]]+br2);
									} else {
										return ('');
									}
								}
							);
							mi[f] = template;
						}
					}
				}
				if (opts.google_content_as_desc) {
					mi.desc = (content_tag) ? row['content'][content_tag] : row['content'];
				}
				if (opts.ignore_styles && mi.icon != 'tickmark') {
					mi.color = null; mi.icon = null; mi.icon_size = null; mi.icon_anchor = null; mi.scale = null; mi.opacity = null;
				}
				if (mi.track_number && !mi.color && trk && trk[mi.track_number] && trk[mi.track_number].info && trk[mi.track_number].info.color) {
					mi.color = trk[mi.track_number].info.color;
				}
				var marker_ok = true;
				if (isNaN(mi.lat) || isNaN(mi.lon) || (mi.lat == 0 && mi.lon == 0) || Math.abs(mi.lat) > 90 || Math.abs(mi.lon) > 180 || mi.lat == undefined || mi.lon == undefined) {
					marker_ok = false;
				} else if (filter_regexp && filter_field) {
					if (mi[filter_field] && mi[filter_field].toString().match(filter_regexp)) {
						marker_ok = true;
					} else {
						marker_ok = false;
					}
				}
				if (marker_ok) {
					if (opts.default_marker) {
						for (mdf=0; mdf<marker_default_fields.length; mdf++) {
							var f = marker_default_fields[mdf];
							if (!mi[f] && opts.default_marker[f]) { mi[f] = opts.default_marker[f]; }
						}
					}
					mi.dynamic = gvg.dynamic_file_index + 1; // +1 so we can test for its presence!
					GV_Draw_Marker(mi); // wpts.push( GV_Marker(mi) );
					marker_count++;
					if (mi.gv_track_number && trk && trk[mi.gv_track_number] && trk[mi.gv_track_number].overlays) {
						trk[ mi.gv_track_number ].overlays.push(lastItem(wpts));
					}
				}
			}
		}
		if (data && data[root_tag] && data[root_tag]['metadata'] && data[root_tag]['metadata']['name']) {
			gvg.page_title = data[root_tag]['metadata']['name'];
		}
		
	} // end "else" where the "if" was "is this a KML file?"
	
	var wpt_count_new = wpts.length - wpt_count_baseline;
	var trk_count_new = trk.length - trk_count_baseline;
	
	if (opts.autozoom != false && !opts.reload_on_move) {
		gv_options.zoom = 'auto';
		if (!gvg.autozoom_elements) { gvg.autozoom_elements = []; }
		if (wpt_count_new > 0) {
			for (var i=0; i<wpt_count_new; i++) { gvg.autozoom_elements.push(wpts[wpt_count_baseline+i]); }
		}
		if (trk_count_new > 0) {
			for (var i=0; i<trk_count_new; i++) { gvg.autozoom_elements.push(trk[trk_count_baseline+i]); }
		}
	}

	gv_options.autozoom_adjustment = (opts.zoom_adjustment) ? opts.zoom_adjustment : 0;
	gv_options.autozoom_default = (opts.zoom_default) ? opts.zoom_default : gv_options.autozoom_default;
	// if (marker_count == 1 && $('gv_crosshair')) { $('gv_crosshair').style.display = 'none'; }
	
	GV_Load_Next_Dynamic_File();
}

function GV_Load_Next_Dynamic_File() {
	if (gv_options.dynamic_data && gv_options.dynamic_data[gvg.dynamic_file_index]) { gv_options.dynamic_data[gvg.dynamic_file_index].processed = true; }
	
	if (gvg.dynamic_file_index < (gvg.dynamic_file_count-1) && !gvg.dynamic_file_single) {
		gvg.dynamic_file_index++;
		GV_Load_Markers_From_File();
	} else { // no more files to load
		if (wpts.length == 0) {
			if ($(gvg.marker_list_div_id)) { $(gvg.marker_list_div_id).innerHTML = ''; }
			if (!gvg.dynamic_reload_on_move && !gv_options.keep_empty_marker_list) { GV_Remove_Marker_List(); }
		}
		GV_Finish_Map();
	}
}

GV_JSON_Callback = GV_Load_Markers_From_Data_Object;


//  **************************************************
//  * centering & viewport stuff
//  **************************************************

function GV_Recenter_Per_URL(opts) {
	if (!opts) { return false; }
	if (!self.gmap) { return false; }
	var new_center = null; var new_zoom = null; var hide_crosshair = false;
	var center_key = (opts.center_key) ? opts.center_key : 'center';
	var zoom_key = (opts.zoom_key) ? opts.zoom_key : 'zoom';
	var default_zoom = (opts.default_zoom) ? opts.default_zoom : null;
	var partial_match = (opts.partial_match === false) ? false : true;
	var open_info_window = (opts.open_info_window) ? true : false;
	var type_aliases = (opts.type_alias) ? opts.type_alias : null;
	var center_window = (opts.center_window) ? opts.center_window : '';
	
	var open_info_window_pattern = new RegExp('[&\\?\#](?:open.?)?info.?window=([^&]+)','i');
	if (window.location.toString().match(open_info_window_pattern)) {
		var open_info_window_match = open_info_window_pattern.exec(window.location.toString());
		if (open_info_window_match && open_info_window_match[1].match(/^[1ty]/i)) {
			open_info_window = true;
		} else if (open_info_window_match && open_info_window_match[1].match(/^[0fn]/i)) {
			open_info_window = false;
		}
	}
	var mt = GV_Maptype_From_URL(opts); if (mt) { GV_Set_Map_Type(mt); } // this is a separate function because it also needs to be run by the initial map setup (due to the control's menu)
	
	var zoom_pattern = new RegExp('[&\\?\#]'+zoom_key+'=([0-9]+)','i');
	if (window.location.toString().match(zoom_pattern)) {
		var zoom_match = zoom_pattern.exec(window.location.toString());
		if (zoom_match && zoom_match[1]) { // the appropriate variable was found in the URL's query string
			var z = uri_unescape(zoom_match[1]);
			if (z.match(/[0-9]/)) {
				z = parseFloat(z); if (z > gvg.zoom_maximum) { z = gvg.zoom_maximum; } if (z < gvg.zoom_minimum) { z = gvg.zoom_minimum; }
				new_zoom = z;
			}
		}
	}
	
	var center_window_pattern = new RegExp('[&\\?\#](center.?window|popup|note)=([^&]+)','i');
	var center_window_html = '';
	if (window.location.toString().match(center_window_pattern)) {
		var center_window_match = center_window_pattern.exec(window.location.toString());
		if (center_window_match && center_window_match[2]) { // the appropriate variable was found in the URL's query string
			center_window_html = '<div class="gv_marker_info_window"><div class="gv_marker_info_window_name">'+uri_unescape(center_window_match[2])+'</div></div>';
		}
	}
	
	var center_pattern = new RegExp('[&\\?\#]'+center_key+'=([^&]+)','i');
	if (window.location.toString().match(center_pattern)) {
		var center_match = center_pattern.exec(window.location.toString());
		if (center_match && center_match[1]) {
			// the appropriate variable was found in the URL's query string
			var c = center_match[1].replace(/\+/g,' ');
			c = uri_unescape(c);
			if (c.match(/^wpts?\[/)) {
				if (eval('self.'+c) && eval('self.'+c+'.position')) {
					new_center = eval('self.'+c+'.position');
					if (open_info_window) { window.setTimeout('google.maps.event.trigger('+c+',"click")',500); }
				}
			} else if (c.match(/^trk?\[/)) {
				if (eval('self.'+c)) {
					GV_Autozoom({adjustment:0},eval(c));
					if (new_zoom) { gmap.setZoom(new_zoom); }
					return true;
				}
			} else {
				new_center = GV_Marker_Coordinates({pattern:c,partial_match:partial_match,open_info_window:open_info_window});
				if (c && !new_center) { // the GV_Marker_Coordinates function can detect both marker names and numeric coordinates; this was neither, so geocode it
					var gc = new google.maps.Geocoder();
					if (opts.custom_function) {
						gc.geocode({address:c.toString()}, eval(opts.custom_function));
					} else {
						// v3??? expand this to use the "bounds" of results[0].geometry?
						gc.geocode({address:c.toString()}, function(results,status){
							if (results[0] && results[0].geometry && results[0].geometry.location) {
								gmap.setCenter(results[0].geometry.location);
							}
						});
					}
				}
			}
		}
	}
	if (new_center) {
		if (default_zoom && !new_zoom) { new_zoom = default_zoom; }
		if (new_zoom) {
			gmap.setCenter(new_center);
			gmap.setZoom(new_zoom);
		} else {
			gmap.setCenter(new_center);
		}
		if (hide_crosshair && $('gv_crosshair')) {
			$('gv_crosshair').style.display = 'none';
			gvg.crosshair_temporarily_hidden = true;
		}
		if (center_window_html) { gmap.openInfoWindowHtml(gmap.getCenter(),center_window_html); }
		if (gmap.savePosition){ gmap.savePosition(); }
		return true;
	} else if (new_zoom) {
		gmap.setZoom(new_zoom);
		if (center_window_html) { gmap.openInfoWindowHtml(gmap.getCenter(),center_window_html); }
		return true;
	} else {
		if (center_window_html) { gmap.openInfoWindowHtml(gmap.getCenter(),center_window_html); }
		return false;
	}
}
function GV_Maptype_From_URL(opts) {
	if (!opts) { return null; }
	var mt = null;
	var maptype_key = (opts.maptype_key) ? opts.maptype_key : '(?:map.?type|bg.?map|base.?map)';
	var type_aliases = (opts.type_alias) ? opts.type_alias : null;
	var maptype_pattern = new RegExp('[&\\?\#]'+maptype_key+'=([A-Z0-9_]+)','i');
	if (window.location.toString().match(maptype_pattern)) {
		var maptype_match = maptype_pattern.exec(window.location.toString());
		if (maptype_match && maptype_match[1]) { // the appropriate variable was found in the URL's query string
			var t = uri_unescape(maptype_match[1]);
			if (type_aliases && type_aliases[t.toLowerCase()]) { t = type_aliases[t.toLowerCase()]; }
			if (gvg.bg[t.toUpperCase()]) { return t.toUpperCase(); }
		}
	}
}

function GV_Recenter(lat,lon,zoom) {
	lat = ParseCoordinate(lat); lon = ParseCoordinate(lon);
	if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
		new_center = new google.maps.LatLng(lat,lon);
		gmap.setCenter(new_center);
		if (zoom) { gmap.setZoom(zoom); }
	}
}

function GV_Marker_Coordinates(pattern_or_opts) {
	if (!pattern_or_opts || !self.gmap || !self.wpts) { return null; }
	var pattern = '';
	if (typeof(pattern_or_opts) == 'object') { // figure out whether the first argument is an array or a simple pattern
		opts = pattern_or_opts;
		pattern = opts.pattern;
	} else { // it's a string or number
		if (pattern_or_opts) { pattern = pattern_or_opts; opts = {}; } else { return false; }
	}
	var partial_match = (opts.partial_match === false) ? false : true;
	var open_info_window = (opts.open_info_window) ? true : false;
	var field = (opts.field) ? opts.field : 'name';
	if (!pattern) { return null; }
	
	var new_center = null;
	var coordinate_match = DetectCoordinates(pattern);
	if (coordinate_match) { // the query looks like a pair of numeric coordinates
		if (coordinate_match[1] != null && coordinate_match[2] != null) {
			var lat = ParseCoordinate(coordinate_match[1]); var lon = ParseCoordinate(coordinate_match[2]);
			if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
				new_center = new google.maps.LatLng(lat,lon);
			}
		}
	} else { // they didn't request a coordinate pair, so look to see if any waypoint's name matches the query
		var matching_marker = GV_Find_Marker(opts);
		if (matching_marker) {
			new_center = matching_marker.position; hide_crosshair = true;
			// the info window is opened HERE, in this informational subroutine, because this is where we know which marker to pop open
			if (open_info_window) { window.setTimeout('google.maps.event.trigger(wpts['+matching_marker.gvi.index+'],"click")',500); }
		}
	}
	return new_center;
}

function GV_Find_Marker(pattern_or_opts) {
	var pattern = ''; var opts = [];
	if (typeof(pattern_or_opts) == 'object') { // figure out whether the first argument is an array or a simple pattern
		opts = pattern_or_opts;
		pattern = opts.pattern.toString();
	} else { // it's a string or number
		if (pattern_or_opts) { pattern = pattern_or_opts.toString(); opts = {}; } else { return null; }
	}
	var partial_match = (opts.partial_match === false) ? false : true;
	var field = (opts && opts.field) ? opts.field : 'name';
	if (partial_match) {
		for (var i=0; i<wpts.length; i++) { if (wpts[i].gvi[field].toString().toLowerCase().indexOf(pattern.toLowerCase()) > -1) { return wpts[i]; } }
	} else {
		for (var i=0; i<wpts.length; i++) { if (wpts[i].gvi[field] == pattern) { return wpts[i]; } }
	}
	return null;
}
function GV_Find_Track(pattern_or_opts) {
	var pattern = ''; var opts = [];
	if (typeof(pattern_or_opts) == 'object') { // figure out whether the first argument is an array or a simple pattern
		opts = pattern_or_opts; pattern = opts.pattern.toString();
	} else { // it's a string or number
		if (pattern_or_opts) { pattern = pattern_or_opts.toString(); opts = {}; } else { return null; }
	}
	if (!pattern) { return null; }
	var partial_match = (opts.partial_match === false) ? false : true;
	var pattern_regexp = (partial_match) ? new RegExp(pattern,'i') : new RegExp('^'+pattern+'$','i')
	if (opts.field) {
		for (var i in trk) { if (trk[i].info[opts.field] && trk[i].info[opts.field].match(pattern_regexp)) { return trk[i]; } }
	} else { // no field given; check both name & desc
		for (var i in trk) { if (trk[i].info.name && trk[i].info.name.match(pattern_regexp)) { return trk[i]; } }
		for (var i in trk) { if (trk[i].info.desc && trk[i].info.desc.match(pattern_regexp)) { return trk[i]; } }
	}
	return null;
}

function GV_Marker_Click(pattern) {
	var m = GV_Find_Marker(pattern);
	if (m) { GV_Open_Marker_Window(m); }
}

function GV_Center_On_Marker(pattern_or_opts,opts) {
	var pattern = '';
	if (typeof(pattern_or_opts) == 'object') { // figure out whether the first argument is an array or a simple pattern
		opts = pattern_or_opts;
		pattern = opts.pattern;
	} else { // it's a string or number
		if (pattern_or_opts) { pattern = pattern_or_opts; } else { return false; }
	}
	if (!self.gmap || !self.wpts) { return false; }
	var partial_match = (opts && opts.partial_match === false) ? false : true;
	var open_info_window = (opts && opts.open_info_window) ? true : false;
	var center = (opts && opts.center === false) ? false : true;
	var zoom = (opts && opts.zoom) ? opts.zoom : null;
	var field = (opts && opts.field) ? opts.field : 'name';
	
	var new_center = GV_Marker_Coordinates({field:field,pattern:pattern,partial_match:partial_match,open_info_window:open_info_window});
	if (new_center && center) {
		gmap.setCenter(new_center);
		if (zoom) { gmap.setZoom(zoom); }
	}
}
function GV_Center_On_Track(pattern_or_opts,opts) {
	var pattern = '';
	if (typeof(pattern_or_opts) == 'object') { // figure out whether the first argument is an array or a simple pattern
		opts = pattern_or_opts;
		pattern = opts.pattern;
	} else { // it's a string or number
		if (pattern_or_opts) { pattern = pattern_or_opts; } else { return false; }
	}
	if (!self.gmap || !self.trk) { return false; }
	var partial_match = (opts && opts.partial_match === false) ? false : true;
	var open_info_window = (opts && opts.open_info_window) ? true : false;
	var center = (opts && opts.center === false) ? false : true;
	var zoom = (opts && opts.zoom) ? opts.zoom : null;
	var j=0; var found=null;
	var t = GV_Find_Track({'pattern':pattern,'field':opts.field,'partial_match':partial_match});
	if (t != null) {
		if (open_info_window && t.info.index) { GV_Open_Track_Window(t.info.index); }
		if (center) {
			if (zoom === true) {
				GV_Autozoom({},t);
			} else if (zoom && parseFloat(zoom) > 0) { // a zoom level was specified
				if (t.info && t.info.bounds) { gmap.setCenter(t.info.bounds.getCenter()); gmap.setZoom(zoom); }
			} else { // zoom is false
				if (t.info && t.info.bounds) { gmap.setCenter(t.info.bounds.getCenter()); }
			}
		}
	}
}
function GV_Center_On_Address(opts) {
	if (!self.gmap || !opts || !opts.input_box || !$(opts.input_box)) { return false; }
	var add = $(opts.input_box).value; if (!add) { return false; }
	opts.show_crosshair = (opts.show_crosshair === false) ? false : true;
	var message_box = (opts.message_box && $(opts.message_box)) ? $(opts.message_box) : null;
	var centered = false; // an easy way for the program to tell if it turned out to be simple coordinates
	var coordinate_match = DetectCoordinates(add);
	if (coordinate_match) { // the query looks like a pair of numeric coordinates
		if (coordinate_match[1] != null && coordinate_match[2] != null) {
			var lat = ParseCoordinate(coordinate_match[1]); var lon = ParseCoordinate(coordinate_match[2]);
		}
		if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
			gmap.setCenter(new google.maps.LatLng(lat,lon));
			var zoom = (gv_options.coordinate_zoom_level) ? gv_options.coordinate_zoom_level : (gmap.getZoom() >= 5) ? gmap.getZoom() : 5;
			if (opts.zoom && typeof(opts.zoom) == 'number') { zoom = opts.zoom; }
			gmap.setZoom(zoom);
			if (message_box) { message_box.innerHTML = 'Re-centering on '+lat+', '+lon; }
			if (opts.show_crosshair) { GV_Toggle('gv_crosshair',true); }
			centered = true;
		}
	}
	if (!centered) {
		if (opts.coordinates_only) {
			if (message_box) { message_box.innerHTML = 'Invalid latitude/longitude.'; }
		} else {
			var geocoder = new google.maps.Geocoder();
			gvg.center_on_address = opts; // need to make the options into a global variable
			gvg.center_on_address.input = add;
			if (opts.log_image || document.location.toString().match(/^https?:\/\/www\.gpsvisualizer\.com/)) {
				var image_url = (opts.log_image) ? opts.log_image : '/geocoder/searchbox-log.png';
				image_url += '?loc='+encodeURIComponent(add);
				if (document.images) {
					var im = new Image(); im.src = image_url; // log it
				}
			}
			geocoder.geocode({'address':add}, GV_Center_On_Address2);
		}
	}
}
function GV_Center_On_Address2(results,status) {
	if (!self.gmap) { return false; }
	var message_box = (gvg.center_on_address && gvg.center_on_address.message_box && $(gvg.center_on_address.message_box)) ? $(gvg.center_on_address.message_box) : null;
	var zoom_to_result = (gvg.center_on_address && gvg.center_on_address.zoom === false) ? false : true;
	var specified_zoom_level = (gvg.center_on_address && gvg.center_on_address.zoom && typeof(gvg.center_on_address.zoom) == 'number') ? gvg.center_on_address.zoom : null;
	var found_template = (gvg.center_on_address && gvg.center_on_address.found_template) ? gvg.center_on_address.found_template : 'Google found: <b>{address}</b> ({latitude},{longitude})  [precision: {precision}, type: {type}]';
	var unfound_template = (gvg.center_on_address && gvg.center_on_address.unfound_template) ? gvg.center_on_address.unfound_template : 'Google could not locate "{input}".';
	var google_precision = {'ROOFTOP':'precise','RANGE_INTERPOLATED':'interpolated','GEOMETRIC_CENTER':'geometric center','APPROXIMATE':'approximate'};
	var google_types = {'administrative_area_level_1':'state/province', 'administrative_area_level_2':'county/municipality', 'administrative_area_level_3':'municipality', 'locality':'city', 'natural_feature':'natural feature', 'point_of_interest':'point of interest'};
	if (status == google.maps.GeocoderStatus.OK && results && results[0] && results[0].geometry && results[0].geometry.location) {
		var r = results[0];
		var coords = r.geometry.location;
		var lat = coords.lat(); var lon = coords.lng(); var lng = coords.lng(); 
		var precision = 'unknown'; var type = '';
		precision = (google_precision[r.geometry.location_type]) ? google_precision[r.geometry.location_type] : r.geometry.location_type;
		if (r.types && r.types[0]) {
			if (r.types[0] == 'establishment' && r.types[1]) { r.types.shift(); }
			if (r.types[0]) { type = (google_types[r.types[0]]) ? google_types[r.types[0]] : r.types[0].replace(/_/g,' '); }
		}
		var address = (r.formatted_address) ? r.formatted_address : '';
		var name = (r.address_components && r.address_components[0] && r.address_components[0].long_name) ? r.address_components[0].long_name : '';
		if (name.match(/^\d+/) && type != 'postal code') {
			name = address.replace(/^(.*?),.*/,'$1');
		}
		var zoom = (gmap.getZoom() >= 5) ? gmap.getZoom() : 5; var size = null;
		if (r.geometry.viewport) {
			zoom = getBoundsZoomLevel(r.geometry.viewport);
			size = google.maps.geometry.spherical.computeDistanceBetween(r.geometry.viewport.getNorthEast(),r.geometry.viewport.getSouthWest());
		}
		if (specified_zoom_level) { zoom = specified_zoom_level; }
		if (zoom_to_result) {
			gmap.setCenter(coords);
			gmap.setZoom(zoom);
		} else {
			gmap.setCenter(coords);
		}
		if (gvg.center_on_address && gvg.center_on_address.show_crosshair) { GV_Toggle('gv_crosshair',true); }
		if (gvg.center_on_address && gvg.center_on_address.save_position) { gmap.savePosition(); }
		if (message_box) {
			var found = found_template.toString().replace(/{address}/gi,address).replace(/{latitude}/gi,lat.toFixed(6)*1).replace(/{longitude}/gi,lng.toFixed(6)*1).replace(/{precision}/gi,precision).replace(/{type}/gi,type);
			message_box.innerHTML = found;
		}
		if (gv_options.searchbox_options && gv_options.searchbox_options.callback) {
			var func = gv_options.searchbox_options.callback.replace(/{lat}/i,lat).replace(/{lon}/i,lng).replace(/{lng}/i,lng).replace(/{size}/i,size).replace(/{precision}/i,singleQuote(precision)).replace(/{type}/i,singleQuote(type)).replace(/{address}/i,singleQuote(address)).replace(/{name}/i,singleQuote(name));
			eval(func);
		}
	} else {
		if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
			if (message_box) { message_box.innerHTML = 'Geocoding quota exceeded.'; }
		} else if (gvg.center_on_address && gvg.center_on_address.input) {
			var unfound = unfound_template.toString().replace(/{input}/i,gvg.center_on_address.input);
			if (message_box) { message_box.innerHTML = unfound; }
		}
	}
	gvg.center_on_address = [];
}

function GV_Fill_Window_With_Map(mapdiv_id) {
	if (!mapdiv_id) { mapdiv_id = gv_options.map_div; }
	if (!$(mapdiv_id)) { return false; }
	var mapdiv = $(mapdiv_id);
	var window_size = GV_Get_Window_Size();
	var header_height = (gv_options.full_screen_header) ? gv_options.full_screen_header : 0;
	var footer_height = (gv_options.full_screen_footer) ? gv_options.full_screen_footer : 0;
	mapdiv.style.position = 'absolute';
	mapdiv.style.left = '0px'; mapdiv.style.top = header_height+'px';
	mapdiv.style.width = window_size[0]+'px'; mapdiv.style.height = (window_size[1]-header_height-footer_height)+'px';
}
function GV_Get_Window_Size() {
	// from http://www.quirksmode.org/viewport/compatibility.html
	var x,y;
	if (window.innerHeight) { // all except Explorer
		x = window.innerWidth;
		y = window.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		x = document.documentElement.clientWidth;
		y = document.documentElement.clientHeight;
	} else if (document.body) { // other Explorers
		x = document.body.clientWidth;
		y = document.body.clientHeight;
	}
	return [x,y];
}
function GV_Recenter_Map() { // BC?
	if (gmap && gvg.center) {
		gmap.setCenter(gvg.center);
		if (gvg.zoom) { gmap.setZoom(gvg.zoom); }
	}
}

function GV_Autozoom() { // automatically adjust the map's zoom level to cover the elements passed to this function
	// EXAMPLE 1:  GV_Autozoom({adjustment:-1},'trk','wpts');
	// EXAMPLE 2:  GV_Autozoom({adjustment:-2},'wpts[2]');
	// EXAMPLE 3:  GV_Autozoom({adjustment:1},'trk[1]','wpts[0]','wpts[4]');
	if (!self.gmap) { return false; }
	var visible_only = false;
	var args = Array.prototype.slice.call(arguments);
	if (args.length == 0) { args = [ {}, trk, wpts ]; }
	else if (typeof(args[0]) == 'string') { args.unshift({}); } // no options were passed
	var opts = (typeof(args[0]) == 'undefined') ? [] : args[0];
	opts.default_zoom = parseInt(opts.default_zoom); if (isNaN(opts.default_zoom)) { opts.default_zoom = 8; }
	opts.adjustment = parseInt(opts.adjustment); if (isNaN(opts.adjustment)) { opts.adjustment = 0; }
	opts.margin = parseInt(opts.margin); if (isNaN(opts.margin)) { opts.margin = 35; }
	opts.save_position = (opts.save_position === true) ? true : false;
	opts.visible = (opts.visible === false) ? false : true;
	opts.max_zoom = (!isNaN(opts.max_zoom)) ? opts.max_zoom : 22;
	opts.animate = (opts.animate === false) ? false : gvg.anizoom;
	
	var min_lat = 90; var max_lat = -90; var min_lon = 360; var max_lon = -360;
	var bounds = new google.maps.LatLngBounds;
	for (var i=1; i<args.length; i++) { // start at i=1 because args[0] was the options
		if (args[i]) {
			var a = (typeof(args[i]) == 'string') ? eval(args[i]) : args[i]; // so that 'wpts' is a valid argument
			if (a.position) { // it's a waypoint
				if (!opts.visible || !a.gv_hidden()) {
					bounds.extend(a.position());
				}
			} else if (typeof(a) == 'object' && a.overlays && a.overlays.length) { // tracks are collections of overlays (usually track segments but also sometimes markers)
				if (a.overlays && a.overlays[0] && a.overlays[0].getPath) { // it's a single track
					if (!opts.visible || !a.gv_hidden()) {
						if (a.info && a.info.bounds) { // hopefully the bounds have already been calculated
							bounds.union(a.info.bounds);
						} else if (a.overlays && a.overlays.length)  { // if not, we'll examine each piece
							for (ts=0; ts<a.overlays.length; ts++) {
								bounds = union(a.overlays[ts].getBounds());
							}
						}
					}
				}
			} else if (a.length) {
				for (var j=0; j<a.length; j++) { // it's a collection of tracks or markers
					if (a[j]) {
						if (a[j].position) { // it's a waypoint
							if (!opts.visible || !a[j].gv_hidden()) {
								bounds.extend(a[j].position);
							}
						} else if (a[j].overlays && a[j].overlays[0] && a[j].overlays[0].getPath) { // it's a track
							if (!opts.visible || !a[j].gv_hidden()) {
								if (a[j].info && a[j].info.bounds) { // hopefully the bounds have already been calculated
									bounds.union(a[j].info.bounds);
								} else if (a[j].overlays && a[j].overlays.length) { // if not, we'll examine each piece
									for (ts=0; ts<a[j].overlays.length; ts++) { // tracks are collections of overlays (usually track segments but also sometimes markers)
										if (a[j].overlays[ts].position) { // if it has .position, it's an associated waypoint, NOT a track segment
											bounds.extend(a[j].overlays[ts].position);
										} else { // it's a track segment
											bounds.union(a[j].overlays[ts].info.bounds);
										}
									}
								}
							}
						}
					}
				}
			} // end if (a.length)
		} // end if (args[i]) 
	}
	
	if (bounds) {
		if (bounds.isEmpty()) {
			// nothing to calculate!
		} else {
			var zoom; var center;
			if (bounds.getNorthEast().lat() == bounds.getSouthWest().lat() && bounds.getNorthEast().lng() == bounds.getSouthWest().lng()) {
				zoom = opts.default_zoom; // arbitrary zoom for single-point maps
				center = bounds.getNorthEast();
			} else {
				zoom = getBoundsZoomLevel(bounds,new google.maps.Size(gmap.getDiv().clientWidth-(opts.margin*2),gmap.getDiv().clientHeight-(opts.margin*2)));
				center = bounds.getCenter();
				if (gvg.debug) { var new_bounds_rectangle = new google.maps.Rectangle({'bounds':bounds,strokeColor:'#0000ff',strokeWeight:1,strokeOpacity:0.3,fillColor:'#0000ff',fillOpacity:0.2,clickable:false}); new_bounds_rectangle.setMap(gmap); }
			}
			gvg.center = center;
			gvg.zoom = zoom+opts.adjustment;
			if (opts.max_zoom && gvg.zoom > opts.max_zoom) { gvg.zoom = opts.max_zoom; }
			gmap.setCenter(gvg.center); gmap.setZoom(gvg.zoom);
			window.setTimeout('GV_Reset_Zoom_Control()',100); // this SHOULD happen via a listener, but sometimes doesn't
			if (opts.save_position) { gvg.saved_center = gmap.getCenter(); gvg.saved_zoom = gmap.getZoom(); }
		}
	}
	
	if (opts.callback || gv_options.autozoom_callback) {
		var func = (opts.callback) ? opts.callback : gv_options.autozoom_callback;
		eval(func);
	}
	
}

function GV_Zoom_With_Rectangle(enable) { // from Mohammad Abu Qauod, 3/21/16
	if (enable === false) {
		if (gvg.listeners['zoom_rectangle']) { google.maps.event.removeListener(gvg.listeners['zoom_rectangle']); }
		return false;
	} else {
		var keys_down = [];
		var drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode:google.maps.drawing.OverlayType.RECTANGLE,
			drawingControl:false,
			rectangleOptions: {
				fillColor:"#ff00ff",
				fillOpacity:0.1,
				strokeColor:"#ff00ff",
				strokeWeight:1
			}
		});
	
		gvg.listeners['zoom_rectangle'] = google.maps.event.addListener(drawingManager, "rectanglecomplete", function (rect) {
			if (keys_down[16] && (keys_down[17] || keys_down[224])) { // Shift + (Control or Command)
				// console.log("zooming out");
				gmap.setCenter(rect.getBounds().getCenter());
				gmap.setZoom(gmap.getZoom()-1);
				rect.setMap(null);
				return false;
			} else if (keys_down[16]) {
				// console.log("zooming in");
				gmap.fitBounds(rect.bounds);
				rect.setMap(null);
				return false;
			}
		});
		
		document.onkeydown = document.onkeyup = function(e) {
			e = e || event; // for IE
			keys_down[e.keyCode] = (e.type == 'keydown') ? true : false;
			if (keys_down[16]) { // Shift
				drawingManager.setMap(gmap);
			} else {
				drawingManager.setMap(null);
			}
		};
	}
}

//  **************************************************
//  * custom map backgrounds
//  **************************************************
function GV_Define_Background_Maps() {
	gvg.background_maps = GV_Background_Map_List();
	gvg.background_maps_hash = {};
	
	gvg.bg = []; // this is really just an array of map IDs, not the maps themselves.
	gvg.overlay_map_types = {};
	
	var o = (gv_options && gv_options.map_type_control) ? gv_options.map_type_control : [];
	if (o && o.custom) {
		if (o.custom.constructor != Array) { gv_options.map_type_control.custom = [ gv_options.map_type_control.custom ]; } // make it into a list array
		if (o.custom.length > 0) {
			for (var i=0; i<o.custom.length; i++) {
				var custom = o.custom[i];
				if (custom.url || custom.template || (custom.style)) {
					custom.url = (custom.template) ? custom.template : custom.url;
					custom.id = (custom.id) ? custom.id : 'CUSTOM_MAP_'+(i+1);
					custom.menu_order = (custom.menu_order) ? custom.menu_order : 10000+i;
					custom.menu_name = (custom.menu_name) ? custom.menu_name : 'Custom '+(i+1);
					custom.credit = (custom.credit) ? custom.credit : ((custom.copyright) ? custom.copyright : '');
					custom.error_message = (custom.error_message) ? custom.error_message : custom.menu_name+' tiles unavailable';
					custom.min_zoom = (custom.min_zoom) ? custom.min_zoom : ((custom.min_res) ? custom.min_res : gvg.zoom_minimum);
					custom.max_zoom = (custom.max_zoom) ? custom.max_zoom : ((custom.max_res) ? custom.max_res : gvg.zoom_maximum);
					custom.bounds = (custom.bounds) ? custom.bounds : [-180,-90,180,90];
					custom.bounds_subtract = (custom.bounds_subtract) ? custom.bounds_subtract : [];
					custom.type = (custom.type) ? custom.type.toLowerCase() : null;
					custom.tile_size = (custom.tile_size) ? parseFloat(custom.tile_size) : 256;
					// any other attributes (description, background, style, etc.) will be passed as-is
					gvg.background_maps.push(custom);
				}
			}
		}
	}
	
	for (var b=0; b<gvg.background_maps.length; b++) {
		gvg.background_maps[b] = GV_Define_Map( gvg.background_maps[b] );
		var m = gvg.background_maps[b];
		if (m && m.id) { gvg.background_maps_hash[m.id] = m; }
	}
	
	GV_Define_Background_Map_Aliases();
	
	if (o.custom_order) {
		for (var mt in o.custom_order) {
			if (!o.map_type_options) { o.map_type_options = {}; }
			if (!o.map_type_options[mt]) { o.map_type_options[mt] = {}; }
			o.map_type_options[mt]['menu_order'] = o.custom_order[mt];
		}
	}
	if (o.custom_title) {
		for (var mt in o.custom_title) {
			if (!o.map_type_options) { o.map_type_options = {}; }
			if (!o.map_type_options[mt]) { o.map_type_options[mt] = {}; }
			o.map_type_options[mt]['menu_name'] = o.custom_title[mt];
		}
	}
	var option_aliases = { 'min_zoom':'minNativeZoom', 'max_zoom':'maxNativeZoom' }; // these affect the maps as defined in the guts of the Leaflet code
	if (o.map_type_options) {
		for (var mt in o.map_type_options) {
			var attrs = o.map_type_options[mt];
			var bgmap = gvg.background_maps_hash[ gvg.bg[mt] ];
			if (bgmap && bgmap.id) {
				for (var a in attrs) { bgmap[a] = attrs[a]; }
				GV_Redefine_Map(bgmap.id);
			}
		}
	}
	
}
function GV_Redefine_Map(map_id) {
//GV_Debug("------GV_Redefine_Map("+map_id+")");
	if (!map_id) { map_id = gvg.current_map_type; }
	gvg.redefining = map_id;
	gvg.background_maps_hash[map_id] = GV_Define_Map(gvg.background_maps_hash[map_id]);
	gvg.redefining = null;
}

function GV_Define_Map(mapinfo) {
	var map_ok = false;
	mapinfo.min_zoom = (mapinfo.min_zoom) ? mapinfo.min_zoom : ((mapinfo.min_res) ? mapinfo.min_res : gvg.zoom_minimum);
	mapinfo.max_zoom = (mapinfo.max_zoom) ? mapinfo.max_zoom : ((mapinfo.max_res) ? mapinfo.max_res : gvg.zoom_maximum);
	
	if (!mapinfo.url && mapinfo.background) {
		if (gvg.background_maps_hash[mapinfo.background] && gvg.background_maps_hash[mapinfo.background].url) {
			mapinfo.url = gvg.background_maps_hash[mapinfo.background].url;
			mapinfo.background = null;
		}
	}
	
	if (!mapinfo.url) {
		// it's a Google built-in map type
		map_ok = true;
		mapinfo.url_count = 0;
		if (mapinfo.style) { // unless it's a styled map
			var op = 1; if (mapinfo.opacity && mapinfo.opacity[u] && mapinfo.opacity[u] != 1) { op = (mapinfo.opacity[u] > 1) ? mapinfo.opacity[u]/100 : mapinfo.opacity[u]; }
			var min_zoom = (mapinfo.min_zoom) ? mapinfo.min_zoom : gvg.zoom_minimum;
			var max_zoom = (mapinfo.max_zoom) ? mapinfo.max_zoom : gvg.zoom_maximum;
			var id = (mapinfo.google_id) ? mapinfo.google_id : 'google.maps.MapTypeId.ROADMAP';
			var map_properties = {
				mapTypeId:id // unfortunately, no matter what, it always comes out "roadmap"; why can't terrain be styled on the fly?
				,name:mapinfo.menu_name
				,description:mapinfo.description
				,minZoom:min_zoom
				,maxZoom:max_zoom
				,opacity:op
			};
			var styled_map = new google.maps.StyledMapType(mapinfo.style,map_properties); styled_map.gv_id = id;
			gmap.mapTypes.set(mapinfo.id,styled_map);
			gvg.overlay_map_types[mapinfo.id] = [styled_map];
			gvg.bg[mapinfo.id] = mapinfo.id;
		}
	} else {
		if (typeof(mapinfo.url) != 'object') { mapinfo.url = [ mapinfo.url ]; }
		mapinfo.url_count = (mapinfo.url) ? mapinfo.url.length : 0;
		if (mapinfo.opacity) {
			if (typeof(mapinfo.opacity) != 'object') { mapinfo.opacity = [ mapinfo.opacity ]; }
			for (var j=0; j<(mapinfo.url_count-mapinfo.opacity.length); j++) { mapinfo.opacity.unshift(null); }
		}
		gvg.overlay_map_types[mapinfo.id] = []; // create an array to store all the layers
		for (var u=0; u<mapinfo.url_count; u++) {
			var ts = (mapinfo.tile_size) ? mapinfo.tile_size : 256;
			var url = mapinfo.url[u].toString(); var wms = false; var epsg3857 = false;
			var api_key = ''; var disallowed = false;
			if (mapinfo.api_key && mapinfo.api_key.match(/\{(\w+)\}/)) {
				var keyholder = mapinfo.api_key.replace(/^.*\{(\w+)\}.*$/,'$1');
				if (gvg.api_keys[keyholder]) {
					api_key = mapinfo.api_key.replace(/\{(\w+)\}/,gvg.api_keys[keyholder]);
				}
				if (!api_key && !mapinfo.visible_without_key) {
					mapinfo.no_key = true;
					// maybe put in a thing that allows it to stay in the list but disables it or causes a message to appear when selected?
				}
			}
			if (window.location.toString().indexOf('http') != 0 && url.indexOf('//') == 0) { url = 'https:'+url; }
			if (mapinfo.type == 'wms' || (mapinfo.type != 'tiles' && url.match(/\b(service=WMS|[sc]rs=EPSG:(4326|3857)|request=GetMap)\b/i))) {
				wms = true;
				if (url.match(/epsg.?3857/i)) { epsg3857 = true; }
				url = url.replace(/&(bbox|width|height)=[^&]*/g,'');
			}
			
			var tf = mapinfo.tile_function;
			var zoom_checker = 'if (z > gvg.background_maps_hash["'+mapinfo.id+'"].max_zoom) { z = gvg.background_maps_hash["'+mapinfo.id+'"].max_zoom; } else if (z < gvg.background_maps_hash["'+mapinfo.id+'"].min_zoom) { z = gvg.background_maps_hash["'+mapinfo.id+'"].min_zoom; } ';
			if (!wms) {
				// overzoom:
				var enl = 1; var z = gmap.getZoom(); if (z > mapinfo.max_zoom) { enl = Math.pow(2,z-mapinfo.max_zoom); } else if (z < mapinfo.min_zoom) { enl = Math.pow(2,z-mapinfo.min_zoom); }
				ts = ts*enl;
			}
			if (tf) { // it already has its own custom function
			
				tf = tf.replace(/^(function\(xy,z\)\{)/,'$1'+zoom_checker); // hack in a bit of code to allow for enlarged tiles
				
			} else {
				if (wms) {
				
					tf = 'function(xy,z){ ';
					tf += 'var projection = gmap.getProjection(); ';
					tf += 'var zpow = Math.pow(2,z); ';
					tf += 'var sw_pixel = new google.maps.Point(xy.x*'+ts+'/zpow,(xy.y+1)*'+ts+'/zpow); ';
					tf += 'var ne_pixel = new google.maps.Point((xy.x+1)*'+ts+'/zpow,xy.y*'+ts+'/zpow); ';
					tf += 'var sw_coords = projection.fromPointToLatLng(sw_pixel); ';
					tf += 'var ne_coords = projection.fromPointToLatLng(ne_pixel); ';
					if (epsg3857) {
						tf += 'var bbox = WebMercatorBBOX(sw_coords,ne_coords); ';
					} else { // EPSG:4326
						tf += 'var bbox = sw_coords.lng()+","+ sw_coords.lat()+","+ne_coords.lng()+","+ne_coords.lat(); ';
					}
					tf += 'var tile_url = "'+url+'"+"&bbox="+bbox+"&width='+ts+'&height='+ts+'"; ';
					//tf += 'GV_Debug(tile_url,false,"gv_debug_message2");';
					tf += 'return tile_url; ';
					tf += '}';
					
				} else if (url.indexOf('{') > -1) { // mapinfo.type is 'tiles', assumably
					
					var reverse_y = (url.match(/{[Y-]Y}/i)) ? true : false;
					url = '"'+url+'"';
					url = url.replace(/{api_key}/g,api_key);
					url = url.replace(/{(Z|zoom)}/gi,'"+z+"');
					url = url.replace(/{X}/gi,'"+x+"');
					url = url.replace(/{[Y-]?Y}/gi,'"+y+"');
					url = url.replace(/{R}/gi,''); // Retina detection; only works in Leaflet
					url = url.replace(/{S}/gi,'a');
					tf = 'function(xy,z){';
					tf += 'var x = xy.x; var y = xy.y; var tr = 1 << z; '; // tr = tile range is derived from zoom level: 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, etc.
					if (reverse_y) { tf += 'y = (Math.pow(2,z)-1-y); '; }
					tf += 'if (y < 0 || y >= tr) { return null; } '; // don't repeat across y-axis (vertically)
					tf += 'if (x < 0 || x >= tr) { x = (x % tr + tr) % tr; } '; // repeat across x-axis
					if (url.indexOf('{quadkey}') > -1) {
						url = url.replace(/{quadkey}/gi,'"+quadkey+"');
						tf += 'var quadkey = TileToQuadKey(x,y,z);';
					}
					tf += zoom_checker;
					tf += 'var tile_url = '+url+'; ';
					//tf += 'GV_Debug(tile_url,false,"gv_debug_message2");';
					tf += 'return tile_url; ';
					tf += '}';
				}
			}
			if (tf) {
				var op = 1; if (mapinfo.opacity && mapinfo.opacity[u] && mapinfo.opacity[u] != 1) { op = (mapinfo.opacity[u] > 1) ? mapinfo.opacity[u]/100 : mapinfo.opacity[u]; }
				var max_zoom = (tf.indexOf('quadkey') > -1) ? mapinfo.max_zoom : gvg.zoom_maximum;
				var map_properties = {
					mapTypeId:mapinfo.id
					,name:mapinfo.menu_name
					,description:mapinfo.description
					,minZoom:mapinfo.min_zoom
					,maxZoom:max_zoom
					,tileSize:new google.maps.Size(ts,ts)
					,opacity:op
				};
				eval("map_properties.getTileUrl = "+tf);
				var new_map = new google.maps.ImageMapType(map_properties); new_map.gv_id = mapinfo.id;
				if (u == 0) {
					gmap.mapTypes.set(mapinfo.id,new_map); // add the bottom layer to the MapTypeRegistry
				}
				// ...and store all the layers for other purposes too
				gvg.overlay_map_types[mapinfo.id][u] = new_map;
				gvg.bg[mapinfo.id] = mapinfo.id; // everything is an alias to itself, because gvg.bg is important
				map_ok = true;
			}
		}
	}
	
	return (map_ok) ? mapinfo : null;
}


function GV_WMSTileUrl(xy,z) {
	base_url = '';
	var ts = 256;
	var projection = gmap.getProjection();
	var zpow = Math.pow(2,z);
	var sw_pixel = new google.maps.Point(xy.x*ts/zpow,(xy.y+1)*ts/zpow);
	var ne_pixel = new google.maps.Point((xy.x+1)*ts/zpow,xy.y*ts/zpow);
	var sw_coords = projection.fromPointToLatLng(sw_pixel);
	var ne_coords = projection.fromPointToLatLng(ne_pixel);
	var bbox = sw_coords.lng()+","+ sw_coords.lat()+","+ne_coords.lng()+","+ne_coords.lat();
	return base_url+"&bbox="+bbox+"&width="+ts+"&height="+ts;
}


//  **************************************************
//  * controls etc.
//  **************************************************

function GV_Place_Div(div_or_id,x,y,anchor,noblock) {
	if (!div_or_id) { return false; }
	var div = (typeof(div_or_id) == 'string') ? $(div_or_id) : div_or_id;
	if (div) {
		var right = false; var bottom = false; var center = false;
		if (anchor) {
			if (anchor.toString().match(/(lower|bottom)/i)) { bottom = true; }
			if (anchor.toString().match(/right/i)) { right = true; }
			else if (anchor.toString().match(/center/i)) { center = true; }
		}
		if (!div.id) { div.id = "div_"+Math.floor(Math.rand()*1000000); }
		if (!div.style) { div.style = []; }
		if (!noblock) { div.style.display = 'block'; }
		div.style.position = 'absolute';
		if (bottom) { div.style.bottom = y+'px'; } else { div.style.top = y+'px'; }
		if (right) {
			div.style.right = x+'px';
		} else if (center) {
			GV_Recenter_Div(div.id);
			google.maps.event.addListener(gmap, "resize", function() { GV_Recenter_Div(div.id); });
		} else {
			div.style.left = x+'px';
		}
		div.style.zIndex = 99999; // make sure it's IN FRONT
	}
	return div;
}
function GV_Recenter_Div(id) {
	if ($(id)) {
		if (!$(id).style) { $(id).style = {}; }
		$(id).style.left = (gmap.getDiv().clientWidth/2-$(id).clientWidth/2)+'px';
	}
}
function GV_Remove_Div(id) {
	GV_Delete(id);
}
function GV_Delete(id) {
	if ($(id)) {
		if (!$(id).style) { $(id).style = {}; }
		$(id).style.display = 'none';
		$(id).parentNode.removeChild($(id));
	}
}
function GV_Toggle(id,showhide) {
	if ($(id)) {
		if (!$(id).style) { $(id).style = {}; }
		if (showhide === true) {
			$(id).style.display = '';
		} else if (showhide === false) {
			$(id).style.display = 'none';
		} else {
			$(id).style.display = ($(id).style.display == 'none') ? '' : 'none';
		}
	}
}
function GV_Adjust_Opacity(id,opacity) {
	// This is an all-purpose function for using style sheets to adjust the opacity of ANY object with an id
	opacity = parseFloat(opacity);
	if (opacity < 1) { opacity = opacity*100; }
	if ($(id)) {
		if (!$(id).style) { $(id).style = {}; }
		var thing = $(id);
		thing.style.opacity = opacity/100;
		thing.style.filter = 'alpha(opacity='+opacity+')';
		thing.style.MozOpacity = opacity/100;
		thing.style.KhtmlOpacity = opacity/100;
	}
}

function GV_Place_HTML(html,anchor,x,y,id,draggable) { // but easier to pass an array (e.g., {html:'<div>...</div>',x:100,y:20} )
	var o = []; if (typeof(html) == 'object') { o = html; } else { o.html = html; o.anchor = anchor; o.x = x; o.y = y; o.id = id; o.draggable = draggable; }
	if (!gvg.placed_html_count) { gvg.placed_html_count = 0; }
	if (self.gmap) {
		var div_id = (o.id) ? o.id : 'gv_placed_html_'+(++gvg.placed_html_count);
		if (!$(div_id)) {
			var new_div = document.createElement('div');
			new_div.id = div_id; new_div.style.block = 'none';
			if (o.class_name) { new_div.className = o.class_name; }
			new_div.innerHTML = o.html;
			gmap.getDiv().appendChild(new_div);
		}
		if ($(div_id)) {
			GV_Place_Div(div_id, o.x, o.y, o.anchor);
			if (o.draggable && o.drag_id && $(o.drag_id) && GV_Drag) {
				o.drag_handle_id = (o.drag_handle_id && $(o.drag_handle_id)) ? o.drag_handle_id : o.drag_id;
				if (o.drag_id != o.drag_handle_id) { $(o.drag_id).style.position = 'relative'; }
				GV_Drag.init($(o.drag_handle_id),$(o.drag_id));
			}
		}
	}
}
function GV_Remove_HTML(id) {
	GV_Delete(id);
}
function GV_Place_Image(url,anchor,x,y,optional_id) {
	GV_Place_HTML('<img src="'+url+'" border="" alt="" />',anchor,x,y,optional_id);
}
function GV_Remove_Image(id) {
	GV_Delete(id);
}
function GV_BoxHasContent(id) {
	return ($(id) && $(id).innerHTML && !($(id).innerHTML.match(/^\s*(<!--[^>]*-->|)\s*$/))) ? true : false;
}
function GV_Enable_Return_Key(textbox_id,button_id) {
	if ($(textbox_id) && $(button_id) && $(button_id).getAttributeNode('onclick')) {
		$(textbox_id).onkeypress = function(e) {
			if (!e) { e = window.event; }
			if (e.keyCode == 13) { eval($(button_id).getAttributeNode('onclick').nodeValue); return false; }
		};
	}
}

function GV_Control(controlDiv,anchor,margin,i) {
	if (typeof(controlDiv) == 'string' && $(controlDiv)) { controlDiv = $(controlDiv); }
	anchor = anchor.toString();
	     if (anchor.match(/(bottom|lower).*right/i)) { anchor = 'BOTTOM_RIGHT'; }
	else if (anchor.match(/(bottom|lower).*left/i)) { anchor = 'BOTTOM_LEFT'; }
	else if (anchor.match(/(top|upper).*right/i)) { anchor = 'TOP_RIGHT'; }
	else if (anchor.match(/(top|upper).*left/i)) { anchor = 'TOP_LEFT'; }
	else if (anchor.match(/right.*(bottom|lower)/i)) { anchor = 'RIGHT_BOTTOM'; }
	else if (anchor.match(/left.*(bottom|lower)/i)) { anchor = 'LEFT_BOTTOM'; }
	else if (anchor.match(/right.*(top|upper)/i)) { anchor = 'RIGHT_TOP'; }
	else if (anchor.match(/left.*(top|upper)/i)) { anchor = 'LEFT_TOP'; }
	else if (anchor.match(/(right.*center|center.*right)/i)) { anchor = 'RIGHT_CENTER'; }
	else if (anchor.match(/(left.*center|center.*left)/i)) { anchor = 'LEFT_CENTER'; }
	else if (anchor.match(/(bottom.*center|center.*bottom)/i)) { anchor = 'BOTTOM_CENTER'; }
	else if (anchor.match(/(center)/i)) { anchor = 'TOP_CENTER'; }
	else { anchor = 'LEFT_TOP'; }
	if (margin) {
		controlDiv.style.marginLeft = parseFloat(margin.left)+'px';
		controlDiv.style.marginRight = parseFloat(margin.right)+'px';
		controlDiv.style.marginTop = parseFloat(margin.top)+'px';
		controlDiv.style.marginBottom = parseFloat(margin.bottom)+'px';
	}
	// controlDiv.style.display.top = '';
	// controlDiv.style.display.left = '';
	controlDiv.style.display = 'block';
	controlDiv.style.visibility = 'hidden';
	controlDiv.index = i;
	anchor = google.maps.ControlPosition[anchor];
	gmap.controls[anchor].push(controlDiv);
}

function GV_Place_Draggable_Box(id,position,draggable,collapsible) {
	// the DIVs are as follows: container_id->table_id->(handle_id+id)
	if (!id || !position) { return false; }
	var container_id = id+'_container'; var table_id = id+'_table'; var handle_id = id+'_handle';
	if ($(container_id) && position && position.length >= 3) {
		var anchor = position[0].toString(); var x = position[1]; var y = position[2];
		if (anchor.match(/bottom.*right|right.*bottom/i)) { anchor = 'RIGHT_BOTTOM'; }
		else if (anchor.match(/bottom.*left|left.*bottom/i)) { anchor = 'LEFT_BOTTOM'; }
		else if (anchor.match(/top.*right|right.*top/i)) { anchor = 'RIGHT_TOP'; }
		else if (anchor.match(/bottom.*center|center.*bottom/i)) { anchor = 'CENTER_BOTTOM'; }
		else if (anchor.match(/center/i)) { anchor = 'CENTER_TOP'; }
		else { anchor = ''; } // default is LEFT_TOP
		
		if ($(container_id)) { $(container_id).style.display = 'none'; } // hide it before moving it around
		var box = $(container_id).cloneNode(true);
		GV_Delete(container_id);
		box.id = container_id;
		gmap.getDiv().appendChild(box);
		
		if ($(table_id) && $(handle_id) && (draggable !== false || collapsible !== false)) {
			var vertical_offset = 4000; // so that the container doesn't interfere with dragging the map
			$(table_id).style.top = '-'+vertical_offset+'px';
			y = (anchor.match(/bottom/i)) ? y-vertical_offset : y+vertical_offset;
			GV_Place_Div(container_id,x,y,anchor,true);
			if (draggable !== false) {
				if (GV_Drag) { GV_Drag.init($(handle_id),$(table_id)); }
			}
			if (collapsible !== false) {
				GV_Windowshade_Setup(handle_id,id);
			}
		} else {
			GV_Place_Div(container_id,x,y,anchor);
			if ($(handle_id)) { GV_Delete(handle_id); }
		}
		if ($(container_id)) { $(container_id).style.display = 'block'; } // just making sure
	}
}

function GV_Build_And_Place_Draggable_Box(opts) {
	// the DIVs are as follows: container_id->table_id->(handle_id+id)
	if (!self.gmap || (!opts.base_id && !opts.id) || !opts.position) { return false; }
	var id = (opts.base_id) ? opts.base_id : opts.id;
	var container_id = id+'_container'; var table_id = id+'_table'; var handle_id = id+'_handle';
	var contents_div; 
	var max_width = gmap.getDiv().clientWidth - 20; // keep a very wide list from expanding beyond the screen
	max_width -= (opts.position.length && opts.position[1]) ? opts.position[1] : 0;
	max_width = (opts.max_width && parseFloat(opts.max_width) < max_width) ? parseFloat(opts.max_width) : max_width;
	var max_height = gmap.getDiv().clientHeight - 50; // keep a very tall list from expanding beyond the screen
	max_height -= (opts.position.length && opts.position[2]) ? opts.position[2]+15 : 15;
	max_height = (opts.max_height && parseFloat(opts.max_height) < max_height) ? parseFloat(opts.max_height) : max_height;
	var min_width = (typeof(opts.min_width) != 'undefined') ? parseFloat(opts.min_width) : null;
	var min_height = (typeof(opts.min_height) != 'undefined') ? parseFloat(opts.min_height) : null;
	if ($(id) && $(container_id) && $(table_id) && $(handle_id)) { // ALL the parts exist already
		if (opts.width) { $(id).style.width = (opts.width.toString().match(/px|%/)) ? opts.width : opts.width+'px'; }
		if (opts.height) { $(id).style.minHeight = (opts.height.toString().match(/px|%/)) ? opts.height : opts.height+'px'; }
		if (!$(id).style.maxWidth) { $(id).style.maxWidth = max_width + 'px'; }
		if (!$(id).style.maxHeight) { $(id).style.maxHeight = max_height + 'px'; }
		if (min_width && !$(id).style.minWidth) { $(id).style.minWidth = min_width + 'px'; }
		if (min_height && !$(id).style.minHeight) { $(id).style.minHeight = min_height + 'px'; }
	} else {
		if ($(id)) { // the contents div exists, anyway
			contents_div = $(id).cloneNode(true);
		} else { // NOTHING exists yet
			contents_div = document.createElement('div');
			contents_div.id = id;
			if (opts.overflow !== false) { contents_div.style.overflow = 'auto'; }
			if (opts.class_name) { contents_div.className = opts.class_name; }
		}
		if (opts.html) { contents_div.innerHTML = opts.html; }
		if ($(container_id)) { GV_Delete(container_id); }
		if ($(table_id)) { GV_Delete(table_id); }
		if ($(handle_id)) { GV_Delete(handle_id); }
		if ($(id)) { GV_Delete(id); }
		
		if (!contents_div.style.maxWidth) { contents_div.style.maxWidth = max_width + 'px'; }
		if (!contents_div.style.maxHeight) { contents_div.style.maxHeight = max_height + 'px'; }
		if (min_width && !contents_div.style.minWidth) { contents_div.style.minWidth = min_width + 'px'; }
		if (min_height && !contents_div.style.minHeight) { contents_div.style.minHeight = min_height + 'px'; }
		contents_div.style.display = 'block';
		
		var container_div = document.createElement('div'); container_div.id = container_id;
		container_div.style.display = 'none';
		var table_div = document.createElement('table'); table_div.id = table_id;
		table_div.cellPadding = 0; table_div.cellSpacing = 0;
		table_div.className = 'gv_floating_box';
		// var csstext = 'position:relative; background-color:#ffffff; ';
		var csstext = 'position:relative; ';
		if (gv_options && gv_options.floating_box_opacity) {
			var op = (gv_options.floating_box_opacity > 1) ? gv_options.floating_box_opacity/100 : gv_options.floating_box_opacity;
			csstext += 'position:relative; background-color:#ffffff; '+'filter:alpha(opacity='+(op*100)+'); -moz-opacity:'+op+'; -khtml-opacity:'+op+'; opacity:'+op+';';
		}
		table_div.style.cssText = csstext;
		var table_row = document.createElement('tr');
		var table_cell = document.createElement('td');
		var handle_div = document.createElement('div'); handle_div.id = handle_id;
		handle_div.className = (gvg.mobile_browser) ? 'gv_windowshade_handle_mobile' : 'gv_windowshade_handle';
		handle_div.innerHTML = (gvg.mobile_browser && opts.collapsible !== false) ? '<p style="margin:0px; padding:0px; position:relative; top:-1px;">[click to collapse]</p>' : '<!-- -->';
		if (!gvg.mobile_browser) {
			handle_div.title = (opts.collapsible !== false) ? 'drag to move, double-click to collapse/expand' : 'drag to move';
		}
		
		table_cell.appendChild(handle_div);
		table_cell.appendChild(contents_div);
		table_row.appendChild(table_cell);
		table_div.appendChild(table_row);
		container_div.appendChild(table_div);
		gmap.getDiv().appendChild(container_div);
	}
	GV_Place_Draggable_Box(id,opts.position,opts.draggable,opts.collapsible);
}

function GV_Windowshade_Setup(handle_id,box_id) {
	if ($(handle_id) && $(box_id)) {
		var trigger = (gvg.mobile_browser) ? 'click' : 'dblclick';
		google.maps.event.addDomListener($(handle_id), trigger, function(){
			GV_Windowshade_Toggle(handle_id,box_id);
		});
	}
}
function GV_Windowshade_Toggle(handle_id,box_id,force_collapse) {
	if ($(box_id).style.visibility == 'hidden' && !force_collapse) {
		$(box_id).style.visibility = 'visible';
		$(box_id).style.display = 'block';
		if (self.gmap && gmap.getDiv()) { // if un-collapsing would put the handle off the screen, bring it down
			var handle_y = getAbsolutePosition($(handle_id)).y - getAbsolutePosition(gmap.getDiv()).y;
			if (handle_y < 0) {
				var table_id = box_id+'_table';
				if ($(table_id) && $(table_id).style && $(table_id).style.top) {
					$(table_id).style.top = (parseFloat($(table_id).style.top)-handle_y) + 'px';
				}
			}
		}
		$(handle_id).innerHTML = $(handle_id).innerHTML.replace(/click to expand/,'click to collapse');
		$(handle_id).style.width = ($(box_id).parentNode.clientWidth-2)+'px'; // -2 for the border
	} else {
		$(handle_id).innerHTML = $(handle_id).innerHTML.replace(/click to collapse/,'click to expand');
		if ($(handle_id).innerHTML.match(/click/)) { $(handle_id).style.width = ''; } else { $(handle_id).style.width = ($(box_id).parentNode.clientWidth-2)+'px'; } // -2 for the border
		$(box_id).style.visibility = 'hidden';
		$(box_id).style.display = 'none';
	}	
}

function GV_Set_Map_Type(id) {
//GV_Debug("------GV_Set_Map_Type("+id+")");
	var previous_map_type = gvg.current_map_type;
	if (!id) { id = gvg.current_map_type; }
	var map_id = gvg.bg[id]; // resolved from aliases
//GV_Debug("map_id = "+map_id);
	
//GV_Debug('in GV_Set_Map_Type, map_id = '+map_id);
	if (!gvg.background_maps_hash[map_id]) { return false; }
	var mapinfo = gvg.background_maps_hash[map_id];
	if (gmap.getZoom() < mapinfo.min_zoom) { gmap.setZoom(mapinfo.min_zoom); }
	
	var bgc = (gv_options.background_color) ? gv_options.background_color : '#ffffff';
	gmap.getDiv().style.backgroundColor = bgc;
	gmap.overlayMapTypes.clear();
	
	if (gvg.google_map_styles && (map_id == google.maps.MapTypeId.ROADMAP || map_id == google.maps.MapTypeId.SATELLITE || map_id == google.maps.MapTypeId.HYBRID || map_id == google.maps.MapTypeId.TERRAIN)) {
		if (gvg.google_map_styles[map_id]) {
			gmap.setOptions({styles:gvg.google_map_styles[map_id]});
		} else {
			gmap.setOptions({styles:null});
		}
	}
	
	GV_Redefine_Map(map_id);
	
	if (mapinfo.background && gvg.bg[mapinfo.background]) { // .background exists
		var background_id = gvg.bg[mapinfo.background];
		GV_Redefine_Map(background_id);
		gmap.setMapTypeId(background_id); // tell the map to use the background as the "real" map type
		for (var u=0; u<mapinfo.url_count; u++) { // add ALL layers from the current map type
			gmap.overlayMapTypes.push(gvg.overlay_map_types[map_id][u]);
		}
	} else { // no .background
		gmap.setMapTypeId(map_id);
		if (mapinfo.url_count > 1) { // add all layers except the very first, which was set as the official map type
			for (var u=1; u<mapinfo.url_count; u++) {
				gmap.overlayMapTypes.push(gvg.overlay_map_types[map_id][u]);
			}
		}
	}
	if (mapinfo.foreground && gvg.bg[mapinfo.foreground]) {
		var foreground_id = gvg.bg[mapinfo.foreground];
		GV_Redefine_Map(foreground_id);
		for (var u=0; u<gvg.background_maps_hash[foreground_id].url_count; u++) { // add ALL layers from the foreground map type
			if (mapinfo.foreground_opacity) {
				gvg.overlay_map_types[foreground_id][u].setOpacity(parseFloat(mapinfo.foreground_opacity));
			}
			gmap.overlayMapTypes.push(gvg.overlay_map_types[foreground_id][u]);
		}
	}
	GV_Show_Map_Copyright(map_id);
	var sels = ['gv_maptype_selector','gv_maptype_selector2'];
	for (var s=0; s<sels.length; s++) {
		var sel = $(sels[s]);
		if (sel && sel.length && sel.options) {
			for (var i=0; i<sel.length; i++) {
				if (sel[i].value != '' && sel[i].value.toUpperCase() == map_id.toUpperCase()) {
					sel.selectedIndex = i;
				}
			}
		}
	}
	gvg.current_map_type = map_id;
	gvg.current_map_min_zoom = mapinfo.min_zoom;
	gvg.current_map_max_zoom = mapinfo.max_zoom;
	
	if (id != previous_map_type) { GV_Reset_Zoom_Control(); }
	
	// Per Google's ToS, Street View is only available on a Google background
	if (map_id == google.maps.MapTypeId.ROADMAP || map_id == google.maps.MapTypeId.SATELLITE || map_id == google.maps.MapTypeId.HYBRID || map_id == google.maps.MapTypeId.TERRAIN) {
		if (gv_options.street_view) { gmap.setOptions({streetViewControl:true}); }
		else { gmap.setOptions({streetViewControl:false}); }
	} else {
		gmap.setOptions({streetViewControl:false});
	}
	
}
function GV_Show_Map_Copyright(mid) {
	if (!$('gv_map_copyright')) { return false; }
	gvg.map_copyright = (gvg.background_maps_hash[mid] && gvg.background_maps_hash[mid].credit) ? gvg.background_maps_hash[mid].credit : '';
	$('gv_map_copyright').innerHTML = gvg.map_copyright;
	if (gvg.map_copyright) {
		$('gv_map_copyright').parentNode.style.display = 'block';
	} else {
		$('gv_map_copyright').parentNode.style.display = 'none';
	}
}
function GV_MapTypeControl(placement,add_help_link) {
	var o = gv_options.map_type_control;
	var mtc_div = document.createElement('div');
	  mtc_div.id = (placement == 'map') ? 'gv_maptype_control' : 'gv_maptype_control2';
	var selector_id = (placement == 'map') ? 'maptypecontrol_selector' : 'maptypecontrol_selector2';
	var current_maptype_id = gvg.bg[ gvg.current_map_type ];
	if (gvg[selector_id]) { // if it's already been created before, don't rebuild it; just select the proper map type
		for (var j=0; j<gvg[selector_id].children.length; j++) {
			if (current_maptype_id == gvg.bg[ gvg[selector_id].children[j].value ]) { gvg[selector_id].selectedIndex = j; j = 99999; }
		}
	} else {
		var selector = document.createElement("select");
		  selector.id = (placement == 'map') ? 'gv_maptype_selector' : 'gv_maptype_selector2';
		  selector.title = "Choose a background map";
		  selector.style.font = '10px Verdana';
		  selector.style.backgroundColor = '#ffffff';
		var excluded_ids = []; var excluded_count = 0;
		if (o.excluded && o.excluded.length) {
			for (var i=0; i<o.excluded.length; i++) { excluded_ids[ gvg.bg[o.excluded[i]] ] = excluded_count++; }
		}
		var included_ids = []; var included_count = 0;
		if (o.included && o.included.length) {
			for (var i=0; i<o.included.length; i++) { included_ids[ gvg.bg[o.included[i]] ] = included_count++; }
		}
		var sorted_maps = [];
		for (var j=0; j<gvg.background_maps.length; j++) {
			if (gvg.background_maps[j]) {
				sorted_maps.push( CloneArray(gvg.background_maps[j]) );
			}
		}
		
		for (var j=0; j<sorted_maps.length; j++) {
			var m = sorted_maps[j];
			var normalized_id = gvg.bg[ m.id ];
			if (normalized_id == current_maptype_id && m && !m.menu_order) { m.menu_order = 999999; } // in case the map type was set via the URL or something
			else if (included_ids[normalized_id] && !m.menu_order) { m.menu_order = 999999+(included_ids[normalized_id]/1000); }
		}
		sorted_maps = sorted_maps.sort(function(a,b){return a.menu_order-b.menu_order});
		
		for (var j=0; j<sorted_maps.length; j++) {
			var m = sorted_maps[j];
			var normalized_id = gvg.bg[ m.id ];
			var map_ok = (included_count > 0) ? false : true; // the presence of an 'included' list eliminates all other choices
			if (m.menu_order == 0) { map_ok = false; }
			if (included_ids[normalized_id]) { map_ok = true; }
			if (excluded_ids[normalized_id]) { map_ok = false; }
			if (o.country && m.country && m.country.toString().indexOf(o.country) < 0) { map_ok = false; }
			if (map_ok && o.filter && gmap.getCenter && m.bounds && m.bounds.length >= 4) {
				var b = m.bounds;
				var lat = gmap.getCenter().lat(); var lng = gmap.getCenter().lng();
				map_ok = (lng >= b[0] && lng <= b[2] && lat >= b[1] && lat <= b[3]) ? true : false;
			}
			if (map_ok && m.bounds_subtract && m.bounds_subtract.length >= 4) {
				var bs = m.bounds_subtract;
				if (lng >= bs[0] && lng <= bs[2] && lat >= bs[1] && lat <= bs[3]) { map_ok = false; }
			}
			if (map_ok) {
				var opt = document.createElement('option');
				opt.value = normalized_id;
				if (m.no_key) { opt.disabled = true; }
				opt.innerHTML = m.menu_name;
				selector.appendChild(opt);
				if (current_maptype_id == gvg.bg[ normalized_id ]) { selector.selectedIndex = selector.length-1; }
			}
		}
		gmap.overlayMapTypes.setAt(0,null); // init the array
		gvg.overlay_count = 0;
		google.maps.event.addDomListener(selector,"change",function(){ GV_Set_Map_Type(this.value); });
		gvg[selector_id] = selector;
	}
	mtc_div.appendChild( gvg[selector_id] );
	if (add_help_link) {
		var help_link = document.createElement("span");
		help_link.id = 'gv_maptype_helplink';
		help_link.innerHTML = '<a target="maptype_help" href="https://www.gpsvisualizer.com/misc/google_map_types.html"><img src="'+gvg.embedded_images['help']+'" width="9" height="12" align="absmiddle" border="0" alt="" style="cursor:help; margin-left:2px;"></a>';
		mtc_div.appendChild(help_link);
	}
	return mtc_div;
}
function GV_MapOpacityControl(opacity,placement) {
	var oc_div = document.createElement('div');
	  oc_div.id = (placement == 'utilities') ? 'gv_opacity_control2' : 'gv_opacity_control';
	var selector = document.createElement("select");
	  selector.id = (placement == 'utilities') ? 'gv_opacity_selector2' : 'gv_opacity_selector';
	  selector.title = "Adjust the background map's opacity";
	  selector.style.font = '10px Verdana';
	  selector.style.backgroundColor = '#ffffff';
	if (placement != 'utilities') {
		var opt = document.createElement('option'); opt.value = '1'; opt.appendChild(document.createTextNode('opacity')); selector.appendChild(opt);
	}
	for (var j=10; j>=0; j--) {
		var opt = document.createElement('option'); opt.value = j / 10; opt.appendChild(document.createTextNode(j*10 + '%'));
		selector.appendChild(opt);
		if (opt.value != '' && opt.value == Math.round(100*opacity)/100) { selector.selectedIndex = selector.length-1; }
	}
	google.maps.event.addDomListener(selector,'change',function(){ GV_Background_Opacity(this.value); });
	oc_div.appendChild(selector);
	return oc_div;
}
function GV_Zoom_Control(size) {
//GV_Debug("------GV_Zoom_Control("+size+")");
	var z = gmap.getZoom(); var mapinfo = gvg.background_maps_hash[gvg.current_map_type];
	var zmin = mapinfo.min_zoom; var min_bar = zmin;
	var zmax = mapinfo.max_zoom; var max_bar = zmax;
	if (mapinfo.url) { // not a built-in Google type
		// min_bar = (zmin > gvg.zoom_minimum) ? zmin-1 : gvg.zoom_minimum; if (min_bar == 0 && zmin == 1) { min_bar = 1; }
		min_bar = zmin;
		max_bar = gvg.zoom_maximum;
	}
	// overzoom:
	gvg.tile_enlargement = 1; if (z > zmax) { gvg.tile_enlargement = Math.pow(2,z-zmax); } else if (z < zmin) { gvg.tile_enlargement = Math.pow(2,z-zmin); }
	
	var zc_contents = document.createElement('div'); zc_contents.id = 'gv_zoom_control_elements';
	zc_contents.className = 'gv_zoom_control_contents'; if (gvg.mobile_browser) { zc_contents.className += 'gv_zoom_control_contents_mobile'; }
	if ((size == 'large' && gv_options.recenter_button !== false) || (size == 'small' && gv_options.recenter_button === true)) {
		zc_contents.innerHTML += '<div class="gv_zoom_button '+(gvg.mobile_browser ? 'gv_zoom_button_mobile' : '')+'" style="margin-bottom:'+(size == 'small' ? '4' : '8')+'px; border-radius:13px; background-image:url('+gvg.embedded_images['recenter']+'); background-repeat:no-repeat; background-position:center;" onclick="if(gmap.returnToSavedPosition){gmap.returnToSavedPosition();}" title="re-center the map"><!-- --></div>'; // 4 arrows
	}
	zc_contents.innerHTML += '<div class="gv_zoom_button '+(gvg.mobile_browser ? 'gv_zoom_button_mobile' : '')+'" style="margin-bottom:3px; background-image:url('+gvg.embedded_images['zoom_in']+'); background-repeat:no-repeat; background-position:center;" onclick="gmap.zoomIn();"><!-- --></div>';
	if (size == 'large') { // large custom control
		var container_mobile = (gvg.mobile_browser) ? 'gv_zoom_bar_container_mobile' : '';
		var mobile_bar_class = (gvg.mobile_browser) ? 'gv_zoom_bar_mobile ' : '';
		for(var i=gvg.zoom_maximum; i>=gvg.zoom_minimum; i--) {
			var disp = (i >= min_bar && i <= max_bar) ? 'block' : 'none';
			var this_bar_class = 'gv_zoom_bar '+mobile_bar_class;
			this_bar_class += (i < zmin || i > zmax) ? ' gv_zoom_bar_overzoom ' : '';
			this_bar_class += (i == z) ? ' gv_zoom_bar_selected ' : '';
			zc_contents.innerHTML += '<div id="gv_zoom_bar_container['+i+']" class="gv_zoom_bar_container '+container_mobile+'" style="display:'+disp+'" onclick="gmap.setZoom('+i+');" title="zoom='+i+'"><div id="gv_zoom_bar['+i+']" class="'+this_bar_class+'"><!-- --></div></div>';
		}
	}
	zc_contents.innerHTML += '<div class="gv_zoom_button '+(gvg.mobile_browser ? 'gv_zoom_button_mobile' : '')+'" style="margin-top:2px; background-image:url('+gvg.embedded_images['zoom_out']+'); background-repeat:no-repeat; background-position:center;" onclick="gmap.zoomOut();"><!-- --></div>';
	if (gv_options.geolocation_control && gvg.geolocation_ok) {
		zc_contents.innerHTML += '<div class="gv_geolocation_button '+(gvg.mobile_browser ? 'gv_geolocation_button_mobile' : '')+'" style="background-image:url('+gvg.embedded_images['geolocate']+'); background-repeat:no-repeat; background-position:center;" onclick="GV_Geolocate();" title="Show your current position"><!-- --></div>';
	}
	var zc_div = document.createElement('div');
	zc_div.id = 'gv_zoom_control';
	zc_div.appendChild(zc_contents);
	return zc_div;
}
function GV_Reset_Zoom_Control() {
//GV_Debug("------GV_Reset_Zoom_Control()");
	var z = gmap.getZoom(); var mapinfo = gvg.background_maps_hash[gvg.current_map_type];
//GV_Debug("new zoom level = "+z);
	if (z < gvg.zoom_minimum || z > gvg.zoom_maximum) { return false; }
	var zmin = mapinfo.min_zoom; var min_bar = zmin;
	var zmax = mapinfo.max_zoom; var max_bar = zmax;
	if (mapinfo.url) { // not a built-in Google type
		// min_bar = (zmin > gvg.zoom_minimum) ? zmin-1 : gvg.zoom_minimum; if (min_bar == 0 && zmin == 1) { min_bar = 1; }
		min_bar = zmin;
		if (!mapinfo.tile_function || mapinfo.tile_function.indexOf('quadkey') < 0) {
			max_bar = gvg.zoom_maximum;
		}
	}
	if (z<min_bar) { gmap.setZoom(min_bar); return false; }
	else if (z>max_bar) { gmap.setZoom(max_bar); return false; }
	
	// overzoom:
	var previous_enlargement = gvg.tile_enlargement;
	gvg.tile_enlargement = 1; if (z > zmax) { gvg.tile_enlargement = Math.pow(2,z-zmax); } else if (z < zmin) { gvg.tile_enlargement = Math.pow(2,z-zmin); }
//GV_Debug("previous_enlargement = "+previous_enlargement+", gvg.tile_enlargement = "+gvg.tile_enlargement);
	
	var mobile_bar_class = (gvg.mobile_browser) ? 'gv_zoom_bar_mobile ' : '';
	for(var i=gvg.zoom_maximum; i>=gvg.zoom_minimum; i--) {
		if ($('gv_zoom_bar_container['+i+']')) {
			if ($('gv_zoom_bar_container['+i+']').style) { $('gv_zoom_bar_container['+i+']').style.display = (i >= min_bar && i <= max_bar) ? 'block' : 'none'; }
			if ($('gv_zoom_bar['+i+']')) {
				var this_bar_class = 'gv_zoom_bar '+mobile_bar_class;
				this_bar_class += (i < zmin || i > zmax) ? ' gv_zoom_bar_overzoom ' : '';
				this_bar_class += (i == z) ? ' gv_zoom_bar_selected ' : '';
				$('gv_zoom_bar['+i+']').className = this_bar_class;
			}
		}
	}
	if (gvg.tile_enlargement != 1 || previous_enlargement != gvg.tile_enlargement) {
//GV_Debug("About to call GV_Set_Map_Type() from within GV_Reset_Zoom_Control");
		GV_Set_Map_Type();
	}
}

function GV_Background_Opacity(opacity) {
	if (opacity == null || typeof('opacity') == 'undefined') {
		if (gvg.bg_opacity == null || typeof(gvg.bg_opacity) == 'undefined') { return; }
		else { opacity = gvg.bg_opacity; }
	}
	if (opacity <= 0) { opacity = 0; }
	else if (opacity > 1) { opacity = opacity/100; }
	gvg.bg_opacity = parseFloat(opacity); // this is a global and absolutely necessary for the "idle" and "maptypeid_changed" listeners
	gvg.screen_opacity = parseFloat(1-opacity).toFixed(2)*1;
	
	if (gvg.opacity_screen_object && gvg.opacity_screen_object.getMap()) {
		gvg.opacity_screen_object.screen_opacity_ = gvg.screen_opacity;
		gvg.opacity_screen_object.draw(gvg.screen_opacity); // it already exists, so just redraw it
	} else {
		gvg.opacity_screen_object = new GV_Opacity_Screen(gvg.screen_opacity); // make a new one
	}
	var sels = ['gv_opacity_selector','gv_opacity_selector2'];
	for (var s=0; s<sels.length; s++) {
		var sel = $(sels[s]);
		if (sel && sel.length && sel.options) {
			var si = -1;
			for (var i=0; i<sel.length; i++) { if (gvg.bg_opacity == parseFloat(sel.options[i].value)) { si = i; } }
			if (si > -1) { sel.selectedIndex = si; }
		}
	}
}

class GV_Opacity_Screen extends google.maps.OverlayView {
	constructor(scr_op) {
		super();
		this.screen_opacity_ = scr_op;
		this.div_ = null;
		this.useOpacity = (typeof document.createElement("div").style.opacity != 'undefined');
		this.useFilter = !this.useOpacity && (typeof document.createElement("div").style.filter != 'undefined');
		this.setMap(gmap);
	}
	onAdd() {
		var screen = document.createElement("div");
		screen.id = 'gv_opacity_screen_div';
		screen.className = 'gv_opacity_screen';
		screen.style.position = 'absolute';
		this.div_ = screen; // Set the overlay's div_ property to this DIV
		this.getPanes().mapPane.appendChild(screen);
	};
	draw(op) {
		if (typeof(op) == 'undefined') { op = this.screen_opacity_; }
		
		// Position the overlay and resize it to be 3x bigger than the map
		var wd = this.getMap().getDiv().clientWidth;
		var ht = this.getMap().getDiv().clientHeight;
		var overlay_projection = this.getProjection();
		var overlay_bounds = this.getMap().getBounds();
		if (!overlay_projection) { return false; }
		var sw = overlay_projection.fromLatLngToDivPixel(overlay_bounds.getSouthWest());
		var ne = overlay_projection.fromLatLngToDivPixel(overlay_bounds.getNorthEast());
		if (ne.x-sw.x+1 < wd) { ne.x += wd; } // IDL wraparound problems
		
		// Resize the screen's DIV to be 3x the size of the map
		var div = this.div_;
		if (div) {
			div.style.display = (op == 0) ? 'none' : 'block'; // in case the browser has issues with transparency/opacity
			if (this.useOpacity) { div.style.opacity = op; }
			//if (this.useFilter) { div.style.filter = "alpha(opacity="+op*100+")"; }
			//div.style.KhtmlOpacity = op;
			//div.style.MozOpacity = op;
			div.style.left = (sw.x-wd)+'px';
			div.style.top = (ne.y-ht)+'px';
			div.style.width = 3*(ne.x-sw.x)+'px';
			div.style.height = 3*(sw.y-ne.y)+'px';
		}
	};
	onRemove() {
		this.div_.parentNode.removeChild(this.div_);
		this.div_ = null;
	};
}

function GV_Toggle_Scale_Units() {
	if (!self.gmap || !gmap.getDiv()) { return false; }
	var spans = gmap.getDiv().getElementsByTagName('span');
	var scale_pattern = /\d+\s+(m|km)/i;
	for (var i in spans) {
		if (scale_pattern.test(spans[i].innerHTML)) { spans[i].click(); return true; }
	}
}

gvg.crosshair_temporarily_hidden = true;
function GV_Show_Center_Coordinates(id) {
	var prec = (gv_options.center_coordinates_precision) ? (gv_options.center_coordinates_precision) : 5;
	if ($(id)) {
		var center = gmap.getCenter(); var lat = center.lat(); var lng = center.lng();
		lng = (lng > 180) ? lng-360 : ((lng < -180) ? lng+360 : lng);
		$(id).innerHTML = 'Center: <span id="gv_center_coordinate_pair" ondblclick="SelectText(\'gv_center_coordinate_pair\')">'+lat.toFixed(prec)+','+lng.toFixed(prec)+'</span>';
	}
	gvg.last_center = gmap.getCenter(); // this will come in handy; make sure it happens AFTER the crosshair is potentially unhidden
}
function GV_Setup_Crosshair(opts) {
	if (!opts.container_id) { opts.container_id = 'gv_crosshair_container'; }
	if (!opts.size) { opts.size = 15; }
	if (!opts.center_coordinates_id) { opts.center_coordinates_id = 'gv_center_coordinates'; }
	
	GV_Recenter_Crosshair(opts.container_id,opts.size);
	GV_Show_Center_Coordinates(opts.center_coordinates_id);
	google.maps.event.addListener(gmap, "idle", function() {
		GV_Show_Center_Coordinates(opts.center_coordinates_id);
	});
	google.maps.event.addListener(gmap, "resize", function() {
		GV_Recenter_Crosshair(opts.container_id,opts.size);
		GV_Show_Center_Coordinates(opts.center_coordinates_id);
	});
}
function GV_Show_Hidden_Crosshair(id) {
	// only do something upon the FIRST movement of the map, or when it's been hidden, e.g. because of a centering action
	if (gvg.crosshair_temporarily_hidden && (!gvg.last_center || gvg.last_center.lat() != gmap.getCenter().lat() || gvg.last_center.lng() != gmap.getCenter().lng())) {
		if (gvg.hidden_crosshair_is_still_hidden && gvg.hidden_crosshair_is_still_hidden == true) {
			// don't do anything
		} else {
			$(id).style.display = 'block';
			gvg.crosshair_temporarily_hidden = false;
		}
	}
}
function GV_Recenter_Crosshair(container_id,size) {
	if ($(container_id)) {
		var x = gmap.getDiv().clientWidth/2-(size/2)-0.5; // -n.n is based on trial and error
		var y = gmap.getDiv().clientHeight/2-(size/2)+0.5; // +n.n is based on trial and error
		GV_Place_Div(container_id,x,y);
	}
}
function GV_Utilities_Button() {
	var utilities_button = document.createElement('div'); utilities_button.id = 'gv_utilities_button';
	utilities_button.style.display = 'none'; utilities_button.style.padding = '0px';
	utilities_button.innerHTML = '<img src="'+gvg.embedded_images['utilities_button']+'" width="24" height="20" border="0" onclick="GV_Utilities_Menu(true);" style="cursor:context-menu;" title="click here for map utilities" />';
	gmap.getDiv().appendChild(utilities_button);
	gvg.utilities_control = new GV_Control(utilities_button,'TOP_RIGHT',{left:0,right:5,top:6,bottom:6},1);
}

function GV_Utilities_Menu(show) {
	if (show !== false) {
		if (typeof(gv_options.utilities_menu) != 'object') { gv_options.utilities_menu = { 'maptype':true, 'opacity':true, 'measure':true, 'export':true, 'geolocate':true, 'profile':true }; }
		var utilities_menu = document.createElement('div'); utilities_menu.id = 'gv_utilities_menu';
		utilities_menu.style.cssText = 'display:inline-block; max-width:225px; overflow:auto; position:absolute; z-index:999999; right:4px; top:5px; background-color:#ffffff; padding:0px; border:1px solid #006600; box-shadow:2px 2px 4px #666666;';
		var first_heading = (gv_options.utilities_menu['maptype'] || gv_options.utilities_menu['opacity']) ? 'MAP OPTIONS' : 'UTILITIES';
		if (!gvg.geolocation_ok) { gv_options.utilities_menu['geolocate'] = false; }
		var html = '';
		html += '	<div class="gv_utilities_menu_header" style="border-top:none;">';
		html += '	<table cellspacing="0" cellpadding="0" border="0" width="100%"><tr>';
		html += '		<td align="left" valign="top" style="font-size:8pt; color:#669966;">'+first_heading+'</td>';
		html += '		<td align="right" valign="top"><img src="'+gvg.embedded_images['close']+'" width="14" height="14" border="0" style="display:block; cursor:pointer; padding-left:10px;" onclick="GV_Utilities_Menu(false)" title="close this menu" /></td>';
		html += '	</tr></table>';
		html += '	</div>';
		if (gv_options.utilities_menu['maptype'] !== false) {
			html += '	<div class="gv_utilities_menu_item" id="gv_utilities_menu_maptype"><img src="'+gvg.embedded_images['utilities-maptype']+'" width="15" height="15" border="0" onclick="$(\'gv_maptype_selector2\').focus();" title="Background map" />';
			html += '</div>';
		}
		if (gv_options.utilities_menu['opacity'] !== false) {
			html += '	<div class="gv_utilities_menu_item" id="gv_utilities_menu_opacity"><img src="'+gvg.embedded_images['utilities-opacity']+'" width="15" height="15" border="0" title="Background opacity" /><span onclick="$(\'gv_opacity_selector2\').focus();">Background opacity:</span> ';
			html += '</div>';
		}
		if (gv_options.utilities_menu['measure'] !== false || gv_options.utilities_menu['export'] !== false || gv_options.utilities_menu['geolocate'] !== false || 1==1) {
			if (first_heading != 'UTILITIES') {
				html += '	<div class="gv_utilities_menu_header" style="background-color:#cceecc; font-size:8pt; color:#669966;">UTILITIES</div>';
			}
			if (gv_options.utilities_menu['profile'] !== false && gvg.profile_data) {
				html += '	<div class="gv_utilities_menu_item" id="gv_utilities_menu_profile"><a href="javascript:void(0)" onclick="GV_Draw_Elevation_Profile(); GV_Utilities_Menu(false);"><img src="'+gvg.embedded_images['utilities-profile']+'" width="15" height="15" border="0" />Draw an elevation profile</a></div>';
			}
			if (gv_options.utilities_menu['geolocate'] !== false) {
				html += '	<div class="gv_utilities_menu_item" id="gv_utilities_menu_geolocate"><a href="javascript:void(0)" onclick="GV_Geolocate(); GV_Utilities_Menu(false);"><img src="'+gvg.embedded_images['utilities-geolocate']+'" width="15" height="15" border="0" />Show your current position</a></div>';
			}
			if (gv_options.utilities_menu['measure'] !== false) {
				html += '	<div class="gv_utilities_menu_item" id="gv_utilities_menu_measure"><a href="javascript:void(0)" onclick="GV_Place_Measurement_Tools(\'distance\'); GV_Utilities_Menu(false);"><img src="'+gvg.embedded_images['utilities-measure']+'" width="15" height="15" border="0" />Measure distance/area</a></div>';
			}
			if (gv_options.utilities_menu['export'] !== false) {
				if (gv_options.allow_export) {
					html += '	<div class="gv_utilities_menu_item" id="gv_utilities_menu_export"><a href="javascript:void(0)" onclick="GV_Export_Data_From_Map(); GV_Utilities_Menu(false);"><img src="'+gvg.embedded_images['utilities-export']+'" width="15" height="15" border="0" />Export selected map data...</a></div>';
				} else {
					html += '	<div class="gv_utilities_menu_item" id="gv_utilities_menu_export" title="The allow_export option is not enabled in this map" style="color:#ccddcc"><img src="'+gvg.embedded_images['utilities-export-disabled']+'" width="15" height="15" border="0" />Export selected map data...</div>';
				}
			}
		}
		html += '	<div class="gv_utilities_menu_item" style="padding-top:12px"><a target="_blank" href="https://www.gpsvisualizer.com/about.html"><img src="'+gvg.embedded_images['utilities-about']+'" width="15" height="15" border="0" />About GPS Visualizer</a></div>';
		utilities_menu.innerHTML = html;
		gmap.getDiv().appendChild(utilities_menu);
		
		if (gv_options.utilities_menu['maptype'] !== false && $('gv_utilities_menu_maptype')) {
			var mtc_div = GV_MapTypeControl('utilities',true);
			mtc_div.style.display = 'inline-block';
			$('gv_utilities_menu_maptype').appendChild(mtc_div);
		}
		if (gv_options.utilities_menu['opacity'] !== false && $('gv_utilities_menu_opacity')) {
			var oc_div = GV_MapOpacityControl(gvg.bg_opacity,'utilities');
			oc_div.style.display = 'inline-block';
			$('gv_utilities_menu_opacity').appendChild(oc_div);
		}
		
		GV_EscapeKey('gv_utilities_menu');
	} else {
		if ($('gv_utilities_menu')) {
			GV_Delete('gv_utilities_menu');
		}
	}
}

function GV_Place_Measurement_Tools(new_measurement) {
	var op = [];
	if (gv_options.measurement_tools && typeof(gv_options.measurement_tools) == 'object') { op = gv_options.measurement_tools; }
	else if (gv_options.measurement_options && typeof(gv_options.measurement_options) == 'object') { op = gv_options.measurement_options; }
	op.distance = (op.distance === false) ? false : true;
	op.area = (op.area === false) ? false : true;
	if (!self.gmap || (!op.distance && !op.area)) { return false; }
	if ($('gv_measurement_container')) { return false; } // don't duplicate it!
	var distance_color = (op.distance_color) ? op.distance_color : '#0033ff';
	var area_color = (op.area_color) ? op.area_color : '#ff00ff';
	var measurement_div = document.createElement('div'); measurement_div.id = 'gv_measurement_tools';
	measurement_div.style.display = 'none';
	measurement_div.innerHTML = '<div id="gv_measurement_container" style="display:none;"><table id="gv_measurement_table" style="position:relative; filter:alpha(opacity=95); -moz-opacity:0.95; -khtml-opacity:0.95; opacity:0.95; background-color:#ffffff;" cellpadding="0" cellspacing="0" border="0"><tr><td><div id="gv_measurement_handle" align="center" style="height:6px; max-height:6px; background-color:#cccccc; border-left:1px solid #999999; border-top:1px solid #EEEEEE; border-right:1px solid #999999; padding:0px; cursor:move;"><!-- --></div><div id="gv_measurement" align="left" style="font:11px Arial; line-height:13px; border:solid #000000 1px; background-color:#ffffff; padding:4px;"></div></td></tr></table></div>';
	gmap.getDiv().appendChild(measurement_div);
	var html = '<div style="max-width:220px;">';
	html += '<table cellspacing="0" cellpadding="0"><tr valign="top"><td>';
	html += '<table cellspacing="0" cellpadding="0">';
	if (op.distance) {
		html += '<tr valign="top"><td style="padding-right:4px;"><img src="'+gvg.embedded_images['measure_distance']+'" align="absmiddle" width="16" height="16" alt=""></td><td style="font-family:Arial; font-weight:bold;" nowrap>Measure distance</td></tr>';
		html += '<tr valign="top"><td></td><td><div id="gv_measurement_result_distance" style="font-family:Arial; font-weight:bold; font-size:12px; padding-bottom:4px; color:'+distance_color+';"></div></td></tr>';
		html += '<tr valign="top"><td></td><td><div style="font-family:Arial;padding-bottom:12px;" id="gv_measurement_link_distance"></div></td></tr>';
	}
	if (op.area) {
		html += '<tr valign="top"><td style="padding-right:4px;"><img src="'+gvg.embedded_images['measure_area']+'" align="absmiddle" width="16" height="16" alt=""></td><td style="font-family:Arial;font-weight:bold;" nowrap>Measure area</td></tr>';
		html += '<tr valign="top"><td></td><td><div id="gv_measurement_result_area" style="font-family:Arial; font-weight:bold; font-size:12px; padding-bottom:4px; color:'+area_color+';"></div></td></tr>';
		html += '<tr valign="top"><td></td><td><div style="font-family:Arial; padding-bottom:0px;" id="gv_measurement_link_area"></div></td></tr>';
	}
	html += '</table>';
	html += '</td><td align="right" style="width:12px; padding-left:8px;">';
	html += '<img src="'+gvg.embedded_images['close']+'" width="14" height="14" border="0" style="cursor:pointer;" onclick="GV_Remove_Measurement_Tools();" title="cancel measurement and close this panel" />';
	html += '</td></tr></table>';
	html += '</div>';
	$('gv_measurement').innerHTML = html;
	
	GV_Measurements.Init({
		distance:{link:'gv_measurement_link_distance',result:'gv_measurement_result_distance',color:distance_color,width:2,opacity:1.0}
		,area:{link:'gv_measurement_link_area',result:'gv_measurement_result_area',color:area_color,width:2,opacity:1.0,fill_opacity:0.2}
	});
	
	var pos = (op.position && op.position.length >= 3) ? op.position : ['BOTTOM_LEFT',3,51];
	GV_Place_Draggable_Box('gv_measurement',pos,true,true);	
	if($('gv_measurement_container') && $('gv_measurement_icon')){
		$('gv_measurement_icon').style.display = 'none';
	}
	if (new_measurement == 'distance') { GV_Measurements.New('distance'); }
	else if (new_measurement == 'area') { GV_Measurements.New('area'); }
}
function GV_Remove_Measurement_Tools() {
	GV_Measurements.Cancel('area'); GV_Measurements.Delete('area');
	GV_Measurements.Cancel('distance'); GV_Measurements.Delete('distance');
	GV_Delete('gv_measurement_container');
 	if ($('gv_measurement_icon')) { $('gv_measurement_icon').style.display = 'block'; }
}
GV_Measurements = new function() {
	this.Overlay = [];
	this.Attributes = [];
	this.LinkBox = [];
	this.ResultBox = [];
	this.Listener = [];
	this.Length = [];
	this.Area = [];
	this.Text = {
		distance: {
			New:'<a href="javascript:void(0);" onclick="GV_Measurements.New(\'distance\');">Draw a line</a>',
			Cancel:'Click on the map to add points, right-click to delete points, or <a href="javascript:void(0);" onclick="GV_Measurements.Cancel(\'distance\');"><nobr>click here</nobr></a> to stop drawing',
			Edit:'<a href="javascript:void(0);" onclick="GV_Measurements.Edit(\'distance\');">Edit</a> the line, or <a href="javascript:void(0);" onclick="GV_Measurements.Delete(\'distance\');">delete</a> it'
		},
		area: {
			New:'<a href="javascript:void(0);" onclick="GV_Measurements.New(\'area\');">Draw a shape</a>',
			Cancel:'Click on the map to add points, right-click to delete points, or <a href="javascript:void(0);" onclick="GV_Measurements.Cancel(\'area\');"><nobr>click here</nobr></a> to stop drawing',
			Edit:'<a href="javascript:void(0);" onclick="GV_Measurements.Edit(\'area\');">Edit</a> the shape, or <a href="javascript:void(0);" onclick="GV_Measurements.Delete(\'area\');">delete</a> it'
		}
	};
	this.Init = function(info) {
		if ($(info.distance.link  )) { this.LinkBox.distance   = $(info.distance.link); this.LinkBox.distance.innerHTML = this.Text.distance.New; }
		if ($(info.distance.result)) { this.ResultBox.distance = $(info.distance.result); }
		if ($(info.area.link      )) { this.LinkBox.area       = $(info.area.link); this.LinkBox.area.innerHTML = this.Text.area.New; }
		if ($(info.area.result    )) { this.ResultBox.area     = $(info.area.result); }
		this.Attributes.distance = [];
		this.Attributes.distance.color = (info.distance && info.distance.color) ? info.distance.color : '#0033ff';
		this.Attributes.distance.width = (info.distance && info.distance.width) ? info.distance.width : 3;
		this.Attributes.distance.opacity = (info.distance && info.distance.opacity) ? info.distance.opacity : 1.0;
		this.Attributes.area = [];
		this.Attributes.area.color = (info.area && info.area.color) ? info.area.color : '#ff00ff';
		this.Attributes.area.width = (info.area && info.area.width) ? info.area.width : 2;
		this.Attributes.area.opacity = (info.area && info.area.opacity) ? info.area.opacity : 1.0;
		this.Attributes.area.fill_opacity = (info.area && info.area.fill_opacity) ? info.area.fill_opacity : 0.2;
	};
	this.New = function(key) { // key = 'area' or 'distance'
		gmap.setOptions({draggableCursor:'crosshair'});
		if (key == 'area') {
			this.Overlay[key] = new google.maps.Polygon({path:[],strokeColor:this.Attributes[key].color,strokeWeight:this.Attributes[key].width,strokeOpacity:this.Attributes[key].opacity,fillColor:this.Attributes[key].color,fillOpacity:this.Attributes[key].fill_opacity,clickable:true});
		} else {
			this.Overlay[key] = new google.maps.Polyline({path:[],strokeColor:this.Attributes[key].color,strokeWeight:this.Attributes[key].width,strokeOpacity:this.Attributes[key].opacity,clickable:true});
		}
		this.Overlay[key].setMap(gmap);
		this.Edit(key);
	};
	this.Edit = function(key) {
		gmap.setOptions({draggableCursor:'crosshair'});
		other_key = (key == 'area') ? 'distance' : 'area';
		if (this.Overlay[other_key]) { this.Cancel(other_key); }
		if (this.Listener['map_click']) { google.maps.event.removeListener(this.Listener['map_click']); }
		if (this.Listener['overlay_click']) { google.maps.event.removeListener(this.Listener['overlay_click']); }
		if (this.Listener['overlay_rightclick']) { google.maps.event.removeListener(this.Listener['overlay_rightclick']); }
		this.Listener['map_click'] = eval("google.maps.event.addListener(gmap,'click',function(click){ GV_Measurements.AddVertex(GV_Measurements.Overlay['"+key+"'],click,'"+key+"'); });");
		this.Listener['overlay_click'] = eval("google.maps.event.addListener(GV_Measurements.Overlay['"+key+"'],'click',function(click){ GV_Measurements.VertexClick(GV_Measurements.Overlay['"+key+"'],click,'"+key+"'); });");
		this.Listener['overlay_rightclick'] = eval("google.maps.event.addListener(GV_Measurements.Overlay['"+key+"'],'rightclick',function(click){ GV_Measurements.DeleteVertex(GV_Measurements.Overlay['"+key+"'],click,'"+key+"'); });");
		if (this.LinkBox[key]) { $(this.LinkBox[key].id).innerHTML = this.Text[key].Cancel; }
		eval("google.maps.event.addListener(GV_Measurements.Overlay['"+key+"'].getPath(),'insert_at',function(){ GV_Measurements.Calculate('"+key+"'); });");
		eval("google.maps.event.addListener(GV_Measurements.Overlay['"+key+"'].getPath(),'remove_at',function(){ GV_Measurements.Calculate('"+key+"'); });");
		eval("google.maps.event.addListener(GV_Measurements.Overlay['"+key+"'].getPath(),'set_at',function(){ GV_Measurements.Calculate('"+key+"'); });");
		this.Overlay[key].setOptions({editable:true,draggable:true,geodesic:true});
	};
	this.AddVertex = function(overlay,click,key) {
		if (overlay && overlay.getPath() && click && click.latLng) {
			overlay.getPath().push(click.latLng);
			overlay.setEditable(true);
			this.Calculate(key);
		}
	};
	this.DeleteVertex = function(overlay,click,key) {
		if (overlay && overlay.getPath() && click && click.latLng) {
			overlay.getPath().removeAt(click.vertex);
			overlay.setEditable(true);
			this.Calculate(key);
		}
	};
	this.VertexClick = function(overlay,click,key) {
		if (overlay && overlay.getPath() && click && click.latLng) {
			if (click.vertex == 0 || click.vertex == overlay.getPath().getLength()-1) { // a click on an endpoint
				this.Cancel(key);
			}
		}
	};
	this.Cancel = function(key) {
		gmap.setOptions({draggableCursor:null});
		if (this.Overlay[key]) {
			if (this.Overlay[key].getPath().getLength() == 0) { this.Delete(key); return false;}
			this.Overlay[key].setEditable(false);
			if (this.Listener['map_click']) { google.maps.event.removeListener(this.Listener['map_click']); }
			if (this.Listener['overlay_click']) { google.maps.event.removeListener(this.Listener['overlay_click']); }
			if (this.Listener['overlay_rightclick']) { google.maps.event.removeListener(this.Listener['overlay_rightclick']); }
		}
		if (this.LinkBox[key]) {
			$(this.LinkBox[key].id).innerHTML = this.Text[key].Edit;
		}
	};
	this.Delete = function(key) {
		if (this.Overlay[key]) { this.Overlay[key].setEditable(false); this.Overlay[key].setMap(null); }
 		this.Overlay[key] = null;
		if (this.LinkBox[key]) { $(this.LinkBox[key].id).innerHTML = this.Text[key].New; }
		if (this.ResultBox[key]) { $(this.ResultBox[key].id).innerHTML = ''; }
	};
	this.Calculate = function(key) {
		var result = '';
		if (this.Overlay[key] && this.Overlay[key].getPath().getLength() > 1) {
			if (key == 'distance') {
				var meters = 0;
				var vertex_count = this.Overlay[key].getPath().getLength();
				for(i=1; i<vertex_count; i++) {
					var segment_distance = google.maps.geometry.spherical.computeDistanceBetween(this.Overlay[key].getPath().getAt(i-1),this.Overlay[key].getPath().getAt(i));
					meters += segment_distance;
				}
				if (meters < 304.8) {
					result += meters.toFixed(0)+' m&nbsp; ('+(meters*3.28084).toFixed(0)+' ft.)';
				} else if (meters >= 304.8 && meters < 1000) {
					result += meters.toFixed(0)+' m&nbsp; ('+(meters/1609.344).toFixed(2)+' mi.)';
				} else if (meters >= 1000 && meters < 10000) {
					result += (meters/1000).toFixed(2)+' km&nbsp; ('+(meters/1609.344).toFixed(2)+' mi.)';
				} else if (meters >= 10000 && meters < 1000000) {
					result += (meters/1000).toFixed(1)+' km&nbsp; ('+(meters/1609.344).toFixed(1)+' mi.)';
				} else if (meters >= 1000000) {
					result += (meters/1000).toFixed(0)+' km&nbsp; ('+(meters/1609.344).toFixed(0)+' mi.)';
				}
				if (vertex_count == 2) {
					var bearing = google.maps.geometry.spherical.computeHeading(this.Overlay[key].getPath().getAt(0),this.Overlay[key].getPath().getAt(1));
					bearing += (bearing < 0) ? 360 : 0;
					if (bearing) {
						result += '<br /><span style="font-weight:normal;">Initial bearing: '+bearing.toFixed(1)+'&deg;</span>';
					}
				}
				result += '<br /><span style="font-size:10px; color:#666666;">(from Google, &#177;0.3%)</span>';
			} else if (key == 'area' && this.Overlay[key].getPath()) {
				var sqm = google.maps.geometry.spherical.computeArea(this.Overlay[key].getPath());
				var measurements = []; var sq = '<sup style="font-size:70%; vertical-align:baseline; position:relative; bottom:1ex;">2</sup>';
				if (sqm < 100000) { measurements.push( '<tr><td style="font-family:Arial; font-size:12px; font-weight:bold;">'+sqm.toFixed(0)+' m'+sq+'</td><td style="padding-left:8px; font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm*10.76391).toFixed(0)+' ft.'+sq+'</td></tr>' ); }
				if (sqm < 100000) { measurements.push( '<tr><td style="font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/10000).toFixed(2)+' ha</td><td style="padding-left:8px; font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/4046.85642).toFixed(2)+' acres</td></tr>' ); }
				else if (sqm >= 100000 && sqm < 1000000) { measurements.push( '<tr><td style="font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/10000).toFixed(1)+' ha</td><td style="padding-left:8px; font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/4046.85642).toFixed(1)+' acres</td></tr>' ); }
				else if (sqm >= 100000 && sqm < 10000000000) { measurements.push( '<tr><td style="font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/10000).toFixed(0)+' ha</td><td style="padding-left:8px; font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/4046.85642).toFixed(0)+' acres</td></tr>' ); }
				if (sqm >= 100000 && sqm < 100000000) { measurements.push( '<tr><td style="font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/1000000).toFixed(2)+' km'+sq+'</td><td style="padding-left:8px; font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/2589988.11).toFixed(2)+' mi.'+sq+'</td></tr>' ); }
				else if (sqm >= 100000000) { measurements.push( '<tr><td style="font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/1000000).toFixed(0)+' km'+sq+'</td><td style="padding-left:8px; font-family:Arial; font-size:12px; font-weight:bold;">'+(sqm/2589988.11).toFixed(0)+' mi.'+sq+'</td></tr>' ); }
				result += '<table cellspacing="0" cellpadding="1">'+measurements.join('')+'</table>';
				result += '<span style="font-size:10px; color:#666666;">(from Google, &#177;0.3%)</span>';
			}
		}
		if (result && this.ResultBox[key]) { $(this.ResultBox[key].id).innerHTML = result; }
	};
};

function GV_Draw_Elevation_Profile(opts) {
	gvg.profile_arguments = opts;
	if (self.GV_Draw_Elevation_Profile2) { GV_Draw_Elevation_Profile2(); }
	else { GV_Load_JavaScript(gvg.script_directory+'profile.js',"GV_Draw_Elevation_Profile2()",true); }
}
function GV_Remove_Elevation_Profile() {
	if ($('gv_profile') && gvg.floating_profile) {
		GV_Delete('gv_profile');
	}
}

function GV_Export_Data_From_Map() {
	if (self.GV_Export && GV_Export.Start) { GV_Export.Start(); }
	else { GV_Load_JavaScript(gvg.script_directory+'export_data.js',"GV_Export.Start()"); }
}

function GV_Export_GPX() {
	if (self.GV_Export && GV_Export.Start) { GV_Export.Start('gpx'); }
	else { GV_Load_JavaScript(gvg.script_directory+'export_data.js',"GV_Export.Start('gpx')"); }
}

function GV_Export_KML() {
	if (self.GV_Export && GV_Export.Start) { GV_Export.Start('kml'); }
	else { GV_Load_JavaScript(gvg.script_directory+'export_data.js',"GV_Export.Start('kml')"); }
}

function GV_Load_JavaScript(url,callback,prevent_caching) {
	if (prevent_caching) {
		var query_punctuation = (url.indexOf('?') > -1) ? '&' : '?'; var timestamp = new Date(); url = url+query_punctuation+'gv_nocache='+timestamp.valueOf();
	}
	gvg.script_count = (gvg.script_count) ? gvg.script_count+1 : 1;
	var tag = document.createElement("script");
	tag.setAttribute("type", "text/javascript");
	tag.setAttribute("src", url);
	tag.setAttribute("id", 'gv_custom_script'+gvg.script_count);
	var where = (document.getElementsByTagName('head')) ? 'head' : 'body';
	if (!gvg.script_callback) { gvg.script_callback = []; }
	if (callback) { gvg.script_callback[gvg.script_count] = callback; } // then, "eval(gvg.script_callback[gvg.script_count])" can go in the bottom of the script that's loaded
	document.getElementsByTagName(where).item(0).appendChild(tag);
}

function GV_EscapeKey(thing_to_delete) {
	gvg.previous_keydown = document.onkeydown;
	document.onkeydown = function(e) {
		e = e || window.event;
		if (e.keyCode == 27) { // escape key
			document.onkeydown = (gvg.previous_keydown) ? gvg.previous_keydown : null;
			GV_Delete(thing_to_delete);
		}
	};
}

function GV_MouseWheel(e) {
	if (!e || !self.gmap) { return false; }
	if (e.detail) { // Firefox
		if (e.detail < 0) { gmap.zoomIn(); }
		else if (e.detail > 0) { gmap.zoomOut(); }
	} else if (e.wheelDelta) { // IE
		if (e.wheelDelta > 0) { gmap.zoomIn(); }
		else if (e.wheelDelta < 0) { gmap.zoomOut(); }
	}
}
function GV_MouseWheelReverse(e) {
	if (!e || !self.gmap) { return false; }
	if (e.detail) { // Firefox
		if (e.detail < 0) { gmap.zoomOut(); }
		else if (e.detail > 0) { gmap.zoomIn(); }
	} else if (e.wheelDelta) { // IE
		if (e.wheelDelta > 0) { gmap.zoomOut(); }
		else if (e.wheelDelta < 0) { gmap.zoomIn(); }
	}
}

function GV_Initialize_Marker_Tooltip() {
	var mtt = document.createElement('div');
	mtt.id = 'gv_marker_tooltip';
	mtt.style.position = 'absolute';
	mtt.style.visibility = 'hidden';
	gmap.getDiv().parentNode.appendChild(mtt);
	return (mtt);
}
function GV_Create_Marker_Tooltip(marker) {
	// originally from http://econym.org.uk/gmap/tooltips4.htm
	if (!marker || !marker.gvi || !marker.gvi.tooltip || !gvg.marker_tooltip_object) { return false; }
	gvg.marker_tooltip_object.innerHTML = marker.gvi.tooltip;
	var origin_x = gmap.getDiv().offsetLeft; var origin_y = gmap.getDiv().offsetTop;
	var offset = (gvg.overlay.getProjection) ? gvg.overlay.getProjection().fromLatLngToContainerPixel(marker.position,gmap.getZoom()) : {x:-400,y:-400};
	var marker_x = origin_x+offset.x; var marker_y = origin_y+offset.y;
	var anchor = (marker.getIcon().anchor && marker.getIcon().anchor.x) ? marker.getIcon().anchor : {x:16,y:16};
	var icon_size = (marker.getIcon().size) ? marker.getIcon().size : {width:32,height:32};
	var tooltip_width = gvg.marker_tooltip_object.clientWidth;
	var pos = (gv_options.marker_tooltip_position == 'left' || gv_options.marker_tooltip_position == 'right') ? gv_options.marker_tooltip_position : (marker_x < gmap.getDiv().clientWidth/2) ? 'right' : 'left';
	var tooltip_x = (pos == 'left') ? (marker_x-(icon_size.width-anchor.x)-3-tooltip_width) : (marker_x+(icon_size.width-anchor.x)+3);
	var tooltip_y = marker_y-anchor.y;
	GV_Place_Div(gvg.marker_tooltip_object.id,tooltip_x,tooltip_y);
	gvg.marker_tooltip_object.style.visibility = 'visible';
}
function GV_Show_Marker_Tooltip(marker) {
	GV_Create_Marker_Tooltip(marker);
}
function GV_Hide_Marker_Tooltip() {
	if (gvg.marker_tooltip_object) {
		gvg.marker_tooltip_object.style.visibility = 'hidden';
	}
}

function GV_Initialize_Track_Tooltip() {
	var ttt = document.createElement('div');
	ttt.id = 'gv_track_tooltip';
	ttt.style.position = 'absolute';
	ttt.style.visibility = 'hidden';
	gmap.getDiv().parentNode.appendChild(ttt);
	return (ttt);
}
function GV_Create_Track_Tooltip(tn,mouse) {
	// adapted from http://www.econym.demon.co.uk/googlemaps/tooltips4.htm
	if (!gvg.track_tooltip_object || !trk[tn] || !trk[tn].info || !trk[tn].info.name || !gvg.overlay.getProjection) { return false; }
	var info = trk[tn].info;
	var follow_cursor = (gv_options.track_tooltips_centered || !mouse) ? false : true;
	if (!follow_cursor && !info.bounds && !info.center) { return false; }
	gvg.track_tooltip_object.innerHTML = '<div class="gv_tooltip gv_track_tooltip" style="border:1px solid '+info.color+'"><span style="color:'+info.color+';">'+info.name+'</span></div>';
	var width = gvg.track_tooltip_object.clientWidth; var height = gvg.track_tooltip_object.clientHeight;
	var origin_x = gmap.getDiv().offsetLeft; var origin_y = gmap.getDiv().offsetTop; var offset;
	if (follow_cursor) {
		offset = gvg.overlay.getProjection().fromLatLngToContainerPixel(mouse.latLng); // this creates a google.maps.Point object
		GV_Place_Div(gvg.track_tooltip_object.id,(origin_x+offset.x-width/2),(origin_y+offset.y-height-5));
	} else {
		var lat = null; var lon = null;
		if (info.center && typeof(info.center.lat) != 'function') {
			lat = info.center.lat; lon = info.center.lon;
		} else if (info.bounds && typeof(info.bounds.getCenter) == 'function') {
			lat = info.bounds.getCenter().lat(); lon = info.bounds.getCenter().lng();
		}
		if (lat !== null && lon !== null) {
			offset = gvg.overlay.getProjection().fromLatLngToContainerPixel(new google.maps.LatLng(lat,lon)); // this creates a google.maps.Point object
			GV_Place_Div(gvg.track_tooltip_object.id,(origin_x+offset.x-width/2),(origin_y+offset.y-height/2));
		}
	}
	gvg.track_tooltip_object.style.visibility = 'visible';
}
function GV_Hide_Track_Tooltip() {
	if (gvg.track_tooltip_object) {
		gvg.track_tooltip_object.style.visibility = 'hidden';
	}
}


class GV_Label extends google.maps.OverlayView {
	constructor(opts) {
		super();
		// Initialize all properties.
		this.map_ = (opts.map) ? opts.map : null;
		this.coords_ = opts.coords;
		this.html_ = opts.html;
		this.id_ = opts.id;
		this.class_name_ = (opts.class_name) ? opts.class_name : 'gv_label';
		this.style_ = opts.style;
		this.icon_ = opts.icon;
		this.label_offset_ = (opts.label_offset) ? opts.label_offset : new google.maps.Size(0,0);
		this.overlap_ = (opts.overlap_ === false) ? false : true;
		this.behind_markers_ = (opts.behind_markers) ? true : false;
		if (opts.opacity) {
			if (opts.opacity <= 0) { this.opacity_ = 0; }
			else if (opts.opacity <= 1) { this.opacity_ = opts.opacity * 100; }
			else if (opts.opacity > 100) { this.opacity_ = 100; }
			else { this.opacity_ = opts.opacity; }
		}
		this.hidden_ = opts.hidden;
		this.centered_ = opts.centered;
		this.centered_vertical_ = opts.centered_vertical;
		this.left_ = opts.left;
		this.div_ = null;
	}
	
	onAdd() {
		if (!this.coords_) { return false; }
		var div = document.createElement('div');
		div.style.position = 'absolute';
		div.style.visibility = (this.hidden_) ? 'hidden' : 'visible';
		div.style.whiteSpace = 'nowrap';
		div.innerHTML = '<div id = "' + this.id_ + '" class="' + this.class_name_ + '" style="' + this.style_ + '">' + this.html_ + '<'+'/div>' ;
		
		if (this.opacity_) {
			if (typeof(div.style.filter) == 'string') { div.style.filter='alpha(opacity:'+this.opacity_+')'; }
			if (typeof(div.style.KHTMLOpacity) == 'string') { div.style.KHTMLOpacity=this.opacity_/100; }
			if (typeof(div.style.MozOpacity) == 'string') { div.style.MozOpacity=this.opacity_/100; }
			if (typeof(div.style.opacity) == 'string') { div.style.opacity=this.opacity_/100; }
		}
		if (this.overlap_) {
			div.style.zIndex = 100000-(1000*this.coords_.lat());
		}
		this.div_ = div;
		
		if (this.behind_markers_) {
			this.getPanes().overlayShadow.appendChild(div);
		} else {
			this.getPanes().overlayImage.appendChild(div);
		}
	}
	
	draw() {
		if (this.div_) {
			var h = 15;
			var pixel = this.getProjection().fromLatLngToDivPixel(this.coords_);
			var icon_offset = [];
			if (!this.icon_.gv_offset) { this.icon_.gv_offset = new google.maps.Point(0,0); }
			if (this.left_) {
				icon_offset.width = 0 - this.icon_.anchor.x - this.div_.clientWidth - 2; //  anchor includes icon_offset values, width is irrelevant for left labels
				icon_offset.height = 0 + this.icon_.gv_offset.y - parseInt(h/2); // not interested in the Y anchor, only the actual coordinate
			} else if (this.centered_) {
				icon_offset.width = 0 + this.icon_.gv_offset.x - this.div_.clientWidth/2;
				icon_offset.height = this.icon_.size.height - this.icon_.anchor.y + 1;
			} else { // right is default
				icon_offset.width = this.icon_.size.width - this.icon_.anchor.x + 2; // anchor includes icon_offset values
				icon_offset.height = 0 + this.icon_.gv_offset.y - parseInt(h/2); // not interested in the Y anchor, only the actual coordinate
			}
			if (this.centered_vertical_) {
				icon_offset.height = this.icon_.gv_offset.y - parseInt(this.div_.clientHeight/2);
			}
			this.div_.style.left = (pixel.x+icon_offset.width+this.label_offset_.width) + 'px';
			this.div_.style.top = (pixel.y+icon_offset.height+this.label_offset_.height) + 'px';
		}
	}
	show() {
		if (this.div_) { this.div_.style.visibility='visible'; }
	};
	hide() {
		if (this.div_) { this.div_.style.visibility='hidden'; }
	};
	
	onRemove() {
		if (this.div_) {
			this.div_.parentNode.removeChild(this.div_);
			this.div_ = null;
		}
	}
}


class GV_Shadow_Overlay extends google.maps.OverlayView {
	constructor(mi) {
		super();
		this.mi_ = mi; // marker info
		this.image_ = null; // the shadow <img> tag
		this.shadow_position_ = null; // x/y offset from the marker's coordinates
	}

	onAdd() {
		if ((!this.mi_.lat && !this.mi_.lon) || !this.mi_.icon || !gvg.icons[this.mi_.icon]) { return false; }
		var i = this.mi_.icon; var ii = gvg.icons[i]; // ii = icon info
		// if (!ii.ss) { return false; }
		var ss = [ii.ss[0],ii.ss[1]];
		var sa = (ii.sa) ? [ii.sa[0],ii.sa[1]] : (ii.ia ? [ii.ia[0],ii.ia[1]] : [0,0]);
		var sc = 1;
		if (this.mi_.default_scale) { sc = this.mi_.default_scale; }
		if (this.mi_.scale && this.mi_.scale != sc) { sc = this.mi_.scale; }
		if (sc != 1) {
			ss[0] *= sc; ss[1] *= sc;
			sa[0] *= sc; sa[1] *= sc;
		}
		var x_off = 0; var y_off = 0; if (this.mi_.icon_offset) { x_off = this.mi_.icon_offset[0]; y_off = this.mi_.icon_offset[1]; }
		this.shadow_position_ = new google.maps.Point(x_off-sa[0],y_off-sa[1]);
		this.image_ = document.createElement('img');
		if (gv_options.vector_markers && gvg.icons[i].vector_shadow) { this.image_.src = gvg.icons[i].vector_shadow; }
		else { this.image_.src = gvg.icon_directory+'icons/'+i+'/shadow.png'; }
		this.image_.className = 'gv_marker_shadow';
		this.image_.style.cssText = 'position:absolute; width:'+ss[0]+'px; height:'+ss[1]+'px;';
		this.getPanes().overlayLayer.appendChild(this.image_);
	};
	draw() {
		if (!this.mi_.lat && !this.mi_.lon) { return false; }
		var overlay_projection = this.getProjection();
		var pixels = overlay_projection.fromLatLngToDivPixel(new google.maps.LatLng(this.mi_.lat,this.mi_.lon));
		this.image_.style.left = (pixels.x+this.shadow_position_.x)+'px';
		this.image_.style.top = (pixels.y+this.shadow_position_.y)+'px';
		// if (this.mi_.opacity != 1) { this.image_.style.opacity = parseFloat(this.mi_.opacity); }
	};
	onRemove() {
		if (!this.image_) { return false; }
		this.image_.parentNode.removeChild(this.image_);
		this.image_ = null;
	};
}



//  dom-drag.js from www.youngpup.net; featured on Dynamic Drive (http://www.dynamicdrive.com) 12.08.2005
var GV_Drag = {
	obj: null,
	init: function(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper) { // o = dragging handle, oRoot = thing to move (if different)
		if (!o) { return false; } // CUSTOM ADDITION
		o.root = (oRoot && oRoot != null) ? oRoot : o;
		if (typeof(bSwapHorzRef) == 'undefined' && !o.root.style.left && o.root.style.right) { bSwapHorzRef = true; } // CUSTOM ADDITION
		if (typeof(bSwapVertRef) == 'undefined' && !o.root.style.top && o.root.style.bottom) { bSwapVertRef = true; } // CUSTOM ADDITION
		o.onmousedown = GV_Drag.start;
		o.hmode = (bSwapHorzRef) ? false : true;
		o.vmode = (bSwapVertRef) ? false : true;
		if (o.hmode  && isNaN(parseInt(o.root.style.left  ))) { o.root.style.left   = "0px"; }
		if (o.vmode  && isNaN(parseInt(o.root.style.top   ))) { o.root.style.top    = "0px"; }
		if (!o.hmode && isNaN(parseInt(o.root.style.right ))) { o.root.style.right  = "0px"; }
		if (!o.vmode && isNaN(parseInt(o.root.style.bottom))) { o.root.style.bottom = "0px"; }
		o.minX = (typeof minX != 'undefined') ? minX : null;
		o.minY = (typeof minY != 'undefined') ? minY : null;
		o.maxX = (typeof maxX != 'undefined') ? maxX : null;
		o.maxY = (typeof maxY != 'undefined') ? maxY : null;
		o.xMapper = (fXMapper) ? fXMapper : null;
		o.yMapper = (fYMapper) ? fYMapper : null;
		o.root.onDragStart = new Function();
		o.root.onDragEnd = new Function();
		o.root.onDrag = new Function();
	},

	start: function(e) {
		var o = GV_Drag.obj = this;
		e = GV_Drag.fixE(e);
		var y = parseInt((o.vmode) ? o.root.style.top  : o.root.style.bottom);
		var x = parseInt((o.hmode) ? o.root.style.left : o.root.style.right );
		o.root.onDragStart(x, y);
		o.lastMouseX = e.clientX;
		o.lastMouseY = e.clientY;
		if (o.hmode) {
			if (o.minX != null) { o.minMouseX	= e.clientX - x + o.minX; }
			if (o.maxX != null) { o.maxMouseX	= o.minMouseX + o.maxX - o.minX; }
		} else {
			if (o.minX != null) { o.maxMouseX = -o.minX + e.clientX + x; }
			if (o.maxX != null) { o.minMouseX = -o.maxX + e.clientX + x; }
		}
		if (o.vmode) {
			if (o.minY != null) { o.minMouseY	= e.clientY - y + o.minY; }
			if (o.maxY != null) { o.maxMouseY	= o.minMouseY + o.maxY - o.minY; }
		} else {
			if (o.minY != null) { o.maxMouseY = -o.minY + e.clientY + y; }
			if (o.maxY != null) { o.minMouseY = -o.maxY + e.clientY + y; }
		}
		document.onmousemove = GV_Drag.drag;
		document.onmouseup = GV_Drag.end;
		return false;
	},
	
	drag: function(e) {
		e = GV_Drag.fixE(e);
		var o = GV_Drag.obj;
		var ey	= e.clientY;
		var ex	= e.clientX;
		var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
		var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
		var nx, ny;
		if (o.minX != null) { ex = o.hmode ? Math.max(ex, o.minMouseX) : Math.min(ex, o.maxMouseX); }
		if (o.maxX != null) { ex = o.hmode ? Math.min(ex, o.maxMouseX) : Math.max(ex, o.minMouseX); }
		if (o.minY != null) { ey = o.vmode ? Math.max(ey, o.minMouseY) : Math.min(ey, o.maxMouseY); }
		if (o.maxY != null) { ey = o.vmode ? Math.min(ey, o.maxMouseY) : Math.max(ey, o.minMouseY); }
		nx = x + ((ex - o.lastMouseX) * (o.hmode ? 1 : -1));
		ny = y + ((ey - o.lastMouseY) * (o.vmode ? 1 : -1));
		if (o.xMapper) { nx = o.xMapper(y); }
		else if (o.yMapper) { ny = o.yMapper(x); }
		GV_Drag.obj.root.style[o.hmode ? "left" : "right"] = nx + "px";
		GV_Drag.obj.root.style[o.vmode ? "top" : "bottom"] = ny + "px";
		GV_Drag.obj.lastMouseX = ex;
		GV_Drag.obj.lastMouseY = ey;
		GV_Drag.obj.root.onDrag(nx, ny);
		return false;
	},
	
	end: function() {
		document.onmousemove = null;
		document.onmouseup   = null;
		GV_Drag.obj.root.onDragEnd( parseInt(GV_Drag.obj.root.style[GV_Drag.obj.hmode ? "left" : "right"]), parseInt(GV_Drag.obj.root.style[GV_Drag.obj.vmode ? "top" : "bottom"]) );
		GV_Drag.obj = null;
	},
	
	fixE : function(e) {
		if (typeof e == 'undefined') { e = window.event; }
		if (typeof e.layerX == 'undefined') { e.layerX = e.offsetX; }
		if (typeof e.layerY == 'undefined') { e.layerY = e.offsetY; }
		return e;
	}
	
};



//  **************************************************
//  * low-level functions
//  **************************************************

function $(id) {
	return (document.getElementById(id));
}
function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
function singleQuote(text) {
	return '\''+text.replace(/'/g,"\\'")+'\''
}
function lastItem(an_array) {
	return an_array[an_array.length-1];
}
function CloneArrayNEW(source_array) {
	var new_array = [];
	var keys = Object.keys(source_array);
	for (var k=0; k<keys.length; k++) {
		var a = keys[k];
		if (source_array[a] === null) {
			new_array[a] = null;
		} else {
			if (typeof(source_array[a]) == 'object') {
				new_array[a] = [];
				var keys2 = Object.keys(source_array[a]);
				for (var k2=0; k2<keys2.length; k2++) {
					var b = keys2[k2];
					new_array[a][b] = source_array[a][b];
				}
			} else {
				new_array[a] = source_array[a];
			}
		}
	}
	return new_array;
}
function CloneArray(source_array) {
	var new_array = [];
	for (var a in source_array) {
		if (source_array[a] === null) {
			new_array[a] = null;
		} else {
			if (typeof(source_array[a]) == 'object') {
				new_array[a] = [];
				for (var b in source_array[a]) {
					new_array[a][b] = source_array[a][b];
				}
			} else {
				new_array[a] = source_array[a];
			}
		}
	}
	return new_array;
}
function Clone2DArray(source_array) {
	var new_array = [];
	for (var a in source_array) {
		if (source_array[a] === null) {
			new_array[a] = null;
		} else {
			new_array[a] = [];
			for (var b in source_array[a]) {
				new_array[a][b] = source_array[a][b];
			}
		}
	}
	return new_array;
}
function getAbsolutePosition(el) {
	for (var lx=0, ly=0; el != null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
	return {x:lx, y:ly};
}
function getStyle(oElm, strCssRule){ // http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/
	var strValue = "";
	if(document.defaultView && document.defaultView.getComputedStyle){
		strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
	}
	else if(oElm.currentStyle){
		strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
			return p1.toUpperCase();
		});
		strValue = oElm.currentStyle[strCssRule];
	}
	return strValue;
}

function uri_escape(text) {
	text = escape(text);
	text = text.replace(/\//g,"%2F");
	text = text.replace(/\?/g,"%3F");
	text = text.replace(/=/g,"%3D");
	text = text.replace(/&/g,"%26");
	text = text.replace(/@/g,"%40");
	text = text.replace(/\#/g,"%23");
	return (text);
}
function uri_unescape(text) {
	text = text.replace(/\+/g,' ');
	text = unescape(text);
	return (text);
}

function attribute_safe(text) {
	text = text.toString().replace(/&/g,'&amp;').replace(/\"/g,'&quot;').replace(/\'/g,'&apos;').replace(/\>/g,'&gt;').replace(/\</g,'&lt;');
	return text;
}


function DetectCoordinates(text) {
	var dms_pattern = '(?:-?[0-9]{1,3} *[^0-9\t,;/ ]*[^0-9\t,;/])?'+'(?:-?[0-9]{1,3} *[^0-9\t,;/ ]*[^0-9\t,;/])?'+'(?:-?[0-9]{1,4}(?:\\.[0-9]*)? *[^0-9\t,;/ ]*?)';
	var coordinate_pattern = new RegExp('^ *([NS]? *'+dms_pattern+' *[NS]?)'+'(?: *[\t,;/] *| +)'+'([EW]? *'+dms_pattern+' *[EW]?) *$','i');
	if (text.toString().match(coordinate_pattern)) {
		return coordinate_pattern.exec(text.toString()); // returns an array of match parts
	} else {
		return null;
	}
}
function ParseCoordinate(coordinate) {
	if (coordinate == null) { return ''; }
	coordinate = coordinate.toString();
	coordinate = coordinate.replace(/([0-9][0-9][0-9]?)([0-9][0-9])\.([0-9]+)/,'$1 $2'); // convert DDMM.MM format to DD MM.MM
	coordinate = coordinate.replace(/[^NESW0-9\.\- ]/gi,' '); // only a few characters are useful; delete the rest
	var neg = 0; if (coordinate.match(/(^\s*-|[WS])/i)) { neg = 1; }
	coordinate = coordinate.replace(/[NESW\-]/gi,' ');
	if (!coordinate.match(/[0-9]/i)) { return ''; }
	parts = coordinate.match(/([0-9\.\-]+)[^0-9\.]*([0-9\.]+)?[^0-9\.]*([0-9\.]+)?/);
	if (!parts || parts[1] == null) {
		return '';
	} else {
		n = parseFloat(parts[1]);
		if (parts[2]) { n = n + parseFloat(parts[2])/60; }
		if (parts[3]) { n = n + parseFloat(parts[3])/3600; }
		if (neg && n >= 0) { n = 0 - n; }
		n = Math.round(10000000 * n) / 10000000;
		if (n == Math.floor(n)) { n = n + '.0'; }
		n = n+''; // force number into a string context
		n = n.replace(/,/g,'.'); // in case some foreign systems created a number with a comma in it
		return n;
	}
}

function TileToQuadKey (x,y,z){ 
	var quad = '';
	for (var i = z; i > 0; i--) {
		var mask = 1 << (i - 1); 
		var cell = 0; 
		if ((x & mask) != 0) { cell++; }
		if ((y & mask) != 0) { cell += 2; }
		quad += cell; 
	}
	return quad; 
}
function WebMercatorX(lon) {
	return lon*20037508.34/180;
}
function WebMercatorY(lat) {
	return (Math.log(Math.tan((90+lat)*Math.PI/360))/(Math.PI/180)) * (20037508.34/180);
}
function WebMercatorBBOX(coords1,coords2) {
	return WebMercatorX(coords1.lng())+','+WebMercatorY(coords1.lat())+','+WebMercatorX(coords2.lng())+','+WebMercatorY(coords2.lat());
}

function FindOneOrTwoNumbersInString(text) {
	var two_number_pattern = new RegExp('(-?[0-9]+\.?[0-9]*)[^0-9-]+(-?[0-9]+\.?[0-9]*)');
	var one_number_pattern = new RegExp('(-?[0-9]+\.?[0-9]*)');
	var output = [];
	if (text && text.match(two_number_pattern)) {
		var two_number_match = two_number_pattern.exec(text);
		if (two_number_match) {
			output = [parseFloat(two_number_match[1]),parseFloat(two_number_match[2])];
		}
	} else if (text && text.match(one_number_pattern)) {
		var one_number_match = one_number_pattern.exec(text);
		if (one_number_match) {
			output = [parseFloat(one_number_match[1])];
		}
	}
	return output;
}
function SignificantishDigits(x,digits) { // '-ish' because it won't strip digits BEFORE the decimal point
	var log10 = Math.floor(Math.log(x)/Math.log(10));
	var left = (log10 < 1) ? 1 : log10+1;
	var right = (left > digits) ? 0 : digits-left;
	x = x.toFixed(right)*1;
	return x;
}
function SelectText() {
	if (!arguments) { return false; }
	DeselectText();
	if (document.selection) {
		for (j=0; j<arguments.length; j++) {
			var range = document.body.createTextRange();
			range.moveToElementText(document.getElementById(arguments[j]));
			range.select();
		}
	} else if (window.getSelection) {
		for (j=0; j<arguments.length; j++) {
			var range = document.createRange();
			range.selectNode(document.getElementById(arguments[j]));
			window.getSelection().addRange(range);
		}
	}
}
function DeselectText() {
	if (document.selection) {
		document.selection.empty();
	} else if (window.getSelection) {
		window.getSelection().removeAllRanges();
	}
}

function eventFire(el,etype){ // eventFire(document.getElementById('thing'),'click');
	if (el.fireEvent) {
		el.fireEvent('on' + etype);
	} else {
		var evObj = document.createEvent('Events');
		evObj.initEvent(etype, true, false);
		el.dispatchEvent(evObj);
	}
}

function GV_Color_Hex2CSS(c,a) {
	if (!c) { return ''; }
	var rgb = []; rgb = c.match(/([A-F0-9]{2})([A-F0-9]{2})([A-F0-9]{2})/i);
	if (rgb) {
		a = (a) ? ','+a : '';
		return ('rgb('+parseInt(rgb[1],16)+','+parseInt(rgb[2],16)+','+parseInt(rgb[3],16)+a+')');
	} else {
		return (c.replace(/ +/g,''));
	}
}
function GV_Color_Name2Hex(color_name) { // uses the global variable called "gvg.named_html_colors"
	if (!color_name) { return ''; }
	if (color_name.match(/^#[A-F0-9][A-F0-9][A-F0-9][A-F0-9][A-F0-9][A-F0-9]$/i)) { return color_name; }
	var color_name_trimmed = color_name.replace(/^\#/,'');
	if (gvg.named_html_colors[color_name_trimmed]) {
		return gvg.named_html_colors[color_name_trimmed];
	} else {
		return '#'+color_name_trimmed;
	}
}
function GV_Format_Time(ts,tz,tz_text,twelve_hour) {
	ts = (ts) ? ts.toString() : ''; // time stamp
	tz = (tz) ? parseFloat(tz) : 0; // time zone
	twelve_hour = (twelve_hour) ? true : false; // time zone
	if (!ts) { return ''; }
	var d = null;
	if (ts.match(/^\d\d\d\d\d\d\d\d\d\d$/)) {
		var unix_time = parseFloat(ts)+((tz-gvg.local_time_zone)*3600);
		var d = new Date(unix_time*1000);
	} else {
		var parts = []; parts = ts.match(/([12][90]\d\d)[^0-9]?(\d\d+)[^0-9]?(\d\d+)[^0-9]*(\d\d+)[^0-9]?(\d\d+)[^0-9]?(\d\d+)/);
		if (parts) {
			var unix_time = Date.parse(parts[2]+'/'+parts[3]+'/'+parts[1]+' '+parts[4]+':'+parts[5]+':'+parts[6]);
			unix_time = (unix_time/1000)+(tz*3600);
			var d = new Date(unix_time*1000);
		}
	}
	if (d) {
		var hour = d.getHours(); var ampm = '';
		if (twelve_hour) {
			ampm = (hour >= 12) ? ' PM' : ' AM'; if (hour > 12) { hour -= 12; }
		}
		var tz_text = (tz_text) ? ' ('+tz_text+')' : '';
		if (twelve_hour) {
			return (d.getMonth()+1)+"/"+(d.getDate())+"/"+d.getFullYear().toString().substring(2)+", "+hour+":"+(d.getMinutes()<10?"0":"")+d.getMinutes()+":"+(d.getSeconds()<10?"0":"")+d.getSeconds()+ampm+tz_text;
		} else {
			return d.getFullYear()+"-"+(d.getMonth()<9?"0":"")+(d.getMonth()+1)+(d.getDate()<10?"0":"")+"-"+d.getDate()+" "+((hour<10&&!twelve_hour)?"0":"")+hour+":"+(d.getMinutes()<10?"0":"")+d.getMinutes()+":"+(d.getSeconds()<10?"0":"")+d.getSeconds()+tz_text;
		}
	} else {
		return '';
	}
}

function GV_Base64(input) {
	if (!input) { return false; }
	var output = '';
	var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var chr1,chr2,chr3,enc1,enc2,enc3,enc4;
	var i=0;
	while (i < input.length) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) { enc3 = enc4 = 64; }
		else if (isNaN(chr3)) { enc4 = 64; }
		output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
	}
	return output;
}

function GV_Format_Date(ts) {
	if (ts.toString().length == 20) { ts = (ts/1000000 - 18445253720057) * 1000; } // some weird browsers (e.g., Puffin) get the timestamp wrong
	var date = new Date(ts);
	var y = date.getFullYear();
	var mo= date.getMonth()+1; mo = (mo<10) ? '0'+mo : mo;
	var d = date.getDate(); d = (d<10) ? '0'+d : d;
	return (y+'-'+mo+'-'+d);
}
function GV_Format_Time(ts) {
	if (ts.toString().length == 20) { ts = (ts/1000000 - 18445253720057) * 1000; } // some weird browsers (e.g., Puffin) get the timestamp wrong
	var date = new Date(ts);
	var h = date.getHours(); h = (h<10) ? '0'+h : h;
	var m = date.getMinutes(); m = (m<10) ? '0'+m : m;
	var s = date.getSeconds(); s = (s<10) ? '0'+s : s;
	return (h+':'+m+':'+s);
}

function GV_Average_Bearing(b1,b2) {
	var b;
	b1 = (b1+360) % 360; b2 = (b2+360) % 360;
	var db = b2-b1;
	if (db > 180) { db -= 360; }
	else if (db < -180) { db += 360; }
	return (360+b1+(db/2)) % 360;
}
function GV_Bearing() { // takes 2 google LatLng objects OR 2 two-item arrays OR 4 numbers OR 2 marker names
	var args = Array.prototype.slice.call(arguments);
	var coords = GV_Two_Coordinates(args);
	if (!coords.length || !coords[0].lat || !coords[1].lat) { return null; }
	var bearing = google.maps.geometry.spherical.computeHeading(coords[0],coords[1]);
	bearing += (bearing < 0) ? 360 : 0;
	return bearing;
}
function GV_Distance() { // takes 2 google LatLng objects OR 2 two-item arrays OR 4 numbers OR 2 marker names
	var args = Array.prototype.slice.call(arguments);
	var multiplier = 1; var distance = null;
	if ((args.length == 3 || args.length == 5) && args[args.length-1].match(/(^km|kilo|mi|fe?e?t|ya?r?d)/)) {
		var unit = args.pop().toString();
		if (unit.match(/^(km|kilo)/)) { multiplier = 0.001; }
		else if (unit.match(/^(mi)/)) { multiplier = 0.0006213712; }
		else if (unit.match(/^(fe?e?t)/)) { multiplier = 3.28084; }
		else if (unit.match(/^(ya?r?d)/)) { multiplier = 3.28084/3; }
	}
	var coords = GV_Two_Coordinates(args);
	if (!coords.length || !coords[0].lat || !coords[1].lat) { return null; }
	distance = google.maps.geometry.spherical.computeDistanceBetween(coords[0],coords[1]);
	return (!distance) ? null : multiplier*distance;
}

function Vincenty_Distance(lat1,lon1,lat2,lon2) { // http://www.movable-type.co.uk/scripts/LatLongVincenty.html
	if (Math.abs(parseFloat(lat1)) > 90 || Math.abs(parseFloat(lon1)) > 180 || Math.abs(parseFloat(lat2)) > 90 || Math.abs(parseFloat(lon2)) > 180) { return false; }
	if (lat1 == lat2 && lon1 == lon2) { return 0; }
	lat1 *= 3.14159265358979/180; lon1 *= 3.14159265358979/180; lat2 *= 3.14159265358979/180; lon2 *= 3.14159265358979/180;
	var a = 6378137, b = 6356752.314245, f = 1/298.257223563;
	var L = lon2 - lon1; var U1 = Math.atan((1-f) * Math.tan(lat1)); var U2 = Math.atan((1-f) * Math.tan(lat2)); var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1); var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2); var lambda = L, lambdaP = 2*Math.PI;
	var iterLimit = 50;
	while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit > 0) { var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda); var sinSigma = Math.sqrt((cosU2*sinLambda) * (cosU2*sinLambda) + (cosU1*sinU2-sinU1*cosU2*cosLambda) * (cosU1*sinU2-sinU1*cosU2*cosLambda)); var cosSigma = sinU1*sinU2 + cosU1*cosU2*cosLambda; var sigma = Math.atan2(sinSigma, cosSigma); var alpha = Math.asin(cosU1 * cosU2 * sinLambda / sinSigma); var cosSqAlpha = Math.cos(alpha) * Math.cos(alpha); var cos2SigmaM = (!cosSqAlpha) ? 0 : cosSigma - 2*sinU1*sinU2/cosSqAlpha; var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha)); lambdaP = lambda; lambda = L + (1-C) * f * Math.sin(alpha) * (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM))); }
	if (iterLimit==0) { return (NaN); }  // formula failed to converge
	var uSq = cosSqAlpha*(a*a-b*b)/(b*b); var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq))); var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq))); var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM) - B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM))); var s = b*A*(sigma-deltaSigma);
	return s;
}

function GV_Two_Coordinates(numbers) {
	var two_coordinates = [];
	
	if (!numbers[0] || !numbers[1]) { return two_coordinates; }
	if (numbers[0].lat && numbers[1].lat) {
		two_coordinates[0] = numbers[0];
		two_coordinates[1] = numbers[1];
	} else if (numbers[0] && numbers[1] && numbers[2] && numbers[3]) {
		two_coordinates[0] = new google.maps.LatLng(numbers[0],numbers[1]);
		two_coordinates[1] = new google.maps.LatLng(numbers[2],numbers[3]);
	} else if (numbers[0].length == 2 && numbers[1].length == 2) {
		two_coordinates[0] = new google.maps.LatLng(numbers[0][0],numbers[0][1]);
		two_coordinates[1] = new google.maps.LatLng(numbers[1][0],numbers[1][1]);
	} else if (typeof(numbers[0])=='string' && typeof(numbers[1])=='string') {
		var m1 = GV_Find_Marker({pattern:numbers[0],partial_match:false}); two_coordinates[0] = (m1 && m1.gvi && m1.gvi.coords) ? m1.gvi.coords : null;
		var m2 = GV_Find_Marker({pattern:numbers[1],partial_match:false}); two_coordinates[1] = (m2 && m2.gvi && m2.gvi.coords) ? m2.gvi.coords : null;
	}
	return two_coordinates;
}

gvg.geolocation_markers = [];
function GV_Geolocate(opts) {
	if (opts) {
		gvg.geolocation_options = opts;
	} else if (gv_options.geolocation_options) {
		gvg.geolocation_options = gv_options.geolocation_options;
	}
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(GV_Geolocate.success,GV_Geolocate.error,GV_Geolocate.parameters);
	} else {
		// Browser doesn't support geolocation
	}
}
GV_Geolocate.parameters = {
	enableHighAccuracy:true, timeout:10000, maximumAge:0
};
GV_Geolocate.success = function(pos) {
	var coords = pos.coords; var gpos = new google.maps.LatLng(coords.latitude,coords.longitude);
	var timestamp = pos.timestamp;
	if (!gvg.geolocation_options) { gvg.geolocation_options = []; }
	if (gvg.geolocation_options.center !== false) {
		var zoom = (gvg.geolocation_options.zoom) ? parseInt(gvg.geolocation_options.zoom) : null;
		GV_Recenter(coords.latitude,coords.longitude,zoom);
	}
	if (gvg.geolocation_options.info_window !== false) {
		var window_html = '<span style="font-weight:bold;">YOU ARE HERE</span><br />'+GV_Format_Date(timestamp)+' '+GV_Format_Time(timestamp)+'<br />'+coords.latitude.toFixed(6)+', '+coords.longitude.toFixed(6)+'<br />(accuracy: '+coords.accuracy.toFixed(0)+' meters)';
		var window_width = 200;
		if (gvg.geolocation_options.info_window_contents) { // override "YOU ARE HERE" default
			window_html = gvg.geolocation_options.info_window_contents.replace(/{lat.*?}/i,coords.latitude.toFixed(6)).replace(/{(lon|lng).*?}/i,coords.longitude.toFixed(6)).replace(/{(acc|prec).*?}/i,coords.accuracy.toFixed(0)).replace(/{date.*?}/i,GV_Format_Date(timestamp)).replace(/{time.*?}/i,GV_Format_Time(timestamp));
		}
		var window_width_style = (gvg.geolocation_options.info_window_width) ? 'style="width:'+parseFloat(gvg.geolocation_options.info_window_width)+'px;"' : '';
		window_html = '<div class="gv_marker_info_window" '+window_width_style+'>'+window_html+'</div>';
		window_html += '<div style="margin-top:4px; font-size:9px;"><a href="javascript:void(0)" style="text-decoration:none;" onclick="GV_Geolocate.remove_markers(); gmap.closeInfoWindow();">[remove]</a></div>';
		if (gvg.geolocation_info_window) { gvg.geolocation_info_window.close(); }
		gvg.geolocation_info_window = new google.maps.InfoWindow({ position:gpos, content:window_html, maxWidth:window_width });
		gvg.geolocation_info_window.open(gmap);
	}
	if (gvg.geolocation_options.marker) {
		if (!gvg.geolocation_options.keep_previous && gvg.geolocation_markers.length) {
			GV_Geolocate.remove_markers();
		}
		
		var sym = (gvg.geolocation_options.marker !== true && gvg.icons[gvg.geolocation_options.marker]) ? gvg.geolocation_options.marker : 'cross';
		var c = (gvg.geolocation_options.color) ? gvg.geolocation_options.color : 'white';
		var nl = (gvg.geolocation_options.marker_list) ? false : true;
		var i = GV_Draw_Marker({lat:coords.latitude,lon:coords.longitude,name:GV_Format_Date(timestamp)+' '+GV_Format_Time(timestamp),desc:coords.latitude.toFixed(6)+', '+coords.longitude.toFixed(6),color:c,icon:sym,type:'geolocation',nolist:nl});
		gvg.geolocation_markers.push(i);
		
		if (gvg.marker_list_exists) {
			GV_Marker_List();
		}
	}
};
GV_Geolocate.error = function(error) {
	var code = error.code;
	var message = error.message;
	//lert (message);
};
GV_Geolocate.remove_markers = function() {
	for (var j=0; j<gvg.geolocation_markers.length; j++) {
		var i = gvg.geolocation_markers[j];
		GV_Remove_Marker(wpts[i]);
		wpts[i] = null;
	}
	gvg.geolocation_markers = [];
	
	if (gvg.marker_list_exists) {
		GV_Reset_Marker_List();
		for (var j in wpts) { // this is the only way to REMOVE a marker from the marker list: re-process everything
			if (wpts[j]) { GV_Update_Marker_List_With_Marker(wpts[j]); }
		}
		GV_Marker_List();
	}
}

function GV_Display_API_Warning() {
	var tags = gmap.getDiv().getElementsByTagName('a'); var api_error = false;
	for (var i=0; i<tags.length; i++) {
		if(tags[i].href && tags[i].href.match(/#api-key-and-billing-errors|\/billing\/enable/)) { api_error = true; }
	}
	if (api_error) { gm_authFailure(); }
	/*
	gvg.console_warn_function = console.warn;
	console.warn = function() {
		if (arguments[0].toString().indexOf('NoApiKeys') > -1) { GV_Generic_Key_Problem(); }
		return gvg.console_warn_function.apply(console,arguments);
	};
	*/
}
function GV_Generic_Key_Problem() {
	if (self.google_api_key) {
		alert("Uh-oh! There's a problem with this map's Google Maps API Key. Are you sure that the key provided ('"+google_api_key+"') is valid, and that "+window.location.hostname+" is in its list of allowed referrers?");
	} else {
		alert("Google now requires all maps to have a valid API key.  Learn more here: http://www.gpsvisualizer.com/misc/google_api_keys.html");
	}
}
function gm_authFailure() {
	if (self.gv_options && gv_options.api_warning === false) { return false; }
	var editable = false; var atlas = false;
	if (window.location.hostname && (window.location.hostname.toString().indexOf('www.gpsvisualizer.com') == 0 || window.location.hostname.toString().indexOf('127.0.0.1') == 0) && window.location.toString().indexOf('/display/') > 0) {
		if (window.location.toString().match(/\d{14}-\d{5}-map\.html/)) {
			var ip_key = window.location.toString().replace(/^.*?\d{14}-(\d{5})-map\.html.*$/,'$1');
			if (document.cookie && document.cookie.indexOf('ip_key='+ip_key) >= 0) { editable = true; }
		}
	} else if (window.location.hostname && (window.location.hostname.toString().indexOf('atlas.gpsvisualizer.com') == 0 || window.location.toString().indexOf('gpsvisualizer.com/atlas/') >= 0)) {
		atlas = true;
	}
	if (editable && !gvg.api_keys['google']) {
		var this_page = window.location.toString().replace(/\?.*?$/,'');
		var msg = '';
		msg += '<div style="font:12px Verdana,sans-serif; margin-top:12px;"> ';
		msg += '<p>Google now requires a Google Maps JavaScript API Key in all HTML maps.  If you already have a key, paste it into the box below, and it will be added to the map you just created.  (And, the next time you visit the GPS Visualizer map input form, the key will be stored in a browser cookie for you.)</p> ';
		msg += '<div style="width:100%; text-align:center;"><div style="display:inline-block; padding:8px; margin:8px; background-color:#ddddff; border-radius:8px;"> ';
		msg += '<form target="_self" action="'+this_page+'" method="POST" id="gv_api_key_form" onsubmit="if($(\'input:google_api_key\').value){ var k=$(\'input:google_api_key\').value.replace(/^\s*|\s*$/g,\'\'); if(k.match(/^AI/)){return true;}else{alert(\'&quot;\'+k+\'&quot; is not a valid Google Maps API Key.\'); return false;}}else{return false;}"><p style="margin-bottom:0.5em; margin-top:0.5em; text-align:center; font-size:11px;"><span style="white-space:nowrap">Your Google Maps API Key:</span> <span style="white-space:nowrap"><input size="20" id="input:google_api_key" name="google_api_key" value="" /><input type="submit" value="submit" /></span></p></form> ';
		msg += '</div></div> ';
		msg += '<p><a target="_blank" href="http://www.gpsvisualizer.com/misc/google_api_keys.html">Click here</a> for more information on getting a key.</p> ';
		msg += '</div>';
		GV_Create_Modal_Window(msg,false,null,null,null,'150px',null);
	} else if (atlas) {
		var msg = '';
		msg += '<div style="font:12px Verdana,sans-serif; margin-top:12px;"> ';
		msg += '<p>Unfortunately, Google now requires a Google Maps JavaScript API Key in all HTML maps.  If you already have a key, paste it into the box below, and it will be added to your Atlas link. <b>HOWEVER, note that if you use your key with the Atlas, it will be plainly visible in the URL, which means other people could easily use your key. This is probably not a good idea.</b></p> ';
		msg += '<div style="width:100%; text-align:center;"><div style="display:inline-block; padding:8px; margin:8px; background-color:#ddddff; border-radius:8px;"> ';
		msg += '<p style="margin-bottom:0.5em; margin-top:0.5em; text-align:center; font-size:11px;"><span style="white-space:nowrap">Your Google Maps API Key:</span> <span style="white-space:nowrap"><input size="20" id="input:google_api_key" value="" />';
		msg += '<input type="button" value="submit" onclick="if($(\'input:google_api_key\').value){ var k=$(\'input:google_api_key\').value.replace(/^\s*|\s*$/g,\'\'); if(k.match(/^AI/)){ window.location.replace(\''+window.location.toString().replace(/&gak=[^&]*/,'')+'&gak=\'+$(\'input:google_api_key\').value);}else{alert(\'&quot;\'+k+\'&quot; is not a valid Google Maps API Key.\'); return false;}}else{return false;}"/></span></p>';
		msg += '</div></div> ';
		msg += '<p>If you understand the risks, <a target="_blank" href="http://www.gpsvisualizer.com/misc/google_api_keys.html">click here</a> for more information on getting a key.</p> ';
		msg += '</div>';
		// GV_Create_Modal_Window(msg,false,null,null,null,'150px',null);
	} else {
		if (gvg.api_keys['google']) {
			var msg = '';
			msg += '<div style="font:12px Verdana,sans-serif; margin-top:12px;"> ';
			msg += '<p>Unfortunately, Google now requires a valid Google Maps API Key in all HTML maps, and Google doesn\'t seem to think that this map\'s key is valid. Check your browser\'s JavaScript console for more details.</p> ';
			msg += '</div>';
			GV_Create_Modal_Window(msg,true,null,null,null,'50px',null);
		} else {
			var msg = '';
			msg += '<div style="font:12px Verdana,sans-serif; margin-top:12px;"> ';
			msg += '<p>Unfortunately, Google now requires a valid Google Maps API Key in all HTML maps. If you are the owner of this map, <a target="_blank" href="http://www.gpsvisualizer.com/misc/google_api_keys.html">click here</a> for more information on getting a key.</p> ';
			msg += '</div>';
			GV_Create_Modal_Window(msg,true,null,null,null,'50px',null);
		}
	}
}

function GV_Create_Modal_Window(html,click_anywhere,x,y,wd,min_ht,max_ht) {
	gv_modal_div = document.createElement('div'); gv_modal_div.id = 'gv_modal_window';
	var y = (y) ? parseFloat(y): 100;
	var x = (x) ? parseFloat(x) : 0;
	var margin = (x) ? '0 0 0 '+x+'px' : 'auto';
	var width = (wd) ? 'width:'+wd+'; ' : (gvg.mobile_browser ? 'width:80%; ' : 'width:60%; ');
	var min_height = (min_ht) ? 'min-height:'+min_ht+'; ' : 'min-height:50px; ';
	var max_height = (max_ht) ? 'max-height:'+max_ht+'; ' : 'max-height:'+(window.innerHeight-y-32-20)+'px; ';
	gv_modal_div.style.cssText = 'display:none; position:fixed; z-index:999999; padding-top:'+y+'px; left:0; top:0; width:100%; height:100%; background-color:#999999; background-color:rgba(0,0,0,0.4);';
	gv_modal_div.innerHTML = '<div class="modal-content" style="background-color:white; margin:'+margin+'; padding:16px; overflow:auto; border:1px solid #666666; '+width+min_height+max_height+'"><span class="close" style="float:right; color:#aaaaaa; font-size:20px; font-weight:bold; cursor:pointer; margin:0px 0px 8px 8px;" onmouseover="this.style.color=\'#cc0000\';" onmouseout="this.style.color=\'#aaaaaa\';" onclick="GV_Close_Modal_Window();"><sup>&times;</sup></span>'+html+'</div>';
	document.body.appendChild(gv_modal_div);
	gv_modal_div.style.display = 'block';
	if (click_anywhere !== false) { window.onclick = function(event){ if(event.target==gv_modal_div){GV_Close_Modal_Window();} } }
	document.onkeydown = GV_ProcessKeydown;
}
function GV_Close_Modal_Window() {
	if (gv_modal_div) {
		gv_modal_div.style.display = 'none'; gv_modal_div.parentNode.removeChild(gv_modal_div); document.onkeydown = null;
	}
}
function GV_ProcessKeydown(e) {
	e = e || window.event;
	if (('key' in e && e.key == "Escape") || ('keyCode' in e && e.keyCode == 27)) {
		GV_Close_Modal_Window(); document.onkeydown = null;
	}
}

function GV_List_Map_Types(div_id,make_links) {
	if (!gvg.bg || !gvg.background_maps) { return false; }
	if (!$(div_id)) { div_id = null; }
	var output = ''; var aliases = [];
	for (var key in gvg.bg) {
		if (!aliases[gvg.bg[key]]) { aliases[gvg.bg[key]] = []; }
		if (key.toString().match(/^GV_|^G_/)) {
			aliases[gvg.bg[key]].push(key);
		}
	}
	if (div_id) { output = '<table border="1" cellspacing="0" cellpadding="2" style="border-collapse:collapse;"><tr valign="middle"><th style="line-height:1em;">menu name</th><th style="line-height:1em;">menu order</th><th style="line-height:1em;">map ID</th><th style="line-height:1em;">alias(es)</th>'; }
	for (var i=0; i<gvg.background_maps.length; i++) {
		if (gvg.background_maps[i] && gvg.background_maps[i].menu_order > 0) {
			var alias = (aliases[gvg.background_maps[i].id] && aliases[gvg.background_maps[i].id].length) ? aliases[gvg.background_maps[i].id].join(", ") : '';
			if (div_id) {
				link_open = (make_links) ? '<a href="javascript:void(0)" onclick="GV_Set_Map_Type(\''+gvg.background_maps[i].id+'\');" title="'+gvg.background_maps[i].description+'">' : '';
				link_close = (make_links) ? '</a>' : '';
				output += '<tr valign="top"><td nowrap>'+link_open+gvg.background_maps[i].menu_name+link_close+'</td><td align="center">'+gvg.background_maps[i].menu_order+'</td><td>'+gvg.background_maps[i].id+'</td>';
				output += (alias) ? '<td>'+alias+'</td>' : '<td>&nbsp;</td>';
				output += '</tr>';
			} else {
				output += gvg.background_maps[i].menu_name+": '"+gvg.background_maps[i].id+"'";
				output += (alias) ? " (a.k.a. "+alias+")" : "";
				output += "\n";
			}
		}
	}
	if (div_id) { output += '</table>'; }
	if (div_id && $(div_id)) {
		$(div_id).innerHTML = output;
	} else {
		eval('a'+'lert(output)');
	}
}

function GV_Debug (text,force_alert,div_id) {
	var alerts = false;
	var onscreen = true;
	if (!div_id) { div_id = 'gv_debug_message'; }
	
	if (onscreen && $(div_id)) {
		$(div_id).innerHTML = $(div_id).innerHTML+"<p style='margin:0px 0px 4px 0px;'>"+text+"</p>\n";
		$(div_id).scrollTop = $(div_id).scrollHeight;
	} else {
		console.log(text);
	}
	if (alerts || force_alert) {
		alert (text);
	}
}
function GV_Debug_Function_Name(f) { // pass in arguments.callee or arguments.callee.caller
	if (f) {
		var paren = f.toString().indexOf('(');
		return (f.toString().substring(9,paren));
	}
}



//  **************************************************
//  * backwards compatibility
//  **************************************************

function GBrowserIsCompatible() {
	return true;
}
function GMap2() {
	return null;
}
function GUnload() {
	return null;
}
var Drag = GV_Drag; // backwards compatibility
function GV_Place_Control(map_id,control_id,anchor,x,y) { // backwards compatibility
	GV_Place_Div(control_id,x,y,anchor);
}
function GV_Remove_Control(control_id) { // backwards compatibility
	GV_Delete(control_id);
}
function GV_Toggle_Label_Opacity(id,original_color,force) {	
	GV_Toggle_Tracklist_Item_Opacity(id,original_color,force);
}

if (!google.maps.Polyline.prototype.getBounds) {
	google.maps.Polyline.prototype.getBounds = function() {
		var bounds = new google.maps.LatLngBounds();
		var path = this.getPath();
		for (var i=0; i<path.getLength(); i++) { bounds.extend(path.getAt(i)); }
		return bounds;
	};
}
if (!google.maps.Polygon.prototype.getBounds) {
	google.maps.Polygon.prototype.getBounds = function() {
		var bounds = new google.maps.LatLngBounds();
		var paths = this.getPaths();
		var path;
		for (var p=0; p<paths.getLength(); p++) {
			path = paths.getAt(p);
			for (var i = 0; i < path.getLength(); i++) { bounds.extend(path.getAt(i)); }
		}
		return bounds;
	};
}
function getBoundsZoomLevel(bounds,size) {
	var GLOBE_HEIGHT = 256; // Height of a tiled map that displays the entire world when zoomed all the way out
	var GLOBE_WIDTH = 256; // Width of a tiled map that displays the entire world when zoomed all the way out
	var MARGIN_FACTOR = (size) ? 1 : 0.8; // allows for widgets along the edge and such
	if (!size) {
		if (gmap) { size = new google.maps.Size(gmap.getDiv().clientWidth,gmap.getDiv().clientHeight); }
		else { return false; }
	}
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	var lat_extent = ne.lat() - sw.lat();
	var lng_extent = ne.lng() - sw.lng(); if (lng_extent < 0) { lng_extent += 360; }
	var lat_zoom = Math.floor(Math.log(MARGIN_FACTOR*size.height * 360/lat_extent / GLOBE_HEIGHT) / Math.LN2);
	var lng_zoom = Math.floor(Math.log(MARGIN_FACTOR*size.width * 360/lng_extent / GLOBE_WIDTH) / Math.LN2);
	var zoom = (lat_zoom < lng_zoom) ? lat_zoom : lng_zoom;
	
	return (zoom >= 1) ? zoom : 0;
}



//  **************************************************
//  * JSON/XML stuff
//  **************************************************

//  JSONscriptRequest from Jason Levitt
//  ### GV CUSTOMIZATION: added the "clean" parameter to JSONscriptRequest so the "noCache" argument is NOT sent. (Extra parameters break Google Docs.)
//  ### GV CUSTOMIZATION: added a "uri_escape" function
//  ### GV CUSTOMIZATION: added a fix for IE6- when there is a self-closing "base" tag
function JSONscriptRequest(fullUrl,opts) {
	var clean = (opts && opts.clean) ? true : false;
	// REST request path
	this.fullUrl = fullUrl; 
	// Keep IE from caching requests
	this.noCache = (clean) ? '' : (fullUrl.indexOf('?') > -1) ? '&gv_nocache=' + (new Date()).getTime() : '?gv_nocache=' + (new Date()).getTime();
	// Get the DOM location to put the script tag
	this.headLoc = document.getElementsByTagName("head").item(0);
	// Generate a unique script tag id
	this.scriptId = 'YJscriptId' + JSONscriptRequest.scriptCounter++;
}
JSONscriptRequest.scriptCounter = 1; // Static script ID counter
//  buildScriptTag method
JSONscriptRequest.prototype.buildScriptTag = function () {

	// Create the script tag
	this.scriptObj = document.createElement("script");
	
	// Add script object attributes
	this.scriptObj.setAttribute("type", "text/javascript");
	this.scriptObj.setAttribute("src", (this.fullUrl.match(/&callback=/)) ? this.fullUrl.replace(/&callback=/,this.noCache+'&callback=') : this.fullUrl+this.noCache); // Google requires 'callback' to be the LAST parameter
	this.scriptObj.setAttribute("id", this.scriptId);
};
//  buildScriptTag2 method
JSONscriptRequest.prototype.buildScriptTag_custom = function (js) {

	// Create the script tag
	this.scriptObj = document.createElement("script");
	
	// Add script object attributes
	this.scriptObj.setAttribute("type", "text/javascript");
	this.scriptObj.setAttribute("id", this.scriptId);
	this.scriptObj.text = js; // it should really be .innerHTML, not .text, but IE demands .text
};
//  removeScriptTag method
JSONscriptRequest.prototype.removeScriptTag = function () {
	// Destroy the script tag
	if (this.scriptObj) {
		if (this.scriptObj.parentNode != this.headLoc) { // IE doesn't understand self-closing tags!
			// eval("a"+"lert ('Internet Explorer 6 is unbelievably stupid!')");
			if (this.scriptObj.parentNode) {
				this.scriptObj.parentNode.removeChild(this.scriptObj); // although, maybe this makes more sense anyway?
			}
		} else {
			this.headLoc.removeChild(this.scriptObj);
		}
	}
};
//  addScriptTag method
JSONscriptRequest.prototype.addScriptTag = function () {
	// Create the script tag
	this.headLoc.appendChild(this.scriptObj);
};

// json2xml from http://goessner.net/ 
function json2xml(o, tab) {
	var toXml = function(v, name, ind) {
		var xml = "";
		if (v instanceof Array) {
			for (var i=0, n=v.length; i<n; i++) {
				xml += ind + toXml(v[i], name, ind+"\t") + "\n";
			}
		}
		else if (typeof(v) == "object") {
			var hasChild = false;
			xml += ind + "<" + name;
			for (var m in v) {
				if (m.charAt(0) == "@") {
					xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
				} else {
					hasChild = true;
				}
			}
			xml += hasChild ? ">" : "/>";
			if (hasChild) {
				for (var m in v) {
					if (m == "#text") {
						xml += v[m];
					} else if (m == "#cdata") {
						xml += "<![CDATA[" + v[m] + "]]>";
					} else if (m.charAt(0) != "@") {
						xml += toXml(v[m], m, ind+"\t");
					}
				}
				xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
			}
		}
		else {
			xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
		}
		return xml;
	};
	var xml="";
	for (var m in o) {
		xml += toXml(o[m], m, "");
	}
	return (tab) ? xml.replace(/\t/g,tab) : xml.replace(/\t|\n/g,"");
}

// xml2json from http://goessner.net/ 
//  ### GV CUSTOMIZATION: added "attribute_prefix" option; it was hard-coded as "@"
//  ### GV CUSTOMIZATION: removed all '#cdata' and '#text' tags
function xml2json(xml, tab, attribute_prefix) {
	var X = {
		toObj: function(xml) {
			var o = {};
			if (xml.nodeType==1) {	// element node ..
				if (xml.attributes.length) { // element with attributes  ..
					for (var i=0; i<xml.attributes.length; i++) {
						o[attribute_prefix+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
					}
				}
				if (xml.firstChild) { // element has child nodes ..
					var textChild=0, cdataChild=0, hasElementChild=false;
					for (var n=xml.firstChild; n; n=n.nextSibling) {
						if (n.nodeType==1) { hasElementChild = true; }
						else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) { textChild++; } // non-whitespace text
						else if (n.nodeType==4) { cdataChild++; } // cdata section node
					}
					if (hasElementChild) {
						if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
							X.removeWhite(xml);
							for (var n=xml.firstChild; n; n=n.nextSibling) {
								if (n.nodeType == 3) { // text node
									o = X.escape(n.nodeValue); // CUSTOMIZATION
									// o["#text"] = X.escape(n.nodeValue);
								} else if (n.nodeType == 4) { // cdata node
									o = X.escape(n.nodeValue); // CUSTOMIZATION
									// o["#cdata"] = X.escape(n.nodeValue);
								} else if (o[n.nodeName]) { // multiple occurence of element ..
									if (o[n.nodeName] instanceof Array) {
										o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
									} else {
										o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
									}
								} else { // first occurence of element..
									o[n.nodeName] = X.toObj(n);
								}
							}
						} else { // mixed content
							if (!xml.attributes.length) {
								o = X.escape(X.innerXml(xml));
							} else {
								o = X.escape(X.innerXml(xml)); // CUSTOMIZATION
								// o["#text"] = X.escape(X.innerXml(xml));
							}
						}
					}
					else if (textChild) { // pure text
						if (!xml.attributes.length) {
							o = X.escape(X.innerXml(xml));
						} else {
							o = X.escape(X.innerXml(xml)); // CUSTOMIZATION
							// o["#text"] = X.escape(X.innerXml(xml));
						}
					}
					else if (cdataChild) { // cdata
						if (cdataChild > 1) {
							o = X.escape(X.innerXml(xml));
						} else {
							for (var n=xml.firstChild; n; n=n.nextSibling) { o = X.escape(n.nodeValue); } // CUSTOMIZATION
							// for (var n=xml.firstChild; n; n=n.nextSibling) { o["#cdata"] = X.escape(n.nodeValue); }
						}
					}
				}
				if (!xml.attributes.length && !xml.firstChild) { o = null; }
			} else if (xml.nodeType==9) { // document.node
				o = X.toObj(xml.documentElement);
			} else {
				var xlert = ("unhandled node type: " + xml.nodeType);
			}
			return o;
		},
		toJson: function(o, name, ind) {
			var json = name ? ("\""+name+"\"") : "";
			if (o instanceof Array) {
				for (var i=0,n=o.length; i<n; i++) {
					o[i] = X.toJson(o[i], "", ind+"\t");
				}
				json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
			} else if (o == null) {
				json += (name&&":") + "null";
			} else if (typeof(o) == "object") {
				var arr = [];
				for (var m in o) {
					arr[arr.length] = X.toJson(o[m], m, ind+"\t");
				}
				json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
			} else if (typeof(o) == "string") {
				json += (name&&":") + "\"" + o.toString() + "\"";
			} else {
				json += (name&&":") + o.toString();
			}
			return json;
		},
		innerXml: function(node) {
			var s = "";
			if ("innerHTML" in node) {
				s = node.innerHTML;
			} else {
				var asXml = function(n) {
					var s = "";
					if (n.nodeType == 1) {
						s += "<" + n.nodeName;
						for (var i=0; i<n.attributes.length;i++) {
							s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
						}
						if (n.firstChild) {
							s += ">";
							for (var c=n.firstChild; c; c=c.nextSibling) {
								s += asXml(c);
							}
							s += "</"+n.nodeName+">";
						} else {
							s += "/>";
						}
					} else if (n.nodeType == 3) {
						s += n.nodeValue;
					} else if (n.nodeType == 4) {
						s += "<![CDATA[" + n.nodeValue + "]]>";
					}
					return s;
				};
				for (var c=node.firstChild; c; c=c.nextSibling) {
					s += asXml(c);
				}
			}
			return s;
		},
		escape: function(txt) {
			return txt.replace(/[\\]/g, "\\\\").replace(/[\"]/g, '\\"').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r');
		},
		removeWhite: function(e) {
			e.normalize();
			for (var n = e.firstChild; n; ) {
				if (n.nodeType == 3) {  // text node
					if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
						var nxt = n.nextSibling;
						e.removeChild(n);
						n = nxt;
					} else {
						n = n.nextSibling;
					}
				} else if (n.nodeType == 1) {  // element node
					X.removeWhite(n);
					n = n.nextSibling;
				} else {  // any other node
					n = n.nextSibling;
				}
			}
			return e;
		}
	};
	if (xml.nodeType == 9) { // document node
		xml = xml.documentElement;
	}
	// var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
	var json = (xml) ? X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t") : '';
	return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

//  from http://goessner.net/download/prj/jsonxml/ :
function parseXML(xml) {
	var dom = null;
	if (window.DOMParser) {
		try { 
			dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
		} 
		catch (e) { dom = null; }
	} else if (window.ActiveXObject) {
		try {
			dom = new ActiveXObject('Microsoft.XMLDOM');
			dom.async = false;
			if (!dom.loadXML(xml)) // parse error ..
				var xlert = (dom.parseError.reason + dom.parseError.srcText);
		} 
		catch (e) { dom = null; }
	} else {
		return false;
	}
	return dom;
}

//  from http://en.wikipedia.org/wiki/XMLHttpRequest : 
function getURL(url, vars, callbackFunction) {
	if (typeof(XMLHttpRequest) == "undefined") {
		XMLHttpRequest = function() {
			try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(e) {};
			try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(e) {};
			try { return new ActiveXObject("Msxml2.XMLHTTP"); }     catch(e) {};
			try { return new ActiveXObject("Microsoft.XMLHTTP"); }  catch(e) {};
		};
	}
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.setRequestHeader("Content-Type","application/x-javascript;");
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			if (request.status == 200 && request.responseText) {
				callbackFunction(request.responseText);
			} else {
				callbackFunction('');
			}
		}
	};
	request.send(vars);
}



//  **************************************************
//  * long lists of colors, icons, maps, styles, etc.
//  **************************************************

function GV_Define_Named_Colors() {
	var c = [];
	c['aliceblue'] = '#f0f8ff'; c['antiquewhite'] = '#faebd7'; c['aqua'] = '#00ffff'; c['aquamarine'] = '#7fffd4'; c['azure'] = '#f0ffff';
	c['beige'] = '#f5f5dc'; c['bisque'] = '#ffe4c4'; c['black'] = '#000000'; c['blanchedalmond'] = '#ffebcd'; c['blue'] = '#0000ff'; c['blueviolet'] = '#8a2be2'; c['brown'] = '#a52a2a'; c['burlywood'] = '#deb887';
	c['cadetblue'] = '#5f9ea0'; c['chartreuse'] = '#7fff00'; c['chocolate'] = '#d2691e'; c['coral'] = '#ff7f50'; c['cornflowerblue'] = '#6495ed'; c['cornsilk'] = '#fff8dc'; c['crimson'] = '#dc143c'; c['cyan'] = '#00ffff';
	c['darkblue'] = '#00008b'; c['darkcyan'] = '#008b8b'; c['darkgoldenrod'] = '#b8860b'; c['darkgray'] = '#a9a9a9'; c['darkgrey'] = '#a9a9a9'; c['darkgreen'] = '#006400'; c['darkkhaki'] = '#bdb76b'; c['darkmagenta'] = '#8b008b'; c['darkolivegreen'] = '#556b2f'; c['darkorange'] = '#ff8c00'; c['darkorchid'] = '#9932cc'; c['darkred'] = '#8b0000'; c['darksalmon'] = '#e9967a'; c['darkseagreen'] = '#8fbc8f'; c['darkslateblue'] = '#483d8b'; c['darkslategray'] = '#2f4f4f'; c['darkslategrey'] = '#2f4f4f'; c['darkturquoise'] = '#00ced1'; c['darkviolet'] = '#9400d3'; c['darkyellow'] = '#999900'; c['deeppink'] = '#ff1493'; c['deepskyblue'] = '#00bfff'; c['dimgray'] = '#696969'; c['dimgrey'] = '#696969'; c['dodgerblue'] = '#1e90ff';
	c['firebrick'] = '#b22222'; c['floralwhite'] = '#fffaf0'; c['forestgreen'] = '#228b22'; c['fuchsia'] = '#ff00ff';
	c['gainsboro'] = '#dcdcdc'; c['ghostwhite'] = '#f8f8ff'; c['gold'] = '#ffd700'; c['goldenrod'] = '#daa520'; c['gray'] = '#808080'; c['grey'] = '#808080'; c['green'] = '#008000'; c['greenyellow'] = '#adff2f';
	c['honeydew'] = '#f0fff0'; c['hotpink'] = '#ff69b4';
	c['indianred'] = '#cd5c5c'; c['indigo'] = '#4b0082'; c['ivory'] = '#fffff0';
	c['khaki'] = '#f0e68c';
	c['lavender'] = '#e6e6fa'; c['lavenderblush'] = '#fff0f5'; c['lawngreen'] = '#7cfc00'; c['lemonchiffon'] = '#fffacd'; c['lightblue'] = '#add8e6'; c['lightcoral'] = '#f08080'; c['lightcyan'] = '#e0ffff'; c['lightgoldenrodyellow'] = '#fafad2'; c['lightgreen'] = '#90ee90'; c['lightgray'] = '#d3d3d3'; c['lightgrey'] = '#d3d3d3'; c['lightpink'] = '#ffb6c1'; c['lightsalmon'] = '#ffa07a'; c['lightseagreen'] = '#20b2aa'; c['lightskyblue'] = '#87cefa'; c['lightslategray'] = '#778899'; c['lightslategrey'] = '#778899'; c['lightsteelblue'] = '#b0c4de'; c['lightyellow'] = '#ffffe0'; c['lime'] = '#00ff00'; c['limegreen'] = '#32cd32'; c['linen'] = '#faf0e6';
	c['magenta'] = '#ff00ff'; c['maroon'] = '#800000'; c['mediumaquamarine'] = '#66cdaa'; c['mediumblue'] = '#0000cd'; c['mediumorchid'] = '#ba55d3'; c['mediumpurple'] = '#9370db'; c['mediumseagreen'] = '#3cb371'; c['mediumslateblue'] = '#7b68ee'; c['mediumspringgreen'] = '#00fa9a'; c['mediumturquoise'] = '#48d1cc'; c['mediumvioletred'] = '#c71585'; c['midnightblue'] = '#191970'; c['mintcream'] = '#f5fffa'; c['mistyrose'] = '#ffe4e1'; c['moccasin'] = '#ffe4b5';
	c['navajowhite'] = '#ffdead'; c['navy'] = '#000080';
	c['oldlace'] = '#fdf5e6'; c['olive'] = '#808000'; c['olivedrab'] = '#6b8e23'; c['orange'] = '#ffa500'; c['orangered'] = '#ff4500'; c['orchid'] = '#da70d6';
	c['palegoldenrod'] = '#eee8aa'; c['palegreen'] = '#98fb98'; c['paleturquoise'] = '#afeeee'; c['palevioletred'] = '#db7093'; c['papayawhip'] = '#ffefd5'; c['peachpuff'] = '#ffdab9'; c['peru'] = '#cd853f'; c['pink'] = '#ffc0cb'; c['plum'] = '#dda0dd'; c['powderblue'] = '#b0e0e6'; c['purple'] = '#800080';
	c['red'] = '#ff0000'; c['rosybrown'] = '#bc8f8f'; c['royalblue'] = '#4169e1';
	c['saddlebrown'] = '#8b4513'; c['salmon'] = '#fa8072'; c['sandybrown'] = '#f4a460'; c['seagreen'] = '#2e8b57'; c['seashell'] = '#fff5ee'; c['sienna'] = '#a0522d'; c['silver'] = '#c0c0c0'; c['skyblue'] = '#87ceeb'; c['slateblue'] = '#6a5acd'; c['slategray'] = '#708090'; c['slategrey'] = '#708090'; c['snow'] = '#fffafa'; c['springgreen'] = '#00ff7f'; c['steelblue'] = '#4682b4';
	c['tan'] = '#d2b48c'; c['teal'] = '#008080'; c['thistle'] = '#d8bfd8'; c['tomato'] = '#ff6347'; c['turquoise'] = '#40e0d0';
	c['violet'] = '#ee82ee';
	c['wheat'] = '#f5deb3'; c['white'] = '#ffffff'; c['whitesmoke'] = '#f5f5f5';
	c['yellow'] = '#ffff00'; c['yellowgreen'] = '#9acd32';
	return (c);
}
function GV_Field_Alias(field) {
	if (field.match(/^(name|nom|naam)\d?\b/i)) { return 'name'; }
	else if (field.match(/^(desc|descr|description)\d?\b/i)) { return 'desc'; }
	else if (field.match(/^(url|web.?page|link)\d?\b/i)) { return 'url'; }
	else if (field.match(/^(lati?|latt?itude)\b/i)) { return 'lat'; }
	else if (field.match(/^(long?|lng|long?t?itude)\b/i)) { return 'lon'; }
	else if (field.match(/^(alt|altitude|ele|elevation)\b/i)) { return 'alt'; }
	else if (field.match(/^(heading|bearing)\b/i)) { return 'course'; }
	else if (field.match(/^(colou?re?|couleur)\b/i)) { return 'color'; }
	else if (field.match(/^(icon|sym|symbol).?size\b/i)) { return 'icon_size'; }
	else if (field.match(/^(icon|sym|symbol).?anchor\b/i)) { return 'icon_anchor'; }
	else if (field.match(/^(icon|sym|symbol).?scale\b/i)) { return 'scale'; }
	else if (field.match(/^(icon|sym|symbol).?opacity\b/i)) { return 'scale'; }
	else if (field.match(/^(icon|sym|symbol)\b/i)) { return 'icon'; }
	else if (field.match(/^(thumbnail|thumb|tn).?(width|size)\b/i)) { return 'thumbnail_width'; }
	else if (field.match(/^(thumbnail|thumb|tn)\b/i)) { return 'thumbnail'; }
	else if (field.match(/^(photo\w*|picture).?(width|size)\b/i)) { return 'photo_size'; }
	else if (field.match(/^(opaque|opacity)\b/i)) { return 'opacity'; }
	else if (field.match(/^(date[mdy\/-]*)\b/i)) { return 'date'; }
	else if (field.match(/^(time|timestamp)\b/i)) { return 'time'; }
	else if (field.match(/^icon.?offset\b/i)) { return 'icon_offset'; }
	else if (field.match(/^label.?offset\b/i)) { return 'label_offset'; }
	else if (field.match(/^label.?left\b/i)) { return 'label_left'; }
	else if (field.match(/^label.?right\b/i)) { return 'label_right'; }
	else if (field.match(/^label.?center/i)) { return 'label_centered'; }
	else if (field.match(/^label.?class/i)) { return 'label_class'; }
	else if (field.match(/^zoom.?level\b/i)) { return 'zoom_level'; }
	else if (field.match(/^link.?target|^target$/i)) { return 'link_target'; }
	else if (field.match(/^gv.?marker.?options\b/i)) { return 'gv_marker_options'; }
	else if (field.match(/^(gv.?)?track.?number\b/i)) { return 'gv_track_number'; }
	else if (field.match(/^(circle.?rad|range.?ring)/i)) { return 'circle_radius'; }
	else if (field.match(/^no.?window\b/i)) { return 'no_window'; }
	else if (field.match(/^no.?list\b/i)) { return 'no_list'; }
	// Google Spreadsheets squishes fields down from "a_b.c (d)" to "ab.cd"! So anything with underscores needs to be included here.
	else { return null; }
}

function GV_KML_Icon_Anchors(md) { // md = marker_data
	if (md.icon.match(/mapfiles\/kml\/pal\d\//i)) {
		if (md.icon.match(/^https?:\/\/(maps|www)\.(google|gstatic)\.\w+.*\/.*?mapfiles\/kml\/pal5\/icon13\.png/i)) { md.icon_anchor = [11,24]; } // small flag
		else if (md.icon.match(/^https?:\/\/(maps|www)\.(google|gstatic)\.\w+.*\/.*?mapfiles\/kml\/pal5\/icon14\.png/i)) { md.icon_anchor = [21,27]; } // small pushpin
	} else if (md.icon.match(/^https?:\/\/(maps|www)\.(google|gstatic)\.\w+.*\/.*?mapfiles\/(ms\/m?icons|kml)/i)) {
		if (md.icon.match(/\bpushpin\.png$/i)) {
			md.icon_anchor = [10,31];
		} else if (md.icon.match(/\bdot\.png$|(red|orange|yellow|green|blue|purple|l(igh)?tblue?|pink)\.png$|\/paddle\//i)) {
			md.icon_anchor = [15,31];
		} else if (md.icon.match(/\/poi\.png$/i)) {
			md.icon_anchor = [24,24];
		} else if (md.icon.match(/\/flag\.png$/i)) {
			md.icon_anchor = [12,31]; // 
		}
	} else if (md.icon.match(/^https?:\/\/(maps|www)\.(google|gstatic)\.\w+.*\/.*?mapfiles\/.*pushpin\/.*\.png/i)) {
		md.icon_anchor = [10,31];
	} else if (md.icon.match(/mapspro\/images\/stock\/503-\w\w\w-blank_maps\.png/i)) {
		md.icon_anchor = [15,31];
	}
	return (md);
}
function GV_Define_Garmin_Icons(icon_dir,garmin_icon_set) {
	var garmin_codes = new Array(
		'Airport','Amusement Park','Anchor','Anchor Prohibited','Animal Tracks','ATV'
		,'Bait and Tackle','Ball Park','Bank','Bar','Beach','Beacon','Bell','Bike Trail','Block, Blue','Block, Green','Block, Red','Block, Yellow','Boat Ramp','Bowling','Bridge','Building','Buoy, White','Big Game','Blind','Blood Trail'
		,'Campground','Car','Car Rental','Car Repair','Cemetery','Church','Circle with X','Circle With X','Circle, Blue','Circle, Green','Circle, Red','Circle, Yellow','City (Capitol)','City (Large)','City (Medium)','City (Small)','City Hall','Civil','Coast Guard','Controlled Area','Convenience Store','Crossing','Cover','Covey'
		,'Dam','Danger Area','Department Store','Diamond, Blue','Diamond, Green','Diamond, Red','Diamond, Yellow','Diver Down Flag 1','Diver Down Flag 2','Dock','Dot','Dot, White','Drinking Water','Dropoff'
		,'Exit'
		,'Fast Food','Fishing Area','Fishing Hot Spot Facility','Fitness Center','Flag','Flag, Blue','Flag, Green','Flag, Red','Flag, Yellow','Forest','Food Source','Furbearer'
		,'Gas Station','Geocache','Geocache Found','Ghost Town','Glider Area','Golf Course','Ground Transportation'
		,'Heliport','Horn','Hunting Area'
		,'Ice Skating','Information'
		,'Levee','Library','Light','Live Theater','Lodge','Lodging','Letterbox Cache'
		,'Man Overboard','Marina','Medical Facility','Mile Marker','Military','Mine','Movie Theater','Museum','Multi Cache','Multi-Cache'
		,'Navaid, Amber','Navaid, Black','Navaid, Blue','Navaid, Green','Navaid, Green/Red','Navaid, Green/White','Navaid, Orange','Navaid, Red','Navaid, Red/Green','Navaid, Red/White','Navaid, Violet','Navaid, White','Navaid, White/Green','Navaid, White/Red'
		,'Oil Field','Oval, Blue','Oval, Green','Oval, Red'
		,'Parachute Area','Park','Parking Area','Pharmacy','Picnic Area','Pin, Blue','Pin, Green','Pin, Red','Pin, Yellow','Pizza','Police Station','Post Office','Private Field','Puzzle Cache'
		,'Radio Beacon','Rectangle, Blue','Rectangle, Green','Rectangle, Red','Rectangle, Yellow','Reef','Residence','Restaurant','Restricted Area','Restroom','Rocks','RV Park'
		,'Scales','Scenic Area','School','Seaplane Base','Shipwreck','Shopping Center','Short Tower','Shower','Ski Resort','Skiing Area','Skull and Crossbones','Soft Field','Square, Blue','Square, Green','Square, Red','Square, Yellow','Stadium','Stump','Summit','Swimming Area','Small Game'
		,'Tall Tower','Telephone','Toll Booth','TracBack Point','Trail Head','Triangle, Blue','Triangle, Green','Triangle, Red','Triangle, Yellow','Truck Stop','Tunnel','Tree Stand','Treed Quarry','Truck'
		,'Ultralight Area','Upland Game'
		,'Water','Water Hydrant','Water Source','Waypoint','Weed Bed','Wrecker','Waterfowl','Winery'
		,'Zoo'
		,'CoursePoint:1st_Category','CoursePoint:2nd_Category','CoursePoint:3rd_Category','CoursePoint:4th_Category','CoursePoint:Danger','CoursePoint:First_Aid','CoursePoint:FirstAid','CoursePoint:FirstCat','CoursePoint:Food','CoursePoint:FourthCat','CoursePoint:Generic','CoursePoint:Hors_Category','CoursePoint:HorsCat','CoursePoint:Left','CoursePoint:Right','CoursePoint:SecondCat','CoursePoint:Sprint','CoursePoint:Straight','CoursePoint:Summit','CoursePoint:ThirdCat','CoursePoint:Valley','CoursePoint:Water'
		,'Bank, Euro','Bank, Pound','Bank, Yen','Covey','Dog Pointing','Dog Running','Dog Sitting','Dog Treed','Dog Unknown','Favorite','Ferry','Funicular','Hospital, Euro copy','Hospital, Euro','Parking, Euro Pay copy','Parking, Euro Pay','Parking, Euro copy','Parking, Euro','Parking, Pay copy','Parking, Pay','Railway','Sad Face copy','Sad Face'
		,'Brush Pile','Buoy, Dark','Exposed Wreck','Fish Attractor','Fishing Area 1','Fishing Area 2','Fishing Area 3','Fishing Area 4','Fishing Area 5','Fishing Area 6','Fishing Area 7','Fishing Area 8','Fishing Area 9','Hump','Laydown','Ledge','Lilly Pads','Lily Pads','No Wake Zone','Recommended Anchor','Stop','Underwater Grass','Underwater Tree'
	);
	var garmin_data = [];
	var garmin_dir = icon_dir+'icons/garmin/gpsmap/';
	if (garmin_icon_set == 'mapsource') { garmin_dir = icon_dir+'icons/garmin/mapsource/'; }
	else if (garmin_icon_set == '24x24') { garmin_dir = icon_dir+'icons/garmin/24x24/'; }
	
	for (var i=0; i<garmin_codes.length; i++) { 
		garmin_data[ garmin_codes[i] ] = [];
		if (gvg.garmin_icons_base64 && gvg.garmin_icons_base64[ garmin_codes[i] ]) {
			garmin_data[ garmin_codes[i] ].url = gvg.garmin_icons_base64[ garmin_codes[i] ];
		} else {
			garmin_data[ garmin_codes[i] ].url = garmin_dir+garmin_codes[i].replace(/[ :]/g,'_').replace(/\//g,'-')+'.png';
		}
	}
	garmin_data['Civil'].anchor = [4,16];
	garmin_data['Flag'].anchor = [4,16];
	garmin_data['Flag, Blue'].anchor = [4,16];
	garmin_data['Flag, Green'].anchor = [4,16];
	garmin_data['Flag, Red'].anchor = [4,16];
	garmin_data['Pin, Blue'].anchor = [1,15];
	garmin_data['Pin, Green'].anchor = [1,15];
	garmin_data['Pin, Red'].anchor = [1,15];
	garmin_data['Golf Course'].anchor = [7,11];
	garmin_data['Tall Tower'].anchor = [7,13];
	garmin_data['Short Tower'].anchor = [7,11];
	garmin_data['Radio Beacon'].anchor = [5,13];
	
	return (garmin_data);
}

function GV_Define_Embedded_Images() {
	gvg.embedded_images = [];
	gvg.embedded_images['close'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHRJREFUeNqcUgEKgDAIVOlp9a/9q8fZVgjO1JYD2bid3gmHzAyVs8kDD2wrDXzyw7sVd2jjXinhkp7WVXmUVfFw8uxokjfo1dj9Y6Si/1xFS4gwguKhbL8Mo4gw7NmdP63qBm+/KTkZycNRsvo3clgN+SXAAEsTYQPydOGvAAAAAElFTkSuQmCC';
	gvg.embedded_images['crosshair'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAABDSURBVHjaYvj//z8DDtzAwACi/jfgUsPEQAEYiZoZoaGKDRyAYgcoxtQMig5sEkBDGeGKGBn/U91mhtFEQkfNAAEGAKqIZ7vyNwICAAAAAElFTkSuQmCC';
	gvg.embedded_images['folder_triangle_closed'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAINJREFUeNpi/P//PwOxgAXGiIuL2wWkioD4CrKCRYsWwdlMSOKuQHwBiGcAsRg2k5nQ+MxAnA7Et4G4DIg58CmGAT4g7gTia8QohgFFoF/+E6v4EdCDjIQUfwbiaiBWx+eMv0A8F4jVgLgNiH8AnYEZzkCwF4iLgfgiLjcxkhKDAAEGAM5UHPetNK3YAAAAAElFTkSuQmCC';
	gvg.embedded_images['folder_triangle_open'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHdJREFUeNpi/P//PwOxgJG2iuPi4vYA2c541O1etGiRGxOUUwzEf3EoBIkXgRgwxReBeAEOxXOA+AqyYhCoAeLPaAo/AXEdjIOs+AUQd6ApbgXiV9gUg0AfED+Csu8D8SQUWVBoxMbGgjGIDeX/h7GRMUnhDBBgAH7bPoz6pr8gAAAAAElFTkSuQmCC';
	gvg.embedded_images['help'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAMCAMAAACHgmeRAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADBQTFRF3ufehKWE4uriwNDAz9zPaJBonbedkq+SKGIoSnpKWIRYH1sfNWo1P3I/C0wL////yKxLmwAAAFRJREFUeNosiVEOwCAIxd6mgiAP7n/bYbJ+NE0KM3/0cV+gY47CLS3nLPVbElJC0CTOKNs45+QuyUQ2OvOvl33u3WM3iAhbbIM0Lw8GgrZ0udknwADwZAQyHFNfTgAAAABJRU5ErkJggg==';
	gvg.embedded_images['measure_area'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAThJREFUeNpiYMADVAKTDEAYnxomPJoLgNR5EIaysQJGLBoFgNR6IHbIC/cHi01auRFEHQDiwDvr533AaQBQswNIs7SYiMD08hwGTUVZsPj1+48ZMjunMDx99eYD1JAD2JzcD8T/M9on///45et/dAASA8mB1IDUwl0A5CiAbOXj5jKoTopgCHK0xhdmDOv2H2VonbeC4dPXbxdArmEW0jTsBzrZY15tIYOdoQ4DIaCpKAdUp8tw6MIVic9fvwmAYmEj0G8M0mLCDMQCkFqQHpBemP//r9135D+xAKQWpAc5HWzYffI80S6Aqt2AbMDGPafOgwKGoGaQGpBamPPhLgARUAm8AEkNwgXQ1EWUN2DOh6VI5LxA0BvozkdJytA88J7IcBSEuQA9L4CyrgABzR+Ami/AOAABBgBCkMqX9IqkowAAAABJRU5ErkJggg==';
	gvg.embedded_images['measure_distance'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAXRJREFUeNpiZiASqAQmCQhpGi4H4pvvbpx/ARNnJlYzkNo/vSLH4eHzlxF/xJV2wgxhJlZzdVKEwbr9Rxn6C9M4zly/DTeEmZBmQV6e/WmBngZbj55iKIkNAYoyMsR5u3Acu3QNbAgzIc2xXs4G0mLCDAZqygyTV25kSPBxZeDj5mJQlJbgALpIghmfZkcTfYMgR2uGNx8+MriYGYI1vvnwieHnrz8Maa0TL/z49SsQq2bTuLzz9ull/6/de/R/0oqN/5EBSAwkDw0b7JrLJs0FK4QZQpJmkI0wm2GGfPzyFadmRuSoygv3BwcYCID8DgKfvn5jePrqLUN8Q8+F95+/ON5ZP+8DsgFMyPG8+9Q5sCAowGAAn2aY09fvPnnuf3Rt5/8TV2789y2q/7923xHCfoYlZVDaBiVPUAoD+QgUz7CowmszmisMAkoa34MCi1ibUTITKE2DkiUoeYJSGCiREGUzLBaQXQKk6oE4kRjNIAAQYACH+xmPvJ+VIAAAAABJRU5ErkJggg==';
	gvg.embedded_images['pixel'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABBJREFUeNpi+P//PwNAgAEACPwC/tuiTRYAAAAASUVORK5CYII=';
	gvg.embedded_images['minus'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACtJREFUeNpiZGBgiGQgAhBSFMlEjCmkKRIQEPgPpOAYyh8INzESE04AAQYAFNkHfnGxNpoAAAAASUVORK5CYII=';
	gvg.embedded_images['plus'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADpJREFUeNpiZGBgiGQgAhBSFMmERfA/ugATMVbBFQkICPxHMuU/lI/TTf+JcRMDMW5ixCZAMJwAAgwA3kUIfpFoOe0AAAAASUVORK5CYII=';
	gvg.embedded_images['geolocate'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAVdJREFUeNpiZCAE0hj+w9mzGBjxKWVioCJgxOEaASBZD8QBQKyAJPMAiDcAcSPQlR8IG5YGNmA+EAsoCCswBBgEMAhwCTB8+PaBYcOFDQwP3oLMAxuUCDRwA77wSQCFkUCBwP/159f/xwZA4iB5cFhCLMbhtTSG9yCF5x+d/48PgOShBr6HBgkYMMMNM2ZoB5IOy1OWMzioO4CFQF6bcWgGw85rOxkuPL7AoCGhwcDBysEgwS8BZq88s5IDqIyD4SzDTnSX3VeoVIDb/v7r+/8GzQYw74AxiA8ShwGQepA+RNKAKQbGGiiwYWDB8QVg1yADEB8kDgNQ9QowM1DSGSjWYODj949Yg/bi44tY1WMkWlAYwQA/Jz9Ww/Rl9bGqp3qYsSAZtwGYIAtACROWUPcX7QeHEcjLIJcmWCbAvYaUgDfQJJ1hZiUKcgBV8yaNS43BUjgCBBgAOVFMeb25HOgAAAAASUVORK5CYII=';
	gvg.embedded_images['profile'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAARCAYAAAAyhueAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKJJREFUeNpiYKAZSGP4T03jmGjhRpoYyoIjOCyApAMQPwDiDQyzGH5Q5lKIgR5AzAHEGkBcABTjIN/QNAYJqIHIAGRgAikGo3s/AIc6CajcChzBJQH1FQMwqA4woXlbAo8DNIBqPLAYCBLLgMaBA7r3HYjwmQXQEAckAx3AYni8T2yYOQAN00AKFiKTFGEgMTxyFE0MZaR6KTULaia1AUCAAQABuBSdDtLT+wAAAABJRU5ErkJggg==';
	gvg.embedded_images['recenter'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANtJREFUeNpiYMADjI2N/+OTZ8KhSQEfHwYYcWhcD8SOQPweiAWBeD8QB549e/YBslpmdM3Pnz//ICUlxQlk5gOxBhRvBGrcgdPZyE4DKpyArAiZj6yOCdmpQLoASU8iED+A0jCNBVB1Cih+BgoIAKn5MI1A2z4QkmPBER0GQKyIxD8PxDDnBgD1gBksQFMYsZmOZpghNpsZ0aJnISxwoIaBbDSEKYb6OR4j2rAkDFDA/AfRuBIMM3L8ooWqAjSObwDjXRIofwJdHUUpjAFf2obFBK60zUBJrgIIMABGHmR/wLeX2AAAAABJRU5ErkJggg==';
	gvg.embedded_images['recenter3'] = ' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANdJREFUeNpiYMADjI2N/+OTZ2KgAFCkmRGLUwWA1H4gdgTi90AsCOOfPXv2A7JaZnTNz58//yElJfUTyCwHYg0oXgjUeIIoZwMVLgBSD6DcB1A+aQDohQSi/AxV6A/EF4H4AtTGC0BxAyBbAYhBtD4Qb4S5hAnNqYVALA/E64E4HyqVD+WDxAuRvcCEZLMDVJED1OaFUKmFUD5YHqoO4mxo1MyHSjYCMcjk/UAbDJEMPg+NOpDX6oH4ABAnwmwGxZ8iUMMEqCEb0cIGxHeAyitC1Q9VABBgABDtSnR6ayh0AAAAAElFTkSuQmCC';
	gvg.embedded_images['recenter4'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANtJREFUeNpiYMADjI2N/+OTZ8KhSQEfHwYYcWhcD8SOQPweiAWBeD8QB549e/YBslpmdM3Pnz//ICUlxQlk5gOxBhRvBGrcgdPZyE4DKpyArAiZj6yOCdmpQLoASU8iED+A0jCNBVB1Cih+BgoIAKn5MI1A2z4QkmPBER0GQKyIxD8PxDDnBgD1gBksQFMYsZmOZpghNpsZ0aJnISxwoIaBbDSEKYb6OR4j2rAkDFDA/AfRuBIMM3L8ooWqAjSObwDjXRIofwJdHUUpjAFf2obFBK60zUBJrgIIMABGHmR/wLeX2AAAAABJRU5ErkJggg==';
	gvg.embedded_images['ruler'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAANCAMAAAB8UqUVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA9QTFRF////AAAAgICA2dnZpqamHNafKwAAADRJREFUeNpiYMQEDMRDJjQMggxoGCLGhIIhYqgAKMbCwMSMgnGIAY1gRsE4zMMmhgkAAgwAYggAydQT7V4AAAAASUVORK5CYII=';
	gvg.embedded_images['tracklist_goto'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEVJREFUeNpiYWBgcGAgAFig9AE8ahxYkHlpaWn/kfmzZs1iBNFM2ATRARM+kzAUIStAN5EJXRdMAbpCQkEA9x1ehQABBgCXSxG3/Cu2yQAAAABJRU5ErkJggg==';
	gvg.embedded_images['tracklist_goto2'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFJJREFUeNp0kNENACEIQy3DwkxM21MTDdazn+2jAeDubF2ZiSaKiJnZC6g+SG4TACvUM+wmNVUHpE0XVAFtNJ1aQAVtnTnMv51GbvUfrz99AgwALQMtn/hrpUAAAAAASUVORK5CYII=';
	gvg.embedded_images['utilities_button'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAUCAYAAACXtf2DAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFZJREFUeNpi/P//PwMWgFWQDMDIREPDwWYxMdAY0NwCFnySDZsbGBq3NJJkYL1PPUODbwP9fMCIJRX9H42D0TgYjYMhFgcDYgEjNaMAVypiHDJBBBBgALyVJB/do134AAAAAElFTkSuQmCC';
	gvg.embedded_images['utilities-about'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAMAAAAMCGV4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGBQTFRFaYVq5enlu8u8Tm1OWnNaKFkpkqmSsr2yPWM9Y3ZjGlIai5mL0tzScYlxj6KPydPJAkYDSndLU25UNV822+LbQ2ZDnbGd////FE8Uw9PDYIFhP3VB7vDubZBtf6OAfZl9GjYQVgAAAKRJREFUeNokzusOwjAIBWAUmHRrXdfOnVqnvv9bSuP5QfKFSyD+Z1lS6hIqDdxX/NPVLRHnna2kK3qhEHbsbI9gqudSySZAjKWq2mSN7ILdqapc5uYGDi5OsdbaTAm4Dab49Nyoe1+1Bt3ewMkkwKomvtoijkz1ChAPthWfTOoLu/qlWi6YAkn5AvEtrDPGvE/28f4zepncVWrOr40W0pzzT4ABAHtjDKSjB4D9AAAAAElFTkSuQmCC';
	gvg.embedded_images['utilities-export'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARlJREFUeNpi/P//PwMhwOjKCKLqgLgJWZyJgXjQCDUAYSiDCwNeqw3kDMB4wZEFMKF6mAtYQMTd3Xexarz3+B7DldtXGG7ev4nuAhBoYsGm6eKNiwxtM9sYzlw5g88LDBiaZ6yYwdA9t5uYMGBG0Tx3zVy4Rl5uXgZHc0cGQy1DBjYWNobqCdXISkF+rgcHGMjPIP95pXkx/Pv3j6E0uZQh2jeagYuTC65a2VUZRSNKVC3euJiBm5ObYWHnQobUsFQUjTCQG5PLkGCTAI8uuLP3HN/DMK1hGoO5njlWD4I0FsQXILsAEs9Xt1xl2HV0F4Ofkx/BUIJqZoTbzMHOQZRGGPi/+z/C2chOIQUwEpMxcAEmBgoAQIABAHqqVCEizS8tAAAAAElFTkSuQmCC';
	gvg.embedded_images['utilities-export-disabled'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARZJREFUeNpi/P//PwMhwOjKCKLUgPgWsjgTA/FAHWoAwlAGFwZffDoM5AzAeMGRBTChmzAXsICIu7vvYtV47/E9hiu3rzDcvH8T3QUgcIsFm6aLNy4ytM1sYzhz5Qw+LzBgaJ6xYgZD99xuYsKAEUXz3DVz4Rp5uXkZHM0dGQy1DBnYWNgYqidUIysF+fkmOMBAfgb5zyvNi+Hfv38MpcmlDNG+0QxcnFxw1cquyigaUZy9eONiBm5OboYpdVMYLA0ssbozNyaX4fODz2rAkEfVvOf4HoZpDdMYzPXMcWosiC9AdgEkkfz4+QPsVFwaQQCkER2AbeZg52Dwc/IjOqn93/0foRnZKaQARmIyBi7AxEABAAgwABq/ViIgq+T/AAAAAElFTkSuQmCC';
	gvg.embedded_images['utilities-geolocate'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAOVJREFUeNpiYMAH0hj+45NmYqAAMGKxLQBI1gOxAZLoBSBuZJjFsAGfMxtATk2Yn/B//839/++/uQ+mQXywF0DyODQGgBTMPzb/PzYAEocaEIBN83mQDciKGzY3oBgGdcF5rCELciKaLf+RXQOSR44BFmSOgrACmH749iGKuTA+TB6mhwUYgowwgQdvH4AVyAvLo2iG8UHyYADVw4IcHQuPLTRwUHNgSLBMgNsI0gjjA+Vh0UZ5aDPDNZ9luMFgzMC48cJGB5CNAlwCEOc8ucDQuLmRoXFLIwM0ocygQQqjZ8YACDAATnnCPgaQGsIAAAAASUVORK5CYII=';
	gvg.embedded_images['utilities-maptype'] = ' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAVVJREFUeNpiYKAZcGJwwCfNhENTAhDfZ5AU3g+mQXwibIJoKrH6v/Pigf8gAKJBfNyGYNEEAgWL6uFs7IY4MYCc9j9/cT1WTeh8kDqQerA+ymxGdX4D2FTsfv4PlkcCjFBNCkCynoGbIcHPJZVBileEYca2HgYGdj4Ghm9vGSxNQhmOv3/KwHD5GAPDb4YFQLWNDPsYHjACNc4HchJ8/VIY6nxzgKYxMnz4/onh07fPDPuvH2dQEpVl+Pj9M8OHr58Ynn16zbDq4i4Ghrt3QFYuYGZQZLgIZAjcenrO4DMjC4OOtBrQfQwMP3//YhDi5mf48fsnw88/vxjefvvIsPjaYQaGe1cZGP5BbGdE8i/E6VwMCW4OcQxRpt4MQC8zPP3wkmHSyY0Mry7sA5qIcDKuhKIA9gpQL0Ox5X8GL3BAzYcazoAZYLgMYQBHyQLcNlEAAAIMADAE7YSP4CP4AAAAAElFTkSuQmCC';
	gvg.embedded_images['utilities-measure'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAMAAAAMCGV4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABJQTFRF3f/dAEQAYIBgrsiug5uD////KcGKRQAAAAZ0Uk5T//////8As7+kvwAAADlJREFUeNpiYEUFDIyogIEwZELCIMiAhCF8JjiG8BEAyGdhYGKGYyx8oDZmOMaiH52P5n40/wEEGACO1wE250zhRwAAAABJRU5ErkJggg==';
	gvg.embedded_images['utilities-opacity'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAMAAAAMCGV4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADBQTFRFCUoJz9zPiaiJMGcw6/HrrcOuQHNA3ufeY41jdpt2m7abIVwhv9C/FFIUUYBS////yZKjkgAAABB0Uk5T////////////////////AOAjXRkAAAAjSURBVHjaYuBHBQws7Iw8rFxMnBx8bMzcvAxDno/mP4AAAwBR6gcYxlTwXwAAAABJRU5ErkJggg==';
	gvg.embedded_images['utilities-profile'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHdJREFUeNpiYBg4kMbwn1ytTJTYy4LMadjUkACk+qFcxwa/hgtE2QzUaADVKADF60lx9nyoJhhQABpYQFAzVJEBFvl6oJwAIT/X45AHaQQZ3AC1BOYdB2TNAnhcB7L9A5B+AA0TBayhjQf0Uz2eGSlJYQMHAAIMAAIjHCn2wWMjAAAAAElFTkSuQmCC';
	gvg.embedded_images['zoom_in'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAC5JREFUeNpi/P//PwMySE9PhwvMnDmTEVmOiYEEQDvFjGlpaf8HgTOGYNABBBgAZF8QPzsp3Z0AAAAASUVORK5CYII=';
	gvg.embedded_images['zoom_out'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACNJREFUeNpi/P//PwOxgImBBEA7xYxpaWn/B4EzhmDQAQQYAJbpCD8Dfvh0AAAAAElFTkSuQmCC';
}
function GV_Define_Vector_Icons() {
	gvg.icons['airport'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="17px" height="17px" viewBox="0 0 17 17"><g opacity="1" transform="rotate(0 8.5 8.5)"><polygon fill="white" points="11,17 17,11 17,6 11,0 6,0 0,6 0,11 6,17 "/><path fill="#ffffff" stroke="#000000" stroke-width="1" d="M8.5,15.171l-2.614,0.404v-1.921L7.5,12.96V9.39l-6.846,1.176V8.553L7.5,5.821V1.334 c0-0.464,0.56-0.831,1-0.831s1,0.367,1,0.831v4.487l6.846,2.732v2.013L9.5,9.39v3.57l1.614,0.694v1.921L8.5,15.171z"/></g></svg>';
	gvg.icons['blankcircle'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="64px" height="64px" viewBox="0 0 64 64"><circle opacity="1" fill="white" stroke="black" stroke-width="1.5" cx="32" cy="32" r="31.25"/></svg>';
	gvg.icons['camera'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="17px" height="13px" viewBox="0 0 17 13"><g opacity="1"><rect opacity="1.00" fill="white" stroke="black" stroke-width="1" x="1.5" y="3.5" width="14" height="8"/><rect opacity="1.00" fill="white" stroke="black" stroke-width="1" x="6.5" y="1.5" width="4" height="2"/><rect opacity="1.00" fill="white" stroke="black" stroke-width="0.5" x="2.25" y="2.25" width="2" height="1"/><circle opacity="1.00" fill="white" stroke="black" stroke-width="1" cx="8.5" cy="7.5" r="3.5"/></g></svg>';
	gvg.icons['circle'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11px" height="11px" viewBox="0 0 11 11"><circle opacity="1" fill="white" stroke="black" stroke-width="1" cx="5.5" cy="5.5" r="5"/></svg>';
	gvg.icons['cross'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="13px" height="13px" viewBox="0 0 13 13"><polygon opacity="1" fill="white" stroke="black" stroke-width="1" transform="rotate(0 6.5 6.5)" points="4.5,0.5 8.5,0.5 8.5,4.5 12.5,4.5 12.5,8.5 8.5,8.5 8.5,12.5 4.5,12.5 4.5,8.5 0.5,8.5 0.5,4.5 4.5,4.5 "/></svg>';
	gvg.icons['diamond'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="13px" height="13px" viewBox="0 0 13 13"><path opacity="1" fill="white" stroke="black" stroke-width="1" transform="rotate(0 6.5 6.5)" d="M6.5,0c0,2.364-4.136,6.5-6.5,6.5c2.364,0,6.5,4.137,6.5,6.5 c0-2.363,4.137-6.5,6.5-6.5C10.637,6.5,6.5,2.364,6.5,0z"/></svg>';
	gvg.icons['google'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20px" height="34px" viewBox="0 0 20 34"><g opacity="1" transform="rotate(0 10 34)"><path opacity="1.00" fill="white" stroke="black" stroke-width="1.25" d="M9.5,33.375 C9.5,17.283,0.562,18,0.562,10c0-5.212,4.225-9.438,9.438-9.438S19.438,4.788,19.438,10c0,8-8.938,7.283-8.938,23.375H9.5z"/><circle opacity="1.00" fill="#000000" cx="10" cy="10" r="2.75"/></g></svg>';
	gvg.icons['googleblank'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20px" height="34px" viewBox="0 0 20 34"><path opacity="1" fill="white" stroke="black" stroke-width="1.25" transform="rotate(0 10 34)" d="M9.5,33.375 C9.5,17.283,0.562,18,0.562,10c0-5.212,4.225-9.438,9.438-9.438S19.438,4.788,19.438,10c0,8-8.938,7.283-8.938,23.375H9.5z"/></svg>';
	gvg.icons['googlemini'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="12px" height="20px" viewBox="0 0 12 20"><path opacity="1" fill="white" stroke="black" stroke-width="1.25" transform="rotate(0 6 20)" d="M5.773,19.5 c0-5.18-1.47-6.978-2.708-8.499C1.676,9.291,0.6,8.559,0.6,5.816C0.6,1.425,4.108,0.7,6,0.7c1.893,0,5.4,0.725,5.4,5.116 c0,2.742-1.076,3.474-2.466,5.184c-1.238,1.522-2.708,3.319-2.708,8.5H5.773z" /></svg>';
	gvg.icons['pin'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15px" height="26px" viewBox="0 0 15 26"><g opacity="1"><linearGradient id="stem_gradient" gradientUnits="userSpaceOnUse" x1="5.4165" y1="19" x2="13.4171" y2="19"><stop offset="0" style="stop-color:white"/><stop offset="1" style="stop-color:black"/></linearGradient><path opacity="1.00" fill="url(#stem_gradient)" d="M6,13.5C6,12.672,6.671,12,7.5,12S9,12.672,9,13.5v11C9,25.328,8.329,26,7.5,26S6,25.328,6,24.5 V13.5z"/><radialGradient id="ball_gradient" cx="901.7842" cy="-1134.7051" r="19.9659" gradientTransform="matrix(1 0 0 -1 -895.5 -1128.5)" gradientUnits="userSpaceOnUse"><stop offset="0.20" style="stop-color:white"/><stop offset="0.75" style="stop-color:black"/></radialGradient><circle opacity="1.00" fill="url(#ball_gradient)" cx="7.5" cy="7.5" r="7.5"/></g></svg>';
	gvg.icons['square'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11px" height="11px" viewBox="0 0 11 11"><rect opacity="1" fill="white" stroke="black" stroke-width="1" transform="rotate(0 5.5 5.5)" x="1.5" y="1.5" width="8" height="8"/></svg>';
	gvg.icons['star'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="19px" height="19px" viewBox="0 0 19 19"><polygon opacity="1" fill="white" stroke="black" stroke-width="1" transform="rotate(0 9.5 10.062)" points="9.5,1.771 11.361,7.5 17.385,7.5 12.512,11.04 14.374,16.769 9.5,13.229 4.626,16.769 6.488,11.04 1.615,7.5 7.639,7.5 "/></svg>';
	gvg.icons['triangle'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="13px" height="13px" viewBox="0 0 13 13"><polygon opacity="1" fill="white" stroke="black" stroke-width="1" transform="rotate(0 6.5 6.5)" points="0.866,10.758 6.5,1 12.134,10.758" /></svg>';
	gvg.icons['tickmark'].vector = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="13px" height="13px" viewBox="0 0 13 13"><polygon fill="white" stroke="black" stroke-width="1.25" points="10.5,6.5 6.5,2.5 2.5,6.5 6.5,10.5 "/></svg>';
	gvg.icons['arrow'].vector = '<svg xmlns="http://www.w3.org/2000/svg" version="1.0" x="0px" y="0px" width="19px" height="19px" viewBox="0 0 19 19"><g opacity="1"><circle fill="white" cx="9.5" cy="9.5" r="9.5"/><polygon fill="#ffffff" stroke="black" stroke-width="1" stroke-miterlimit="10" points="9.5,4 15,9.5 9.5,15 4,9.5"/></g></svg>';
	gvg.icons['wedge'].vector = '<svg xmlns="http://www.w3.org/2000/svg" version="1.0" x="0px" y="0px" width="19px" height="19px" viewBox="0 0 19 19"><g opacity="1"><circle fill="white" cx="9.5" cy="9.5" r="9.5"/><polygon fill="#ffffff" stroke="black" stroke-width="1" stroke-miterlimit="10" points="9.5,4.5 14.5,9.5 9.5,14.5 4.5,9.5"/></g></svg>';
	
	gvg.icons['airport-r'] = {vector:gvg.icons['airport'].vector};
	gvg.icons['cross-r'] = {vector:gvg.icons['cross'].vector};
	gvg.icons['diamond-r'] = {vector:gvg.icons['diamond'].vector};
	//gvg.icons['google-r'] = {vector:gvg.icons['google'].vector};
	//gvg.icons['googleblank-r'] = {vector:gvg.icons['googleblank'].vector};
	//gvg.icons['googlemini-r'] = {vector:gvg.icons['googlemini'].vector};
	gvg.icons['square-r'] = {vector:gvg.icons['square'].vector};
	gvg.icons['star-r'] = {vector:gvg.icons['star'].vector};
	gvg.icons['triangle-r'] = {vector:gvg.icons['triangle'].vector};
	// the UN-rotated version of the tickmark and arrows are just diamonds; below are the versions that point somewhere.
	gvg.icons['tickmark-r'] = {vector:'<svg version="1.0" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="13px" height="13px" viewBox="0 0 13 13"><polygon fill="white" stroke="black" stroke-width="1" transform="rotate(0 6.5 6.5)" points="11.75,8.5 6.5,3.5 1.25,8.5 "/></svg>'};
	gvg.icons['arrow-r'] = {vector:'<svg xmlns="http://www.w3.org/2000/svg" version="1.0" x="0px" y="0px" width="19px" height="19px" viewBox="0 0 19 19"><g opacity="1" transform="rotate(0 9.5 9.5)"><circle fill="white" cx="9.5" cy="9.5" r="9.5"/><polygon fill="#ffffff" stroke="black" stroke-width="1" stroke-miterlimit="10" points="6.5,15.5 6.5,8.5 4,8.5 9.5,1.793 15,8.5 12.5,8.5 12.5,15.5"/></g></svg>'};
	gvg.icons['wedge-r'] = {vector:'<svg xmlns="http://www.w3.org/2000/svg" version="1.0" x="0px" y="0px" width="19px" height="19px" viewBox="0 0 19 19"><g opacity="1" transform="rotate(0 9.5 9.5)"><circle fill="white" cx="9.5" cy="9.5" r="9.5"/><polygon fill="#ffffff" stroke="black" stroke-width="1" stroke-miterlimit="10" points="4.75,15.75 9.5,1.51 14.25,15.75"/></g></svg>'};
	
	gvg.icons['airport'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTlweCIgaGVpZ2h0PSIxOXB4IiB2aWV3Qm94PSIwIDAgMTkgMTkiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0xMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuOCIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHBvbHlnb24gb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDkuNSA5LjUpIiBwb2ludHM9IjEyLDE4IDE4LDEyIDE4LDcgMTIsMSA3LDEgMSw3IDEsMTIgNywxOCIvPg0KPC9zdmc+DQo=';
	gvg.icons['blankcircle'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNzBweCIgaGVpZ2h0PSI3MHB4IiB2aWV3Qm94PSIwIDAgNzAgNzAiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0yMCUiIGhlaWdodD0iMTQwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjEuOCIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPGNpcmNsZSBvcGFjaXR5PSIwLjQ0IiBmaWxsPSIjMDAwMDAwIiBmaWx0ZXI9InVybCgjYmx1cikiIGN4PSIzNS43NSIgY3k9IjM1Ljc1IiByPSIzMS42MjUiLz4NCjwvc3ZnPg0K';
	gvg.icons['google'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMzdweCIgaGVpZ2h0PSIzNHB4IiB2aWV3Qm94PSIwIDAgMzcgMzQiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0yMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuOCIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHBhdGggb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDEwIDMzKSIgZD0iTTguOTM4LDM0bDAuMzI3LTAuMzMxYzQuODEzLTQuODc4LDMuNzEzLTYuNzA4LDIuNzQzLTguMzIzYy0wLjY3NS0xLjEyMy0xLjMxMi0yLjE4NCwwLjUzNS00LjA1NyBjMi45LTIuOTM4LDkuNzc0LTUuMzI5LDE1LjMyMi01LjMyOXM3LjcwMiwyLjM5MSw0LjgwMyw1LjMyOWMtMS44NDgsMS44NzMtNC41NzgsMi45MzQtNy40Nyw0LjA1NyBjLTQuMTU4LDEuNjE1LTguODY5LDMuNDQ1LTEzLjY4Myw4LjMyM0wxMS4xODgsMzRIOC45Mzh6Ii8+DQo8L3N2Zz4NCg==';
	gvg.icons['googleblank'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMzdweCIgaGVpZ2h0PSIzNHB4IiB2aWV3Qm94PSIwIDAgMzcgMzQiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0yMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuOCIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHBhdGggb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDEwIDMzKSIgZD0iTTguOTM4LDM0bDAuMzI3LTAuMzMxYzQuODEzLTQuODc4LDMuNzEzLTYuNzA4LDIuNzQzLTguMzIzYy0wLjY3NS0xLjEyMy0xLjMxMi0yLjE4NCwwLjUzNS00LjA1NyBjMi45LTIuOTM4LDkuNzc0LTUuMzI5LDE1LjMyMi01LjMyOXM3LjcwMiwyLjM5MSw0LjgwMyw1LjMyOWMtMS44NDgsMS44NzMtNC41NzgsMi45MzQtNy40Nyw0LjA1NyBjLTQuMTU4LDEuNjE1LTguODY5LDMuNDQ1LTEzLjY4Myw4LjMyM0wxMS4xODgsMzRIOC45Mzh6Ii8+DQo8L3N2Zz4NCg==';
	gvg.icons['googlemini'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMjJweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjIgMjAiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0yMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuNyIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHBhdGggb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDYgMjApIiBkPSJNNS4xNzQsMjBjMi45MzgtMy4xMDQsMi42MjQtMy45NjUsMi4xMzYtNC45NjdjLTAuMzQtMC43MTUtMS4zMjMtMS4zNjIsMC4zOTktMy4xODJjMi4yODEtMi40MTEsNi4yMDUtMy4yNzEsOS4xMTktMy4yNzEgYzIuOTEyLDAsNS4yMTMsMC44NiwyLjkzMiwzLjI3MWMtMS43NDYsMS44NDUtNC4wNjksMi41MzEtNS42MTMsMy4xNzZDMTIuMTQxLDE1Ljg3Myw5LjU0MywxNy4wNjIsNi44NzUsMjBINS4xNzR6Ii8+DQo8L3N2Zz4NCg==';
	gvg.icons['camera'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTlweCIgaGVpZ2h0PSIxNXB4IiB2aWV3Qm94PSIwIDAgMTkgMTUiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0xMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjEiIC8+PC9maWx0ZXI+PC9kZWZzPg0KCTxwb2x5Z29uIG9wYWNpdHk9IjAuNDQiIGZpbGw9IiMwMDAwMDAiIGZpbHRlcj0idXJsKCNibHVyKSIgdHJhbnNmb3JtPSJyb3RhdGUoMCA5LjUgNy41KSIgcG9pbnRzPSIxMi4zMTQsMy42NjQgMTIuMzE0LDEuNSA2LjkwNywxLjUgNi45MDcsMy42NjQgNS4yODUsMy42NjQgNS4yODUsMi41ODIgMi41ODEsMi41ODIgMi41ODEsMy42NjQgMS41LDMuNjY0IDEuNSwxMy4zOTYgMTcuNzIzLDEzLjM5NiAxNy43MjMsMy42NjQiLz4NCjwvc3ZnPg0K';
	gvg.icons['circle'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTNweCIgaGVpZ2h0PSIxM3B4IiB2aWV3Qm94PSIwIDAgMTMgMTMiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0xMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuNyIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPGNpcmNsZSBvcGFjaXR5PSIwLjQ0IiBmaWxsPSIjMDAwMDAwIiBmaWx0ZXI9InVybCgjYmx1cikiIGN4PSI2LjUiIGN5PSI2LjUiIHI9IjUuNSIvPg0KPC9zdmc+DQo=';
	gvg.icons['cross'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTVweCIgaGVpZ2h0PSIxNXB4IiB2aWV3Qm94PSIwIDAgMTUgMTUiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0xMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuNyIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHBvbHlnb24gb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDcuNSA3LjUpIiBwb2ludHM9IjEwLDUgMTAsMSA1LDEgNSw1IDEsNSAxLDEwIDUsMTAgNSwxNCAxMCwxNCAxMCwxMCAxNCwxMCAxNCw1Ii8+DQo8L3N2Zz4NCg==';
	gvg.icons['diamond'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTNweCIgaGVpZ2h0PSIxM3B4IiB2aWV3Qm94PSIwIDAgMTMgMTMiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0xMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuNyIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHBvbHlnb24gb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDYuNSA2LjUpIiBwb2ludHM9IjcsMC41IDAuNSw3IDcsMTMuNSAxMy41LDciLz4NCjwvc3ZnPg0K';
	gvg.icons['pin'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMzBweCIgaGVpZ2h0PSIyNnB4IiB2aWV3Qm94PSIwIDAgMzAgMjYiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0yMCUiIGhlaWdodD0iMTI1JSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuOCIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHBhdGggb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDcuNSAyNSkiIGQ9Ik0xMi4wNDIsMTEuMjVjMi43NjgtMi44NzMsOC4zOC00LjM3MywxMi41NC0zLjM1MWM0LjE1NSwxLjAyMyw1LjI4NCw0LjE4MiwyLjUxNyw3LjA1NSBjLTIuNDI3LDIuNTE5LTcuMDMzLDMuOTc5LTEwLjkzNSwzLjYxNmwtNi40NSw2LjY5M2MtMC41NTQsMC41NzUtMS42NzUsMC44NzctMi41MDcsMC42NzJjLTAuODMyLTAuMjA3LTEuMDU2LTAuODM4LTAuNTAzLTEuNDEyIGw2LjQ0OS02LjY5NEMxMC4xODEsMTYuNTAzLDkuNjE4LDEzLjc2OCwxMi4wNDIsMTEuMjV6Ii8+DQo8L3N2Zz4NCg==';
	gvg.icons['square'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTNweCIgaGVpZ2h0PSIxM3B4IiB2aWV3Qm94PSIwIDAgMTMgMTMiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0xMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuNyIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHJlY3Qgb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDYuNSA2LjUpIiB4PSIxLjUiIHk9IjEuNSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+DQo8L3N2Zz4NCg==';
	gvg.icons['star'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTlweCIgaGVpZ2h0PSIxOXB4IiB2aWV3Qm94PSIwIDAgMTkgMTkiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0xMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuNyIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHBvbHlnb24gb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDkuNSAxMCkiIHBvaW50cz0iMTAuMiwyLjQ3MSAxMi44NzcsNy4wNzggMTguMDg1LDguMiAxNC41MzIsMTIuMTcgMTUuMDc0LDE3LjQ3IDEwLjIsMTUuMzE1IDUuMzI2LDE3LjQ3IDUuODY3LDEyLjE2OSAyLjMxNSw4LjIgNy41MjQsNy4wNzkiLz4NCjwvc3ZnPg0K';
	gvg.icons['triangle'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTVweCIgaGVpZ2h0PSIxNXB4IiB2aWV3Qm94PSIwIDAgMTUgMTUiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0xMCUiIGhlaWdodD0iMTIwJSI+PGZlR2F1c3NpYW5CbHVyIGluPSJTb3VyY2VHcmFwaGljIiBzdGREZXZpYXRpb249IjAuNyIgLz48L2ZpbHRlcj48L2RlZnM+DQoJPHBvbHlnb24gb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDcuNSA3LjUpIiBwb2ludHM9IjcuNjk1LDAuOCAxLDEyLjM5NiAxNC4zOSwxMi4zOTYiIC8+DQo8L3N2Zz4NCg==';
	// gvg.icons['tickmark'].vector_shadow = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTNweCIgaGVpZ2h0PSIxM3B4IiB2aWV3Qm94PSIwIDAgMTMgMTMiPg0KCTxkZWZzPjxmaWx0ZXIgaWQ9ImJsdXIiIHk9Ii0zMCUiIGhlaWdodD0iMTYwJSIgeD0iLTMwJSIgd2lkdGg9IjE2MCUiPjxmZUdhdXNzaWFuQmx1ciBpbj0iU291cmNlR3JhcGhpYyIgc3RkRGV2aWF0aW9uPSIwLjciIC8+PC9maWx0ZXI+PC9kZWZzPg0KCTxjaXJjbGUgb3BhY2l0eT0iMC40NCIgZmlsbD0iIzAwMDAwMCIgZmlsdGVyPSJ1cmwoI2JsdXIpIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDYuNSA2LjUpIiBjeD0iNi41IiBjeT0iNi41IiByPSIzIi8+DQo8L3N2Zz4NCg==';
	gvg.icons['arrow'].vector_shadow = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSI+PGRlZnM+PGZpbHRlciBpZD0iYmx1ciIgeT0iLTEwJSIgaGVpZ2h0PSIxMjAlIj48ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iMC43IiAvPjwvZmlsdGVyPjwvZGVmcz48Y2lyY2xlIG9wYWNpdHk9IjAuNDQiIGZpbGw9IiMwMDAwMDAiIGZpbHRlcj0idXJsKCNibHVyKSIgY3g9IjEwLjUiIGN5PSIxMC41IiByPSI5LjUiLz48L3N2Zz4=';
	gvg.icons['wedge'].vector_shadow = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSI+PGRlZnM+PGZpbHRlciBpZD0iYmx1ciIgeT0iLTEwJSIgaGVpZ2h0PSIxMjAlIj48ZmVHYXVzc2lhbkJsdXIgaW49IlNvdXJjZUdyYXBoaWMiIHN0ZERldmlhdGlvbj0iMC43IiAvPjwvZmlsdGVyPjwvZGVmcz48Y2lyY2xlIG9wYWNpdHk9IjAuNDQiIGZpbGw9IiMwMDAwMDAiIGZpbHRlcj0idXJsKCNibHVyKSIgY3g9IjEwLjUiIGN5PSIxMC41IiByPSI5LjUiLz48L3N2Zz4=';
	
}

function GV_Background_Map_List() {
	return [	
		{ id:google.maps.MapTypeId.ROADMAP, menu_order:1.1, menu_name:'Google map', description:'Google street map', min_zoom:0, max_zoom:21 }
		,{ id:google.maps.MapTypeId.HYBRID, menu_order:1.2, menu_name:'Google hybrid', description:'Google "hybrid" map', min_zoom:0, max_zoom:20 }
		,{ id:google.maps.MapTypeId.SATELLITE, menu_order:1.3, menu_name:'Google aerial', description:'Google aerial/satellite imagery', min_zoom:0, max_zoom:20 }
		,{ id:google.maps.MapTypeId.TERRAIN, menu_order:1.4, menu_name:'Google terrain', description:'Google terrain map', min_zoom:0, max_zoom:21 }
		,{ id:'ROADMAP_DESATURATED', menu_order:1.11*0, menu_name:'Google map, gray', description:'Google map, gray', min_zoom:0, max_zoom:21, google_id:'google.maps.MapTypeId.ROADMAP', style:[ { "featureType": "landscape", "stylers": [ { "saturation": -100 } ] },{ "featureType": "poi.park",  "elementType": "geometry", "stylers": [ { "visibility": "off" } ] },{ "featureType": "poi", "elementType": "geometry", "stylers": [ { "visibility": "off" } ] },{ "featureType": "landscape.man_made", "elementType": "geometry", "stylers": [ { "visibility": "off" } ] },{ "featureType": "transit.station.airport", "elementType": "geometry.fill", "stylers": [ { "saturation": -50 }, { "lightness": 20 } ] },{ "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "lightness": -60 } ] },{ "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#000000" } ] },{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [ { "color": "#000000" } ] } ] }
		,{ id:'TERRAIN_HIGHCONTRAST', menu_order:1.41*0, menu_name:'Google map, H.C.', description:'Google map, high-contrast', min_zoom:0, max_zoom:18, google_id:'google.maps.MapTypeId.TERRAIN', style:[ { featureType:'poi', stylers:[{visibility:'off'}]} ,{ featureType:'road', elementType:'geometry', stylers:[{color:'#993333'}] } ,{ featureType:'administrative', elementType:'geometry.stroke', stylers:[{color:'#000000'}] } ,{ featureType:'administrative', elementType:'labels.text.fill', stylers:[{color:'#000000'}] } ,{ featureType:'administrative.country', elementType:'labels', stylers:[{visibility:'off'}] } ,{ featureType:'administrative.province', elementType:'labels', stylers:[{visibility:'off'}] } ,{ featureType:'administrative.locality', elementType:'geometry', stylers:[{visibility:'off'}] } ] }
		,{ id:'ARCGIS_HILLSHADING', menu_order:4.99*0, menu_name:'ArcGIS hillshading', description:'Global relief shading tiles from ESRI/ArcGIS', credit:'Relief shading from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:1, max_zoom:15, url:'//server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}.jpg' }
		,{ id:'ARCGIS_HILLSHADING_US', menu_order:4.99*0, menu_name:'ArcGIS hillshading', description:'Global relief shading tiles from ESRI/ArcGIS', credit:'Relief shading from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:1, max_zoom:16, url:'//server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}.jpg' }
		,{ id:'OPENMAPSURFER_RELIEF', menu_order:4.99*0, menu_name:'OMS hillshading', description:'Global relief shading tiles from ESRI/ArcGIS', credit:'Relief shading from <a target="_blank" href="http://korona.geog.uni-heidelberg.de/contact.html">OpenMapSurfer</a>', error_message:'OpenMapSurfer tiles unavailable', min_zoom:1, max_zoom:16, url:'https://korona.geog.uni-heidelberg.de/tiles/asterh/tms_hs.ashx?x={x}&y={y}&z={z}' }
		,{ id:'OPENSTREETMAP', menu_order:2.0, menu_name:'OSM (OpenStreetMap.org)', description:'OpenStreetMap.org', credit:'Map data from <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap.org</a>', error_message:'OpenStreetMap tiles unavailable', min_zoom:0, max_zoom:19, url:'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png' }
		,{ id:'OPENSTREETMAP_RELIEF', menu_order:2.01, menu_name:'OSM + relief shading', description:'OSM data overlaid with relief shading tiles from ESRI/ArcGIS', credit:'Map data from <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap.org</a>, relief from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS or OSM tiles unavailable', min_zoom:1, max_zoom:13, url:'//server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}.jpg', background:'GV_OSM', opacity:0.25 }
		,{ id:'OPENSTREETMAP_RELIEF2', menu_order:2.01*0, menu_name:'OSM + relief shading', description:'OSM data overlaid with relief shading tiles from ESRI/ArcGIS', credit:'Map data from <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap.org</a>, relief from <a target="_blank" href="http://korona.geog.uni-heidelberg.de/contact.html">OpenMapSurfer</a>', error_message:'OMS or OSM tiles unavailable', min_zoom:1, max_zoom:16, url:'https://korona.geog.uni-heidelberg.de/tiles/asterh/tms_hs.ashx?x={x}&y={y}&z={z}', background:'GV_OSM', opacity:0.25 }
		,{ id:'OSM_GOOGLE_AERIAL', menu_order:2.02*0, menu_name:'OSM + Google aerial', description:'OSM maps overlaid upon Google aerial imagery', credit:'Map data from <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap.org</a>', error_message:'OpenStreetMap tiles unavailable', min_zoom:1, max_zoom:20, url:'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', opacity:0.5, background:'GV_AERIAL' }
		,{ id:'TF_NEIGHBOURHOOD', menu_order:2.10, menu_name:'OSM (TF neighbourhood)', description:'OSM "neighborhood" maps from Thunderforest.com', credit:'Maps &copy;<a target="_blank" href="https://www.thunderforest.com/">ThunderForest</a>, Data &copy;<a target="_blank" href="https://openstreetmap.org/copyright">OSM</a> contributors', error_message:'ThunderForest tiles unavailable', min_zoom:1, max_zoom:20, url:'//tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png{api_key}', api_key:'?apikey={thunderforest}', visible_without_key:true }
		,{ id:'TF_TRANSPORT', menu_order:2.11, menu_name:'OSM (TF transit)', description:'OSM-based transport data from Thunderforest.com', credit:'OSM data from <a target="_blank" href="https://www.thunderforest.com/">Thunderforest.com</a>', error_message:'Thunderforest tiles unavailable', min_zoom:1, max_zoom:17, url:'//tile.thunderforest.com/transport/{z}/{x}/{y}.png{api_key}', api_key:'?apikey={thunderforest}', visible_without_key:true }
		,{ id:'TF_LANDSCAPE', menu_order:2.12, menu_name:'OSM (TF landscape)', description:'OSM "landscape" maps from Thunderforest.com', credit:'Maps &copy;<a target="_blank" href="https://www.thunderforest.com/">ThunderForest</a>, Data &copy;<a target="_blank" href="https://openstreetmap.org/copyright">OSM</a> contributors', error_message:'ThunderForest tiles unavailable', min_zoom:1, max_zoom:20, url:'//tile.thunderforest.com/landscape/{z}/{x}/{y}.png{api_key}', api_key:'?apikey={thunderforest}', visible_without_key:true }
		,{ id:'TF_OUTDOORS', menu_order:2.13, menu_name:'OSM (TF outdoors)', description:'OSM "outdoors" maps from Thunderforest.com', credit:'Maps &copy;<a target="_blank" href="https://www.thunderforest.com/">ThunderForest</a>, Data &copy;<a target="_blank" href="https://openstreetmap.org/copyright">OSM</a> contributors', error_message:'ThunderForest tiles unavailable', min_zoom:1, max_zoom:20, url:'//tile.thunderforest.com/outdoors/{z}/{x}/{y}.png{api_key}', api_key:'?apikey={thunderforest}', visible_without_key:true }
		,{ id:'OPENTOPOMAP', menu_order:2.20, menu_name:'OpenTopoMap', description:'OpenTopoMap.org', credit:'Map data from <a target="_blank" href="http://www.opentopomap.org/">OpenTopoMap.org</a>', error_message:'OpenTopoMap tiles unavailable', min_zoom:1, max_zoom:17, url:'https://opentopomap.org/{z}/{x}/{y}.png' }
		// ,{ id:'KOMOOT_OSM', menu_order:2.21, menu_name:'OSM topo (Komoot.de)', description:'OpenStreetMap tiles from Komoot.de', credit:'OSM tiles from <a target="_blank" href="http://www.komoot.de/">Komoot</a>', error_message:'Komoot OSM tiles unavailable', min_zoom:1, max_zoom:18, url:'http://{s}.tile.komoot.de/komoot/{z}/{x}/{y}{r}.png' }
		,{ id:'KOMOOT_OSM', menu_order:2.21, menu_name:'OSM topo (Komoot.de)', description:'OpenStreetMap tiles from Komoot.de', credit:'OSM tiles from <a target="_blank" href="http://www.komoot.de/">Komoot</a>', error_message:'Komoot OSM tiles unavailable', min_zoom:1, max_zoom:18, url:'https://{s}.tile.hosted.thunderforest.com/komoot/{z}/{x}/{y}{r}.png' }
		,{ id:'FOURUMAPS_TOPO', menu_order:2.22, menu_name:'OSM topo (4UMaps)', description:'OSM-based topo maps from 4UMaps.eu', credit:'Map data from <a target="_blank" href="http://www.openstreetmap.org/">OpenStreetMap</a> &amp; <a target="_blank" href="http://www.4umaps.eu/">4UMaps.eu</a>', error_message:'4UMaps tiles unavailable', min_zoom:1, max_zoom:15, url:'https://tileserver.4umaps.com/{z}/{x}/{y}.png' }
		,{ id:'OPENCYCLEMAP', menu_order:2.30, menu_name:'OpenCycleMap', description:'OpenCycleMap.org via ThunderForest.com', credit:'Maps &copy;<a target="_blank" href="https://www.thunderforest.com/">ThunderForest</a>, Data &copy;<a target="_blank" href="https://openstreetmap.org/copyright">OSM</a> contributors', error_message:'OpenCycleMap tiles unavailable', min_zoom:1, max_zoom:17, url:'//tile.thunderforest.com/cycle/{z}/{x}/{y}{r}.png{api_key}', api_key:'?apikey={thunderforest}', visible_without_key:true }
		,{ id:'OPENSNOWMAP_OVERLAY', menu_order:2.31*0, menu_name:'OpenSnowMap overlay', description:'OpenSnowMap.org', credit:'Winter trail data from <a target="_blank" href="http://www.opensnowmap.org/">OpenSnowMap.org</a> CC-BY-SA', error_message:'OpenSnowMap tiles unavailable', min_zoom:1, max_zoom:17, url:['//tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png'] }
		,{ id:'OPENSNOWMAP', menu_order:2.31, menu_name:'OpenSnowMap', description:'OpenSnowMap.org', credit:'Winter trail data from <a target="_blank" href="http://www.opensnowmap.org/">OpenSnowMap.org</a> CC-BY-SA, maps from <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', error_message:'OpenSnowMap or OpenStreetMap tiles unavailable', min_zoom:1, max_zoom:13, url:'//server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}.jpg', opacity:0.25, background:'OPENSTREETMAP', foreground:'OPENSNOWMAP_OVERLAY' }
		,{ id:'OPENSNOWMAP_AERIAL', menu_order:2.31*0, menu_name:'OpenSnowMap+aerial', description:'OpenSnowMap.org', credit:'Winter trail data from <a target="_blank" href="http://www.opensnowmap.org/">OpenSnowMap.org</a> CC-BY-SA', error_message:'OpenSnowMap tiles unavailable', min_zoom:1, max_zoom:19, url:'//tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png', opacity:1, background:'GV_AERIAL' }
		,{ id:'OPENSEAMAP', menu_order:2.32, menu_name:'OpenSeaMap', description:'OpenSeaMap.org', credit:'Map data from <a target="_blank" href="http://www.openseamap.org/">OpenSeaMap.org</a>', error_message:'OpenSeaMap tiles unavailable', min_zoom:1, max_zoom:17, url:['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png','http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'] }
		// ,{ id:'MAPQUEST_OSM', menu_order:2.99, menu_name:'OSM (MapQuest)', description:'Global street map tiles from MapQuest', credit:'OpenStreetMap data from <a target="_blank" href="http://developer.mapquest.com/web/products/open/map">MapQuest</a>', error_message:'MapQuest tiles unavailable', min_zoom:0, max_zoom:19, url:'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg' }
		,{ id:'ARCGIS_STREET', menu_order:4.0, menu_name:'ArcGIS street map', description:'Global street map tiles from ESRI/ArcGIS', credit:'Street maps from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:1, max_zoom:19, url:'//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.jpg' }
		,{ id:'ARCGIS_HYBRID', menu_order:4.1, menu_name:'ArcGIS hybrid', description:'Aerial imagery and labels from ESRI/ArcGIS', credit:'Imagery and map data from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:1, max_zoom:16, url:['//services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}.png','//services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}.png'],background:'ARCGIS_AERIAL' }
		,{ id:'ARCGIS_AERIAL', menu_order:4.2, menu_name:'ArcGIS aerial', description:'Aerial imagery tiles from ESRI/ArcGIS', credit:'Aerial imagery from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:1, max_zoom:19, url:'//services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg' }
		,{ id:'ARCGIS_AERIAL2', menu_order:4.21, menu_name:'ArcGIS aerial ("Clarity")', description:'Clarity Aerial imagery tiles from ESRI/ArcGIS', credit:'Aerial imagery from <a target="_blank" href="http://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:1, max_zoom:19, url:'//clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg' }
		,{ id:'ARCGIS_RELIEF', menu_order:4.3, menu_name:'ArcGIS relief/topo', description:'Global relief tiles from ArcGIS', credit:'Relief maps from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:1, max_zoom:19, url:'//services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.jpg' }
		,{ id:'ARCGIS_OCEANS', menu_order:4.4, menu_name:'ArcGIS oceans', description:'Sea floor relief and labels from ESRI/ArcGIS', credit:'Map data from <a target="_blank" href="https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:0, max_zoom:16, url:['//services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}.jpg','//services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}.png'] }
		,{ id:'ARCGIS_TERRAIN', menu_order:4.5*0, menu_name:'ArcGIS terrain', description:'Terrain/relief and labels from ESRI/ArcGIS', credit:'Map data from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:1, max_zoom:13, url:['//server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}.jpg','//server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}.png'] }
		// ,{ id:'OPENSEAMAP_MAPQUEST', menu_order:5.11, menu_name:'OpenSeaMap (MQ)', description:'OpenSeaMap.org', credit:'Map data from <a target="_blank" href="http://www.openseamap.org/">OpenSeaMap.org</a>', error_message:'OpenSeaMap tiles unavailable', min_zoom:1, max_zoom:17, url:['http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg','http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'] }
		,{ id:'NATIONALGEOGRAPHIC', menu_order:5.2, menu_name:'National Geographic', description:'National Geographic atlas', credit:'NGS maps from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ESRI/ArcGIS</a>', error_message:'National Geographic tiles unavailable', min_zoom:1, max_zoom:16, url:'//services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}.jpg' }
		,{ id:'STRAVA_HEATMAP_HYBRID', menu_order:5.3*0, menu_name:'Strava track heat map', description:'Strava GPS tracks with hybrid background', credit:'GPS track heat maps from <a target="_blank" href="http://www.strava.com/">Strava</a>', error_message:'Strava data unavailable', min_zoom:2, max_zoom:12, url:'https://heatmap-external-a.strava.com/tiles/all/hot/{z}/{x}/{y}.png?px=256', opacity:0.90, background:'GV_HYBRID' }
		,{ id:'STRAVA_HEATMAP_HYBRID_AUTH', menu_order:5.31*0, menu_name:'Strava auth.+hybrid', description:'Strava GPS tracks (authenticated) with hybrid background', credit:'GPS track heat maps from <a target="_blank" href="http://www.strava.com/">Strava</a>', error_message:'Strava data unavailable', min_zoom:2, max_zoom:16, url:'https://heatmap-external-a.strava.com/tiles-auth/all/hot/{z}/{x}/{y}.png?px=256', opacity:0.90, background:'GV_HYBRID' }
		,{ id:'STRAVA_HEATMAP_OSM_AUTH', menu_order:5.32*0, menu_name:'Strava auth.+OSM', description:'Strava GPS tracks (authenticated) with OSM background', credit:'GPS track heat maps from <a target="_blank" href="http://www.strava.com/">Strava</a>', error_message:'Strava data unavailable', min_zoom:2, max_zoom:16, url:'https://heatmap-external-a.strava.com/tiles-auth/all/hot/{z}/{x}/{y}.png?px=256', opacity:0.90, background:'GV_OSM_RELIEF' }
		,{ id:'STRAVA_HEATMAP_AUTH', menu_order:5.32*0, menu_name:'Strava authenticated', description:'Strava GPS tracks (authenticated)', credit:'GPS track heat maps from <a target="_blank" href="http://www.strava.com/">Strava</a>', error_message:'Strava data unavailable', min_zoom:2, max_zoom:16, url:'https://heatmap-external-a.strava.com/tiles-auth/all/hot/{z}/{x}/{y}.png?px=256', opacity:1 }
		,{ id:'BLUEMARBLE', menu_order:5.4*0, menu_name:'Blue Marble', description:'NASA "Visible Earth" image', credit:'Map by DEMIS', error_message:'DEMIS server unavailable', min_zoom:3, max_zoom:8, tile_size:256, url:'http://www2.demis.nl/wms/wms.asp?service=WMS&wms=BlueMarble&wmtver=1.0.0&request=GetMap&srs=EPSG:4326&format=jpeg&transparent=false&exceptions=inimage&wrapdateline=true&layers=Earth+Image,Borders' }
		,{ id:'STAMEN_TOPOSM3', menu_order:6*0, menu_name:'TopOSM (3 layers)', description:'OSM data with relief shading and contours', credit:'Map tiles by <a target="_blank" href="http://maps.stamen.com/">Stamen</a> under <a target="_blank" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_blank" href="https://openstreetmap.org">OSM</a> under <a target="_blank" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY-SA</a>.', error_message:'stamen.com tiles unavailable', min_zoom:1, max_zoom:15, url:['http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg','http://tile.stamen.com/toposm-contours/{z}/{x}/{y}.png','http://tile.stamen.com/toposm-features/{z}/{x}/{y}.png'],opacity:[1,0.75,1] }
		,{ id:'STAMEN_OSM_TRANSPARENT', menu_order:6*0, menu_name:'Transparent OSM', description:'OSM data with transparent background', credit:'Map tiles by <a href="https://openstreetmap.org">OSM</a> under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY-SA</a>', error_message:'OSM tiles unavailable', min_zoom:1, max_zoom:15, url:'http://tile.stamen.com/toposm-features/{z}/{x}/{y}.png' }
		// ,{ id:'DEMIS_PHYSICAL', menu_order:0, menu_name:'DEMIS physical', description:'DEMIS physical map (no labels)', credit:'Map by DEMIS', error_message:'DEMIS server unavailable', min_zoom:1, max_zoom:17, tile_size:256, url:'http://www2.demis.nl/wms/wms.asp?version=1.1.0&wms=WorldMap&request=GetMap&srs=EPSG:4326&format=jpeg&transparent=false&exceptions=inimage&wrapdateline=true&layers=Bathymetry,Countries,Topography,Coastlines,Waterbodies,Rivers,Streams,Highways,Roads,Railroads,Trails,Hillshading,Borders' } // doesn't work well, projection-wise
		,{ id:'US_ARCGIS_TOPO', menu_order:11.1, menu_name:'us: USGS topo (ArcGIS)', description:'US topo tiles from ArcGIS', credit:'Topo maps from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer">ESRI/ArcGIS</a>', error_message:'ArcGIS tiles unavailable', min_zoom:1, max_zoom:15, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], bounds_subtract:[-129.97,49.01,-66,90],  url:'//services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}.jpg' }
		,{ id:'US_CALTOPO_RELIEF', menu_order:11.1*0, menu_name:'us: Hillshading (CalTopo)', description:'US relief shading from CalTopo', credit:'US relief shading from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USGS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], url:'//caltopo.com/tile/hs_m315z45s3/{z}/{x}/{y}.png' }
		,{ id:'US_CALTOPO_USGS', menu_order:11.11, menu_name:'us: USGS topo (CalTopo)', description:'US topo tiles from CalTopo', credit:'USGS topo maps from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USGS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-168,18,-52,68], bounds_subtract:[-129,49.5,-66,72], url:'//caltopo.s3.amazonaws.com/topo/{z}/{x}/{y}.png' }
		,{ id:'US_CALTOPO_USGS_RELIEF', menu_order:11.12, menu_name:'us: USGS+relief (CalTopo)', description:'US relief-shaded topo from CalTopo', credit:'USGS topo+relief from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USGS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-125,24,-66,49.5], url:'//caltopo.s3.amazonaws.com/topo/{z}/{x}/{y}.png', foreground:'US_CALTOPO_RELIEF', foreground_opacity:[0.12] }
		,{ id:'US_CALTOPO_USFS', menu_order:11.13, menu_name:'us: USFS (CalTopo)', description:'U.S. Forest Service tiles from CalTopo', credit:'US Forest Service topos from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USFS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-125,24,-66,49.5], url:'//ctusfs.s3.amazonaws.com/2016a/{z}/{x}/{y}.png' }
		,{ id:'US_CALTOPO_USFS_RELIEF', menu_order:11.14, menu_name:'us: USFS+relief (CalTopo)', description:'U.S. Forest Service + relief from CalTopo', credit:'US Forest Service topos from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USFS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], url:'//ctusfs.s3.amazonaws.com/2016a/{z}/{x}/{y}.png', foreground:'US_CALTOPO_RELIEF', foreground_opacity:[0.12] }
		,{ id:'US_CALTOPO_USFS13', menu_order:11.131*0, menu_name:'us: USFS 2013', description:'U.S. Forest Service tiles from CalTopo', credit:'US Forest Service topos from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USFS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-125,24,-66,49.5], url:'//ctusfs.s3.amazonaws.com/fstopo/{z}/{x}/{y}.png' }
		,{ id:'US_CALTOPO_USFS13_RELIEF', menu_order:11.141*0, menu_name:'us: USFS 2013 (CalTopo)', description:'U.S. Forest Service + relief from CalTopo', credit:'US Forest Service topos from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USFS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], background:'US_CALTOPO_USFS13', url:'//ctrelief.s3.amazonaws.com/relief/{z}/{x}/{y}.png', opacity:0.25 }
		,{ id:'US_CALTOPO_USGS_CACHE', menu_order:11.12*0, menu_name:'us: USGS topo (CalTopo*)', description:'Cached USGS tiles from CalTopo', credit:'Cached USGS topo maps from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USGS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-168,18,-52,68], bounds_subtract:[-129.97,49.01,-66,90], url:'http://maps.gpsvisualizer.com/bg/caltopo_usgs/{z}/{x}/{y}.png' }
		,{ id:'US_CALTOPO_RELIEF_CACHE', menu_order:11.14*0, menu_name:'us: relief shading (CalTopo*)', description:'Cached relief shading from CalTopo', credit:'Cached relief shading from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USGS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], url:'http://maps.gpsvisualizer.com/bg/ctrelief/{z}/{x}/{y}.png' }
		,{ id:'US_CALTOPO_USGS_RELIEF_CACHE', menu_order:11.12*0, menu_name:'us: USGS+relief (CalTopo*)', description:'Cached relief-shaded topo from CalTopo', credit:'Cached topo+relief from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo USGS tiles unavailable', min_zoom:8, max_zoom:16, country:'us', bounds:[-125,24,-66,49.5], background:'US_CALTOPO_USGS_CACHE', url:'http://maps.gpsvisualizer.com/bg/ctrelief/{z}/{x}/{y}.png', opacity:[0.25] }
		,{ id:'US_NATURALATLAS_TOPO', menu_order:11.13*0, menu_name:'us: Natural Atlas topo', description:'Natural Atlas topo tiles', credit:'Map data from <a target="_blank" href="http://www.naturalatlas.com/">Natural Atlas<'+'/a>', error_message:'Natural Atlas tiles unavailable', min_zoom:4, max_zoom:15, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], url:'//naturalatlas-tiles.global.ssl.fastly.net/topo/{z}/{x}/{y}/t.jpg' }
		// ,{ id:'MYTOPO', menu_order:11.141*0, menu_name:'.us/.ca: MyTopo', description:'US+Canadian topo tiles from MyTopo.com', credit:'Topo maps &#169; <a href="http://www.mytopo.com/?pid=gpsvisualizer" target="_blank">MyTopo.com</a>', error_message:'MyTopo tiles unavailable', min_zoom:7, max_zoom:16, country:'us,ca', bounds:[-169,18,-52,85], url:'http://maps.mytopo.com/gpsvisualizer/tilecache.py/1.0.0/topoG/{z}/{x}/{y}.png' }
		,{ id:'US_CALTOPO_FIRES', menu_order:11.15*0, menu_name:'us: Fire Activity (CalTopo)', description:'Current wildfire activity in the U.S.', credit:'<a target="_blank" href="https://caltopo.com/">CalTopo.com<'+'/a>', error_message:'Fire data unavailable', min_zoom:5, max_zoom:14, url:'https://caltopo.com/tile/modis_mp/{z}/{x}/{y}.png' }
		,{ id:'US_CALTOPO_FIRES_HYBRID', menu_order:11.15*0, menu_name:'us: Fire Activity (CalTopo)', description:'Current wildfire activity in the U.S.', credit:'<a target="_blank" href="https://caltopo.com/">CalTopo.com<'+'/a>', error_message:'Fire data unavailable', min_zoom:5, max_zoom:14, url:'https://caltopo.com/tile/modis_mp/{z}/{x}/{y}.png', opacity:0.8, background:'GV_HYBRID' }
		,{ id:'US_OPENSTREETMAP_RELIEF', menu_order:11.16, menu_name:'us: OpenStreetMap+relief', description:'OpenStreetMap + CalTopo relief', credit:'Map data from <a target="_blank" href="http://www.openstreetmap.org/copyright">OSM<'+'/a>, relief from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'OpenStreetMap tiles unavailable', min_zoom:5, max_zoom:16, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], background:'GV_OSM', url:'//caltopo.com/tile/hs_m315z45s3/{z}/{x}/{y}.png', opacity:0.12 }
		// ,{ id:'US_OPENSTREETMAP_RELIEF', menu_order:11.16, menu_name:'us: OpenStreetMap+relief', description:'OpenStreetMap + CalTopo relief', credit:'Map data from <a target="_blank" href="http://www.openstreetmap.org/copyright">OSM<'+'/a>, relief from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'OpenStreetMap tiles unavailable', min_zoom:5, max_zoom:16, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], url:'//server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}.jpg', background:'GV_OSM', opacity:0.25 }
		,{ id:'US_STAMEN_TERRAIN', menu_order:11.20, menu_name:'us: Terrain (Stamen/OSM)', description:'Terrain (similar to Google Maps terrain)', credit:'Map tiles by <a href="http://maps.stamen.com/">Stamen</a> under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="https://openstreetmap.org">OSM</a> under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY-SA</a>.', error_message:'stamen.com tiles unavailable', min_zoom:4, max_zoom:18, country:'us', bounds:[-125,24,-66,50], url:'http://tile.stamen.com/terrain/{z}/{x}/{y}{r}.png' }
		// ,{ id:'US_MAPQUEST_AERIAL', menu_order:11.3, menu_name:'us: Aerial (MQ)', description:'OpenAerial tiles from MapQuest', credit:'OpenAerial imagery from <a target="_blank" href="http://developer.mapquest.com/web/products/open/map">MapQuest</a>', error_message:'MapQuest tiles unavailable', min_zoom:0, max_zoom:18, bounds:[-125,24,-66,50], url:'http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg' }
		// ,{ id:'US_NAIP_AERIAL', menu_order:11.31, menu_name:'us: Aerial (NAIP)', description:'US NAIP aerial photos', credit:'NAIP aerial imagery from <a target="_blank" href="http://www.fsa.usda.gov/FSA/apfoapp?area=home&amp;subject=prog&amp;topic=nai">USDA</a>', error_message:'NAIP imagery unavailable', min_zoom:6, max_zoom:19, country:'us', bounds:[-125,24,-66,49.5], tile_size:512, url:'https://services.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage?f=image&srs=EPSG:3857&size=512,512', type:'wms' }
		,{ id:'US_NAIP_AERIAL', menu_order:11.31, menu_name:'us: Aerial (NAIP+)', description:'US NAIP Plus aerial photos', credit:'NAIP Plus imagery from <a target="_blank" href="http://www.fsa.usda.gov/FSA/apfoapp?area=home&amp;subject=prog&amp;topic=nai">USDA</a>', error_message:'NAIP imagery unavailable', min_zoom:6, max_zoom:19, country:'us', bounds:[-125,24,-66,49.5], tile_size:512, url:'https://services.nationalmap.gov/arcgis/rest/services/USGSNAIPPlus/MapServer/export?f=image&format=jpg&layers=show:0,4,8,12,16,20,24,28,32&srs=EPSG:3857&size=512,512', type:'wms' }
		,{ id:'US_USTOPO_AERIAL', menu_order:11.32, menu_name:'us: Aerial (USTopo)', description:'US aerial imagery from USTopo', credit:'Aerial imagery from USTopo', error_message:'USTopo imagery unavailable', min_zoom:7, max_zoom:16, country:'us', bounds:[-125,24,-66,49.5], tile_size:256, url:'//ustopo.s3.amazonaws.com/orthoimage/{z}/{x}/{y}.png' }
		//,{ id:'US_NAIP_OSM', menu_order:11.33, menu_name:'us: Aerial+OSM', description:'US NAIP aerial photos with OSM overlay', credit:'NAIP aerial imagery from <a target="_blank" href="http://www.fsa.usda.gov/FSA/apfoapp?area=home&amp;subject=prog&amp;topic=nai">USDA</a>, topo tiles by <a href="http://maps.stamen.com/">Stamen</a> under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>', error_message:'NAIP imagery unavailable', min_zoom:7, max_zoom:15, country:'us', bounds:[-125,24,-66,49.5], tile_size:256, background:'US_NAIP_AERIAL', url:'http://tile.stamen.com/toposm-features/{z}/{x}/{y}.png' }
		//,{ id:'US_NAIP_TOPO', menu_order:11.34, menu_name:'us: Aerial+topo', description:'', credit:'NAIP aerial imagery from <a target="_blank" href="http://www.fsa.usda.gov/FSA/apfoapp?area=home&amp;subject=prog&amp;topic=nai">USDA</a>, map tiles by <a href="http://maps.stamen.com/">Stamen</a> under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>', error_message:'stamen.com topo tiles unavailable', min_zoom:1, max_zoom:15, country:'us', bounds:[-125,24,-66,49.5], url:['http://nimbus.cr.usgs.gov/ArcGIS/services/Orthoimagery/USGS_EDC_Ortho_NAIP/ImageServer/WMSServer?service=WMS&request=GetMap&version=1.1.1&format=image/jpeg&exceptions=application/vnd.ogc.se_inimage&srs=EPSG:4326&styles=&layers=0','http://tile.stamen.com/toposm-contours/{z}/{x}/{y}.png','http://tile.stamen.com/toposm-features/{z}/{x}/{y}.png'],opacity:[0.6,1,1] }
		,{ id:'US_NATIONAL_ATLAS', menu_order:11.4, menu_name:'us: National Atlas', description:'United States National Atlas base map', credit:'Base map from <a target="_blank" href="http://nationalatlas.gov/policies.html">The National Atlas</a>', error_message:'National Atlas unavailable', min_zoom:1, max_zoom:15, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], bounds_subtract:[-129,49.5,-66,72], url:'https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}' }
		,{ id:'US_NATIONAL_ATLAS_HYBRID', menu_order:11.4, menu_name:'us: Nat\'l Atlas+aerial', description:'United States National Atlas base map', credit:'Base map from <a target="_blank" href="http://nationalatlas.gov/policies.html">The National Atlas</a>', error_message:'National Atlas unavailable', min_zoom:1, max_zoom:15, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], bounds_subtract:[-129,49.5,-66,72], url:'https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}' }
		,{ id:'US_COUNTIES', menu_order:11.5, menu_name:'us: County outlines', description:'United States county outlines', credit:'US Counties from <a target="_blank" href="https://tigerweb.geo.census.gov/tigerwebmain/TIGERweb_main.html">US Census Bureau</a>', error_message:'TIGERweb tiles unavailable', min_zoom:6, max_zoom:12, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], bounds_subtract:[-129,49.5,-66,72], tile_size:256, url:['https://tigerweb.geo.census.gov/arcgis/services/TIGERweb/tigerWMS_Current/MapServer/WMSServer?service=WMS&version=1.1.1&request=GetMap&format=image/jpeg&transparent=false&exceptions=application/vnd.ogc.se_inimage&srs=EPSG:4326&styles=&layers=Counties','https://carto.nationalmap.gov/arcgis/services/govunits/MapServer/WMSServer?service=WMS&request=GetMap&version=1.1.1&request=GetMap&format=image/png&transparent=true&srs=EPSG:4326&layers=1,2&styles='] }
		,{ id:'US_COUNTIES_OSM', menu_order:11.51, menu_name:'us: Counties+OSM', description:'United States county outlines + OSM', credit:'US Counties from <a target="_blank" href="https://tigerweb.geo.census.gov/tigerwebmain/TIGERweb_main.html">US Census Bureau</a>', error_message:'TIGERweb tiles unavailable', min_zoom:6, max_zoom:16, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], bounds_subtract:[-129,49.5,-66,72], tile_size:256, url:['https://tile.openstreetmap.org/{z}/{x}/{y}.png','//server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}.jpg','https://tigerweb.geo.census.gov/arcgis/services/TIGERweb/tigerWMS_Current/MapServer/WMSServer?service=WMS&request=GetMap&version=1.1.1&format=image/png&transparent=true&exceptions=application/vnd.ogc.se_inimage&srs=EPSG:4326&styles=&layers=Counties'], opacity:[0.7,0.2,1] }
		,{ id:'US_COUNTIES_GOOGLE', menu_order:11.52, menu_name:'us: Counties+Google', description:'United States county outlines + Google', credit:'US Counties from <a target="_blank" href="https://tigerweb.geo.census.gov/tigerwebmain/TIGERweb_main.html">US Census Bureau</a>', error_message:'TIGERweb tiles unavailable', min_zoom:6, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], bounds_subtract:[-129,49.5,-66,72], tile_size:256, url:['https://tigerweb.geo.census.gov/arcgis/services/TIGERweb/tigerWMS_Current/MapServer/WMSServer?service=WMS&request=GetMap&version=1.1.1&format=image/png&transparent=true&exceptions=application/vnd.ogc.se_inimage&srs=EPSG:4326&styles=&layers=Counties'], opacity:1, background:'GV_STREET' }
		,{ id:'US_STATES', menu_order:11.55, menu_name:'us: State outlines', description:'United States state outlines', credit:'US States from <a target="_blank" href="http://nationalmap.gov/">The National Map</a>', error_message:'National Map unavailable', min_zoom:5, max_zoom:12, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], bounds_subtract:[-129,49.5,-66,72], tile_size:128, url:'https://carto.nationalmap.gov/arcgis/services/govunits/MapServer/WMSServer?service=WMS&request=GetMap&version=1.1.1&request=GetMap&format=image/png&transparent=false&srs=EPSG:4326&layers=1,2&styles=' }
		,{ id:'US_CALTOPO_LAND_OWNERSHIP', menu_order:11.6*0, menu_name:'us: Public lands', description:'U.S. public lands (BLM, USFS, NPS, etc.)', credit:'Ownership data from <a target="_blank" href="https://caltopo.com/">CalTopo</a>', error_message:'CalTopo tiles unavailable', min_zoom:4, max_zoom:15, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], url:'https://caltopo.com/tile/sma/{z}/{x}/{y}.png' }
		,{ id:'US_BLM_LAND_OWNERSHIP', menu_order:11.6*0, menu_name:'us: Public lands', description:'U.S. public lands (BLM, USFS, NPS, etc.)', credit:'Data from <a target="_blank" href="http://www.blm.gov/">U.S. Bureau of Land Management</a>', error_message:'BLM tiles unavailable', min_zoom:4, max_zoom:14, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], url:'https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_Cached_without_PriUnk/MapServer/tile/{z}/{y}/{x}' }
		,{ id:'US_PUBLIC_GOOGLE', menu_order:11.61, menu_name:'us: Public lands+Google', description:'U.S. public lands with Google background', credit:'Public lands data from <a target="_blank" href="https://www.caltopo.com/">CalTopo.com</a>', error_message:'CalTopo tiles unavailable', min_zoom:4, max_zoom:14, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], url:'https://caltopo.com/tile/sma/{z}/{x}/{y}.png', opacity:1.00, background:'ROADMAP_DESATURATED' }
		,{ id:'US_PUBLIC2_GOOGLE', menu_order:11.61*0, menu_name:'us: Public lands 2+Google', description:'U.S. public lands with Google background', credit:'Public lands data from <a target="_blank" href="http://www.blm.gov/">BLM</a>', error_message:'BLM tiles unavailable', min_zoom:4, max_zoom:14, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], url:'https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_Cached_without_PriUnk/MapServer/tile/{z}/{y}/{x}', opacity:1.00, background:'ROADMAP_DESATURATED' }
		,{ id:'US_PUBLIC_HYBRID', menu_order:11.62, menu_name:'us: Public lands+hybrid', description:'U.S. public lands with Google hybrid background', credit:'Public lands data from <a target="_blank" href="https://www.caltopo.com/">CalTopo.com</a>', error_message:'CalTopo tiles unavailable', min_zoom:4, max_zoom:15, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], url:'https://caltopo.com/tile/sma/{z}/{x}/{y}.png', opacity:1.00, background:'GV_HYBRID' }
		,{ id:'US_PUBLIC_TOPO', menu_order:11.63, menu_name:'us: Public lands+relief', description:'U.S. public lands with ESRI topo background', credit:'Public lands data from <a target="_blank" href="https://www.caltopo.com/">CalTopo</a>, topo base map from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ESRI/ArcGIS</a>', error_message:'CalTopo tiles unavailable', min_zoom:4, max_zoom:14, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], url:'https://caltopo.com/tile/sma/{z}/{x}/{y}.png', opacity:[1.00], background:'ARCGIS_TOPO_WORLD' }
		,{ id:'US_PUBLIC_TOPO2', menu_order:11.63*0, menu_name:'us: Public lands+relief 2', description:'U.S. public lands with ESRI topo background', credit:'Public lands data from <a target="_blank" href="http://www.blm.gov/">BLM</a>, topo base map from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ESRI/ArcGIS</a>', error_message:'BLM tiles unavailable', min_zoom:4, max_zoom:14, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], background:'ARCGIS_TOPO_WORLD', foreground:'US_BLM_LAND_OWNERSHIP', foreground_opacity:1.00 }
		,{ id:'US_PUBLIC_USGS', menu_order:11.64, menu_name:'us: Public lands+USGS', description:'U.S. public lands with USGS topo background', credit:'Public lands data from <a target="_blank" href="http://www.blm.gov/">BLM</a>, USGS base map from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer">ESRI/ArcGIS</a>', error_message:'BLM tiles unavailable', min_zoom:4, max_zoom:14, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], url:'https://caltopo.com/tile/sma/{z}/{x}/{y}.png', opacity:1.00, background:'GV_TOPO_US' }
		,{ id:'US_PUBLIC_USFS', menu_order:11.65*0, menu_name:'us: Public lands+USFS', description:'U.S. public lands with USFS topo background', credit:'Public lands data from <a target="_blank" href="http://www.blm.gov/">BLM</a>, USFS base map from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com</a>', error_message:'BLM tiles unavailable', min_zoom:4, max_zoom:14, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], url:'https://caltopo.com/tile/sma/{z}/{x}/{y}.png', opacity:1.00, background:'US_CALTOPO_USFS' }
		,{ id:'US_NPS_VISITORS', menu_order:11.66*0, menu_name:'us: National Parks maps', description:'U.S. national parks visitor maps', credit:'NPS visitor maps from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com</a>', error_message:'NPS tiles unavailable', min_zoom:8, max_zoom:14, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], url:'http://ctvisitor.s3.amazonaws.com/nps/{z}/{x}/{y}.png' }
		,{ id:'US_EARTHNC_NOAA_CHARTS', menu_order:11.8, menu_name:'us: Nautical charts', description:'U.S. nautical charts (NOAA)', credit:'NOAA marine data from <a target="_blank" href="http://www.earthnc.com/">EarthNC.com<'+'/a>', error_message:'NOAA tiles unavailable', min_zoom:6, max_zoom:15, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], url:'//earthncseamless.s3.amazonaws.com/{z}/{x}/{yy}.png' } // {yy} = TMS = reverse y
		,{ id:'US_VFRMAP', menu_order:11.81*0, menu_name:'us: aviation (VFRMap)', description:'U.S. aviation charts from VFRMap.com', credit:'Aviation data from <a target="_blank" href="http://vfrmap.com/">VFRMap.com<'+'/a>', error_message:'VFRMap tiles unavailable', min_zoom:5, max_zoom:11, country:'us', bounds:[-169,18,-66,72], bounds_subtract:[-129.97,49.01,-66,90], url:'http://vfrmap.com/20190328/tiles/vfrc/{z}/{yy}/{x}.jpg' } // {yy} = TMS = reverse y
		,{ id:'US_ORWA_BLM_FLAT', menu_order:11.9*0, menu_name:"us-OR/WA: BLM maps", description:'BLM: Oregon &amp; Washington', credit:'Base map from <a target="_blank" href="http://www.blm.gov/or/gis/">U.S. Bureau of Land Management</a>', error_message:'BLM tiles unavailable', min_zoom:7, max_zoom:16, country:'us', bounds:[-124.85,41.62,-116.45,49.01], url:'https://gis.blm.gov/orarcgis/rest/services/Basemaps/Cached_ORWA_BLM_Carto_Basemap/MapServer/tile/{z}/{y}/{x}' }
		,{ id:'US_ORWA_BLM', menu_order:11.9, menu_name:"us-OR/WA: BLM maps", description:'BLM: Oregon &amp; Washington', credit:'Base map from <a target="_blank" href="http://www.blm.gov/or/gis/">U.S. Bureau of Land Management</a>', error_message:'BLM tiles unavailable', min_zoom:7, max_zoom:16, country:'us', bounds:[-124.85,41.62,-116.45,49.01], url:'https://gis.blm.gov/orarcgis/rest/services/Basemaps/Cached_ORWA_BLM_Carto_Basemap/MapServer/tile/{z}/{y}/{x}', foreground:'US_CALTOPO_RELIEF', foreground_opacity:[0.12] }
		,{ id:'SKAMANIA_GIS',menu_order:11.92*0,menu_name:'us-WA: Skamania County GIS', max_zoom:19, url:['http://www.mapsifter.com/MapDotNetUX9.3/REST/9.0/Map/SkamaniaWA/Image/Qkey/{quadkey}/256,256/png8?BleedRatio=1.125&MapBackgroundColor=00000000&MapCacheOption=ReadWrite'], copyright:'Skamania County tiles from MapSifter', tile_function:'function(xy,z){ quad=TileToQuadKey(xy.x,xy.y,z); return "http://www.mapsifter.com/MapDotNetUX9.3/REST/9.0/Map/SkamaniaWA/Image/Qkey/"+quad+"/256,256/png8";}',background:'GV_AERIAL' }
		,{ id:'CA_CALTOPO', menu_order:12.0, menu_name:'ca: Topo (CalTopo)', description:'Canada topographic maps from CalTopo', credit:'Topo maps from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo topo tiles unavailable', min_zoom:8, max_zoom:16, country:'ca', bounds:[-141,41.7,-52,85], bounds_subtract:[-141,41.7,-86,48], url:'//caltopo.s3.amazonaws.com/topo/{z}/{x}/{y}.png' }
		,{ id:'CA_CALTOPO_RELIEF', menu_order:12.01, menu_name:'ca: Topo+relief', description:'North America relief-shaded topo from CalTopo', credit:'Topo+relief tiles from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo tiles unavailable', min_zoom:8, max_zoom:16, country:'ca', bounds:[-141,41.7,-52,85], bounds_subtract:[-141,41.7,-86,48], url:'//caltopo.s3.amazonaws.com/topo/{z}/{x}/{y}.png', foreground:'US_CALTOPO_RELIEF', foreground_opacity:[0.20] }
		// ,{ id:'CA_CALTOPO_CANMATRIX', menu_order:12.1, menu_name:'ca: CanMatrix (CalTopo)', description:'NRCan CanMatrix tiles from CalTopo', credit:'NRCan CanMatrix topographic maps from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'CalTopo CanMatrix tiles unavailable', min_zoom:8, max_zoom:16, country:'ca', bounds:[-141,41.7,-52,85], bounds_subtract:[-141,41.7,-86,48], url:'//nrcan.s3.amazonaws.com/canmatrix/{z}/{x}/{y}.png' }
		,{ id:'CA_NRCAN_TOPORAMA', menu_order:12.2, menu_name:'ca: Toporama', description:'NRCan Toporama maps', credit:'Maps by NRCan.gc.ca', error_message:'NRCan maps unavailable', min_zoom:10, max_zoom:18, country:'ca', bounds:[-141,41.7,-52,85], bounds_subtract:[-141,41.7,-86,48], tile_size:256, url:'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en?service=wms&request=GetMap&version=1.1.1&format=image/jpeg&srs=epsg:4326&layers=WMS-Toporama' }
		,{ id:'CA_NRCAN_TOPORAMA2', menu_order:12.3, menu_name:'ca: Toporama (blank)', description:'NRCan Toporama, no names', credit:'Maps by NRCan.gc.ca', error_message:'NRCan maps unavailable', min_zoom:10, max_zoom:18, country:'ca', bounds:[-141,41.7,-52,85], bounds_subtract:[-141,41.7,-86,48], tile_size:256, url:'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en?service=wms&request=GetMap&version=1.1.1&format=image/jpeg&srs=epsg:4326&layers=limits,vegetation,builtup_areas,hydrography,hypsography,water_saturated_soils,landforms,road_network,railway,power_network' }
		// ,{ id:'NRCAN_TOPO', menu_order:12.4*0, menu_name:'ca: Topo (old)', description:'NRCan/Toporama maps with contour lines', credit:'Maps by NRCan.gc.ca', error_message:'NRCan maps unavailable', min_zoom:6, max_zoom:18, country:'ca', bounds:[-141,41.7,-52,85], bounds_subtract:[-141,41.7,-86,48], tile_size:600, url:'http://wms.cits.rncan.gc.ca/cgi-bin/cubeserv.cgi?version=1.1.3&request=GetMap&format=image/png&bgcolor=0xFFFFFF&exceptions=application/vnd.ogc.se_inimage&srs=EPSG:4326&layers=PUB_50K:CARTES_MATRICIELLES/RASTER_MAPS' }
		// ,{ id:'CA_GEOBASE_ROADS_LABELS', menu_order:12.5, menu_name:'ca: GeoBase', description:'Canada GeoBase road network with labels', credit:'Maps by geobase.ca', error_message:'GeoBase maps unavailable', min_zoom:6, max_zoom:18, country:'ca', bounds:[-141,41.7,-52,85], bounds_subtract:[-141,41.7,-86,48], tile_size:256, url:'http://ows.geobase.ca/wms/geobase_en?service=wms&request=GetMap&version=1.1.1&format=image/jpeg&srs=epsg:4326&layers=nhn:hydrography,boundaries:municipal:gdf7,boundaries:municipal:gdf8,boundaries:geopolitical,nrn:roadnetwork,nrn:streetnames,reference:placenames,nhn:toponyms' }
		// ,{ id:'CA_GEOBASE_ROADS', menu_order:12.51, menu_name:'ca: GeoBase (blank)', description:'Canada GeoBase road network, no labels', credit:'Maps by geobase.ca', error_message:'GeoBase maps unavailable', min_zoom:6, max_zoom:18, country:'ca', bounds:[-141,41.7,-52,85], bounds_subtract:[-141,41.7,-86,48], tile_size:256, url:'http://ows.geobase.ca/wms/geobase_en?service=wms&request=GetMap&version=1.1.1&format=image/jpeg&srs=epsg:4326&layers=nhn:hydrography,boundaries:municipal:gdf7,boundaries:municipal:gdf8,boundaries:geopolitical,nrn:roadnetwork' }
		,{ id:'CA_OPENSTREETMAP_RELIEF', menu_order:12.6, menu_name:'ca: OpenStreetMap+relief', description:'OpenStreetMap + CalTopo relief', credit:'Map data from <a target="_blank" href="http://www.openstreetmap.org/copyright">OSM<'+'/a>, relief from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'OpenStreetMap tiles unavailable', min_zoom:5, max_zoom:16, country:'ca', bounds:[-141,41.7,-52,85], bounds_subtract:[-141,41.7,-86,48], background:'OPENSTREETMAP', url:'//ctrelief.s3.amazonaws.com/relief/{z}/{x}/{y}.png', opacity:0.20 }
		,{ id:'BE_ROUTEYOU_TOPO', menu_order:31.1*0, menu_name:'be: Topo (RouteYou)', description:'Belgium+Netherlands topo maps from RouteYou.com', credit:'Topo maps from <a target="_blank" href="http://www.routeyou.com/">RouteYou</a>', error_message:'RouteYou topo tiles unavailable', min_zoom:8, max_zoom:17, country:'be,nl', bounds:[2.4,49.4,7.3,53.7], url:'https://tiles.routeyou.com/overlay/m/16/{z}/{x}/{y}.png' }
		,{ id:'BE_NGI_TOPO', menu_order:31.1, menu_name:'be: Topo (NGI)', description:'Belgium topo maps from NGI.be', credit:'Topo maps from <a target="_blank" href="http://www.ngi.be/">NGI.be</a>', error_message:'NGI.be topo tiles unavailable', min_zoom:8, max_zoom:17, country:'be', bounds:[2.4,49.4,6.5,51.5], url:'http://www.ngi.be/cartoweb/1.0.0/topo/default/3857/{z}/{y}/{x}.png' }
		,{ id:'BG_BGMOUNTAINS', menu_order:32.1, menu_name:'bg: BGMountains topo', description:'Bulgarian mountains: topo maps', credit:'Bulgarian mountain maps from <a target="_blank" href="http://www.bgmountains.org/">BGMountains.org</a>', error_message:'BGMountains tiles unavailable', min_zoom:7, max_zoom:19, country:'bg', bounds:[21.56,40.79,28.94,44.37], url:'https://bgmtile.kade.si/{z}/{x}/{y}.png' }
		,{ id:'CZ_MAPY_BASE', menu_order:32.3, menu_name:'cz: Mapy.cz base map', credit:'Maps from <a target="_blank" href="http://www.mapy.cz/">Mapy.cz/Seznam.cz</a>', min_zoom:2, max_zoom:19, country:'cz', bounds:[11,48,24,52], tile_size:256, url:'//mapserver.mapy.cz/base-m/{z}-{x}-{y}.jpg' }
		,{ id:'CZ_MAPY_TOURIST', menu_order:32.31, menu_name:'cz: Mapy.cz tourist map', credit:'Maps from <a target="_blank" href="http://www.mapy.cz/">Mapy.cz/Seznam.cz</a>', min_zoom:2, max_zoom:19, country:'cz', bounds:[11,48,24,52], tile_size:256, url:'//mapserver.mapy.cz/turist-m/{z}-{x}-{y}.jpg' }
		,{ id:'DE_TOPPLUSOPEN', menu_order:32.4, menu_name:'de: TopPlusOpen topo', description:'German/European topo maps from BKG', credit:'Topo maps from <a target="_blank" href="http://www.geodatenzentrum.de/">BKG</a>', error_message:'TopPlusOpen tiles unavailable', min_zoom:6, max_zoom:18, country:'de', bounds:[4.22,46.32,16.87,55.77], url:'http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png' }
		,{ id:'DE_DTK250', menu_order:32.5, menu_name:'de: DTK250 topo', description:'Digitale Topographische Karte 1:250000 from BKG', credit:'Topo maps from <a target="_blank" href="http://www.geodatenzentrum.de/">BKG</a>', error_message:'DTK250 tiles unavailable', min_zoom:6, max_zoom:18, country:'de', bounds:[4.22,46.32,16.87,55.77], url:'http://sg.geodatenzentrum.de/wms_dtk250?service=WMS&version=1.1.1&request=GetMap&format=image/jpeg&transparent=false&srs=EPSG:4326&styles=&layers=dtk250' }
		,{ id:'ES_IGN_BASE', menu_order:32.8, menu_name:'es: IGN base map', description:'Spanish base map from IGN.es', credit:'Map tiles from <a target="_blank" href="http://www.ign.es/">IGN.es</a>', error_message:'IGN.es base map unavailable', min_zoom:6, max_zoom:20, country:'es', bounds:[-18.4,27.5,4.6,44.0], url:'http://www.ign.es/wmts/ign-base?service=WMTS&request=GetTile&version=1.0.0&format=image/jpeg&layer=IGNBaseTodo&tilematrixset=GoogleMapsCompatible&style=default&tilematrix={z}&tilerow={y}&tilecol={x}' }
		,{ id:'ES_IGN_TOPO', menu_order:32.81, menu_name:'es: Topo (IGN)', description:'Spanish topo maps from IGN.es', credit:'Topo maps from <a target="_blank" href="http://www.ign.es/">IGN.es</a>', error_message:'IGN.es topo tiles unavailable', min_zoom:6, max_zoom:17, country:'es', bounds:[-18.4,27.5,4.6,44.0], url:'http://www.ign.es/wmts/mapa-raster?service=WMTS&request=GetTile&version=1.0.0&format=image/jpeg&layer=MTN&tilematrixset=GoogleMapsCompatible&style=default&tilematrix={z}&tilerow={y}&tilecol={x}' }
		,{ id:'FR_IGN_TOPO', menu_order:33.1, menu_name:'fr: Topo (IGN) ', description:'French topo maps from IGN.fr', credit:'Topo maps from <a target="_blank" href="http://www.ign.fr/">IGN.fr</a>', error_message:'IGN tiles unavailable', min_zoom:5, max_zoom:18, country:'fr', bounds:[-5.5,41.3,8.3,51.1], url:'//wxs.ign.fr/{api_key}/geoportail/wmts?layer=GEOGRAPHICALGRIDSYSTEMS.MAPS&format=image/jpeg&Service=WMTS&Version=1.0.0&Request=GetTile&EXCEPTIONS=text/xml&Style=normal&tilematrixset=PM&tilematrix={z}&tilerow={y}&tilecol={x}', api_key:'{ign}', visible_without_key:false }
		,{ id:'FR_IGN_TOPO_EXPRESS', menu_order:33.1, menu_name:'fr: Topo express (IGN)', description:'French topo maps from IGN.fr', credit:'Topo maps from <a target="_blank" href="http://www.ign.fr/">IGN.fr</a>', error_message:'IGN tiles unavailable', min_zoom:5, max_zoom:18, country:'fr', bounds:[-5.5,41.3,8.3,51.1], url:'//wxs.ign.fr/{api_key}/geoportail/wmts?layer=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD&format=image/jpeg&Service=WMTS&Version=1.0.0&Request=GetTile&EXCEPTIONS=text/xml&Style=normal&tilematrixset=PM&tilematrix={z}&tilerow={y}&tilecol={x}', api_key:'{ign}', visible_without_key:false }
		,{ id:'HU_TURISTAUTAK_NORMAL', menu_order:34.1, menu_name:'hu: Topo (turistautak)', credit:'Maps from <a target="_blank" href="http://www.turistautak.eu/">turistautak.hu</a>', min_zoom:6, max_zoom:17, country:'hu', bounds:[16,45.7,23,48.6], tile_size:256, url:'http://map.turistautak.hu/tiles/turistautak/{z}/{x}/{y}.png' }
		,{ id:'HU_TURISTAUTAK_HYBRID', menu_order:34.2, menu_name:'hu: Hybrid (turistautak)', credit:'Maps from <a target="_blank" href="http://www.turistautak.eu/">turistautak.hu</a>, imagery from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer">ESRI/ArcGIS</a>', min_zoom:6, max_zoom:17, country:'hu', bounds:[16,45.7,23,48.6], tile_size:256, url:'http://map.turistautak.hu/tiles/lines/{z}/{x}/{y}.png', background:'ARCGIS_AERIAL' }
		,{ id:'HU_TURISTAUTAK_RELIEF', menu_order:34.3, menu_name:'hu: Relief (turistautak)', credit:'Maps from <a target="_blank" href="http://www.turistautak.eu/">turistautak.hu</a>', min_zoom:6, max_zoom:17, country:'hu', bounds:[16,45.7,23,48.6], tile_size:256, url:'http://map.turistautak.hu/tiles/turistautak-domborzattal/{z}/{x}/{y}.png' }
		,{ id:'HU_ELTE_NORMAL', menu_order:35.4, menu_name:'hu: Streets (ELTE)', credit:'Maps <a target="_blank" href="http://www.elte.hu/">ELTE.hu</a>', min_zoom:6, max_zoom:17, country:'hu', bounds:[16,45.7,23,48.6], tile_size:256, url:'http://tmap.elte.hu/tiles3/1/{z}/{x}/{y}.png' }
		,{ id:'HU_ELTE_HYBRID', menu_order:35.5, menu_name:'hu: Hybrid (ELTE)', credit:'Maps <a target="_blank" href="http://www.elte.hu/">ELTE.hu</a>, imagery from <a target="_blank" href="http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer">ESRI/ArcGIS</a>', min_zoom:6, max_zoom:17, country:'hu', bounds:[16,45.7,23,48.6], tile_size:256, url:'http://tmap.elte.hu/tiles3/2/{z}/{x}/{y}.png', background:'ARCGIS_AERIAL' }
		,{ id:'IT_IGM_25K', menu_order:36.1, menu_name:'it: IGM 1:25k', description:'Italy: IGM topo maps, 1:25000 scale', credit:'Maps by minambiente.it', error_message:'IGM maps unavailable', min_zoom:13, max_zoom:16, country:'it', bounds:[6.6,35.5,18.7,47.2], tile_size:512, url:'http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/raster/IGM_25000.map&request=GetMap&version=1.1&srs=EPSG:4326&format=JPEG&layers=CB.IGM25000' }
		,{ id:'IT_IGM_100K', menu_order:36.2, menu_name:'it: IGM 1:100k', description:'Italy: IGM topo maps, 1:100000 scale', credit:'Maps by minambiente.it', error_message:'IGM maps unavailable', min_zoom:12, max_zoom:13, country:'it', bounds:[6.6,35.5,18.7,47.2], tile_size:512, url:'http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/raster/IGM_100000.map&request=GetMap&version=1.1&srs=EPSG:4326&format=JPEG&layers=MB.IGM100000' }
		,{ id:'NL_PDOK_STREETS', menu_order:37.1, menu_name:'nl: PDOK street map', description:'Netherlands maps from PDOK.nl', credit:'Maps from <a target="_blank" href="http://www.pdok.nl/">PDOK.nl</a>', error_message:'PDOK tiles unavailable', min_zoom:7, max_zoom:19, country:'nl', bounds:[-1.7,48,11.3,56], url:'https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaart/EPSG:3857/{z}/{x}/{y}.png' }
		,{ id:'NL_ROUTEYOU_TOPO', menu_order:37.2*0, menu_name:'nl: Topo (RouteYou)', description:'Netherlands+Belgium topo maps from RouteYou.com', credit:'Topo maps from <a target="_blank" href="http://www.routeyou.com/">RouteYou</a>', error_message:'RouteYou topo tiles unavailable', min_zoom:8, max_zoom:17, country:'be,nl', bounds:[2.4,49.4,7.3,53.7], url:'https://tiles.routeyou.com/overlay/m/16/{z}/{x}/{y}.png' }
		,{ id:'SK_FREEMAP', menu_order:38.1, menu_name:'sk/cz/hu: Freemap.sk', description:'OpenStreetMap data with contours and shading', credit:'Maps from <a target="_blank" href="https://www.freemap.sk/">Freemap.sk</a>', min_zoom:6, max_zoom:21, country:'sk,cz,hu', bounds:[12,45.6,25,51.1], tile_size:256, url:'https://outdoor.tiles.freemap.sk/{z}/{x}/{y}{r}' }
		,{ id:'AU_NATMAP', menu_order:61.0, menu_name:'au: National Map', description:'Australian National Map', credit:'Maps from <a target="_blank" href="http://www.ga.gov.au/">Geoscience Australia<'+'/a>', error_message:'Australian National Map tiles unavailable', min_zoom:3, max_zoom:16, country:'au', bounds:[111,-45,160,-9], url:'http://services.ga.gov.au/gis/rest/services/NationalMap_Colour_Topographic_Base_World_WM/MapServer/tile/{z}/{y}/{x}' }
		,{ id:'AU_NATMAP2', menu_order:61.01, menu_name:'au: National Map 2', description:'Australian National Map', credit:'Maps from <a target="_blank" href="http://www.ga.gov.au/">Geoscience Australia<'+'/a>', error_message:'Australian National Map tiles unavailable', min_zoom:3, max_zoom:16, country:'au', bounds:[111,-45,160,-9], url:'http://services.ga.gov.au/gis/rest/services/Topographic_Base_Map_WM/MapServer/tile/{z}/{y}/{x}' }
		,{ id:'AU_TOPO_250K', menu_order:61.1, menu_name:'au: Topo Maps 250k', description:'Australian National Map 250k Topos', credit:'Topo maps from <a target="_blank" href="http://www.ga.gov.au/">Geoscience Australia<'+'/a>', error_message:'Australian National Map tiles unavailable', min_zoom:3, max_zoom:13, country:'au', bounds:[111,-45,160,-9], url:'http://www.ga.gov.au/gisimg/rest/services/topography/NATMAP_Digital_Maps_250K_2008Edition_WM/MapServer/tile/{z}/{y}/{x}.jpg' }
		,{ id:'NZ_CALTOPO', menu_order:62.0, menu_name:'nz: Topo (CalTopo)', description:'New Zealand topographic maps from CalTopo', credit:'Topo maps from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com<'+'/a>', error_message:'Australian topo tiles unavailable', min_zoom:8, max_zoom:16, country:'nz', bounds:[166,-51,179,-34], url:'//caltopo.s3.amazonaws.com/topo/{z}/{x}/{y}.png' }
		// ,{ id:'LANDSAT', menu_order:0, menu_name:'Landsat 30m', description:'NASA Landsat 30-meter imagery', credit:'Map by NASA', error_message:'NASA OnEarth server unavailable', min_zoom:3, max_zoom:15, tile_size:256, url:'http://onearth.jpl.nasa.gov/wms.cgi?request=GetMap&styles=&srs=EPSG:4326&format=image/jpeg&layers=global_mosaic' }
		// ,{ id:'DAILY_TERRA', menu_order:0, menu_name:'Daily "Terra"', description:'Daily imagery from "Terra" satellite', credit:'Map by NASA', error_message:'NASA OnEarth server unavailable', min_zoom:3, max_zoom:10, tile_size:256, url:'http://onearth.jpl.nasa.gov/wms.cgi?request=GetMap&styles=&srs=EPSG:4326&format=image/jpeg&layers=daily_terra' }
		// ,{ id:'DAILY_AQUA', menu_order:0, menu_name:'Daily "Aqua"', description:'Daily imagery from "Aqua" satellite', credit:'Map by NASA', error_message:'NASA OnEarth server unavailable', min_zoom:3, max_zoom:10, tile_size:256, url:'http://onearth.jpl.nasa.gov/wms.cgi?request=GetMap&styles=&srs=EPSG:4326&format=image/jpeg&layers=daily_aqua' }
		// ,{ id:'DAILY_MODIS', menu_order:0, menu_name:'Daily MODIS', description:'Daily imagery from Nasa\'s MODIS satellites', credit:'Map by NASA', error_message:'NASA OnEarth server unavailable', min_zoom:3, max_zoom:10, tile_size:256, url:'http://onearth.jpl.nasa.gov/wms.cgi?request=GetMap&styles=&srs=EPSG:4326&format=image/jpeg&layers=daily_planet' }
		// ,{ id:'SRTM_COLOR', menu_order:0, menu_name:'SRTM elevation', description:'SRTM elevation data, as color', credit:'SRTM elevation data by NASA', error_message:'SRTM elevation data unavailable', min_zoom:6, max_zoom:14, tile_size:256, url:'http://onearth.jpl.nasa.gov/wms.cgi?request=GetMap&srs=EPSG:4326&format=image/jpeg&styles=&layers=huemapped_srtm' }
		,{ id:'US_WEATHER_RADAR', menu_order:0, menu_name:'Google map+NEXRAD', description:'NEXRAD radar on Google street map', credit:'Radar imagery from IAState.edu', error_message:'MESONET imagery unavailable', min_zoom:1, max_zoom:17, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], tile_size:256, background:'GV_STREET', url:'http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png', opacity:0.70 }
		,{ id:'US_WEATHER_RADAR_HYBRID', menu_order:0, menu_name:'Google hybrid+NEXRAD', description:'NEXRAD radar on Google hybrid map', credit:'Radar imagery from IAState.edu', error_message:'MESONET imagery unavailable', min_zoom:1, max_zoom:17, country:'us', bounds:[-152,17,-65,65], bounds_subtract:[-129,49.5,-66,72], tile_size:256, background:'GV_HYBRID', url:'http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png', opacity:0.70 }
		,{ id:'CALTOPO_MAPBUILDER', menu_order:0, menu_name:'us: CalTopo MapBuilder', description:'MapBuilder topo maps from CalTopo.com', credit:'MapBuilder tiles from <a target="_blank" href="http://www.caltopo.com/">CalTopo.com</a>', error_message:'MapBuilder tiles unavailable', min_zoom:8, max_zoom:17, bounds:[-125,24,-66,49.5], url:'https://caltopo.com/tile/mb_topo/{z}/{x}/{y}.png' }
		,{ id:'VERIZON_COVERAGE', menu_order:0, menu_name:'us: Verizon Wireless coverage', description:'Coverage maps from verizonwireless.com', credit:'', error_message:'Verizon tiles unavailable', min_zoom:8, max_zoom:17, bounds:[-125,24,-66,49.5], url:'https://gismapssdc.verizon.com/MapUI/proxy/proxy.ashx?https://mapservices.sdc.vzwcorp.com/arcgis/rest/services/4GDataCoverage/MapServer/tile/{z}/{y}/{x}', background:'GV_TERRAIN', opacity:0.40, foreground:'US_CALTOPO_RELIEF', foreground_opacity:0.20 }
		
	];
}
function GV_Define_Background_Map_Aliases() { // these aliases should ALWAYS exist and should only be edited, not removed.
	gvg.bg['GV_STREET'] = gvg.bg['GV_MAP'] = gvg.bg['GV_ROADMAP'] = gvg.bg['G_NORMAL_MAP'] = gvg.bg['ROADMAP'] = gvg.bg[google.maps.MapTypeId.ROADMAP] = google.maps.MapTypeId.ROADMAP;
	gvg.bg['GV_SATELLITE'] = gvg.bg['GV_AERIAL'] = gvg.bg['G_SATELLITE_MAP'] = gvg.bg['SATELLITE'] = gvg.bg[google.maps.MapTypeId.SATELLITE] = google.maps.MapTypeId.SATELLITE;
	gvg.bg['GV_HYBRID'] = gvg.bg['G_HYBRID_MAP'] = gvg.bg['HYBRID'] = gvg.bg[google.maps.MapTypeId.HYBRID] = google.maps.MapTypeId.HYBRID;
	gvg.bg['GV_TERRAIN'] = gvg.bg['GV_PHYSICAL'] = gvg.bg['G_PHYSICAL_MAP'] = gvg.bg['TERRAIN'] = gvg.bg[google.maps.MapTypeId.TERRAIN] = google.maps.MapTypeId.TERRAIN;
	gvg.bg['GV_OSM'] = gvg.bg['OPENSTREETMAP'];
	gvg.bg['GV_OSM_RELIEF'] = gvg.bg['OPENSTREETMAP_RELIEF'];
	gvg.bg['GV_OSM2'] = gvg.bg['KOMOOT_OSM'];
	gvg.bg['GV_TOPO'] = gvg.bg['OPENTOPOMAP'];
	gvg.bg['GV_TOPO_US'] = gvg.bg['US_ARCGIS_TOPO'];
	gvg.bg['GV_TOPO_WORLD'] = gvg.bg['OPENTOPOMAP'];
	gvg.bg['GV_TOPO_CA'] = gvg.bg['CA_CALTOPO'];
	gvg.bg['GV_TOPO_EU'] = gvg.bg['FOURUMAPS_TOPO'];
	gvg.bg['GV_USFS'] = gvg.bg['US_CALTOPO_USFS_RELIEF'];
	gvg.bg['GV_USGS'] = gvg.bg['US_CALTOPO_USGS_RELIEF'];
	gvg.bg['GV_OCM'] = gvg.bg['OPENCYCLEMAP'];
	gvg.bg['GV_OTM'] = gvg.bg['OPENTOPOMAP'];
	gvg.bg['GV_TRANSIT'] = gvg.bg['TF_TRANSPORT'];
	gvg.bg['GV_AVIATION'] = gvg.bg['US_VFRMAP'];
	gvg.bg['GV_NAUTICAL_US'] = gvg.bg['US_EARTHNC_NOAA_CHARTS'];
	// BACKWARDS COMPATIBILITY:
	gvg.bg['MAPQUEST_STREET_WORLD'] = gvg.bg['GV_OSM2'];
	gvg.bg['OPENSTREETMAP_MAPQUEST'] = gvg.bg['GV_OSM2'];
	gvg.bg['ARCGIS_STREET_WORLD'] = gvg.bg['ARCGIS_STREET'];
	gvg.bg['ARCGIS_AERIAL_WORLD'] = gvg.bg['ARCGIS_AERIAL'];
	gvg.bg['ARCGIS_HYBRID_WORLD'] = gvg.bg['ARCGIS_HYBRID'];
	gvg.bg['ARCGIS_TOPO_WORLD'] = gvg.bg['ARCGIS_RELIEF'];
	gvg.bg['THUNDERFOREST_NEIGHBOURHOOD'] = gvg.bg['TF_NEIGHBOURHOOD'];
	gvg.bg['THUNDERFOREST_TRANSPORT'] = gvg.bg['TF_TRANSPORT'];
	gvg.bg['THUNDERFOREST_LANDSCAPE'] = gvg.bg['TF_LANDSCAPE'];
	gvg.bg['THUNDERFOREST_OUTDOORS'] = gvg.bg['TF_OUTDOORS'];
	gvg.bg['MYTOPO_TILES'] = gvg.bg['GV_TOPO_US'];
	gvg.bg['USGS_TOPO'] = gvg.bg['GV_TOPO_US']; // MSRMaps is probably gone
	gvg.bg['USGS_AERIAL_BW'] = gvg.bg['US_NAIP_AERIAL']; // MSRMaps is probably gone
	gvg.bg['USGS_TOPO_TILES'] = gvg.bg['GV_TOPO_US'];
	gvg.bg['NEXRAD'] = gvg.bg['US_WEATHER_RADAR'];
	gvg.bg['CALTOPO_USGS'] = gvg.bg['US_CALTOPO_USGS'];
	gvg.bg['CALTOPO_USGS_RELIEF'] = gvg.bg['US_CALTOPO_USGS_RELIEF'];
	gvg.bg['CALTOPO_USFS'] = gvg.bg['US_CALTOPO_USFS'];
	gvg.bg['CALTOPO_USFS_RELIEF'] = gvg.bg['US_CALTOPO_USFS_RELIEF'];
	gvg.bg['CA_CALTOPO_CANMATRIX'] = gvg.bg['GV_TOPO_CA'];
	gvg.bg['MAPQUEST_OSM'] = gvg.bg['GV_OSM2'];
	gvg.bg['BLM_ORWA'] = gvg.bg['US_ORWA_BLM'];
	gvg.bg['BLM_ORWA_RELIEF'] = gvg.bg['US_ORWA_BLM_RELIEF'] = gvg.bg['US_ORWA_BLM'];
	
	gvg.bg['GV_DEFAULT'] = gvg.bg['OPENSTREETMAP'];
}


function GV_Define_Styles() {
	// Set up some styles
	document.writeln('		<style type="text/css">');
	document.writeln('			#gmap_div { font-family:Arial,sans-serif; }');
	document.writeln('			#gmap_div b,strong { font-weight:bold; }');
	document.writeln('			#gmap_div .gv_marker_info_window { font-family:Verdana; font-size:11px; min-width:150px; min-height:24px; }');
	document.writeln('			#gmap_div .gv_marker_info_window a { font:inherit; }');
	document.writeln('			#gmap_div .gv_marker_info_window_name { font:inherit; font-size:110%; font-weight:bold; margin-bottom:6px; line-height:112%; }');
	document.writeln('			#gmap_div .gv_marker_info_window_desc { font:inherit; padding-top:0px; margin-bottom:4px; line-height:112%; }');
	document.writeln('			#gmap_div .gv_marker_info_window_desc div { font:inherit; }');
	document.writeln('			#gmap_div .gv_marker_info_window img.gv_marker_thumbnail { border-width:1px; border-style:solid; margin:6px 0px 6px 0px; }');
	document.writeln('			#gmap_div .gv_marker_info_window img.gv_marker_photo { margin:8px 0px 8px 0px; }');
	document.writeln('			#gmap_div .gv_driving_directions { background-color:#eeeeee; border-radius:4px; padding:4px; margin-top:12px; font-size:92%; }');
	document.writeln('			#gmap_div .gv_driving_directions_heading { color:#666666; font-weight:bold; }');
	document.writeln('			#gmap_div .gv_click_window { font-family:Verdana; font-size:11px; min-width:50px; min-height:20px; }');
	document.writeln('			#gv_center_coordinates { background-color:#ffffff; border:solid #666666 1px; padding:1px; font:10px Arial; line-height:11px; }');
	document.writeln('			#gv_center_coordinate_pair { font:inherit; }');
	document.writeln('			#gv_mouse_coordinates { background-color:#ffffff; border:solid #666666 1px; padding:1px; font:10px Arial; line-height:11px; }');
	document.writeln('			#gv_mouse_coordinate_pair { font:inherit; }');
	document.writeln('			#gv_map_copyright { font:10px Arial; }');
	document.writeln('			#gv_map_copyright a { font:inherit; }');
	document.writeln('			#gv_credit { font:bold 10px Verdana,sans-serif; }');
	document.writeln('			.gv_label { background-color:#333333; border:1px solid black; padding:1px; text-align:left; white-space:nowrap; font:9px Verdana; color:white; }');
	document.writeln('			.gv_label img { display:none; }');
	document.writeln('			.gv_tooltip { background-color:#ffffff; border:1px solid #666666; padding:2px; text-align:left; font:10px Verdana,sans-serif; color:black; white-space:nowrap; filter:alpha(opacity=100); -moz-opacity:1.0; -khtml-opacity:1.0; opacity:1; }');
	document.writeln('			.gv_tooltip img.gv_marker_thumbnail { display:block; padding-top:3px; }');
	document.writeln('			.gv_tooltip img.gv_marker_photo { display:none; }');
	document.writeln('			.gv_tooltip_desc { padding-top:6px; }');
	document.writeln('			.gv_track_tooltip { border:none; filter:alpha(opacity=90); -moz-opacity:0.9; -khtml-opacity:0.9; opacity:0.9; }');
	document.writeln('			.gv_marker_tooltip { padding:2px; }');
	document.writeln('			.gv_zoom_control_contents { width:25px; overflow:hidden; filter:alpha(opacity=85); -moz-opacity:0.90; -khtml-opacity:0.90; opacity:0.90; }');
	document.writeln('			.gv_zoom_control_contents_mobile { width:23px; }');
	document.writeln('			.gv_zoom_bar_container { margin:0px; padding-top:1px; padding-bottom:1px; background-color:none; cursor:pointer;  }');
	document.writeln('			.gv_zoom_bar_container_mobile { padding-top:1px; padding-bottom:1px; }');
	document.writeln('			.gv_zoom_bar { height:4px; margin:0px 2px 0px 2px; padding:0px 0px 0px 0px; border-radius:2px; background-color:#778877; }');
	document.writeln('			.gv_zoom_bar_mobile { height:4px; }');
	document.writeln('			.gv_zoom_bar_overzoom { background-color:#bbbbbb; }');
	document.writeln('			.gv_zoom_bar:hover, .gv_zoom_bar_overzoom:hover { background-color:#bbddbb; }');
	document.writeln('			.gv_zoom_bar_selected { padding:0px 1px 0px 1px; margin:0px 1px 0px 1px; background-color:#335533; }');
	document.writeln('			.gv_zoom_bar_selected:hover { background-color:#446644; }');
	document.writeln('			.gv_zoom_button { position:relative; width:23px; height:23px; border:1px solid #cccccc; border-radius:3px; background-color:#f2f4f2; cursor:pointer; }');
	document.writeln('			.gv_zoom_button_mobile { width:21px; height:21px; }');
	document.writeln('			.gv_zoom_button:hover { background-color:#ffffff; }');
	document.writeln('			.gv_geolocation_button { width:21px; height:21px; margin:8px 2px 0px 2px; background-color:#ffffff; cursor:pointer; }');
	document.writeln('			.gv_geolocation_button_mobile { width:23px; height:23px; margin:6px 0px 0px 0px; }');
	document.writeln('			.gv_profile_button { width:21px; height:17px; background:rgba(255,255,255,0.7); cursor:pointer; }');
	document.writeln('			img.gv_marker_thumbnail { display:block; text-decoration:none; margin:0px; }');
	document.writeln('			img.gv_marker_photo { display:block; text-decoration:none; margin:0px; }');
	document.writeln('			.gv_legend_item { padding-bottom:0px; line-height:1.1em; font-weight:bold; }');
	document.writeln('			.gv_tracklist { font:11px Arial,sans-serif; line-height:12px; background-color:#ffffff; text-align:left; }');
	document.writeln('			.gv_tracklist_header { font-weight:bold; padding-bottom:3px; }');
	document.writeln('			.gv_tracklist_footer { padding-top:2px; }');
	document.writeln('			.gv_tracklist_item { padding-top:1px; padding-bottom:4px; }');
	document.writeln('			.gv_tracklist_item_name { font-weight:bold; font-size:11px; cursor:pointer; }');
	document.writeln('			.gv_tracklist_item_desc { font-weight:normal; font-size:11px; padding-top:2px; }');
	document.writeln('			.gv_marker_list { font:10px Verdana,sans-serif; background-color:#ffffff; text-align:left; }');
	document.writeln('			.gv_marker_list_header { font:11px Verdana,sans-serif; padding-bottom:4px; }');
	document.writeln('			.gv_marker_list_item { font-family:Verdana,sans-serif; font-size:10px; line-height:1.2em; padding:2px 0px 4px 0px; }');
	document.writeln('			.gv_marker_list_item_icon { cursor:pointer; float:left; margin-right:4px; margin-bottom:1px; }');
	document.writeln('			.gv_marker_list_item_name { cursor:pointer; font-weight:bold; }');
	document.writeln('			.gv_marker_list_item_desc { padding-top:2px; font-size:90%; }');
	document.writeln('			.gv_marker_list_border_top { border-top:1px solid #cccccc; }');
	document.writeln('			.gv_marker_list_border_bottom { border-bottom:1px solid #cccccc; }');
	document.writeln('			.gv_marker_list_thumbnail { padding-top:3px; border-width:1px; display:none; }');
	document.writeln('			.gv_marker_list_thumbnail img { border-width:1px; }');
	document.writeln('			.gv_marker_list_folder { font-family:Verdana,sans-serif; font-size:10px; padding-bottom:4px; }');
	document.writeln('			.gv_marker_list_folder_header { font-size:11px; line-height:1.1em; font-weight:bold; padding-bottom:2px; background-color:#e4e4e4; }');
	document.writeln('			.gv_marker_list_folder_name { background-color:none }');
	document.writeln('			.gv_marker_list_folder_item_count { font-weight:normal; font-size:10px; }');
	document.writeln('			.gv_marker_list_folder_contents { padding-left:15px; background-color:#ffffff; }');
	document.writeln('			.gv_infobox { font:11px Arial,sans-serif; background-color:#ffffff; text-align:left; border:solid #666666 1px; padding:4px; }');
	document.writeln('			.gv_searchbox { font:11px Arial,sans-serif; background-color:#ffffff; text-align:left; border:solid #666666 1px; padding:4px; }');
	document.writeln('			.gv_maptypelink { background-color:#dddddd; color:#000000; text-align:center; white-space: nowrap; border:1px solid; border-color: #999999 #222222 #222222 #999999; padding:1px 2px 1px 2px; margin-bottom:3px; font:9px Verdana,sans-serif; text-decoration:none; cursor:pointer; }');
	document.writeln('			.gv_maptypelink_selected { background-color:#ffffff; }');
	document.writeln('			.gv_floating_box { border:none; filter:alpha(opacity=95); -moz-opacity:0.95; -khtml-opacity:0.95; opacity:0.95; }');
	document.writeln('			.gv_windowshade_handle { height:6px; font-size:8px; color:#777777; overflow:hidden; background-color:#cccccc; border-left:1px solid #999999; border-top:1px solid #eeeeee; border-right:1px solid #999999; padding:0px; text-align:center; cursor:move; }');
	document.writeln('			.gv_windowshade_handle_mobile { height:12px; font-size:8px; color:#777777; overflow:hidden; background-color:#cccccc; border-left:1px solid #999999; border-top:1px solid #eeeeee; border-right:1px solid #999999; padding:0px; text-align:center; cursor:move; }');
	document.writeln('			.gv_utilities_menu_header { background-color:#cceecc; font-size:8pt; color:#669966; padding:4px; border-top:1px solid #cccccc; }');
	document.writeln('			.gv_utilities_menu_item { font-size:9pt; color:#006600; padding:6px 4px 6px 4px; border-top:1px solid #cccccc; }');
	document.writeln('			.gv_utilities_menu_item a { color:#006600; text-decoration:none; cursor:pointer; }');
	document.writeln('			.gv_utilities_menu_item a:hover { text-decoration:underline; }');
	document.writeln('			.gv_utilities_menu_item img { padding-right:6px; vertical-align:middle; }');
	document.writeln('			.gv_opacity_screen { background-color:#ffffff; }');
	document.writeln('			.gv_profile { font:11px Arial,sans-serif; background:white; padding:0px; overflow:hidden; box-shadow:2px 2px 4px #666666; }');
	document.writeln('		</style>');
	document.writeln('		<style type="text/css" media="print">'); // force stuff to print even though Google thinks it shouldn't
	document.writeln('			img[src~="www.gpsvisualizer.com/"].gmnoprint { display:inline; }'); // anything GV puts up
	document.writeln('			img[src~="maps.gpsvisualizer.com/"].gmnoprint { display:inline; }'); // anything GV puts up
	document.writeln('			img[src$="transparent.png"].gmnoprint { display:none; visibility:hidden; }');
	document.writeln('			img[src$="shadow.png"].gmnoprint { display:none; visibility:hidden; }');
	document.writeln('			img[src$="crosshair.png"].gmnoprint { display:none; visibility:hidden; }');
	document.writeln('			img[src$="ruler.png"].gmnoprint { display:none; visibility:hidden; }');
	document.writeln('			#gv_center_coordinates { display:none; visibility:hidden; }');
	document.writeln('			#gv_measurement_icon { display:none; visibility:hidden; }');
	document.writeln('			#gv_mouse_coordinates { display:none; visibility:hidden; }');
	document.writeln('			#gv_credit { display:none; visibility:hidden; }');
	document.writeln('			[jstcache="0"] { display:block; }'); // the scale should print
	document.writeln('		</style>');
}


