// Copyright (c) 2022, Frappe Technologies and contributors
// For license information, please see license.txt
frappe.require([
	'/assets/semis_theme/js/personal_detail_validation.js',
]);
frappe.ui.form.on('Girl Stipend Program', {

	before_load: function (frm) {
		var df = frappe.meta.get_docfield("GSP Monthly Attendance", "release_stipend", frm.doc.name);
		df.hidden = 1;
		var df = frappe.meta.get_docfield("GSP Monthly Attendance", "gsp_month", frm.doc.name);
		df.read_only = 1;
		frm.refresh_fields();
	},
	onload: function (frm) {
		frm.set_query("semis_code", function () {
			return {
				"filters": [
					// ["School", "gender", "!=", "Boys"],
					["School", "gsp_criteria", "=", "Yes"],
				]
			};
		});

		var table = frm.doc.working_days

		if (frm.is_new() && table.length == 0) {
			frappe.call({
				method: "gsp.gsp.doctype.girl_stipend_program.girl_stipend_program.get_months",
				// async: false,
				args: {
					year: frm.doc.year,
				},
				callback: function (response) {
					var months = response.message;
					cur_frm.clear_table("working_days");
					for (let i = 0; i < months.length; i++) {
						var childTable = cur_frm.add_child("working_days");
						childTable.gsp_month = months[i].gsp_month
						childTable.attendance = 0
						// console.log(childTable.attendance);
						cur_frm.refresh_fields("working_days");
					}

				}
			})
			frm.set_value("total", 0)

		}
		// else {
		// 	console.log("Old Form");
		// 	frappe.call({
		// 		method: "gsp.gsp.doctype.girl_stipend_program.girl_stipend_program.get_months",
		// 		// async: false,
		// 		args: {
		// 			year: frm.doc.year,
		// 		},
		// 		callback: function (response) {
		// 			var months = response.message;
		// 			// console.log("Months R", months);
		// 			var child_table = frm.doc.working_days
		// 			console.log("data", months);
		// 			cur_frm.clear_table("working_days");
		// 			for (let i = 0; i < months.length; i++) {
		// 				//check 
		// 				for (let j = 0; j < months.length; j++) {
		// 					if (months[i][0] == months[j].gsp_month) {
		// 						var childTable = cur_frm.add_child("working_days");
		// 						childTable.gsp_month = months[i].gsp_month
		// 						childTable.attendance = child_table[j].attendance
		// 						cur_frm.refresh_fields("working_days");
		// 					}
		// 				}
		// 			}
		// 		}
		// 	});

		// 	frm.get_field("working_days").grid.cannot_add_rows = true;
		// }
		frm.get_field("working_days").grid.cannot_add_rows = true;

	},
	// onload_post_render: function (frm) {

	// 	// $("input[data-fieldname='gsp_month']").attr('readonly', true);
	// 	$("input[data-fieldname='release_stipend']").hide()
	// 	$("input[data-fieldtype='Check']").attr('disabled', true)


	// },
	refresh: function (frm) {
		$("input[data-fieldname='cnic_head_teacher']").attr("placeholder", "xxxxx-xxxxxxx-x")
		$("input[data-fieldname='cnic_head_teacher']").attr("placeholder", "xxxxx-xxxxxxx-x")
		$("input[data-fieldname='head_cell_no']").mask('0000-0000000');
		$("input[data-fieldname='head_cell_no']").attr("placeholder", "03xx-xxxxxxx")

		$("input[data-fieldname='cnic_head_teacher']").mask('00000-0000000-0');
		$("input[data-fieldname='november']").mask('00');
		$("input[data-fieldname='october']").mask('00');
		$("input[data-fieldname='class_ix']").mask('000');
		$("input[data-fieldname='class_x']").mask('000');
		$("input[data-fieldname='class_vi']").mask('000');
		frm.get_field("working_days").grid.cannot_add_rows = true;

	},
	onload_post_render: function (frm) {
		$("input[data-fieldname='cnic_head_teacher']").attr("placeholder", "xxxxx-xxxxxxx-x")
		$("input[data-fieldname='head_cell_no']").mask('0000-0000000');
		$("input[data-fieldname='cnic_head_teacher']").mask('00000-0000000-0');
		$("input[data-fieldname='november']").mask('00');
		$("input[data-fieldname='october']").mask('00');
		$("input[data-fieldname='class_ix']").mask('000');
		$("input[data-fieldname='class_x']").mask('000');
		$("input[data-fieldname='class_vi']").mask('000');
	},
	semis_code: function (frm) {
		if (frm.doc.semis_code) {
			frappe.call({
				method: "gsp.gsp.doctype.girl_stipend_program.girl_stipend_program.semis_code_exist",
				args: {
					semis_code: frm.doc.semis_code,
					year: frm.doc.year
				},
				callback: function (r) {
					const school_user = frappe.user_roles.includes("School User");
					if (r.message) {
						if (school_user == true) {
							const gsp_url = "girl-stipend-program/" + `${r.message.name}`
							frappe.set_route(gsp_url);
						}
						else {
							frm.set_value("semis_code", '')
							frm.set_value("school_address", '')
							frm.set_value("division", '')
							frm.set_value("gsp_district", '')
							frm.set_value("u_c", '')
							frm.set_value("taluka", '')
						}
					}
				}
			})
		}
		// if (frm.doc.gsp_gender == "Boys") {
		// 	frappe.msgprint("School gender can't be boys.")
		// 	frm.set_value("semis_code", '')
		// }
	},
	year: function (frm) {
		frappe.call({
			method: "gsp.gsp.doctype.girl_stipend_program.girl_stipend_program.get_months",
			// async: false,
			args: {
				year: frm.doc.year,
			},
			callback: function (r) {
				// var month = response.message;

				var month = r.message;
				// console.log(month)
				cur_frm.clear_table("working_days");


				for (let i = 0; i < month.length; i++) {
					var childTable = cur_frm.add_child("working_days");
					childTable.gsp_month = month[i].gsp_month
					cur_frm.refresh_fields("working_days");
				}

			}
		})
	},
	class_vi: function (frm) {
		frm.set_value("total_enrollment", frm.doc.class_ix + frm.doc.class_x)

		if (frm.doc.class_vi) {
			frm.set_value("total_enrollment", '')
			$("input[data-fieldname='class_vi']").focusout(function () {
				var account = frm.doc.class_vi
				if (account > 999) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Value Between 0 to 999")
					frm.set_value("class_vi", '')
					frm.set_value("total_enrollment", '')
				}
			});
			if (!Number.isInteger(frm.doc.class_vi)) {
				frm.set_value("class_vi", '')
			}
			if (frm.doc.class_vi < 0) {
				frm.set_value("class_vi", '')
				frappe.msgprint("Must be a valid number.")
			}
			if (!frm.doc.class_vi) {
				frm.doc.class_vi = 0;
			}
			if (!frm.doc.class_ix) {
				frm.doc.class_ix = 0;
			}
			if (!frm.doc.class_x) {
				frm.doc.class_x = 0;
			}

			var total = frm.doc.class_vi + frm.doc.class_ix + frm.doc.class_x;
			frm.set_value("total_enrollment", total);
		}
	},
	class_ix: function (frm) {

		frm.set_value("total_enrollment", frm.doc.class_vi + frm.doc.class_x)
		if (frm.doc.class_ix) {
			frm.set_value("total_enrollment", '')
			$("input[data-fieldname='class_ix']").focusout(function () {
				var account = frm.doc.class_ix
				if (account > 999) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Value Between 0 to 999")
					frm.set_value("class_ix", '')
					frm.set_value("total_enrollment", '')
				}
			});
			if (!Number.isInteger(frm.doc.class_ix)) {
				frm.set_value("class_ix", '')
			}
			if (frm.doc.class_ix < 0) {
				frm.set_value("class_ix", '')
				frappe.msgprint("Must be a valid number.")
			}
			if (!frm.doc.class_vi) {
				frm.doc.class_vi = 0;
			}
			if (!frm.doc.class_ix) {
				frm.doc.class_ix = 0;
			}
			if (!frm.doc.class_x) {
				frm.doc.class_x = 0;
			}

			var total = frm.doc.class_vi + frm.doc.class_ix + frm.doc.class_x;
			frm.set_value("total_enrollment", total);
		}
	},
	class_x: function (frm) {
		frm.set_value("total_enrollment", frm.doc.class_vi + frm.doc.class_ix)
		if (frm.doc.class_x) {
			frm.set_value("total_enrollment", '')
			$("input[data-fieldname='class_x']").focusout(function () {
				var account = frm.doc.class_x
				if (account > 999) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Value Between 0 to 999")
					frm.set_value("class_x", '')
					frm.set_value("total_enrollment", '')
				}
			});
			if (!Number.isInteger(frm.doc.class_x)) {
				frm.set_value("class_x", '')
			}
			if (frm.doc.class_x < 0) {
				frm.set_value("class_x", '')
				frappe.msgprint("Must be a valid number.")
			}
			if (!frm.doc.class_vi) {
				frm.doc.class_vi = 0;
			}
			if (!frm.doc.class_ix) {
				frm.doc.class_ix = 0;
			}
			if (!frm.doc.class_x) {
				frm.doc.class_x = 0;
			}

			var total = frm.doc.class_vi + frm.doc.class_ix + frm.doc.class_x;
			frm.set_value("total_enrollment", total);
		}
	},

	name_deo: function (frm) {
		if (frm.doc.name_deo != '') {
			$("input[data-fieldname='name_deo']").keypress(function (e) {
				onlyalpha(e);
			});
			$("input[data-fieldname='name_deo']").focusout(function () {
				var name = frm.doc.name_deo
				if (!(name_validate(name))) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Valid Concerned DEO Name")
					frm.set_value("name_deo", '')
				}
			});
		}

	},
	head_cell_no: function (frm) {
		if (frm.doc.head_cell_no) {
			$("input[data-fieldname='head_cell_no']").focusout(function () {
				var num = frm.doc.head_cell_no
				if (!(phone_validate(num))) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter valid Head Teacher Cell#")
					frm.set_value("head_cell_no", '')
				}
			});
		}
	},
	head_name: function (frm) {
		if (frm.doc.head_name != '') {
			$("input[data-fieldname='head_name']").keypress(function (e) {
				onlyalpha(e);
			});
			$("input[data-fieldname='head_name']").focusout(function () {
				var name = frm.doc.head_name
				if (!(name_validate(name))) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Valid Head Teacher Name")
					frm.set_value("head_name", '')
				}
			});
		}
	},
	cnic_head_teacher: function (frm) {
		if (frm.doc.cnic_head_teacher) {
			$("input[data-fieldname='cnic_head_teacher']").focusout(function () {
				var cnic = frm.doc.cnic_head_teacher
				if (!(cnic_validate(cnic))) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Valid Head Teacher CNIC#")
					frm.set_value("cnic_head_teacher", '')
				}
			});
		}
	},
	october: function (frm) {
		frm.set_value("total", frm.doc.november)
		if (frm.doc.october) {
			frm.set_value("total", '')
			$("input[data-fieldname='october']").focusout(function () {
				var account = frm.doc.october
				if (account > 31) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Valid Number for the no. of Days School Opened")
					frm.set_value("october", '')
					frm.set_value("total", '')
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
			var total_att = frm.doc.october + frm.doc.november;
			frm.set_value("total", total_att);
		}

	},
	november: function (frm) {
		frm.set_value("total", frm.doc.october)
		if (frm.doc.november) {
			frm.set_value("total", '')
			$("input[data-fieldname='november']").focusout(function () {
				var account = frm.doc.november
				if (account > 30) {
					$(".msgprint").empty()
					frappe.msgprint("Please Enter Valid Number for the no. of Days School Opened")
					frm.set_value("november", '')
					frm.set_value("total", '')
				}
			});
			if (!Number.isInteger(frm.doc.november)) {
				frm.set_value("november", '')
			}
			if (frm.doc.november < 0) {
				frm.set_value("november", '')
				frappe.msgprint("Must be a valid number.")
			}
			if (!frm.doc.october) {
				frm.doc.october = 0;
			}
			if (!frm.doc.november) {
				frm.doc.november = 0;
			}
			var total_att = frm.doc.october + frm.doc.november;
			frm.set_value("total", total_att);
		}

	},

});
frappe.ui.form.on("GSP Monthly Attendance", {
	attendance: function (frm, cdt, cdn) {
		var doc = locals[cdt][cdn]
		if (doc.gsp_month == "January") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "February") {
			if (doc.attendance < 0 || doc.attendance > 29) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "March") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "April") {
			if (doc.attendance < 0 || doc.attendance > 30) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "May") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "June") {
			if (doc.attendance < 0 || doc.attendance > 30) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "July") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "August") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "September") {
			if (doc.attendance < 0 || doc.attendance > 30) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "October") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "November") {
			if (doc.attendance < 0 || doc.attendance > 30) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}

		} else if (doc.gsp_month == "December") {
			if (doc.attendance < 0 || doc.attendance > 31) {
				frappe.msgprint("Please enter valid No. of Working Days")
				frappe.model.set_value(cdt, cdn, "attendance", 0);
			}
		}
	}

});