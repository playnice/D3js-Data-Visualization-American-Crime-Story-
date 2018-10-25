var el_id = "treemap";
var obj = document.getElementById(el_id);
var divWidth = 750;
var tree_margin = {
  top: 30,
  right: 0,
  bottom: 0,
  left: 0
 },
 tree_width = divWidth,
 tree_height = 500 - tree_margin.top - tree_margin.bottom,
 tree_formatNumber = d3.format(","),
 tree_transitioning;
var tree_color = d3.scaleQuantile()
 .domain([0, 1])
 .range(d3.schemePuRd[9]);

// color for state
var tree_subColor = d3.scaleQuantile()
 .domain([0, 1])
 .range(d3.schemePuRd[9]);

// sets x and y scale to determine size of visible boxes
var tree_x = d3.scaleLinear()
 .domain([0, tree_width])
 .range([0, tree_width]);
var tree_y = d3.scaleLinear()
 .domain([0, tree_height])
 .range([0, tree_height]);
var treemap = d3.treemap()
 .size([tree_width, tree_height])
 .paddingInner(0)
 .round(false);
var tree_svg = d3.select('#' + el_id).append("svg")
 .attr("width", tree_width + tree_margin.left + tree_margin.right)
 .attr("height", tree_height + tree_margin.bottom + tree_margin.top)
 .style("margin-left", -tree_margin.left + "px")
 .style("margin.right", -tree_margin.right + "px")
 .append("g")
 .attr("transform", "translate(" + tree_margin.left + "," + tree_margin.top + ")")
 .style("shape-rendering", "crispEdges");
var grandparent = tree_svg.append("g")
 .attr("class", "grandparent");
grandparent.append("rect")
 .attr("y", -tree_margin.top)
 .attr("width", tree_width)
 .attr("height", tree_margin.top)
 .attr("fill", '#FF5252');
grandparent.append("text")
 .attr("x", 6)
 .attr("y", 6 - tree_margin.top)
 .attr("dy", ".75em");

// Define the div for the tooltip
var tree_div = d3.select("body").append("div")
 .attr("class", "tooltip")
 .style("opacity", 0);

