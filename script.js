// Set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 40, left: 150 },
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
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  const y = d3.scaleBand()
    .range([0, height])
    .domain(data.map(function(d) { return d.country; }))
    .padding(0.2); // Increase padding for thicker bars
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
    .attr("height", y.bandwidth()) // This determines the bar thickness
    .attr("fill", "#69b3a2");

});
