// -----------------------------
// BAR CHART
// -----------------------------
const margin = { top: 20, right: 20, bottom: 70, left: 100 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const svg = d3.select("#bar-chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const barTooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
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
  .style("pointer-events", "none");

d3.json('data/metadata/wc_goals_by_country.json').then(function (data) {
  const top10Data = data
    .sort((a, b) => d3.descending(a.total_goals, b.total_goals))
    .slice(0, 10);

  const x = d3.scaleLinear()
    .domain([0, d3.max(top10Data, d => d.total_goals)])
    .range([0, width]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  const y = d3.scaleBand()
    .range([0, height])
    .domain(top10Data.map(d => d.country))
    .padding(0.1);

  svg.append("g")
    .call(d3.axisLeft(y));

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
      barTooltip.transition().duration(200).style("opacity", 1);
      barTooltip.html(`${d.country}<br/>Goals: ${d.total_goals}`)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => {
      barTooltip.transition().duration(500).style("opacity", 0);
    });
});


// -----------------------------
// XG CHART
// -----------------------------
const xgMargin = { top: 50, right: 30, bottom: 70, left: 70 },
  xgWidth = 960 - xgMargin.left - xgMargin.right,
  xgHeight = 500 - xgMargin.top - xgMargin.bottom;

const xgSvg = d3.select("#xg-chart")
  .append("svg")
  .attr("width", xgWidth + xgMargin.left + xgMargin.right)
  .attr("height", xgHeight + xgMargin.top + xgMargin.bottom)
  .append("g")
  .attr("transform", `translate(${xgMargin.left},${xgMargin.top})`);

const xgTooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

function renderXG(file, title, opponentName) {
  xgSvg.selectAll("*").remove();

  d3.csv(file).then(function (data) {
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
      } else {
        opponentData.push({
          Minute: d.Minute,
          cumulativeXG: opponentData[opponentData.length - 1].cumulativeXG + d.xG
        });
      }
    });

    if (opponentData[opponentData.length - 1].Minute < maxMinute) {
      opponentData.push({
        Minute: maxMinute,
        cumulativeXG: opponentData[opponentData.length - 1].cumulativeXG
      });
    }

    const xScale = d3.scaleLinear()
      .domain([0, maxMinute])
      .range([0, xgWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max([...argentinaData, ...opponentData], d => d.cumulativeXG)])
      .range([xgHeight, 0]);

    const line = d3.line()
      .x(d => xScale(d.Minute))
      .y(d => yScale(d.cumulativeXG))
      .curve(d3.curveStepAfter);

    // X axis
    xgSvg.append("g")
      .attr("transform", `translate(0,${xgHeight})`)
      .call(d3.axisBottom(xScale).ticks(maxMinute / 5));

    // Y axis
    xgSvg.append("g")
      .call(d3.axisLeft(yScale));

    // Title
    xgSvg.append("text")
      .attr("x", xgWidth / 2)
      .attr("y", -18)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(title);

    // Lines
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

    // Goals
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
        xgTooltip.transition().duration(200).style("opacity", 0.9);
        xgTooltip.html(`Player: ${d.Player}<br/>xG: ${(+d.xG).toFixed(2)}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        xgTooltip.transition().duration(500).style("opacity", 0);
      });

    // Legend
    const legend = xgSvg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start");

    const legendData = [
      { team: "Argentina", color: "blue" },
      { team: opponentName, color: "green" }
    ];

    const rows = legend.selectAll("g")
      .data(legendData)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0,${i * 18})`);

    rows.append("rect")
      .attr("x", 0)
      .attr("y", -10)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => d.color);

    rows.append("text")
      .attr("x", 14)
      .attr("y", -1)
      .text(d => d.team);
  });
}

function updateXGChart(gameIndex) {
  const games = ["Argentina 1 - 2 Saudi Arabia", "Argentina 2-0 Mexico", "Poland 0-2 Argentina"];
  const files = ["data/shot-data/argentina-saudi.csv", "data/shot-data/argentina-mexico.csv", "data/shot-data/argentina-poland.csv"];
  const opponents = ["Saudi Arabia", "Mexico", "Poland"];

  d3.select("#gameLabel").text(games[gameIndex]);
  renderXG(files[gameIndex], games[gameIndex], opponents[gameIndex]);
}