d3.csv("data.csv", function(dataa) {

 // default selection
 var tree = processData(dataa, "Violent crime")

 display(tree);

 console.log(d3.selectAll("#ncann-filter input"))
 $(document).on("click", "#ncann-filter input", function(d) {
  var tree_target = this.value;
  d3.select("svg .depth").remove();
  var tree_root = processData(dataa, tree_target)
  display(tree_root);
 })

 function display(d) {
  d3.selectAll(".child").remove();

  grandparent
   .datum(d.parent)
   .on("click", transition)
   .select("text")
   .text(name(d))
   .attr("fill", "#fff");

  grandparent
   .datum(d.parent)
   .select("rect")
   .attr("fill", function() {
    return '#FF5252'
  });

  var g1 = tree_svg.insert("g", ".grandparent")
   .datum(d)
   .attr("class", "depth");
  var tree_g = g1.selectAll("g")
   .data(d.children)
   .enter()
   .append("g")


  // add class and click handler to all g's with children
  tree_g.filter(function(d) {
    return d.children;
   })
   .classed("children", true)
   .on("click", transition);

  tree_g.selectAll(".child")
   .data(function(d) {
    return d;
   })
   .enter().append("rect")
   .attr("class", "child")
   .style("fill", function(d) {
    if (d.value) return tree_subColor(d.value)
    else return tree_subColor(d.data.value);
   })
   .call(rect);

  // add title to parents
  tree_g.append("rect")
   .attr("class", "parent")
   .style("fill", function(d) {
    return tree_color(d.value);
   })

  .call(rect)
   .append("title")
   .text(function(d) {
    return d.data.name;
   });
  /* Adding a foreign object instead of a text object, allows for text wrapping */

  tree_g.append("foreignObject")
   .call(rect)
   .attr("class", "foreignobj")
   .append("xhtml:div")
   .attr("dy", ".75em")
   .html(function(d) {
    return '' +
     '<p class="title"> ' + d.data.name + '</p>' +
     '<p>' + tree_formatNumber(d.value) + '</p>';
   })
  .attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS

  d3.selectAll("foreignObject")
   .style("opacity", function(d) {
    if ((tree_x(d.x1) - tree_x(d.x0)) / tree_width > 0.06 && (tree_y(d.y1) - tree_y(d.y0)) / tree_height > 0.07) {
     return 1;
    } else {
     return 0;
    }
   })

  function transition(d) {
   if (tree_transitioning || !d) return;
   tree_transitioning = true;

   tree_color.domain(
    [
     d3.min(d.children, function(d) {
      return parseInt(d.value);
     }),
     d3.max(d.children, function(d) {
      return parseInt(d.value);
     })
    ]
   );

   console.log(color.domain())
   yy = d3.scaleLinear()
     .range([0, 350])
     .domain(tree_color.domain());

   yAxis = d3.axisBottom()
     .scale(yy)
     .ticks(5);

   d3.selectAll(".yy").remove();
   key.append("g")
     .attr("class", "y axis")
     .attr("transform", "translate(0,30)")
     .call(yAxis)
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("axis title");

   var g2 = display(d),
    t1 = g1.transition().duration(650),
    t2 = g2.transition().duration(650);


   // Update the domain only after entering new elements.
   tree_x.domain([d.x0, d.x1]);
   tree_y.domain([d.y0, d.y1]);
   // Enable anti-aliasing during the transition.
   tree_svg.style("shape-rendering", null);
   // Draw child nodes on top of parent nodes.
   tree_svg.selectAll(".depth").sort(function(a, b) {
    return a.depth - b.depth;
   });
   // Fade-in entering text.
   g2.selectAll("text").style("fill-opacity", 0);
   g2.selectAll("foreignObject div").style("display", "none");
   /*added*/
   // Transition to the new view.
   t1.selectAll("text").call(text).style("fill-opacity", 0);
   t2.selectAll("text").call(text).style("fill-opacity", 1);
   t1.selectAll("rect").call(rect);
   t2.selectAll("rect").call(rect);
   /* Foreign object */
   t1.selectAll(".textdiv").style("display", "none");
   /* added */
   t1.selectAll(".foreignobj").call(foreign);
   /* added */
   t2.selectAll(".textdiv").style("display", "block");
   /* added */
   t2.selectAll(".foreignobj").call(foreign);
   /* added */
   // Remove the old node when the transition is finished.
   t1.on("end.remove", function() {
    this.remove();
    d3.selectAll(".child").remove()
    tree_transitioning = false;
   });

   d3.selectAll("foreignObject")
    .style("opacity", function(d) {
     if ((tree_x(d.x1) - tree_x(d.x0)) / tree_width > 0.06 && (tree_y(d.y1) - tree_y(d.y0)) / tree_height > 0.07) {
      return 1;
     } else {
      return 0;
     }
    })
  }
  return tree_g;
 }

 function text(text) {
  text.attr("x", function(d) {
    return tree_x(d.x) + 6;
   })
   .attr("y", function(d) {
    return tree_y(d.y) + 6;
   });
 }

 function rect(rect) {
  rect
   .attr("x", function(d) {
    return tree_x(d.x0);
   })
   .attr("y", function(d) {
    return tree_y(d.y0);
   })
   .attr("width", function(d) {
    return tree_x(d.x1) - tree_x(d.x0);
   })
   .attr("height", function(d) {
    return tree_y(d.y1) - tree_y(d.y0);
   })
   .attr("fill", function(d) {
    return '#bbbbbb';
   });
 }

 function foreign(foreign) { /* added */
  foreign
   .attr("x", function(d) {
    return tree_x(d.x0);
   })
   .attr("y", function(d) {
    return tree_y(d.y0);
   })
   .attr("width", function(d) {
    return tree_x(d.x1) - tree_x(d.x0);
   })
   .attr("height", function(d) {
    return tree_y(d.y1) - tree_y(d.y0);
   });
 }

 function name(d) {
  return breadcrumbs(d) +
   (d.parent ? " -  Click to zoom out" : " - Click inside square to zoom in");
 }

 function breadcrumbs(d) {
  var res = "";
  var sep = " > ";
  d.ancestors().reverse().forEach(function(i) {
   res += i.data.name + sep;
  });
  return res
   .split(sep)
   .filter(function(i) {
    return i !== "";
   })
   .join(sep);
 }
});

