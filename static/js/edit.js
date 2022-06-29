        
var hospital_table = "" 
var manifold_table = "" 
var purchase_table = ""    
eventSetting = "auto"
displaySetting = true  
        
        
// Fills the dropdown with hospitals currently in the database  
function fillSelect(data, manifold_data, purchase_data) {     
    // Save instance of the hospitals table and create a list of just hospital names
    hospital_table = data
    hospitals = data.map(row => row[0]); // the hospital name key
    hospitals.push("Select hospital to edit")

    // Save instance of the manifolds table for later use
    manifold_table = manifold_data

    // Save instance of the purchases table for later use
    purchase_table = purchase_data

    // Add the hospital names to the dropdown 
    d3.select("#selDataset")
    .selectAll('myOptions')
    .data(hospitals)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the dropdown
    .attr("value", function (d) { return d; }) // corresponding value returned by the dropdown
    .style("padding-bottom","100px")
    .style("padding-top","100px")

    // Set the default value of the drop down to first item in subject_ids list
    d3.select("#selDataset").property("value", "Select hospital to edit");

    var myFieldset = document.getElementById("myFieldset");
    document.querySelector("table.table td a.edit").style.pointerEvents="none";
    document.querySelector("table.table td a.delete").style.pointerEvents="none";
    document.querySelector("#purchaseTable td a.edit").style.pointerEvents="none";
    document.querySelector("#purchaseTable td a.delete").style.pointerEvents="none";
    myFieldset.disabled = true;

};


function updateData() {
    
    hospitalName = d3.select("#selDataset").property("value")
    
    // Filter to just this hospitals data
    hospitalData = hospital_table.filter(d => d[0] == hospitalName)
    hospitalData = hospitalData[0]

    // Filter to just this hospitals manifolds
    manifoldData = manifold_table.filter(d => d[0] == hospitalName)

    // Filter to just this hospitals purchases
    purchaseData = purchase_table.filter(d => d[0] == hospitalName)

    let eventSetting = "auto"
    let displaySetting = true  
    
    if (d3.select("#selDataset").property("value") == "Select hospital to edit") {
        eventSetting = "none"
        displaySetting = true
    } else {
        eventSetting = "auto"
        displaySetting = false
    }
    
    if (manifoldData.length == 0) {

        // Clear the purchase table
        $('#manifoldTable tr:gt(0)').remove()

        $('#manifoldTable tbody').after(`
        <tr>
          <td class="date-cell">dd/mm/yyyy</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>
              <a class="add" title="Add" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
              <a class="edit" title="Edit" data-toggle="tooltip"><i class="material-icons">&#xE254;</i></a>
              <a class="delete" title="Delete" data-toggle="tooltip"><i class="material-icons">&#xE872;</i></a>
          </td>
        </tr>
        `);
    }
    
    if (purchaseData.length == 0) {

        // Clear the purchase table
        $('#purchaseTable tr:gt(0)').remove()

        $('#purchaseTable tbody').after(`
        <tr>
          <td class="date-cell">dd/mm/yyyy</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>
              <a class="add" title="Add" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
              <a class="edit" title="Edit" data-toggle="tooltip"><i class="material-icons">&#xE254;</i></a>
              <a class="delete" title="Delete" data-toggle="tooltip"><i class="material-icons">&#xE872;</i></a>
          </td>
        </tr>
        `);
    }

    // Activate the form if hospital selected
    var myFieldset = document.getElementById("myFieldset");
    document.querySelector("table.table td a.edit").style.pointerEvents=eventSetting;
    document.querySelector("table.table td a.delete").style.pointerEvents=eventSetting;
    document.querySelector("#purchaseTable td a.edit").style.pointerEvents=eventSetting;
    document.querySelector("#purchaseTable td a.delete").style.pointerEvents=eventSetting;
    myFieldset.disabled = displaySetting;
    
    // Fill the location data for selected hospital 
    d3.select("#inputStreet").property("value", hospitalData[1]);
    d3.select("#inputSuburb").property("value", hospitalData[2]);
    d3.select("#inputPostcode").property("value", hospitalData[3]);
    d3.select("#inputState").property("value", hospitalData[4]);
    d3.select("#inputCountry").property("value", hospitalData[5]);
    d3.select("#inputLat").property("value", hospitalData[6]);
    d3.select("#inputLong").property("value", hospitalData[7]);

    // Update radioboxes
    if (hospitalData[8] == "public") {
        d3.select("#publicRadio").property("checked", "checked");
    } else if (hospitalData[8] == "private"){
        d3.select("#privateRadio").property("checked", "checked");
    } else {
        d3.select("#mixedRadio").property("checked", "checked");
    }

    if (hospitalData[9] == "metro") {
        d3.select("#metroRadio").property("checked", "checked");
    } else {
        d3.select("#regionalRadio").property("checked", "checked");
    }

    if (hospitalData[9] == "metro") {
        d3.select("#metroRadio").property("checked", "checked");
    } else {
        d3.select("#regionalRadio").property("checked", "checked");
    }

    if (hospitalData[16] == "yes") {
        d3.select("#available").property("checked", "checked");
    } else {
        d3.select("#not_available").property("checked", "checked");
    }

    if (hospitalData[17] == "yes") {
        d3.select("#shows").property("checked", "checked");
    } else {
        d3.select("#doesnt_show").property("checked", "checked");
    }

    // Update case-mix
    d3.select("#adultInput").property("value", hospitalData[10]);
    d3.select("#obstetricInput").property("value", hospitalData[11]);
    d3.select("#paedsInput").property("value", hospitalData[12]);
    d3.select("#burnsInput").property("value", hospitalData[13]);
    
    // Clear the manifold table
    $('#manifoldTable tr:gt(0)').remove()
    
    // Append manifold data for selected hospital
    for (let i = 0; i < manifoldData.length; i++) {
                
        $('#manifoldTable tr:last').after(`
                                          <tr>
                                            <td class="date-cell">${manifoldData[i][4]}</td>
                                            <td>${manifoldData[i][1]}</td>
                                            <td>${manifoldData[i][2]}</td>
                                            <td>${manifoldData[i][3]}</td>
                                            <td>
                                                <a class="add" title="Add" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
                                                <a class="edit" title="Edit" data-toggle="tooltip"><i class="material-icons">&#xE254;</i></a>
                                                <a class="delete" title="Delete" data-toggle="tooltip"><i class="material-icons">&#xE872;</i></a>
                                            </td>
                                          </tr>
                                          `);
    };

    // Clear the purchase table
    $('#purchaseTable tr:gt(0)').remove()

    // Append purchase data for selected hospital
    for (let i = 0; i < purchaseData.length; i++) {
                
        $('#purchaseTable tr:last').after(`
                                          <tr>
                                            <td class="date-cell">${purchaseData[i][7]}</td>
                                            <td>${purchaseData[i][1]}</td>
                                            <td>${purchaseData[i][2]}</td>
                                            <td>${purchaseData[i][3]}</td>
                                            <td>${purchaseData[i][4]}</td>
                                            <td>${purchaseData[i][5]}</td>
                                            <td>${purchaseData[i][6]}</td>
                                            <td>
                                                <a class="add" title="Add" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
                                                <a class="edit" title="Edit" data-toggle="tooltip"><i class="material-icons">&#xE254;</i></a>
                                                <a class="delete" title="Delete" data-toggle="tooltip"><i class="material-icons">&#xE872;</i></a>
                                            </td>
                                          </tr>
                                          `);
    };
};

