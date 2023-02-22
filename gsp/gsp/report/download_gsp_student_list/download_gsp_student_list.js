// Copyright (c) 2016, Frappe Technologies and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Download GSP Student List"] = {
	"filters": [
		{
			"fieldname": "school",
			"label": __("School"),
			"fieldtype": "Link",
			"options": "School",
			"reqd": 1,
			// "default": function() {
			// 	return frappe.call({
			// 		method: "frappe.gsp.report.download_gsp_student_list.download_gsp_student_list.get_school",
			// 		callback: function (r) {
			// 			console.log("School res", r.message)
			// 			var school = r.message
			// 			console.log("School res",school)
			// 			return school
			// 		}
			// 	})
			// }
		}
	],
// 	onload: function (report) {
// 		console.log("Report", report);
// 		return frappe.call({
// 			method: "frappe.gsp.report.download_gsp_student_list.download_gsp_student_list.get_school",
// 			callback: function (r) {
// 				console.log("School res", r.message)
// 				return r.message
// 			}
// 		})
// 	}
};
