let assignFirebase = () => {};
{
	let firebase = null;
	let db = null;
	assignFirebase = (firebaseObject, dbObject) => {
		firebase = firebaseObject;
		db = dbObject;

		assignFirebase = null;
	};

	function getFormattedDateAndTime(date) {
		// ------------------- Date Section ---------------------------
		let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
		let month =
			date.getMonth() < 10
				? `0${date.getMonth() + 1}`
				: date.getMonth() + 1;
		let year = date.getFullYear();

		// ------------------ Time Section ----------------------------
		let hours =
			date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
		let am_pm = date.getHours() >= 12 ? 'p.m' : 'a.m';
		hours = hours < 10 ? `0${hours}` : hours;
		let minutes =
			date.getMinutes() < 10
				? `0${date.getMinutes()}`
				: date.getMinutes();
		let seconds =
			date.getSeconds() < 10
				? `0${date.getSeconds()}`
				: date.getSeconds();
		return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${am_pm}`;
	}

	function fetchRegisteredEventsAndShow() {
		let userRef = db.ref(`users/${localStorage.getItem('uid')}`);
		userRef.on('value', snapshot => {
			const userData = snapshot.val();

			let tbody = document.querySelector(
				'#events-list-card .card-body table tbody'
			);
			let spinnerWrapper = document.getElementById(
				'spinner-loader-wrapper'
			);
			let table = document.querySelector(
				'#events-list-card .card-body table'
			);
			let cardBody = document.querySelector(
				'#events-list-card .card-body'
			);
			cardBody.style.overflowY = 'hidden';

			if (userData.registeredEvents) {
				db.ref(`events`).on('value', snapshot => {
					tbody.innerHTML = '';
					let eventData = snapshot.val();
					let arr = [];
					for (let event of userData.registeredEvents) {
						arr.push(eventData[event.id]);
					}
					arr.sort(
						(a, b) =>
							new Date(a.date).getTime() -
							new Date(b.date).getTime()
					);

					let ind = 1;
					for (let event of arr) {
						let formattedDateAndTime = getFormattedDateAndTime(
							new Date(event.date)
						);
						tbody.innerHTML += `
                                <tr>
                                    <th>${ind}</th>
                                    <td>${event.name}</td>
                                    <td>${formattedDateAndTime}</td>
                                </tr>
                            `;

						if (ind === arr.length) {
							spinnerWrapper.classList.add('spin-loaded');
							cardBody.classList.remove('loading');
							table.classList.remove('d-none');
							setTimeout(() => {
								spinnerWrapper.classList.add('d-none');
								cardBody.style.overflowY = null;
							}, 1000);
						}

						ind++;
					}
				});
			} else {
				tbody.innerHTML = `
                    <tr>
                        <td colspan=3 style="text-align: center;">No Data Found</td>
                    </tr>
                `;
				spinnerWrapper.classList.add('spin-loaded');
				cardBody.classList.remove('loading');
				table.classList.remove('d-none');
				setTimeout(() => {
					spinnerWrapper.classList.add('d-none');
					cardBody.style.overflowY = null;
				}, 1000);
			}
		});
	}
}