// Control of the tables 
$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip();
	var actions = $("table td:last-child").html();
	
    // Append table with add row form on add new button click
    $(".add-new").click(function(){
		$(this).attr("disabled", "disabled");
		
        if (($(this).is('#addManifold'))) {
            var row = `
                        <tr>
                        <td class="date-cell"><input type="text" class="datepicker" placeholder="dd/mm/yy" name="date" id="date"></td>
                            <td><input type="number" class="form-control" name="cylinder_f8" id="cylinder_f8"></td>
                            <td><input type="number" class="form-control" name="cylinder_f9" id="cylinder_f9"></td>
                            <td><input type="number" class="form-control" name="cylinder_g" id="cylinder_g"></td>
                            <td>${actions}</td>
                        </tr>`;
            $("#manifoldTable").append(row)
            $("#manifoldTable tr:last").find(".add, .edit").toggle();
            $('[data-toggle="tooltip"]').tooltip();
            $("#manifoldTable tr:last").find(".delete, .edit").css("pointer-events","auto");
        } else {
            var row = `
                        <tr>
                            <td class="date-cell"><input type="text" class="datepicker" placeholder="dd/mm/yy" name="date" id="date"></td>
                            <td><input type="number" class="form-control" name="cylinder_c" id="cylinder_c"></td>
                            <td><input type="number" class="form-control" name="cylinder_d" id="cylinder_d"></td>
                            <td><input type="number" class="form-control" name="cylinder_e" id="cylinder_e"></td>
                            <td><input type="number" class="form-control" name="cylinder_f8" id="cylinder_f8"></td>
                            <td><input type="number" class="form-control" name="cylinder_f9" id="cylinder_f9"></td>
                            <td><input type="number" class="form-control" name="cylinder_g" id="cylinder_g"></td>
                            <td>${actions}</td>
                        </tr>`;
            $("#purchaseTable").append(row)
            $("#purchaseTable tr:last").find(".add, .edit").toggle();
            $('[data-toggle="tooltip"]').tooltip();
            $("#purchaseTable tr:last").find(".delete, .edit").css("pointer-events","auto");
        };

        var dt = $(".datepicker");

        dt.datepicker({
            format: 'dd/mm/yyyy'
        });

    });
	// Add row on add button click
	$(document).on("click", ".add", function(){
		var empty = false;
		var input = $(this).parents("tr").find('input');
        input.each(function(){
			if(!$(this).val()){
				$(this).addClass("error");
				empty = true;
			} else{
                $(this).removeClass("error");
            }
		});
		$(this).parents("tr").find(".error").first().focus();
		if(!empty){
            input.each(function(){
                $(this).parent("td").html($(this).val());
			});			
			$(this).parents("tr").find(".add, .edit").toggle();
			$(".add-new").removeAttr("disabled");
		}		
    });
	// Edit row on edit button click
	$(document).on("click", ".edit", function(){		
        $(this).parents("tr").find("td:not(:last-child)").each(function(){
            if ($(this).hasClass('date-cell')) {
                $(this).html('<input type="text" class="datepicker" value="' + $(this).text() + '">');

            } else {
                $(this).html('<input type="number" class="form-control" value="' + $(this).text() + '">');
            }
            
        });
        $(this).parents("tr").find(".datepicker").on('click', function() {
            $(this).datepicker({
                format: 'dd/mm/yyyy'
            });
            $(this).datepicker('show')
        });
		$(this).parents("tr").find(".add, .edit").toggle();
		$(".add-new").attr("disabled", "disabled");
    });
	// Delete row on delete button click
	$(document).on("click", ".delete", function(){
        $(this).parents("tr").remove();
		$(".add-new").removeAttr("disabled");
    });

    // Event listening for submit button
    $(document).on('click', '#update-hosp', collateData) 
});


