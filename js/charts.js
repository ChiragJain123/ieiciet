let width = window.innerWidth;
function detachAndUpdateWithWidth(chart) {
	chart.on('created', () => chart.detach());
	window.addEventListener('resize', () => {
		if (window.innerWidth !== width) {
			width = window.innerWidth;
			if (dailyVisitsChart) {
				dailyVisitsChart.update();
			}
			if (dailyRegisteredUsersChart) {
				dailyRegisteredUsersChart.update();
			}
			if (websiteStatsChart) {
				websiteStatsChart.update();
			}
		}
	});
}

function startAnimationForLineChart(chart) {
	chart.on('draw', function (data) {
		if (data.type === 'line' || data.type === 'area') {
			data.element.animate({
				d: {
					begin: 700,
					dur: 700,
					from: data.path
						.clone()
						.scale(1, 0)
						.translate(0, data.chartRect.height())
						.stringify(),
					to: data.path.clone().stringify(),
					easing: Chartist.Svg.Easing.easeOutQuint,
				},
			});
		} else if (data.type === 'point') {
			seq++;
			data.element.animate({
				opacity: {
					begin: 200,
					dur: 500,
					from: 0,
					to: 1,
					easing: 'ease',
				},
			});
		}
	});

	seq = 0;
}

function startAnimationForBarChart(chart) {
	chart.on('draw', function (data) {
		if (data.type === 'bar') {
			seq2++;
			data.element.animate({
				opacity: {
					begin: 200,
					dur: 1000,
					from: 0,
					to: 1,
					easing: 'ease',
				},
			});
		}
	});

	seq2 = 0;
}

// ---------------------------- DashBoard Charts Section ------------------------------------------------------
let dailyVisitsChart = null;
let dailyRegisteredUsersChart = null;
let websiteStatsChart = null;

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function initDashboardPageCharts(
	daysLabel,
	dailyVisitsChartSeries,
	dailyRegisteredUsersSeries,
	visitsCount,
	usersCount
) {
	/* ----------==========     Daily Visits Chart initialization    ==========---------- */

	// <50 => 6, >50 => +16

	const dataDailyVisitsChart = {
		labels: daysLabel,
		series: [dailyVisitsChartSeries],
	};
	const optionsDailyVisitsChart = {
		plugins: [
			Chartist.plugins.ctPointLabels({
				textAnchor: 'middle',
				labelInterpolationFnc: value => value || '0',
			}),
		],
		lineSmooth: Chartist.Interpolation.cardinal({
			tension: 0,
		}),
		low: 0,
		high:
			Math.max(...dailyVisitsChartSeries) < 50
				? Math.max(...dailyVisitsChartSeries) + 6
				: Math.max(...dailyVisitsChartSeries) + 16, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
		chartPadding: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		},
	};

	dailyVisitsChart = new Chartist.Line(
		'#dailyVisitsChart',
		dataDailyVisitsChart,
		optionsDailyVisitsChart
	);

	detachAndUpdateWithWidth(dailyVisitsChart);
	startAnimationForLineChart(dailyVisitsChart);

	/* ----------==========     Daily Registered Users Chart initialization    ==========---------- */

	const dataDailyRegisteredUsersChart = {
		labels: daysLabel,
		series: [dailyRegisteredUsersSeries],
	};

	const optionsDailyRegisteredUsersChart = {
		plugins: [
			Chartist.plugins.ctPointLabels({
				textAnchor: 'middle',
				labelInterpolationFnc: value => value || '0',
			}),
		],
		lineSmooth: Chartist.Interpolation.cardinal({
			tension: 0,
		}),
		low: 0,
		high:
			Math.max(...dailyRegisteredUsersSeries) < 50
				? Math.max(...dailyRegisteredUsersSeries) + 6
				: Math.max(...dailyRegisteredUsersSeries) + 16, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
		chartPadding: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		},
	};

	dailyRegisteredUsersChart = new Chartist.Line(
		'#dailyRegisteredUsersChart',
		dataDailyRegisteredUsersChart,
		optionsDailyRegisteredUsersChart
	);

	// start animation for the Completed Tasks Chart - Line Chart
	detachAndUpdateWithWidth(dailyRegisteredUsersChart);
	startAnimationForLineChart(dailyRegisteredUsersChart);

	/* ----------==========    Website Stats Chart initialization    ==========---------- */

	const dataWebsiteStatsChart = {
		labels: ['Visits', 'Users'],
		series: [[visitsCount, usersCount]],
	};
	// +0
	const optionsWebsiteStatsChart = {
		plugins: [
			Chartist.plugins.ctPointLabels({
				textAnchor: 'middle',
			}),
		],
		axisX: {
			showGrid: false,
		},
		low: 0,
		high: Math.max(visitsCount, usersCount),
		chartPadding: {
			top: 0,
			right: 5,
			bottom: 0,
			left: 0,
		},
	};
	const responsiveOptions = [
		[
			'screen and (max-width: 640px)',
			{
				seriesBarDistance: 5,
				axisX: {
					labelInterpolationFnc: function (value) {
						return value[0];
					},
				},
			},
		],
	];
	websiteStatsChart = Chartist.Bar(
		'#websiteStatsChart',
		dataWebsiteStatsChart,
		optionsWebsiteStatsChart,
		responsiveOptions
	);

	//start animation for the Emails Subscription Chart
	detachAndUpdateWithWidth(websiteStatsChart);
	startAnimationForBarChart(websiteStatsChart);
}

