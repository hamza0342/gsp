// Copyright (c) 2022, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('GSP Panel', {
	before_load: function (frm) {
		var df = frappe.meta.get_docfield("GSP Monthly Attendance", "attendance", frm.doc.name);
		df.hidden = 1;
		var df = frappe.meta.get_docfield("GSP Monthly Attendance", "release_stipend", frm.doc.name);
		df.hidden = 0;
		var df = frappe.meta.get_docfield("GSP Monthly Attendance", "gsp_month", frm.doc.name);
		df.read_only = 1;
		frm.refresh_fields();
	},
	setup: function (frm) {

		frm.get_field('month_selection').grid.editable_fields = [
			{ fieldname: 'gsp_month', columns: 5 },
			{ fieldname: 'release_stipend', columns: 5 }
		];
	},
	onload: function (frm) {
		frm.get_field('month_selection').grid.editable_fields = [
			{ fieldname: 'gsp_month', columns: 5 },
			{ fieldname: 'release_stipend', columns: 5 }
		];
		var table = frm.doc.month_selection;
		if ((frm.is_new()) || (table.length == 0)) {
			frappe.call({
				method: "gsp.gsp.doctype.gsp_panel.gsp_panel.get_months",
				async: false,
				callback: function (response) {

					var months = response.message;
					console.log(months);

					cur_frm.clear_table("month_selection");


					for (let i = 0; i < months.length; i++) {
						var childTable = cur_frm.add_child("month_selection");

						childTable.gsp_month = months[i][0]
						// console.log(typeof (months[i]));

						cur_frm.refresh_fields("month_selection");
					}

				}
			})
		}

		frm.get_field("month_selection").grid.cannot_add_rows = true;
	},
	refresh: function (frm) {
		if (!(frm.is_new())) {
			frm.set_df_property("year", "read_only", 1);
		}
	},
	from_date: function (frm) {
		var doc = frm.doc
		if (doc.from_date) {
			var from_date = Date.parse(String(doc.from_date).split(" ")[0]);
			var to_date = Date.parse(doc.to_date);
			if (from_date > to_date) {
				frm.set_value("from_date", "")
				frappe.msgprint("Start date should be less or equal to end date")
			}
		}
	},
	to_date: function (frm) {
		var doc = frm.doc
		if (doc.to_date) {
			var to_date = Date.parse(String(doc.to_date).split(" ")[0]);
			var from_date = Date.parse(doc.from_date);
			if (to_date < from_date) {
				frm.set_value("to_date", "")
				frappe.msgprint("End date should be greater or equal to start date")
			}
		}
	},

	get_districts: function (frm) {
		frappe.call({
			method: "gsp.gsp.doctype.gsp_panel.gsp_panel.get_district",
			callback: function (response) {
				var data = response.message
				for (let i = 0; i < data.length; i++) {
					const element = data[i];
					var childTable = cur_frm.add_child("gsp_values");
					childTable.district = element.district_name
					childTable.attendance_percentage = 0
					cur_frm.refresh_fields("gsp_values");
				}
			}
		})
	}
});
frappe.ui.form.on("GSP Factors values", {
	attendance_percentage: function (frm, cdt, cdn) {
		var temp = 0;
		var doc = locals[cdt][cdn];
		if (!Number.isInteger(doc.attendance_percentage)) {
			frappe.model.set_value(cdt, cdn, "attendance_percentage", "")
		}
		if (doc.attendance_percentage < 0) {
			frappe.model.set_value(cdt, cdn, "attendance_percentage", "")
			frappe.msgprint("Attendance percentage not negative value")
		}
		if (doc.attendance_percentage > 99) {
			frappe.model.set_value(cdt, cdn, "attendance_percentage", "")
			frappe.msgprint("Attendance percentage must between 0 to 100")
		}
	},
	vi: function (frm, cdt, cdn) {
		var doc = locals[cdt][cdn];
		if (!Number.isInteger(doc.vi)) {
			frappe.model.set_value(cdt, cdn, "vi", "")
		}
		if (doc.vi < 0) {
			frappe.model.set_value(cdt, cdn, "vi", "")
			frappe.msgprint("Amount can't be negative value")
		}
	},
	ix: function (frm, cdt, cdn) {
		var doc = locals[cdt][cdn];
		if (!Number.isInteger(doc.ix)) {
			frappe.model.set_value(cdt, cdn, "ix", "")
		}
		if (doc.ix < 0) {
			frappe.model.set_value(cdt, cdn, "ix", "")
			frappe.msgprint("Amount can't be negative value")
		}
	},
	x: function (frm, cdt, cdn) {
		var doc = locals[cdt][cdn];
		if (!Number.isInteger(doc.x)) {
			frappe.model.set_value(cdt, cdn, "x", "")
		}
		if (doc.x < 0) {
			frappe.model.set_value(cdt, cdn, "x", "")
			frappe.msgprint("Amount can't be negative value")
		}
	},
});