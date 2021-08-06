let defferedPrompt;
window.addEventListener('beforeinstallprompt', e => {
	// Prevent the mini-infobar from appearing on mobile
	e.preventDefault();
	if (!sessionStorage.getItem('isUserCanceledDownloadPrompt')) {
		// Stash the event so it can be triggered later.
		deferredPrompt = e;
		// Update UI notify the user they can install the PWA
		showDownloadPrompt();
		// Optionally, send analytics event that PWA install promo was shown.
		// console.log(`'beforeinstallprompt' event was fired.`);
	}
});

let downloadButtonClick = async () => {
	// Hide the app provided install promotion
	hideDownloadPrompt();
	// Show the install prompt
	deferredPrompt.prompt();
	// Wait for the user to respond to the prompt
	const { outcome } = await deferredPrompt.userChoice;
	// Optionally, send analytics event with outcome of user choice
	// console.log(`User response to the install prompt: ${outcome}`);
	// We've used the prompt, and can't use it again, throw it away
	deferredPrompt = null;
};

window.addEventListener('appinstalled', () => {
	// Hide the app-provided install promotion
	hideDownloadPrompt(false);
	// Clear the deferredPrompt so it can be garbage collected
	deferredPrompt = null;
	// Optionally, send analytics event to indicate successful install
	// console.log('PWA was installed');
});

function hideDownloadPrompt(userCanceled = true) {
	if (userCanceled) {
		sessionStorage.setItem('isUserCanceledDownloadPrompt', true);
	} else {
		sessionStorage.removeItem('isUserCanceledDownloadPrompt');
	}
	document.querySelector('body').classList.remove('appInstallPrompted');
}

function showDownloadPrompt() {
	document.querySelector('body').classList.add('appInstallPrompted');
}

// (Math.floor(Math.random() * (9999999999999999999 - 1000000000000000000) + 1000000000000000000 )).toString(16).length
