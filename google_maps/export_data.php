<?

$tmp_dir = '/tmp/export_data/';

$gpsv_icons = Define_GPSV_Icons();
$garmin_icons = Define_Garmin_Icons();
$html_colors = HTMLColorList();

$format = ($_REQUEST['format']) ? $_REQUEST['format'] : 'txt';
$wpt = $_REQUEST['wpt'];
$trk = $_REQUEST['trk'];

$fields = array('latitude'=>true,'longitude'=>true);

if (gettype($wpt) == 'array' && count($wpt) > 0) {
	foreach($wpt as $w) {
		foreach (array_keys($w) as $k) {
			$fields[$k] = true;
		}
	}
}
if (gettype($trk) == 'array') {
	foreach ($trk as $ti => $this_trk) {
		$keys = array_keys($this_trk);
		foreach (array_keys($this_trk) as $k) {
			if ($k != 'trkpts') {
				$fields[$k] = true;
			}
		}
		if (gettype($trk[$ti]) == 'array' && $trk[$ti]['trkpts']) {
			$trkpts = explode(";",$trk[$ti]['trkpts']);
			$trkpt_index = -1;
			for($j=0; $j<count($trkpts); $j++) {
				if ($trkpts[$j] == '') {
					if ($trkpt_index >= 0) {
						$trk[$ti]['trkpt'][$trkpt_index]['eos'] = true;
					}
				} else {
					list($lat,$lon,$alt) = explode(",",$trkpts[$j]);
					$trkpt_index++;
					$trk[$ti]['trkpt'][$trkpt_index]['latitude'] = $lat;
					$trk[$ti]['trkpt'][$trkpt_index]['longitude'] = $lon;
					if ($alt != '') {
						$trk[$ti]['trkpt'][$trkpt_index]['altitude'] = $alt;
					}
				}
			}
		}
	}
}


$output = '';
if ($format == 'gpx') { $output = Make_GPX(); }
elseif ($format == 'kml') { $output = Make_KML(); }
else { $output = Make_TXT(); }

$ip = explode('.',$_SERVER['REMOTE_ADDR']); $ip_key = substr(sprintf("%03d%03d",$ip[2],$ip[3]),1,5);
$file_name = "GPSVisualizer-".date('mdHis').".".$format;

$mime_type = 'text/plain';
if (preg_match('/gpx$/i',$format)) { $mime_type = 'application/gpx+xml'; }
if (preg_match('/kml$/i',$format)) { $mime_type = 'application/vnd.google-earth.kml+xml'; }
header("Content-Length: ".strlen($output));
header("Content-Type: $mime_type; charset=UTF-8");
header("Content-Disposition: attachment; filename={$file_name}");
print $output;

exit;


function Make_TXT() {
	global $wpt,$trk,$fields,$format;
	$field_order = array('time','latitude','longitude','altitude','sym','color','width','opacity','name','desc','url');
	$ordered_fields = array('type');
	
	$header = "type";
	foreach ($field_order as $f) {
		if ($fields[$f]) {
			$header .= "\t{$f}";
			array_push($ordered_fields,$f);
		}
	}
	$header .= "\n";
	
	$txt = '';
	
	if (gettype($wpt) == 'array' && count($wpt) > 0) {
		$txt .= $header;
		foreach($wpt as $w) {
			if (gettype($w) == 'array' && $w['latitude'] && $w['longitude']) {
				$w['type'] = 'W';
				$w['latitude'] = sprintf("%0.7f",$w['latitude'])*1;
				$w['longitude'] = sprintf("%0.7f",$w['longitude'])*1;
				if ($w['altitude']) { $w['altitude'] = $w['altitude']*1; }
				$line = '';
				foreach ($ordered_fields as $f) {
					if ($w[$f] != '') {
						$line .= $w[$f]."\t";
					} else {
						$line .= "\t";
					}
				}
				$line = preg_replace('/\t+$/','',$line);
				$txt .= $line."\n";
			}
		}
		$txt .= "\n";
	}
	
	if (gettype($trk) == 'array') {
		foreach ($trk as $t) {
			if (gettype($t) == 'array' && $t['trkpt']) {
				$t['name'] = CleanUpText($t['name']);
				$t['desc'] = CleanUpText($t['desc']);
				$trkpt = $t['trkpt'];
				
				$txt .= $header;
				for($j=0; $j<count($trkpt); $j++) {
					$tp = $trkpt[$j];
					$tp['type'] = 'T';
					$tp['latitude'] = sprintf("%0.7f",$tp['latitude'])*1;
					$tp['longitude'] = sprintf("%0.7f",$tp['longitude'])*1;
					if ($tp['altitude']) { $tp['longitude'] = $tp['altitude']*1; }
					if ($j == 0) {
						foreach (array_keys($t) as $k) {
							if ($k != 'trkpts') { $tp[$k] = $t[$k]; }
						}
					}
					$line = '';
					foreach ($ordered_fields as $f) {
						if ($tp[$f] != '') {
							$line .= $tp[$f]."\t";
						} else {
							$line .= "\t";
						}
					}
					$line = preg_replace('/\t+$/','',$line);
					$txt .= $line."\n";
				}
				$txt .= "\n";
			}
		}
	}
	
	return $txt;
}


