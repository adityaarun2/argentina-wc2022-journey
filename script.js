// Assuming the CSV file is correctly formatted and available at the given path

// Set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 70, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Append the svg object to the div called 'xg-chart'
const svg = d3.select("#xg-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create a tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Read the data
d3.csv('Argentina Shot Data - Saudi Arabia.csv').then(function(data) {

  // Group the data: I want to draw one line per group
  const sumstat = d3.group(data, d => d.Squad);

  // Add X axis --> it is a date format
  const x = d3.scaleLinear()
    .domain([0, 90])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
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
    .range(['#377eb8','#4daf4a'])

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
