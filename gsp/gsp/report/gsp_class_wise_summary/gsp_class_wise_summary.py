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
	query = """select 
			   class_of_student, 
			   case when class_of_student = 'Class VI' then (select sum(class_vi) from `tabGirl Stipend Program` where docstatus = 1 {cond}) when class_of_student = 'Class IX' then (select sum(class_ix) from `tabGirl Stipend Program` where docstatus = 1 {cond}) when class_of_student = 'Class X' then (select sum(class_x) from `tabGirl Stipend Program` where docstatus = 1 {cond}) else 0 end as total, 
			   count(name),
			   sum(case when eligibility_criteria = 'Eligible' then 1 else 0 end) as Eligible, 
			   sum(case when eligibility_criteria = 'Not Eligible' then 1 else 0 end) as aaa, 
			   sum(stipend_received) as Amount 
			   from `tabGSP Student` 
			   where docstatus = 1 {cond} 
			   group by class_of_student 
			   order by class_of_student """.format(cond=conditions)
	smc_fund = frappe.db.sql(query, filters)
	return smc_fund
def get_conditions(filters):
	conditions=""
	if filters.get("year"):
		conditions = " and gsp_year = %(year)s"
	if filters.get("gsp_division"):
		conditions += "  and gsp_division = %(gsp_division)s"
	if filters.get("gsp_district"):
		conditions += " and gsp_district = %(gsp_district)s"
	if filters.get("school"):
		conditions += " and semis_code = %(school)s"
	return conditions, filters

def get_columns(filters):
	columns = [
		_("Class") + ":Data:240",
		_("Total Students") + ":Int:240",
		_("Total GSP Forms") + ":Int:240",
		_("Eligible Students") + ":Int:240",
		_("Ineligible Students") + ":Int:240",
		_("Total Amount") + ":Currency:240",
		]
		
	return columns
	
''' 
smc_fund = frappe.db.sql("""select tbl2.descrip,(tbl2.total) as stdsum,
								
								sum(case when tbl1.eligibility_criteria = 'Eligible' then 1 else 0 end) as eligible,
								sum(case when tbl1.eligibility_criteria = 'Not Eligible' then 1 else 0 end) as not_eligible,
								SUM(tbl1.stipend_received) as total_amount
								from (
        						SELECT name,descrip,SUM(VALUE) as total 
        						FROM(
            					SELECT name,SUM(`class_vi`)VALUE,'Class VI' AS descrip FROM `tabGirl Stipend Program` 
           						UNION 
            					SELECT name,SUM(`class_ix`)VALUE,'Class IX' AS descrip FROM `tabGirl Stipend Program` 
            					UNION 
           						SELECT name,SUM(`class_x`)VALUE,'Class X' AS descrip FROM `tabGirl Stipend Program`
        						)src 
       							WHERE 1  
        						GROUP BY descrip) as tbl2 
								right join `tabGSP Student` as tbl1  on tbl2.descrip=tbl1.class
								WHERE tbl1.docstatus = 1 %s
 								group by tbl2.descrip"""% conditions, filters)
	return smc_fund
'''