function updateDashboardChartsInfo(dailyVisits, dailyRegisteredUsers) {
	if (dailyVisits[1] === 'inc') {
		for (let ele of document.querySelectorAll(
			'#daily-visits .card-category .material-icons, #daily-visits .card-category .text-percent, #daily-visits .card-category .incOrDec, #daily-visits .card-category .text-remaining'
		)) {
			ele.classList.remove('d-none');
		}
		document
			.querySelector('#daily-visits .card-category .text-constt')
			.classList.add('d-none');
		document
			.querySelector('#daily-visits .card-category > span')
			.classList.remove('text-danger');
		document
			.querySelector('#daily-visits .card-category > span')
			.classList.add('text-success');
		document.querySelector(
			'#daily-visits .card-category .material-icons'
		).innerText = 'trending_up';
		document.querySelector(
			'#daily-visits .card-category .text-percent'
		).innerText = `${dailyVisits[0]}% `;
		document.querySelector(
			'#daily-visits .card-category .incOrDec'
		).innerText = `increase`;
	} else if (dailyVisits[1] === 'dec') {
		for (let ele of document.querySelectorAll(
			'#daily-visits .card-category .material-icons, #daily-visits .card-category .text-percent, #daily-visits .card-category .incOrDec, #daily-visits .card-category .text-remaining'
		)) {
			ele.classList.remove('d-none');
		}
		document
			.querySelector('#daily-visits .card-category .text-constt')
			.classList.add('d-none');
		document
			.querySelector('#daily-visits .card-category > span')
			.classList.remove('text-success');
		document
			.querySelector('#daily-visits .card-category > span')
			.classList.add('text-danger');
		document.querySelector(
			'#daily-visits .card-category .material-icons'
		).innerText = 'trending_down';
		document.querySelector(
			'#daily-visits .card-category .text-percent'
		).innerText = `${dailyVisits[0]}% `;
		document.querySelector(
			'#daily-visits .card-category .incOrDec'
		).innerText = `decrease`;
	} else {
		for (let ele of document.querySelectorAll(
			'#daily-visits .card-category .material-icons, #daily-visits .card-category .text-percent, #daily-visits .card-category .incOrDec, #daily-visits .card-category .text-remaining'
		)) {
			ele.classList.add('d-none');
		}
		document
			.querySelector('#daily-visits .card-category .text-constt')
			.classList.remove('d-none');
	}

	if (dailyRegisteredUsers[1] === 'inc') {
		for (let ele of document.querySelectorAll(
			'#daily-registered-users .card-category .material-icons, #daily-registered-users .card-category .text-percent, #daily-registered-users .card-category .incOrDec, #daily-registered-users .card-category .text-remaining'
		)) {
			ele.classList.remove('d-none');
		}
		document
			.querySelector(
				'#daily-registered-users .card-category .text-constt'
			)
			.classList.add('d-none');
		document
			.querySelector('#daily-registered-users .card-category > span')
			.classList.remove('text-danger');
		document
			.querySelector('#daily-registered-users .card-category > span')
			.classList.add('text-success');
		document.querySelector(
			'#daily-registered-users .card-category .material-icons'
		).innerText = 'trending_up';
		document.querySelector(
			'#daily-registered-users .card-category .text-percent'
		).innerText = `${dailyRegisteredUsers[0]}% `;
		document.querySelector(
			'#daily-registered-users .card-category .incOrDec'
		).innerText = `increase`;
	} else if (dailyRegisteredUsers[1] === 'dec') {
		for (let ele of document.querySelectorAll(
			'#daily-registered-users .card-category .material-icons, #daily-registered-users .card-category .text-percent, #daily-registered-users .card-category .incOrDec, #daily-registered-users .card-category .text-remaining'
		)) {
			ele.classList.remove('d-none');
		}
		document
			.querySelector(
				'#daily-registered-users .card-category .text-constt'
			)
			.classList.add('d-none');
		document
			.querySelector('#daily-registered-users .card-category > span')
			.classList.remove('text-success');
		document
			.querySelector('#daily-registered-users .card-category > span')
			.classList.add('text-danger');
		document.querySelector(
			'#daily-registered-users .card-category .material-icons'
		).innerText = 'trending_down';
		document.querySelector(
			'#daily-registered-users .card-category .text-percent'
		).innerText = `${dailyRegisteredUsers[0]}% `;
		document.querySelector(
			'#daily-registered-users .card-category .incOrDec'
		).innerText = `decrease`;
	} else {
		for (let ele of document.querySelectorAll(
			'#daily-registered-users .card-category .material-icons, #daily-registered-users .card-category .text-percent, #daily-registered-users .card-category .incOrDec, #daily-registered-users .card-category .text-remaining'
		)) {
			ele.classList.add('d-none');
		}
		document
			.querySelector(
				'#daily-registered-users .card-category .text-constt'
			)
			.classList.remove('d-none');
	}
}

