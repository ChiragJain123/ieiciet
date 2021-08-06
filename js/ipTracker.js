let tracker = () => {};
let findLocationAndUpdateStats = () => {};
{
	const firebase = window.firebase;

	let firebaseConfig = {
		apiKey: 'MY_API_KEY',
		authDomain: 'MY_AUTH_DOMAIN',
		projectId: 'MY_PROJECT',
		storageBucket: 'MY_STORAGE_BUCKET',
		messagingSenderId: 'MY_MESSAGING_SENDER_ID',
		appId: 'MY_APP_ID',
		measurementId: 'MY_MEASUREMENT_ID',
	};
	// // Initialize Firebase
	if (!firebase?.apps.length || firebase.apps.length === 0) {
		firebase.initializeApp(firebaseConfig);
	}
	const db = firebase.database();

	if (
		[
			'/',
			'/index',
			'/index.html',
			'/upcoming-events.html',
			'/upcoming-events',
			'/past-events.html',
			'/past-events',
			'/contact.html',
			'/contact',
			'/team.html',
			'/team',
			'/gallery.html',
			'/gallery',
		].includes(window.location.pathname)
	) {
		delete window.firebase;
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				for (let i of document.querySelectorAll('.user-icon a')) {
					i.href = `./user/profile.html`;
				}
			} else {
				localStorage.removeItem('uid');
				for (let i of document.querySelectorAll('.user-icon a')) {
					i.href = './signin.html';
				}
			}
		});
		if (
			[
				'/upcoming-events.html',
				'/upcoming-events',
				'/past-events.html',
				'/past-events',
				'/contact.html',
				'/contact',
				'/team.html',
				'/team',
				'/gallery.html',
				'/gallery',
			].includes(window.location.pathname)
		) {
			assignFirebase(firebase, db);
		}
	} else if (
		[
			'/signin.html',
			'/signin',
			'/signup.html',
			'/signup',
			'/resetPassword.html',
			'/resetPassword',
		].includes(window.location.pathname)
	) {
		delete window.firebase;
		firebase.auth().onAuthStateChanged(user => {
			if (user && localStorage.getItem('uid')) {
				window.location.assign('/user/profile.html');
			}
		});
		auth(firebase, db);
	} else if (
		[
			'/user/profile.html',
			'/user/profile',
			'/registered-events.html',
			'/registered-events',
		].includes(window.location.pathname)
	) {
		// delete window.firebase;
		firebase.auth().onAuthStateChanged(user => {
			if (!user) {
				localStorage.removeItem('uid');
				window.location.assign('/signin.html');
			}
		});
		if (
			['/registered-events.html', '/registered-events'].includes(
				window.location.pathname
			)
		) {
			assignFirebase(firebase, db);
		} else {
			userProfilePage(firebase, db);
			auth(firebase, db);
		}
	} else if (
		['/updatePassword.html', '/updatePassword'].includes(
			window.location.pathname
		)
	) {
		delete window.firebase;
		firebase.auth().onAuthStateChanged(user => {
			if (!user) {
				localStorage.removeItem('uid');
				window.location.assign('/signin.html');
			}
		});
		auth(firebase, db);
		updatePasswordPage(firebase, db);
	}

	async function getIp() {
		try {
			const res = await fetch('https://api.ipify.org?format=json');
			let response = await res.json();
			return response;
		} catch (err) {
			console.log(err);
			return null;
		}
	}

	async function getCoords(ip, func) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				coords => func(ip, coords),
				err => func(ip, null, true, err),
				{ enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
			);
		} else {
			func(ip, null, true, 'Browser does not support Geolocation');
		}
	}

	findLocationAndUpdateStats = async (
		ip,
		coords,
		isErr = false,
		err = ''
	) => {
		let locationRes = !isErr
			? await fetch(
					`https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.coords.latitude}%2c${coords.coords.longitude}&apiKey=MY_API_KEY`
			  )
			: null;

		let location = !isErr ? await locationRes.json() : err;
		if (!coords) {
			let locationRes = await fetch(
				'https://ipinfo.io/json?token=MY_TOKEN'
			);
			location = await locationRes.json();
		}

		try {
			let date = new Date();
			let dateWithoutTime = new Date();
			dateWithoutTime.setHours(0, 0, 0);
			await fetch('https://api.ieiciet.tech/api/v2/updateStats', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					date: date.toString(),
					dateWithoutTime: dateWithoutTime.toString(),
					ip,
					location,
					latitude:
						coords?.coords?.latitude || location.loc.split(',')[0],
					longitude:
						coords?.coords?.latitude || location.loc.split(',')[1],
				}),
			});

			sessionStorage.setItem('isStatsUpdated', true);
		} catch (err) {
			console.log(err);
		}
	};

	// ---------------------- Driver Code ----------------------------------------------
	tracker = async (func, checkSessionStorage = true) => {
		if (checkSessionStorage) {
			if (sessionStorage.getItem('isStatsUpdated')) {
				return;
			}
		}
		let ip = await getIp();
		if (!ip) {
			let res = await fetch('https://ipinfo.io/json?token=MY_TOKEN');
			ipData = await res.json();
			getCoords(ipData.ip.replace(/\./g, ':'), func);
		} else {
			getCoords(ip.ip.replace(/\./g, ':'), func);
		}
	};
}
