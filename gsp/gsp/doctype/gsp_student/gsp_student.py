# Copyright (c) 2022, Frappe Technologies and contributors
# For license information, please see license.txt
import os
import frappe
from datetime import datetime # from python std library
from frappe.utils import add_to_date
from frappe.model.document import Document

class GSPStudent(Document):
	def validate(self):
		# self.add_items()
		self.attendance_calculation()
		self.check_negative_values()
		# self.cal_total()
		self.calculate_attendance_percentage()
		self.check_eligible()
		self.check_enrollment()
		if not self.is_new():
			val_ =  0
			self.upload_images(val_)
		self.unique_id_generation_for_student()
		# self.calculate_date()
		# self.update_enrollment()
	# def update_enrollment(self):
	# 	if self.is_new():
	# 		doc_up = frappe.get_doc("Girl Stipend Program",self.school)
	# 		doc_up.added_class_vi=+1
	# 		doc_up.save(ignore_permissions=True)

	def unique_id_generation_for_student(self):
		unique_id = str(self.school) + "-" + str(self.class_of_student) + "-" +  str(self.gr_no)
		self.student_unique_id = unique_id

	def autoname(self):
		from frappe.model.naming import make_autoname
		# if not self.taluka_id:
		# 	self.taluka_id = 0
		family_code_ = str(self.division_id) + str(self.district_id).zfill(2) + str(self.taluka_id).zfill(3)
		family_code_ = make_autoname(str(family_code_) + '.#######')
		student_code = str(family_code_) + "-" + "2"
		self.name = make_autoname(str(student_code) + '.##')
		self.student_id = self.name

	def upload_images(self, val_):
		image_files = frappe.request.files
		if image_files:
			for x in image_files:
				file = image_files[str(x)]
				filenam, file_extension = os.path.splitext(file.filename)
				if str(file_extension) == '.zip':
					break
				content = file.stream.read()
				filename = str(file.filename) + "-" + str(self.gr_no) + ".jpeg"
				file_ = create_file(doctype="GSP Student",docname=str(self.name), fieldname=str(x), folder= "home", content=content, filename=filename)
				if file_:
					if val_:	
						frappe.db.set_value("GSP Student", str(self.name), str(x), file_.file_url)
					else:	
						if str(x) == 'front_guardian_cnic':
							self.front_guardian_cnic = file_.file_url
						if str(x) == 'back_guardian_cnic':
							self.back_guardian_cnic = file_.file_url
	def after_insert(self):
			val_ =  1
			self.upload_images(val_)		
	def on_update(self):
		total_attendance=0
		if len(self.gsp_student_attendance) > 0:
			for row in  self.gsp_student_attendance:
				if not row.attendance:
					row.attendance = 0
				total_attendance = int(total_attendance) + int(row.attendance)
		self.total = total_attendance

	def cal_total(self):
		self.total = self.october + self.november


	def attendance_calculation(self):
		# frappe.msgprint(frappe.as_json(self.gsp_student_attendance))
		if len(self.gsp_student_attendance) > 0:
			school = self.school
			working_days = frappe.db.sql("SELECT gsp_month, attendance FROM `tabGSP Monthly Attendance` where parent = '%s'"%(school),as_dict=1)
			if working_days:
				for row in  self.gsp_student_attendance:
					for wd in working_days:
						if row.gsp_month == wd.gsp_month:
							if int(row.attendance) > int(wd.attendance):
								frappe.throw("School working days are less then Student attendance in %s"%(row.gsp_month))
			else:
				frappe.throw("Working days are not found for this school")
		total_attendance = 0
		if len(self.gsp_student_attendance) > 0:
			for row in  self.gsp_student_attendance:
				if not row.attendance:
					row.attendance = 0
				total_attendance = int(total_attendance) + int(row.attendance)
		self.total = total_attendance


	def add_items(self):
		self.total=self.october+self.november
		if self.october>int(self.working_days_oct):
			frappe.throw("School working days are less then Student attendance in October")
		if self.november>int(self.working_days_nov):
			frappe.throw("School working days are less then Student attendance in November")
	def check_negative_values(self):
		if self.october and self.october < 0:
			frappe.throw("Number is negative at attended for Current Academic Year")
		if self.november and self.november < 0:
			frappe.throw("Number is negative at attended for Current Academic Year")
	def calculate_attendance_percentage(self):
		gsp_panel = 'GSP-' + self.gsp_year
		attendance=0

		allowed_months_ = frappe.db.sql("SELECT gsp_month FROM `tabGSP Monthly Attendance` where parent = '%s' and release_stipend = 1"%(gsp_panel),as_dict=1)
		allowed_months = []
		if allowed_months_:
			for row in allowed_months_:
				allowed_months.append(row.gsp_month)
			if len(allowed_months) == 1:
				allowed_months.append(allowed_months[0])
			allowed_months = tuple(allowed_months)
		

		school = self.school
		attendance=0

		if allowed_months:
			total_woring_days = frappe.db.sql("Select sum(attendance) FROM `tabGSP Monthly Attendance` where parent = '%s' and gsp_month in %s "%(school,allowed_months))
			if total_woring_days and total_woring_days[0][0]:
				attendance=int(self.total)/int(total_woring_days[0][0])*100

		self.percentage=attendance
	# '''def calculate_date(self):
	# 	posting=self.posting_date
	# 	after_10_year=self.date_of_birth
	# 	calculate = add_to_date(after_10_years,years=8,as_string=True)
	# 	if calculate > posting:
	# 		frappe.throw("Student age is less then 8 year")'''
	
	def check_already_fill(self):
		if self.school:
			if self.gsp_year:
				if self.gr_no:
					check_existing = frappe.db.sql(""" Select 
											count(name)
											from `tabGSP Student`
											where school='%s' and gsp_year='%s' and gr_no='%s'"""%(self.school,self.gsp_year,self.gr_no))
					if check_existing[0][0] > 1:
						frappe.throw("That's Gr# already exist in same year with in same school")
	def check_enrollment(self):
		school = self.school
		class_of_student = self.class_of_student
		enrollment = frappe.db.sql(""" Select 
						class_vi ,class_ix ,class_x 
						from `tabGirl Stipend Program`
						where name='%s' """%(school),as_dict=1)
		if enrollment:
			if enrollment[0].class_ix > 0 or enrollment[0].class_vi > 0 or enrollment[0].class_x > 0:
				total_form=frappe.db.sql(""" Select 
									count(name) as form_fill
									from `tabGSP Student`
									where class_of_student='%s' and school='%s' and docstatus != 2"""%(class_of_student,school),as_dict=1)
				
				filled=total_form[0].form_fill
				if class_of_student == "Class VI":
					if enrollment[0].class_vi < filled:
						frappe.throw("You can't create form more than the total number of students in the Class VI")
						return 1
				if class_of_student == "Class IX":
					if enrollment[0].class_ix < filled:
						frappe.throw("You can't create form more than the total number of students in the Class IX")
						return 1
				if class_of_student == "Class X":
					if enrollment[0].class_x < filled:
						frappe.throw("You can't create form more than the total number of students in the Class X")
						return 1
			else:
				frappe.throw("School has zero enrollment")
		else:
			frappe.throw("School has zero enrollment")
		# enrollment = frappe.db.sql(""" Select 
		# 					class_vi ,class_ix ,class_x 
		# 					from `tabGirl Stipend Program`
		# 					where name='%s' """%(self.school),as_dict=1)
		# if enrollment:
		# 	total_form=frappe.db.sql(""" Select 
		# 						count(class_of_student) as form_fill
		# 						from `tabGSP Student`
		# 						where class_of_student='%s' and school='%s' and docstatus = 1 """%(self.class_of_student,self.school),as_dict=1)
		# 	if total_form:
		# 		filled=total_form[0].form_fill
		# 		if enrollment[0].class_vi <=filled or enrollment[0].class_ix <=filled or enrollment[0].class_x <=filled:
		# 				frappe.throw("You can't create form more than the total number of students in the class")	

	def check_eligible(self):
		check_district = frappe.db.sql(""" Select 
							fv.district
							from `tabGSP Panel` p
							inner join `tabGSP Factors values` fv
							on p.name=fv.parent
							where fv.district='%s' and p.year='%s' """%(self.gsp_district,self.gsp_year),as_dict=1)				
		if check_district:
			check_attendance = frappe.db.sql(""" Select 
							fv.attendance_percentage
							from `tabGSP Panel` p
							inner join `tabGSP Factors values` fv
							on p.name=fv.parent
							where fv.district='%s' and p.year='%s' """%(self.gsp_district,self.gsp_year),as_dict=1)
			att_mendatory=check_attendance[0].attendance_percentage

			values = []
			if float(self.percentage) > int(att_mendatory):
				if self.class_of_student == "Class VI":
					class_of_student="vi"
				if self.class_of_student == "Class IX":
					class_of_student="ix"
				if self.class_of_student == "Class X":
					class_of_student="x"
				check_allowance = frappe.db.sql(""" Select 
							fv.`%s`
							from `tabGSP Panel` p
							inner join `tabGSP Factors values` fv
							on p.name=fv.parent
							where fv.district='%s' and p.year='%s' """%(class_of_student,self.gsp_district,self.gsp_year))
				self.stipend_received=check_allowance[0][0]
				self.eligibility_criteria="Eligible"
			elif float(self.percentage) < int(att_mendatory):
				self.stipend_received=0
				self.eligibility_criteria="Not Eligible"
		else:
			self.stipend_received=0
			self.eligibility_criteria="Not Eligible"
				