function fetchUsersListAndUdpateTable() {
	db.ref(`users`).on('value', snapshot => {
		let users = snapshot.val();
		let tbody = document.querySelector(
			'#dashboard-users-list-card .card-body table tbody'
		);
		let spinnerWrapper = document.getElementById('spinner-loader-wrapper');
		let table = document.querySelector(
			'#dashboard-users-list-card .card-body table'
		);
		let cardBody = document.querySelector(
			'#dashboard-users-list-card .card-body'
		);
		cardBody.style.overflowY = 'hidden';
		tbody.innerHTML = '';
		let index = 1;
		for (let uid in users) {
			tbody.innerHTML += `
                <tr>
                    <th scope="row">${index}</th>
                    <td>${uid}</td>
                    <td>${users[uid].firstName}</td>
                    <td>${users[uid].lastName}</td>
                    <td>${users[uid].email}</td>
                    <td>${users[uid].role}</td>
                </tr>
            `;
			index++;
		}
		setTimeout(() => {
			spinnerWrapper.classList.add('spin-loaded');
			cardBody.classList.remove('loading');
			table.classList.remove('d-none');
			setTimeout(() => {
				spinnerWrapper.classList.add('d-none');
				cardBody.style.overflowY = null;
			}, 1100);
		}, 1000);
	});
}
