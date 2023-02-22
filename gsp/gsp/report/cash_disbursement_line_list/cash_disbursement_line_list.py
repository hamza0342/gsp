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
	smc_fund = frappe.db.sql("""SELECT 
								gsp.gsp_division,
								gsp.gsp_district,
								gsp.gsp_taluka,
								gsp.school_name,
								gsp.semis_code,
								gsp.student_name,
								gsp.father_guardian_name,
								gsp.cnic_of_guardian,
								gsp.mob_no_guardian,
								gsp.stipend_received,
								gsp.eligibility_criteria
								FROM `tabGSP Student` gsp
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
	if filters.get("semis_code"):
		conditions += "  and school = %(school)s"
	return conditions, filters

def get_columns(filters):
	columns = [
		_("Division") + ":Link/Division:120",
		_("District") + ":Link/District:120",
		_("Taluka") + "::120",
		# _("Union Council") + "::120",
		_("School Name") + "::120",
		_("SEMIS Code") + "::120",
		_("Child Name") + "::130",
		_("Name of Parent / Guardian") + "::130",
		_("CNIC # of P/G") + "::120",
		_("Cell  # of P/G") + "::160",
		_("Amount to be disbursed") + "::220",
		_("Remarks") + "::120"
		]
		
	return columns

# @frappe.whitelist()
# def districts_user(user):
# 	district = frappe.db.sql("select for_value from `tabUser Permission` where user=%s", (user), as_dict=True)[0]
# 	return district