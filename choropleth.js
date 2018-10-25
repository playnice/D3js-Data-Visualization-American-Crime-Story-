var width = 750;
var height = 500;
var padding = 20;
var active = d3.select(null);
var zoom_state;
var target;

// color for state
var color = d3.scaleQuantile()
    .domain([0,1])
    .range(d3.schemePuRd[9])


// color for cities
var cityColor = d3.scaleQuantile()
    .domain([0,1])
    .range(d3.schemePuRd[9])

// define projections
var projection = d3.geoAlbers()
    .precision(0)
    .scale(height * 2).translate([width / 2, height / 2])

var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var path = d3.geoPath().projection(projection)

var svg = d3.select('#choropleth')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .on("click", stopped, true);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");

svg.call(zoom);

d3.queue()
    .defer(d3.csv, 'data.csv', function (d) {
        return {
            id: d.State + d.City,
            state: d.State,
            city: d.City,
            population: d.Population,
            violent: d["Violent crime"],
            murder: d["Murder and nonnegligent manslaughter"],
            rape_r: d["Rape (revised definition)1"],
            rape_l: d["Rape (legacy definition)"],
            robbery: d.Robbery,
            assault: d["Aggravated assault"],
            property: d["Property crime"],
            burglary: d.Burglary,
            larceny: d["Larceny-theft"],
            motor: d["Motor vehicle theft"],
            arson3: d.Arson3
        }
    })
    .defer(d3.json, 'data/us-states.json')
    .defer(d3.json, 'data/us-counties.json')
    .awaitAll(initialize)