// Fadeout styling for the success div
function fadeOutEffect() {
    var fadeTarget = document.getElementById("success");
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
        }
    }, 300);
}

// Collate data from the form and tables for sending to DB
function collateData() {
    
    var hospitalName = d3.select("#selDataset").property("value")

    var data = []

    data[0] = {
        name: hospitalName,
        address: d3.select("#inputStreet").property("value"),
        suburb: d3.select("#inputSuburb").property("value"),
        postcode: d3.select("#inputPostcode").property("value"),
        state: d3.select("#inputState").property("value"),
        country: d3.select("#inputCountry").property("value"),
        lat: d3.select("#inputLat").property("value"),
        long: d3.select("#inputLong").property("value"),
        hosp_type: d3.select('input[name="gridRadios1"]:checked').node().value,
        region: d3.select('input[name="gridRadios2"]:checked').node().value,
        cases_adult: d3.select('#adultInput').property("value"),
        cases_obs: d3.select('#obstetricInput').property("value"),
        cases_paed: d3.select('#paedsInput').property("value"),
        cases_burns: d3.select('#burnsInput').property("value"),
        supplier: d3.select('input[name="gridRadios3"]:checked').node().value,
        maintenance: d3.select('input[name="gridRadios4"]:checked').node().value,
        diagram: d3.select('input[name="gridRadios5"]:checked').node().value,
        outlets: d3.select('input[name="gridRadios6"]:checked').node().value
    }
    data[1] = []
    // Retrieve the manifold table data
    $('#manifoldTable tr').each(function(index, tr) {
        var tds = $(tr).find('td');

        if (tds.length > 1) {           
            
            var current_row = {
                name: hospitalName,
                cylinder_f8: tds[1].innerText,
                cylinder_f9: tds[2].innerText,
                cylinder_g: tds[3].innerText,
                date: tds[0].innerText,
            };
            
            data[1].push(current_row)
        };
    });

    data[2] = []
    // Retrieve the purchase table data
    $('#purchaseTable tr').each(function(index, tr) {
        var tds = $(tr).find('td');

        if (tds.length > 1) {
            var total = ((parseInt(tds[1].innerText) * 1.75) + 
                        (parseInt(tds[2].innerText) * 6.6) +
                        (parseInt(tds[3].innerText) * 16.8) +
                        (parseInt(tds[4].innerText) * 233) +
                        (parseInt(tds[5].innerText) * 223) +
                        (parseInt(tds[6].innerText) * 36.6))
            
            var current_row = {
                name: hospitalName,
                cylinder_c: tds[1].innerText,
                cylinder_d: tds[2].innerText,
                cylinder_e: tds[3].innerText,
                cylinder_f8: tds[4].innerText,
                cylinder_f9: tds[5].innerText,
                cylinder_g: tds[6].innerText,
                date: tds[0].innerText,
                total: total 
            };

            data[2].push(current_row)
        };
    });

    // Send the collated data on to the data transfer function
    sendData(data)
}

function sendData(data) {
    
    fetch(`/submitEdit`, {
        method: "POST",
        body: JSON.stringify(data),
        cache: "no-cache",
        headers: new Headers({"content-type": "application/json"})
    })
    .then(response => { 
        // Update the table data
        response.json().then(json => {
            hospital_table = json[0][0]
            manifold_table = json[0][1]
            purchase_table = json[0][2]
            })

        $('#success').css('opacity', 1)
        fadeOutEffect() 
    })   

};
