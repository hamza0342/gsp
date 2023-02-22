
// Copyright (c) 2022, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('GSP Assigned Schools', {
	onload: function (frm) {
		frm.disable_save();
		frappe.call({
			method: "gsp.gsp.doctype.gsp_assigned_schools.gsp_assigned_schools.get_schools",
			async: false,
			callback: function (r) {
				$(frm.fields_dict.school_table.wrapper).empty();
				var rows = get_rows(r.message)
				var data = get_table(r.message, rows)
				console.log("data", data);
				console.log("rows", rows);

				$(data).appendTo(frm.fields_dict.school_table.wrapper);
			}
		})
	}
});

function get_rows(data) {
	var rows_string = "";
	console.log(data);

	for (var i = 0; i < data[0].length; i++) {
		// total_school+=1;
		rows_string += `<tr class="ptr">
			<td style="border:1px solid #000000;text-align:center">` + data[0][i]['school'] + `</td>
			<td style="border:1px solid #000000;text-align:center">` + data[0][i]['school_name'] + `</td>
			<td style="border:1px solid #000000;text-align:center">` + data[0][i]['planned_date'] + `</td>
			<td style="border:1px solid #000000;text-align:center">`
		if (data[0][i]['gsp_name'].length > 0) {
			if (data[0][i]['completion_check'] == 1) {
				//rows_string +=`<a href= '/app/asc/" + String(data[0][i]['asc_name']) + "' class="btn btn-success" style="background-color: #00a1ff;">Completed</a>`;

				rows_string += "<a class='btn btn-success' style='background-color: #00a1ff;' href= '/app/girl-stipend-program/" + String(data[0][i]['gsp_name']) + "'>Completed</a>";

			}
			if (data[0][i]['completion_check'] == 0) {
				rows_string += "<a class='btn btn-success' style='background-color: #ff7900;'; href= '/app/girl-stipend-program/" + String(data[0][i]['gsp_name']) + "'>Edit/Finalize</a>";
			}
		}
		else {
			rows_string += `<a class="btn btn-primary" style="background-color:#FF0000;"; onclick="frappe.set_route('girl-stipend-program/new-girl-stipend-program-1',{'semis_code': ` + String(data[0][i]['school']) + `})">Enter Data</a>`
		}
		rows_string += `</td></tr>`;
	}
	return rows_string;
}

function get_table(data, rows) {
	var panding = data[0].length - data[1][0]['census_completed'] - data[1][0]['incomplete_form']

	var message_ = `
	<style>
	
	#counts{
		display: flex;
		justify-content: space-around;
		margin-bottom:2.5em;
		
	}
	.singleCount{
		text-align:center;
		border-radius: 14px;
		box-shadow: 0px 0px 7px 2px #9d9593a1;
		justify-content: center;
	
		align-item:center;
		font-size:1vw;
		padding:5px;
		margin-bottom: 35px;
	}
	.singleCount1{
	text-align:center;
    border-radius: 14px;
		box-shadow: 0px 0px 7px 2px #9d9593a1;
	
		justify-content:center;
		align-item:center;
		padding:10px;
		margin-bottom: 35px;
	}
	.value_count{
		font-size:40px;
		color:white;
		font-family: sans-serif;
	}

	.counter{
		font-size: 17px;
		color:white;
		border-top-left-radius:5px;
		border-top-right-radius:5px;
		margin-bottom:7px;
		font-family: monospace;

	}
</style>

<div class="row" style="justify-content:center;">



<div class="col-md-3">
<div class="singleCount"  style="background-color: #0370e7;">
<span class="value_count">`+ data[0].length.toLocaleString("en-US") + `</span><br>
<div class="counter" >School Assigned</div>
</div>
</div>

<div class="col-md-3">
<div class="singleCount"  style="background-color: #00a1ff;">
<span class="value_count">`+ data[1][0]['census_completed'].toLocaleString("en-US") + `</span><br>
<div class="counter" >Complete Form</div>
</div>
</div>
<div class="col-md-3">
<div class="singleCount"  style="background-color: #ff7900;">
<span class="value_count">`+ data[1][0]['incomplete_form'].toLocaleString("en-US") + `</span><br>
<div class="counter" >Incomplete Form</div>
</div>
</div>


<div class="col-md-3">
<div class="singleCount"  style="background-color:#FF0000;">
<span class="value_count">`+ panding.toLocaleString("en-US") + `</span><br>
<div class="counter" >No Data</div>
</div>
	

</div>


</div>
<div class="table-responsive">
	
		<table  width="100%" cellpadding="5" cellspacing="0" style="border: 1px solid #000000; border-spacing: 1px; border-collapse: collapse;text-align:center">
			<tr style="font-size:16px; background-color:#75b17f; color: white;">
				<th style="border:1px solid #000000;text-align:center">Semis Code</th>
				<th style="border:1px solid #000000;text-align:center">School Name</th>
				<th style="border:1px solid #000000;text-align:center">Planned Date</th>
				<th style="border:1px solid #000000;text-align:center">Action</th>
			</tr>` + rows + `
		</table></div> ` ;
	return message_;
}
