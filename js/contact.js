let assignFirebase = () => {};
let sendContactMessage = () => {};
let recordResponseToDbAndSendMail = () => {};
{
	let firebase = null;
	let db = null;
	assignFirebase = (firebaseObject, dbObject) => {
		firebase = firebaseObject;
		db = dbObject;

		assignFirebase = null;
	};

	sendContactMessage = e => {
		let error = false;
		const input = document.querySelectorAll('input, textarea');
		for (let i = 0; i < input.length; i++) {
			const desc = document.getElementsByClassName('text-input-error')[i];
			switch (i) {
				case 0:
					if (
						/^(?=.*[0-9])|(?=.*[`~!@#$%^&*()\-+=|\\[\]{}"':;?/.><,_])/.test(
							input[i].value.trim()
						) ||
						input[i].value.trim() === ''
					) {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText = 'Invalid name';
						error = true;
					}
					break;
				case 1:
					if (
						!/^[a-zA-Z0-9]\.{0,1}([a-zA-Z0-9]+\.)*[a-zA-Z0-9]+@([a-z]+\.)+[a-z]{2,4}$/.test(
							input[i].value.trim()
						) ||
						input[i].value.trim() === ''
					) {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText = 'Invalid email';
						error = true;
					}
					break;
				case 2:
					if (input[i].value.trim() === '') {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText = 'Invalid Subject';
						error = true;
					}
					break;
				case 3:
					if (input[i].value.trim() === '') {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText = 'Invalid Message';
						error = true;
					}
					break;
			}
		}

		if (error) {
			return;
		}

		let name = document.getElementById('name').value.trim();
		let email = document.getElementById('email').value.trim();
		let subject = document.getElementById('subject').value.trim();
		let message = document.getElementById('message').value.trim();

		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				recordResponseToDbAndSendMail(
					user.uid,
					name,
					email,
					subject,
					message
				);
			} else {
				setTimeout(() => {
					alert(
						'To prevent spamming you must be signed in for submitting a response. After signing in your response would be submitted automatically.'
					);
					sessionStorage.setItem('redirectTo', '/contact.html');
					sessionStorage.setItem(
						'contactFormData',
						JSON.stringify({ name, email, subject, message })
					);
					window.location.assign('/signin.html');
				}, 500);
			}
		});
	};

	recordResponseToDbAndSendMail = async (
		uid,
		name,
		email,
		subject,
		message
	) => {
		document.getElementsByClassName('nav-loader')[0].style.visibility =
			'visible';
		document.getElementById('sendMessage').disabled = true;
		document
			.getElementById('sendMessage')
			.children[0].classList.remove('d-none');

		let ref = db.ref(`contactUsResponses/${uid}`);

		try {
			let contactUsResponsesSnapshot = await ref.get();
			let responsesData = contactUsResponsesSnapshot.val();
			let timeApiResponse = await fetch(
				'https://api.ieiciet.tech/api/v2/currenttime'
			);
			let timeApiResponseJson = await timeApiResponse.json();
			let currentDateTime = new Date(timeApiResponseJson.time);

			if (responsesData) {
				if (
					new Date(responsesData.lastResponseTime).getTime() +
						5 * 60_000 <=
					currentDateTime.getTime()
				) {
					responsesData.responses.push({
						name,
						email,
						subject,
						message,
						responseSubmissionTime: currentDateTime.toString(),
					});
					responsesData.lastResponseTime = currentDateTime.toString();
				} else {
					document.getElementsByClassName(
						'nav-loader'
					)[0].style.visibility = null;
					resetFormData();
					setTimeout(() => {
						alert(
							`You can send another response after 0${
								new Date(
									responsesData.lastResponseTime
								).getMinutes() +
								5 -
								currentDateTime.getMinutes()
							} minutes.`
						);
					}, 100);
					return;
				}
			} else {
				responsesData = {
					responses: [
						{
							name,
							email,
							subject,
							message,
							responseSubmissionTime: currentDateTime.toString(),
						},
					],
					lastResponseTime: currentDateTime.toString(),
				};
			}

			await ref.set({ ...responsesData });

			let emailToken = '';
			while (emailToken.length !== 16) {
				emailToken = Math.floor(
					Math.random() *
						(9999999999999999999 - 1000000000000000000) +
						1000000000000000000
				).toString(16);
			}
			let emailTokenRef = await db.ref(`emailTokens/${uid}`);

			await emailTokenRef.set({ emailToken });

			let apiResponse = await fetch(
				'https://api.ieiciet.tech/api/v2/mail',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						uid,
						emailToken,
						subject: 'New Response on IEI CIET Website',
						message: `<p><b>Name:</b> ${name}</p>
                        <p><b>Email:</b> ${email}</p>
                        <p><b>Subject:</b> ${subject}</p>
                        <p></p>
                        <p style="white-space: pre-wrap;padding-left: 18px;">${message}</p>`,
					}),
				}
			);

			if (apiResponse.status === 200) {
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				resetFormData();
				setTimeout(() => alert('Response submitted successfully'), 100);
			} else {
				let apiResponseJson = await apiResponse.json();
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				resetFormData();
				setTimeout(
					() =>
						alert(
							`${apiResponseJson.status}, ${apiResponseJson.message}`
						),
					100
				);
			}
		} catch (err) {
			console.log(err);
			document.getElementsByClassName('nav-loader')[0].style.visibility =
				null;
			resetFormData();
			setTimeout(() => {
				alert('Error!! Something went wrong, please try again later.');
			}, 100);
		}
	};

	function resetFormData() {
		for (let input of document.querySelectorAll('input, textarea')) {
			input.value = '';
			input.parentNode.children[0].classList.remove('floating-label');
		}
		document.getElementById('sendMessage').disabled = null;
		document
			.getElementById('sendMessage')
			.children[0].classList.add('d-none');
	}
}