@frappe.whitelist()
def exceed_enrollment(school=None,class_of_student=None):
	enrollment = frappe.db.sql(""" Select 
						class_vi ,class_ix ,class_x 
						from `tabGirl Stipend Program`
						where name='%s' """%(school),as_dict=1)
	if enrollment:
		if enrollment[0].class_ix > 0 or enrollment[0].class_vi > 0 or enrollment[0].class_x > 0:
			print("enrollment")
			total_form=frappe.db.sql(""" Select 
								count(name) as form_fill
								from `tabGSP Student`
								where class_of_student='%s' and school='%s' and docstatus != 2"""%(class_of_student,school),as_dict=1)
			
			filled=total_form[0].form_fill
			if class_of_student == "Class VI":
				print("Class VI")
				print(enrollment[0].class_vi)
				print(filled)


				if enrollment[0].class_vi <= filled:
					print("Class VI")

					frappe.msgprint("You can't create form more than the total number of students in the Class VI")
					return 1
			if class_of_student == "Class IX":
				if enrollment[0].class_ix <= filled:
					frappe.msgprint("You can't create form more than the total number of students in the Class IX")
					return 1
			if class_of_student == "Class X":
				if enrollment[0].class_x <= filled:
					frappe.msgprint("You can't create form more than the total number of students in the Class X")
					return 1
		else:
			frappe.throw("School has zero enrollment")
	else:
		frappe.throw("School has zero enrollment")

