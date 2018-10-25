// var width = 0.5 * window.innerWidth;
	// var height = 0.7 * window.innerHeight;
	// d3.select("#svg").attr("align","center");
	var selectedData = [];
	var setValue = 1994;
	var dataset1;
	var dataset2;
	var onedecimal = d3.format(".1f");

	//----------- Stacked Bar Chart -----------//

	var marginSBC = {top: 40, right: 20, bottom: 30, left: 40};
	var SBCwidth = 690;
	var SBCheight = 500;

	var SBCcolors = ["#FF80AB", "#F50057", "#C51162"];

	var SBCx = d3.scaleBand()
	    .rangeRound([0, SBCwidth*0.90])
	    .padding(0.1);

	var SBCy = d3.scaleLinear()
    	.rangeRound([SBCheight - marginSBC.bottom, marginSBC.top]);

	var SBCz = d3.scaleOrdinal(d3.schemeCategory10);

	var SBCsvg = d3.select("#StackedBarChart")
		.append("svg")
		.attr("width", SBCwidth + marginSBC.left + marginSBC.right)
		.attr("height", SBCheight + marginSBC.top + marginSBC.bottom);

	var StackedBarChartSVG = SBCsvg.append("g")
	    .attr("transform", "translate(" + (marginSBC.left + 20) + "," + marginSBC.top + ")");





	//----------- Stacked Bar Chart -----------//

	//----------- Bar Chart -----------//

	var marginBC = {top: 40, right: 20, bottom: 30, left: 40};
	var BCwidth = 690;
	var BCheight = 500;

	var modifiedxScale = ["Violent Crime", "Murder and Nonnegligent Manslaughter", "Rape", "Robbery", "Aggravated Assault", "Property Crime", "Burglary", "Larceny Theft", "Motor Vehicle Theft"];

	var BCx = d3.scaleBand()
		.domain(["Violent Crime", "Murder and Nonnegligent Manslaughter", "Rape", "Robbery", "Aggravated Assault", "Property Crime", "Burglary", "Larceny Theft", "Motor Vehicle Theft"])
		.rangeRound([0, BCwidth*0.90])
		.padding(0.1);

	var BCy = d3.scaleLinear()
		.domain([0,5000])
		.range([BCheight-25, 0]);

	var tooltip = d3.select("body").append("div").attr("class", "toolTip");

	var BCsvg = d3.select("#BarChart")
		.append("svg")
		// .attr("style", "outline: thin solid black;")
		.attr("width", BCwidth + marginBC.left + marginBC.right)
		.attr("height", BCheight + marginBC.top + marginBC.bottom);

	var BarChartSVG = BCsvg.append("g")
	    .attr("transform", "translate(" + (marginBC.left + 16) + "," + marginBC.top + ")");

	//----------- Bar Chart -----------//

	//----------- Slider -----------//

	// var formatDateIntoYear = d3.timeFormat("%Y");
	// var formatDate = d3.timeFormat("%b %Y");
	// var parseDate = d3.timeParse("%m/%d/%y");

	var marginS = {top:50, right:50, bottom:0, left:50},
    Swidth = 500 - marginS.left - marginS.right,
    Sheight = 110 - marginS.top - marginS.bottom;

    var Ssvg = d3.select("#Slider")
		.append("svg")
		.attr("class", "slider")
	    .attr("width", Swidth + marginS.left + marginS.right)
	    .attr("height", Sheight + marginS.top + marginS.bottom);

	var moving = false;
	var currentValue = 20;
	var targetValue = Swidth;

	// var year = _.range(1994, 2014, 1);
	// var targetValue = year.length;
	// console.log(year)

	var Sx = d3.scaleLinear()
		.domain([1994,2013])
	    .range([0, targetValue])
	    .clamp(true);

	// console.log(Sx.domain()[0])

	//Plot Slider
	var SliderSVG = Ssvg.append("g")
	    .attr("transform", "translate(" + marginS.left + "," + Sheight + ")");

    SliderSVG.append("line")
		.attr("class", "track")
		.attr("x1", Sx.range()[0])
		.attr("x2", Sx.range()[1]) // adjust width of slider
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-inset")
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-overlay")
		.call(d3.drag()
			.on("start.interrupt", function() { SliderSVG.interrupt(); })
			.on("start drag", function() {
					// currentValue = d3.event.x;
					console.log("currentValue : " + d3.event.x);
					update(Sx.invert(d3.event.x));
			})
		);

	var handle = SliderSVG.insert("circle", ".track-overlay")
	    .attr("class", "handle")
	    .attr("r", 9);

	var label = SliderSVG.append("text")
	    .attr("class", "label")
	    .attr("text-anchor", "middle")
	    .text(Sx.domain()[0])
	    .attr("transform", "translate(0," + (-25) + ")");

	var playButton = d3.select("#Button")
		.append("button")
		.attr("id", "play_button")
		.html("Play");

	// SliderSVG.insert("g", ".track-overlay")
	// 	.attr("class", "ticks")
	// 	.attr("transform", "translate(0," + 18 + ")")
	// 	.selectAll("text")
	// 	.data(Sx.ticks(10))
	// 	.enter()
	// 	.append("text")
	// 	.attr("x", Sx)
	// 	.attr("y", 10)
	// 	.attr("text-anchor", "middle")
	// 	.text(function(d) { return formatDateIntoYear(d); });

	//----------- Slider -----------//

	d3.csv("dataset1.csv", function(error, data) {

		if (error) throw error;

		data.forEach(function(d) {
			d.Year = +d.Year;
			d.Aggravated_Assault = +d.Aggravated_Assault;
			d.Burglary = +d.Burglary;
			d.LarcenyTheft = +d.LarcenyTheft;
			d.Motor_Vehicle_Theft = +d.Motor_Vehicle_Theft;
			d.Murder_and_Nonnegligent_Manslaughter = +d.Murder_and_Nonnegligent_Manslaughter;
			d.Property_Crime = +d.Property_Crime;
			d.Rape = +d.Rape;
			d.Robbery = +d.Robbery;
			d.Violent_Crime = +d.Violent_Crime;

			d.Aggravated_Assault_Rate = +d.Aggravated_Assault_Rate;
			d.Burglary_Rate = +d.Burglary_Rate;
			d.LarcenyTheft_Rate = +d.LarcenyTheft_Rate;
			d.Motor_Vehicle_Theft_Rate = +d.Motor_Vehicle_Theft_Rate;
			d.Murder_and_Nonnegligent_Manslaughter_Rate = +d.Murder_and_Nonnegligent_Manslaughter_Rate;
			d.Property_Crime_Rate = +d.Property_Crime_Rate;
			d.Rape_Rate = +d.Rape_Rate;
			d.Robbery_Rate = +d.Robbery_Rate;
			d.Violent_Crime_Rate = +d.Violent_Crime_Rate;
		});

		dataset1 = data;

		//Set y
	 	var selectedData = data.filter(function(d){
			return d.Year == setValue;
		})

		// console.log("Before transformed");
		// console.log(selectedData);

		// console.log(transformedData);

		drawPlot1(selectedData);

		playButton
			.on("click", function() {
				var button = d3.select(this);
				if (button.text() == "Pause") {
			  		moving = false;
			  		clearInterval(timer);
			  		button.text("Play");
				}
				else {
					moving = true;
					timer = setInterval(step, 1000);
					button.text("Pause");
				}
			console.log("Slider moving: " + moving);
			})


		function step() {
			currentValue = currentValue + 20;
			update(Sx.invert(currentValue));
			// console.log("Current : " + currentValue)
			// console.log("Target : " + targetValue)
			if (currentValue >= targetValue) {
				moving = false;
				currentValue = 0;
				clearInterval(timer);
				playButton.text("Play");
				console.log("Slider moving: " + moving);
			}
		}

		//Play button
		// d3.select("#play_button").html("Play");
		// d3.select("#play_button").on("click",function(){
		// 	if(d3.select("#play_button").classed("playing")){
		// 		d3.select("#play_button").html("Play");
		// 		d3.select("#play_button").classed("playing", false);
		// 		updateMap();
		// 	}
		// 	else{
		// 		d3.select("#play_button").html("Stop");
		// 		d3.select("#play_button").classed("playing", true);
		// 	}

		// })
	});

	d3.csv("dataset2.csv", function(error, data) {
		if (error) throw error;

		data.forEach(function(d) {
			d.To_Year = +d.To_Year;
			d.From_Year = +d.From_Year;
			d.Aggravated_Assault = +d.Aggravated_Assault;
			d.Burglary = +d.Burglary;
			d.LarcenyTheft = +d.LarcenyTheft;
			d.Motor_Vehicle_Theft = +d.Motor_Vehicle_Theft;
			d.Murder_and_Nonnegligent_Manslaughter = +d.Murder_and_Nonnegligent_Manslaughter;
			d.Property_Crime = +d.Property_Crime;
			d.Rape = +d.Rape;
			d.Robbery = +d.Robbery;
			d.Violent_Crime = +d.Violent_Crime;

			d.Aggravated_Assault_Rate = +d.Aggravated_Assault_Rate;
			d.Burglary_Rate = +d.Burglary_Rate;
			d.LarcenyTheft_Rate = +d.LarcenyTheft_Rate;
			d.Motor_Vehicle_Theft_Rate = +d.Motor_Vehicle_Theft_Rate;
			d.Murder_and_Nonnegligent_Manslaughter_Rate = +d.Murder_and_Nonnegligent_Manslaughter_Rate;
			d.Property_Crime_Rate = +d.Property_Crime_Rate;
			d.Rape_Rate = +d.Rape_Rate;
			d.Robbery_Rate = +d.Robbery_Rate;
			d.Violent_Crime_Rate = +d.Violent_Crime_Rate;
		});

		var RawData = [
			{Type_Of_Crime: "Violent Crime Rate", 2004: data[2].Violent_Crime_Rate, 2009: data[1].Violent_Crime_Rate, 2012: data[0].Violent_Crime_Rate},
			{Type_Of_Crime: "Murder and Nonnegligent Manslaughter Rate", 2004: data[2].Murder_and_Nonnegligent_Manslaughter_Rate, 2009: data[1].Murder_and_Nonnegligent_Manslaughter_Rate, 2012: data[0].Murder_and_Nonnegligent_Manslaughter_Rate},
			{Type_Of_Crime: "Rape Rate", 2004: data[2].Rape_Rate, 2009: data[1].Rape_Rate, 2012: data[0].Rape_Rate},
			{Type_Of_Crime: "Robbery Rate", 2004: data[2].Robbery_Rate, 2009: data[1].Robbery_Rate, 2012: data[0].Robbery_Rate},
			{Type_Of_Crime: "Aggravated Assault Rate", 2004: data[2].Aggravated_Assault_Rate, 2009: data[1].Aggravated_Assault_Rate, 2012: data[0].Aggravated_Assault_Rate},
			{Type_Of_Crime: "Property Crime Rate", 2004: data[2].Property_Crime_Rate, 2009: data[1].Property_Crime_Rate, 2012: data[0].Property_Crime_Rate},
			{Type_Of_Crime: "Burglary Rate", 2004: data[2].Burglary_Rate, 2009: data[1].Burglary_Rate, 2012: data[0].Burglary_Rate},
			{Type_Of_Crime: "Larceny Theft Rate", 2004: data[2].LarcenyTheft_Rate, 2009: data[1].LarcenyTheft_Rate, 2012: data[0].LarcenyTheft_Rate},
			{Type_Of_Crime: "Motor Vehicle Theft Rate", 2004: data[2].Motor_Vehicle_Theft_Rate, 2009: data[1].Motor_Vehicle_Theft_Rate, 2012: data[0].Motor_Vehicle_Theft_Rate}
		];

		// console.log(RawData);

		var transformedData = [
			{Type_Of_Crime: "Violent Crime Rate", 2004: minus(data[2].Violent_Crime_Rate,data[1].Violent_Crime_Rate), 2009: minus(data[1].Violent_Crime_Rate,data[0].Violent_Crime_Rate), 2012: data[0].Violent_Crime_Rate},

			{Type_Of_Crime: "Murder and Nonnegligent Manslaughter Rate", 2004: minus(data[2].Murder_and_Nonnegligent_Manslaughter_Rate,data[1].Murder_and_Nonnegligent_Manslaughter_Rate), 2009: minus(data[1].Murder_and_Nonnegligent_Manslaughter_Rate,data[0].Murder_and_Nonnegligent_Manslaughter_Rate), 2012: data[0].Murder_and_Nonnegligent_Manslaughter_Rate},
			{Type_Of_Crime: "Rape Rate", 2004: minus(data[2].Rape_Rate,data[1].Rape_Rate), 2009: minus(data[1].Rape_Rate,data[0].Rape_Rate), 2012: data[0].Rape_Rate},
			{Type_Of_Crime: "Robbery Rate", 2004: minus(data[2].Robbery_Rate,data[1].Robbery_Rate), 2009: minus(data[1].Robbery_Rate,data[0].Robbery_Rate), 2012: data[0].Robbery_Rate},
			{Type_Of_Crime: "Aggravated Assault Rate", 2004: minus(data[2].Aggravated_Assault_Rate,data[1].Aggravated_Assault_Rate), 2009: minus(data[1].Aggravated_Assault_Rate,data[0].Aggravated_Assault_Rate), 2012: data[0].Aggravated_Assault_Rate},
			{Type_Of_Crime: "Property Crime Rate", 2004: minus(data[2].Property_Crime_Rate,data[1].Property_Crime_Rate), 2009: minus(data[1].Property_Crime_Rate,data[0].Property_Crime_Rate), 2012: data[0].Property_Crime_Rate},
			{Type_Of_Crime: "Burglary Rate", 2004: minus(data[2].Burglary_Rate,data[1].Burglary_Rate), 2009: minus(data[1].Burglary_Rate,data[0].Burglary_Rate), 2012: data[0].Burglary_Rate},
			{Type_Of_Crime: "Larceny Theft Rate", 2004: minus(data[2].LarcenyTheft_Rate,data[1].LarcenyTheft_Rate), 2009: minus(data[1].LarcenyTheft_Rate,data[0].LarcenyTheft_Rate), 2012: data[0].LarcenyTheft_Rate},
			{Type_Of_Crime: "Motor Vehicle Theft Rate", 2004: minus(data[2].Motor_Vehicle_Theft_Rate,data[1].Motor_Vehicle_Theft_Rate), 2009: minus(data[1].Motor_Vehicle_Theft_Rate,data[0].Motor_Vehicle_Theft_Rate), 2012: data[0].Motor_Vehicle_Theft_Rate}
		];


		// console.log(transformedData);

    var TypeOfCrimeText = d3.nest()
			.key(function(d){return (d.Type_Of_Crime)})
			.rollup(function(leaves){
				return d3.sum(leaves, function(d) {return onedecimal(d3.sum(d3.values(d)))});
			})
			.entries(transformedData);

		console.log(TypeOfCrimeText);


		// console.log(transformedData);

		var series = d3.stack()
			.keys([2004, 2009, 2012])
			.offset(d3.stackOffsetDiverging)
			(transformedData);

		dataset2 = TypeOfCrimeText;


		// console.log(series);
		SBCx.domain(transformedData.map(function(d) { return d.Type_Of_Crime; }));
		SBCy.domain([d3.min(series, stackMin)-2.5, 50]);
		// console.log("Here" + d3.min(series, stackMin));

		drawPlot2(series);
	});

	function drawPlot1(selectedData){

		var transformedData = d3.keys(selectedData[0]).filter(function(key) {
			return key == "Violent_Crime_Rate" || key == "Murder_and_Nonnegligent_Manslaughter_Rate" || key == "Rape_Rate" || key == "Robbery_Rate" || key == "Aggravated_Assault_Rate" || key == "Property_Crime_Rate" || key == "Burglary_Rate" || key == "LarcenyTheft_Rate" || key == "Motor_Vehicle_Theft_Rate";

		})
		.map(function(name) {
			return {
				name:name,
				values: selectedData.map(function(d) {
					return {value: d[name]};
				})
			};
		});

		// console.log("Transformed Dataset 1");
		// console.log(transformedData);

		BarChartSVG.selectAll(".xLabel").remove();

		BarChartSVG.append("g")
			// .attr("class", "axis axis--x")	//Bottom Line
			// .attr("transform", "translate(15,525)")
			.attr("class", "xLabel")
			.attr("transform", "translate(50," + (BCheight - 25) + ")")
			.call(d3.axisBottom(BCx))
			.selectAll("text")
				.call(wrap, BCx.bandwidth());

		BarChartSVG.selectAll(".xAxis").remove();

		BarChartSVG.append("text")
			.attr("class", "xAxis")
			.attr("transform", "translate("+ (BCwidth/2 - 20) + "," + (BCheight+20) + ")")
			.attr("font-weight", "bold")
			.text("Type Of Crime");

		BarChartSVG.selectAll(".yLabel").remove();

		BarChartSVG.append("g")
			.attr("class", "yLabel")
			.call(d3.axisLeft(BCy).ticks(10))
			.attr("transform", "translate(50, 0)");

		BarChartSVG.selectAll(".yAxis").remove();

		BarChartSVG.append("text")
			.attr("class", "yAxis")
			.attr("transform", "translate(-20," + (BCheight/2 + 25) + ") rotate(-90)")
			.attr("font-weight", "bold")
			.text("Crime Rate");


		// BarChartSVG.selectAll(".bar").remove();

		var BarChart = BarChartSVG.selectAll(".bar")
			.data(transformedData);

		BarChart.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", function(d, i) { return BCx(modifiedxScale[i]); })
			.attr("y", BCheight)
			.attr("transform", "translate(50,-25)")
			.on("mousemove", function(d, i){
				tooltip
					.style("left", d3.event.pageX - 70 + "px")
					.style("top", d3.event.pageY - 70 + "px")
					.style("display", "inline-block")
					.html(modifiedxScale[i] + " :" + (d.values[0].value));
			})
			.on("mouseout", function(d){ tooltip.style("display", "none"); })
			.transition()
				.duration(1000)
				.attr("y", function(d) { return BCy(d.values[0].value); })
				.attr("width", BCx.bandwidth())
				.attr("height", function(d) { return BCheight - BCy(d.values[0].value); })

		BarChart.transition()
			.duration(400)
			.attr("y", function(d) { return BCy(d.values[0].value); })
			.attr("width", BCx.bandwidth())
			.attr("height", function(d) { return BCheight - BCy(d.values[0].value); });


		BarChartSVG.selectAll(".label")
		.attr("opacity", 0)
		.remove();

		BarChartText = BarChartSVG.selectAll(".text")
			.data(transformedData);

		BarChartText.enter()
			.append("text")
			.attr("class","label")
			.attr("x", (function(d, i) { return (BCx(modifiedxScale[i]) + BCx.bandwidth()/2 + 45); }))
			.attr("y", BCheight-25)
			.attr("opacity", 0)
			.transition()
				.duration(400)
			.attr("y", function(d) { return BCy(d.values[0].value) - 37; })
			.attr("dx", "-0.5em")
			.text(function(d) { return d.values[0].value; })
			.attr("opacity", 1);

	}

	function drawPlot2(series){

		console.log(series);

		StackedBarChartSVG.append("g")
			.selectAll("g")
			.data(series)
			.enter()
			.append("g")
			.attr("fill", function(d,i) { return SBCcolors[i]; })
			.selectAll("rect")
			.data(function(d) { return d; })
			.enter()
			.append("rect")
			.attr("transform", "translate(" + marginSBC.left + ",0)")
			.attr("x", function(d) {  return SBCx(d.data.Type_Of_Crime); })
			.attr("y", function(d) {  return SBCy(d[1]); })
			// .attr("width", SBCx.bandwidth())
			// .attr("x", function(d) { return SBCx(d.data.Type_Of_Crime); })
			//console.log((d.key == 'y2012'));
			// .attr("y", 0)
			// .attr("height", function(d) { return SBCy(d[0]); })
			.on("mousemove", function(d, i){
				// console.log("Mouse");
				tooltip
					.style("left", d3.event.pageX - 70 + "px")
					.style("top", d3.event.pageY - 70 + "px")
					.style("display", "inline-block")
					.html(d.data.Type_Of_Crime + " ( " + yearFrom(d[1], d.data) + " - " +  yearTo(d[1], d.data) + " ) " + " : " + valueOutput(d[1], d.data));
			})
			.on("mouseout", function(d){ tooltip.style("display", "none"); })
			.transition()
				.duration(1000)
				.attr("x", function(d) { return SBCx(d.data.Type_Of_Crime); })
				.attr("y", function(d) { return SBCy(d[1]); })
				.attr("width", SBCx.bandwidth())
				.attr("height", function(d) { return SBCy(d[0]) - SBCy(d[1]); });
		console.log(StackedBarChartSVG.data);
		//x axis
		StackedBarChartSVG.append("g")
			.attr("transform", "translate("+ marginSBC.left + "," + SBCy(0) + ")")
			.call(d3.axisBottom(SBCx))
			.selectAll("text")
				.call(wrap, SBCx.bandwidth());

		//y axis
		StackedBarChartSVG.append("g")
		    .attr("transform", "translate(" + marginSBC.left + ",0)")
		    .call(d3.axisLeft(SBCy));

		StackedBarChartSVG.append("text")
			.attr("transform", "translate("+ (SBCwidth/2 - 20) + "," + (SBCheight + 20) + ")")
			.attr("font-weight", "bold")
			.text("Type Of Crime");

		StackedBarChartSVG.append("text")
			.attr("transform", "translate(-20," + (BCheight/2 + 25) + ") rotate(-90)")
			.attr("font-weight", "bold")
			.text("Percentage Change");

		var StackedBarChartSVGLegend = StackedBarChartSVG.selectAll(".legend")
			.data(series)
			.enter()
			.append("g")
			.attr("class", "legend")
			.attr("transform", function(d, m) { return "translate(-150," + (m+5) * 20 + ")"; });

		StackedBarChartSVGLegend.append("rect")
		    .attr("x", SBCwidth - 18)
		    .attr("width", 18)
		    .attr("height", 18)
		    .style("fill", function(d, i) { return SBCcolors.slice().reverse()[i]; });

		StackedBarChartSVGLegend.append("text")
			.attr("x", SBCwidth + 5)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "start")
			.text(function(d, i) {
				switch (i) {
				case 0: return "2004 - 2009";
				case 1: return "2009 - 2012";
				case 2: return "2012 - 2013";
				}
			});

      StackedBarChartSVGText = SBCsvg.append("g")
			.selectAll(".text")
			.data(dataset2)
			.enter()
			.append("text")
			.attr("x", function(d){ return SBCx(d.key) + SBCx.bandwidth() + 50; })
			.attr("y", function (d, i) { console.log(dataset2[i].value); return SBCy(dataset2[i].value) + 60; })
			.text( function (d, i){ return (dataset2[i].value)})
			.style({fill: 'black', "text-anchor": "middle"});
    }

	// function drawPlot2(data){

	// 	console.log("Transformed Dataset 2");
	// 	console.log(transformedData	);
	// }

	function stackMin(series) {
		return d3.min(series, function(d) { return d[0]; });
	}

	function stackMax(series) {
		console.log(series);
		return d3.max(series, function(d) { return d[1]; });
	}

	function minus(a, b)
	{
		// console.log( a + " minus by " + b + " equal " + (onedecimal(a-b)) + " || " + (a-b));
		return parseFloat(onedecimal(a-b));
	}

	function update(h) {
	  	handle.attr("cx", Sx(h));
	  	label
	    .attr("x", Sx(h))
	    .text(parseInt(h));
	    setValue = parseInt(h);
	    console.log(setValue);

	    var newData = dataset1.filter(function(d){
	    	return d.Year == setValue;
	    })

	    drawPlot1(newData);
	}

	function yearFrom(value, data){
		// console.log(value);
		// console.log(data);
		// console.log("+ 2004")
		// console.log("Data 2004 : " + data['2004'])
		// console.log("Data 2009 : " + data['2009'])
		// console.log("Data 2012 : " + data['2012'])
		// console.log("Value : " + value);
		// Because it start from 0 - data['2004'] - data['2009'] - data['2012']
		if(value == 0) {
			return 2012;
		}
		else if (value == data['2004']) {
			return 2009;
		}
		else if (value < data['2009']){
			return 2004;
		}
		else {
			return "Error";
		}
	}

	function yearTo(value, data){
		// console.log(value);
		// console.log(data);
		// console.log("+ 2004")
		// console.log("Data 2004 : " + data['2004'])
		// console.log("Data 2009 : " + data['2009'])
		// console.log("Data 2012 : " + data['2012'])
		// console.log("Value : " + value);
		if(value == 0) {
			return 2013;
		}
		else if (value == data['2004']) {
			return 2012;
		}
		else if (value < data['2009']){
			return 2009;
		}
		else {
			return "Error";
		}
	}

	function valueOutput(value, data){
		if(value == 0) {
			return data['2012'];
		}
		else if (value == data['2004']) {
			return data['2009'];
		}
		else if (value < data['2009']){
			return data['2004'];
		}
		else {
			return "Error";
		}
	}

	function wrap(text, width) {
		text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
				}
			}
		});
	}
