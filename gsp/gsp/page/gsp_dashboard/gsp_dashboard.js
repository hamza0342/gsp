frappe.pages['gsp-dashboard'].on_page_load = async function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'GSP Dashboard',
		single_column: true
	});

	filters.add(page);

}

filters = {
	add: async function (page) {
		let division
		let district
		let district_by_user
		let division_by_user
		let read_only = false;
		var system_manager = frappe.user_roles.includes('System Manager');
		var lsu = frappe.user_roles.includes('LSU');

		if (lsu == true && system_manager == false) {
			await frappe.call({
				method: "frappe.smc.page.smc_dashboard.smc_dashboard.district_for_lsu",
				args: { user: frappe.session.user },
				callback: function (r) {
					division_by_user = r.message[1].division;

					district_by_user = r.message[0].district;
					read_only = true;
				}
			});
		}
		else {
			division_by_user = '';
			district_by_user = '';
		}

		let year = page.add_field({
			label: "Year",
			fieldtype: "Link",
			fieldname: "Year",
			options: "Year",
			default: "2021-22",
			reqd: 1,
		});

		if (read_only == true) {
			division = page.add_field({
				label: "Division",
				fieldtype: "Link",
				fieldname: "division",
				options: "Division",
				read_only: 1,
				default: `${division_by_user}`,
			});
			district = page.add_field({
				label: "District",
				fieldtype: "Link",
				fieldname: "district",
				options: "District",
				read_only: 1,

				default: `${district_by_user}`,
				"get_query": function () {
					if (!school.get_value()) {
						return
					}
					else {
						return {
							"filters": { "district": district.get_value() }
						}
					}
				},
				read_only: 1
			});

		}
		else {
			division = page.add_field({
				label: "Division",
				fieldtype: "Link",
				fieldname: "division",
				options: "Division",
			});
			district = page.add_field({
				label: "District",
				fieldtype: "Link",
				fieldname: "district",
				options: "District",
				default: `${district_by_user}`,
				"get_query": function () {
					return {
						"filters": {
							"division": division.get_value("division"),
						}
					}
				}
			});
		}
		let taluka = page.add_field({
			label: "Taluka",
			fieldtype: "Link",
			fieldname: "taluka",
			options: "Taluka",
			"get_query": function () {
				return {
					"filters": {
						"district": district.get_value("division"),
					}
				}
			}
		});
		let fiterbtn = page.add_field({
			label: "View",
			fieldtype: "Button",
			fieldname: "filter",
			async click() {
				var class_data;
				var location_data;
				var map_data;
				await frappe.call({
					method: "gsp.gsp.page.gsp_dashboard.gsp_dashboard.class_data",
					args: {
						year: year.get_value(),
						division: division.get_value(),
						district: district.get_value(),
						taluka: taluka.get_value(),
					},
					callback: function (r) {
						class_data = r.message[0]

					},
				});
				await frappe.call({
					method: "gsp.gsp.page.gsp_dashboard.gsp_dashboard.location_data",
					args: {
						year: year.get_value(),
						division: division.get_value(),
						district: district.get_value(),
						taluka: taluka.get_value(),
					},
					callback: function (r) {
						location_data = r.message[0]

					},
				});
				await frappe.call({
					method: "gsp.gsp.page.gsp_dashboard.gsp_dashboard.draw_map",
					args: {
						year: year.get_value(),
						division: division.get_value(),
						district: district.get_value(),
						taluka: taluka.get_value(),
					},
					callback: function (r) {
						map_data = r.message;

					},
				});
				await frappe.call({
					method: "gsp.gsp.page.gsp_dashboard.gsp_dashboard.get_data",
					args: {
						year: year.get_value(),
						division: division.get_value(),
						district: district.get_value(),
						taluka: taluka.get_value(),
					},
					freeze: true,
					callback: function (r) {
						$('#gsp_dashboard').remove();

						$(frappe.render_template("gsp_dashboard", r.message[0])).appendTo(page.main);

						classChart(class_data);
						areacontainer(location_data);
						draw_map(map_data);

					},
				});




			},
		});
		var class_data;
		var location_data;
		var map_data;
		await frappe.call({
			method: "gsp.gsp.page.gsp_dashboard.gsp_dashboard.class_data",
			args: {
				year: year.get_value(),
				division: division.get_value(),
				district: district.get_value(),
				taluka: taluka.get_value(),
			},
			callback: function (r) {
				class_data = r.message[0]

			},
		});
		await frappe.call({
			method: "gsp.gsp.page.gsp_dashboard.gsp_dashboard.location_data",
			args: {
				year: year.get_value(),
				division: division.get_value(),
				district: district.get_value(),
				taluka: taluka.get_value(),
			},
			callback: function (r) {
				location_data = r.message[0]

			},
		});
		await frappe.call({
			method: "gsp.gsp.page.gsp_dashboard.gsp_dashboard.draw_map",
			args: {
				year: year.get_value(),
				division: division.get_value(),
				district: district.get_value(),
				taluka: taluka.get_value(),
			},
			callback: function (r) {
				map_data = r.message;

			},
		});
		await frappe.call({
			method: "gsp.gsp.page.gsp_dashboard.gsp_dashboard.get_data",
			args: {
				year: year.get_value(),
				division: division.get_value(),
				district: district.get_value(),
				taluka: taluka.get_value(),
			},
			freeze: true,
			callback: function (r) {
				$('#gsp_dashboard').remove();

				$(frappe.render_template("gsp_dashboard", r.message[0])).appendTo(page.main);

				classChart(class_data);
				areacontainer(location_data);
				draw_map(map_data);

			},
		});
	}
}
function classChart(data) {
	Highcharts.setOptions({
		lang: {
			thousandsSep: ','
		}
	});
	// Build the chart
	Highcharts.chart('classcontainer', {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie',
			width: 320,
			height: 320

		},
		colors: ["#454d66", "#f6d100", "#e27309"],
		credits: {
			enabled: false,
		},
		exporting: {
			enabled: false,
		},
		title: {
			text: "",
		},
		tooltip: {
			pointFormat: '{series.name}: <b>Rs {point.y}</b>'
		},
		accessibility: {
			point: {
				valueSuffix: "Rs",
			},
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false,
					format: "",
					distance: -50,

				},
				showInLegend: true
			}
		},
		series: [{
			name: '',
			colorByPoint: true,
			data: [{
				name: 'Class VI',
				y: data.six,
				sliced: false,
				selected: true
			},
			{
				name: 'Class IX',
				y: data.nine
			}, {
				name: 'Class X',
				y: data.ten
			}]
		}]
	});
}
function areacontainer(data) {
	Highcharts.setOptions({
		lang: {
			thousandsSep: ','
		}
	});
	// Build the chart
	Highcharts.chart('areacontainer', {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie',
			width: 330,
			height: 330

		},
		colors: ["#e27309", "#454d66"],
		credits: {
			enabled: false,
		},
		exporting: {
			enabled: false,
		},
		title: {
			text: "",
		},
		tooltip: {
			pointFormat: '{series.name}: <b>Rs {point.y}</b>'
		},
		accessibility: {
			point: {
				valueSuffix: "Rs",
			},
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false,
					format: "",
					distance: -50,

				},
				showInLegend: true
			}
		},
		series: [{
			name: '',
			colorByPoint: true,
			data: [{
				name: 'Urban',
				y: data.urban,
				sliced: false,
				selected: true
			},
			{
				name: 'Rural',
				y: data.rural
			}]
		}]
	});
}
function draw_map(adata) {
	Highcharts.setOptions({
		lang: {
			thousandsSep: ','
		}
	});
	var series = [{
		type: 'map',
		enableMouseTracking: true,
		showInLegend: false,
		animation: {
			duration: 1000
		},
		data: adata,
		dataLabels: {
			enabled: true,
			color: '#FFFFFF',
			format: '{point.name} <br />Rs {point.value} '
		},
		name: 'Provincial View',
		states: {
			hover: {
				borderColor: '#FFFFFF'
			}
		},
		tooltip: {
			pointFormat: 'District: {point.name} <br /> GSP Forms: {point.forms_created}<br />Amount : {point.value} <br />'
		}
	}];
	Highcharts.mapChart('mapContainer', {
		title: {
			text: ''
		},
		mapNavigation: {
			enabled: true,
			buttonOptions: {
				alignTo: 'spacingBox',
				x: 10
			}
		},
		colorAxis: {
			// dataClasses: [{
			//   from: 0,
			//   to: 5,
			//   color: '#F80000',
			//   name: 'Below 5%'
			// }, {
			//   from: 5,
			//   to: 20,
			//   color: '#F7C10B',
			//   name: '5%-20%'
			// }, {
			//   from: 20,
			//   to: 40,
			//   color: '#4a9957',
			//   name: '21%-40%'
			// }, {
			//   from: 40,
			//   to: 100,
			//   color: '#345C0C',
			//   name: 'Above 40%'
			// }]
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'top',
			floating: true,
		},
		credits: {
			enabled: false,
		},
		exporting: {
			enabled: true
		},
		series: series
	});
}
