// Load the data from the JSON file
d3.json('total_world_cup_goals_by_country.json', function(data) {
  // Sort the data by total goals
  data.sort(function(a, b) { return d3.descending(a.total_goals, b.total_goals); });

  // Set the dimensions of the canvas / graph
  var margin = {top: 20, right: 20, bottom: 70, left: 40},
      width = 600 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  // Set the ranges for the x and y scales
  var x = d3.scaleBand().rangeRound([0, width]).padding(0.05),
      y = d3.scaleLinear().range([height, 0]);

  // Define the SVG element
  var svg = d3.select("#bar-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data in the domains
  x.domain(data.map(function(d) { return d.country; }));
  y.domain([0, d3.max(data, function(d) { return d.total_goals; })]);

  // Create the bars for the bar chart
  svg.selectAll("bar")
      .data(data)
      .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function(d) { return x(d.country); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.total_goals); })
      .attr("height", function(d) { return height - y(d.total_goals); });

  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-90)");

  // Add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y));
});
