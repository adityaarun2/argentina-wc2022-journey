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

    // Set the dimensions and margins for the xG graph
const xgMargin = { top: 20, right: 20, bottom: 70, left: 100 },
xgWidth = 960 - xgMargin.left - xgMargin.right,
xgHeight = 500 - xgMargin.top - xgMargin.bottom;

// Append the svg object for the xG graph below the bar chart
const xgSvg = d3.select("#content") // Select the content div or choose another div as per your HTML structure
.append("svg")
.attr("width", xgWidth + xgMargin.left + xgMargin.right)
.attr("height", xgHeight + xgMargin.top + xgMargin.bottom)
.append("g")
.attr("transform", `translate(${xgMargin.left},${xgMargin.top})`);

// Define the scales for the xG graph
const xScale = d3.scaleLinear()
.domain([0, 90]) // duration of the match
.range([ 0, xgWidth ]);

const yScale = d3.scaleLinear()
.domain([0, 3]) // assuming maximum cumulative xG to be 3
.range([ xgHeight, 0 ]);

// Add X axis for the xG chart
xgSvg.append("g")
.attr("transform", `translate(0, ${xgHeight})`)
.call(d3.axisBottom(xScale));

// Add Y axis for the xG chart
xgSvg.append("g")
.call(d3.axisLeft(yScale));

// Read the CSV file and process the data for cumulative xG
d3.csv('Argentina Shot Data - Saudi Arabia.csv', function(d) {
return { minute: +d.Minute, xG: +d.xG, team: d.Squad };
}).then(function(data) {

// Calculate the cumulative xG for each team
let cumulativeXG = { 'Argentina': 0, 'Saudi Arabia': 0 };
let processedData = data.map(d => {
cumulativeXG[d.team] += d.xG;
return { minute: d.minute, cumulativeXG: cumulativeXG[d.team], team: d.team };
});

// Filter the data by team
let argentinaData = processedData.filter(d => d.team === 'Argentina');
let saudiData = processedData.filter(d => d.team === 'Saudi Arabia');

// Create the line generator function
const lineGenerator = d3.line()
.x(d => xScale(d.minute))
.y(d => yScale(d.cumulativeXG))
.curve(d3.curveStepAfter); // to create a step-like line

// Draw the line for Argentina
xgSvg.append("path")
.datum(argentinaData)
.attr("fill", "none")
.attr("stroke", "blue")
.attr("stroke-width", 1.5)
.attr("d", lineGenerator);

// Draw the line for Saudi Arabia
xgSvg.append("path")
.datum(saudiData)
.attr("fill", "none")
.attr("stroke", "green")
.attr("stroke-width", 1.5)
.attr("d", lineGenerator);

// Add dots for goals
xgSvg.selectAll(".dot")
.data(data)
.enter()
.append("circle")
.attr("cx", d => xScale(d.minute))
.attr("cy", d => yScale(cumulativeXG[d.team]))
.attr("r", 5)
.attr("fill", d => d.Outcome === 'Goal' ? "red" : "grey")
.on("mouseover", function(event, d) {
tooltip.html(`Minute: ${d.minute}<br>xG: ${d.xG}<br>Team: ${d.team}`)
  .style("opacity", 1)
  .style("left", (event.pageX + 10) + "px")
  .style("top", (event.pageY - 15) + "px");
})
.on("mouseout", function(d) {
tooltip.style("opacity", 0);
});
});
});