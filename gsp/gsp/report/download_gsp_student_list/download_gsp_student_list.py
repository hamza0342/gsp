# Copyright (c) 2013, Frappe Technologies and contributors
# For license information, please see license.txt


import frappe
from frappe import msgprint, _

def execute(filters=None):
	columns = get_columns(filters)
	conditions, filters = get_conditions(filters)
	data = get_data(conditions, filters)
	return columns, data

def get_data(conditions, filters):
	smc_fund = frappe.db.sql("""SELECT 
								name,
								class_of_student,
								section,
								gr_no,
								student_name,
								date_of_birth,
								father_guardian_name,
								cnic_of_guardian,
								mob_no_guardian,
								relation,
								gsp_attendance,
								total
								from `tabGSP Student` 
								WHERE docstatus != 2 %s 
								order by gsp_division, gsp_district, school_name  """% conditions, filters)
	return smc_fund

def get_conditions(filters):
	conditions=""
	# if filters.get("gsp_year"):
	# 	conditions = "  and gsp_year = %(gsp_year)s"
	# if filters.get("gsp_division"):
	# 	conditions += "  and gsp_division = %(gsp_division)s"
	# if filters.get("gsp_district"):
	# 	conditions += "  and gsp_district = %(gsp_district)s "
	# if filters.get("gsp_taluka"):
	# 	conditions += "  and gsp_taluka = %(gsp_taluka)s"
	# if filters.get("gsp_uc"):
	# 	conditions += "  and gsp_uc = %(gsp_uc)s"
	if filters.get("school"):
		conditions += "  and semis_code = %(school)s"
	return conditions, filters

def get_columns(filters):
	columns = [
		_("Student ID") + "::160",
		_("Class") + "::100",
		_("Section") + "::80",
		_("G.R #") + "::80",
		_("Student Name") + "::140",
		_("Date Of Birth") + "::110",
		_("Guardian Name") + "::130",
		_("Guardian CNIC") + "::150",
		_("Guardian Phone") + "::140",
		_("Relation") + "::90",
		_("School Working Days") + "::160",
		_("Attendance") + "::100",
		]
		
	return columns

@frappe.whitelist()
def get_school():
	school= frappe.db.sql("Select for_value from `tabUser Permission` where allow = 'School' and  user = %s",frappe.session.user)
	if school:
		return school[0][0]