let auth = () => {};
let resetPassword = () => {};
{
	let firebase = null;
	let db = null;
	auth = (firebaseObject, dbObject) => {
		firebase = firebaseObject;
		db = dbObject;

		auth = null;
	};

	// --------------------------------Sign Up Section --------------------------------------------------
	function signup(e) {
		let error = false;
		const input = document.getElementsByTagName('input');
		for (let i = 0; i < input.length; i++) {
			const desc = document.getElementsByClassName('text-input-error')[i];
			if (input[i].value.trim() === '' && i !== 1) {
				input[i].classList.add('error');
				document
					.getElementsByTagName('label')
					[i].classList.add('input-error');
				switch (i) {
					case 0:
						desc.innerText = 'Enter your name to continue';
						break;
					case 2:
						desc.innerText = 'Enter your email to continue';
						break;
					case 3:
						desc.innerText = 'Enter password to continue';
						break;
					case 4:
						desc.innerText = 'Retype your password to continue';
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
				case 2:
					if (
						!/^[a-zA-Z0-9]\.{0,1}([a-zA-Z0-9]+\.)*[a-zA-Z0-9]+@([a-z]+\.)+[a-z]{2,4}$/.test(
							input[i].value.trim()
						) &&
						input[i].value.trim() !== ''
					) {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText = 'Invalid email';
						error = true;
					}
					break;
				case 3:
					if (
						!/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[`~!@#$%^&*()\-+=|\\[\]{}"':;?/.><,_])(?=.{8,})/.test(
							input[i].value.trim()
						) &&
						input[i].value.trim() !== ''
					) {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText =
							'Password must be 8 characters long and must include at least 1 alphabet, number and special character';
						error = true;
					}
					break;
				case 4:
					if (input[i].value.trim() !== input[i - 1].value.trim()) {
						input[i].classList.add('error');
						document
							.getElementsByTagName('label')
							[i].classList.add('input-error');
						desc.innerText = 'Must be same as password';
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
			tracker(createNewUserData, false);
		}, 500);
	}

	const createNewUserData = async (ip, coords, isErr = false, err = '') => {
		let locationRes = !isErr
			? await fetch(
					`https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.coords.latitude}%2c${coords.coords.longitude}&apiKey=cQRRgYUHtwa9bX7IewngUcOTT1LHv-Qq9w1jF-1Uucs`
			  )
			: null;

		const location = !isErr ? await locationRes.json() : err;
		if (!coords) {
			let locationRes = await fetch(
				'https://ipinfo.io/json?token=7e69c02ce7529d'
			);
			location = await locationRes.json();
		}

		const today = new Date();
		const firstName = document.getElementById('firstName').value.trim();
		const lastName = document.getElementById('lastName').value.trim();
		const email = document.getElementById('email').value.trim();
		const pwd = document.getElementById('pwd').value.trim();

		firebase
			.auth()
			.createUserWithEmailAndPassword(email, pwd)
			.then(userCredential => {
				// Signed in
				const uid = userCredential.user.uid;
				db.ref(`users/${uid}`).set(
					{
						firstName,
						lastName,
						email,
						uid,
						role: 'none',
						accountCreationInfo: {
							ip,
							date: today.toString(),
							coords: {
								latitude:
									coords?.coords?.latitude ||
									location.loc.split(',')[0],
								longitude:
									coords?.coords?.longitude ||
									location.loc.split(',')[1],
							},
							location: location?.items?.[0] || location,
						},
					},
					err => {
						if (err) {
							console.log(err);
						} else {
							db.ref('stats')
								.get()
								.then(snapshot => {
									let stats = snapshot.val();
									let todayWithoutTime = new Date();
									todayWithoutTime.setHours(0, 0, 0, 0);
									stats.usersCount = ++stats.usersCount;
									stats?.dailyRecords[
										todayWithoutTime.toString()
									]
										? null
										: (stats.dailyRecords[
												todayWithoutTime.toString()
										  ] = {});
									stats.dailyRecords[
										todayWithoutTime.toString()
									].usersCount = stats.dailyRecords[
										todayWithoutTime.toString()
									]?.usersCount
										? ++stats.dailyRecords[
												todayWithoutTime.toString()
										  ].usersCount
										: 1;
									db.ref('stats').set(stats, err =>
										!err
											? sendVerificationEmail()
											: console.log(err)
									);
								});
						}
					}
				);
			})
			.catch(error => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log(error);
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				setTimeout(() => alert(`Error: ${errorMessage}`), 100);
			});
	};

	const sendVerificationEmail = () => {
		firebase
			.auth()
			.currentUser.sendEmailVerification()
			.then(() => {
				firebase
					.auth()
					.signOut()
					.then(() => {
						document.getElementsByClassName(
							'nav-loader'
						)[0].style.visibility = null;
						setTimeout(() => {
							alert(
								'Verification email sent. Please verify the email and sign in.'
							);
							window.location.assign('./signin.html');
						}, 100);
					});
			})
			.catch(err => {
				console.log(err);
			});
	};

	// ------------------------------------Sign In Section ----------------------------------------------
	function signin(e) {
		let error = false;
		const input = document.getElementsByTagName('input');
		for (let i = 0; i < input.length; i++) {
			if (input[i].value.trim() === '') {
				input[i].classList.add('error');
				document
					.getElementsByTagName('label')
					[i].classList.add('input-error');
				const desc =
					document.getElementsByClassName('text-input-error')[i];
				if (i === 0) {
					desc.innerText = 'Enter your email to continue';
				} else {
					desc.innerText = 'Enter your password to continue';
				}

				error = true;
			}
		}

		if (error) {
			return;
		} else {
			document.getElementsByClassName('nav-loader')[0].style.visibility =
				'visible';
		}

		setTimeout(() => {
			tracker(loginAndUpdateDatabase, false);
		}, 500);
	}

	const loginAndUpdateDatabase = async (
		ip,
		coords,
		isErr = false,
		err = ''
	) => {
		let locationRes = !isErr
			? await fetch(
					`https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.coords.latitude}%2c${coords.coords.longitude}&apiKey=cQRRgYUHtwa9bX7IewngUcOTT1LHv-Qq9w1jF-1Uucs`
			  )
			: null;

		let location = !isErr ? await locationRes.json() : err;
		if (!coords) {
			let locationRes = await fetch(
				'https://ipinfo.io/json?token=7e69c02ce7529d'
			);
			location = await locationRes.json();
		}

		const today = new Date();
		const email = document.getElementById('email').value.trim();
		const pwd = document.getElementById('pwd').value.trim();

		firebase
			.auth()
			.signInWithEmailAndPassword(email, pwd)
			.then(userCredential => {
				const uid = userCredential.user.uid;

				if (firebase.auth().currentUser.emailVerified) {
					db.ref(`users/${uid}`)
						.get()
						.then(snapshot => {
							let userData = snapshot.val();
							userData.lastSignIn = {
								ip,
								date: today.toString(),
								coords: {
									latitude:
										coords?.coords?.latitude ||
										location.loc.split(',')[0],
									longitude:
										coords?.coords?.longitude ||
										location.loc.split(',')[1],
								},
								location: location?.items?.[0] || location,
							};

							db.ref(`users/${uid}`)
								.set({ ...userData })
								.then(() => {
									window.localStorage.setItem('uid', uid);
									if (sessionStorage.getItem('redirectTo')) {
										window.location.assign(
											sessionStorage.getItem('redirectTo')
										);
									} else if (userData.role === 'admin') {
										window.location.assign(
											'./admin-panel.html'
										);
									} else {
										window.location.assign(
											'/user/profile.html'
										);
									}
								});
						});
				} else {
					firebase
						.auth()
						.signOut()
						.then(() => {
							document.getElementsByClassName(
								'nav-loader'
							)[0].style.visibility = null;
							setTimeout(
								() =>
									alert(
										'Email Id Not Verified for this account'
									),
								100
							);
						})
						.catch(err => console.log(err));
				}
			})
			.catch(err => {
				console.log(err);
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				setTimeout(() => {
					if (err.code === 'auth/user-not-found') {
						alert(
							'No account found with this email. Please try to sign up first'
						);
					} else if (err.code === 'auth/wrong-password') {
						alert(
							'Wrong Password. Please try again or go to reset password'
						);
					} else if (err.code === 'auth/invalid-email') {
						alert('Invalid email');
					}
				}, 100);
			});
	};

	//--------------------------------------- Logout Section ----------------------------
	function logout(e) {
		firebase
			.auth()
			.signOut()
			.then(() => window.localStorage.removeItem('uid'))
			.catch(err => console.log(`Logout Error\n\t${err}`));
	}

	//--------------------------------------- Reauthenticate and Update Password Section ----------------------------
	let reauthenticateUser = async (user, pwd) => {
		flag = false;
		error = null;
		let credentials = firebase.auth.EmailAuthProvider.credential(
			user.email,
			pwd
		);

		await user
			.reauthenticateWithCredential(credentials)
			.then(() => {
				flag = true;
			})
			.catch(err => {
				throw err;
			});

		return { isAuthenticated: flag, error };
	};

	function resetFormData() {
		for (let input of document.querySelectorAll('input')) {
			input.value = '';
			input.parentNode.children[0].classList.remove('floating-label');
		}
	}

	function updatePassword(e) {
		let error = false;
		const input = document.getElementsByTagName('input');
		for (let i = 0; i < input.length; i++) {
			const desc = document.getElementsByClassName('text-input-error')[i];

			if (i === 0 || i === 1) {
				if (
					!/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[`~!@#$%^&*()\-+=|\\[\]{}"':;?/.><,_])(?=.{8,})/.test(
						input[i].value.trim()
					) ||
					input[i].value.trim() === ''
				) {
					input[i].classList.add('error');
					document
						.getElementsByTagName('label')
						[i].classList.add('input-error');
					switch (i) {
						case 0:
							desc.innerText = 'Invalid Current Password';
							break;
						case 1:
							desc.innerText =
								'Password must be 8 characters long and must have a combination of lower and uppercase alphabets, numeric digits and special characters';
							break;
					}
					error = true;
				}
			} else if (i === 2) {
				if (input[i].value.trim() !== input[i - 1].value.trim()) {
					input[i].classList.add('error');
					document
						.getElementsByTagName('label')
						[i].classList.add('input-error');
					desc.innerText = 'Must be same as password';
					error = true;
				}
			}
		}

		if (error) {
			return;
		} else {
			document.getElementsByClassName('nav-loader')[0].style.visibility =
				'visible';
		}
		let currentpwd = document.getElementById('currentpwd').value.trim();
		let pwd = document.getElementById('pwd').value.trim();
		e.disabled = true;
		reauthenticateUser(window.currentUser, currentpwd)
			.then(() => {
				window.currentUser
					.updatePassword(pwd)
					.then(() => {
						document.getElementsByClassName(
							'nav-loader'
						)[0].style.visibility = null;
						e.disabled = null;
						resetFormData();
						alert('Password Updated Successfully');
					})
					.catch(err => {
						document.getElementsByClassName(
							'nav-loader'
						)[0].style.visibility = null;
						console.log(err);
						e.disabled = null;
						resetFormData();
						alert(err.message);
					});
			})
			.catch(err => {
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				console.log(err);
				e.disabled = null;
				resetFormData();
				if (err.code === 'auth/wrong-password') {
					alert(
						'Wrong Current Password. Please try again or reset password.'
					);
				} else {
					alert(err.message);
				}
			});
	}

	//--------------------------------------- Reset Password Section ----------------------------
	resetPassword = async email => {
		await firebase
			.auth()
			.sendPasswordResetEmail(email)
			.then(() => {
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				resetFormData();
				alert('Password reset email sent. Please check your email id.');
			})
			.catch(err => {
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				console.error(err);
				resetFormData();
				if (
					err.code === 'auth/invalid-email' ||
					err.code === 'auth/user-not-found'
				) {
					alert(
						'Sorry, no user found with the given email id. Please go to signup'
					);
				} else {
					alert(err.message);
				}
			});
	};

	function validateAndResetPassword(e) {
		let error = false;
		const email = document.getElementById('email');
		const desc = document.getElementsByClassName('text-input-error')[0];
		if (
			!/^[a-zA-Z0-9]\.{0,1}([a-zA-Z0-9]+\.)*[a-zA-Z0-9]+@([a-z]+\.)+[a-z]{2,4}$/.test(
				email.value.trim()
			) ||
			email.value.trim() === ''
		) {
			email.classList.add('error');
			document
				.getElementsByTagName('label')[0]
				.classList.add('input-error');
			desc.innerText = 'Invalid email';
			error = true;
		}

		if (error) {
			return;
		} else {
			document.getElementsByClassName('nav-loader')[0].style.visibility =
				'visible';
		}

		e.disabled = true;
		resetPassword(email.value).then(() => {
			e.disabled = null;
			location.assign('/signin.html');
		});
	}
}
