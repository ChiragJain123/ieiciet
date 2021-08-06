let eventHandler = e => {
	if (e.type === 'keyup' && e.key !== 'Enter') {
		return;
	}
	let val = e.target.value.slice(1, e.target.value.length - 1);
	updateDb({
		[`${e.target.parentNode.children[1].getAttribute('data-path')}`]: val,
	});
};

function fetchGalleryListAndUdpateTable() {
	db.ref(`gallery`).on('value', snapshot => {
		let galleryData = snapshot.val();
		let tbody = document.querySelector(
			'#gallery-list-card .card-body table tbody'
		);
		let spinnerWrapper = document.getElementById('spinner-loader-wrapper');
		let table = document.querySelector(
			'#gallery-list-card .card-body table'
		);
		let cardBody = document.querySelector('#gallery-list-card .card-body');
		cardBody.style.overflowY = 'hidden';

		tbody.innerHTML = '';
		let index = 0;
		if (galleryData) {
			for (let data of galleryData) {
				tbody.innerHTML += `
                <tr id="link-${index}">
                    <th socpe="row">${index + 1}</td>
                    <td>
                        ${data.name}${data.name.length > 27 ? '...' : ''}
                    </td>
                    <td style="text-align: right;">
                        <span class="material-icons-outlined table-icons" style="margin-right: 20px" onclick="confirmAndDeleteImage('${
							data.name
						}', '${data.url}')">
                            delete
                        </span>
                        <a href="${
							data.url
						}" target="_blank" rel="noreferrer noopener">
                            <span class="material-icons-outlined table-icons" >
                                link
                            </span>
                        </a>
                    </td>
                </tr>
            `;
				index++;
			}
		} else {
			tbody.innerHTML = `
                <tr>
                    <th socpe="row">-</td>
                    <td colspan=2>
                        No Data Found
                    </td>
                </tr>
            `;
		}
		setTimeout(() => {
			spinnerWrapper.classList.add('spin-loaded');
			cardBody.classList.remove('loading');
			table.classList.remove('d-none');
			setTimeout(() => {
				spinnerWrapper.classList.add('d-none');
				cardBody.style.overflowY = null;
			}, 1100);
		}, 1000);
	});
}

function confirmAndDeleteImage(img, imgURL) {
	let confrmation = confirm(
		`This image would be pemanantly deleted!\nAre you sure you want to delete?`
	);
	if (confrmation) {
		document.getElementsByClassName('nav-loader')[0].style.visibility =
			'visible';
		resetFormDataAndCloseForm();

		let imgStorageRef = storage.ref(`gallery/${img}`);
		imgStorageRef
			.delete()
			.then(() => {
				db.ref(`gallery`)
					.get()
					.then(snapshot => {
						let data = snapshot.val();
						let newData = [];
						for (let obj of data) {
							if (obj.url !== imgURL) {
								newData.push(obj);
							}
						}
						db.ref('gallery')
							.set(newData)
							.then(() => {
								document.getElementsByClassName(
									'nav-loader'
								)[0].style.visibility = null;
								setTimeout(
									() => alert('Data Deleted Successfully'),
									100
								);
							});
					});
			})
			.catch(err => {
				console.log(error);
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = 'null';
				setTimeout(
					() =>
						alert(
							'Sorry, something went wrong!! Please try again later'
						),
					100
				);
			});
	}
}

let imgsData = [];
let previousImgsName = [];
function uploadImgs(e) {
	let error = false;
	const input = document.querySelectorAll('#modal input, #modal textarea');
	for (let i = 0; i < input.length; i++) {
		const desc = document.getElementsByClassName('text-input-error')[i];
		if (input[i].value.trim() === '') {
			input[i].classList.add('error');
			document
				.getElementsByTagName('label')
				[i].classList.add('input-error');
			switch (i) {
				case 0:
					desc.innerText = 'Select at least 1 image';
					break;
			}

			error = true;
		} else if (i === 0) {
			for (
				let j = 0;
				j < document.getElementById('galleryImgs').files.length;
				j++
			) {
				if (
					!['jpg', 'jpeg', 'png'].includes(
						document
							.getElementById('galleryImgs')
							.files[j].name.split('.')[1]
							.toLowerCase()
					)
				) {
					input[j].classList.add('error');
					document
						.getElementsByTagName('label')
						[j].classList.add('input-error');
					desc.innerText = 'File format not valid';
					error = true;
					break;
				}
			}
		}
	}

	if (error) {
		return;
	}
	const imgs = document.getElementById('galleryImgs').files;

	storage
		.ref('gallery')
		.listAll()
		.then(res => {
			res.items.forEach(item => previousImgsName.push(item.name));
			uploadImage(imgs);
		});
}