// -----------------------------
// GROUP STAGE ANALYSIS TEXT
// -----------------------------
const gameAnalysisText = [
  "Heading into their first match, Argentina were considered strong favorites. The xG graph shows Argentina creating more significant chances, as indicated by their higher xG throughout most of the game. However, football's unpredictable nature was on full display as Saudi Arabia turned the tables, winning 2-1 despite Argentina's offensive efforts.",
  "After the upset against Saudi Arabia, Argentina faced a crucial match against Mexico. This time, the team showcased their capability for strategic adjustments, leading to a convincing 2-0 victory. The xG graph demonstrates Argentina's improved efficiency in front of goal and a strong defensive performance, reflecting a game well-controlled.",
  "Entering their final group match, Argentina needed a win to secure their advancement. They delivered an exceptional performance against Poland, dominating the game as shown by the ascending xG line, resulting in a 2-0 victory. This match underscored Argentina's attacking strength and resilience, clinching their spot in the knockout stages."
];

function updateGameAnalysis(gameIndex) {
  document.getElementById('gameAnalysis').innerText = gameAnalysisText[gameIndex];
}


// -----------------------------
// SOCCER PITCH (FINAL LINEUP)
// -----------------------------
function drawSoccerPitch() {
  const pitchWidth = 600;
  const pitchHeight = 300;

  // Clear if rerendered
  d3.select('#soccer-pitch').selectAll("*").remove();

  const svg = d3.select('#soccer-pitch').append('svg')
    .attr('width', pitchWidth)
    .attr('height', pitchHeight)
    .attr('class', 'pitch')
    .style('background-color', '#006600')
    .style('border', '1px solid #fff');

  // Pitch markings
  svg.append('line')
    .attr('x1', pitchWidth / 2)
    .attr('y1', 0)
    .attr('x2', pitchWidth / 2)
    .attr('y2', pitchHeight)
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

  svg.append('circle')
    .attr('cx', pitchWidth / 2)
    .attr('cy', pitchHeight / 2)
    .attr('r', pitchHeight / 6)
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

  const penaltyAreaWidth = pitchWidth * 0.18;
  const penaltyAreaHeight = pitchHeight * 0.4;

  svg.append('rect')
    .attr('x', 0)
    .attr('y', (pitchHeight - penaltyAreaHeight) / 2)
    .attr('width', penaltyAreaWidth)
    .attr('height', penaltyAreaHeight)
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

  svg.append('rect')
    .attr('x', pitchWidth - penaltyAreaWidth)
    .attr('y', (pitchHeight - penaltyAreaHeight) / 2)
    .attr('width', penaltyAreaWidth)
    .attr('height', penaltyAreaHeight)
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

  // Players
  d3.json('data/metadata/final-lineup.json').then(function (data) {
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, pitchWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([0, pitchHeight]);

    const players = data.teams.flatMap(team =>
      team.players.map(player => ({
        ...player,
        teamColor: (team.country === "Argentina" ? "#ADD8E6" : "#00008B")
      }))
    );

    svg.selectAll('.player-marker')
      .data(players)
      .enter()
      .append('circle')
      .attr('class', 'player-marker')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 10)
      .attr('fill', d => d.teamColor)
      .on('mouseover', function (event, d) {
        d3.selectAll('.tooltip').remove();
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`#${d.number} ${d.name} - ${d.position}`)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px')
          .style('background', 'lightgrey')
          .style('padding', '5px')
          .style('border-radius', '8px');
      })
      .on('mouseout', function () {
        d3.selectAll('.tooltip').transition().duration(300).style('opacity', 0).remove();
      });
  });
}


