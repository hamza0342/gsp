# Copyright (c) 2013, Frappe Technologies and contributors
# For license information, please see license.txt


import frappe
from frappe.utils import cstr, cint, getdate, get_first_day, get_last_day, date_diff, add_days
from frappe import msgprint, _
from calendar import monthrange

def execute(filters=None):
	
	columns = get_columns(filters)
	conditions, filters = get_conditions(filters)
	data = get_data(conditions, filters)
	
	return columns, data

def get_data(conditions, filters):
	smc_fund = frappe.db.sql("""SELECT gsp_division,gsp_district,gsp_taluka,gr_no,student_name,father_guardian_name,relation,class_of_student,section,(working_days_nov+working_days_oct) as school_days,ROUND(percentage,2),eligibility_criteria,stipend_received
								from `tabGSP Student` 
								WHERE docstatus = 1 %s """% conditions, filters)
	return smc_fund

def get_conditions(filters):
	conditions=""
	if filters.get("gsp_year"):
		conditions = "  and gsp_year = %(gsp_year)s"
	if filters.get("gsp_division"):
		conditions += "  and gsp_division = %(gsp_division)s"
	if filters.get("gsp_district"):
		conditions += "  and gsp_district = %(gsp_district)s "
	# if filters.get("gsp_taluka"):
	# 	conditions += "  and gsp_taluka = %(gsp_taluka)s"
	# if filters.get("gsp_uc"):
	# 	conditions += "  and gsp_uc = %(gsp_uc)s"
	if filters.get("school"):
		conditions += "  and semis_code = %(school)s"
	return conditions, filters

def get_columns(filters):
	columns = [
		_("Division") + ":Link/Division:120",
		_("District") + ":Link/District:120",
		_("Taluka/Town") + "::120",
		# _("UC") + "::120",
		_("G.R. Number") + "::120",
		_("Student Name") + "::120",
		_("Father/ Guardian Name") + "::120",
		_("Relation") + "::120",
		_("Class") + "::120",
		_("Section") + "::120",
		_("School days") + "::120",
		_("Attendance (%)") + "::130",
		_("Status") + "::130",
		_("Total Amount Disbursed") + "::120"
		
		]
		
	return columns
