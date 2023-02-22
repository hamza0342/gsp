# Copyright (c) 2022, Frappe Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class GSPPanel(Document):
	def validate(self):
		# self.check_child_tables()
		self.recalculate()
		if self.default_panel:
			init_default = frappe.db.sql("""update `tabGSP Panel` set default_panel = 0 where default_panel = 1 and name != '%s' """%(self.name))

	def check_child_tables(self):
		if len(self.gsp_values) >=1:
			start=1
			for data in self.gsp_values:
				if int(data.attendance_percentage) >=99:
					frappe.throw(
                            "Maximum percentage not greater then 99")
				for s in self.gsp_values[start:]:
					if data.district==s.district:
						frappe.throw(
                            "Duplicate entry for District" +" "+s.district+"")
				start+=1

	def recalculate(self):
		students_init = frappe.db.sql("""update 
							`tabGSP Student`
							set eligibility_criteria = 'Not Eligible', stipend_received = 0
							where eligibility_criteria = 'Eligible' and gsp_year='%s' 
						"""%(self.year),as_dict=1)
		for d in self.gsp_values:
			# self.year = '2021-22'
			students = frappe.db.sql("""select 
										name
										from `tabGSP Student` 
										where gsp_district='%s' and gsp_year='%s' 
									"""%(d.district, self.year),as_dict=1)
			gsp_schools_ = frappe.db.sql("""select 
										name
										from `tabGirl Stipend Program` 
										where gsp_district='%s' and year='%s' 
									"""%(d.district, self.year),as_dict=1)
			gsp_schools = []
			if gsp_schools_:
				for row in gsp_schools_:						
					gsp_schools.append(row.name)
				if len(gsp_schools) == 1:
					gsp_schools.append(gsp_schools[0])
				gsp_schools = tuple(gsp_schools)

			allowed_months = []
			if self.month_selection:
				for row in self.month_selection:
					if row.release_stipend == 1:
						allowed_months.append(row.gsp_month)
			if len(allowed_months) == 1:
				allowed_months.append(allowed_months[0])
			allowed_months = tuple(allowed_months)

			if allowed_months and gsp_schools:
				total_woring_days = frappe.db.sql("Select parent , sum(attendance) as working_days FROM  `tabGSP Monthly Attendance` where parent in %s and gsp_month in %s GROUP BY parent"%(gsp_schools,allowed_months),as_dict = 1)
				if total_woring_days:
					for row in 	total_woring_days:
						# frappe.msgprint(frappe.as_json(row.))
						gsp_school = row.parent
						# frappe.throw(gsp_school)	
						student_names = frappe.db.sql("Select name from `tabGSP Student` where school = '%s' "%(gsp_school))
						# frappe.throw(frappe.as_json(student_names))	

						if student_names:
							for student_name in student_names:
								attendance = frappe.db.sql("Select SUM(attendance) from `tabGSP Monthly Attendance` where parent = '%s' and gsp_month in %s "%(student_name[0],allowed_months))	
								att=attendance[0][0]
								if not att:
									percentage=0
								else:
									percentage = int(att)/int(row.working_days)*100
									update_students = frappe.db.sql("update `tabGSP Student` set percentage = %s where  name = '%s' "%(percentage, student_name[0]))

			
			update_students = frappe.db.sql("""update 
							`tabGSP Student`
							set eligibility_criteria = 'Eligible',
							stipend_received ='%s'							
							where class_of_student='Class VI' and percentage > '%s' and gsp_district='%s' and gsp_year='%s'
						"""%(d.vi, d.attendance_percentage, d.district, self.year),as_dict=1)
			update_students = frappe.db.sql("""update 
							`tabGSP Student`
							set eligibility_criteria = 'Eligible',
							stipend_received ='%s'							
							where class_of_student='Class IX' and percentage > '%s' and  gsp_district='%s' and gsp_year='%s' 
						"""%(d.ix, d.attendance_percentage, d.district, self.year),as_dict=1)
			update_students = frappe.db.sql("""update 
							`tabGSP Student`
							set eligibility_criteria = 'Eligible',
							stipend_received ='%s'
							where class_of_student='Class X' and percentage > '%s' and  gsp_district='%s' and gsp_year='%s' 
						"""%(d.x, d.attendance_percentage, d.district, self.year),as_dict=1)	

	# def check_eligible(self):
	# 	check_district = frappe.db.sql(""" Select 
	# 						fv.district
	# 						from `tabGSP Panel` p
	# 						inner join `tabGSP Factors values` fv
	# 						on p.name=fv.parent
	# 						where fv.district='%s' and p.year='%s' """%(self.gsp_district,self.gsp_year),as_dict=1)				
	# 	if check_district:
	# 		check_attendance = frappe.db.sql(""" Select 
	# 						fv.attendance_percentage
	# 						from `tabGSP Panel` p
	# 						inner join `tabGSP Factors values` fv
	# 						on p.name=fv.parent
	# 						where fv.district='%s' and p.year='%s' """%(self.gsp_district,self.gsp_year),as_dict=1)
	# 		att_mendatory=check_attendance[0].attendance_percentage

	# 		values = []
	# 		if float(self.percentage) > int(att_mendatory):
	# 			if self.class_of_student == "Class VI":
	# 				class_of_student="vi"
	# 			if self.class_of_student == "Class IX":
	# 				class_of_student="ix"
	# 			if self.class_of_student == "Class X":
	# 				class_of_student="x"
	# 			check_allowance = frappe.db.sql(""" Select 
	# 						fv.`%s`
	# 						from `tabGSP Panel` p
	# 						inner join `tabGSP Factors values` fv
	# 						on p.name=fv.parent
	# 						where fv.district='%s' and p.year='%s' """%(class_of_student,self.gsp_district,self.gsp_year))
	# 			self.stipend_received=check_allowance[0][0]
	# 			self.eligibility_criteria="Eligible"
	# 		elif float(self.percentage) < int(att_mendatory):
	# 			self.stipend_received=0
	# 			self.eligibility_criteria="Not Eligible"
	# 	else:
	# 		self.stipend_received=0
	# 		self.eligibility_criteria="Not Eligible"

@frappe.whitelist()
def get_district():
	district = frappe.db.sql("""SELECT district_name FROM `tabDistrict` WHERE 1   """,as_dict=1)
	return district

@frappe.whitelist()
def get_months():
	months =frappe.db.sql("Select month from `tabGSP Months` order by `order`")
	return months

