// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DUATION = 300;

var svgBarChart, svgLineChart, svgAreaChart, svgScatterPlot,
  gBarX, gBarY,
  gLineX, gLineY,
  gAreaX, gAreaY,
  gScatterX, gScatterY;

var dataMetric; 

setup();

function setup() {

  //add event handlers
  document.getElementById("dataset").addEventListener("change", changeData);
  document.getElementById("metric").addEventListener("change", changeData);
  document.getElementById("random").addEventListener("change", changeData);
  
  // Fill in some d3 setting up here if you need
  // for example, svg for each chart, g for axis and shapes

  //bar chart
  svgBarChart = d3.select("#Barchart-div")
    .append("svg")
    .attr("width", CHART_WIDTH)
    .attr("height", CHART_HEIGHT)
    .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.bottom + ")");

  gBarX = this.svgBarChart.append("g").attr("transform", "translate(0," + (CHART_HEIGHT - MARGIN.bottom) + ")");
  gBarY = this.svgBarChart.append("g").attr("transform", "translate(" + MARGIN.left + ", 0)");

  //line chart
  svgLineChart = d3.select("#Linechart-div")
    .append("svg")
    .attr("width", CHART_WIDTH)
    .attr("height", CHART_HEIGHT)
    .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.bottom + ")");

  gLineX = this.svgLineChart.append("g").attr("transform", "translate(0," + (CHART_HEIGHT - MARGIN.bottom) + ")");
  gLineY = this.svgLineChart.append("g").attr("transform", "translate(" + MARGIN.left + ", 0)");

  //area chart
  svgAreaChart = d3.select("#Areachart-div")
    .append("svg")
    .attr("width", CHART_WIDTH)
    .attr("height", CHART_HEIGHT)
    .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.bottom + ")");

  gAreaX = this.svgAreaChart.append("g").attr("transform", "translate(0," + (CHART_HEIGHT - MARGIN.bottom) + ")");
  gAreaY = this.svgAreaChart.append("g").attr("transform", "translate(" + MARGIN.left + ", 0)");

  //scatter plot
  svgScatterPlot = d3.select("#Scatterplot-div")
    .append("svg")
    .attr("width", CHART_WIDTH)
    .attr("height", CHART_HEIGHT)
    .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.bottom + ")");

  gScatterX = this.svgScatterPlot.append("g").attr("transform", "translate(0," + (CHART_HEIGHT - MARGIN.bottom) + ")");
  gScatterY = this.svgScatterPlot.append("g").attr("transform", "translate(" + MARGIN.left + ", 0)");

  changeData();
}

/**
 * Render the visualizations
 * @param data
 */
function update(data) {

  // ****** TODO ******
  dataMetric = document.getElementById("metric").value; 


  // Syntax for line generator.
  // when updating the path for line chart, use the function as the input for 'd' attribute.
  // https://github.com/d3/d3-shape/blob/main/README.md


  // const lineGenerator = d3.line()
  //   .x(d => the x coordinate for a point of the line)
  //   .y(d => the y coordinate for a point of the line);

  // Syntax for area generator.
  // the area is bounded by upper and lower lines. So you can specify x0, x1, y0, y1 seperately. Here, since the area chart will have upper and lower sharing the x coordinates, we can just use x(). 
  // Similarly, use the function as the input for 'd' attribute. 

  // const areaGenerator = d3.area()
  //   .x(d => the x coordinates for upper and lower lines, both x0 and x1)
  //   .y1(d => the y coordinate for the upper line)
  //   .y0(d=> the base line y coordinate for the area);


  //Set up scatter plot x and y axis. 
  //Since we are mapping death and case, we need new scales instead of the ones above. 
  //Cases would be the horizontal axis, so we need to use width related constants.
  //Deaths would be vertical axis, so that would need to use height related constants.


  //TODO 
  // call each update function below, adjust the input for the functions if you need to.
  updateBarChart(data);
  updateLineChart(data);
  updateAreaChart(data);
  updateScatterPlot(data);
}

/**
 * Update the bar chart
 */
