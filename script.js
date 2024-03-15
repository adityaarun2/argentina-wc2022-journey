// Set the dimensions and margins of the graph
const margin = { top: 20, right: 20, bottom: 70, left: 100 },
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
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    

// Parse the Data
d3.json('total_world_cup_goals_by_country.json').then(function(data) {

  // Sort the data by total goals and take the top 10
  const top10Data = data.sort((a, b) => d3.descending(a.total_goals, b.total_goals)).slice(0, 10);

  // X axis
  const x = d3.scaleLinear()
    .domain([0, d3.max(top10Data, d => d.total_goals)])
    .range([0, width]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .style("text-anchor", "middle") // Change text-anchor to middle
      .attr("dx", "0em") // Remove the dx shift
      .attr("dy", "1em") // Adjust vertical spacing to move text below ticks
      .attr("transform", ""); // Remove the rotate transformation

  // Y axis
  const y = d3.scaleBand()
    .range([0, height])
    .domain(top10Data.map(d => d.country))
    .padding(0.1);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll(".bar")
    .data(top10Data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", x(0))
    .attr("y", d => y(d.country))
    .attr("width", d => x(d.total_goals))
    .attr("height", y.bandwidth())
    .attr("fill", "#69b3a2")
    .on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(d.country + "<br/>" + "Goals: " + d.total_goals)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });


    svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", height + margin.bottom/ 1.3)  // Adjust this to position the text below the chart
    .attr("text-anchor", "middle")  
    .style("font-size", "15px") 
    .style("font-weight", "bold")
    .text("Top 10 countries based on their total goals in the World Cup.");

    // Set the dimensions and margins of the graph
const xgMargin = { top: 20, right: 30, bottom: 30, left: 40 },
xgWidth = 960 - xgMargin.left - xgMargin.right,
xgHeight = 500 - xgMargin.top - xgMargin.bottom;

// Append the svg object to the body of the page
const xgSvg = d3.select("#content")
.append("svg")
.attr("width", xgWidth + xgMargin.left + xgMargin.right)
.attr("height", xgHeight + xgMargin.top + xgMargin.bottom)
.append("g")
.attr("transform", `translate(${xgMargin.left},${xgMargin.top})`);

// Initialize a tooltip
const xgTooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

// Read the data from a CSV file
d3.csv("Argentina Shot Data - Saudi Arabia.csv").then(function(data) {
// Process the data
data.forEach(function(d) {
d.xG = +d.xG;
d.Minute = +d.Minute;
});

// Group data by Squad
let groupedData = d3.group(data, d => d.Squad);

// Calculate cumulative xG for each Squad
let cumulativeXGData = [];
groupedData.forEach((d, key) => {
let cumulativeXG = 0;
d.forEach(item => {
cumulativeXG += item.xG;
cumulativeXGData.push({
  Minute: item.Minute,
  cumulativeXG: cumulativeXG,
  Squad: key,
  Player: item.Player,
  Goal: item.Outcome === 'Goal'
});
});
});

// Split the cumulative data by Squad
let argentinaData = cumulativeXGData.filter(d => d.Squad === 'Argentina');
let saudiData = cumulativeXGData.filter(d => d.Squad === 'Saudi Arabia');

// Create the scales
const xScale = d3.scaleLinear()
.domain([0, d3.max(data, d => d.Minute)])
.range([0, xgWidth]);

const yScale = d3.scaleLinear()
.domain([0, d3.max(cumulativeXGData, d => d.cumulativeXG)])
.range([xgHeight, 0]);

// Create the line generators
const line = d3.line()
.x(d => xScale(d.Minute))
.y(d => yScale(d.cumulativeXG))
.curve(d3.curveStepAfter);

// Draw the lines for each team
xgSvg.append("path")
.datum(argentinaData)
.attr("fill", "none")
.attr("stroke", "blue")
.attr("stroke-width", 2)
.attr("d", line);

xgSvg.append("path")
.datum(saudiData)
.attr("fill", "none")
.attr("stroke", "green")
.attr("stroke-width", 2)
.attr("d", line);

// Add circles for goals
xgSvg.selectAll(".dot")
.data(cumulativeXGData.filter(d => d.Goal))
.enter().append("circle")
.attr("class", "dot")
.attr("cx", d => xScale(d.Minute))
.attr("cy", d => yScale(d.cumulativeXG))
.attr("r", 5)
.attr("fill", d => d.Squad === 'Argentina' ? "blue" : "green")
.on("mouseover", (event, d) => {
  xgTooltip.transition()
    .duration(200)
    .style("opacity", .9);
  xgTooltip.html("Player: " + d.Player + "<br/>Minute: " + d.Minute + "<br/>xG: " + d.xG)
    .style("left", (event.pageX) + "px")
    .style("top", (event.pageY - 28) + "px");
})
.on("mouseout", (d) => {
  xgTooltip.transition()
    .duration(500)
    .style("opacity", 0);
});

// Add the X Axis
xgSvg.append("g")
.attr("transform", `translate(0,${xgHeight})`)
.call(d3.axisBottom(xScale));

// Add the Y Axis
xgSvg.append("g")
.call(d3.axisLeft(yScale));
});

});