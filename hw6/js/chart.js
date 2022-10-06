class Chart {

    constructor(globalApplicationState) {

        this.globalApplicationState = globalApplicationState
        this.vizWidth = 900
        this.vizHeight = { large: 750, small: 150 }
        this.currentVizHeight = this.vizHeight.small
        this.tableData = globalApplicationState.allData

        this.setupScales()

        d3.select("#chart")
            .append("svg")
            .attr("width", this.vizWidth)
            .attr("height", 50)
            .attr("id", "axisSvg")

        this.svg = d3.select("#chart")
            .append("svg")
            .attr("width", this.vizWidth)
            .attr("height", this.currentVizHeight)
            .attr("id", "mainSvg")

        this.brush()
        this.addLegend()
        this.addCircles()
    }

    brush() {
        //const svg = this.svg         
        var height = 120
        var width = 900

        const g1 = this.svg.append('g').attr('transform', 'translate(0,0)').attr('class', 'oned-brushes').attr('id', 'economy/fiscal issues')
        const g2 = this.svg.append('g').attr('transform', 'translate(0,' + (height + 10) + ')').attr('class', 'oned-brushes').attr('id', 'energy/environment');
        const g3 = this.svg.append('g').attr('transform', 'translate(0,' + (height * 2 + 20) + ')').attr('class', 'oned-brushes').attr('id', 'crime/justice');
        const g4 = this.svg.append('g').attr('transform', 'translate(0,' + (height * 3 + 30) + ')').attr('class', 'oned-brushes').attr('id', 'education');
        const g5 = this.svg.append('g').attr('transform', 'translate(0,' + (height * 4 + 40) + ')').attr('class', 'oned-brushes').attr('id', 'health care');
        const g6 = this.svg.append('g').attr('transform', 'translate(0,' + (height * 5 + 50) + ')').attr('class', 'oned-brushes').attr('id', 'mental health/substance abuse');
        g1.append('rect').attr('height', height).attr('width', width).attr('fill', 'none')//.attr('stroke', 'red');
        g2.append('rect').attr('height', height).attr('width', width).attr('fill', 'none')//.attr('stroke', 'red');
        g3.append('rect').attr('height', height).attr('width', width).attr('fill', 'none')//.attr('stroke', 'red');
        g4.append('rect').attr('height', height).attr('width', width).attr('fill', 'none')//.attr('stroke', 'red');
        g5.append('rect').attr('height', height).attr('width', width).attr('fill', 'none')//.attr('stroke', 'red');
        g6.append('rect').attr('height', height).attr('width', width).attr('fill', 'none')//.attr('stroke', 'red');

        const brushGroups = this.svg.selectAll('.oned-brushes')
        let activeBrush = null
        let activeBrushNode = null

        // We loop through the g elements, and attach brush for each g
        brushGroups.each(function () {
            const selection = d3.select(this)
            const brush = d3.brushX()
                // This defines how far and wide the brush goes
                .extent([[0, 0], [width, height]])
                .on('start', function () {
                    // if there is an active brush, and that is not on the current g
                    if (activeBrush && selection != activeBrushNode) {
                        // we remove that brush on the other g element
                        activeBrushNode.call(activeBrush.move, null)
                    }
                    activeBrush = brush
                    activeBrushNode = selection

                })
                .on('start brush end', brushed)

            selection.call(brush)

            return selection
        })

        var colorScale = this.colorScale
        d3.select('#chart').selectAll('.oned-brushes')
            .on('click', function (d) {     
                //console.log('click')
                d3.select('#chart').selectAll('circle')
                    .style('fill', d => colorScale(d.category))
                    
                globalApplicationState.tableState.updateTable(globalApplicationState.allData)
            })

        function brushed({ selection }) {
            let value = [];

            d3.select('#chart').selectAll('circle')
                .style('fill', 'black')

            // first we reset all circles
            const circles = d3.select('#chart').selectAll('circle')

            if (selection) {
                //selection is made with two array pairs to indicate the upper left and lower right corner of the brush, e.g.,[[10,20],[50,60]]
                //this syntax will give name of the values x0, y0, x1, y1
                const [x0, x1] = selection;

                // we apply the filter to find the dots that are inside the brush
                console.log(!globalApplicationState.groupedByTopic)
                if (globalApplicationState.groupedByTopic) {
                    value = circles.filter(d => x0 <= d.moveX 
                        && d.moveX < x1 
                        && d.category === this.id)
                        .style("fill", "steelblue")
                        //.data returns the data of selection(filtered)
                        .data();
                }
                else {
                    value = circles.filter(d => x0 <= d.moveX 
                        && d.moveX < x1)
                        .style("fill", "steelblue")
                        //.data returns the data of selection(filtered)
                        .data();

                }
                globalApplicationState.tableState.updateTable(value)
            }          
        }
        
    }

    setupScales() {

        this.categories = [
            {
                category: "economy/fiscal issues",
                yLocation: 20
            },
            {
                category: "energy/environment",
                yLocation: 155
            },
            {
                category: "crime/justice",
                yLocation: 290
            },
            {
                category: "education",
                yLocation: 425
            },
            {
                category: "health care",
                yLocation: 560
            },
            {
                category: "mental health/substance abuse",
                yLocation: 695
            }
        ]

        this.colorScale = d3.scaleOrdinal()
            .domain(this.categories.map((d) => {
                return d.category
            }))
            .range(d3.schemeSet2);

        var totals = d3.extent(this.tableData.map(d => +d.total))

        this.sizeScale = d3.scaleLinear()
            .domain(totals)
            .range([3, 12])

        this.scaleX = d3.scaleLinear()
            .domain([-55, 55])
            .range([0, 900]);
    }

    update() {

        if (globalApplicationState.groupedByTopic) {
            this.svg.transition()
                .attr("height", this.currentVizHeight);

            this.svg.selectAll('circle')
                .transition().duration(1000)
                .attr('cy', d => d.moveY + 60)
                .attr('cx', d => d.moveX);

            this.svg.selectAll('line')
                .transition().duration(1000)
                .attr("y2", this.visHeight);

            this.svg.selectAll('text')
                .transition().duration(1000)
                .attr("y", d => d.yLocation);
        }
        else {
            this.svg.transition().delay(1000)
                .attr("height", this.currentVizHeight);

            this.svg.selectAll('circle')
                .transition().duration(1000)
                .attr('cy', d => d.sourceY + 60)
                .attr('cx', d => d.sourceX);

            this.svg.selectAll('line')
                .transition()
                .duration(1000)
                .attr("y2", this.visHeight);

            this.svg.selectAll('text')
                .transition()
                .duration(1000)
                .attr("y", -20);
        }
    }

    addLegend() {

        let axisSelect = d3.selectAll('#axisSvg')
            .attr('height', 50)
            .attr('width', 900)

        axisSelect.append("text").attr("x", this.scaleX(-50)).attr("y", 50).text("50").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(-40)).attr("y", 50).text("40").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(-30)).attr("y", 50).text("30").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(-20)).attr("y", 50).text("20").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(-10)).attr("y", 50).text("10").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(0)).attr("y", 50).text("0").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(10)).attr("y", 50).text("10").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(20)).attr("y", 50).text("20").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(30)).attr("y", 50).text("30").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(40)).attr("y", 50).text("40").style("font-size", "15px")
        axisSelect.append("text").attr("x", this.scaleX(50)).attr("y", 50).text("50").style("font-size", "15px")

        axisSelect.append("text")
            .attr("x", this.scaleX(-45))
            .attr("y", 15)
            .text("Democratic Leaning")
            .style("font-size", "15px")
            .style('text-anchor', 'middle')
            .attr('font-weight', '900')
        axisSelect.append("text")
            .attr("x", this.scaleX(45))
            .attr("y", 15)
            .text("Republican Leaning")
            .style("font-size", "15px")
            .style('text-anchor', 'middle')
            .attr('font-weight', '900')

        this.svg.selectAll('text')
            .data(this.categories)
            .enter()
            .append('text')
            .attr("x", 25)
            .transition()
            .text(d => d.category)
            .attr("y", -20)
            .style('fill', ' black')
            .style("font-size", "15px")
            .style('text-anchor', 'left')

        axisSelect.selectAll('line')
            .append('line')
            .data([-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50])
            .join('line')
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("x1", d => this.scaleX(d))
            .attr("y1", 20)
            .attr("x2", d => this.scaleX(d))
            .attr("y2", 30);
    }

    addCircles() {

        var circle = this.svg.selectAll('circle')
            .data(this.tableData)
            .enter()
            .append('circle')
            .attr('cx', d => d.sourceX)
            .attr('cy', d => d.sourceY + 60)
            .attr('r', d => this.sizeScale(d.total))
            .attr('fill', d => this.colorScale(d.category))
            .attr('stroke', 'black')

        this.attachHandlers(circle)
    }

    attachHandlers(containerSelect) {

        var tooltip = d3.select("body")
            .append("div")
            .style('background-color', 'white')
            .style("border", "solid")
            .style("border-color", "black")
            .style("position", "absolute")
            .style("visibility", "hidden")

        containerSelect
            .on("mouseover", function (event, d) {
                var pol_diff = Math.abs(Math.round(d.position * 100) / 100)
                var n_gram = d.phrase.charAt(0).toUpperCase() + d.phrase.slice(1)
                var n_gram_use = parseFloat((d.total / 50) * 100).toFixed(0)
                d.position < 0 ? pol_diff = 'D+ ' + pol_diff : pol_diff = 'R+ ' + pol_diff

                tooltip
                    .style("visibility", "visible")
                    .html('<p>' + n_gram + '</p>' +
                        '<p>' + pol_diff + '% </p>' +
                        '<p>In ' + n_gram_use + '% of speeches</p>');
            })
            .on("mousemove", function (event, d) {
                tooltip
                    .style("top", (event.pageY + 25) + "px")
                    .style("left", (event.pageX + 25) + "px");
            })
            .on("mouseout", function () {
                tooltip
                    .style("visibility", "hidden");
            });

        d3.select('.switch').on("change", (d) => {
            globalApplicationState.groupedByTopic ?
                this.currentVizHeight = this.vizHeight.small :
                this.currentVizHeight = this.vizHeight.large

            globalApplicationState.groupedByTopic = !globalApplicationState.groupedByTopic
            this.update()
        })
    }
}