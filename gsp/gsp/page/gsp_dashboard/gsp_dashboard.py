import frappe

@frappe.whitelist()
def get_data(year = None, division = None, district = None, taluka= None):
    cons = ""
    gsp_cons = ""
    sch_cons = ""
    if year:
        cons += " and year = '%s' "%(year)
        gsp_cons += " and gsp_year = '%s' "%(year)
        # sch_cons = "
    if division:
        cons += " and  division = '%s' "%(division)
        gsp_cons += " and  gsp_division = '%s' "%(division)
        sch_cons += " and division = '%s' "%(division)
    if district:
        cons += " and  gsp_district = '%s' "%(district)
        gsp_cons += " and  gsp_district = '%s' "%(district)
        sch_cons += " and  district = '%s' "%(district)
    if taluka:
        cons += " and  taluka = '%s' "%(taluka)
        gsp_cons += " and  taluka = '%s' "%(taluka)
        sch_cons += " and  taluka = '%s' "%(taluka)

    total_schools = frappe.db.sql("Select Count(*)  from tabSchool where enabled = 1 %s "%(sch_cons))
    eligible_schools = frappe.db.sql("Select Count(*)  from tabSchool where gsp_criteria = 'Yes'  %s "%(sch_cons))

    temp_query = """SELECT Count(*) as forms_created, IFNULL(SUM(IFNULL(total_enrollment,0)),0) as total_enrollment
                    from `tabGirl Stipend Program` 
                    where docstatus != 2 %s 
                    """%(cons)
    data = frappe.db.sql(temp_query, as_dict=1)
    temp_query2 = "Select Count(*) as forms_created, IFNULL(SUM(CASE WHEN eligibility_criteria = 'Eligible' and docstatus = 1 THEN 1 ELSE 0 END),0) as eligible_students,  IFNULL(SUM(CASE WHEN  docstatus = 1 THEN stipend_received ELSE 0 END),0) as stipend_received from `tabGSP Student` where docstatus != 2   %s "%(gsp_cons)
    # frappe.msgprint(total_schools)
    eligible_students = frappe.db.sql(temp_query2, as_dict = 1 )
    
    if data:
        data[0]["totals"] = total_schools[0]
        data[0]["eligible_schls"] = eligible_schools[0]
        if eligible_students:
            data[0]['eligible_students'] = eligible_students[0]['eligible_students']
        else:
            data[0]['eligible_students'] = 0
        if eligible_students:
            data[0]['stipend_received'] = eligible_students[0]['stipend_received']
        else:
            data[0]['stipend_received'] = 0
        if eligible_students:
            data[0]['total_enrollment'] = eligible_students[0]['forms_created']
        else:
            data[0]['total_enrollment'] = 0
        if eligible_schools and data[0]['forms_created']:
            data[0]['forms_percentage'] = round(data[0]['forms_created'] / eligible_schools[0][0] *100 , 2)
        else:
            data[0]['forms_percentage'] = 0
        
    return data

@frappe.whitelist()
def class_data(year = None, division = None, district = None, taluka= None):
    cons = ""
    if year:
        cons += " and gsp_year = '%s' "%(year)
    if division:
        cons += " and  gsp_division = '%s' "%(division)
    if district:
        cons += " and  gsp_district = '%s' "%(district)
    if taluka:
        cons += " and  taluka = '%s' "%(taluka)

    temp_query = """SELECT Count(*) as forms_created,
    SUM(CASE WHEN class_of_student = 'Class VI' and docstatus = 1 then IFNULL(stipend_received,0) else 0 end) as  six,
    SUM(CASE WHEN class_of_student = 'Class IX' and docstatus = 1 then IFNULL(stipend_received,0) else 0 end) as  nine,
    SUM(CASE WHEN class_of_student = 'Class X' and docstatus = 1 then IFNULL(stipend_received,0) else 0 end) as  ten 
    from `tabGSP Student`
    where docstatus != 2 %s 

    """%(cons)

    data = frappe.db.sql(temp_query, as_dict=1 )
    # if data:
    #     if data[0]['forms_created'] and data[0]['six']:
    #         data[0]['six'] = round(data[0]['six'] / data[0]['forms_created'] *100 ,1 ) 
    #     else:
    #         data[0]['six'] = 0
    #     if data[0]['forms_created'] and data[0]['nine']:
    #         data[0]['nine'] = round(data[0]['nine'] / data[0]['forms_created'] *100 ,1 ) 
    #     else:
    #         data[0]['nine'] = 0
    #     if data[0]['forms_created'] and data[0]['ten']:
    #         data[0]['ten'] = round(data[0]['ten'] / data[0]['forms_created'] *100 ,1 ) 
    #     else:
    #         data[0]['ten'] = 0

    return data


@frappe.whitelist()
def location_data(year = None, division = None, district = None, taluka= None):
    cons = ""
    if year:
        cons += " and gsp_year = '%s' "%(year)
    if division:
        cons += " and  gsp_division = '%s' "%(division)
    if district:
        cons += " and  gsp_district = '%s' "%(district)
    if taluka:
        cons += " and  taluka = '%s' "%(taluka)

    temp_query = """SELECT Count(*) as forms_created,
    SUM(CASE WHEN location = 'Urban' and docstatus = 1 then IFNULL(stipend_received,0) else 0 end) as  urban,
    SUM(CASE WHEN location = 'Rural' and docstatus = 1 then IFNULL(stipend_received,0) else 0 end) as  rural
    from `tabGSP Student`
    where docstatus != 2 %s 

    """%(cons)

    data = frappe.db.sql(temp_query, as_dict=1 )
    # if data:
    #     if data[0]['forms_created'] and data[0]['rural']:
    #         data[0]['rural'] = round(data[0]['rural'] / data[0]['forms_created'] *100 ,1 ) 
    #     else:
    #         data[0]['rural'] = 0

    #     if data[0]['forms_created'] and data[0]['urban']:
    #         data[0]['urban'] = round(data[0]['urban'] / data[0]['forms_created'] *100 ,1 ) 
    #     else:
    #         data[0]['urban'] = 0
    return data


@frappe.whitelist()
def draw_map(year = None, division = None, district = None, taluka= None):
    cons = ""
    if year:
        cons += " and k.gsp_year = '%s' "%(year)
    if division:
        cons += " and  d.division = '%s' "%(division)
    if district:
        cons += " and  d.name = '%s' "%(district)
    # if taluka:
    #     cons += " and  tehsil = '%s' "%(taluka)

    temp_query = """Select d.name as name,  
    SUM(CASE WHEN k.gsp_district = d.name then 1 else 0 end) as forms_created,
    SUM(CASE WHEN k.gsp_district = d.name then IFNULL(stipend_received,0) else 0 end) as value,
    d.path_features as path
    from `tabGSP Student` k,
   
    tabDistrict d 

     where k.docstatus != 2 and d.name != 'Keamari Karachi' %s group by d.name """%(cons)
    # frappe.msgprint(frappe.as_json(temp_query))
      
    data = frappe.db.sql(temp_query, as_dict=1) 
    data = sorted(data, key=lambda x: x['value'], reverse=True)
    return data

@frappe.whitelist()
def district_for_lsu(user):
    district = frappe.db.sql("select for_value as district from `tabUser Permission` where allow='District' and user=%s", (user), as_dict=True)[0]
    division = frappe.db.sql("select for_value as division from `tabUser Permission` where allow='Division' and user=%s", (user), as_dict=True)[0]
    return district, division