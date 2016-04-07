/* global Celestial, $, px, isNumber, Round */
//display settings form

//test with onchange and set cfg
function form(cfg) {
  var prj = Celestial.projections(), leo = Celestial.eulerAngles();
  var ctrl = d3.select("#form").append("div").attr("class", "ctrl");
  var frm = ctrl.append("form").attr("id", "params").attr("name", "params").attr("method", "get").attr("action" ,"#");
  
  //Map parameters    
  var col = frm.append("div").attr("class", "col");
  
  col.append("label").attr("title", "Map width, 0 indicates full width").attr("for", "width").html("Width ");
  col.append("input").attr("type", "number").attr("maxlength", "4").attr("max", "9999").attr("min", "0").attr("title", "Map width").attr("id", "width").attr("value", cfg.width).on("change", redraw);
  col.append("span").html("px");

  col.append("label").attr("title", "Map projection, (hemi) indicates hemispherical projection").attr("for", "projection").html("Projection");
  var sel = col.append("select").attr("id", "projection").on("change", redraw);
  var selected = 0;
  var list = Object.keys(prj).map( function (key, i) { 
    var n = prj[key].clip && prj[key].clip === true ? prj[key].n + " (hemi)" : prj[key].n; 
    if (key === cfg.projection) selected = i;
    return {o:key, n:n};
  });
  sel.selectAll('option').data(list).enter().append('option')
     .attr("value", function (d) { return d.o; })
     .text(function (d) { return d.n; });
  sel.property("selectedIndex", selected);
  
  selected = 0;
  col.append("label").attr("title", "Coordinate space in which the map is displayed").attr("for", "transform").html("Coordinates");
  sel = col.append("select").attr("id", "transform").on("change", redraw);
  list = Object.keys(leo).map(function (key, i) {
    if (key === cfg.transform) selected = i;    
    return {o:key, n:key.replace(/^([a-z])/, function(s, m) { return m.toUpperCase(); } )}; 
  });
  sel.selectAll("option").data(list).enter().append('option')
     .attr("value", function (d) { return d.o; })
     .text(function (d) { return d.n; });
  sel.property("selectedIndex", selected);
  col.append("br");
  
  col.append("label").attr("title", "Center coordinates long/lat in selected coordinate space").attr("for", "centerx").html("Center");
  col.append("input").attr("type", "number").attr("id", "centerx").attr("title", "Center right ascension/lngitude").attr("max", "24").attr("min", "0").attr("step", "0.1").on("change", turn);
  col.append("span").attr("id", "cxunit").html("h");
  
  col.append("input").attr("type", "number").attr("id", "centery").attr("title", "Center declination/latitude").attr("max", "90").attr("min", "-90").attr("step", "0.1").on("change", turn);
  col.append("span").html("\u00b0");
  
  setCenter(cfg);
  
  col.append("input").attr("type", "button").attr("id", "show").attr("value", "Show");
  //col.append("input").attr("type", "button").attr("id", "defaults").attr("value", "Defaults");

  // Stars 
  col = frm.append("div").attr("class", "col");
  
  col.append("label").attr("class", "header").attr("for", "stars-show").html("Stars");
  col.append("input").attr("type", "checkbox").attr("id", "stars-show").property("checked", cfg.stars.show).on("change", apply);
  
  col.append("label").attr("for", "stars-limit").html("down to magnitude");
  col.append("input").attr("type", "number").attr("id", "stars-limit").attr("title", "Star display limit").attr("value", cfg.stars.limit).attr("max", "6").attr("min", "-1").attr("step", "0.1").on("change", apply);
  
  col.append("label").attr("for", "stars-colors").html("with spectral colors");
  col.append("input").attr("type", "checkbox").attr("id", "stars-colors").property("checked", cfg.stars.colors).on("change", apply);
  
  col.append("label").attr("for", "stars-color").html("or default color ");
  col.append("input").attr("type", "color").attr("id", "stars-style-fill").property("value", cfg.stars.style.fill).on("change", apply);
  col.append("br");
  
  col.append("label").attr("for", "stars-names").html("Show names");
  col.append("input").attr("type", "checkbox").attr("id", "stars-names").on("change", apply);
  
  col.append("label").attr("for", "stars-proper").html("proper names (if any)");
  col.append("input").attr("type", "checkbox").attr("id", "stars-proper").property("checked", cfg.stars.proper).on("change", apply);
  
  col.append("label").attr("for", "stars-desig").attr("title", "include HD/HIP designations").html("all designations");
  col.append("input").attr("type", "checkbox").attr("id", "stars-desig").property("checked", cfg.stars.desig).on("change", apply);
  
  col.append("label").attr("for", "stars-namelimit").html("down to mag");
  col.append("input").attr("type", "number").attr("id", "stars-namelimit").attr("title", "Star name display limit").attr("value", cfg.stars.namelimit).attr("max", "6").attr("min", "-1").attr("step", "0.1").on("change", apply);

  enable($("stars-show"));
  
  // DSOs 
  col = frm.append("div").attr("class", "col");
  
  col.append("label").attr("class", "header").attr("title", "Deep Space Objects").attr("for", "dsos-show").html("DSOs");
  col.append("input").attr("type", "checkbox").attr("id", "dsos-show").property("checked", cfg.dsos.show).on("change", apply);
  
  col.append("label").attr("for", "dsos-limit").html("down to mag");
  col.append("input").attr("type", "number").attr("id", "dsos-limit").attr("title", "DSO display limit").attr("value", cfg.dsos.limit).attr("max", "6").attr("min", "0").attr("step", "0.1").on("change", apply);
  
  col.append("label").attr("for", "dsos-names").html("with names");
  col.append("input").attr("type", "checkbox").attr("id", "dsos-names").property("checked", cfg.dsos.names).on("change", apply);
  
  col.append("label").attr("for", "dsos-desig").html("or designations");
  col.append("input").attr("type", "checkbox").attr("id", "dsos-desig").property("checked", cfg.dsos.desig).on("change", apply);
  
  col.append("label").attr("for", "dsos-namelimit").html("down to mag");
  col.append("input").attr("type", "number").attr("id", "dsos-namelimit").attr("title", "DSO name display limit").attr("value", cfg.dsos.namelimit).attr("max", "6").attr("min", "0").attr("step", "0.1").on("change", apply);

  enable($("dsos-show"));

  // Constellations 
  col = frm.append("div").attr("class", "col");
  col.append("label").attr("class", "header").html("Constellations");
  //col.append("input").attr("type", "checkbox").attr("id", "constellations-show").property("checked", cfg.constellations.show).on("change", apply);
  
  col.append("label").attr("for", "constellations-names").html("Show names");
  col.append("input").attr("type", "checkbox").attr("id", "constellations-names").property("checked", cfg.constellations.names).on("change", apply);
  
  col.append("label").attr("for", "constellations-desig").html("abbreviated");
  col.append("input").attr("type", "checkbox").attr("id", "constellations-desig").property("checked", cfg.constellations.desig).on("change", apply);
  
  col.append("label").attr("for", "constellations-lines").html("with lines");
  col.append("input").attr("type", "checkbox").attr("id", "constellations-lines").property("checked", cfg.constellations.lines).on("change", apply);
  
  col.append("label").attr("for", "constellations-bounds").html("with boundaries");
  col.append("input").attr("type", "checkbox").attr("id", "constellations-bounds").property("checked", cfg.constellations.bounds).on("change", apply);

  enable($("constellations-names"));

  // graticules & planes 
  col = frm.append("div").attr("class", "col");
  col.append("label").attr("class", "header").html("Lines");
  
  col.append("label").attr("title", "X/Y grid lines").attr("for", "lines-graticule").html("Graticule");
  col.append("input").attr("type", "checkbox").attr("id", "lines-graticule-show").property("checked", cfg.lines.graticule.show).on("change", apply);
  
  col.append("label").attr("for", "lines-equatorial").html("Equator");
  col.append("input").attr("type", "checkbox").attr("id", "lines-equatorial-show").property("checked", cfg.lines.equatorial.show).on("change", apply);
  
  col.append("label").attr("for", "lines-ecliptic").html("Ecliptic");
  col.append("input").attr("type", "checkbox").attr("id", "lines-ecliptic-show").property("checked", cfg.lines.ecliptic.show).on("change", apply);
  
  col.append("label").attr("for", "lines-galactic").html("Galactic plane");
  col.append("input").attr("type", "checkbox").attr("id", "lines-galactic-show").property("checked", cfg.lines.galactic.show).on("change", apply);
  
  col.append("label").attr("for", "lines-supergalactic").html("Supergalactic plane");
  col.append("input").attr("type", "checkbox").attr("id", "lines-supergalactic-show").property("checked", cfg.lines.supergalactic.show).on("change", apply);

  // Other
  col = frm.append("div").attr("class", "col");
  col.append("label").attr("class", "header").html("Other");
  
  col.append("label").attr("for", "mw-show").html("Milky Way");
  col.append("input").attr("type", "checkbox").attr("id", "mw-show").property("checked", cfg.mw.show).on("change", apply);
  
  col.append("label").attr("for", "background").html("Background color");
  col.append("input").attr("type", "color").attr("id", "background-fill").attr("value", cfg.background.fill).on("change", apply);
  
  col.append("label").attr("title", "Star/DSO sizes are increased with higher zoom-levels").attr("for", "adaptable").html("Adaptable sizes");
  col.append("input").attr("type", "checkbox").attr("id", "adaptable").property("checked", cfg.adaptable).on("change", apply);
 
  ctrl.append("div").attr("id", "error");
  
  $("show").onclick = function(e) {
    var x = $("centerx"),
        y = $("centery");
    //Test params
    if (!isNumber(cfg.width)) { popError($("width"), "Check Width setting"); return false; }

    if (x.value === "" && y.value !== "" || y.value === "" && x.value !== "") {
      popError(x, "Both center coordinates need to be given");
      return false; 
    } 
  
    Celestial.display(cfg);

    return false;
  };

  setLimits();
  setUnit(cfg.transform);
  /* descoped
  $("defaults").onclick = function(e) {
    cfg = Celestial.settings().set({width:0, projection:"aitoff"});
    //fillForm(cfg);
    return false;
  }*/

  function redraw() {
    var src = this;
    switch (src.id) {
      case "width": if (testNumber(src) === false) return; 
                    cfg.width = src.value; break;
      case "projection": cfg.projection = src.options[src.selectedIndex].value; break;
      case "transform": var old = cfg.transform;
                        cfg.transform = src.options[src.selectedIndex].value;
                        setUnit(cfg.transform, old); 
                        cfg.center[0] = $("centerx").value; break;
    }    
    Celestial.display(cfg);
  }
                        
  function turn() {
    var src = this,
        cx = $("centerx"), cy = $("centery");
    switch (src.id) {
      case "centerx": if (testNumber(src) === false) return;
                      if (cfg.transform !== "equatorial") cfg.center[0] = src.value; 
                      else cfg.center[0] = src.value > 12 ? src.value * 15 - 360 : src.value * 15;
                      //if (src.value === )     
                      if (cy.value === "") return; 
                      else cfg.center[1] = cy.value;
                      break;
      case "centery": if (testNumber(src) === false) return;
                      cfg.center[1] = src.value; 
                      if (cx.value === "") return; 
                      else {
                        if (cfg.transform !== "equatorial") cfg.center[0] = cx.value; 
                        else cfg.center[0] = cx.value > 12 ? cx.value * 15 - 360 : cx.value * 15;
                      }
                      break;
    }
    Celestial.rotate(cfg);
  }

  function apply() {
    var value, src = this;

    switch (src.type) {
      case "checkbox": value = src.checked; enable(src); break;
      case "number": if (testNumber(src) === false) return; value = src.value; break;
      case "color": if (testColor(src) === false) return; value = src.value; break;
    }
    set(src.id, value);
    
    Celestial.apply(cfg);
  }

  function set(prop, val) {
    var a = prop.split("-");
    switch (a.length) {
      case 1: cfg[a[0]] = val; break;
      case 2: cfg[a[0]][a[1]] = val; break;
      case 3: cfg[a[0]][a[1]][a[2]] = val; break;
      default: return;
    }
    
  }
}