// -----------------------------
// ELIMINATION BRACKET (WITH FLAGS)
// -----------------------------
function buildBracket(knockoutStage) {
  const container = document.getElementById("bracket-container");
  container.innerHTML = "";

  const rounds = ["Round of 16", "Quarter-finals", "Semi-finals", "Final"];

  function slugifyTeam(name) {
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function flagPath(teamName) {
    return `images/flags/${slugifyTeam(teamName)}.png`;
  }

  const normalize = (s) => String(s || "").trim();

  function findMatch(matches, a, b) {
    a = normalize(a); b = normalize(b);
    return matches.find(m =>
      (normalize(m.team1) === a && normalize(m.team2) === b) ||
      (normalize(m.team1) === b && normalize(m.team2) === a)
    );
  }

  const splitScore = (scoreStr) => {
    const parts = (scoreStr || "").split(/[–—-]/).map(s => s.trim());
    return [parts[0] ?? "", parts[1] ?? ""];
  };

  const r16 = knockoutStage["Round of 16"]?.matches || [];
  const qf = knockoutStage["Quarter-finals"]?.matches || [];
  const sf = knockoutStage["Semi-finals"]?.matches || [];
  const fin = knockoutStage["Final"]?.match || knockoutStage["Final"]?.matches || [];

  // FIFA 2022 explicit order
  const r16Ordered = [
    findMatch(r16, "Netherlands", "United States"),
    findMatch(r16, "Argentina", "Australia"),

    findMatch(r16, "Croatia", "Japan"),
    findMatch(r16, "Brazil", "Korea Republic"),

    findMatch(r16, "Morocco", "Spain"),
    findMatch(r16, "Portugal", "Switzerland"),

    findMatch(r16, "France", "Poland"),
    findMatch(r16, "England", "Senegal"),
  ].filter(Boolean);

  const qfOrdered = [
    findMatch(qf, "Argentina", "Netherlands"),
    findMatch(qf, "Croatia", "Brazil"),

    findMatch(qf, "Morocco", "Portugal"),
    findMatch(qf, "France", "England"),
  ].filter(Boolean);

  const sfOrdered = [
    findMatch(sf, "Argentina", "Croatia"),
    findMatch(sf, "France", "Morocco"),
  ].filter(Boolean);

  const finalMatch = findMatch(fin, "Argentina", "France") || fin[0];
  const finalOrdered = finalMatch ? [finalMatch] : [];

  const roundMatches = [r16Ordered, qfOrdered, sfOrdered, finalOrdered];

  const argentinaIdx = roundMatches.map(matches =>
    matches.findIndex(m => m && (m.team1 === "Argentina" || m.team2 === "Argentina"))
  );

  // Layout constants
  const colW = 300;
  const cardW = 240;
  const cardH = 92;
  const topPad = 70;
  const baseGap = 28;
  const leftPad = 30;

  // Positions
  const positions = [];
  positions[0] = roundMatches[0].map((_, i) => ({
    x: leftPad,
    y: topPad + i * (cardH + baseGap)
  }));

  for (let r = 1; r < rounds.length; r++) {
    positions[r] = roundMatches[r].map((_, i) => {
      const a = positions[r - 1][i * 2];
      const b = positions[r - 1][i * 2 + 1];
      return { x: leftPad + r * colW, y: (a.y + b.y) / 2 };
    });
  }

  const stageHeight = positions[0][positions[0].length - 1].y + cardH + 40;
  const stageWidth = leftPad + (rounds.length - 1) * colW + cardW + 40;

  // Stage
  const stage = document.createElement("div");
  stage.className = "bracket-stage";
  stage.style.height = `${stageHeight}px`;
  stage.style.width = `${stageWidth}px`;
  container.appendChild(stage);

  // SVG overlay
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "bracket-lines");
  svg.setAttribute("width", stageWidth);
  svg.setAttribute("height", stageHeight);
  stage.appendChild(svg);

  const drawPath = (d, cls) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", cls);
    svg.appendChild(p);
  };

  const drawFeeder = (fromPos, toPos, midX, emphasize) => {
    const fx = fromPos.x + cardW;
    const fy = fromPos.y + cardH / 2;
    const ty = toPos.y + cardH / 2;
    drawPath(`M ${fx} ${fy} L ${midX} ${fy} L ${midX} ${ty}`, emphasize ? "bracket-line path" : "bracket-line");
  };

  const drawIntoNext = (toPos, midX, emphasize) => {
    const tx = toPos.x;
    const ty = toPos.y + cardH / 2;
    drawPath(`M ${midX} ${ty} L ${tx} ${ty}`, "bracket-line");
    if (emphasize) drawPath(`M ${midX} ${ty} L ${tx} ${ty}`, "bracket-line path");
  };

  // Labels
  rounds.forEach((round, r) => {
    if (!positions[r]?.length) return;
    const label = document.createElement("div");
    label.className = "bracket-round-label";
    label.textContent = round;
    label.style.left = `${positions[r][0].x + cardW / 2}px`;
    stage.appendChild(label);
  });

  // Connectors
  for (let r = 0; r < rounds.length - 1; r++) {
    const prevArg = argentinaIdx[r];
    const nextArg = argentinaIdx[r + 1];

    for (let i = 0; i < roundMatches[r + 1].length; i++) {
      const top = i * 2;
      const bottom = i * 2 + 1;

      const a = positions[r][top];
      const b = positions[r][bottom];
      const c = positions[r + 1][i];

      const midX = (a.x + cardW + c.x) / 2;

      const emphasizeTop = (i === nextArg && top === prevArg);
      const emphasizeBottom = (i === nextArg && bottom === prevArg);
      const emphasizeIntoNext = (i === nextArg);

      drawFeeder(a, c, midX, emphasizeTop);
      drawFeeder(b, c, midX, emphasizeBottom);
      drawIntoNext(c, midX, emphasizeIntoNext);
    }
  }

  // Cards
  rounds.forEach((round, r) => {
    roundMatches[r].forEach((match, i) => {
      const card = document.createElement("div");
      card.className = "match-card";

      const isArgentinaMatch = (i === argentinaIdx[r]);
      if (!isArgentinaMatch) card.classList.add("dim");
      if (isArgentinaMatch) card.classList.add("path");

      const isFinal = (round === "Final");
      if (isFinal) card.classList.add("final");

      card.style.left = `${positions[r][i].x}px`;
      card.style.top = `${positions[r][i].y}px`;

      const [s1, s2] = splitScore(match.score);

      const mkRow = (teamName, scoreText, isWinner) => {
        const row = document.createElement("div");
        row.className = "team-row";
        if (isWinner) row.classList.add("winner");

        const left = document.createElement("span");
        left.className = "team-left";

        const img = document.createElement("img");
        img.className = "team-flag";
        img.src = flagPath(teamName);
        img.alt = `${teamName} flag`;
        img.onerror = () => img.remove();
        left.appendChild(img);

        const name = document.createElement("span");
        name.className = "team-name";
        name.textContent = teamName;
        left.appendChild(name);

        const sc = document.createElement("span");
        sc.className = "team-score";
        sc.textContent = scoreText;

        row.appendChild(left);
        row.appendChild(sc);
        return row;
      };

      if (isFinal) {
        card.appendChild(mkRow(match.team1, "", false));
        card.appendChild(mkRow(match.team2, "", false));
      } else {
        card.appendChild(mkRow(match.team1, s1, match.winners === match.team1));
        card.appendChild(mkRow(match.team2, s2, match.winners === match.team2));
      }

      stage.appendChild(card);
    });
  });

  // Fit-to-container scaling (no horizontal scroll)
  const containerWidth = container.clientWidth;
  const usableWidth = Math.max(320, containerWidth - 24);
  const scale = Math.min(1, usableWidth / stageWidth);

  stage.style.transformOrigin = "top left";
  stage.style.transform = `scale(${scale})`;

  container.style.height = `${stageHeight * scale + 10}px`;
}


// -----------------------------
// INIT + EVENTS
// -----------------------------
function renderBracket() {
  fetch('data/metadata/elimination-bracket.json')
    .then(r => r.json())
    .then(json => buildBracket(json["Knockout stage"]))
    .catch(console.error);
}

// Initial
updateXGChart(0);
updateGameAnalysis(0);

// Slider interaction
d3.select("#gameSlider").on("input", function () {
  updateXGChart(+this.value);
  updateGameAnalysis(+this.value);
});

// On load
document.addEventListener('DOMContentLoaded', () => {
  drawSoccerPitch();
  renderBracket();
});

// On resize (rebuild bracket to keep fit)
window.addEventListener("resize", () => {
  renderBracket();
});
