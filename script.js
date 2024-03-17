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

  // Calculate cumulative xG for both teams
  let argentinaData = [{ Minute: 0, cumulativeXG: 0 }];
  let saudiData = [{ Minute: 0, cumulativeXG: 0 }];
  let maxMinute = 0;

  data.forEach(d => {
      d.xG = +d.xG;
      d.Minute = +d.Minute;
      maxMinute = Math.max(maxMinute, d.Minute);

      if (d.Squad === 'Argentina') {
          argentinaData.push({
              Minute: d.Minute,
              cumulativeXG: argentinaData[argentinaData.length - 1].cumulativeXG + d.xG
          });
      } else {
          saudiData.push({
              Minute: d.Minute,
              cumulativeXG: saudiData[saudiData.length - 1].cumulativeXG + d.xG
          });
      }
  });

  // If the data does not include maxMinute for Saudi Arabia, extend their line
  if (saudiData[saudiData.length - 1].Minute < maxMinute) {
      saudiData.push({ Minute: maxMinute, cumulativeXG: saudiData[saudiData.length - 1].cumulativeXG });
  }

  // Define the scales for the xG chart
  const xScale = d3.scaleLinear()
      .domain([0, maxMinute])
      .range([0, xgWidth]);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max([...argentinaData, ...saudiData], d => d.cumulativeXG)])
      .range([xgHeight, 0]);

  // Define the line generator
  const line = d3.line()
      .x(d => xScale(d.Minute))
      .y(d => yScale(d.cumulativeXG))
      .curve(d3.curveStepAfter);

  // Add the X Axis
  xgSvg.append("g")
      .attr("transform", `translate(0,${xgHeight})`)
      .call(d3.axisBottom(xScale).ticks(maxMinute / 5))
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

  // Add the lines for each team
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

  // Add circles for goals, ensuring they are placed at the correct cumulative xG value
  xgSvg.selectAll(".goal-dot")
      .data(data.filter(d => d.Outcome === "Goal"))
      .enter().append("circle")
          .attr("class", "goal-dot")
          .attr("cx", d => xScale(d.Minute))
          .attr("cy", d => {
              const teamData = d.Squad === 'Argentina' ? argentinaData : saudiData;
              const matchData = teamData.find(dd => dd.Minute === d.Minute);
              return yScale(matchData ? matchData.cumulativeXG : 0);
          })
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
          .on("mouseout", () => {
              xgTooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
          });
});

