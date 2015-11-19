alert ('in the export JS file');

GV_Export = new function() {
	
	this.Start = function() {
		if (!self.gmap || !self.gmap.getDiv() || $('gv_export_box')) {
			return false;
		} else {
			GV_Export.Build_Panel();
		}
	}
	
	this.Build_Panel = function() {
		
		var margin = 15; var padding = 10;
		var wd = gmap.getDiv().clientWidth-(margin*2)-(padding*2); var ht = gmap.getDiv().clientHeight-(margin*2)-(padding*2);
		var export_div = document.createElement('div'); export_div.id = 'gv_export_box';
		export_div.style.cssText = 'display:inline-block; max-width:'+(wd/2)+'px; max-height:'+ht+'px; padding:'+padding+'px; position:absolute; z-index:999999; right:'+margin+'px; top:'+margin+'px; background-color:#ddeedd; border:2px solid #006600; box-shadow:3px 3px 6px #666666; overflow:auto;';
		var html = '';
		html += '	<table cellspacing="0" cellpadding="0" border="0" width="100%"><tr>';
		html += '		<td align="left" valign="top"><a target="_blank" href="http://www.gpsvisualizer.com/"><img src="http://maps.gpsvisualizer.com/images/gpsvisualizer_160x26.gif" width="160" height="26" border="0" /></a></td>';
		html += '		<td align="right" valign="top" style="padding-left:10px;"><img align="right" src="'+gvg.icon_directory+'images/close.png" width="14" height="14" border="0" style="display:block; cursor:pointer;" onclick="GV_Delete(\'gv_export_box\');" title="cancel export and close this panel" /></td>';
		html += '	</tr></table>';	
		html += '	<div style="font-weight:bold; font-size:10pt;">Export map data</div>';
		html += '	<div style="font-size:8pt; margin-top:6px;" id="gv_export_selection_form" onsubmit="return GV_Export.Post_Data();">';
		html += '		Format: <select size="1" name="format" id="gv_export_format"><option value="gpx">GPX</option><option value="kml">KML</option><option value="txt">plain text</option></select><br/>';
		html += '		<div id="gv_export_list" style="overflow:auto; max-height:'+(ht-110)+'px;">';
		html += this.Build_List();
		html += '		</div>';
		html += '		<input style="margin-top:8px;" type="button" value="Export" onclick="GV_Export.Post_Data();"><br/>';
		html += '	</div>';
		html += '	<div style="display:none;">';
		html += '		<form action="http://maps.gpsvisualizer.com/google_maps/export_data.php" method="POST" id="gv_export_post_form" target="export_frame">';
		// html += '		<form action="/google_maps/export_data.php" method="POST" id="gv_export_post_form" target="_blank">';
		html += '		</form>';
		html += '	</div>';
		html += '<iframe name="export_frame" width="200" height="20" style="display:none; overflow:auto;"></iframe>';
		export_div.innerHTML = html;
		gmap.getDiv().appendChild(export_div);
		
		GV_EscapeKey('gv_export_box');
	}
	
	this.Build_List = function() {
		var list_html = '';
		if (self.wpts && wpts.length) {
			list_html += '<p style="margin:6px 0px 0px 0px; font-weight:bold; cursor:pointer;"><span onclick="GV_Export.Select_All(\'export_wpt\')" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'">Waypoints/markers:</span><'+'/p>';
			list_html += '<input type="checkbox" checked id="export_wpt_all"><label for="export_wpt_all">All visible waypoints</label><br/>';
		}
		if (self.trk && trk.length) {
			var trk_html = '';
			for (var ti in trk) {
				if (trk[ti] && trk[ti].info && trk[ti].segments) {
					trk_html += '<div onmouseover="GV_Highlight_Track('+ti+',true)" onmouseout="GV_Highlight_Track('+ti+',false)"><input type="checkbox" checked id="export_trk['+attribute_safe(ti)+']"><label for="export_trk['+attribute_safe(ti)+']">'+(trk[ti].info.name?trk[ti].info.name:'[track]')+'</label></div>';
				}
			}
			if (trk_html) { // only include the "Tracks:" header if there are tracks
				list_html += '<p style="margin:6px 0px 0px 0px; font-weight:bold; cursor:pointer;"><span onclick="GV_Export.Select_All(\'export_trk\')" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'">Tracks:</span><'+'/p>';
				list_html += trk_html;
			}

		}
		return list_html;
	}
	
	this.Select_All = function(prefix) {
		if (!$('gv_export_selection_form')) { return false; }
		var inputs = $('gv_export_selection_form').getElementsByTagName('input'); var on_or_off = false;
		for (var i=0; i<inputs.length; i++) { // check and see if any of them is currently unchecked; if so, go into "select all" mode instead of "unselect all"
			if(inputs[i].type == 'checkbox' && inputs[i].id.indexOf(prefix) > -1 && !inputs[i].checked) { on_or_off = true; }
		}
		for (var i=0; i<inputs.length; i++) { // check/uncheck each box as necessary
			if(inputs[i].type == 'checkbox' && inputs[i].id.indexOf(prefix) > -1) { inputs[i].checked = on_or_off; }
		}
	}
	
	this.Post_Data = function() {
		if (!$('gv_export_post_form')) { return false; }
		if (!self.wpts && !self.trk) { return false; }
		
		var html = ""; var wpt_count = 0; var trk_count = 0;
		var inputs = $('gv_export_selection_form').getElementsByTagName('input');
		for (var i=0; i<inputs.length; i++) {
			if(inputs[i].type == 'checkbox' && inputs[i].checked) {
				if (inputs[i].id.indexOf('export_wpt') > -1) {
					for (var w in wpts) {
						if (!wpts[w].gv_hidden() && wpts[w].gvi && wpts[w].gvi.coords && wpts[w].gvi.type != 'tickmark' && wpts[w].gvi.type != 'trackpoint') {
							// html += 'wpts['+w+']:<br/>';
							html += '<input type="hidden" name="wpt['+w+'][latitude]" value="'+wpts[w].gvi.coords.lat()+'">';
							html += '<input type="hidden" name="wpt['+w+'][longitude]" value="'+wpts[w].gvi.coords.lng()+'">';
							if (wpts[w].ele) { html += '<input type="hidden" name="wpt['+w+'][altitude]" value="'+wpts[w].ele+'">'; }
							var attr = ['name','desc','url']; for (var a=0; a<attr.length; a++) {
								if (wpts[w].gvi[attr[a]]) { html += '<input type="hidden" name="wpt['+w+']['+attr[a]+']" value="'+wpts[w].gvi[attr[a]]+'">'; }
							}
							if (wpts[w].gvi.icon && (!gv_options.default_marker.icon || gv_options.default_marker.icon != wpts[w].gvi.icon)) { html += '<input type="hidden" name="wpt['+w+'][sym]" value="'+attribute_safe(wpts[w].gvi.icon)+'">'; }
							if (wpts[w].gvi.color && (!gv_options.default_marker.color || gv_options.default_marker.color != wpts[w].gvi.color)) { html += '<input type="hidden" name="wpt['+w+'][color]" value="'+attribute_safe(wpts[w].gvi.color)+'">'; }
							if (wpts[w].gvi.opacity && wpts[w].gvi.opacity != 1) { html += '<input type="hidden" name="wpt['+w+'][opacity]" value="'+attribute_safe(wpts[w].gvi.opacity)+'">'; }
							wpt_count++;
						}
					}
				} else if (inputs[i].id.indexOf('export_trk') > -1) {
					var id = inputs[i].id.replace(/export_/g,''); var t = eval(id);
					if (t.info && t.overlays) {
						// html += inputs[i].id+':<br/>';
						var attr = ['name','desc','color','width','opacity']; for (var a=0; a<attr.length; a++) {
							if (t.info[attr[a]]) { html += '<input type="hidden" name="'+id+'['+attr[a]+']" value="'+attribute_safe(t.info[attr[a]])+'">'; }
						}
						var trkpts = '';
						for (var o=0; o<t.overlays.length; o++) {
							if (t.overlays[o].getPath) { // it's a track
								var points = t.overlays[o].getPath().getArray();
								for (var p=0; p<points.length; p++) {
									trkpts += points[p].lat()+','+points[p].lng()+';'
								}
								trkpts += ';';
							} else if (t.overlays[o].getPosition) { // it's a waypoint attached to the track
								// do nothing
							}
						}
						html += '<input type="hidden" name="'+id+'[trkpts]" value="'+trkpts+'">';
						trk_count++;
					}
				}
			}
		}
		var format = ($('gv_export_format')) ? $('gv_export_format').value : 'gpx';
		html += '<input type="hidden" name="format" value="'+format+'">';
		
		if (wpt_count || trk_count) {
			$('gv_export_post_form').innerHTML = html;
			$('gv_export_post_form').submit();
		} else {
			// nothing to export!
		}
		
		return false;
	}
	
}

if (gvg.script_count && gvg.script_callback[gvg.script_count]) {
	eval(gvg.script_callback[gvg.script_count]);
}