function Make_GPX() {
	global $wpt,$trk,$fields,$format;
	
	$gpx = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
	$gpx .= '<gpx version="1.0" creator="GPS Visualizer map export http://www.gpsvisualizer.com/" xmlns="http://www.topografix.com/GPX/1/0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">'."\n";
	if (gettype($wpt) == 'array') {
		foreach($wpt as $w) {
			$lat = sprintf("%0.7f",$w['latitude'])*1;
			$lon = sprintf("%0.7f",$w['longitude'])*1;
			$name = CData(CleanUpText($w['name']));
			$desc = CData(CleanUpText($w['desc']));
			$sym = CData(CleanUpText($w['sym']));
			
			$gpx .= "\t<wpt lat=\"{$lat}\" lon=\"{$lon}\">\n";
			$gpx .= ($w['altitude'] != '') ? "\t\t<ele>".$w['altitude']."</ele>\n" : "";
			$gpx .= ($name != '') ? "\t\t<name>{$name}</name>\n" : "";
			$gpx .= ($desc != '') ? "\t\t<desc>{$desc}</desc>\n" : "";
			$gpx .= ($sym != '') ? "\t\t<sym>{$sym}</sym>\n" : "";
			$gpx .= "\t</wpt>\n";
		}
	}
	if (gettype($trk) == 'array') {
		foreach ($trk as $t) {
			if (gettype($t) == 'array' && $t['trkpt']) {
				$trk_name = CData(CleanUpText($t['name']));
				$trk_desc = CData(CleanUpText($t['desc']));
				$trk_color = CData(CleanUpText($w['color']));
				$trk_width = CData(CleanUpText($w['width']));
				$trk_opacity = CData(CleanUpText($w['opacity']));
				$trkpt = $t['trkpt'];
			
				$gpx .= "\t<trk>\n";
				$gpx .= "\t\t<name>{$trk_name}</name>\n";
				$gpx .= ($trk_desc != '') ? "\t\t<desc>{$trk_desc}</desc>\n" : "";
				$gpx .= "\t\t<trkseg>\n";
				for($j=0; $j<count($trkpt); $j++) {
					$tp = $trkpt[$j];
					$lat = sprintf("%0.7f",$tp['latitude'])*1;
					$lon = sprintf("%0.7f",$tp['longitude'])*1;
					$gpx .= "\t\t\t<trkpt lat=\"{$lat}\" lon=\"{$lon}\">";
					$gpx .= ($tp['altitude'] != '') ? "<ele>".$tp['altitude']."</ele>" : "";
					$gpx .= "</trkpt>\n";
					if ($tp['eos'] || $j==(count($trkpt)-1)) {
						$gpx .= "\t\t</trkseg>\n";
						if ($j!=(count($trkpt)-1)) {
							$gpx .= "\t\t<trkseg>\n";
						}
					}
				}
				$gpx .= "\t</trk>\n";
			}
		}
	}
	$gpx .= "</gpx>\n";
	
	return $gpx;
}


