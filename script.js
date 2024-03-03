// Assuming you have the data from the dataframe in the following format:
// [{"country": "Brazil", "total_goals": 227}, {...}]
d3.json('path/to/total_world_cup_goals_by_country.json').then(data => {
  // Sort data by total goals
  data.sort((a, b) => d3.descending(a.total_goals, b.total_goals));

  // Set dimensions and margins for the graph
  const margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // Set the ranges for x and y axes
  const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
  const y = d3.scaleLinear()
        .range([height, 0]);

  const svg = d3.select("#bar-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data in the domains
  x.domain(data.map(d => d.country));
  y.domain([0, d3.max(data, d => d.total_goals)]);

  // Append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.country))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.total_goals))
      .attr("height", d => height - y(d.total_goals));

  // Add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

  // Add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

  // Add axis labels
  svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Country");

  svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Total Goals"); 
});
