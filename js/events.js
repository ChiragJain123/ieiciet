let assignFirebase = () => {};
let fetchUpcomingEventsAndShow = () => {};
let registerEvent = () => {};
let registerMobileNo = () => {};
let confirmOTPAndRegisterEvent = () => {};
let createDropdownMenu = () => {};
let fetchPastEventsAndShow = () => {};
const swipers = [];
{
	// ---------------------------- Common Section ----------------------------------------
	let pastEventsDataRef = null;
	let upcomingEventsDataRef = null;
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'July',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	let firebase = null;
	let db = null;
	let auth = null;
	assignFirebase = (firebaseObject, dbObject) => {
		firebase = firebaseObject;
		db = dbObject;
		auth = firebase.auth();

		assignFirebase = null;
	};
	let getCurrentTime = date => {
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
		return `${hours}:${minutes}:${seconds} ${am_pm}`;
	};

	//  --------------------------------- Upcoming Section ----------------------------------------------
	fetchUpcomingEventsAndShow = () => {
		const themes = ['primary', 'danger', 'success', 'warning', 'info'];
		const upcomingTimeline = document.querySelector('#upcoming-timeline');
		upcomingEventsDataRef?.off('value');
		upcomingEventsDataRef = db.ref('events');
		upcomingEventsDataRef.on('value', snapshot => {
			let eventsData = snapshot.val();
			let arr = [];
			for (const event in eventsData) {
				arr.push(eventsData[event]);
			}
			arr.sort(
				(a, b) =>
					new Date(a.date).getTime() - new Date(b.date).getTime()
			);

			if (arr.length !== 0) {
				upcomingTimeline.classList.remove('no-data');
				let index = 0;
				let themesIndex = 0;
				upcomingTimeline.innerHTML = '';
				for (const event of arr) {
					let isRegistered = false;
					let date = new Date(event.date);
					if (event.tag === 'past') {
						continue;
					}
					if (themesIndex >= themes.length) {
						themesIndex = 0;
					}
					if (event.registeredUsers) {
						for (let user of event.registeredUsers) {
							if (user.uid === localStorage.getItem('uid')) {
								isRegistered = true;
								break;
							}
						}
					}
					upcomingTimeline.innerHTML += `
                        <div class="timeline-container ${themes[themesIndex]}">
                            <div class="timeline-icon" style="background-image: url(${
								event.speakerPosterUrl
							});">
                            </div>
                            <div class="timeline-body">
                                <h4 class="timeline-title"><span class="badge">${
									event.name
								}</span></h4>
                                <p class="event-description">${
									event.description
								}</p>
                                <div class="swiper-container upcomingEvents-swiper-container upcomingEventsTimelineSwiper${index}">
                                    <div class='swiper-wrapper'>
                                    
                                    </div>
                                </div>
                                <div class="timeline-btn-div">
                                    <button class="timeline-btn" id="${
										event.id
									}" onclick="
                                        if(localStorage.getItem('uid')){
                                            this.disabled = true;
                                            registerEvent(this,'${
												event.id
											}', '${event.name}');
                                        }else{
                                            sessionStorage.setItem('eventData', 
                                                JSON.stringify({
                                                    id: '${event.id}',
                                                    name: '${event.name}'
                                                }),
                                            );
                                            sessionStorage.setItem('redirectTo', '/upcoming-events.html');
                                            window.location.assign('/signin.html');
                                        }
                                    " ${isRegistered && 'disabled'}>
                                        ${
											isRegistered
												? 'Registered'
												: 'Register Now'
										}
                                    </button>
                                </div>
                                <p class="timeline-subtitle">
                                    Speaker: ${event?.speakerName || ''}
                                </p>
                                <p class="timeline-subtitle">
                                    Event Date: ${
										months[date.getMonth()]
									} ${date.getDate()}, ${date.getFullYear()}
                                </p>
                                <p class="timeline-subtitle">
                                    Event Timings: ${getCurrentTime(
										new Date(event.date)
									)}
                                </p>
                            </div>
                        </div>
                    `;

					const swiperContainer = document.querySelector(
						`.upcomingEventsTimelineSwiper${index}`
					);
					const timelineSwiper = document.querySelector(
						`.upcomingEventsTimelineSwiper${index} .swiper-wrapper`
					);
					for (let posterUrl of event.posterUrls) {
						timelineSwiper.innerHTML += `
					    <div class='swiper-slide'>
					        <img src='${posterUrl}' class="hidden" onload="
                                this.parentNode.children[1].classList.add('d-none');
                                this.classList.remove('hidden');
					        "/>
					        <div>
					            <div class="spinner-border" role="status">
					                <span class="sr-only">Loading...</span>
					            </div>
					        </div>
					    </div>
					`;
						onload = "this.classList.remove('hidden')";
					}
					swiperContainer.innerHTML += `<div class="swiper-pagination"></div>`;
					index++;
					themesIndex++;
				}
				if (upcomingTimeline.innerHTML === '') {
					upcomingTimeline.classList.add('no-data');
					upcomingTimeline.innerHTML =
						'<div class="timeline-container">New Events Coming Soon!!</div>';
					eventsData = {};
				}
			} else {
				upcomingTimeline.classList.add('no-data');
				upcomingTimeline.innerHTML =
					'<div class="timeline-container">New Events Coming Soon!!</div>';
			}

			document.getElementsByClassName(
				'overlay-loader'
			)[0].style.opacity = 0;

			setTimeout(() => {
				document
					.getElementsByClassName('overlay-loader')[0]
					.classList.add('d-none');
				document.getElementsByClassName(
					'overlay-loader'
				)[0].style.opacity = null;
				let ind = 0;
				if (arr.length !== 0) {
					for (let swiperContainer of document.querySelectorAll(
						'.upcomingEvents-swiper-container'
					)) {
						let swiper = new Swiper(
							`.upcomingEventsTimelineSwiper${ind}`,
							{
								effect: 'cube',
								grabCursor: true,
								cubeEffect: {
									shadow: true,
									slideShadows: true,
									shadowOffset: 20,
									shadowScale: 0.94,
								},
								pagination: {
									el: '.swiper-pagination',
								},
								autoplay: {
									delay: 1500,
									stopOnLastSlide: false,
								},
							}
						);
						swipers.push(swiper);
						ind++;
					}
				}
			}, 1000);
			document.getElementById('root').style.display = null;

			if (sessionStorage.getItem('redirectTo')) {
				let eventData = JSON.parse(sessionStorage.getItem('eventData'));
				if (localStorage.getItem('uid')) {
					registerEvent(
						document.getElementById(eventData.id),
						eventData.id,
						eventData.name
					).then(() => {
						sessionStorage.removeItem('redirectTo');
						sessionStorage.removeItem('eventData');
					});
				} else {
					sessionStorage.removeItem('redirectTo');
					sessionStorage.removeItem('eventData');
				}
			}
		});
	};

	registerEvent = async (e, id, name) => {
		delete window.event;
		let uid = localStorage.getItem('uid');
		let userData = null;
		let eventRef = db.ref(`events/${id}`);
		let userRef = db.ref(`users/${uid}`);
		document.getElementsByClassName('nav-loader')[0].style.visibility =
			'visible';
		await userRef.get().then(snapshot => (userData = snapshot.val()));
		await eventRef.get().then(snapshot => {
			let event = snapshot.val();
			if (event.registeredUsers) {
				for (let user of event.registeredUsers) {
					if (user.email === userData.email) {
						document.getElementsByClassName(
							'nav-loader'
						)[0].style.visibility = null;
						alert('Event Already Registered');
						return;
					}
				}
			}

			if (!userData.mobileNo) {
				window.event = {
					e,
					id,
					name,
				};
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				e.disabled = null;
				document.getElementById('modal').classList.remove('d-none');
				document
					.querySelector('#modal .main.mobileNo')
					.classList.remove('d-none');
				setTimeout(() => {
					let captcha = document.createElement('div');
					captcha.id = 'captcha';
					document.getElementById('root').appendChild(captcha);
					window.recaptchaVerifier =
						new firebase.auth.RecaptchaVerifier('captcha', {
							size: 'invisible',
						});
				}, 100);
				return;
			}

			const userName = `${userData.firstName} ${
				userData.lastName ? userData.lastName : ''
			}`;
			if (event.registeredUsers) {
				event.registeredUsers.push({
					name: userName,
					uid,
					email: userData.email,
					mobileNo: userData.mobileNo,
				});
			} else {
				event.registeredUsers = [
					{
						name: userName,
						uid,
						email: userData.email,
						mobileNo: userData.mobileNo,
					},
				];
			}

			eventRef.update({ ...event }, err => {
				if (err) {
					console.log(err);
					document.getElementsByClassName(
						'nav-loader'
					)[0].style.visibility = null;
					alert(err);
				} else {
					if (userData.registeredEvents) {
						userData.registeredEvents.push({ id, name });
					} else {
						userData.registeredEvents = [{ id, name }];
					}
					userRef.update({ ...userData }, err => {
						if (err) {
							console.log(err);
							alert(err);
						} else {
							resetFormDataAndCloseForm(true);
							document.getElementsByClassName(
								'nav-loader'
							)[0].style.visibility = null;
							setTimeout(
								() => alert('Event Registered Successfully'),
								100
							);
						}
					});
				}
			});
		});
		return;
	};

	registerMobileNo = async e => {
		let error = false;
		const input = document.getElementsByTagName('input');
		for (let i = 0; i < input.length; i++) {
			const desc = document.getElementsByClassName('text-input-error')[i];
			switch (i) {
				case 0:
					if (input[i].value.trim().length !== 10) {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText = 'Invalid Mobile Number';
						error = true;
					} else if (/^0/.test(input[i].value.trim())) {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText = 'No need of 0 in the starting';
						error = true;
					}
					break;
			}
		}

		if (error) {
			return;
		} else {
			document.getElementsByClassName('nav-loader')[0].style.visibility =
				'visible';
		}

		let mobileNo = document.getElementById('mobile').value.trim();

		firebase
			.auth()
			.currentUser.linkWithPhoneNumber(
				`+91${mobileNo}`,
				window.recaptchaVerifier
			)
			.then(function (confirmationResult) {
				window.confirmationResult = confirmationResult;
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				document
					.querySelector('#modal .mobileNo')
					.classList.add('d-none');
				resetFormDataAndCloseForm();
				setTimeout(() => {
					document.getElementById('modal').classList.remove('d-none');
					document
						.querySelector('#modal .verify')
						.classList.remove('d-none');
				}, 100);
			})
			.catch(function (error) {
				console.log(error);
				delete window.recaptchaVerifier;
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				setTimeout(() => alert(`${error}`), 500);
				resetFormDataAndCloseForm();
			});
	};

	confirmOTPAndRegisterEvent = async e => {
		let error = false;
		const input = document.getElementsByClassName('otp-input');
		const desc = document.querySelector('.verify .text-input-error');
		for (let i = 0; i < input.length; i++) {
			if (input[i].value.trim().length === 0) {
				desc.innerText = 'Invalid OTP';
				error = true;
			}
		}

		if (error) {
			return;
		} else {
			document.getElementsByClassName('nav-loader')[0].style.visibility =
				'visible';
		}

		let otp1 = document.getElementById('otp1').value;
		let otp2 = document.getElementById('otp2').value;
		let otp3 = document.getElementById('otp3').value;
		let otp4 = document.getElementById('otp4').value;
		let otp5 = document.getElementById('otp5').value;
		let otp6 = document.getElementById('otp6').value;

		let otp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;

		try {
			const result = await confirmationResult.confirm(otp);
			const user = result.user;
			await db.ref(`users/${localStorage.getItem('uid')}`).update({
				mobileNo: user.phoneNumber,
			});
			registerEvent(window.event.e, window.event.id, window.event.name);
		} catch (err) {
			if (err.code === 'auth/invalid-verification-code') {
				alert(
					'Invalid Verification Code. Please check the OTP and try again'
				);
			} else {
				alert(`Error!! Something went wrong. Please try again later.`);
			}
			console.log(err);
			document.getElementsByClassName('nav-loader')[0].style.visibility =
				null;
		}
	};

	function showRegisteredEventsButton() {
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				document.querySelector(
					'#upcoming-events .conditionalBtn'
				).innerHTML = `<button
					type='button'
					onclick="window.location.href='/registered-events.html'"
				>
					My RegisteredEvents
				</button>`;
			}
		});
	}

	function resetFormDataAndCloseForm(otpForm = false) {
		if (!otpForm) {
			for (let input of document.querySelectorAll(
				'#modal input:not(input.otp-input), #modal textarea'
			)) {
				input.value = '';
				input.classList.remove('error');
				input.parentNode.children[0].classList.remove('input-error');
				input.parentNode.children[2].children[0].innerText = '';
				input.disabled = false;
			}
		} else {
			for (let input of document.querySelectorAll('#modal .otp-input')) {
				input.value = '';
				input.parentNode.parentNode.parentNode.children[2].children[0].innerText =
					'';
				input.disabled = false;
			}
		}
		for (let btn of document.querySelectorAll('#modal button')) {
			btn.disabled = false;
		}
		document.getElementById('captcha') &&
			document
				.getElementById('root')
				.removeChild(document.getElementById('captcha'));
		document.getElementById('modal').classList.add('d-none');
	}

	// ------------------------------- Past Section ------------------------------------------------
	createDropdownMenu = () => {
		const pastTimelineDropdown = document.querySelector(
			'#past-timeline-dropdown'
		);
		const today = new Date();
		pastTimelineDropdown.innerHTML = `
	        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
	            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	            ${today.getFullYear()}
	        </button>
	        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
	            <a class="dropdown-item active" onclick="
	                if(!this.classList.contains('active')){
	                    this.parentNode.parentNode.children[0].innerText = this.innerText;
	                    for(let child of this.parentNode.children){
	                        child.classList.remove('active');
	                    }
	                    this.classList.add('active');
	                    sessionStorage.setItem('switchDropdownMenu', true);
	                    fetchPastEventsAndShow(parseInt(this.innerText));
	                }
	            ">${today.getFullYear()}</a>
	            <a class="dropdown-item" onclick="
	                if(!this.classList.contains('active')){
	                    this.parentNode.parentNode.children[0].innerText = this.innerText;
	                    for(let child of this.parentNode.children){
	                        child.classList.remove('active');
	                    }
	                    this.classList.add('active');
	                    sessionStorage.setItem('switchDropdownMenu', true);
	                    fetchPastEventsAndShow(parseInt(this.innerText));
	                }
	            ">${today.getFullYear() - 1}</a>
	            <a class="dropdown-item" onclick="
	                if(!this.classList.contains('active')){
	                    this.parentNode.parentNode.children[0].innerText = this.innerText;
	                    for(let child of this.parentNode.children){
	                        child.classList.remove('active');
	                    }
	                    this.classList.add('active');
	                    sessionStorage.setItem('switchDropdownMenu', true);
	                    fetchPastEventsAndShow(parseInt(this.innerText));
	                }
	            ">${today.getFullYear() - 2}</a>
	            <a class="dropdown-item" onclick="
	                if(!this.classList.contains('active')){
	                    this.parentNode.parentNode.children[0].innerText = this.innerText;
	                    for(let child of this.parentNode.children){
	                        child.classList.remove('active');
	                    }
	                    this.classList.add('active');
	                    sessionStorage.setItem('switchDropdownMenu', true);
	                    fetchPastEventsAndShow(parseInt(this.innerText));
	                }
	            ">${today.getFullYear() - 3}</a>
	            <a class="dropdown-item" onclick="
	                if(!this.classList.contains('active')){
	                    this.parentNode.parentNode.children[0].innerText = this.innerText;
	                    for(let child of this.parentNode.children){
	                        child.classList.remove('active');
	                    }
	                    this.classList.add('active');
	                    sessionStorage.setItem('switchDropdownMenu', true);
	                    fetchPastEventsAndShow(parseInt(this.innerText));
	                }
	            ">${today.getFullYear() - 4}</a>
	        </div>
	    `;
	};

	fetchPastEventsAndShow = year => {
		const themes = ['primary', 'danger', 'success', 'warning', 'info'];
		const pastTimeline = document.querySelector('#past-timeline');
		pastEventsDataRef?.off('value');
		pastEventsDataRef = db.ref('events');
		pastEventsDataRef.on('value', snapshot => {
			let eventsData = snapshot.val();
			let arr = [];
			for (const event in eventsData) {
				arr.push(eventsData[event]);
			}
			arr.sort(
				(a, b) =>
					new Date(b.date).getTime() - new Date(a.date).getTime()
			);

			if (arr.length !== 0) {
				pastTimeline.classList.remove('no-data');
				let index = 0;
				let themesIndex = 0;
				pastTimeline.innerHTML = '';
				for (const event of arr) {
					let date = new Date(event.date);
					if (date.getFullYear() !== year || event.tag !== 'past') {
						continue;
					}
					if (themesIndex >= themes.length) {
						themesIndex = 0;
					}
					pastTimeline.innerHTML += `
	                    <div class="timeline-container ${themes[themesIndex]}">
	                        <div class="timeline-icon" style="background-image: url(${
								event.speakerPosterUrl
							});">
	                        </div>
	                        <div class="timeline-body">
	                            <h4 class="timeline-title"><span class="badge">${
									event.name
								}</span></h4>
	                            <p class="event-description">${
									event.description
								}</p>
	                            <div class="swiper-container pastEvents-swiper-container pastEventsTimelineSwiper${index}">
	                                <div class='swiper-wrapper'>

	                                </div>
	                            </div>
	                            <p class="timeline-subtitle">
	                                Speaker: ${event?.speakerName || ''}
	                            </p>
	                            <p class="timeline-subtitle">
	                                Organised on: ${
										months[date.getMonth()]
									} ${date.getDate()}, ${date.getFullYear()}
	                            </p>
	                        </div>
	                    </div>
	                `;

					const swiperContainer = document.querySelector(
						`.pastEventsTimelineSwiper${index}`
					);
					const timelineSwiper = document.querySelector(
						`.pastEventsTimelineSwiper${index} .swiper-wrapper`
					);
					for (let posterUrl of event.posterUrls) {
						timelineSwiper.innerHTML += `
					    <div class='swiper-slide'>
					        <img src='${posterUrl}' class="hidden" onload="
                                this.parentNode.children[1].classList.add('d-none');
                                this.classList.remove('hidden');
					        "/>
					        <div>
					            <div class="spinner-border" role="status">
					                <span class="sr-only">Loading...</span>
					            </div>
					        </div>
					    </div>
					`;
						onload = "this.classList.remove('hidden')";
					}
					swiperContainer.innerHTML += `<div class="swiper-pagination"></div>`;
					index++;
					themesIndex++;
				}
				if (pastTimeline.innerHTML === '') {
					pastTimeline.classList.add('no-data');
					pastTimeline.innerHTML =
						'<div class="timeline-container">No Data Found</div>';
					eventsData = {};
				}
			} else {
				pastTimeline.classList.add('no-data');
				pastTimeline.innerHTML =
					'<div class="timeline-container">No Data Found</div>';
			}

			document.getElementsByClassName(
				'overlay-loader'
			)[0].style.opacity = 0;

			setTimeout(() => {
				document
					.getElementsByClassName('overlay-loader')[0]
					.classList.add('d-none');
				document.getElementsByClassName(
					'overlay-loader'
				)[0].style.opacity = null;
				// if (location.hash === '#past-events') {
				// 	location.hash = 'null';
				// 	window.scrollTo(
				// 		0,
				// 		document.getElementById('past-events').offsetTop
				// 	);
				// }
				let ind = 0;
				if (eventsData && Object.keys(eventsData).length !== 0) {
					for (let swiperContainer of document.querySelectorAll(
						'.pastEvents-swiper-container'
					)) {
						let swiper = new Swiper(
							`.pastEventsTimelineSwiper${ind}`,
							{
								effect: 'cube',
								grabCursor: true,
								cubeEffect: {
									shadow: true,
									slideShadows: true,
									shadowOffset: 20,
									shadowScale: 0.94,
								},
								pagination: {
									el: '.swiper-pagination',
								},
								autoplay: {
									delay: 1500,
									stopOnLastSlide: false,
								},
							}
						);
						swipers.push(swiper);
						ind++;
					}
				}
				// if (window.sessionStorage.getItem('switchDropdownMenu')) {
				// 	window.scrollTo(
				// 		0,
				// 		document.getElementById('past-events').offsetTop
				// 	);
				// 	sessionStorage.removeItem('switchDropdownMenu');
				// }
			}, 1000);
			document.getElementById('root').style.display = null;
		});
	};
}
