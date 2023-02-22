// Copyright (c) 2022, Frappe Technologies and contributors
// For license information, please see license.txt
frappe.require([
	'/assets/semis_theme/js/export_custom.js',
]);


frappe.ui.form.on('GSP Performance Dashboard', {
	refresh: function (frm) {

		frm.add_custom_button(__("Export"), function () {

			downloadtable("#data_table_gsp", "GSP Performance")

		});


	},
	onload: function (frm) {
		frm.disable_save();
		frappe.call({
			method: "gsp.gsp.doctype.gsp_performance_dashboard.gsp_performance_dashboard.get_data",
			callback: function (r) {
				console.log("DATA", r.message);
				$(frm.fields_dict.dashboard_container.wrapper).empty();
				var rows = get_rows(r.message)

				var data = get_table(rows, r.message)
				$(data).appendTo(frm.fields_dict.dashboard_container.wrapper);
			}
		})
	}
});

function get_rows(data) {
	var rows_string = "";
	if (data[4].length > 0) {
		for (var i = 0; i < data[4].length; i++) {
			rows_string += `<tr class="ptr">
			<td style="border:1px solid #000000;text-align:center">` + data[4][i]['district'] + `</td>
			<td style="border:1px solid #000000;text-align:center">` + data[4][i]['assigned_district'] + `</td>`
			var flag = false;
			var remaining = 0;

			for (var j = 0; j < data[5].length; j++) {
				if (data[5][j]["gsp_district"] != null && data[5][j]["gsp_district"] == data[4][i]['district']) {
					flag = true
					var pending = data[4][i]['assigned_district'] - data[5][j]["not_completed"] // data[5][j]["completed"] + data[5][j]["verified"]
					var pending_per = Math.round(parseFloat(pending) / parseFloat(data[4][i]['assigned_district']) * 100.0);
					var not_completed = data[5][j]["not_completed"];
					var not_completed_per = Math.round(parseFloat(not_completed) / parseFloat(data[4][i]['assigned_district']) * 100.0);
					var remaining = data[4][i]["assigned_district"] - (data[5][j]["completed"] + data[5][j]["not_completed"]) //data[1]['assigned_schools']-(data[2][0]["completed"]+data[2][0]['verified']+data[2][0]["not_completed"])
					var rem_per = Math.round(parseFloat(remaining) / parseFloat(data[4][i]["assigned_district"]) * 100.0);

					rows_string += `
					<td style="border:1px solid #000000;text-align:center">` + data[5][j]["total_st"] + `</td>
					<td style="border:1px solid #000000;text-align:center">` + data[5][j]["enroll_st"] + `</td>

					<td style="border:1px solid #000000;text-align:center">` + data[5][j]["completed"] + `</td>
					<td style="border:1px solid #000000;text-align:center">` + not_completed + `</td>
					<td style="border:1px solid #000000;text-align:center">` + String(not_completed_per) + `</td>
					<td style="border:1px solid #000000;text-align:center">` + remaining + `</td>
					<td style="border:1px solid #000000;text-align:center">` + String(rem_per) + `</td>
					</tr>`;

				}
			}
			if (!flag) {
				rows_string += `
				<td style="border:1px solid #000000;text-align:center">` + 0 + `</td>
				<td style="border:1px solid #000000;text-align:center">` + 0 + `</td>
				<td style="border:1px solid #000000;text-align:center">` + 0 + `</td>
				<td style="border:1px solid #000000;text-align:center">` + 0 + `</td>
				<td style="border:1px solid #000000;text-align:center">` + 0 + `</td>
				<td style="border:1px solid #000000;text-align:center">` + data[4][i]['assigned_district'] + `</td>
				<td style="border:1px solid #000000;text-align:center">` + 100 + `</td>
				</tr>`;
			}
		}
	}
	return rows_string;
}