function processData(dt, tgt) {
  tgt = getTarget(tgt);
  console.log(tgt)
 var statesData = d3.nest().key(function(d) {
   return d.State;
  })
  .rollup(function(leaves) {
   return d3.sum(leaves, function(d) {
    return +d[tgt];
   });
  }).entries(dt)
  .map(function(d) {
   return {
    name: d.key,
    value: 0,
    children: []
   };
  });

 statesData.forEach(function(d) {
  for (var i = 0; i < dt.length; i++) {
   if (d.name.toLowerCase().trim() === dt[i].State.toLowerCase().trim() && dt[i][tgt] != "0") {
    // if (d.children.length < 51)
    console.log(tgt)
    d.children.push({
     name: dt[i].City,
     value: +parseInt(dt[i][tgt].replace(/,/g, ''))
    })
   }
  }
 })

 var us_data = {
  "name": tgt,
  children: statesData
 }
 var root = d3.hierarchy(us_data);

 treemap(root
  .sum(function(d) {
   return d.value;
  })
  .sort(function(a, b) {
   return b.value - a.value;
  })
 );

 // update color domain
 tree_color.domain(
  [
   d3.min(root.children, function(d) {
    return parseInt(d.value);
   }),
   d3.max(root.children, function(d) {
    return parseInt(d.value);
   })
  ]
 );

 yy = d3.scaleLinear()
   .range([0, 350])
   .domain(tree_color.domain());

 yAxis = d3.axisBottom()
   .scale(yy)
   .ticks(5);

d3.selectAll(".yy").remove();
 key.append("g")
   .attr("class", "yy axis")
   .attr("transform", "translate(0,30)")
   .call(yAxis)
   .append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0)
   .attr("dy", ".71em")
   .style("text-anchor", "end")
   .text("axis title");

 tree_subColor.domain(
  [
   d3.min(root.children, function(d) {
    return d3.min(d.children, function(f) {
     return f.value;
    });
   }),
   d3.max(root.children, function(d) {
    return d3.max(d.children, function(f) {
     return f.value;
    });
   })
  ]
 );

 return root;
}

function getTarget(tgt_cat) {
  if (tgt_cat == "Violent crime") return "Violent crime";
  else if (tgt_cat == "Property Crime") return "Property crime";
  else if (tgt_cat == "Murder and nonnegligent manslaughter") return "Murder and nonnegligent manslaughter"
  else if (tgt_cat == "Rape (revised definition)") return "Rape (revised definition)1";
  else if (tgt_cat == "Rape (legacy definition)") return "Rape (legacy definition)";
  else if (tgt_cat == "Robbery") return "Robbery";
  else if (tgt_cat == "Aggravated assault") return "Aggravated assault";
  else if (tgt_cat == "Burglary") return "Burglary";
  else if (tgt_cat == "Larceny-theft") return "Larceny-theft";
  else if (tgt_cat == "Motor vehicle") return "Motor vehicle theft";
  else if (tgt_cat == "Arson3") return "Arson3";
}


var ww = 350, hh = 50;

var key = d3.select("#cp-legend")
  .append("svg")
  .attr("width", ww)
  .attr("height", hh);

var clegend = key.append("defs")
  .append("svg:linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%")
  .attr("y1", "100%")
  .attr("x2", "100%")
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");

ccolor = ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#980043", "#67001f"];
var stop = 0;
ccolor.forEach(function(d) {
  clegend.append("stop")
    .attr("offset", stop + "%")
    .attr("stop-color", d)
    .attr("stop-opacity", 1);
  stop = stop + 11.5;
})

key.append("rect")
  .attr("width", ww)
  .attr("height", hh - 30)
  .style("fill", "url(#gradient)")
  .attr("transform", "translate(0,10)");

console.log([color.domain()[0], color.domain()[1]])
var y = d3.scaleLinear()
  .range([color.domain()[0], color.domain()[1]])
  .domain([color.domain()[0], color.domain()[1]]);

var yAxis = d3.axisBottom()
  .scale(y)
  .ticks(5);