function updateBarChart(data) {
  //resets graph
  svgBarChart.selectAll("rect")
    .remove()
    .exit(); 

  let xAxis = d3.scaleBand()
    .domain(data.map(function (date) {
      return date.date;
    }))
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);

  gBarX.call(d3.axisBottom(xAxis)); //appends x-axis to svg

  let yAxis = d3.scaleLinear()
    .domain([0, d3.max(data, function (value) {
      return value[dataMetric];
    })])
    .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]); 

  gBarY.call(d3.axisLeft(yAxis)); //appends y-axis to svg
  
  //spit bars
  svgBarChart.selectAll("#Barchart-div")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", function(d){
    return xAxis(d.date);
  })
  .attr("y", function(d){
    return yAxis(d[dataMetric]);
  })
  .attr("width", xAxis.bandwidth() - 5)
  .attr("height", function(d){
    return CHART_HEIGHT - yAxis(d[dataMetric]) - MARGIN.top;
  }); 
}

/**
 * Update the line chart
 */
function updateLineChart(data) {
  //resets graph
  svgLineChart.selectAll("path")
    .remove()
    .exit(); 

  let xAxis = d3.scaleBand()
    .domain(data.map(function (date) {
      return date.date;
    }))
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);

  gLineX.call(d3.axisBottom(xAxis)); //appends x-axis to svg

  let yAxis = d3.scaleLinear()
    .domain([0, d3.max(data, function (value) {
      return value[dataMetric];
    })])
    .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]); 

  gLineY.call(d3.axisLeft(yAxis)); //appends y-axis to svg

  svgLineChart.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 1.5)
  .attr("d", d3.line()
    .x(function(d){ 
      return xAxis(d.date); 
    })
    .y(function(d){ 
      return yAxis(d[dataMetric]); 
    })
  ); 
  
}

/**
 * Update the area chart 
 */
function updateAreaChart(data) {
  //resets graph
  svgAreaChart.selectAll("path")
    .remove()
    .exit(); 

  let xAxis = d3.scaleBand()
    .domain(data.map(function (date) {
      return date.date;
    }))
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);

  gAreaX.call(d3.axisBottom(xAxis)); //appends x-axis to svg

  let yAxis = d3.scaleLinear()
    .domain([0, d3.max(data, function (value) {
      return value[dataMetric];
    })])
    .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]); 

  gAreaY.call(d3.axisLeft(yAxis)); //appends y-axis to svg

  svgAreaChart.append("path")
  .datum(data)
  .attr("fill", "black")
  .attr("stroke", "black")
  .attr("stroke-width", 1.5)
  .attr("d", d3.area()
    .x(function(d){ 
      return xAxis(d.date); 
    })
    .y0(yAxis(0))
    .y1(function(d){ 
      return yAxis(d[dataMetric]); 
    })
  ); 
}

/**
 * update the scatter plot.
 */
function updateScatterPlot(data) {  
  //resets graph
  svgScatterPlot.selectAll("circle")
    .remove()
    .exit(); 

  let xAxis = d3.scaleBand()
    .domain(data.map(function (value) {
      return value.cases;
    }))
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);

  gScatterX.call(d3.axisBottom(xAxis)); //appends x-axis to svg

  let yAxis = d3.scaleLinear()
    .domain([0, d3.max(data, function (value) {
      return value.deaths; //deaths is always on y, cases for x
    })])
    .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]); 

  gScatterY.call(d3.axisLeft(yAxis)); //appends y-axis to svg

  svgScatterPlot.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (value) { return xAxis(value.cases); })
      .attr("cy", function (value) { return yAxis(value.deaths); })
      .attr("r", 5)
      .style("fill", "black");
}


/**
 * Update the data according to document settings
 */
function changeData() {
  //  Load the file indicated by the select menu
  const dataFile = d3.select('#dataset').property('value');

  d3.csv(`data/${dataFile}.csv`)
    .then(dataOutput => {

      /**
       * D3 loads all CSV data as strings. While Javascript is pretty smart
       * about interpreting strings as numbers when you do things like
       * multiplication, it will still treat them as strings where it makes
       * sense (e.g. adding strings will concatenate them, not add the values
       * together, or comparing strings will do string comparison, not numeric
       * comparison).
       *
       * We need to explicitly convert values to numbers so that comparisons work
       * when we call d3.max()
       **/

      const dataResult = dataOutput.map((d) => ({
        cases: parseInt(d.cases),
        deaths: parseInt(d.deaths),
        date: d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date))
      }));
      if (document.getElementById('random').checked) {
        // if random subset is selected
        update(randomSubset(dataResult));
      } else {
        update(dataResult);
      }
    }).catch(e => {
      console.log(e);
      alert('Error!');
    });
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset(data) {
  return data.filter((d) => Math.random() > 0.5);
}
