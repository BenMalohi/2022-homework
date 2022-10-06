const globalApplicationState = {
    allData: [],
    groupedByTopic: false,
    tableState: null,
    chartState: null
  };

Promise.all([d3.json('./data/words.json')]).then( data =>
    {
        globalApplicationState.allData = data[0]        
        globalApplicationState.tableState = new Table(globalApplicationState)
        globalApplicationState.chartState = new Chart(globalApplicationState)    
    })

