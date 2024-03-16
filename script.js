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
const xgMargin = { top: 50, right: 30, bottom: 70, left: 70 },
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
    // Process data for cumulative xG values for both teams
    let argentinaData = [{ Minute: 0, cumulativeXG: 0 }];
    let saudiData = [{ Minute: 0, cumulativeXG: 0 }];

    data.forEach(d => {
        d.xG = +d.xG;
        d.Minute = +d.Minute;

        if(d.Squad === 'Argentina') {
            argentinaData.push({ Minute: d.Minute, cumulativeXG: argentinaData[argentinaData.length - 1].cumulativeXG + d.xG });
        } else if(d.Squad === 'Saudi Arabia') {
            saudiData.push({ Minute: d.Minute, cumulativeXG: saudiData[saudiData.length - 1].cumulativeXG + d.xG });
        }
    });

    // Define the scales for the xG chart
    const xScale = d3.scaleLinear()
        .domain([0, 90])
        .range([0, xgWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, Math.max(
            d3.max(argentinaData, d => d.cumulativeXG), 
            d3.max(saudiData, d => d.cumulativeXG)
        )])
        .range([xgHeight, 0]);

    // Add the chart title
    xgSvg.append("text")
        .attr("x", xgWidth / 2)
        .attr("y", 0 - (xgMargin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .text("Argentina 1 - 2 Saudi Arabia");

    // Add the lines for each team
    const line = d3.line()
        .x(d => xScale(d.Minute))
        .y(d => yScale(d.cumulativeXG))
        .curve(d3.curveStepAfter);

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

    // Add the circles for goals
    xgSvg.selectAll(".goal-dot")
        .data(data.filter(d => d.Outcome === "Goal"))
        .enter().append("circle")
            .attr("class", "goal-dot")
            .attr("cx", d => xScale(d.Minute))
            .attr("cy", d => yScale(d.cumulativeXG))
            .attr("r", 5)
            .attr("fill", d => d.Squad === "Argentina" ? "blue" : "green")
            .on("mouseover", (event, d) => {
                xgTooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                xgTooltip.html(`Player: ${d.Player}<br/>xG: ${d.xG.toFixed(2)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event, d) => {
              xgTooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
          });

  // Add the X Axis
  xgSvg.append("g")
      .attr("transform", `translate(0,${xgHeight})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append("text")
      .attr("class", "axis-label")
      .attr("y", 40)
      .attr("x", xgWidth / 2)
      .style("text-anchor", "middle")
      .text("Minute");

  // Add the Y Axis
  xgSvg.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("dy", "1em")
      .attr("x", -xgHeight / 2)
      .style("text-anchor", "middle")
      .text("xG Cumulative");

  // Add a legend to the top left corner of the chart
  const legend = xgSvg.append("g")
      .attr("class", "legend")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(["Argentina (blue)", "Saudi Arabia (green)"])
      .enter().append("g")
      .attr("transform", (d, i) => `translate(10,${i * 20})`);

  legend.append("rect")
      .attr("x", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => d.includes("Argentina") ? "blue" : "green");

  legend.append("text")
      .attr("x", 20)
      .attr("y", 9)
      .attr("dy", "0.32em")
      .text(d => d);

  // Ensure the Saudi Arabia line starts from minute 0
  if(saudiData[0].Minute !== 0){
      saudiData.unshift({ Minute: 0, cumulativeXG: 0 });
  }
  
  // Redraw the Saudi line to start from minute 0
  xgSvg.select("path.stroke-green")
      .datum(saudiData)
      .attr("d", line);

});