function uploadImage(imageArr, i = 0) {
	let name = imageArr[i].name;
	let ind = 0;
	while (previousImgsName.includes(name)) {
		ind++;
		if (ind === 1) {
			name = `${name}(1)`;
		} else {
			name = `${name.substring(0, name.length - 3)}(${ind})`;
		}
	}
	previousImgsName = [];

	let storageRef = storage.ref(`gallery/${name}`);
	let uploadTask = storageRef.put(imageArr[i], {
		contentType: `image/${imageArr[i].name.split('.')[1]}`,
	});

	uploadTask.on(
		firebase.storage.TaskEvent.STATE_CHANGED,
		snapshot => {
			let buttons = document.querySelectorAll('.button-lg');
			for (let btn of buttons) {
				btn.disabled = true;
			}
			let fileUploaderIcon = document.querySelectorAll(
				'.files-uploader-icon'
			)[0];
			fileUploaderIcon.classList.remove('hidden');
			fileUploaderIcon.parentNode.children[1].disabled = true;
			fileUploaderIcon.children[0].innerText = `${i}/${imageArr.length}`;
		},
		error => {
			console.log(error);
			alert(
				`Sorry, Error Occured while Uploading the Event Posters: ${error.code}`
			);
		},
		() => {
			uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
				let fileUploaderIcon = document.querySelectorAll(
					'.files-uploader-icon'
				)[0];
				imgsData.push({ name, url: downloadURL });
				if (i < imageArr.length - 1) {
					uploadImage(imageArr, i + 1);
				} else {
					fileUploaderIcon.children[0].innerText = `${i + 1}/${
						imageArr.length
					}`;
					fileUploaderIcon.children[1].classList.add('hidden');
					document.getElementsByClassName(
						'nav-loader'
					)[0].style.visibility = 'visible';
					createNewGalleryData();
				}
			});
		}
	);
}

function createNewGalleryData() {
	let ref = db.ref('gallery');

	ref.get().then(snapshot => {
		let data = snapshot.val();
		if (data) {
			imgsData.forEach(item => data.push(item));
		} else {
			data = imgsData;
		}
		ref.set(data).then(() => {
			setTimeout(() => {
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				resetFormDataAndCloseForm();
				setTimeout(() => {
					alert(
						`Image${
							imgsData.length > 1 ? 's' : ''
						} Uploaded Successfully`
					);
					imgsData = [];
				}, 200);
			}, 1000);
		});
	});
}

function resetFormDataAndCloseForm() {
	for (let input of document.querySelectorAll(
		'#modal input, #modal textarea'
	)) {
		input.value = '';
		input.classList.remove('error');
		input.parentNode.children[0].classList.remove('input-error');
		input.parentNode.children[2].children[0].innerText = '';
		input.disabled = false;
	}
	for (let input of document.querySelectorAll('#modal input[type=file]')) {
		input.classList.remove('error');
		input.parentNode.children[0].classList.remove('input-error');
		input.parentNode.children[3].children[0].innerText = '';
	}
	for (let btn of document.querySelectorAll('#modal button')) {
		btn.disabled = false;
	}
	for (let div of document.querySelectorAll('.files-uploader-icon')) {
		div.classList.add('hidden');
	}
	let fileUploaderIcon = document.querySelectorAll('.files-uploader-icon')[0];
	fileUploaderIcon.children[1].classList.remove('hidden');
	document.getElementById('modal').classList.add('d-none');
}