function Make_KML() {	
	global $wpt,$trk,$fields,$format;
	global $garmin_icons,$gpsv_icons;
	
	$kml = <<<ENDOFTEXT
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://earth.google.com/kml/2.0">
	<Document>
		<name>GPS Visualizer data</name>
		<Style id="waypoint">
			<IconStyle>
				<color>ffffffff</color>
				<scale>1</scale>
				<Icon><href>http://maps.google.com/mapfiles/kml/pal4/icon56.png</href></Icon>
				<hotSpot x="0.5" xunits="fraction" y="0.5" yunits="fraction" />
			</IconStyle>
			<BalloonStyle>
				<text><![CDATA[<p align="left" style="white-space:nowrap;"><font size="+1"><b>$[name]</b></font></p> <p align="left">$[description]</p>]]></text>
			</BalloonStyle>
		</Style>
		<Style id="track">
			<LineStyle>
				<color>ff0000ff</color>
				<width>3</width>
			</LineStyle>
		</Style>
		<Style id="polygon">
			<LineStyle>
				<color>ffff0000</color>
				<width>3</width>
			</LineStyle>
			<PolyStyle>
				<color>40ff0000</color>
				<colorMode>normal</colorMode>
				<fill>1</fill>
				<outline>1</outline>
			</PolyStyle>
		</Style>

ENDOFTEXT;
#header("Content-Type: text/plain; charset=UTF-8");
	if (gettype($wpt) == 'array' && count($wpt) > 0) {
		$kml .= "		<Folder>\n";
		$kml .= "			<name>Waypoints</name>\n";
		foreach($wpt as $w) {
			$name = CData(CleanUpText($w['name']));
#print "\$name = '$name'\n";
			$desc = CData(CleanUpText($w['desc']));
			$sym = CData(CleanUpText($w['sym']));
			$color = ($w['color'] || $w['opacity']) ? Color_HTML2GE(CleanUpText($w['color']),CleanUpText($w['opacity'])) : '';
#print "\$color = '$color'\n";
			$coords = (1*sprintf("%0.7f",$w['longitude'])).','.(1*sprintf("%0.7f",$w['latitude']));
			if ($w['altitude'] != '') { $coords .= ','.(1*sprintf("%0.3f",$w['altitude'])); }
			$color_tag = ''; $scale_tag = ''; $icon_tag = ''; $style_tag = '';
			if ($sym && $garmin_icons[$sym]) {
				$icon_tag = "<Icon><href>http://maps.gpsvisualizer.com/google_maps/icons/garmin/gpsmap/".preg_replace('/ /','_',$sym).".png</href></Icon>";
				$scale_tag = "<scale>0.5</scale>";
			} else if ($sym && $gpsv_icons[$sym]) {
				$icon_tag = "<Icon><href>http://maps.gpsvisualizer.com/google_maps/icons/{$sym}/white.png</href></Icon>";
			}
			if ($color) {
				$color_tag = "<color>{$color}</color>";
			}
			if ($color_tag || $scale_tag || $icon_tag) {
				$style_tag = "\r\t\t\t\t<Style><IconStyle>{$color_tag}{$scale_tag}{$icon_tag}</IconStyle></Style>";
			}
#print "\$style_tag = '$style_tag'\n";
			$kml .= <<<ENDOFTEXT
			<Placemark>
				<name>$name</name>
				<description>$desc</description>
				<styleUrl>#waypoint</styleUrl>$style_tag
				<Point>
					<altitudeMode>clampedToGround</altitudeMode>
					<coordinates>$coords</coordinates>
				</Point>
			</Placemark>

ENDOFTEXT;
		}
		$kml .= "		</Folder>\n";
	}
	if (gettype($trk) == 'array' && count($trk) > 0) {
		$kml .= "		<Folder>\n";
		$kml .= "			<name>Tracks</name>\n";
		foreach ($trk as $t) {
			if (gettype($t) == 'array' && $t['trkpt']) {
				$is_polygon = ($t['type'] == 'area' || $t['type'] == 'polygon') ? true : false;
				$trk_name = CData(CleanUpText($t['name']));
				$trk_desc = CData(CleanUpText($t['desc']));
				$style_url = ($is_polygon) ? '#polygon' : '#track';
				$kml .= <<<ENDOFTEXT
		<Placemark>
				<name>$trk_name</name>
				<description>$trk_desc</description>
				<visibility>1</visibility>
				<open>0</open>
				<styleUrl>$style_url</styleUrl>

ENDOFTEXT;
				$trkpt = $t['trkpt'];
				$coords = '';
				for($j=0; $j<count($trkpt); $j++) {
					$tp = $trkpt[$j];
					$coords .= (1*sprintf("%0.7f",$tp['longitude'])).','.(1*sprintf("%0.7f",$tp['latitude']));
					if ($tp['altitude'] != '') { $coords .= ','.(1*sprintf("%0.3f",$tp['altitude'])); }
					$coords .= ' ';
				}
			
				if($is_polygon) {
					$kml .= <<<ENDOFTEXT
				<Polygon>
					<extrude>1</extrude>
					<altitudeMode>clampedToGround</altitudeMode>
					<outerBoundaryIs>
						<LinearRing>
							<coordinates>
								$coords
							</coordinates>
						</LinearRing>
					</outerBoundaryIs>
				</Polygon>
			</Placemark>

ENDOFTEXT;
				} else {
					$kml .= <<<ENDOFTEXT
				<LineString>
					<extrude>0</extrude>
					<tessellate>1</tessellate>
					<altitudeMode>clampedToGround</altitudeMode>
					<coordinates>
						$coords
					</coordinates>
				</LineString>
			</Placemark>

ENDOFTEXT;
				}
			}
		}
		$kml .= "		</Folder>\n";
	}
	
	$kml .= <<<ENDOFTEXT
	</Document>
</kml>

ENDOFTEXT;
	
	return $kml;
}


