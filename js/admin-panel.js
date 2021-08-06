function toggleMenubar(e) {
	let body = document.querySelector('body');
	let main = document.getElementById('main');
	let undergroundBody = document.querySelector('.underground-body');
	if (e.classList.contains('hamburger')) {
		undergroundBody.classList.remove('d-none');
		main.classList.add('main-collapsed');
		body.classList.add('body-nav-visible');
		e.classList.remove('hamburger');
		e.classList.add('hamburger-close');
		setTimeout(() => main.setAttribute('onclick', 'selectMain(this)'), 100);
	} else {
		undergroundBody.classList.add('d-none');
		e.classList.remove('hamburger-close');
		main.classList.remove('main-collapsed');
		body.classList.remove('body-nav-visible');
		e.classList.add('hamburger');
		main.removeAttribute('onclick', 'selectMain(this)');
	}
}

function selectMain(e) {
	let body = document.querySelector('body');
	let undergroundBody = document.querySelector('.underground-body');
	let hamburger = document.querySelector('.ham');
	if (body.classList.contains('body-nav-visible')) {
		undergroundBody.classList.add('d-none');
		hamburger.classList.remove('hamburger-close');
		e.classList.remove('main-collapsed');
		body.classList.remove('body-nav-visible');
		hamburger.classList.add('hamburger');
		main.removeAttribute('onclick', 'selectMain(this)');
	}
}
