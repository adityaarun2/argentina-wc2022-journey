// Set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 70, left: 150 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append the svg object to the div called 'bar-chart'
const svg = d3.select("#bar-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Create a tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("text-align", "center")
    .style("padding", "8px")
    .style("font", "12px sans-serif")
    .style("background", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("pointer-events", "none");

// Parse the Data
d3.json('total_world_cup_goals_by_country.json').then(function(data) {

  // Sort the data by total goals
  data.sort(function(a, b) { return d3.descending(a.total_goals, b.total_goals); });

  // X axis
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.total_goals; })])
    .range([0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Y axis
  const y = d3.scaleBand()
    .range([0, height])
    .domain(data.map(function(d) { return d.country; }))
    .padding(0.1);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", function(d) { return y(d.country); })
    .attr("width", function(d) { return x(d.total_goals); })
    .attr("height", y.bandwidth())
    .attr("fill", "#69b3a2")
    .on("mouseover", function(event, d) {
      tooltip.style("opacity", 1);
      tooltip.html("Country: " + d.country + "<br>Total Goals: " + d.total_goals)
             .style("left", (event.pageX) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event, d) {
      tooltip.style("left", (event.pageX) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.style("opacity", 0);
    });
});
