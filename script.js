// Set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 30, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append the svg object to the div called 'bar-chart'
const svg = d3.select("#bar-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create a tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the CSV data
d3.csv('Argentina Shot Data - Saudi Arabia.csv').then(function(data) {
  
  // Convert string numbers to actual numbers and calculate cumulative xG
  let cumulativeXG = 0;
  data.forEach(d => {
    d.minute = +d.Minute;
    d.xG = +d.xG;
    cumulativeXG += d.xG;
    d.cumulativeXG = cumulativeXG;
  });

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, 90]) // Assuming 90 minutes in a game
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.cumulativeXG)])
    .range([height, 0]);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).ticks(6));

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Draw the cumulative xG step line
  const line = d3.line()
    .x(d => xScale(d.minute))
    .y(d => yScale(d.cumulativeXG))
    .curve(d3.curveStepAfter);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "purple") // Change the color to match your design
    .attr("stroke-width", 1.5)
    .attr("d", line);

  // Add points for each shot
  svg.selectAll(".shot-point")
    .data(data)
    .enter().append("circle")
      .attr("class", "shot-point")
      .attr("cx", d => xScale(d.minute))
      .attr("cy", d => yScale(d.cumulativeXG))
      .attr("r", 5) // Size of the circle
      .attr("fill", d => d.Outcome === "Goal" ? "green" : "red")
      .on("mouseover", function(event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", 1); // Make tooltip visible
        tooltip.html(`Player: ${d.Player}<br>xG: ${d.xG}<br>Outcome: ${d.Outcome}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0); // Hide tooltip
      });
});
