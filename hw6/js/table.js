class Table {
    /**
     * Creates a Table Object
     */
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState
        this.tableData = globalApplicationState.allData

        this.headerData = [
            {
                sorted: false,
                ascending: false,
            },
            {
                sorted: false,
                ascending: false,
            },
        ]

        this.setupScales();
        this.drawLegend();
        this.drawTable();
        this.attachSortHandlers();

        d3.select('#showExtremes')
        .on('click', () => {
            this.overlay()
            document.getElementById("overlay").style.display = "block";

        })

    d3.select('#overlay')
        .on('click', () => {
            document.getElementById("overlay").style.display = "none";
        })
    }

    overlay() {
        let overlaySelect = d3.select('#overlaySelect')

        overlaySelect.selectAll('circle').remove()

        let demExtreme = overlaySelect.append('circle')
            .attr('fill', 'blue')
            .attr('r', 20)

        let repExtreme = overlaySelect.append('circle')
            .attr('fill', 'red')
            .attr('r', 20)

        if (globalApplicationState.groupedByTopic) {

            demExtreme
                .attr('cx', 30)
                .attr('cy', 360)

            repExtreme
                .attr('cx', 880)
                .attr('cy', 490)
        }
        else {

            demExtreme
                .attr('cx', 30)
                .attr('cy', 230)

            repExtreme
                .attr('cx', 880)
                .attr('cy', 230)
        }
    }

    updateTable(updatedData) {
        //console.log(updatedData)
        this.tableData = updatedData
        this.drawTable()

    }

    setupScales() {
        this.frequencyScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, 200]);

        this.percentagesScale = d3.scaleLinear()
            .domain([-115, 115])
            .range([0, 250]);

        this.colorScale = d3.scaleOrdinal()
            .domain([...new Set(this.tableData.map(d => d.category))])
            .range(d3.schemeSet2);
    }

    drawLegend() {
        let frequencySelect = d3.select('#frequencyAxis').attr('height', 25).attr('width', 200)

        let percentagesSelect = d3.select('#percentagesAxis').attr('height', 25).attr('width', 250)

        frequencySelect.append("text").attr("x", this.frequencyScale(0)).attr("y", 10).text("0.0").style("font-size", "15px").style('text-anchor', 'middle').style("font-weight", 500)
        frequencySelect.append("text").attr("x", this.frequencyScale(.5)).attr("y", 10).text("0.5").style("font-size", "15px").style('text-anchor', 'middle').style("font-weight", 500)
        frequencySelect.append("text").attr("x", this.frequencyScale(1)).attr("y", 10).text("1.0").style("font-size", "15px").style('text-anchor', 'middle').style("font-weight", 500)


        percentagesSelect.append("text").attr("x", this.percentagesScale(-100)).attr("y", 10).text("100").style("font-size", "15px").style('text-anchor', 'middle').style("font-weight", 500)
        percentagesSelect.append("text").attr("x", this.percentagesScale(-50)).attr("y", 10).text("50").style("font-size", "15px").style('text-anchor', 'middle').style("font-weight", 500)
        percentagesSelect.append("text").attr("x", this.percentagesScale(0)).attr("y", 10).text("0").style("font-size", "15px").style('text-anchor', 'middle').style("font-weight", 500)
        percentagesSelect.append("text").attr("x", this.percentagesScale(50)).attr("y", 10).text("50").style("font-size", "15px").style('text-anchor', 'middle').style("font-weight", 500)
        percentagesSelect.append("text").attr("x", this.percentagesScale(100)).attr("y", 10).text("100").style("font-size", "15px").style('text-anchor', 'middle').style("font-weight", 500)
    }


    drawTable() {

        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.selectAll('td')
            .remove()
        let tableDataSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')

        let vizSelection = tableDataSelection.filter(d => d.type === 'viz');

        let selection = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', 250)
            .attr('height', 30);

        let textSelection = tableDataSelection.filter(d => d.type === 'text')

        textSelection.selectAll("tr")
            .data(d => [d])
            .join("text")
            .text(d => (d.value))

        this.addRectangles(selection);

        d3.select('#overlay')
            .append('svg')
            .attr('id', 'overlaySelect')
            .attr('height', 1000)
            .attr('width', 1000)



    }

    rowToCellDataTransform(d) {
        let phrase = { type: 'text', value: d.phrase };

        let frequency = { type: 'viz', group: 'frequency', category: d.category, frequency: parseFloat((d.total / 50)) };

        let percentage = { type: 'viz', group: 'percentages', dPercent: d.percent_of_d_speeches, rPercent: d.percent_of_r_speeches };

        let total = { type: 'text', value: d.total }

        return [phrase, frequency, percentage, total];
    }

    addRectangles(containerSelect) {

        containerSelect.append('rect')
            .data(d => [d].filter(d => d.group === 'percentages'))
            .join('rect')
            .attr('x', d => this.percentagesScale(0) - d.dPercent)
            .attr('width', d => d.dPercent)
            .attr('height', 20)
            .attr('fill', 'steelblue')

        containerSelect.append('rect')
            .data(d => [d].filter(d => d.group === 'percentages'))
            .join('rect')
            .attr('x', d => this.percentagesScale(0))
            .attr('width', d => d.rPercent)
            .attr('height', 20)
            .attr('fill', 'firebrick')

        containerSelect.append('rect')
            .data(d => [d].filter(d => d.group === 'frequency'))
            .join('rect')
            .attr('x', this.frequencyScale(0) + 25)
            .attr('fill', d => this.colorScale(d.category))
            .attr('width', d => this.frequencyScale(d.frequency))
            .attr('height', 20)
    }

    attachSortHandlers() {

        d3.selectAll('#columnHeaders').selectAll('th')
            .on('click', (d) => {
                d3.selectAll('.sorting').classed("sorting", false)
                
                var selection = d3.select(d.srcElement)
                selection.classed("sorting", true)

                if (selection['_groups'][0][0].id === 'h1') {
                    if (!this.headerData[0].ascending) {
                        this.tableData.sort((a, b) => a.phrase < b.phrase ? 1 : -1)
                    }
                    else {
                        this.tableData.sort((a, b) => a.phrase < b.phrase ? -1 : 1)
                    }
                    this.headerData[0].ascending = !this.headerData[0].ascending
                }
                else {
                    if (!this.headerData[1].ascending) {
                        this.tableData.sort((a, b) => a.total / 10 < b.total / 10 ? 1 : -1)
                    }
                    else {
                        this.tableData.sort((a, b) => a.total / 10 < b.total / 10 ? -1 : 1)
                    }
                    this.headerData[1].ascending = !this.headerData[1].ascending
                }
                this.drawTable()
            })
    }
}

