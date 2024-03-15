// Bar chart code
// Set the dimensions and margins of the graph for the bar chart
const margin = { top: 20, right: 20, bottom: 70, left: 100 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append the SVG object to the div called 'bar-chart'
const svg = d3.select("#bar-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create a tooltip for the bar chart
const barTooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Parse the data for the bar chart
d3.json('total_world_cup_goals_by_country.json').then(function(data) {
  // Sort the data by total goals and take the top 10
  const top10Data = data.sort((a, b) => d3.descending(a.total_goals, b.total_goals)).slice(0, 10);

  // X axis
  const x = d3.scaleLinear()
    .domain([0, d3.max(top10Data, d => d.total_goals)])
    .range([0, width]);
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

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
    .enter()
    .append("rect")
      .attr("class", "bar")
      .attr("x", x(0))
      .attr("y", d => y(d.country))
      .attr("width", d => x(d.total_goals))
      .attr("height", y.bandwidth())
      .attr("fill", "#69b3a2")
      .on("mouseover", (event, d) => {
        barTooltip.transition()
          .duration(200)
          .style("opacity", .9);
        barTooltip.html(`${d.country}<br/>Goals: ${d.total_goals}`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        barTooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
});

// xG chart code
// Set the dimensions and margins of the graph for the xG chart
const xgMargin = { top: 20, right: 20, bottom: 30, left: 60 },
      xgWidth = 960 - xgMargin.left - xgMargin.right,
      xgHeight = 500 - xgMargin.top - xgMargin.bottom;

// Append the SVG object to the div called 'xg-chart'
const xgSvg = d3.select("#xg-chart")
  .append("svg")
    .attr("width", xgWidth + xgMargin.left + xgMargin.right)
    .attr("height", xgHeight + xgMargin.top + xgMargin.bottom)
  .append("g")
    .attr("transform", `translate(${xgMargin.left},${xgMargin.top})`);

// Initialize a tooltip for the xG chart
const xgTooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Read the data from the CSV file
d3.csv("Argentina Shot Data - Saudi Arabia.csv").then(function(data) {
  // Process the data
  data.forEach(function(d) {
    d.xG = +d.xG;
    d.Minute = +d.Minute;
  });

  // Group data by Squad
  let groupedData = d3.group(data, d => d.Squad);

  // Initialize arrays to hold the cumulative xG data
  let argentinaData = [{ Minute: 0, xG: 0, Player: '', Outcome: '' }];
  let saudiData = [{ Minute: 0, xG: 0, Player: '', Outcome: '' }];

  // Function to calculate cumulative xG for each team
  groupedData.forEach((values, key) => {
    let cumulativeXG = 0;
    values.forEach(d => {
      cumulativeXG += d.xG;
      (key === 'Argentina' ? argentinaData : saudiData).push({
        Minute: d.Minute,
        xG: cumulativeXG,
        Player: d.Player,
        Outcome: d.Outcome
      });
    });
  });

  // Sort data by minute to ensure correct line plotting
  argentinaData.sort((a, b) => a.Minute - b.Minute);
  saudiData.sort((a, b) => a.Minute - b.Minute);

  // Define the scales for the xG chart
  const xScale = d3.scaleLinear()
    .domain([0, 90]) // typical duration of a football match in minutes
    .range([0, xgWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max([...argentinaData, ...saudiData], d => d.xG)])
    .range([xgHeight, 0]);

  // Define the line generator for the xG chart
  const line = d3.line()
    .x(d => xScale(d.Minute))
    .y(d => yScale(d.xG))
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

  // Add points for goals and show tooltip on hover
  xgSvg.selectAll(".goal-dot")
    .data(data.filter(d => d.Outcome === "Goal"))
    .enter().append("circle")
      .attr("class", "goal-dot")
      .attr("cx", d => xScale(d.Minute))
      .attr("cy", d => yScale(groupedData.get(d.Squad).filter(dd => dd.Minute <= d.Minute).reduce((acc, dd) => acc + dd.xG, 0)))
      .attr("r", 5)
      .attr("fill", d => d.Squad === "Argentina" ? "blue" : "green")
      .on("mouseover", (event, d) => {
        xgTooltip.transition()
          .duration(200)
          .style("opacity", .9);
        xgTooltip.html(`Player: ${d.Player}<br/>Minute: ${d.Minute}<br/>xG: ${d.xG}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", d => {
        xgTooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

  // Add the X Axis for the xG chart
  xgSvg.append("g")
    .attr("transform", `translate(0,${xgHeight})`)
    .call(d3.axisBottom(xScale));

  // Add the Y Axis for the xG chart
  xgSvg.append("g")
    .call(d3.axisLeft(yScale));
});
