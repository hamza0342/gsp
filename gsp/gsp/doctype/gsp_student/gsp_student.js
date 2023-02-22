// Copyright (c) 2022, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.require([
	'/assets/semis_theme/js/personal_detail_validation.js',
]);
frappe.ui.form.on('GSP Student', {
	before_load: function (frm) {
		var df = frappe.meta.get_docfield("GSP Monthly Attendance", "release_stipend", frm.doc.name);
		df.hidden = 1;
		var df = frappe.meta.get_docfield("GSP Monthly Attendance", "gsp_month", frm.doc.name);
		df.read_only = 1;
		frm.refresh_fields();
	},
	// onload_post_render: async function (frm) {
	// 	var school_user = frappe.user_roles.includes('School User');
	// 	var system_manager = frappe.user_roles.includes('System Manager');
	// 	if(school_user ==  true && system_manager == false){
	// 		 frappe.call({
	// 			method: "gsp.gsp.doctype.gsp_student.gsp_student.check_school",
	// 			callback: function (r) {
	// 				if (r.message) {
	// 					console.log(r.message);
	// 					frm.set_value("school", r.message[0])
	// 				}
	// 			}
	// 		})
	// 	}
	// },
	onload: function (frm) {
		$("input[data-fieldname='cnic_of_guardian']").attr("placeholder", "xxxxx-xxxxxxx-x")
		$("input[data-fieldname='cnic_of_guardian']").mask('00000-0000000-0');
		$("input[data-fieldname='mob_no_guardian']").mask('0000-0000000');
		$("input[data-fieldname='mob_no_guardian']").attr("placeholder", "03xx-xxxxxxx")

		// frm.set_df_property("section_break_38", "hidden", 1);


		// console.log("child_data", frm.doc.gsp_student_attendance);
		var table = frm.doc.gsp_student_attendance
		if ((frm.is_new()) || (table.length == 0)) {
			frm.set_df_property("gsp_student_attendance", "hidden", 1);
			frm.set_df_property("no_of_days_school_attended_for_current_academic_year", "hidden", 1);
			frm.set_df_property("working_days", "hidden", 1);



		}

		// if (frm.is_new()) {
		// 	frappe.call({
		// 		method: "gsp.gsp.doctype.gsp_student.gsp_student.get_months",
		// 		async: false,
		// 		callback: function (response) {
		// 			var months = response.message;
		// 			cur_frm.clear_table("gsp_student_attendance");


		// 			for (let i = 0; i < months.length; i++) {
		// 				var childTable = cur_frm.add_child("gsp_student_attendance");
		// 				childTable.gsp_month = months[i][0]
		// 				cur_frm.refresh_fields("gsp_student_attendance");
		// 			}

		// 		}
		// 	})
		// }

		frm.get_field("gsp_student_attendance").grid.cannot_add_rows = true;
	},

	refresh: function (frm) {
		$("input[data-fieldname='cnic_of_guardian']").attr("placeholder", "xxxxx-xxxxxxx-x")
		$("input[data-fieldname='cnic_of_guardian']").mask('00000-0000000-0');
		if (frm.doc.school && frm.is_new()) {
			frappe.call({
				method: "gsp.gsp.doctype.gsp_student.gsp_student.working_days",
				args: {
					school: frm.doc.school

				},
				callback: function (r) {
					var data = r.message
					// console.log(data.total);
					frm.set_value("gsp_attendance", data.total);
				}
			});
		}
	},
	cnic_of_guardian: function (frm) {
		$("input[data-fieldname='cnic_of_guardian']").focusout(function () {
			var cnic = frm.doc.cnic_of_guardian
			if (!(cnic_validate(cnic))) {
				$(".msgprint").empty()
				frappe.msgprint("Please Enter Valid Head Teacher CNIC#")
				frm.set_value("cnic_of_guardian", '')
			}
		});
	},
	// gr_no:function(frm){
	// 	$("input[data-fieldname='gr_no']").focusout(function () {
	// 		var gr = frm.doc.gr_no
	// 		if (gr_no_format(gr)) {
	// 			// $(".msgprint").empty()
	// 			// frappe.msgprint("Please Enter Valid GR#")
	// 			// frm.set_value("gr_no", '')
	// 		}
	// 	});
	// },

	student_name: function (frm) {
		$("input[data-fieldname='student_name']").keypress(function (e) {
			onlyalpha(e);
		});
		$("input[data-fieldname='student_name']").focusout(function () {
			var name = frm.doc.student_name
			if (!(name_validate(name))) {
				$(".msgprint").empty()
				frappe.msgprint("Please Enter Valid Student Name")
				frm.set_value("student_name", '')
			}
		});
	},
	father_guardian_name: function (frm) {
		$("input[data-fieldname='father_guardian_name']").keypress(function (e) {
			onlyalpha(e);
		});
		$("input[data-fieldname='father_guardian_name']").focusout(function () {
			var name = frm.doc.father_guardian_name
			if (!(name_validate(name))) {
				$(".msgprint").empty()
				frappe.msgprint("Please Enter Valid Guardian Name")
				frm.set_value("father_guardian_name", '')
			}
		});
	},
	mob_no_guardian: function (frm) {
		if (frm.doc.mob_no_guardian) {
			$("input[data-fieldname='mob_no_guardian']").focusout(function () {
				var name = frm.doc.mob_no_guardian
				if (!(phone_validate(name))) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Valid Guardian Phone")
					frm.set_value("mob_no_guardian", '')
				}
			});
		}

	},
	october: function (frm) {
		$("input[data-fieldname='october']").focusout(function () {
			var account = frm.doc.october
			if (account > 31) {
				$(".msgprint").empty()
				frappe.msgprint("Please Enter Value Between 0 to 30")
				frm.set_value("october", '')
			}
		});

		if (!Number.isInteger(frm.doc.october)) {
			frm.set_value("october", '')
		}
		if (frm.doc.october < 0) {
			frm.set_value("october", '')
			frappe.msgprint("Must be a valid Number.")
		}
		if (!frm.doc.october) {
			frm.doc.october = 0;
		}
		if (!frm.doc.november) {
			frm.doc.november = 0;
		}
		if (frm.doc.october > frm.doc.working_days_oct) {
			frappe.msgprint("School attended days must be equal to or less than the number of  days school remained open")
			frm.set_value("october", '')
		}
		var total_att = frm.doc.october + frm.doc.november;
		frm.set_value("total", total_att);
		// var attendance=frm.doc.total/frm.doc.gsp_attendance*100;
		// frm.set_value("percentage",attendance)
		var attendance = Math.round(frm.doc.total / frm.doc.gsp_attendance * 100);
		frm.set_value("percentage", attendance)
	},
	november: function (frm) {
		$("input[data-fieldname='november']").focusout(function () {
			var account = frm.doc.november
			if (account > 30) {
				$(".msgprint").empty()
				frappe.msgprint("Please Enter Value Between 0 to 30")
				frm.set_value("november", '')
			}
		});
		if (frm.doc.november > frm.doc.working_days_nov) {
			frappe.msgprint("School attended days must be equal to or less than the number of  days school remained open")
			frm.set_value("november", '')
		}

		if (!Number.isInteger(frm.doc.november)) {
			frm.set_value("november", '')
		}
		if (frm.doc.november < 0) {
			frm.set_value("november", '')
			frappe.msgprint("Must be a valid Number.")
		}
		if (!frm.doc.october) {
			frm.doc.october = 0;
		}
		if (!frm.doc.november) {
			frm.doc.november = 0;
		}
		var total_att = frm.doc.october + frm.doc.november;
		frm.set_value("total", total_att);
		var attendance = Math.round(frm.doc.total / frm.doc.gsp_attendance * 100);
		frm.set_value("percentage", attendance)

	},
	class_of_student: function (frm) {
		if (frm.doc.class_of_student && frm.doc.school) {
			console.log("sending reqs");
			frappe.call({
				method: "gsp.gsp.doctype.gsp_student.gsp_student.exceed_enrollment",
				args: {
					school: frm.doc.school,
					class_of_student: frm.doc.class_of_student
				},
				callback: function (r) {
					console.log("server res", r.message);

					var data = r.message
					// console.log("res", r.message);
					if (data == 1) {
						// frappe.msgprint("You can't create form more than the total number of students in the class")
						frm.set_value("class_of_student", '');
					}
				}
			});
		}
	},
	school: function (frm) {
		if (frm.doc.school) {
			frm.set_value("class_of_student", "");
		}
	},

	gr_no: function (frm) {
		if (frm.doc.gr_no) {
			$("input[data-fieldname='gr_no']").focusout(function () {
				var gr = frm.doc.gr_no
				if (!(gr_no_format(gr))) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Valid GR#")
					frm.set_value("gr_no", '')
				}
			});

			// frappe.call({
			// 	method: "gsp.gsp.doctype.gsp_student.gsp_student.check_gr",
			// 	args: {
			// 		school: frm.doc.school,
			// 		gsp_year: frm.doc.gsp_year,
			// 		gr_no: frm.doc.gr_no
			// 	},
			// 	callback: function (r) {
			// 		var data = r.message
			// 		if (data) {
			// 			if (data.gr >= 1) {
			// 				frm.set_value("gr_no", '');
			// 			}
			// 		}
			// 	}
			// });

		}


	},

	date_of_birth: function (frm) {
		var dif = frappe.datetime.get_day_diff(frm.doc.posting_date, frm.doc.date_of_birth)
		var age = dif / 365
		if (age < 8) {
			frappe.msgprint("Incorrect Date of Birth, Student age is less then required age")
			frm.set_value("date_of_birth", '');
		}
	},
	posting_date: function (frm) {
		if (frm.doc.date_of_birth) {
			frm.set_value("date_of_birth", '');
		}
		if (frm.doc.posting_date) {
			frappe.call({
				method: "gsp.gsp.doctype.gsp_student.gsp_student.posting_date_validate",
				args: {
					posting_date: frm.doc.posting_date
				},
				callback: function (r) {
					var data = r.message
					if (data.future_date >= 1) {
						frm.set_value("posting_date", '');
					}


				}

			});
		}
	},
});

frappe.ui.form.on("GSP Monthly Attendance", {
	attendance: function (frm, cdt, cdn) {
		var doc = locals[cdt][cdn]
		if (doc.gsp_month == "January") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "February") {
			if (doc.attendance < 0 || doc.attendance > 29) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "March") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "April") {
			if (doc.attendance < 0 || doc.attendance > 30) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "May") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "June") {
			if (doc.attendance < 0 || doc.attendance > 30) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "July") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "August") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "September") {
			if (doc.attendance < 0 || doc.attendance > 30) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "October") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "November") {
			if (doc.attendance < 0 || doc.attendance > 30) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "December") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please Enter Valid Attendance")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}
		}
	}

});