// Set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 40, left: 50 },
      width = 1170 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#xg-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//Read the data
d3.csv("Argentina Shot Data - Saudi Arabia.csv").then(function(data) {

  // group the data: one array for each value of the X axis.
  const sumstat = d3.group(data, d => d.Squad);

  // Add X axis
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.Minute; }))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.xG; })])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // color palette
  const color = d3.scaleOrdinal()
    .domain(["Argentina", "Saudi Arabia"])
    .range(['#e41a1c','#377eb8'])

  // Draw the line
  svg.selectAll(".line")
      .data(sumstat)
      .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d[0]) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x(d.Minute); })
            .y(function(d) { return y(+d.xG); })
            (d[1])
        })

});
