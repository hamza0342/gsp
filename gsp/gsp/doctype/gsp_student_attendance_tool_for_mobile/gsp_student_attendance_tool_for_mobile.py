# Copyright (c) 2022, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import json

class GSPStudentAttendanceToolForMobile(Document):
	def validate(self):
		if self.students_attendance:
			for row in self.students_attendance:
				student = frappe.get_doc("GSP Student", row.gsp_name)
				if student.docstatus == 2:
					continue
				attendance_name = frappe.db.sql("Select  name from `tabGSP Monthly Attendance` where parent = '%s' and gsp_month = '%s'"%(student.name,self.month))
				if attendance_name:
					attendance = frappe.get_doc("GSP Monthly Attendance",attendance_name[0][0])
				else:	
					attendance = frappe.new_doc("GSP Monthly Attendance")
				attendance.gsp_month=self.month
				attendance.attendance=int(row.attendance)
				attendance.girl_stipend_program= student.school
				attendance.save(ignore_permissions = True)
				name = attendance.name
				if name:
					frappe.db.set_value("GSP Monthly Attendance", name, 'parent' , student.name)
					frappe.db.set_value("GSP Monthly Attendance", name, 'parentfield' ,'gsp_student_attendance')
					frappe.db.set_value("GSP Monthly Attendance", name, 'parenttype' , 'GSP Student')
				student.reload()
				
				student.save()
				student_ = frappe.get_doc("GSP Student", row.gsp_name)
				student_.save()


@frappe.whitelist()
def get_months():
	default_year = frappe.db.get_single_value("ASC Panel", "default_year")
	months=frappe.db.sql("SELECT `gsp_month` FROM `tabGSP Monthly Attendance` WHERE `parent`='GSP-%s' and `release_stipend`=1 order by `idx`"%(default_year))
	return months

@frappe.whitelist()
def get_school_details(school= None):
	default_year = frappe.db.get_single_value("ASC Panel", "default_year")

	school_name=frappe.db.sql("SELECT `school_name` FROM `tabSchool` WHERE `name`='%s' "%(school))

	gsp_name = frappe.db.sql("Select name from `tabGirl Stipend Program` where year='%s' and semis_code = '%s' "%(default_year,school))
	if not gsp_name:
		frappe.throw("Please create girl stipend form first for this school")
	data = {
		'school_name' : school_name[0][0],
		'gsp_name' : gsp_name[0][0],
	}
	return data

@frappe.whitelist()
def get_working_days(gsp_name=None,month=None):
	days=frappe.db.sql("SELECT `attendance` FROM `tabGSP Monthly Attendance` WHERE `parent`='%s' and `gsp_month`= '%s'"%(gsp_name, month))
	if not days:
		frappe.throw("Please enter working days in Girl Stipend Program first for this month")
	return days[0][0]

@frappe.whitelist()
def gsp_section(gsp_name= None, attendance_class=None):
	default_year = frappe.db.get_single_value("ASC Panel", "default_year")
	months=frappe.db.sql("SELECT DISTINCT `section` FROM `tabGSP Student` WHERE `school`='%s' and class_of_student = '%s' "%(gsp_name,attendance_class))
	return months

@frappe.whitelist()
def get_attendance(gsp_name= None, attendance_class=None, section = None, month = None):
	cnods = ""
	if attendance_class:
		cnods += " and class_of_student = '%s' "%(attendance_class)
	if section:
		cnods += " and section = '%s' "%(section)

	temp_query = """Select s.name as gsp_name , student_name, father_guardian_name, gr_no, IFNULL(a.attendance,0) as attendance
		from 
		(Select * from `tabGSP Student` where school = '%s' %s) s 
		left join (Select * from 
		`tabGSP Monthly Attendance` where gsp_month = '%s')a
		on s.name = a.parent 
		"""%(gsp_name,cnods,month)
	# frappe.msgprint(temp_query)
	data=frappe.db.sql(temp_query, as_dict = 1)
	if not data:
		frappe.throw("No student exists for this school")
	return data