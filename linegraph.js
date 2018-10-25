// jquery slider ui
	$( function() {
		$( "#slider-range" ).slider({
			range: true,
			min: 1994,
			max: 2013,
			values: [ 1994, 2013 ],
			slide: function( event, ui ) {
				$( "#amount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
				change_year(ui.values[ 0 ], ui.values[ 1 ]);
			}
		});
		$( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 ) +
					" - " + $( "#slider-range" ).slider( "values", 1 ) );
	});

	var svgLine = d3.select("#multiLineChart"),
	    margin = {top: 20, right: 80, bottom: 30, left: 50},
	    width = svgLine.attr("width") - margin.left - margin.right,
	    height = svgLine.attr("height") - margin.top - margin.bottom,
	    multiLineChart = svgLine.append("g").attr("transform", "translate(" + (margin.left + 30) + "," + margin.top + ")");

	//Legend Config
	var legendRectSize = 18;
	var legendSpacing = 4;

	var parseTime = d3.timeParse("%Y");

	var xLine = d3.scaleTime().range([0, width]),
	    yLine = d3.scaleLinear().range([height, 0])
	    	.domain([0,5000]);
	    zLine = d3.scaleOrdinal(d3.schemeCategory10);

	var line = d3.line()
	    .curve(d3.curveBasis)
	    .x(function(d) { return xLine(d.year); })
	    .y(function(d) { return yLine(d.rate); });

	var headers;

	multiLineChart.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xLine).ticks(20))
	.append("text")
		.attr("x", svgLine.attr("width")/2 - 100)
		.attr("y", 30)
		.attr("font-size", 16)
		.attr("font-weight","bold")
		.attr("fill", "#000")
		.text("Year");

	multiLineChart.append("g")
		.attr("class", "axis axis--y")
		.call(d3.axisLeft(yLine))
	.append("text")
		.attr("transform", "rotate(-90),translate(20,0)")
		.attr("x", -(svgLine.attr("width")/5))
		.attr("y", -38)
		.attr("font-size", 16)
		.attr("font-weight","bold")
		.attr("fill", "#000")
		.text("Crime rate per 100k population");

	var ori_data;
	var new_data=[];

	function change_year(min, max) {
			var selected_year = _.range(min, max+1, 1);
			for (var i = 0, n = selected_year.length; i < n; ++i){
				selected_year[i] = parseTime(selected_year[i]);
			}

			new_data=[];
			for (var i = 0, n = ori_data.length; i < n; ++i){
				for ( var j = 0 , k = selected_year.length; j < k; ++j){
					if (ori_data[i].year == String(selected_year[j])){
						new_data.push(ori_data[i]);
					}
				}
			}
			new_data['columns'] = headers;
			updateGraph(new_data);
	}

	d3.csv("crime-type-20years.csv",type, function(error, data) {
		if (error) throw error;

	  	if (new_data.length == 0){
	  		new_data = data;
			headers = new_data.columns;
	  	}

		ori_data = data;

		updateGraph(new_data);
	});

	function type(d, _, columns) {
	  d.year = parseTime(d.year);
	  for (var i = 1, n = columns.length, c; i < n; ++i){
	  	d[c = columns[i]] = +d[c];
	  }
	  return d;
	}

	function updateGraph(data){
		var rateCol = d3.keys(data[0])
	  				.filter(function(key) {
	 					return key == "violentRate" || key == "murderRate" || key == "rapeRate" || key == "robberyRate" || key == "aggravatedAssaultRate" || key == "propertyRate" || key == "burglaryRate" || key == "larcenyTheftRate" || key == "motorVehicleTheftRate"; })
	  				.map(function(id){
	  					return {
	  						id: id,
	  						values: data.map(function(d){
	       						return {year: d.year, rate: d[id]};
	  						})
	  					}
	  				});

		xLine.domain(d3.extent(data, function(d) { return d.year; }));
		zLine.domain(rateCol.map(function(c) { return c.id; }));

		svgLine.select(".axis--x")
			.transition()
			.duration(1000)
			.call(d3.axisBottom(xLine).ticks(data.length));

		var crimeRate = multiLineChart.selectAll(".crimeRate")
			.data(rateCol);

		crimeRate.exit().remove();

		var crimeRateEnter = crimeRate.enter().append("g")
										.attr("class", "crimeRate");

		crimeRateEnter.append("path")
			.attr("class", "line")
			.attr("d", function(d) {return line(d.values); })
			.style("stroke", function(d) { return zLine(d.id); })
			.on("mouseover", eventMouseover)
			.on("mouseout", eventMouseout);

	    crimeRate.select("path")
			.transition()
			.duration(1000)
			.attr("d", function(d) {
	      		return line(d.values);
	        });

		crimeRate.select("path")
		.on("mouseover", eventMouseover)
		.on("mouseout", eventMouseout);

		var legend = multiLineChart.selectAll('.legend')
	        	.data(zLine.domain())
	        	.enter()
	        	.append('g')
	        	.attr('class', 'legend')
	        	.attr('transform', function(d, i) {
			            var height = legendRectSize + legendSpacing;
			            var offset =  height * zLine.domain().length / 2;
			            if(i < 5 ){
			            	var horz = 2 * legendRectSize;
			            	var vert = i * height - offset;
			            }
			            else{
			            	var horz = 2 * legendRectSize + 100;
			            	var vert = i * height - offset - 5*height;
			            }

                  var dynamicWidth;
			            if (svgLine.attr("width") > 1000){
			            	dynamicWidth = svgLine.attr("width")*0.8;
			            }
			            else{
			            	dynamicWidth = svgLine.attr("width")*0.6;
			            }

			            var dynamicHeight;
			            if (svgLine.attr("height") > 600){
			            	dynamicHeight = svgLine.attr("height")*0.13;
			            }
			            else{
			            	dynamicHeight = svgLine.attr("height")*0.20;
			            }

			            return 'translate(' + (horz+dynamicWidth) + ',' + (vert+dynamicHeight) + ')';
	          })

	        legend.append('rect')
				.attr('width', legendRectSize)
				.attr('height', legendRectSize)
				.data(rateCol)
				.style('fill', function(d) { return zLine(d.id); })
				.style('stroke-width',2)
				.style('stroke', function(d) { return zLine(d.id); });

	        legend.append('text')
				.data(rateCol)
				.attr('x', legendRectSize + legendSpacing)
				.attr('y', legendRectSize - legendSpacing)
				.text(function(d){return getFullName(d);});

		function getFullName(d) {
	        var id;

	        if(d.id == "violentRate"){id = "Violent";}
	        else if(d.id == "murderRate"){id = "Murder";}
	        else if(d.id == "rapeRate"){id = "Rape";}
	        else if(d.id == "robberyRate"){id = "Robbery";}
	        else if(d.id == "aggravatedAssaultRate"){id = "Assault";}
	        else if(d.id == "propertyRate"){id = "Property";}
	        else if(d.id == "burglaryRate"){id = "Burglary";}
	        else if(d.id == "larcenyTheftRate"){id = "Larceny";}
	        else if(d.id == "motorVehicleTheftRate"){id = "Vehicle";}

	        return id;
		}

		function getCrimeRateDiff(d, minYear, maxYear){
			for (var i = 0, n = rateCol.length; i < n; ++i){
				if (rateCol[i].id == d){
					colData = rateCol[i].values;
					for (var j = 0, k = colData.length; j < k; ++j){
						if (colData[j].year.getFullYear() == minYear ){
							var rateMin = colData[j].rate;
						}
						if (colData[j].year.getFullYear() == maxYear ){
							var rateMax = colData[j].rate;
						}
					}
					var percDiff = ((rateMin - rateMax)/(rateMin) * 100).toFixed(2);
				}
			}
			return [percDiff, rateMin,rateMax];
		}

		function getCrimeMinYear(d){
			for (var i = 0, n = rateCol.length; i < n; ++i){
				if (rateCol[i].id == d){
					colData = rateCol[i].values;
					var yearMin = d3.min(colData, function(d) { return d.year; } )
				}
			}
			return yearMin.getFullYear();
		}

		function getCrimeMaxYear(d){
			for (var i = 0, n = rateCol.length; i < n; ++i){
				if (rateCol[i].id == d){
					colData = rateCol[i].values;
					var yearMax = d3.max(colData, function(d) { return d.year; } )

				}
			}
			return yearMax.getFullYear();
		}
		function eventMouseover(d) {
			var xPosition = d3.mouse(this)[0];
			var yPosition = d3.mouse(this)[1] - 30;

			//Prevent tooltips from going out of screen
			if (d3.mouse(this)[0] > (0.85*svgLine.attr("width"))){
				xPosition = xPosition - 0.05 * svgLine.attr("width");
			}
			if (d3.mouse(this)[0] < (0.1*svgLine.attr("width"))){
				xPosition = xPosition + 0.05 * svgLine.attr("width");
			}

			if (d3.mouse(this)[1] < (0.1*svgLine.attr("height"))){
				yPosition = yPosition + (0.1*svgLine.attr("height")) + 50;
			}

			var currentCrimeType = d.id,
				currentMinYear = getCrimeMinYear(currentCrimeType),
				currentMaxYear = getCrimeMaxYear(currentCrimeType),
				diffMinMax = getCrimeRateDiff(currentCrimeType,currentMinYear,currentMaxYear),
				percDiff = diffMinMax[0],
				rateMin = diffMinMax[1],
				rateMax = diffMinMax[2];

			var boxXPos = xPosition - 80;
			var boxYPos = yPosition - 60;
			multiLineChart.append("rect")
					.attr("class", "tooltipBox")
				    .attr("rx", 10)
				    .attr("ry", 10)
					.attr("id","textBox")
					.attr("x", boxXPos)
					.attr("y", boxYPos)
					.attr("width", 180)
					.attr("height",75)
					.attr("stroke","black")
					.style("fill","white")
					.style("opacity", 0.7);

			multiLineChart.append("text")
					.attr("class", "tooltipText")
					.attr("id", "tooltip")
					.attr("x", boxXPos + 10)
					.attr("y", boxYPos + 10)
					.attr("text-anchor", "middle")
					.attr("font-family", "Open Sans")
					.attr("font-size", "16px")
					.attr("fill", "black")
					.attr("text-anchor","start")
				.append("tspan")
					.attr("font-weight", "bold")
					.attr("font-style", "italic")
					.attr("font-size", "18px")
					.attr("float","left")
					.attr("x", boxXPos + 10)
					.attr("y", boxYPos + 20)
					.text(getFullName(d))
				.append("tspan")
					.attr("float","left")
					.attr("font-weight", "normal")
					.attr("font-style", "normal")
					.attr("font-size", "16px")
					.attr("x", boxXPos + 10)
					.attr("y", boxYPos + 35)
					.text("Dropped by " + percDiff + "%")
				.append("tspan")
					.attr("x", boxXPos + 10)
					.attr("y", boxYPos + 50)
					.text("From " + rateMin + " to " + rateMax)
				.append("tspan")
					.attr("x", boxXPos + 10)
					.attr("y", boxYPos + 65)
					.text("In year " + currentMinYear + " to " + currentMaxYear);

				d3.select(this)
					.style("stroke", "#FFFF00")
					.style("stroke-width", "5px");
		}

		function eventMouseout(d) {
			d3.select("#tooltip").remove();
			d3.select("#textBox").remove();

			d3.select(this)
			.style("stroke", function(d) { return zLine(d.id); })
			.style("stroke-width", "2px")
		}
}
