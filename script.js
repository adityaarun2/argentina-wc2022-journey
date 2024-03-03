// This JavaScript code assumes you have a JSON file "total_world_cup_goals_by_country.json"
// that contains an array of objects with "country" and "total_goals" properties.

// Set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 40, left: 90 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Append the svg object to the div called 'bar-chart'
const svg = d3.select("#bar-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the Data
d3.json("total_world_cup_goals_by_country.json").then( data => {
  // Sort data
  data.sort((a, b) => d3.descending(a.total_goals, b.total_goals));

  // X axis
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.total_goals)])
    .range([0, width]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  const y = d3.scaleBand()
    .range([0, height])
    .domain(data.map(d => d.country))
    .padding(.1);
  svg.append("g")
    .call(d3.axisLeft(y))

  // Bars
  svg.selectAll("myRect")
    .data(data)
    .join("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.country))
    .attr("width", d => x(d.total_goals))
    .attr("height", y.bandwidth())
    .attr("fill", "#69b3a2")
    .on("mouseover", function() { d3.select(this).attr("fill", "#6b486b"); })
    .on("mouseout", function() { d3.select(this).attr("fill", "#69b3a2"); });
});
