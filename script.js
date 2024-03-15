// Set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 50, left: 50 },
      width = 900 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#content")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data from a CSV file
d3.csv("Argentina Shot Data - Saudi Arabia.csv").then(function(data) {

  // Filter data to separate Argentina and Saudi Arabia shots
  const argentinaData = data.filter(d => d.Squad === "Argentina").map(d => ({ ...d, xG: +d.xG, Minute: +d.Minute }));
  const saudiData = data.filter(d => d.Squad === "Saudi Arabia").map(d => ({ ...d, xG: +d.xG, Minute: +d.Minute }));

  // Sort data by minute
  argentinaData.sort((a, b) => a.Minute - b.Minute);
  saudiData.sort((a, b) => a.Minute - b.Minute);

  // Calculate cumulative xG
  let argentinaCumulativeXG = 0, saudiCumulativeXG = 0;
  argentinaData.forEach(d => { argentinaCumulativeXG += d.xG; d.cumulativeXG = argentinaCumulativeXG; });
  saudiData.forEach(d => { saudiCumulativeXG += d.xG; d.cumulativeXG = saudiCumulativeXG; });

  // Merge the two arrays and sort by minute
  const combinedData = [...argentinaData, ...saudiData].sort((a, b) => a.Minute - b.Minute);

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(combinedData, d => d.Minute)])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(combinedData, d => d.cumulativeXG)])
    .range([height, 0]);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).ticks(5));

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(yScale).ticks(5));

  // Create line generators
  const argentinaLine = d3.line()
    .x(d => xScale(d.Minute))
    .y(d => yScale(d.cumulativeXG))
    .curve(d3.curveStepAfter); // Use step after curve for the step effect

  const saudiLine = d3.line()
    .x(d => xScale(d.Minute))
    .y(d => yScale(d.cumulativeXG))
    .curve(d3.curveStepAfter); // Use step after curve for the step effect

  // Add Argentina's line path
  svg.append("path")
    .data([argentinaData])
    .attr("fill", "none")
    .attr("stroke", "blue") // Replace with Argentina's color
    .attr("stroke-width", 1.5)
    .attr("d", argentinaLine);

  // Add Saudi Arabia's line path
  svg.append("path")
    .data([saudiData])
    .attr("fill", "none")
    .attr("stroke", "green") // Replace with Saudi Arabia's color
    .attr("stroke-width", 1.5)
    .attr("d", saudiLine);

  // Add points for Argentina's shots
  svg.selectAll(".dot-argentina")
    .data(argentinaData)
    .enter()
    .append("circle")
      .attr("cx", d => xScale(d.Minute))
      .attr("cy", d => yScale(d.cumulativeXG))
      .attr("r", 4)
      .attr("fill", "yellow"); // Use different color for goals if needed

  // Define the div for the tooltip
  const div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

  // Add the points with tooltips for Argentina's shots
  svg.selectAll(".dot-argentina")
    .data(argentinaData)
    .enter()
    .append("circle")
      .attr("cx", d => xScale(d.Minute))
      .attr("cy", d => yScale(d.cumulativeXG))
      .attr("r", 5)
      .attr("fill", "#377eb8")
      .on("mouseover", function(event, d) {
          div.transition()		
              .duration(200)		
              .style("opacity", .9);		
          div.html("Minute: " + d.Minute + "<br/>"  + "xG: " + d.xG)
              .style("left", (event.pageX) + "px")		
              .style("top", (event.pageY - 28) + "px");
          })					
      .on("mouseout", function(d) {		
          div.transition()		
              .duration(500)		
              .style("opacity", 0);	
      });

  // Add the points with tooltips for Saudi Arabia's shots
  svg.selectAll(".dot-saudi")
    .data(saudiData)
    .enter()
    .append("circle")
      .attr("cx", d => xScale(d.Minute))
      .attr("cy", d => yScale(d.cumulativeXG))
      .attr("r", 5)
      .attr("fill", "#4daf4a")
      .on("mouseover", function(event, d) {
          div.transition()		
              .duration(200)		
              .style("opacity", .9);		
          div.html("Minute: " + d.Minute + "<br/>"  + "xG: " + d.xG)
              .style("left", (event.pageX) + "px")		
              .style("top", (event.pageY - 28) + "px");
          })					
      .on("mouseout", function(d) {		
          div.transition()		
              .duration(500)		
              .style("opacity", 0);	
      });

  // Add a legend (optional)
  // Add one dot in the legend for each name.
  const size = 20
  const allGroups = ["Argentina", "Saudi Arabia"]
  svg.selectAll("myrect")
    .data(allGroups)
    .enter()
    .append("circle")
      .attr("cx", 100)
      .attr("cy", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("r", 7)
      .style("fill", function(d){ return color(d)})

  // Add one dot in the legend for each name.
  svg.selectAll("mylabels")
    .data(allGroups)
    .enter()
    .append("text")
      .attr("x", 100 + size*.8)
      .attr("y", function(d,i){ return 10 + i * (size + 5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return color(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
});