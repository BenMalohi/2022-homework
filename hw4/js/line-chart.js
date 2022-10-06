/** Class representing the line chart view. */
class LineChart {
  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  constructor(globalApplicationState) {
    // Set some class level variables
    this.globalApplicationState = globalApplicationState;

    //2.1 data
    this.lineChart = d3.select("#line-chart");

    this.filteredData = globalApplicationState.covidData.filter(function (data) {
      return data.iso_code.includes("OWID");
    });

    this.groupCovidData = d3.group(this.filteredData, (data) => data.location);

    //2.2 axes
    this.padding = { left: 80, right: 50 };

    let xAxis = d3.scaleTime()
      .domain(d3.extent(this.filteredData.map(function (date) { //finds min and max dates and display dates that are evenly distritbuted between them
        return new Date(date.date);
      })))
      .range([this.padding.left, 700]);

    d3.select("#x-axis").call(d3.axisBottom(xAxis).tickFormat(d3.timeFormat("%b %Y"))).attr("transform", "translate(0," + (500 - 20) + ")");

    let yAxis = d3.scaleLinear()
      .domain([0, d3.max(this.filteredData, function (data) {
        return +data.total_cases_per_million; // + parses to integer 
      })])
      .range([500 - 20, 10]);

    d3.select("#y-axis").call(d3.axisLeft(yAxis)).attr("transform", "translate(" + this.padding.left + ", 0)");

    //2.3 lines

    //lab code
    var lineColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(this.groupCovidData.keys());

    this.lineChart.select('#lines')
      .selectAll('.line')
      .data(this.groupCovidData)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', (group) => lineColorScale(group[0]))
      .attr('stroke-width', 1)
      .attr('d', function (group) {
        return d3.line()
          .x(function (date) { return xAxis(new Date(date.date)) })
          .y(function (data) { return yAxis(+data.total_cases_per_million) })(group[1]);
      });

    //2.5 Updating from external cues  
    this.lineChart.on('mousemove', (event) => {
      if (event.offsetX > 80 && event.offsetX < innerWidth - 50) {
        // Set the line position
        this.lineChart
          .select('#overlay')
          .select('line')
          .attr('stroke', 'black')
          .attr('x1', event.offsetX)
          .attr('x2', event.offsetX)
          .attr('y1', 600 - 10)
          .attr('y2', 0);

        // Find the relevant data (by date and location)
        const yearHovered = xAxis.invert(event.offsetX);
        const filteredHoverData = this.filteredData
          .filter(function (date){
            var newDate = new Date(date.date);             
             return newDate.getMonth() == yearHovered.getMonth() && newDate.getDate() == yearHovered.getDate() && newDate.getFullYear() == yearHovered.getFullYear()
          
          })
          .sort((rowA, rowB) => rowB.total_cases_per_million - rowA.total_cases_per_million);

        this.lineChart.select('#overlay')
          .selectAll('text')
          .data(filteredHoverData)
          .join('text')
          .text(d => `${d.location}, ${d.total_cases_per_million}`)
          .attr('x', event.offsetX < (700/2) ? event.offsetX : event.offsetX)
          .attr('y', (d, i) => 20 * i + 20)
          .attr('alignment-baseline', 'hanging')
          .attr('fill', (group) => lineColorScale(group.iso_code));
      }
    });

    this.lineChart.on('mouseleave', (event) => {
      this.lineChart
        .select("#overlay")
        .select("line")
        .attr("stroke", "none"); 

      this.lineChart
        .select("#overlay")
        .selectAll("text")
        .text(""); 


    }); 
  }

  updateSelectedCountries() {
    //2.4 interaction
    if (globalApplicationState.selectedLocations.length == 0) {
      this.filteredData = globalApplicationState.covidData.filter(function (data) {
        return data.iso_code.includes("OWID");
      });
    }
    else {
      this.filteredData = globalApplicationState.covidData.filter(function (data) { //grabs the countries that are in selectedCountries
        return globalApplicationState.selectedLocations.includes(data.iso_code);
      });
    }

    this.groupCovidData = d3.group(this.filteredData, (data) => data.location);

    let xAxis = d3.scaleTime()
      .domain(d3.extent(this.filteredData.map(function (date) { //finds min and max dates and display dates that are evenly distritbuted between them
        return new Date(date.date);
      })))
      .range([this.padding.left, 700]);

    this.lineChart.select('#lines').selectAll("path").remove().exit();
    this.lineChart.select('#y-axis').selectAll("g").remove().exit();

    let yAxis = d3.scaleLinear()
      .domain([0, d3.max(this.filteredData, function (data) {
        return +data.total_cases_per_million; // + parses to integer 
      })])
      .range([500 - 20, 10]);

    d3.select("#y-axis").call(d3.axisLeft(yAxis)).attr("transform", "translate(" + this.padding.left + ", 0)");

    var lineColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(this.groupCovidData.keys());

    this.lineChart.select('#lines')
      .selectAll('.line')
      .data(this.groupCovidData)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', (group) => lineColorScale(group))
      .attr('stroke-width', 1)
      .attr('d', function (group) {
        return d3.line()
          .x(function (date) { return xAxis(new Date(date.date)) })
          .y(function (data) { return yAxis(+data.total_cases_per_million) })(group[1]);
      });
  }
}