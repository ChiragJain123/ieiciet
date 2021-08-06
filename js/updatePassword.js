let userProfilePage = () => {};
{
	let firebase = null;
	let db = null;
	updatePasswordPage = (firebaseObj, dbObject) => {
		firebase = firebaseObj;
		db = dbObject;

		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				window.currentUser = user;
				setTimeout(() => {
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
					}, 1000);
					document.getElementById('root').style.display = null;
				}, 1000);
			}
		});

		updatePasswordPage = null;
	};
}