@frappe.whitelist()
def working_days(school=None):
	if school:
		squirrel_cage = frappe.db.sql(""" Select 
						total
						from `tabGirl Stipend Program`
						where name='%s' """%(school),as_dict=1)
		return squirrel_cage[0]


@frappe.whitelist()
def check_gr(school=None,gsp_year=None,gr_no=None):
	if school:
		if gsp_year:
			if gr_no:
				check_existing = frappe.db.sql(""" Select 
										count(name)
										from `tabGSP Student`
										where school='%s' and gsp_year='%s' and gr_no='%s'"""%(school,gsp_year,gr_no))
									
				if check_existing[0][0] >= 1:
					frappe.msgprint(frappe.as_json("That's Gr# already exist in same year with in same school"))
					return {"gr":check_existing[0][0]}
@frappe.whitelist()
def posting_date_validate(posting_date=None):
	if posting_date:
		today = datetime.now().strftime('%Y-%m-%d')
		if today < posting_date:
			frappe.msgprint("Future date should not selected")
			return {"future_date":1}

@frappe.whitelist()
def get_months():
	months =frappe.db.sql("Select month from `tabGSP Months` order by `order`")
	return months


@frappe.whitelist()
def check_school():
	school= frappe.db.sql("Select for_value from `tabUser Permission` where allow = 'School' and  user = %s",frappe.session.user)[0]
	name= frappe.db.sql("Select school from `tabGSP Student` where semis_code = %s",school)[0]
	if name:
		return name

@frappe.whitelist(allow_guest=True)
def create_file(doctype=None, docname = None, fieldname = None, folder = None, content=None, filename=None):
	content = content
	filename = filename
	is_private = 1
	doctype = doctype
	docname = docname
	fieldname = fieldname
	file_url = frappe.form_dict.file_url
	folder = folder
	frappe.local.uploaded_file = content
	frappe.local.uploaded_filename = filename
	ret = frappe.get_doc({
		"doctype": "File",
		"attached_to_doctype": doctype,
		"attached_to_name": docname,
		"attached_to_field": fieldname,
		"folder": folder,
		"file_name": filename,
		"file_url": file_url,
		"is_private": is_private,
		"content": content
	})
	ret.save(ignore_permissions=True)
	return ret