// Function to update the xG chart based on the selected game
function updateXGChart(gameIndex) {
  // Array of game names and corresponding CSV file paths
  const games = ["Argentina 1 - 2 Saudi Arabia", "Argentina 2-0 Mexico", "Poland 0-2 Argentina"];
  const files = ["Argentina Shot Data - Saudi Arabia.csv", "Argentina Shot Data - Mexico.csv", "Argentina Shot Data - Poland.csv"];
  const opponents = ["Saudi Arabia", "Mexico", "Poland"]; // Opponent names for the legend

  // Update game label based on selected game
  d3.select("#gameLabel").text(games[gameIndex]);

  // Clear previous xG chart
  xgSvg.selectAll("*").remove();

  // Read and process the data from the selected game's CSV file
  d3.csv(files[gameIndex]).then(function(data) {
      let argentinaData = [{ Minute: 0, cumulativeXG: 0 }];
      let opponentData = [{ Minute: 0, cumulativeXG: 0 }];
      let maxMinute = 0;

      data.forEach(d => {
          d.xG = +d.xG;
          d.Minute = +d.Minute;
          maxMinute = Math.max(maxMinute, d.Minute);

          if (d.Squad === 'Argentina') {
              argentinaData.push({
                  Minute: d.Minute,
                  cumulativeXG: argentinaData[argentinaData.length - 1].cumulativeXG + d.xG
              });
          } else { // Assuming all other data points belong to the opponent
              opponentData.push({
                  Minute: d.Minute,
                  cumulativeXG: opponentData[opponentData.length - 1].cumulativeXG + d.xG
              });
          }
      });

      // Extend data to the end of the game if necessary
      if (opponentData[opponentData.length - 1].Minute < maxMinute) {
          opponentData.push({ Minute: maxMinute, cumulativeXG: opponentData[opponentData.length - 1].cumulativeXG });
      }

      // Set up scales
      const xScale = d3.scaleLinear()
          .domain([0, maxMinute])
          .range([0, xgWidth]);
      const yScale = d3.scaleLinear()
          .domain([0, d3.max([...argentinaData, ...opponentData], d => d.cumulativeXG)])
          .range([xgHeight, 0]);

      // Line generator
      const line = d3.line()
          .x(d => xScale(d.Minute))
          .y(d => yScale(d.cumulativeXG))
          .curve(d3.curveStepAfter);

      // Draw axes
      xgSvg.append("g")
          .attr("transform", `translate(0,${xgHeight})`)
          .call(d3.axisBottom(xScale).ticks(maxMinute / 5));

      xgSvg.append("g")
          .call(d3.axisLeft(yScale));

      // Draw lines for Argentina and the opponent
      xgSvg.append("path")
          .datum(argentinaData)
          .attr("fill", "none")
          .attr("stroke", "blue")
          .attr("stroke-width", 2)
          .attr("d", line);

      xgSvg.append("path")
          .datum(opponentData)
          .attr("fill", "none")
          .attr("stroke", "green")
          .attr("stroke-width", 2)
          .attr("d", line);

      // Draw circles for goals
      xgSvg.selectAll(".goal-dot")
          .data(data.filter(d => d.Outcome === "Goal"))
          .enter().append("circle")
          .attr("class", "goal-dot")
          .attr("cx", d => xScale(d.Minute))
          .attr("cy", d => {
              const matchData = d.Squad === 'Argentina' ? argentinaData : opponentData;
              const exactData = matchData.find(dd => dd.Minute === d.Minute);
              return yScale(exactData ? exactData.cumulativeXG : 0);
          })
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
          .on("mouseout", () => {
              xgTooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
          });
          xgSvg.append("text")
            .attr("x", xgWidth / 2)
            .attr("y", 0 - (xgMargin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text(games[gameIndex]); // Use the game index to change title

        // Add a dynamic legend in the top left corner of the chart
        const legend = xgSvg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data([{ team: "Argentina", color: "blue" }, { team: opponents[gameIndex], color: "green" }])
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => d.color);

        legend.append("text")
            .attr("x", 15)
            .attr("y", 9)
            .text(d => `${d.team} (${d.color})`);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  drawSoccerPitch();

  // Add headers for team formations
  const argentinaFormationHeader = document.createElement('div');
  argentinaFormationHeader.className = 'formation-header';
  argentinaFormationHeader.innerText = 'Argentina (4-3-3)';
  document.getElementById('content').appendChild(argentinaFormationHeader);

  const franceFormationHeader = document.createElement('div');
  franceFormationHeader.className = 'formation-header';
  franceFormationHeader.innerText = 'France (4-2-3-1)';
  document.getElementById('content').appendChild(franceFormationHeader);
});

// Function to draw the soccer pitch
function drawSoccerPitch() {
  // Dimensions based on the aspect ratio of the pitch
  const pitchWidth = document.getElementById('content').offsetWidth;
  const pitchHeight = pitchWidth / 2;

  const svg = d3.select('#content').append('svg')
    .attr('class', 'pitch')
    .attr('width', pitchWidth)
    .attr('height', pitchHeight)
    .style('background-color', 'green');

  // Load player data and create pitch elements
  d3.json('final-lineup.json').then(function(data) {
    // Scales for player positions
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, pitchWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([0, pitchHeight]);

    // Player markers
    svg.selectAll('.player-marker')
      .data(data.teams.flatMap(team => team.players))
      .enter().append('circle')
        .attr('class', 'player-marker')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', pitchWidth * 0.02) // Marker radius relative to pitch width
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);
  });

  // Tooltip show function
  function showTooltip(event, d) {
    d3.select('.tooltip')
      .style('visibility', 'visible')
      .html(`Name: ${d.name}<br>Number: ${d.number}`)
      .style('left', `${event.pageX}px`)
      .style('top', `${event.pageY}px`);
  }

  // Tooltip hide function
  function hideTooltip() {
    d3.select('.tooltip').style('visibility', 'hidden');
  }
}

// Array containing the analysis text for each game
const gameAnalysisText = [
  "Heading into their first match, Argentina were considered strong favorites. The xG graph shows Argentina creating more significant chances, as indicated by their higher xG throughout most of the game. However, football's unpredictable nature was on full display as Saudi Arabia turned the tables, winning 2-1 despite Argentina's offensive efforts.",
  "After the upset against Saudi Arabia, Argentina faced a crucial match against Mexico. This time, the team showcased their capability for strategic adjustments, leading to a convincing 2-0 victory. The xG graph demonstrates Argentina's improved efficiency in front of goal and a strong defensive performance, reflecting a game well-controlled.",
  "Entering their final group match, Argentina needed a win to secure their advancement. They delivered an exceptional performance against Poland, dominating the game as shown by the ascending xG line, resulting in a 2-0 victory. This match underscored Argentina's attacking strength and resilience, clinching their spot in the knockout stages."
];

// Function to update the game analysis text based on the selected game
function updateGameAnalysis(gameIndex) {
  document.getElementById('gameAnalysis').innerText = gameAnalysisText[gameIndex];
}

// Set up the initial game analysis text (for the first game)
updateGameAnalysis(0);  // Sets the text for the first game initially

// Attach event listener to the slider
d3.select("#gameSlider").on("input", function() {
  // Assuming updateXGChart is your function to update the chart
  updateXGChart(+this.value);  // Updates the chart based on the slider
  updateGameAnalysis(+this.value);  // Updates the text based on the slider
});

document.addEventListener('DOMContentLoaded', drawSoccerPitch);