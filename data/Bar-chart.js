<!-- HTML -->
<div id="bar-chart-container" style="width: 600px; margin: 40px auto;">
  <h3 style="text-align: center;">Increase in Subsea Cable Incidents Near Taiwan, 2019–2025</h3>
  <svg id="bar-chart" width="600" height="300"></svg>
</div>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
  const data = [
    { year: 'Jan-June 2025', count: 12 },
    { year: '2024', count: 9 },
    { year: '2023', count: 7 },
    { year: '2022', count: 7 },
    { year: '2021', count: 4 },
    { year: '2020', count: 3 },
    { year: '2019', count: 3 },
  ];

  const svg = d3.select("#bar-chart"),
        margin = { top: 20, right: 20, bottom: 50, left: 120 },  // increased bottom margin for label
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand()
      .rangeRound([0, height])
      .padding(0.1)
      .domain(data.map(d => d.year));

  const x = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([0, d3.max(data, d => d.count)]);

  g.append("g")
    .call(d3.axisLeft(y));

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6));

  // Add x-axis label
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .style("font-size", "14px")
    .text("Number of Incidents");

  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => y(d.year))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.count))
    .attr("fill", "#e63946");
</script>
