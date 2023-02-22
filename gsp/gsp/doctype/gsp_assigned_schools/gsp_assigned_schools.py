# Copyright (c) 2022, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class GSPAssignedSchools(Document):
	pass

@frappe.whitelist()
def get_schools():
	default_year=frappe.db.get_single_value("ASC Panel", "default_year")
	current_user = frappe.session.user
	temp_query = """SELECT distinct(per.school), per.school_name , ros.year, IFNULL(per.date_format, "-") as planned_date FROM `tabGSP Roster` ros inner join `tabSchool Permission` per on ros.name = per.parent where ros.year='%s' AND ros.user = '%s' and per.parentfield = 'school_permission' and per.parenttype ='GSP Roster' order by per.planned_date """%(default_year,str(current_user))
	data = frappe.db.sql(temp_query,as_dict=1)
	if not data:
		return frappe.throw("Not Assigned Any School For GSP")
	final_data = []
	semis_string=""
	year_string=""
	count=1
	main_data = []
	if data:
		for row in data:
			dict_ = row
			dict_['gsp_name'] = ""
			dict_['completion_check'] = ""
			assigned_school = (row['school'])
			get_asc = frappe.db.sql("select name, docstatus from `tabGirl Stipend Program` where semis_code=%s and year=%s ",(assigned_school, default_year))
			if get_asc:
				dict_['gsp_name'] = get_asc[0][0]
				dict_['completion_check'] = get_asc[0][1]
			main_data.append(dict_)
			year = row['year']
			# if get_asc:
			# 	dict_['asc_name'] = get_asc[0][0]
			# 	dict_['completion_check'] = get_asc[0][1]
			# main_data.append(dict_)
			# year = row['year']
			if(count==1):
				semis_string += " semis_code = '%s' " %(assigned_school)
				year_string += " year = '%s' "%(year)
				count=count+1
			else:
				semis_string += " OR semis_code = '%s' " %(assigned_school)
				year_string += " OR year = '%s' "%(year)
	final_data.append(main_data)		
	status_code="IFNULL(SUM(CASE WHEN docstatus=0 then 1 else 0 END),0) as incomplete_form,	IFNULL(SUM(CASE WHEN docstatus=1 then 1 else 0 END),0) as census_completed"
	asc_query = """SELECT %s FROM `tabGirl Stipend Program` where year='%s' AND %s """%(status_code,default_year,semis_string)
	asc_data = frappe.db.sql(asc_query,as_dict=1)
	final_data.append(asc_data)
	final_data.append(len(assigned_school))
	return final_data 


