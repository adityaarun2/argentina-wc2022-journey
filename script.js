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
    .attr("class", "barTooltip") // Note the unique class name
    .style("opacity", 0)
    .style("position", "absolute")
    .style("text-align", "center")
    .style("width", "120px")
    .style("height", "28px")
    .style("padding", "2px")
    .style("font", "12px sans-serif")
    .style("background", "lightsteelblue")
    .style("border", "0px")
    .style("border-radius", "8px")
    .style("pointer-events", "none"); // Ensure the tooltip does not interfere with other mouse events

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
          .style("opacity", 1);
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

function drawSoccerPitch() {
    const pitchWidth = 600;
    const pitchHeight = 300;
  
    const svg = d3.select('#soccer-pitch').append('svg')
        .attr('width', pitchWidth)
        .attr('height', pitchHeight)
        .attr('class', 'pitch')
        .style('background-color', '#006600'); // Optional: set pitch background color
  
    d3.json('final-lineup.json').then(function(data) {
        const xScale = d3.scaleLinear().domain([0, 100]).range([0, pitchWidth]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([0, pitchHeight]);
  
        svg.selectAll('.player')
            .data(data.teams.flatMap(team => team.players.map(player => ({ ...player, teamColor: (team.country === "Argentina" ? "#ADD8E6" : "#00008B") })))) // Assign blue color to Argentina and yellow to France
            .enter().append('circle')
            .attr('class', 'player-marker')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 10) // Radius of player markers
            .attr('fill', d => d.teamColor) // Use the team color for the fill
            .on('mouseover', function(event, d) {
                // Remove any existing tooltips before creating a new one
                d3.selectAll('.tooltip').remove(); // This line ensures any lingering tooltips are removed
            
                const tooltip = d3.select('body').append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 0);
            
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`#${d.number} ${d.name} - ${d.position}`)
                    .style('left', (event.pageX + 10) + 'px') // Adjusted for better positioning
                    .style('top', (event.pageY - 28) + 'px');
                    .style('background', 'lightgrey')
            })
            .on('mouseout', function() {
                // Select and remove the specific tooltip
                d3.selectAll('.tooltip').transition().duration(500).style('opacity', 0).remove();
            });        
        })
        // Create the SVG container

// Halfway line
svg.append('line')
    .attr('x1', pitchWidth / 2)
    .attr('y1', 0)
    .attr('x2', pitchWidth / 2)
    .attr('y2', pitchHeight)
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

// Center circle
svg.append('circle')
    .attr('cx', pitchWidth / 2)
    .attr('cy', pitchHeight / 2)
    .attr('r', pitchHeight / 6)  // Radius; typical soccer pitch circle radius
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

// Penalty areas: assuming these are 16 meters from each goal line, adapt size as needed
const penaltyAreaWidth = pitchWidth * 0.18;  // Adjust based on actual field proportions
const penaltyAreaHeight = pitchHeight * 0.4; // Adjust based on actual field proportions

// Left penalty area
svg.append('rect')
    .attr('x', 0)
    .attr('y', (pitchHeight - penaltyAreaHeight) / 2)
    .attr('width', penaltyAreaWidth)
    .attr('height', penaltyAreaHeight)
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

// Right penalty area
svg.append('rect')
    .attr('x', pitchWidth - penaltyAreaWidth)
    .attr('y', (pitchHeight - penaltyAreaHeight) / 2)
    .attr('width', penaltyAreaWidth)
    .attr('height', penaltyAreaHeight)
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

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

document.addEventListener('DOMContentLoaded', function() {
  fetch('elimination-bracket.json')
      .then(response => response.json())
      .then(data => buildBracket(data["Knockout stage"]))
      .catch(error => console.error('Error fetching elimination data:', error));
});

function buildBracket(data) {
  const container = document.getElementById('bracket-container');
  ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Third-place match', 'Final'].forEach(round => {
      const roundDiv = document.createElement('div');
      roundDiv.className = 'round ' + round.toLowerCase().replace(/ /g, '-');
      const label = document.createElement('div');
      label.className = 'round-label';
      label.textContent = round;
      roundDiv.appendChild(label);

      const matches = data[round].matches || [data[round].match]; // handle single match rounds
      matches.forEach(match => {
          const matchDiv = document.createElement('div');
          matchDiv.className = 'match';
          const team1 = document.createElement('div');
          team1.className = 'team';
          team1.textContent = `${match.team1} ${match.score.split('–')[0]}`;
          const team2 = document.createElement('div');
          team2.className = 'team';
          team2.textContent = `${match.team2} ${match.score.split('–')[1]}`;
          // Highlight winning team
          if (match.winners === match.team1) {
              team1.classList.add('winner');
          } else if (match.winners === match.team2) {
              team2.classList.add('winner');
          }
          matchDiv.appendChild(team1);
          matchDiv.appendChild(team2);
          roundDiv.appendChild(matchDiv);
      });

      container.appendChild(roundDiv);
  });
}
