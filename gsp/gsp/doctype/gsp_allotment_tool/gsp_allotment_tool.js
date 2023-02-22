// Copyright (c) 2022, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('GSP Allotment Tool', {
	onload: function (frm) {
		$(".primary-action").hide();
		const doctype = frm.doc.reference_doctype;
		if (doctype) {
			frappe.model.with_doctype(doctype, () => set_field_options(frm));
		} else {
			reset_filter_and_field(frm);
		}
		cur_frm.set_value('reference_doctype', 'ASC');
		refresh_field('reference_doctype');
	},
	reference_doctype: frm => {
		const doctype = frm.doc.reference_doctype;
		if (doctype) {
			frappe.model.with_doctype(doctype, () => set_field_options(frm));
		} else {
			reset_filter_and_field(frm);
		}
	},

	division: frm => {
		frm.set_value("district", "")
		frm.set_value("taluka", "")

		if (frm.doc.division) {
			frm.set_query("district", function () {
				return {
					"filters": {
						"division": frm.doc.division,
					}
				};
			});
		} else {
			frm.set_query("district", function () {
				return {
					"filters": {

					}
				};
			});
		}
	},

	district: frm => {
		frm.set_value("taluka", "")

		if (frm.doc.district) {
			frm.set_query("taluka", function () {
				return {
					"filters": {
						"district": frm.doc.district,
					}
				};
			});
		} else {
			frm.set_query("taluka", function () {
				return {
					"filters": {

					}
				};
			});
		}
	},
	get_schools: frm => {
		if (frm.doc.year) {
			var filter_list_arr = frm.filter_list.get_filters().map(filter => filter.slice(1, 4))
			frappe.call({
				method: "gsp.gsp.doctype.gsp_allotment_tool.gsp_allotment_tool.get_schools",
				async: false,
				args: {
					"year": frm.doc.year,
					"division": frm.doc.division,
					"district": frm.doc.district,
					"taluka": frm.doc.taluka,
					"args_value": filter_list_arr
				},
				freeze: true,
				callback: function (r) {
					if (r.message) {
						frm.clear_table("schools_table", "")
						$.each(r.message, function (i, d) {
							var row = frappe.model.add_child(frm.doc, "GSP Allotment Tool Table", "schools_table");
							row.semis_code = d.semis_code;
							row.school_name = d.school_name;
							row.status = d.status_detail;
							row.gender = d.school_gender;
							row.asc_name = d.name;
						});
					}
					refresh_field("schools_table");
				}
			});
		} else {
			frappe.throw("Please select year first")
		}
	},
	update_status: frm => {
		if (frm.doc.schools_table) {
			frappe.call({
				method: "gsp.gsp.doctype.gsp_allotment_tool.gsp_allotment_tool.update_status",
				async: false,
				args: {
					data: frm.doc.schools_table,
					"division": frm.doc.division,
					"district": frm.doc.district,
					"taluka": frm.doc.taluka,
				},
				freeze: true,
				callback: function (r) {
					if (r.message == 1) {
						frappe.show_alert({
							message: __('Updated Successfully'),
							indicator: 'green'
						}, 5);
					} else if (r.message == 0) {
						frappe.show_alert({
							message: __('Not Updated'),
							indicator: 'red'
						}, 5);
					}
				}
			});
		} else {
			frappe.throw("Please get Schools first")
		}
	},
	update_only: frm => {
		if (frm.doc.schools_table) {
			frappe.call({
				method: "gsp.gsp.doctype.gsp_allotment_tool.gsp_allotment_tool.update_only",
				async: false,
				args: {
					data: frm.doc.schools_table,
					"division": frm.doc.division,
					"district": frm.doc.district,
					"taluka": frm.doc.taluka,
				},
				freeze: true,
				callback: function (r) {
					if (r.message == 1) {
						frappe.show_alert({
							message: __('Updated Successfully'),
							indicator: 'green'
						}, 5);
					} else if (r.message == 0) {
						frappe.show_alert({
							message: __('Not Updated'),
							indicator: 'red'
						}, 5);
					}
				}
			});
		} else {
			frappe.throw("Please get Schools first")
		}
	},
});
const reset_filter_and_field = (frm) => {
	const filter_wrapper = frm.fields_dict.filter_list.$wrapper;
	filter_wrapper.empty();
	frm.filter_list = [];
};

const set_field_options = (frm) => {
	const filter_wrapper = frm.fields_dict.filter_list.$wrapper;
	const doctype = frm.doc.reference_doctype;
	const related_doctypes = get_doctypes(doctype);

	filter_wrapper.empty();

	frm.filter_list = new frappe.ui.FilterGroup({
		parent: filter_wrapper,
		doctype: doctype,
		on_change: () => { },
	});
	frm.refresh();
};
const get_doctypes = parentdt => {
	return [parentdt].concat(
		frappe.meta.get_table_fields(parentdt).map(df => df.options)
	);
};
