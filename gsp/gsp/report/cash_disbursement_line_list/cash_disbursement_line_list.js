// Copyright (c) 2016, Frappe Technologies and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Cash Disbursement Line List"] = {
	"filters": [
		{
			fieldname: "year",
			label: __("Year"),
			fieldtype: "Link",
			options: "Year",
			default: "2021-22",
			reqd: 1,
		  },
		  {
			"fieldname":"gsp_division",
			"label": __("Division"),
			"fieldtype": "Link",
			"options": "Division",
		},
		{
			"fieldname":"gsp_district",
			"label": __("District"),
			"fieldtype": "Link",
			"options": "District",
			// "get_query": async function() {
			// 	var division = frappe.query_report.get_filter_value('gsp_division');
			// 	var gsp = frappe.user_roles.includes('GSP School');
			// 	var asc = frappe.user_roles.includes('ASC School');
			// 	var smc = frappe.user_roles.includes('SMC School');
			// 	if (gsp == true && smc == true && asc == true && hr_manager == false) {
			// 		console.log("in CMO");
			// 		await frappe.call({
			// 			method: "frappe.gsp.report.cash_disbursement_line_list.cash_disbursement_line_list.districts_user",
			// 			args: { user: frappe.session.user },
			// 			callback: function (r) {
			// 				district_by_user = r.message.for_value;
			// 				console.log(district_by_user);
			// 				return {
			// 					"filters": {"division": district_by_user}
			// 				} 
			// 			}
			// 		});
			// 	}
				  
            // }
		},
		
		// {
		// 	"fieldname":"gsp_taluka",
		// 	"label": __("Taluka"),
		// 	"fieldtype": "Link",
		// 	"options": "Taluka",
		// 	"get_query": function() {
		// 		var district = frappe.query_report.get_filter_value('gsp_district');
		// 		return {
		// 			    "filters": {"district": district}
		// 		}   
        //     }

		// },
		// {
		// 	"fieldname":"gsp_uc",
		// 	"label": __("UC"),
		// 	"fieldtype": "Link",
		// 	"options": "Union Council",
		// 	"get_query": function() {
		// 		var tehsil = frappe.query_report.get_filter_value('gsp_taluka');
		// 		return {
		// 			    "filters": {"taluka_name": tehsil}
		// 		}   
        //     }
		// },
		{
			"fieldname":"school",
			"label": __("School"),
			"fieldtype": "Link",
			"options": "School",
		},
	]
};
