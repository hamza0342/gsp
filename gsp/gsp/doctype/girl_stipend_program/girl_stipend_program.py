# Copyright (c) 2022, Frappe Technologies and contributors
# For license information, please see license.txt
from frappe.utils import pretty_date, now, add_to_date
import frappe
from frappe.model.document import Document
from gsp.gsp.doctype.gsp_student.gsp_student import create_file


class GirlStipendProgram(Document):
	def validate(self):
		self.check_negative_values()
		self.add_items()
		# self.check_gender()
		self.posting_date_check_()
		self.attendance_calculation()
	def on_update_after_submit(self):
		self.upload_images()

	def on_update(self):
		self.upload_images()

	def upload_images(self):
		image_files = frappe.request.files
		if image_files:
			for x in image_files:
				file = image_files[str(x)]
				content = file.stream.read()
				filename = str(file.filename)
				file_ = create_file(doctype="Girl Stipend Program",docname=str(self.name), fieldname="scan_copy", folder= "home", content=content, filename=filename)
				if file_:
					from frappe.core.doctype.file.file import unzip_file
					unzip_file(file_.name)
		gsp_school = self.name
		students = frappe.db.sql("Select name from `tabGSP Student` where school = '%s' "%(gsp_school),as_dict=1)
		if students:
			for std in students:
				stud = frappe.get_doc("GSP Student",std.name)
				if stud.docstatus == 2:
					continue
				stud.save()
				
	# def after_insert(self):
	# 	image_files = frappe.request.files
	# 	print(image_files)
	# 	if image_files:
	# 		from zipfile import ZipFile
	# 		with ZipFile(image_files, 'r') as zip:
	# 			files = zip.extractall()
	# 			zip.printdir()
			# for x in image_files:
			# 	file = image_files[str(x)]
			# 	content = file.stream.read()
			# 	filename = str(file.filename) + "-" + str(self.gr_no) + ".jpeg"
			# 	file_ = create_file(doctype="GSP Student",docname=str(self.name), fieldname=str(x), folder= "home", content=content, filename=filename)
			# 	if file_:
			# 		frappe.db.set_value("GSP Student", self.name, str(x), file_)


	def attendance_calculation(self):
		total_attendance = 0
		if len(self.working_days) > 0:
			for row in  self.working_days:
				if not row.attendance:
					row.attendance = 0
				total_attendance = total_attendance + row.attendance
		self.total = total_attendance
	
	def posting_date_check_(self):
		res = frappe.db.sql(""" select name,from_date, to_date from `tabGSP Panel` where year= %s and %s between from_date and to_date """,(self.year, self.posting_date))
		if len(res) == 0:
			res_ = frappe.db.sql(""" select from_date, to_date from `tabGSP Panel` where year= %s """,(self.year),as_dict=1)
			from_date=frappe.utils.get_datetime(res_[0].from_date).strftime('%d-%m-%Y')
			to_date=frappe.utils.get_datetime(res_[0].to_date).strftime('%d-%m-%Y')
			frappe.throw(" The posting date should be between"+" "+ from_date+" "+ "and"+" "+ to_date)
	
	def check_gender(self):
		if self.gsp_gender=="Boys":
			frappe.throw("School gender can't be boys.")

	def add_items(self):
		self.total_enrollment=self.class_vi+self.class_ix+self.class_x
		self.total=self.october+self.november
	def check_negative_values(self):
		if self.class_vi and self.class_vi < 0:
			frappe.throw("Number is negative at section Enrollment Detail")
		if self.class_ix and self.class_ix < 0:
			frappe.throw("Number is negative at section Enrollment Detail")
		if self.class_x and self.class_x < 0:
			frappe.throw("Number is negative at section Enrollment Detail")

 
@frappe.whitelist()
def get_months(year=None):
	# frappe.msgprint(frappe.as_json(year))
	# months =frappe.db.sql("Select month from `tabGSP Months` order by `order`")
	# return months
	months=frappe.db.sql("SELECT `gsp_month` FROM `tabGSP Monthly Attendance` WHERE `parent`='GSP-%s' and `release_stipend`=1 order by `idx`"%(year),as_dict=1)
	# frappe.msgprint(frappe.as_json(months))
	return months

@frappe.whitelist()
def semis_code_exist(semis_code=None, year=None):
	if frappe.db.exists("Girl Stipend Program", {"semis_code": semis_code}):
		res = frappe.db.sql("""select name from `tabGirl Stipend Program` where semis_code = %s and year = %s """, (semis_code, year), as_dict= True)[0]
		if res:
			return res

