# Copyright (c) 2013, Frappe Technologies and contributors
# For license information, please see license.txt


import frappe
from frappe.utils import cstr, cint, getdate, get_first_day, get_last_day, date_diff, add_days
from frappe import msgprint, _
from calendar import monthrange

def execute(filters=None):
	
	columns = get_columns(filters)
	gsp_conditions, filters = get_conditions(filters)
	data = get_data(gsp_conditions, filters)
	
	return columns, data

def get_data(gsp_conditions, filters):
	temp_query="""select ggg.division,ggg.gsp_district, 
				count(distinct(ggg.name)) as no_of_Schools, 
				(select sum(total_enrollment) from `tabGirl Stipend Program` where gsp_district=ggg.gsp_district and docstatus = 1) as total_enroll,
				(SELECT count(name) from `tabGSP Student` where gsp_district=gsp.gsp_district and docstatus = 1) as student,
				(SELECT count(name) from `tabGSP Student` where gsp_district=gsp.gsp_district and eligibility_criteria='Eligible' and docstatus = 1) as Eligible,
				(SELECT count(name) from `tabGSP Student` where gsp_district=gsp.gsp_district and eligibility_criteria='Not Eligible' and docstatus = 1) as Not_Eligible, 
				IFNULL((select sum(stipend_received) from `tabGSP Student` where gsp_district=gsp.gsp_district and docstatus = 1),0)
				from `tabGirl Stipend Program` as ggg 
				LEFT join `tabGSP Student` as gsp 
				on ggg.gsp_district=gsp.gsp_district
				where ggg.docstatus = 1 %s

				group by ggg.gsp_district order by ggg.division and ggg.gsp_district """%(gsp_conditions)
	stipends = frappe.db.sql(temp_query, filters)
	return stipends
def get_conditions(filters):
	gsp_conditions=""
	if filters.get("gsp_year"):
		gsp_conditions = "  and year = %(year)s"
	if filters.get("gsp_division"):
		gsp_conditions += "  and gsp_division = %(gsp_division)s"
	if filters.get("gsp_district"):
		gsp_conditions += "  and ggg.gsp_district = %(gsp_district)s "
	# if filters.get("gsp_taluka"):
	# 	gsp_conditions += "  and taluka = %(gsp_taluka)s"
	# if filters.get("gsp_uc"):
	# 	gsp_conditions += "  and u_c = %(gsp_uc)s"
	if filters.get("school"):
		gsp_conditions += "  and ggg.semis_code = %(school)s"
	return gsp_conditions, filters

def get_columns(filters):
	columns = [
		_("Division") + "::180",
		_("District") + ":Link/District:160",
		_("No. of Schools") + "::120",
		_("Total Enrollment ") + "::140",
		_("Total GSP Form") + "::130",
		_("Eligible Students") + "::180",
		_("Ineligible Students") + "::180",
		_("Total Amount Disbursed") + ":Currency:180"
		
		]
		
	return columns
