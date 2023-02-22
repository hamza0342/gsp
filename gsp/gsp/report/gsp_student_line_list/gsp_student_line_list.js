// Copyright (c) 2016, Frappe Technologies and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["GSP Student Line List"] = {
	"filters": [
		{
			"fieldname":"gsp_year",
			"label": __("Year"),
			"fieldtype": "Link",
			"options": "Year",
			"default":"2021-22",
			"reqd": 1
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
			"get_query": function() {
				var division = frappe.query_report.get_filter_value('gsp_division');
				return {
					    "filters": {"division": division}
				}   
            }
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
			"fieldname": "school",
			"label": __("School"),
			"fieldtype": "Link",
			"options": "School",
		},
	]
};
