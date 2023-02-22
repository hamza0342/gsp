// Copyright (c) 2022, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('GSP Roster', {
	onload: function (frm) {
		frm.set_query("user", function () {
			return {
				"filters": {
					"data_entry_operator": 1,
					"gsp": 1
				}
			};
		});
		if (!frm.is_new()) {
			frm.set_df_property("user", "read_only", 1);
			frm.set_df_property("year", "read_only", 1);
			frm.set_df_property("district", "read_only", 1);
			frm.set_df_property("user_name", "read_only", 1);
			frm.set_df_property("taluka", "read_only", 1);
			frm.set_df_property("uc", "read_only", 1);
			frm.set_df_property("get_school", "hidden", 1);
			//frm.get_field('school_permission').grid.only_sortable();
		}
		var user = frappe.user_roles.includes('LSU');
		var admin = frappe.user_roles.includes('System Manager');

		if (user == true && admin == false) {
			frm.set_df_property('district', 'read_only', 1);
		}
		frm.trigger("trigger_set_query")

	},
	district: function (frm) {
		// frm.set_query("school","school_permission", function(doc, cdt, cdn) {

		// 	return { 
		// 		"filters": {

		// 		 "union_council": me.frm.doc.uc
		// 		}
		// 	};
		// });
		frm.set_query("taluka", function () {
			return {
				"filters": {
					"district": frm.doc.district
				}
			}
		});
		frm.set_query("uc", function () {
			return {
				"filters": {
					"taluka_name": frm.doc.taluka
				}
			}
		})
		frm.trigger("trigger_set_query")
	},
	get_school: function (frm) {
		if (frm.doc.district || frm.doc.uc || frm.doc.taluka) {
			frm.set_value("school_permission", "");
			frappe.call({
				method: "gsp.gsp.doctype.gsp_roster.gsp_roster.edit_table",
				args: {
					union_council: frm.doc.uc,
					district: frm.doc.district,
					taluka: frm.doc.taluka,
				},
				callback: function (r) {
					console.log(r.message);
					$.each(r.message, function (index, data) {
						var row = frappe.model.add_child(frm.doc, "School Permission", "school_permission");
						row.school = data.name
						row.school_name = data.school_name
					});
					refresh_field("school_permission");
				}
			})
		}

	},
	trigger_set_query: function (frm) {
		var dict_ = { "gender": ["in", ['Girls', "Mixed"]] };
		if (frm.doc.district) {
			dict_['district'] = ['=', frm.doc.district]
		}
		if (frm.doc.taluka) {
			dict_['taluka'] = ['=', frm.doc.taluka]
		}
		if (frm.doc.uc) {
			dict_['union_council'] = ['=', frm.doc.uc]
		}
		frm.set_query("school", "school_permission", function (doc, cdt, cdn) {
			return {
				filters: dict_
			};
		});
	},
	user: function (frm) {
		var user = frappe.session.user
		if (user == frm.doc.user) {
			frm.set_value("user", '');
			frm.set_value("user_name", '');
			frappe.msgprint("Roster can't be created for given user")
		}
	}
});
// frappe.ui.form.on("GSP Roster", "district", function(frm) {
// 	var dict_ = {};
// 	if (frm.doc.district){
// 		dict_['district'] = ['=', frm.doc.district]
// 	}
// 	if (frm.doc.taluka){
// 		dict_['taluka'] = ['=', frm.doc.taluka]
// 	}
// 	if (frm.doc.uc){
// 		dict_['union_council'] = ['=', frm.doc.uc]
// 	}
// 	frm.fields_dict.school_permission.grid.get_field('school').get_query 
// 		= function() {
// 			return {
// 				filters: dict_
// 			}
// 		}
// });