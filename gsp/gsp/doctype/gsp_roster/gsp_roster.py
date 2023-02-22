# Copyright (c) 2022, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class GSPRoster(Document):
	def validate(self):
		self.check_dublicate()
		self.create_asc_permission()
		self.get_permitted_school()
	def check_dublicate(self):
		sch_list = []
		for x in self.school_permission:
			sch_list.append(x.school)
		for val in sch_list:
			if int(sch_list.count(val)) > 1:
				frappe.throw("School " + str(val) + " Appears Multiple Time")
	def on_trash(self):
		for val in ['District', 'School', 'Year', 'Division']:
			remove_permission(self.user, str(val))
		'''doc = frappe.get_doc("User", self.user)
		doc.enabled = 0
		doc.save()'''
	# arslan
	def create_asc_permission(self):
		for val in ['District', 'School', 'Year', 'Division']:
			remove_permission(self.user, str(val))
		# apply permission on district
		new_permission(self.user, 'District', self.district)
		new_permission(self.user, 'Year', self.year)
		get_division = frappe.db.get_value("District", self.district, "division")
		if get_division:
			new_permission(self.user, 'Division', get_division)
		# apply permissio on school
		for data in self.school_permission:
			new_permission(self.user, 'School', data.school)
			if data.planned_date:
				data.date_format = frappe.utils.formatdate(data.planned_date, "dd-MMM-yyyy")
			else:
				data.date_format = None
				

	def get_permitted_school(self):
		for d in self.school_permission:
			already_exist = frappe.db.sql(""" SELECT p.school FROM `tabSchool Permission` p LEFT JOIN `tabASC Roster` r 
					on p.parent=r.name where r.year=%s and r.district =%s and p.school=%s and r.name!=%s  """,
					(str(self.year), str(self.district), str(d.school), str(self.name)),as_dict=1)
			if already_exist:
				frappe.throw("School " + str(already_exist[0]["school"]) + " already Assigned in " + str(self.year))
			 
def verify_permission(user, allow ,value):
	return frappe.db.get_value("User Permission", {"user":user, "allow":allow, "for_value": value},"name")

# remove user permissions
def remove_permission(user, allow):
	frappe.db.sql(""" delete from `tabUser Permission` where user='{0}' and allow='{1}'""".format(user, allow))
# latest user permission
def new_permission(user, allow ,value):
	if not frappe.db.exists({'doctype': 'User Permission','user': user, 'allow': allow, 'for_value': value}):
		doc = frappe.new_doc("User Permission")
		doc.user = user
		doc.allow = allow
		doc.for_value = value
		doc.save(ignore_permissions=True)

@frappe.whitelist()
def edit_table(union_council=None,district=None,taluka=None):
	conditions = ""
	if union_council:
		conditions += "  and union_council = '%s' " % str(union_council)
	if district:
		conditions += "  and district = '%s' " % str(district)
	if taluka:
		conditions += "  and taluka = '%s' " % str(taluka)
	classes_ = frappe.db.sql(""" select name,school_name from `tabSchool` 
	where docstatus !=2  %s """ % (conditions),as_dict=1)
	return classes_