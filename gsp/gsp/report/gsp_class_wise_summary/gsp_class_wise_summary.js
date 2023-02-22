// Copyright (c) 2016, Frappe Technologies and contributors
// For license information, please see license.txt
// eslint-disable /

frappe.query_reports["GSP Class Wise Summary"] = {
	"filters": [
		{
			"fieldname": "year",
			"label": __("Year"),
			"fieldtype": "Link",
			"options": "Year",
			"default": "2021-22",
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
		{
			"fieldname": "school",
			"label": __("School"),
			"fieldtype": "Link",
			"options": "School",
		},

	]
};
