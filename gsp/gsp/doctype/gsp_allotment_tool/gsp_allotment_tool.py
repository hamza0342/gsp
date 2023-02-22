# Copyright (c) 2022, Frappe Technologies and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, os
from frappe import msgprint, _
from frappe.model.document import Document
import json
import requests
from frappe.utils.pdf import get_pdf
from PyPDF2 import PdfFileWriter
from frappe.utils.background_jobs import enqueue
import ast

class GSPAllotmentTool(Document):
	pass

@frappe.whitelist()
def get_schools(year=None, division=None, district=None, taluka=None, args_value=None):
	where = ""
	if year:
		where = " and year = '" + year + "'"
	if division :
		where += " and region = '" + division + "'"
	if district:
		where += " and district = '" + district + "'"
	if taluka:
		where += " and taluka = '" + taluka + "'"
	conditions = ""
	args_va = ast.literal_eval(args_value)

	for key in args_va:
		if str(key[1]) in ['=','!=', 'in','like','not like','<','>','<=','>=','Between']:
			if key[1] == 'Between':
				conditions = conditions + " and "+ str(key[0]) + " " + str(key[1]) + " '" + str(key[2][0]) + "' and '" + str(key[2][1]) + "'"
			if key[1] == 'in':
				in_tuple = tuple(key[2])
				conditions = conditions + " and "+ str(key[0]) + " " + str(key[1]) + " " + str(in_tuple) + " "			
			else:
				conditions = conditions + " and "+ str(key[0]) + " " + str(key[1]) + " '" + str(key[2]) + "'"

	query_e = """select name, semis_code, status_detail,school_name, school_gender from `tabASC` where docstatus!='2' {0} {1}""".format(conditions,where)

	data = frappe.db.sql(query_e,as_dict=1)

	return data

# @frappe.whitelist()
# def update_status_background(data=None,year=None, division=None, district=None, taluka=None):
# 	enqueued_method = 'gsp.gsp.doctype.gsp_allotment_tool.gsp_allotment_tool.update_status'
# 	frappe.enqueue(enqueued_method, queue='default', timeout=None, event=None,is_async=True, job_name=None, now=False, enqueue_after_commit=False, data=data, year=year, division=division, district=district, taluka=taluka)
# 	frappe.msgprint("DONE")

@frappe.whitelist()
def update_status(data=None,year=None, division=None, district=None, taluka=None):
	where = ""
	# if year:
	# 	where = " year = '" + year + "'"
	if division :
		where += " and division = '" + division + "'"
	if district:
		where += " and district = '" + district + "'"
	if taluka:
		where += " and taluka = '" + taluka + "'"
	conditions = ""
	data = json.loads(data)
	default_year = frappe.db.get_single_value("ASC Panel", "default_year")
	if data:
		schools = frappe.db.sql("Select name from tabSchool where semis_code != '' and gsp_criteria = 'Yes' {0} {1} ".format(conditions, where))
		if schools:
			for semis_code in schools:
				school = frappe.get_doc("School", semis_code[0])
				print(semis_code)

				if len(school.yearly_criteria_history) > 0:
					for row in school.yearly_criteria_history:
						if row.year == default_year:
							row.gsp_criteria = 'No'
						else:
							school.append("yearly_criteria_history",{
								'year' : default_year,
								'gsp_criteria' : 'No',
							})
				school.gsp_criteria = 'No'
				school.save(ignore_permissions = True)
		for row in data:
			school = frappe.get_doc("School", row.semis_code)
			if len(school.yearly_criteria_history) > 0:
				for row in school.yearly_criteria_history:
					if row.year == default_year:
						row.gsp_criteria = 'Yes'
					else:
						school.append("yearly_criteria_history",{
							'year' : default_year,
							'gsp_criteria' : 'Yes',
						})
			school.gsp_criteria = 'Yes'
			school.save(ignore_permissions = True)
		return 1
	else:
		return 0

@frappe.whitelist()
def update_only(data=None):
	data = json.loads(data)
	default_year = frappe.db.get_single_value("ASC Panel", "default_year")
	if data:
		for row in data:
			school = frappe.get_doc("School", row.get("semis_code"))
			if len(school.yearly_criteria_history) > 0:
				for row in school.yearly_criteria_history:
					if row.year == default_year:
						row.gsp_criteria = 'Yes'
					else:
						school.append("yearly_criteria_history",{
							'year' : default_year,
							'gsp_criteria' : 'Yes',
						})
			school.gsp_criteria = 'Yes'
			school.save(ignore_permissions = True)
		return 1
	else:
		return 0