// Dependend fields relations
var depends = {
  "stars-show": ["stars-limit", "stars-colors", "stars-style-fill", "stars-names"],
  "stars-names": ["stars-proper", "stars-desig", "stars-namelimit"],
  "dsos-show": ["dsos-limit", "dsos-names"],
  "dsos-names": ["dsos-desig", "dsos-namelimit"],
  "constellations-names": ["constellations-desig"]
};

// De/activate fields depending on selection of dependencies
function enable(source) {
  var fld = source.id, off;
  
  switch (fld) {
    case "stars-show": 
      off = !$(fld).checked;
      for (var i=0; i< depends[fld].length; i++) { fldEnable(depends[fld][i], off); }
      /* falls through */
    case "stars-names": 
      off = !$("stars-names").checked || !$("stars-show").checked;      
      for (i=0; i< depends["stars-names"].length; i++) { fldEnable(depends["stars-names"][i], off); }
      break;
    case "dsos-show": 
      off = !$(fld).checked;
      for (i=0; i< depends[fld].length; i++) { fldEnable(depends[fld][i], off); }
      /* falls through */
    case "dsos-names": 
      off = !$("dsos-names").checked || !$("dsos-show").checked;      
      for (i=0; i< depends["dsos-names"].length; i++) { fldEnable(depends["dsos-names"][i], off); }
      break;
    case "constellations-show": 
      off = !$(fld).checked;
      for (i=0; i< depends[fld].length; i++) { fldEnable(depends[fld][i], off); }
      break;
  }  
}

