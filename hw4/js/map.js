/** Class representing the map view. */
class MapVis {
  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  constructor(globalApplicationState) {

    this.globalApplicationState = globalApplicationState;
    this.map_svg = d3.select('#map')
    // Set up the map projection
    const projection = d3.geoWinkel3()
      .scale(150) // This set the size of the map
      .translate([400, 250]); // This moves the map to the center of the SVG.

    this.path = d3.geoPath().projection(projection);
    let color = d3.scaleQuantize()
      .range(["#F7B5D3", "#F17EB2", "#EE599C", "#EF1A7A", "#E00065"]);

    let json = topojson.feature(globalApplicationState.mapData, globalApplicationState.mapData.objects.countries);

    color.domain([
      d3.min(globalApplicationState.covidData, function (d) {
        return d.total_cases_per_million
      }),
      d3.max(globalApplicationState.covidData, function (d) {
        return d.total_cases_per_million
      })
    ]);

    let worldLines = d3.geoGraticule();
    worldLines.outline();

    this.map_svg.select('#graticules').append("path")
      .datum(worldLines)
      .attr('class', 'grat')
      .attr('d', this.path)
      .attr('fill', 'none')
      .attr('stroke', "#DFB2F4")
      .attr('opacity', "0.8");
      
    let covidData = {};
    this.globalApplicationState.covidData.forEach(function (r) {
      covidData[r.iso_code] = parseFloat(r.total_cases_per_million)
    });

    json.features.forEach(function (feature) {
      feature.properties.value = covidData[feature.id]
    });

    this.map_svg.select("#countries").selectAll("path")
      .data(json.features) 
      .join("path")
      .attr("d", this.path)
      .attr("stroke", "#BAA4D5")
      .style("fill", function (d) {
        return (isNaN(d.properties.value) ? color(0.01) : color(d.properties.value));
      })
      .on("click", this.updateSelectedCountries)
      .attr("class", function(data){
        return data.id;
      }); 

    let defs = this.map_svg.append('defs');

    let gradient = defs.append('linearGradient')
      .attr('id', 'gradient');

    gradient.append('stop')
      .attr('class', 'stop-left')
      .attr('stop-color', '#F7B5D3')
      .attr('offset', '0');

    gradient.append('stop')
      .attr('class', 'stop-right')
      .attr('stop-color', '#E00065')
      .attr('offset', '1');

    // Use the gradient to set the shape fill, via CSS.
    this.map_svg.append('rect')
      .attr('fill', 'url(#gradient')
      .attr('x', 0)
      .attr('y', 490)
      .attr('width', 150)
      .attr('height', 10);

    this.map_svg.append("text")
      .text("0")
      .attr("x", 0)
      .attr("y", 490);

    this.map_svg.append("text")
      .text("" + d3.format(".2s")(d3.max(globalApplicationState.covidData, function (d) {
        return +d.total_cases_per_million;
      })))
      .attr("x", 150)
      .attr("y", 490);
  }

  updateSelectedCountries() {
    if(!globalApplicationState.selectedLocations.includes(this.getAttribute("class"))){
      globalApplicationState.selectedLocations.push(this.getAttribute("class"));
      d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5);
      d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black");
    }
    else{
      globalApplicationState.selectedLocations = globalApplicationState.selectedLocations.filter(country => country!= this.getAttribute("class"));
      d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5);
      d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "#BAA4D5");
    }
    globalApplicationState.lineChart.updateSelectedCountries(); //call function in linechart to update chart
  }
}