function get_table(rows, data) {
	var not_assigned = data[0][0]["total_schools"] - data[1]['assigned_schools'];
	var pending = 0;
	var completed = 0;
	var not_completed = 0;
	var remaining = 0;
	var st_per = 0
	var total_st = 0
	var enroll_st = 0



	// var verified=0;
	if (data[4].length > 0) {

		var pending = data[2][0]["completed"]
		var pen_per = Math.round(parseFloat(pending) / parseFloat(data[0][0]["total_schools"]) * 100.0);
		var not_completed = data[2][0]["not_completed"];
		var not_completed_per = Math.round(parseFloat(data[2][0]["not_completed"]) / parseFloat(data[0][0]["total_schools"]) * 100.0);
		var remaining = data[0][0]["total_schools"] - (data[2][0]["completed"] + data[2][0]["not_completed"])
		var rem_per = Math.round(parseFloat(remaining) / parseFloat(data[0][0]["total_schools"]) * 100.0);

		var total_st = data[6][0]
		// var rem_per = Math.round(parseFloat(total_st) / parseFloat(data[0][0]["total_schools"]) * 100.0);
		var enroll_st = data[6][1]
		var st_per = Math.round(parseFloat(enroll_st) / parseFloat(total_st) * 100.0);

		// var verified=data[2][0]["verified"];
	}
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
		font-size: 15px;
		color:white;
		border-top-left-radius:5px;
		border-top-right-radius:5px;
		margin-bottom:7px;
		font-family: monospace;

	}
</style>
<div class="row">

<div class="col-md-2">
<div class="singleCount1" style="background-image: linear-gradient(to left, #0db2de 0%, #005bea 100%) !important;">
<span class="value_count">`+ data[0][0]["total_schools"].toLocaleString("en-US") + `</span><br>
<div class="counter" >Total Schools</div>
</div>
</div>

<div class="col-md-2">
<div class="singleCount"  style="background-color: #ffbc00;">
<span class="value_count">`+ not_completed.toLocaleString("en-US") + `</span> (` + String(not_completed_per) + `%)<br>
<div class="counter" >Incomplete Form</div>
</div>
</div>

<div class="col-md-2">
<div class="singleCount"  style="background-color:#9acd32;">
<span class="value_count">`+ pending.toLocaleString("en-US") + `</span> (` + String(pen_per) + `%)<br>
<div class="counter" >Completed Form</div>
</div>
</div>

<div class="col-md-2">
<div class="singleCount"  style="background-color:#FF0000;">
<span class="value_count">`+ remaining.toLocaleString("en-US") + `</span> (` + String(rem_per) + `%)<br>
<div class="counter" >Not Entered</div>
</div>
</div>

<div class="col-md-2">
<div class="singleCount"  style="background-color:#be00ff;">
<span class="value_count">`+ total_st.toLocaleString("en-US") + `</span> <br>
<div class="counter" >Total Students</div>
</div>
</div>

<div class="col-md-2">
<div class="singleCount"  style="background-color:#ff5000;">
<span class="value_count">`+ enroll_st.toLocaleString("en-US") + `</span> (` + String(st_per) + `%)<br>
<div class="counter" >Enrolled Students</div>
</div>
</div>

  </div>
		`
	if (data[4].length > 0) {
		message_ += `<div class="table-responsive"><table id= "data_table_gsp"  width="100%" cellpadding="5" cellspacing="0" style="border: 1px solid #000000; border-spacing: 1px; border-collapse: collapse; table-layout:fixed;text-align:center">
			<tr style="font-size:16px; background-color:#75b17f; color: white;">
			<th style="border:1px solid #000000;text-align:center">District</th>
			<th style="border:1px solid #000000;text-align:center">Total Schools</th>
			<th style="border:1px solid #000000;text-align:center">Total Students</th>
			<th style="border:1px solid #000000;text-align:center">Enrolled Students</th>
			<th style="border:1px solid #000000;text-align:center">Completed</th>
			<th style="border:1px solid #000000;text-align:center">Incomplete</th>
			<th style="border:1px solid #000000;text-align:center">Incomplete (%)</th>
			<th style="border:1px solid #000000;text-align:center">Not Entered</th>
			<th style="border:1px solid #000000;text-align:center">Not Entered (%)</th>
			</tr>
			`+ rows + `
		</table>
		</div>
		`};
	return message_;
}