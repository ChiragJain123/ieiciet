// ------------------------For Toggling Menu Bar --------------------------------------------
function toggleMenubar(e) {
	let asideMenu = document.getElementsByClassName('menu_StyledSidebar')[0];
	if (e.classList.contains('hamburger')) {
		e.classList.remove('hamburger');
		e.classList.add('hamburger-close');

		asideMenu.classList.remove('menubar');
		asideMenu.classList.add('menubar-open');
		asideMenu.setAttribute('aria-hidden', 'false');
		asideMenu.setAttribute('tabindex', '1');

		document.querySelector('body').classList.add('blur');
	} else {
		e.classList.remove('hamburger-close');
		e.classList.add('hamburger');

		asideMenu.classList.remove('menubar-open');
		asideMenu.classList.add('menubar');
		asideMenu.setAttribute('aria-hidden', 'true');
		asideMenu.setAttribute('tabindex', '-1');

		document.querySelector('body').classList.remove('blur');
	}
}

//---------------------------------- For Moving Header on Scroll -------------------------------------------------
let scrollPos = window.scrollY;
document.addEventListener('scroll', e => {
	if (
		!document
			.getElementsByTagName('aside')[0]
			.classList.contains('menubar-open')
	) {
		let nav = document.getElementsByClassName('nav_StyledHeader')[0];
		if (nav.classList.contains('header')) {
			nav.classList.remove('header');
			nav.classList.add('invisible-header');
		} else if (window.scrollY === 0) {
			nav.classList.remove('invisible-header');
			nav.classList.remove('header-sticky');
			nav.classList.add('header');
			return;
		}
		if (window.scrollY < scrollPos) {
			nav.classList.remove('invisible-header');
			nav.classList.add('header-sticky');
		} else {
			nav.classList.remove('header-sticky');
			nav.classList.add('invisible-header');
		}
	}
	scrollPos = window.scrollY;
});