// Enable/disable field d to status off
function fldEnable(d, off) {
  var node = $(d);
  node.disabled = off;
  node.previousSibling.style.color = off ? "#999" : "#000";  
}

// Error notification
function popError(nd, err) {
  //var p = nd.getBoundingClientRect();
  d3.select("#error").html(err).style( {top:px(nd.offsetTop+nd.offsetHeight+1), left:px(nd.offsetLeft), opacity:1} );
}

//Check numeric field
function testNumber(node) {
  var v = node.value;
  //if (v === "") return true;
  if (!isNumber(v)) { popError(node, node.title + ": check field value"); return false; }
  v = parseFloat(v);
  if (v < node.min || v > node.max ) { popError(node, node.title + " must be between " + node.min + " anode " + node.max); return false; }
  d3.select("#error").style( {top:"-9999px", left:"-9999px", opacity:0} );
  return true;
}

//Check color field
function testColor(node) {
  var v = node.value;
  if (v === "") return true;
  if (v.search(/^#[0-9A-F]{6}$/i) === -1) { popError(node, node.title + ": not a color value"); return false; }
  d3.select("#error").style( {top:"-9999px", left:"-9999px", opacity:0} );
  return true;
}

function setUnit(trans, old) {
  var cx = $("centerx");
  
  if (old) {
    if (trans === "equatorial" && old !== "equatorial") {
      cx.value = Round(cx.value/15, 1);
      if (cx.value < 0) cx.value += 24;
    } else if (trans !== "equatorial" && old === "equatorial") {
      cx.value = Round(cx.value * 15, 1);
      if (cx.value > 180) cx.value -= 360;
    }
  }
  if (trans === 'equatorial') {
    cx.min = "0";
    cx.max = "24";
    $("cxunit").innerHTML = "h";
  } else {
    cx.min = "-180";
    cx.max = "180";
    $("cxunit").innerHTML = "\u00b0";
  }
}

function setCenter(cfg) {
  var cx = $("centerx"), cy = $("centery"),
      ctr = cfg.center;
  if (!cx || !cy) return;
  
  if (ctr === null) ctr = [0,0]; 
  //cfg.center = ctr; 
  if (cfg.transform !== "equatorial") cx.value = Round(ctr[0], 1); 
  else cx.value = ctr[0] < 0 ? Round(ctr[0] / 15 + 24, 1) : Round(ctr[0] / 15, 1); 
  
  cy.value = Round(ctr[1], 1);
}

// Set max input limits depending on data
function setLimits() {
  var t, rx = /\d+(\.\d+)?/g,
      s, d, res = {s:6, d:6},
      cfg =  Celestial.settings();

  d = cfg.dsos.data;
  
  //test dso limit
  t = d.match(rx);
  if (t !== null) {
    res.d = parseFloat(t[t.length-1]);
  }

  if (res.d != 6) {
    $("dsos-limit").max = res.d;
    $("dsos-namelimit").max = res.d;
  }
   
   s = cfg.stars.data;
  
  //test star limit
  t = s.match(rx);
  if (t !== null) {
    res.s = parseFloat(t[t.length-1]);
  }

  if (res.s != 6) {
    $("stars-limit").max = res.s;
    $("stars-namelimit").max = res.s;
  }

  return res;
}
