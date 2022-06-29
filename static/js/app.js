// Select the hospital selection dropdown menu
var dropDown = d3.select("#selDataset")

// Define the location of the dataset
const url = '/static/data/dummy_data.csv';

// Trigger an update of the dashboard when the dropdown selection is changed
d3.selectAll("#selDataset").on("change", optionChanged);

// Renders data on initial page load
function loadData() {
    // Fetch the CSV data from dummy_data.csv
    d3.csv(url).then(function(data) {
            
        // Get unique hospital names
        hospitals = d3.map(data, function(d){return d.hospital;}).keys()
        
        // Add the hospitals to the dropdown 
        d3.select("#selDataset")
        .selectAll('myOptions')
        .data(hospitals)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text shown in the dropdown
        .attr("value", function (d) { return d; }) // corresponding value returned by the dropdown
        .style("padding-bottom","100px")
        .style("padding-top","100px")
        
        // Set the default value of the drop down to first item in subject_ids list
        d3.select("#selDataset").property("value", hospitals[1])
        
        // Run optionChanged to fill the page with data for the first item in the dropdown
        optionChanged()
    });

    
};

// Renders data for the currently selected hospital
function optionChanged() {   

    // Get which subject is currently selected
    var selected = dropDown.property("value");
        
    // Fetch the JSON data from samples.json
    d3.csv(url).then(function(data) {
     
        // Filter by hospital
        hospital_data = data.filter(hospital => hospital.hospital == selected);
        
        // Convert dates to datetime objects
        hospital_data.forEach(function(d){
            let parts = d.date.split('/');
            let the_date = new Date(parts[2], parts[1]-1, parts[0])
            d.date = the_date
        })

        // Sort data in date order
        function compare(a, b) {
            if ( a.date < b.date ){
              return -1;
            }
            if ( a.date > b.date ){
              return 1;
            }
            return 0;
          }
        hospital_data.sort(compare);
        
        // HOSPITAL INFO TABLE //
        ///////////////////////
        
        // data for currently selected hospital
        hospital_name = selected;
        num_purchases = hospital_data.length;
        hospital_class = d3.map(hospital_data, function(d){return d.class;}).keys()[0];
        purchase_avg = d3.mean(hospital_data, d => d.amount).toFixed(2);

        hospital_summary = {
              "Name": hospital_name,
              "Class": hospital_class,
              "Number of Purchases": num_purchases,
              "Average Purchase": purchase_avg
            }
        
        // clear the demographics box
        d3.select("#hospital-data").html("")
        
        // fill with data for the currently selected hospital
        Object.entries(hospital_summary).forEach(function([key, value]) {
            return d3.select('#hospital-data')
                     .append()
                     .html(key + ": " + "<p class='test'>" + value + "</p><br>" )
                     .style("font-size","14px")
                     .style("font-weight",function(d,i) {return i*600+600;})
        }) 
        

        //     BAR GRAPH      //
        ///////////////////////

        function unpack(rows, key) {
            return rows.map(function(row) { return row[key]; });
          }
        

        var trace = {
            x: unpack(hospital_data, 'date'),
            y: unpack(hospital_data, 'amount'),
            type: 'bar',
            marker: {
                color: '#4f698a',
                opacity: 0.6,
                line: {
                  color: '#337ab7',
                  width: 10
                }
              }
        }

        var data = [trace]

        var layout = {
            title: "<b>N<sub>2</sub>0 Purchases</b>",
            barmode: "stack",
            bargap:0,       
            margin: {
              l: 100,
              r: 100,
              t: 60,
              b: 50
            },
            xaxis: {title: "Date"},
            yaxis: {title: "kg N<sub>2</sub>0 Purchased"}
        }
        
        Plotly.newPlot("bar", data, layout)



        //    LINE CHART    //
        ///////////////////////

        let lastDate = 0
        consumptionRate = hospital_data.map(function(d) {
          if (lastDate != 0) {
             let difference = d.date.getTime() - lastDate.getTime();
             let TotalDays = Math.ceil(difference / (1000 * 3600 * 24)); 
             lastDate = d.date
             return (d.amount / TotalDays).toFixed(2)
          }
          else {
            lastDate = d.date
            return 0
          }
        });

        var trace1 = {
          x: unpack(hospital_data, 'date'),
          y: consumptionRate,
          type: 'scatter',
          mode: 'lines+markers',
          line: {shape: 'linear'},
          name: 'N<sub>2</sub>O Consumption Rate'
        };
        
        var trace2 = {
          x: [unpack(hospital_data, 'date')[0], unpack(hospital_data, 'date').at(-1)],
          y: [100, 100],
          type: 'scatter',
          mode: 'lines',
          line: {color: 'rgb(219, 64, 82)',
                 shape: 'linear',
                dash: 'dash'},
          name: 'State Average'
        };

        var trace3 = {
          x: [unpack(hospital_data, 'date')[0], unpack(hospital_data, 'date').at(-1)],
          y: [200, 200],
          type: 'scatter',
          mode: 'lines',
          line: {color: 'rgba(102,194,165,1)',
                 shape: 'linear',
                 dash: 'dash'},
          name: 'Class Average'
        };
        
        
        var data = [trace1, trace2, trace3];


        var layout = {
          title: '<b>Consumption Rate (kg N<sub>2</sub>0/day)</b>',
          showlegend: true,
          height: 600,
          width: 1300,
          xaxis: {title: "Date"},
          yaxis: {title: "kg N<sub>2</sub>0/day"},
          shapes: [{
            type: 'line',
            x0: unpack(hospital_data, 'date')[0], // First date
            y0: 200,
            x1: unpack(hospital_data, 'date').at(-1), //Last date
            y1: 200, // Last date
            line: {
              color: 'rgb(50, 171, 96)',
              width: 2,
              dash: 'dash'
            },
            name: "test"}]
        };
        
        Plotly.newPlot('line', data, layout);
                  

    });


    
}

//  Load data on initial page load
loadData()


