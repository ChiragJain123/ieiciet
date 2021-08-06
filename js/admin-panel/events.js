let eventHandler = e => {
	if (e.type === 'keyup' && e.key !== 'Enter') {
		return;
	}
	let val = e.target.value.slice(1, e.target.value.length - 1);
	updateDb({
		[`${e.target.parentNode.children[1].getAttribute('data-path')}`]: val,
	});
};

async function setCsvFileDownloadUrl(eventData, ind) {
	function convertToCSV(objArray) {
		var array =
			typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
		var str = '';

		for (var i = 0; i < array.length; i++) {
			var line = '';
			for (var index in array[i]) {
				if (line != '') line += ',';

				line += array[i][index];
			}

			str += line + '\r\n';
		}

		return str;
	}

	function exportCSVFile(headers, items, fileTitle) {
		if (headers) {
			items.unshift(headers);
		}

		// Convert Object to JSON
		var jsonObject = JSON.stringify(items);

		var csv = convertToCSV(jsonObject);

		var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

		var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		var link = document.querySelectorAll('.accordion-toggle td a.download')[
			ind
		];
		// feature detection
		// Browsers that support HTML5 download attribute
		var url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', exportedFilenmae);
		// link.style.visibility = 'hidden';
		// document.body.appendChild(link);
		// link.click();
		// document.body.removeChild(link);
	}

	let data = eventData?.registeredUsers || [];
	let formattedData = [];
	data.forEach(item => {
		formattedData.push({
			name: item.name,
			email: item.email,
			mobileNo: `${item.mobileNo.substr(3)}`,
			uid: item.uid,
		});
	});
	console.log(eventData);
	console.log(formattedData);

	var headers = {
		name: 'Name',
		email: 'Email',
		mobileNo: 'Mobile Number',
		uid: 'uid',
	};

	var fileTitle = eventData.name; // or 'my-unique-title'

	exportCSVFile(headers, formattedData, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}

function fetchEventsListAndUdpateTable() {
	db.ref(`events`).on('value', snapshot => {
		let eventsData = snapshot.val();
		let events = [];
		for (let event in eventsData) {
			events.push(eventsData[event]);
		}
		events.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);
		let tbody = document.querySelector(
			'#events-list-card .card-body table tbody'
		);
		let spinnerWrapper = document.getElementById('spinner-loader-wrapper');
		let table = document.querySelector(
			'#events-list-card .card-body table'
		);
		let cardBody = document.querySelector('#events-list-card .card-body');
		cardBody.style.overflowY = 'hidden';

		tbody.innerHTML = '';
		let index = 1;
		for (let event of events) {
			tbody.innerHTML += `
                <tr class="accordion-toggle collapsed" id="${event.id}">
                    <th socpe="row">${index}</td>
                    <td>${event.name}</td>
                    <td>
                        <span
                            class="material-icons-outlined table-icons accordion-toggle collapsed"
                            id="accordion${index}" data-toggle="collapse" data-parent="#accordion${index}"
                            href="#collapse${index}" onclick="toogleAccordionState(this, '${
				event.id
			}')">
                            edit
                        </span>
                    </td>
                    <td>
                        <span
                            class="material-icons-outlined table-icons" onclick="confirmAndDeleteEvent(this, '${
								event.id
							}', '${event.name}')">
                            delete
                        </span>
                    </td>
                    <td>
                        <a class="download">
                            <span
                                class="material-icons-outlined table-icons">
                                email
                            </span>
                        </a>
                    </td>
                </tr>
                <tr class="editor">
                    <td colspan="5">
                        <div id="collapse${index}" class="collapse in data-tree col-xl ${
				sessionStorage
					.getItem('openedEventAccordions')
					.split(',')
					.includes(event.id) && 'show'
			}">
                            <div class="data-tree-default">${event.id}</div>
                            <ul class="data-tree-default-ul">
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
			let listNode = document.querySelectorAll('.data-tree-default-ul')[
				index - 1
			];
			for (const item in event) {
				listNode.innerHTML += `
                    <li class='${
						typeof event[item] === 'object'
							? 'data-tree-closed'
							: 'data-tree-leaf'
					}' data-id='${event.id}'>
                        <div>
                            <ins class='data-tree-icon' data-child='${JSON.stringify(
								event[item]
							)}' onclick="toggleChildList(this)" id="${`${event.id}-${item}`}"}>&nbsp;</ins>
                            <span class='data-tree-content' data-path="${`/${event.id}/${item}`}">${item}${
					typeof event[item] !== 'object' ? ':' : ''
				}</span>
                            ${
								typeof event[item] !== 'object'
									? `<input type="text" class="data-tree-input" value='"${
											event[item]
									  }"' style="width: ${
											event[item].toString().length + 5
									  }ch; max-width: ${
											[
												'description',
												'speakerPosterUrl',
											].includes(item) && '55ch'
									  }" ${item === 'id' && 'disabled'}>`
									: ''
							}
                        </div>
                        ${typeof event[item] === 'object' ? '<ul></ul>' : ''}
                    </li>
                `;
			}
			setCsvFileDownloadUrl(event, index - 1);
			index++;
		}
		let tempEleArr = [];
		let childrenIdsToBeOpened = sessionStorage
			.getItem('openedEventsChildNodes')
			.split(',');
		for (let id of childrenIdsToBeOpened) {
			if (id && id !== '') {
				let ele = document.getElementById(id);
				if (ele) {
					toggleChildList(ele, false);
				} else {
					tempEleArr.unshift(id);
				}
			}
		}
		let iterateCount = 0;
		while (
			tempEleArr.length !== 0 &&
			iterateCount <= childrenIdsToBeOpened.length - 1
		) {
			for (let id of tempEleArr) {
				if (id && id !== '') {
					let ele = document.getElementById(id);
					if (ele) {
						toggleChildList(ele, false);
						tempEleArr.splice(tempEleArr.indexOf(id), 1);
					}
				}
			}
			iterateCount++;
		}
		if (sessionStorage.getItem('eventsAccordionScrollPositions')) {
			let scrollPositions = sessionStorage
				.getItem('eventsAccordionScrollPositions')
				.split(',');
			let ind = 0;
			for (let ele of document.querySelectorAll('.collapse')) {
				ele.scrollTop = scrollPositions[ind];
				ind++;
			}
			sessionStorage.setItem('eventsAccordionScrollPositions', null);
		}
		setTimeout(() => {
			spinnerWrapper.classList.add('spin-loaded');
			cardBody.classList.remove('loading');
			table.classList.remove('d-none');
			setTimeout(() => {
				spinnerWrapper.classList.add('d-none');
				cardBody.style.overflowY = null;

				addEventListenerOnInput();
			}, 1100);
		}, 1000);
	});
}

function toggleChildList(e, shouldToggleState = true) {
	document
		.querySelectorAll('.data-tree-open > ul > li input')
		.forEach(input => {
			input.removeEventListener('keyup', eventHandler);
		});

	document
		.querySelectorAll('.data-tree-open > ul > li input')
		.forEach(input => {
			input.removeEventListener('blur', eventHandler);
		});

	let data = JSON.parse(e.getAttribute('data-child'));
	let parentListItemNode = e.parentNode.parentNode;
	let childListNode = parentListItemNode.children[1];
	if (childListNode.innerHTML === '') {
		parentListItemNode.classList.remove('data-tree-closed');
		parentListItemNode.classList.add('data-tree-open');

		for (const item in data) {
			childListNode.innerHTML += `
			   <li class='${
					typeof data[item] === 'object'
						? 'data-tree-closed'
						: 'data-tree-leaf'
				}'>
			        <div>
			            <ins class='data-tree-icon' data-child='${JSON.stringify(
							data[item]
						)}' onclick="toggleChildList(this)"} id="${`${e.parentNode.children[0].id}-${item}`}">&nbsp;</ins>
			            <span class='data-tree-content' data-path="${`${e.parentNode.children[1].getAttribute(
							'data-path'
						)}/${item}`}">${item}${
				typeof data[item] !== 'object' ? ':' : ''
			}</span>
                        ${
							typeof data[item] !== 'object'
								? `<input type="text" class="data-tree-input" value='"${
										data[item]
								  }"' style="width: ${
										data[item].toString().length + 5
								  }ch; max-width: ${
										['posterUrls'].includes(
											parentListItemNode.children[0]
												.children[1].innerText
										) && '65ch'
								  }">`
								: ''
						}
			        </div>
			        ${typeof data[item] === 'object' ? '<ul></ul>' : ''}
			    </li>
			`;
		}
		if (shouldToggleState) {
			toggleChildListNodeState(e);
		}
	} else {
		let openedElementIds = sessionStorage
			.getItem('openedEventsChildNodes')
			.split(',');
		let updatedOpenedElementIds = [];
		for (let i = 0; i < openedElementIds.length; i++) {
			if (!openedElementIds[i].includes(e.id)) {
				updatedOpenedElementIds.push(openedElementIds[i]);
			}
		}
		sessionStorage.setItem(
			'openedEventsChildNodes',
			updatedOpenedElementIds.join(',')
		);
		parentListItemNode.classList.remove('data-tree-open');
		parentListItemNode.classList.add('data-tree-closed');

		childListNode.innerHTML = '';
	}
	document
		.querySelectorAll('.data-tree-open > ul > li input')
		.forEach(input => {
			input.addEventListener('keyup', eventHandler);
			input.addEventListener('blur', eventHandler);
		});
}

function addEventListenerOnInput() {
	document
		.querySelectorAll('.data-tree-default-ul > li.data-tree-leaf input')
		.forEach(input => {
			input.addEventListener('keyup', eventHandler);
			input.addEventListener('blur', eventHandler);
		});
}

function updateDb(updates) {
	let scrollPositions = [];
	for (let ele of document.querySelectorAll('.collapse')) {
		scrollPositions.push(ele.scrollTop);
	}
	sessionStorage.setItem(
		'eventsAccordionScrollPositions',
		scrollPositions.join(',')
	);
	db.ref('events').update(updates);
}

function toogleAccordionState(e, eventId) {
	if (
		!sessionStorage
			.getItem('openedEventAccordions')
			.split(',')
			.includes(eventId)
	) {
		sessionStorage.setItem(
			'openedEventAccordions',
			sessionStorage.getItem('openedEventAccordions') + `${eventId},`
		);
	} else {
		let arr = sessionStorage.getItem('openedEventAccordions').split(',');
		let ind = arr.indexOf(eventId);
		arr.splice(ind, 1);
		let str = arr.join(',');
		sessionStorage.setItem('openedEventAccordions', str);
	}
}

function toggleChildListNodeState(childNode) {
	if (
		!sessionStorage
			.getItem('openedEventsChildNodes')
			.split(',')
			.includes(childNode.id)
	) {
		sessionStorage.setItem(
			'openedEventsChildNodes',
			sessionStorage.getItem('openedEventsChildNodes') +
				`${childNode.id},`
		);
	} else {
		let arr = sessionStorage.getItem('openedEventsChildNodes').split(',');
		let ind = arr.indexOf(childNode.id);
		arr.splice(ind, 1);
		let str = arr.join(',');
		sessionStorage.setItem('openedEventsChildNodes', str);
	}
}

function confirmAndDeleteEvent(e, eventId, eventName) {
	let confrmation = confirm(
		`All data at this location, including nested data and all the Posters of the Event, would be permanently deleted!!\nAre you sure you want to delete ${eventName}?`
	);
	if (confrmation) {
		document.getElementsByClassName('nav-loader')[0].style.visibility =
			'visible';

		let eventStorageRef = storage.ref(`events/${eventName}`);
		let i = 0;
		eventStorageRef.listAll().then(res => {
			res.items.forEach(itemRef => {
				storage
					.ref(itemRef.fullPath)
					.delete()
					.then(() => {
						i++;
						if (i == res.items.length) {
							db.ref('users')
								.get()
								.then(snapshot => {
									let users = snapshot.val();
									for (let user in users) {
										if (users[user].registeredEvents) {
											let ind = 0;
											for (let event of users[user]
												.registeredEvents) {
												if (event.id === eventId) {
													break;
												}
												ind++;
											}
											users[user].registeredEvents.splice(
												ind,
												1
											);
										}
									}
									db.ref('users')
										.set(users)
										.then(() => {
											db.ref(`events/${eventId}`)
												.remove()
												.then(() => {
													document.getElementsByClassName(
														'nav-loader'
													)[0].style.visibility = null;
													setTimeout(
														() =>
															alert(
																`${eventName} data was deleted successfully!!`
															),
														100
													);
												});
										});
								});
						}
					})
					.catch(error => {
						document.getElementsByClassName(
							'nav-loader'
						)[0].style.visibility = null;
						setTimeout(
							() =>
								alert(
									`Sorry, something went wrong!! ${itemRef.fullPath} could not be deleted: ${error.code}.\nPlease try again later`
								),
							100
						);
					});
			});
		});
	}
}

let speakerPosterUrl = '';
let eventPosterUrls = [];
function createNewEvent(e) {
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
					desc.innerText = 'Enter the Event Name to continue';
					break;
				case 1:
					desc.innerText = 'Enter the description to continue';
					break;
				case 2:
					desc.innerText =
						'Enter date and time of the event to continue';
					break;
				case 3:
					desc.innerText = 'Enter the Speaker Name to continue';
					break;
				case 4:
					desc.innerText = 'Select the speaker image to continue';
					break;
				case 5:
					desc.innerText =
						'Select at least 1 event poster to continue';
					break;
			}

			error = true;
		} else if (i === 4) {
			if (
				!['jpg', 'jpeg', 'png'].includes(
					document
						.getElementById('speakerPoster')
						.files[0].name.split('.')[1]
						.toLowerCase()
				)
			) {
				input[i].classList.add('error');
				document
					.getElementsByTagName('label')
					[i].classList.add('input-error');
				desc.innerText = 'File format not valid';
				error = true;
			}
		} else if (i === 5) {
			for (
				let j = 0;
				j < document.getElementById('eventPosters').files.length;
				j++
			) {
				if (
					!['jpg', 'jpeg', 'png'].includes(
						document
							.getElementById('eventPosters')
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
	const eventName = document.getElementById('name').value.trim();
	const description = document.getElementById('description').value.trim();
	const eventDate = new Date(document.getElementById('date').value);
	const speakerName = document.getElementById('speakerName').value.trim();
	const speakerPoster = document.getElementById('speakerPoster').files;
	const eventPosters = document.getElementById('eventPosters').files;

	const eventData = {
		name: eventName,
		description,
		date: eventDate.toString(),
		speakerName,
	};

	uploadImage(eventName, eventData, speakerPoster, eventPosters);
}

function uploadImage(
	eventName,
	eventData,
	imageArr,
	nextImageArr = [],
	i = 0,
	multipleFiles = false
) {
	let storageRef = storage.ref(`events/${eventName}/${imageArr[i].name}`);
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
			if (multipleFiles) {
				let fileUploaderIcon = document.querySelectorAll(
					'.files-uploader-icon'
				)[1];
				fileUploaderIcon.classList.remove('hidden');
				fileUploaderIcon.parentNode.children[1].disabled = true;
				fileUploaderIcon.children[0].innerText = `${i}/${imageArr.length}`;
			} else {
				let fileUploaderIcon = document.querySelector(
					'.files-uploader-icon'
				);
				let progress =
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				fileUploaderIcon.classList.remove('hidden');
				fileUploaderIcon.parentNode.children[1].disabled = true;
				fileUploaderIcon.children[0].innerText = `${Math.round(
					progress
				)}%`;
			}
		},
		error => {
			console.log(error);
			if (multipleFiles) {
				alert(
					`Sorry, Error Occured while Uploading the Event Posters: ${error.code}`
				);
			} else {
				alert(
					`Sorry, Error Occured while Uploading the Speaker Poster: ${error.code}`
				);
			}
		},
		() => {
			uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
				if (multipleFiles) {
					let fileUploaderIcon = document.querySelectorAll(
						'.files-uploader-icon'
					)[1];
					eventPosterUrls.push(downloadURL);
					if (i < imageArr.length - 1) {
						uploadImage(
							eventName,
							eventData,
							imageArr,
							[],
							i + 1,
							true
						);
					} else {
						fileUploaderIcon.children[0].innerText = `${i + 1}/${
							imageArr.length
						}`;
						fileUploaderIcon.children[1].classList.add('hidden');
						document.getElementsByClassName(
							'nav-loader'
						)[0].style.visibility = 'visible';
						createNewEventData(eventData);
					}
				} else {
					let fileUploaderIcon = document.querySelector(
						'.files-uploader-icon'
					);
					speakerPosterUrl = downloadURL;
					fileUploaderIcon.children[1].classList.add('hidden');
					uploadImage(
						eventName,
						eventData,
						nextImageArr,
						[],
						0,
						true
					);
				}
			});
		}
	);
}

function createNewEventData(eventData) {
	let eventsRef = db.ref('events');
	let id = eventsRef.push().getKey();

	eventsRef
		.child(id)
		.set({
			...eventData,
			id,
			speakerPosterUrl,
			posterUrls: eventPosterUrls,
			tag:
				new Date(eventData.date).getTime() > new Date().getTime()
					? 'upcoming'
					: 'past',
		})
		.then(() => {
			eventPosterUrls = [];
			setTimeout(() => {
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				resetFormDataAndCloseForm();
				setTimeout(() => alert('Event Created Successfully'), 100);
			}, 1000);
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
	document.getElementById('modal').classList.add('d-none');
}