function CleanUpText($text) {
	$text = trim(stripslashes($text));
	$text = FixUnicode($text,true); # the second argument determines whether the &#1234; entities should be converted to actual letters
	return $text;
}

function XMLSafe($text) {
	$text = preg_replace('/&(?!(\w+;|#))/','&amp;',$text);
	$text = preg_replace('/>/','&gt;',$text);
	$text = preg_replace('/</','&lt;',$text);
	return $text;
}

function CData($text) {
	if (preg_match('/(\&(?!(\w+;|#))|\"|\<|\>)/',$text)) {
		$text = '<![CDATA['.$text.']]>';
	}
	return $text;
}

function FixUnicode($text,$convert_to_real_characters) {
	$text = preg_replace_callback('/([\x80-\xFF])/i','CharacterToEntity',$text); # western European accents and such
	$text = preg_replace_callback('/%u([0-9A-F]{4})/i','UnicodePercentToEntity',$text); # wacky stuff that came in as %u05D0 or whatever
	if ($convert_to_real_characters) {
		$text = NumericEntityToCharacter($text);
	}
	return $text;
}

function CharacterToEntity($match_array) { return '&#'.ord($match_array[1]).';'; }
function UnicodePercentToEntity($match_array) { return '&#'.hexdec($match_array[1]).';'; }
function NumericEntityToCharacter($text) {
	if (function_exists('mb_decode_numericentity')) {
		$convmap = array(0x0,0x2FFFF,0,0xFFFF);
		$text = mb_decode_numericentity($text, $convmap, 'UTF-8');
	}
	return $text;
}


function Color_HTML2RGB($c) { # $html_colors is a global variable containing all 140 named colors
	global $html_colors;
	$c = preg_replace('/[^\w\#]/','',$c);
	if ($html_colors[strtolower($c)]) { $c = $html_colors[strtolower($c)]; }
	if (preg_match('/^\#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i',$c,$matches)) {
		return '#'.strtolower($matches[1].$matches[2].$matches[3]);
	} else {
		return '#ffffff';
	}
}