function initialize(error, results) {
    if (error) { throw error }

    var data = results[0]
    var states = results[1].features
    var counties = results[2].features

    // calculate the centroid
    var centroids = counties
            .filter(function(d) { return d.geometry && d.geometry.coordinates.length; })
            .map(d3.geoCentroid);

    // add centroid
    counties.forEach(function(f, i) {
      f.properties.centroid = centroids[i];
    })

    counties.forEach(function(f) {
      data.forEach(function(d) {
        if (f.properties.NAME_2.toLowerCase() == d.city.toLowerCase()) {
          f.properties.violent = d["violent"].replace(/,/g, '');
          f.properties.murder = d["murder"].replace(/,/g, '');
          f.properties.rape_r = d["rape_r"].replace(/,/g, '');
          f.properties.rape_l = d["rape_l"].replace(/,/g, '');
          f.properties.robbery = d["robbery"].replace(/,/g, '');
          f.properties.assault = d["assault"].replace(/,/g, '');
          f.properties.property = d["property"].replace(/,/g, '');
          f.properties.burglary = d["burglary"].replace(/,/g, '');
          f.properties.larceny = d["larceny"].replace(/,/g, '');
          f.properties.motor = d["motor"].replace(/,/g, '');
          f.properties.arson3 = d["arson3"].replace('/./g', '');
          f.properties.population = d["population"].replace(/,/g, '');
        }
      })
    })

    var option = ["Violent Crime", "Murder and nonnegligent manslaughter", "Rape (revised definition)", "Rape (legacy definition)", "Robbery", "Aggravated assault", "Property Crime", "Burglary", "Larceny-theft", "Motor vehicle", "Arson3"];
    var option_str = '';
    for (var i = 0; i < option.length; i ++ ) {
      if (option[i] == "Property Crime" || option[i] == "Violent Crime")
        option_str += "<label id='"+option[i][0]+"' class='main-cat'><input type='radio' name='crime' value='" + option[i] +"'>" + option[i] + "</label><br>";
      else
        option_str += "<label><input type='radio' name='crime' value='" + option[i] +"'>" + option[i] + "</label><br>";
    }
    $("#ncann-filter").append(option_str);

    d3.selectAll("#ncann-filter input").on("click", function(d) {
      target = this.value;
      updateMap(target)
    })

    $("#reset").click(function() {
      return reset();
    })

    // initial settings
    var statePaths = g.append("g").selectAll('.state')
        .data(states)
        .enter().append('path')
        .attr('class', 'state')
        .attr('d', path)
        // .append("title")			// Simple tooltip
        // .text(function(d) {
        //      return d;
        // });


    // default to violent crime
    $("#V input").prop("checked", true);
    updateMap("Violent Crime")

    // add physical counties borders
    var countyPaths = g.append("g").selectAll('.county')
        .data(counties)
        .enter().append('path')
        .attr('class', 'county')
        .attr('d', path)
        .on("click", clicked)
        .attr("display", "none");

    // add population using circle
    svg.selectAll("circle")
        .data(counties)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return projection([d.properties.centroid[0], d.properties.centroid[1]])[0];
        })
        .attr("cy", function(d) {
            return projection([d.properties.centroid[0], d.properties.centroid[1]])[1];
        })
        .attr("r", function(d) {
             if (d.properties.population) {
               return Math.sqrt(parseInt(d.properties.population) * 0.0001);
             }
        })
        .style("fill", "#EC407A")
        .style("stroke", "gray")
        .style("stroke-width", 0.25)
        .style("opacity", 0.7)
        .append("title")			// Simple tooltip
        .text(function(d) {
             return d.properties.population;
        });

    // extract category selected with count
    function extract_category(data, tgt_cat) {
      var statesData = d3.nest().key(function(d){
          return d.state; })
      .rollup(function(leaves){
          return d3.sum(leaves, function(d){
              return d[tgt_cat];
          });
      }).entries(data)
      .map(function(d){
          return { state: d.key, value: d.value};
      });

      return statesData;
    }

    function updateMap(tgt_cat) {
      target = getTarget(tgt_cat);
      var statesData = extract_category(data, target);

      // update color domain
      color.domain(
        [
          d3.min(statesData, function(d) { return parseInt(d.value); }),
          d3.max(statesData, function(d) { return parseInt(d.value); })
        ]
      );

      cityColor.domain(
        [
          d3.min(data, function(d) { return parseInt(d[target]); }),
          d3.max(data, function(d) { return parseInt(d[target]); })
        ]
      );


      states.forEach(function (f) {
          statesData.forEach(function(d) {
            if (f.properties.NAME_1.toLowerCase() == d.state.toLowerCase()) {
              f.properties.count = d.value;
            }
          })
      })

      statePaths
          .style('fill', function (d) {
              return color(d.properties.count)
          })
          .on("click", clicked)
          .append("text")
          .attr("text", function(d) { return d.properties.NAME_1; })
          .append("title")			// Simple tooltip
          .text(function(d) {
               return d.properties;
          });

      if (zoom_state) {
        d3.selectAll(".state").style("fill", function(f) {
          if (f.properties.NAME_1 !== zoom_state) {
            return "#000";
          }
        })
      }


      d3.selectAll(".county").style('fill', function (f) {
          if (f.properties.NAME_1 == zoom_state) {
            return cityColor(f.properties[target])
          }
          else {
            return "#000";
          }
      })
      .append("text")
      .attr("text", function(d) { return d.properties.NAME_1; })
    }

    function getTarget(tgt_cat) {
      if (tgt_cat == "Violent Crime") return "violent";
      else if (tgt_cat == "Property Crime") return "property";
      else if (tgt_cat == "Murder and nonnegligent manslaughter") return "murder"
      else if (tgt_cat == "Rape (revised definition)") return "rape_r";
      else if (tgt_cat == "Rape (legacy definition)") return "rape_l";
      else if (tgt_cat == "Robbery") return "robbery";
      else if (tgt_cat == "Aggravated assault") return "assault";
      else if (tgt_cat == "Burglary") return "burglary";
      else if (tgt_cat == "Larceny-theft") return "larceny";
      else if (tgt_cat == "Motor vehicle") return "motor";
      else if (tgt_cat == "Arson3") return "arson3";
    }


}


function clicked(d) {
  zoom_state = d.properties.NAME_1;
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg.transition()
      .duration(750)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4

  d3.selectAll(".state").style("fill", function(f) {
    if (f.properties.NAME_1 !== d.properties.NAME_1) {
      return "#000";
    }
  })

  d3.selectAll(".county").style('fill', function (f) {
      if (f.properties.NAME_1 == d.properties.NAME_1) {
        return cityColor(f.properties[target])
      }
      else {
        return "#000";
      }
  })
  .style("display", function(f) {
    if (f.properties.NAME_1 == d.properties.NAME_1) {

    }
    else {
      return "none";
    }
  })
  .attr("display", "initial")
  .append("text")
  .attr("text", function(d) { return d.properties.NAME_1; })

}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  d3.selectAll(".state").style("fill", function(f) {
    return color(f.properties.count);
  })
  d3.selectAll(".county").attr("display", "none");

  svg.transition()
      .duration(750)
      .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
  g.attr("transform", d3.event.transform); // updated for d3 v4
  svg.selectAll("circle").attr("transform", d3.event.transform);
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}


// legend
