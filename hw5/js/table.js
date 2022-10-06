/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.tableData = [...forecastData];
        // add useful attributes
        for (let forecast of this.tableData) {
            forecast.isForecast = true;
            forecast.isExpanded = false;
        }
        this.pollData = pollData;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'mean_netpartymargin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winner_Rparty',
                alterFunc: d => +d
            },
        ]

        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);

        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {

        // PART 2 //
        let legendSelect = d3.select('#marginAxis')
            .attr('height', 50)
            .attr('width', 300);

        this.appendText(legendSelect, 'steelblue', '+75', -75)
        this.appendText(legendSelect, 'steelblue', '+50', -50)
        this.appendText(legendSelect, 'steelblue', '+25', -25)
        this.appendText(legendSelect, 'firebrick', '+75', 25)
        this.appendText(legendSelect, 'firebrick', '+50', 50)
        this.appendText(legendSelect, 'firebrick', '+75', 75)
    }

    appendText(container, color, text, location) {

        container.append("text")
            .attr("x", this.scaleX(location))
            .attr("y", 25)
            .text(text)
            .style("font-size", "15px")
            .style('fill', color);
    }

    drawTable() {

        this.updateHeaders();
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.selectAll('td').remove()

        rowSelection.on('click', (event, d) => {
            if (d.isForecast) {
                this.toggleRow(d, this.tableData.indexOf(d));
            }
        });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr('class', d => d.class);

        // PART 1 // 
        let vizSelection = forecastSelection.filter(d => d.type === 'viz');

        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight);

        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g');

        let selection = forecastSelection.filter(d => d.type === 'text');

        const textCells = selection.selectAll("tr")
            .data(d => [d])
            .join("text")
            .text(d => (d.value));

        this.addGridlines(grouperSelect.filter((d, i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
        this.addRectangles(grouperSelect.filter((d, i) => i === 1));
        this.addCircles(grouperSelect.filter((d, i) => i === 2));
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        };

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: -d.p90_netpartymargin,
                margin: d.isForecast ? -(+d.mean_netpartymargin) : d.margin,
                marginHigh: -d.p10_netpartymargin,
            }
        };

        let winChance;
        if (d.isForecast) {
            const trumpWinChance = +d.winner_Rparty;
            const bidenWinChance = +d.winner_Dparty;

            const trumpWin = trumpWinChance > bidenWinChance;
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100) {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        }
        else {
            winChance = { type: 'text', class: '', value: '' }
        }

        let dataList = [stateInfo, marginInfo, winChance];
        for (let point of dataList) {
            point.isForecast = d.isForecast;
        }
        return dataList;
    }

    updateHeaders() {

        // PART 7 // 
        //handled in attachSortHandlers()
    }

    addGridlines(containerSelect, ticks) {

        // PART 3 // 
        let lines = containerSelect.append('line')
            .data(ticks)
            .join('line')

        lines.attr("x1", d => this.scaleX(d))
            .attr("x2", d => this.scaleX(d))
            .attr("y2", 50)
            .style("stroke", "black")
            .style("stroke-width", 1);
    }

    addRectangles(containerSelect) {

        // PART 4 // 
        let blueSqaures = containerSelect.append('rect')
            .data(d => [d].filter(d => d.value.marginLow < 0))
            .attr('fill', 'steelblue')
            .attr('opacity', '.75')
            .attr('height', 20)

        let redSquares = containerSelect.append('rect')
            .data(d => [d].filter(d => d.value.marginLow > 0 || d.value.marginHigh > 0))
            .attr('fill', 'firebrick')
            .attr('opacity', '.75')
            .attr('height', 20)

        blueSqaures
            .attr('x', d => this.scaleX(d.value.marginLow))
            .attr('width', d => d.value.marginHigh < 0 ? this.scaleX(d.value.marginHigh) - this.scaleX(d.value.marginLow) : this.scaleX(0) - this.scaleX(d.value.marginLow))

        redSquares
            .attr('x', d => d.value.marginLow > 0 ? this.scaleX(d.value.marginLow) : this.scaleX(0))
            .attr('width', d => d.value.marginLow > 0 ? this.scaleX(d.value.marginHigh) - this.scaleX(d.value.marginLow) : this.scaleX(d.value.marginHigh) - this.scaleX(0))
    }

    addCircles(containerSelect) {

        // PART 5 // 
        let blueCircles = containerSelect.append('circle')
            .data(d => [d].filter(d => d.value.margin < 0 && d.isForecast !== undefined))
            .attr('fill', 'steelblue')
            .attr('stroke', 'black')
            .attr('stroke-width', 1.5)

        let redCircles = containerSelect.append('circle')
            .data(d => [d].filter(d => d.value.margin > 0 && d.isForecast !== undefined))
            .attr('fill', 'firebrick')
            .attr('stroke', 'black')
            .attr('stroke-width', 1.5)

        let bluePollCircles = containerSelect.append('circle')
            .data(d => [d].filter(d => d.value.margin < 0 && d.isForecast === undefined))
            .attr('fill', 'steelblue')

        let redPollCircles = containerSelect.append('circle')
            .data(d => [d].filter(d => d.value.margin > 0 && d.isForecast === undefined))
            .attr('fill', 'firebrick')

        redCircles
            .attr('cx', d => this.scaleX(d.value.margin))
            .attr('r', 5)
            .attr('cy', 10)

        blueCircles
            .attr('cx', d => this.scaleX(d.value.margin))
            .attr('r', 5)
            .attr('cy', 10)

        bluePollCircles
            .attr('cx', d => this.scaleX(d.value.margin))
            .attr('r', 2.5)
            .attr('cy', 10)

        redPollCircles
            .attr('cx', d => this.scaleX(d.value.margin))
            .attr('r', 2.5)
            .attr('cy', 10)
    }

    attachSortHandlers() {

        // PART 6 // 
        d3.selectAll('#columnHeaders').selectAll('th')
            .on('click', (d) => {
                var selection = d3.select(d.srcElement)
                this.collapseAll()

                selection.select('i')
                    .classed('no-display', true)

                var currentSelection = d3.selectAll('th').classed("sorting", false)
                currentSelection.select('i').classed('no-display', true)
                selection.classed("sorting", true)

                if (d['srcElement'].textContent === 'State ') {
                    if (this.headerData[0].ascending === true) {
                        this.tableData.sort((a, b) => a.state < b.state ? -1 : 1)
                        this.headerData[0].ascending = false

                        selection.select('i')
                            .classed('no-display', false)
                            .classed('fa-solid fa-sort-down', false)
                            .classed('fa-solid fa-sort-up', true)
                    }
                    else {
                        this.tableData.sort((a, b) => a.state < b.state ? 1 : -1)
                        this.headerData[0].ascending = true

                        selection.select('i')
                            .classed('no-display', false)
                            .classed('fa-solid fa-sort-down', true)
                            .classed('fa-solid fa-sort-up', false)
                    }
                    this.drawTable()
                }
                else if (d['srcElement'].textContent === 'Margin of Victory ') {
                    if (this.headerData[1].ascending === true) {
                        this.tableData.sort((a, b) => Math.abs(+a.mean_netpartymargin) < Math.abs(+b.mean_netpartymargin) ? -1 : 1)
                        this.headerData[1].ascending = false

                        selection.select('i')
                            .classed('no-display', false)
                            .classed('fa-solid fa-sort-down', false)
                            .classed('fa-solid fa-sort-up', true)
                    }
                    else {
                        this.tableData.sort((a, b) => Math.abs(+a.mean_netpartymargin) < Math.abs(+b.mean_netpartymargin) ? 1 : -1)
                        this.headerData[1].ascending = true

                        selection.select('i')
                            .classed('no-display', false)
                            .classed('fa-solid fa-sort-down', true)
                            .classed('fa-solid fa-sort-up', false)
                    }
                    this.drawTable()
                }

            })
    }




    toggleRow(rowData, index) {

        // PART 8 // 
        if (this.pollData.get(rowData.state) !== undefined) {

            var isInTable = this.tableData.filter(d => d.state === rowData.state && d.name !== undefined).length > 0
            if (rowData.isExpanded && isInTable) {
                rowData.isExpanded = false
                this.tableData.splice(++index, this.pollData.get(rowData.state).length)
            }
            else if (!rowData.isExpanded || !isInTable) {
                rowData.isExpanded = true
                this.pollData.get(rowData.state).forEach((d) => d !== undefined ? this.tableData.splice(++index, 0, d) : void (0))
            }
            this.drawTable()
        }
    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
    }

}
