function addFocus(e, ind) {
	e.removeAttribute('readonly');
	const label = document.getElementsByTagName('label')[ind];
	label.classList.add('floating-label');
	label.classList.add('is-focused');
	if (e.value === '') {
		label.classList.remove('not-empty');
	}
}

function removeFocus(e, ind) {
	const label = document.getElementsByTagName('label')[ind];
	if (e.value === '') {
		label.classList.remove('floating-label');
		label.classList.remove('not-empty');
	} else {
		label.classList.add('not-empty');
	}
	label.classList.remove('is-focused');
}

function removeError(e, ind, userProfilePage = false) {
	document.getElementsByTagName('label')[ind].classList.remove('input-error');
	e.classList.remove('error');
	document.getElementsByClassName('text-input-error')[
		userProfilePage ? ind + 1 : ind
	].innerText = '';
}

function togglePwd(e) {
	const input = e.parentNode.children[1];
	if (e.classList.contains('pwd-visible')) {
		e.classList.remove('pwd-visible');
		input.setAttribute('type', 'password');
		e.innerText = 'visibility';
	} else {
		e.classList.add('pwd-visible');
		input.setAttribute('type', 'text');
		e.innerText = 'visibility_off';
	}
}

for (let input of document.querySelectorAll('input[type=number]')) {
	input.addEventListener('keydown', e => {
		if (
			!/(^[0-9]+$)|(^Backspace$)|(^Delete$)|(^Arrow(Left)$|(Right)$)/.test(
				e.key
			)
		) {
			e.preventDefault();
		}
	});
}

for (let input of document.querySelectorAll('.otp-input')) {
	input.addEventListener('keydown', e => {
		if (input.value.length === 1 && /(^[0-9]+$)/.test(e.key)) {
			if (input.getAttribute('data-id') !== '5') {
				let nextInput = document.getElementById(
					`otp${parseInt(input.getAttribute('data-id')) + 2}`
				);
				nextInput.value = e.key;
				e.preventDefault();
			} else {
				input.value = '';
			}
		}
	});
	input.addEventListener('keyup', e => {
		if (
			(/(^[0-9]+$)/.test(e.key) || e.key === 'ArrowRight') &&
			input.getAttribute('data-id') !== '5'
		) {
			document
				.querySelectorAll('.otp-input')
				[parseInt(input.getAttribute('data-id')) + 1].focus();
		} else if (
			(e.key === 'Backspace' || e.key === 'ArrowLeft') &&
			input.getAttribute('data-id') !== '0'
		) {
			document
				.querySelectorAll('.otp-input')
				[parseInt(input.getAttribute('data-id')) - 1].focus();
		}
	});
	input.addEventListener('change', e => {
		document.querySelector('.verify .text-input-error').innerHTML = '';
	});
}