function Color_HTML2GE($c,$op) {
	if ($op == '') { $op = 1; } elseif ($op > 1) { $op /= 100; }
	$op = sprintf('%02x',255*$op);
	$c = Color_HTML2RGB($c);
	if (preg_match('/^\#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i',$c,$matches)) {
		return $op.strtolower($matches[3].$matches[2].$matches[1]);
	} else {
		return '';
	}
}




################################################################################
function Define_Garmin_Icons() {
	$list = array(
		'Airport','Amusement Park','Anchor','Anchor Prohibited','Animal Tracks','ATV'
		,'Bait and Tackle','Ball Park','Bank','Bar','Beach','Beacon','Bell','Bike Trail','Block, Blue','Block, Green','Block, Red','Boat Ramp','Bowling','Bridge','Building','Buoy, White','Big Game','Blind','Blood Trail'
		,'Campground','Car','Car Rental','Car Repair','Cemetery','Church','Circle with X','Circle With X','Circle, Blue','Circle, Green','Circle, Red','City (Capitol)','City (Large)','City (Medium)','City (Small)','City Hall','Civil','Coast Guard','Controlled Area','Convenience Store','Crossing','Cover','Covey'
		,'Dam','Danger Area','Department Store','Diamond, Blue','Diamond, Green','Diamond, Red','Diver Down Flag 1','Diver Down Flag 2','Dock','Dot','Dot, White','Drinking Water','Dropoff'
		,'Exit'
		,'Fast Food','Fishing Area','Fishing Hot Spot Facility','Fitness Center','Flag','Flag, Blue','Flag, Green','Flag, Red','Forest','Food Source','Furbearer'
		,'Gas Station','Geocache','Geocache Found','Ghost Town','Glider Area','Golf Course','Ground Transportation'
		,'Heliport','Horn','Hunting Area'
		,'Ice Skating','Information'
		,'Levee','Library','Light','Live Theater','Lodge','Lodging','Letterbox Cache'
		,'Man Overboard','Marina','Medical Facility','Mile Marker','Military','Mine','Movie Theater','Museum','Multi Cache','Multi-Cache'
		,'Navaid, Amber','Navaid, Black','Navaid, Blue','Navaid, Green','Navaid, Green/Red','Navaid, Green/White','Navaid, Orange','Navaid, Red','Navaid, Red/Green','Navaid, Red/White','Navaid, Violet','Navaid, White','Navaid, White/Green','Navaid, White/Red'
		,'Oil Field','Oval, Blue','Oval, Green','Oval, Red'
		,'Parachute Area','Park','Parking Area','Pharmacy','Picnic Area','Pin, Blue','Pin, Green','Pin, Red','Pizza','Police Station','Post Office','Private Field','Puzzle Cache'
		,'Radio Beacon','Rectangle, Blue','Rectangle, Green','Rectangle, Red','Reef','Residence','Restaurant','Restricted Area','Restroom','RV Park'
		,'Scales','Scenic Area','School','Seaplane Base','Shipwreck','Shopping Center','Short Tower','Shower','Ski Resort','Skiing Area','Skull and Crossbones','Soft Field','spacer.gif','Square, Blue','Square, Green','Square, Red','Stadium','Stump','Summit','Swimming Area','Small Game'
		,'Tall Tower','Telephone','Toll Booth','TracBack Point','Trail Head','Triangle, Blue','Triangle, Green','Triangle, Red','Truck Stop','Tunnel','Tree Stand','Treed Quarry','Truck'
		,'Ultralight Area','Upland Game'
		,'Water','Water Hydrant','Water Source','Waypoint','Weed Bed','Wrecker','Waterfowl','Winery'
		,'Zoo'
		,'CoursePoint:1st_Category','CoursePoint:2nd_Category','CoursePoint:3rd_Category','CoursePoint:4th_Category','CoursePoint:Danger','CoursePoint:First_Aid','CoursePoint:FirstAid','CoursePoint:FirstCat','CoursePoint:Food','CoursePoint:FourthCat','CoursePoint:Generic','CoursePoint:Hors_Category','CoursePoint:HorsCat','CoursePoint:Left','CoursePoint:Right','CoursePoint:SecondCat','CoursePoint:Sprint','CoursePoint:Straight','CoursePoint:Summit','CoursePoint:ThirdCat','CoursePoint:Valley','CoursePoint:Water'
	);
	$hash = array(); foreach ($list as $icon) { $hash[$icon] = true; }
	return $hash;
}

