var hospital_table = "" 
var purchase_table = ""
        
        
// Fills the dropdown with hospitals currently in the database  
function fillSelect(data, purchase_data) {     
    
    // Save instance of the hospitals table and create a list of just hospital names
    hospital_table = data
    hospitals = data.map(row => row[0]); // the hospital name key
    hospitals.push("Select hospital to edit")

    // Save instance of the manifolds table for later use
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
    myFieldset.disabled = true;

};


function updateHosp() {
    
    let displaySetting = true
    var purchaseData
    hospitalName = d3.select("#selDataset").property("value")  
    
    if (hospitalName == "Select hospital to edit") {
        displaySetting = true
        purchaseData = [[0, 0, 0, 0, 0, 0, 0,'dd/mm/yyyy',0]]
    } else {
        displaySetting = false
        // Filter to just this hospitals purchases
        purchaseData = purchase_table.filter(d => d[0] == hospitalName)
    }

    // Activate/Deactivate the form depending on selection
    var myFieldset = document.getElementById("myFieldset");
    myFieldset.disabled = displaySetting;
    
    // Clear the table
    $('table tr:gt(0)').remove()
    
    // Append purchase data for selected hospital
    for (let i = 0; i < purchaseData.length; i++) {      
        $('tbody').append(`
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

    // Disable the Add/Delete buttons if no hospital selected
    if (hospitalName == "Select hospital to edit") {
        $('.edit').removeClass( "edit" ).addClass( "edit disabled" );
        $('.delete').removeClass( "delete" ).addClass( "delete disabled" ); 
    };
};

// Control of the puchase table 
$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip();
	var actions = $("table td:last-child").html();
	
    // Append table with add row form on add new button click
    $(".add-new").click(function(){
		$(this).attr("disabled", "disabled");
      
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
    	$("table").append(row);		
        $("table tr:last").find(".add, .edit").toggle();
        $('[data-toggle="tooltip"]').tooltip();
        $("table tr:last").find(".delete, .edit").css("pointer-events","auto");
        
        $("table tr:last").find(".datepicker").on('click', function() {
            $(this).datepicker({
                format: 'dd-mm-yyyy',
                onClose: function(dateText, inst) {
                    $(this).html(dateText.split('-').reverse().join('/'));
                    $(this).attr('disabled', false);
                }
            }).datepicker('show');
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
    $(document).on('click', '#submit-purchase', sendData) 
    
    $(document).on('change', '#selDataset', updateHosp) 
});


// function closeDiv(){
//     document.getElementById("success").style.opacity=0;
//     document.getElementById("success").style.transition="visibility 0s 4s, opacity 4s linear;";
//     // document.getElementById("success").style.display=" none";
// }

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

function sendData() {
   
    data = getTableData()

    fetch(`/submitPurchase`, {
        method: "POST",
        body: JSON.stringify(data),
        cache: "no-cache",
        headers: new Headers({"content-type": "application/json"})
    })
    .then(response => {
        // Update the table data
        response.json().then(json => {
            purchase_table = json
            })
        
        $('#success').css('opacity', 1)
        fadeOutEffect() 

    })          

    function getTableData()
    {
        // Array of data we'll return
        var data = [{hospitalName}];
    
        // Counter
        var i = 1;
    
        // Cycle through each of the table body's rows
        $('table tr').each(function(index, tr) {
            var tds = $(tr).find('td');

            if (tds.length > 1) {
                var total = ((parseInt(tds[1].innerText) * 1.75) + 
                            (parseInt(tds[2].innerText) * 6.6) +
                            (parseInt(tds[3].innerText) * 16.8) +
                            (parseInt(tds[4].innerText) * 233) +
                            (parseInt(tds[5].innerText) * 223) +
                            (parseInt(tds[6].innerText) * 36.6))
                
                data[i++] = {
                    date: tds[0].innerText,
                    cylinder_c: tds[1].innerText,
                    cylinder_d: tds[2].innerText,
                    cylinder_e: tds[3].innerText,
                    cylinder_f8: tds[4].innerText,
                    cylinder_f9: tds[5].innerText,
                    cylinder_g: tds[6].innerText,
                    total: total 
                }
            }
        });
        
        return data;
    }
};
    
    
    





