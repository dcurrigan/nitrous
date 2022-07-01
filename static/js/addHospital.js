const url = "./static/data/Health_Hospitals_WA.geojson"
var inputValue = ""
var alert = []

window.onload = function() {
    document.getElementById('errorHosp').innerHTML = alert[0];
    document.getElementById('whatError').innerHTML = alert[1]
    console.log(alert[0].length)

    if ((alert[1] == 'already exists in the database') || (alert[1] == 'Please enter a hospital name')) {
        document.getElementById('failure').style.display = "block";
    } else {
        document.getElementById('failure').style.display = "none"
    }

    if (alert[1] == 'Please enter a hospital name') {
        document.getElementById('errorHosp').style.display = "none"
    } else {
        document.getElementById('errorHosp').style.display = "block"
    }
};


// Renders data on initial page load
function loadData(inputValue) {
    
    d3.json(url).then(function(data) {  
        
        hospitals = data.features.map(hospital => hospital['properties']['establishment_name']); // the hospital name 
        
        // Call the autocomplete function to fill with hospital data
        autocomplete(document.getElementById("inputHospital"), hospitals);
        
              
        // Add state and country to data
        for (let i = 0; i < data.features.length; i++) {
            data['features'][i]['properties']['state'] = 'WA';
            data['features'][i]['properties']['country'] = "Australia";
        }          
        
        hospital = inputValue
        

        // Check if entered hospital name is in existing list of hospitals
        // and populate the other location fields if match found
        for (let i = 0; i < data.features.length; i++) {
            
            if (data['features'][i]['properties']['establishment_name'] == hospital) {
                
                let properties = data['features'][i]['properties']
                let geometry = data['features'][i]['geometry']
                
                var fields = [["#inputStreet", "address"], ["#inputSuburb", 'suburb'], ["#inputPostcode", "postcode"],
                            ["#inputState", "state"], ["#inputCountry", "country"]]
                
                fields.forEach(e => {
                    $(e[0]).val(properties[e[1]]);
                });
            
                $("#inputLat").val(geometry['coordinates'][0])
                $("#inputLong").val(geometry['coordinates'][1])
            };
        };

    });

}

// Run loadData function of page load
loadData(inputValue)

// Detect submit button click, process, and send the data
d3.select("#submit-hosp").on("click", sendData)

function sendData(){

    hospName = [{inputValue}]
    console.log(document.getElementById('inputHospital').value)

    if (document.getElementById('inputHospital').value.length == 0) {
        document.getElementById('whatError').innerHTML = "Please enter a hospital name";
        document.getElementById('errorHosp').innerHTML = ""
        document.getElementById('failure').style.display = "block";
        scroll(0,0)
        
    } else {

        fetch(`/submitData/`, {
            method: "POST",
            body: JSON.stringify(hospName),
            cache: "no-cache",
            headers: new Headers({"content-type": "application/json"})
        })
        .then(response => { 
            console.log("This is what I got back")
            // console.log(response)
            response.json().then(json => {
                console.log(json)
                })
        }) 

    }

  
};




// Set the default date for manifold to today's date
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = dd + '/' + mm + '/' + yyyy;
d3.select("#date").property("value", today)



