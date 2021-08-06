window.addEventListener('load', () => {
	setTimeout(() => {
		if (document.getElementsByClassName('overlay-loader')[0]) {
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
			for (let ele of document.querySelectorAll('.animate')) {
				ele.classList.add('visible');
			}
			document.getElementById('root').style.display = null;
		}
	}, 1000);
});
