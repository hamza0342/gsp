// Copyright (c) 2022, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('GSP Student Attendance Tool For Mobile', {
	// refresh: function(frm) {

	// },
	onload: function (frm) {
		// frm.disable_save();

		frm.get_field("students_attendance").grid.cannot_add_rows = true;

		//fetching allowed months
		frappe.call({
			method: "gsp.gsp.doctype.gsp_student_attendance_tools.gsp_student_attendance_tools.get_months",
			callback: function (response) {
				var months = response.message;
				// console.log(months);
				frm.set_df_property("month", "options", months);
			}
		})

		//fetching sections
		if (frm.doc.school) {
			frappe.call({
				method: "gsp.gsp.doctype.gsp_student_attendance_tools.gsp_student_attendance_tools.get_school_details",
				args: {
					school: frm.doc.school,
				},
				callback: function (r) {
					var data = r.message;
					frm.set_value("school_name", data.school_name);
					frm.set_value("gsp_name", data.gsp_name);

				}
			})
		}


	},

	school: function (frm) {
		if (frm.doc.school) {
			frappe.call({
				method: "gsp.gsp.doctype.gsp_student_attendance_tools.gsp_student_attendance_tools.get_school_details",
				args: {
					school: frm.doc.school,
				},
				callback: function (r) {
					var data = r.message;
					frm.set_value("school_name", data.school_name);
					frm.set_value("gsp_name", data.gsp_name);

				}
			})
		}
	},
	month: function (frm) {
		if (frm.doc.month)
			frappe.call({
				method: "gsp.gsp.doctype.gsp_student_attendance_tools.gsp_student_attendance_tools.get_working_days",
				args: {
					gsp_name: frm.doc.gsp_name,
					month: frm.doc.month
				},
				callback: function (response) {
					var days = response.message;
					console.log(days);
					frm.set_value("working_days", days);
				}
			})
	},
	attendance_class: function (frm) {

		if (frm.doc.attendance_class) {
			if (frm.doc.gsp_name) {
				frappe.call({
					method: "gsp.gsp.doctype.gsp_student_attendance_tools.gsp_student_attendance_tools.gsp_section",
					args: {
						gsp_name: frm.doc.gsp_name,
						attendance_class: frm.doc.attendance_class,
					},
					callback: function (response) {
						var section = response.message;
						console.log(section);
						frm.set_df_property("section", "options", section);
					}
				})
			}
		} else {
			frm.set_df_property("section", "options", []);

		}
	},
	get_students: function (frm) {
		frappe.call({
			method: "gsp.gsp.doctype.gsp_student_attendance_tools.gsp_student_attendance_tools.get_attendance",
			args: {
				gsp_name: frm.doc.gsp_name,
				attendance_class: frm.doc.attendance_class,
				section: frm.doc.section,
				month: frm.doc.month
			},
			freeze: true,
			callback: function (response) {
				var data = response.message
				console.log(data);
				cur_frm.clear_table("students_attendance");
				for (let i = 0; i < data.length; i++) {
					const element = data[i];

					var childTable = cur_frm.add_child("students_attendance");
					childTable.student_name = element.student_name
					childTable.father_name = element.father_guardian_name
					childTable.gr_no = element.gr_no
					childTable.attendance = element.attendance
					childTable.gsp_name = element.gsp_name
					cur_frm.refresh_fields("students_attendance");

				}
			}
		})

	},
	update_attendance: function (frm) {
		if (frm.doc.students_attendance.length > 0) {
			const data = frm.doc.students_attendance
			frappe.call({
				method: "gsp.gsp.doctype.gsp_student_attendance_tools.gsp_student_attendance_tools.set_attendance",
				args: {
					data: data,
					month: frm.doc.month
				},
				freeze: true,
				callback: function (response) {
					var data = response.message
					if (data == 1) {
						frappe.show_alert({
							message: __('Updated Successfully'),
							indicator: 'green'
						}, 5);
					}

				}
			})
		}
	}
});
