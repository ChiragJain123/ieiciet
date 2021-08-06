let userProfilePage = () => {};
let updateUserData = () => {};
let updateFirstAndLastName = () => {};
let confirmOTPUpdateData = () => {};
{
	let firebase = null;
	let db = null;
	let auth = null;
	userProfilePage = (firebaseObj, dbObject) => {
		firebase = firebaseObj;
		db = dbObject;
		auth = firebase.auth();

		userProfilePage = null;
	};

	function loadFormData() {
		db.ref(`users/${localStorage.getItem('uid')}`)
			.get()
			.then(snapshot => {
				const userData = snapshot.val();

				if (userData.role === 'admin') {
					document.querySelector(
						'#root div.conditionalBtn'
					).innerHTML += `<button type="button" class="ml" onclick="window.location.href='/admin-panel.html'">Open Admin Panel</button>`;
				}

				let firstName = document.getElementById('firstName');
				let lastName = document.getElementById('lastName');
				let email = document.getElementById('email');
				let mobile = document.getElementById('mobile');

				addFocus(firstName, 0);
				firstName.value = userData.firstName;
				removeFocus(firstName, 0);

				addFocus(lastName, 1);
				lastName.value = userData.lastName;
				removeFocus(lastName, 1);

				addFocus(email, 2);
				email.value = userData.email;
				removeFocus(email, 2);

				addFocus(mobile, 3);
				mobile.value = userData.mobileNo
					? userData.mobileNo.substr(3)
					: '';
				removeFocus(mobile, 3);

				document
					.getElementsByClassName('overlay-loader')[0]
					.classList.add('d-none');
				document.getElementsByClassName(
					'overlay-loader'
				)[0].style.opacity = null;
			});
	}

	function validateFormData(e) {
		let error = false;
		const input = document.querySelectorAll('input:not(#modal input)');
		for (let i = 0; i < input.length; i++) {
			const desc = document.querySelectorAll(
				'.text-input-error:not(#modal .text-input-error)'
			)[i];
			if (input[i].value.trim() === '' && i !== 1) {
				input[i].classList.add('error');
				document
					.getElementsByTagName('label')
					[i].classList.add('input-error');
				switch (i) {
					case 0:
						desc.innerText = 'Enter your name to continue';
						break;
				}

				error = true;
			}
			switch (i) {
				case 0:
					if (
						/^(?=.*[0-9])|(?=.*[`~!@#$%^&*()\-+=|\\[\]{}"':;?/.><,_])/.test(
							input[i].value.trim()
						) &&
						input[i].value.trim() !== ''
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
						/^(?=.*[0-9])|(?=.*[`~!@#$%^&*()\-+=|\\[\]{}"':;?/.><,_])/.test(
							input[i].value.trim()
						) &&
						input[i].value.trim() !== ''
					) {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText = 'Invalid name';
						error = true;
					}
					break;
				case 3:
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

		setTimeout(() => {
			updateUserData();
		}, 500);
	}

	updateUserData = async () => {
		const firstName = document.getElementById('firstName').value.trim();
		const lastName = document.getElementById('lastName').value.trim();
		const mobileNo = document.getElementById('mobile').value.trim();

		try {
			let ref = db.ref(`users/${localStorage.getItem('uid')}`);
			let snapshot = await ref.get();
			let userData = snapshot.val();

			if (userData.mobileNo) {
				if (`+91${mobileNo}` !== userData.mobileNo) {
					let captcha = document.createElement('div');
					captcha.id = 'captcha';
					document.getElementById('root').appendChild(captcha);
					window.appVerifier = new firebase.auth.RecaptchaVerifier(
						'captcha',
						{ size: 'invisible' }
					);

					const provider = new firebase.auth.PhoneAuthProvider();
					window.verificationId = await provider.verifyPhoneNumber(
						`+91${mobileNo}`,
						window.appVerifier
					);
					window.mobileNo = `+91${mobileNo}`;

					document.getElementById('modal').classList.remove('d-none');
					document.getElementsByClassName(
						'nav-loader'
					)[0].style.visibility = null;
					return;
				} else {
					if (
						userData.firstName !== firstName ||
						userData.lastName !== lastName
					) {
						updateFirstAndLastName(firstName, lastName);
						return;
					}
					document.getElementsByClassName(
						'nav-loader'
					)[0].style.visibility = null;
					setTimeout(
						() => alert('User Data Updated Successfully'),
						100
					);
				}
			} else {
				let captcha = document.createElement('div');
				captcha.id = 'captcha';
				document.getElementById('root').appendChild(captcha);
				window.appVerifier = new firebase.auth.RecaptchaVerifier(
					'captcha',
					{ size: 'invisible' }
				);

				const confirmationResult = await firebase
					.auth()
					.currentUser.linkWithPhoneNumber(
						`+91${mobileNo}`,
						window.appVerifier
					);
				window.confirmationResult = confirmationResult;
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;

				window.isFirstMobileNo = true;
				document.getElementById('modal').classList.remove('d-none');
			}
		} catch (err) {
			console.log(err);
			delete window.appVerifier;
			delete window.verificationId;
			resetFormDataAndCloseForm();
			document.getElementsByClassName('nav-loader')[0].style.visibility =
				null;
			setTimeout(() =>
				alert('Something Went Wrong! Please try again later')
			);
		}
	};

	confirmOTPUpdateData = async (
		e,
		isFirstMobileNo = window.isFirstMobileNo
	) => {
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
			let phoneNo = null;
			if (isFirstMobileNo) {
				const result = await confirmationResult.confirm(otp);
				const user = result.user;
				phoneNo = user.phoneNumber;
			} else {
				const phoneCredential =
					await firebase.auth.PhoneAuthProvider.credential(
						window.verificationId,
						otp
					);
				const user = auth.currentUser;
				await user.updatePhoneNumber(phoneCredential);
			}

			const mobileNo = phoneNo || window.mobileNo;

			delete window.verificationId;
			delete window.mobileNo;
			delete window.appVerifier;
			delete window.isFirstMobileNo;

			resetFormDataAndCloseForm();

			const firstName = document.getElementById('firstName').value.trim();
			const lastName = document.getElementById('lastName').value.trim();
			updateFirstAndLastName(firstName, lastName, mobileNo);
		} catch (err) {
			if (err.code === 'auth/invalid-verification-code') {
				alert(
					'Invalid Verification Code. Please check the OTP and try again'
				);
			} else {
				alert(`Error!! Something went wrong. Please try again later.`);
			}
			console.log(err);
			delete window.verificationId;
			delete window.mobileNo;
			delete window.appVerifier;

			resetFormDataAndCloseForm();
			document.getElementsByClassName('nav-loader')[0].style.visibility =
				null;
		}
	};

	updateFirstAndLastName = async (firstName, lastName, mobileNo = null) => {
		let data = { firstName, lastName };
		mobileNo ? (data.mobileNo = mobileNo) : null;
		await db.ref(`users/${localStorage.getItem('uid')}`).update(data);
		document.getElementsByClassName('nav-loader')[0].style.visibility =
			null;
		setTimeout(() => alert('User Data Updated Successfully'), 100);
	};

	function resetFormDataAndCloseForm() {
		for (let input of document.querySelectorAll(
			'#modal input:not(input.otp-input), #modal textarea'
		)) {
			input.value = '';
			input.classList.remove('error');
			input.parentNode.children[0].classList.remove('input-error');
			input.parentNode.children[2].children[0].innerText = '';
			input.disabled = false;
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
}