################################################################################
function Define_GPSV_Icons() {
	$list = array(
		'airport'
		,'blankcircle'
		,'camera'
		,'circle'
		,'cross'
		,'diamond'
		,'google'
		,'googleblank'
		,'googlemini'
		,'pin'
		,'square'
		,'star'
		,'tickmark'
		,'triangle'
	);
	$hash = array(); foreach ($list as $icon) { $hash[$icon] = true; }
	return $hash;
}

################################################################################
function HTMLColorList() {
	return array(
		'default'=>'FF776B'
		,'aliceblue'=>'F0F8FF'
		,'antiquewhite'=>'FAEBD7'
		,'aqua'=>'00FFFF'
		,'aquamarine'=>'7FFFD4'
		,'azure'=>'F0FFFF'
		,'beige'=>'F5F5DC'
		,'bisque'=>'FFE4C4'
		,'black'=>'000000'
		,'blanchedalmond'=>'FFEBCD'
		,'blue'=>'0000FF'
		,'blueviolet'=>'8A2BE2'
		,'brown'=>'A52A2A'
		,'burlywood'=>'DEB887'
		,'cadetblue'=>'5F9EA0'
		,'chartreuse'=>'7FFF00'
		,'charcoal'=>'666666'
		,'chocolate'=>'D2691E'
		,'coral'=>'FF7F50'
		,'cornflowerblue'=>'6495ED'
		,'cornsilk'=>'FFF8DC'
		,'crimson'=>'DC143C'
		,'cyan'=>'00FFFF'
		,'darkblue'=>'00008B'
		,'darkcyan'=>'008B8B'
		,'darkgoldenrod'=>'B8860B'
		,'darkgray'=>'A9A9A9'
		,'darkgrey'=>'A9A9A9'
		,'darkgreen'=>'006400'
		,'darkkhaki'=>'BDB76B'
		,'darkmagenta'=>'8B008B'
		,'darkolivegreen'=>'556B2F'
		,'darkorange'=>'FF8C00'
		,'darkorchid'=>'9932CC'
		,'darkred'=>'8B0000'
		,'darksalmon'=>'E9967A'
		,'darkseagreen'=>'8FBC8F'
		,'darkslateblue'=>'483D8B'
		,'darkslategray'=>'2F4F4F'
		,'darkslategrey'=>'2F4F4F'
		,'darkturquoise'=>'00CED1'
		,'darkviolet'=>'9400D3'
		,'darkyellow'=>'999900'
		,'deeppink'=>'FF1493'
		,'deepskyblue'=>'00BFFF'
		,'dimgray'=>'696969'
		,'dimgrey'=>'696969'
		,'dodgerblue'=>'1E90FF'
		,'firebrick'=>'B22222'
		,'floralwhite'=>'FFFAF0'
		,'forestgreen'=>'228B22'
		,'fuchsia'=>'FF00FF'
		,'gainsboro'=>'DCDCDC'
		,'ghostwhite'=>'F8F8FF'
		,'gold'=>'FFD700'
		,'goldenrod'=>'DAA520'
		,'gray'=>'808080'
		,'grey'=>'808080'
		,'green'=>'008000'
		,'greenyellow'=>'ADFF2F'
		,'honeydew'=>'F0FFF0'
		,'hotpink'=>'FF69B4'
		,'indianred'=>'CD5C5C'
		,'indigo'=>'4B0082'
		,'ivory'=>'FFFFF0'
		,'khaki'=>'F0E68C'
		,'lavender'=>'E6E6FA'
		,'lavenderblush'=>'FFF0F5'
		,'lawngreen'=>'7CFC00'
		,'lemonchiffon'=>'FFFACD'
		,'lightblue'=>'ADD8E6'
		,'lightcoral'=>'F08080'
		,'lightcyan'=>'E0FFFF'
		,'lightgoldenrodyellow'=>'FAFAD2'
		,'lightgreen'=>'90EE90'
		,'lightgray'=>'D3D3D3'
		,'lightgrey'=>'D3D3D3'
		,'lightpink'=>'FFB6C1'
		,'lightsalmon'=>'FFA07A'
		,'lightseagreen'=>'20B2AA'
		,'lightskyblue'=>'87CEFA'
		,'lightslategray'=>'778899'
		,'lightslategrey'=>'778899'
		,'lightsteelblue'=>'B0C4DE'
		,'lightyellow'=>'FFFFE0'
		,'lime'=>'00FF00'
		,'limegreen'=>'32CD32'
		,'linen'=>'FAF0E6'
		,'magenta'=>'FF00FF'
		,'maroon'=>'800000'
		,'mediumaquamarine'=>'66CDAA'
		,'mediumblue'=>'0000CD'
		,'mediumorchid'=>'BA55D3'
		,'mediumpurple'=>'9370DB'
		,'mediumseagreen'=>'3CB371'
		,'mediumslateblue'=>'7B68EE'
		,'mediumspringgreen'=>'00FA9A'
		,'mediumturquoise'=>'48D1CC'
		,'mediumvioletred'=>'C71585'
		,'midnightblue'=>'191970'
		,'mintcream'=>'F5FFFA'
		,'mistyrose'=>'FFE4E1'
		,'moccasin'=>'FFE4B5'
		,'navajowhite'=>'FFDEAD'
		,'navy'=>'000080'
		,'oldlace'=>'FDF5E6'
		,'olive'=>'808000'
		,'olivedrab'=>'6B8E23'
		,'orange'=>'FFA500'
		,'orangered'=>'FF4500'
		,'orchid'=>'DA70D6'
		,'palegoldenrod'=>'EEE8AA'
		,'palegreen'=>'98FB98'
		,'paleturquoise'=>'AFEEEE'
		,'palevioletred'=>'DB7093'
		,'papayawhip'=>'FFEFD5'
		,'peachpuff'=>'FFDAB9'
		,'peru'=>'CD853F'
		,'pink'=>'FFC0CB'
		,'plum'=>'DDA0DD'
		,'powderblue'=>'B0E0E6'
		,'purple'=>'800080'
		,'red'=>'FF0000'
		,'rosybrown'=>'BC8F8F'
		,'royalblue'=>'4169E1'
		,'saddlebrown'=>'8B4513'
		,'salmon'=>'FA8072'
		,'sandybrown'=>'F4A460'
		,'seagreen'=>'2E8B57'
		,'seashell'=>'FFF5EE'
		,'sienna'=>'A0522D'
		,'silver'=>'C0C0C0'
		,'skyblue'=>'87CEEB'
		,'slateblue'=>'6A5ACD'
		,'slategray'=>'708090'
		,'slategrey'=>'708090'
		,'snow'=>'FFFAFA'
		,'springgreen'=>'00FF7F'
		,'steelblue'=>'4682B4'
		,'tan'=>'D2B48C'
		,'teal'=>'008080'
		,'thistle'=>'D8BFD8'
		,'tomato'=>'FF6347'
		,'turquoise'=>'40E0D0'
		,'violet'=>'EE82EE'
		,'wheat'=>'F5DEB3'
		,'white'=>'FFFFFF'
		,'whitesmoke'=>'F5F5F5'
		,'yellow'=>'FFFF00'
		,'yellowgreen'=>'9ACD32'
	);
}

?>
