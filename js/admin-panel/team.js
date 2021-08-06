let eventHandler = e => {
	if (e.type === 'keyup' && e.key !== 'Enter') {
		return;
	}
	let val = e.target.value.slice(1, e.target.value.length - 1);
	updateDb({
		[`${e.target.parentNode.children[1].getAttribute('data-path')}`]: val,
	});
};
function fetchTeamMembersAndUdpateTable() {
	db.ref(`team`).on('value', snapshot => {
		let membersData = snapshot.val();
		let members = [];
		for (let member in membersData) {
			members.push(membersData[member]);
		}
		members.sort((a, b) => a.rank - b.rank);
		let tbody = document.querySelector(
			'#members-list-card .card-body table tbody'
		);
		let spinnerWrapper = document.getElementById('spinner-loader-wrapper');
		let table = document.querySelector(
			'#members-list-card .card-body table'
		);
		let cardBody = document.querySelector('#members-list-card .card-body');
		cardBody.style.overflowY = 'hidden';

		tbody.innerHTML = '';
		let index = 1;
		for (let member of members) {
			tbody.innerHTML += `
                <tr class="accordion-toggle collapsed" id="${member.id}">
                    <th socpe="row">${index}</td>
                    <td>${member.name}</td>
                    <td>
                        <span
                            class="material-icons-outlined table-icons accordion-toggle collapsed"
                            id="accordion${index}" data-toggle="collapse" data-parent="#accordion${index}"
                            href="#collapse${index}" onclick="toogleAccordionState(this, '${
				member.id
			}')">
                            edit
                        </span>
                    </td>
                    <td>
                        <span
                            class="material-icons-outlined table-icons" onclick="confirmAndDeleteMember(this, '${
								member.id
							}', '${member.email}', '${member.name}')">
                            delete
                        </span>
                    </td>
                </tr>
                <tr class="editor">
                    <td colspan="4">
                        <div id="collapse${index}" class="collapse in data-tree col-xl ${
				sessionStorage
					.getItem('openedTeamAccordions')
					.split(',')
					.includes(member.id) && 'show'
			}">
                            <div class="data-tree-default">${member.id}</div>
                            <ul class="data-tree-default-ul">
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
			let listNode = document.querySelectorAll('.data-tree-default-ul')[
				index - 1
			];
			for (const item in member) {
				listNode.innerHTML += `
                    <li class='${
						typeof member[item] === 'object'
							? 'data-tree-closed'
							: 'data-tree-leaf'
					}' data-id='${member.id}'>
                        <div>
                            <ins class='data-tree-icon' data-child='${JSON.stringify(
								member[item]
							)}' onclick="toggleChildList(this)" id="${`${member.id}-${item}`}"}>&nbsp;</ins>
                            <span class='data-tree-content' data-path="${`/${member.id}/${item}`}">${item}${
					typeof member[item] !== 'object' ? ':' : ''
				}</span>
                            ${
								typeof member[item] !== 'object'
									? `<input type="text" class="data-tree-input" value='"${
											member[item]
									  }"' style="width: ${
											member[item].toString().length + 5
									  }ch; max-width: ${
											[
												'desc',
												'imgUrl',
												'website',
												'github',
												'linkedIn',
											].includes(item) && '55ch'
									  }" ${item === 'id' && 'disabled'}>`
									: ''
							}
                        </div>
                        ${typeof member[item] === 'object' ? '<ul></ul>' : ''}
                    </li>
                `;
			}
			index++;
		}
		let tempEleArr = [];
		let childrenIdsToBeOpened = sessionStorage
			.getItem('openedTeamChildNodes')
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
		if (sessionStorage.getItem('teamAccordionScrollPositions')) {
			let scrollPositions = sessionStorage
				.getItem('teamAccordionScrollPositions')
				.split(',');
			let ind = 0;
			for (let ele of document.querySelectorAll('.collapse')) {
				ele.scrollTop = scrollPositions[ind];
				ind++;
			}
			sessionStorage.setItem('teamAccordionScrollPositions', null);
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
										['links'].includes(
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
			.getItem('openedTeamChildNodes')
			.split(',');
		let updatedOpenedElementIds = [];
		for (let i = 0; i < openedElementIds.length; i++) {
			if (!openedElementIds[i].includes(e.id)) {
				updatedOpenedElementIds.push(openedElementIds[i]);
			}
		}
		sessionStorage.setItem(
			'openedTeamChildNodes',
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
		'teamAccordionScrollPositions',
		scrollPositions.join(',')
	);
	db.ref('team').update(updates);
}

function toogleAccordionState(e, eventId) {
	if (
		!sessionStorage
			.getItem('openedTeamAccordions')
			.split(',')
			.includes(eventId)
	) {
		sessionStorage.setItem(
			'openedTeamAccordions',
			sessionStorage.getItem('openedTeamAccordions') + `${eventId},`
		);
	} else {
		let arr = sessionStorage.getItem('openedTeamAccordions').split(',');
		let ind = arr.indexOf(eventId);
		arr.splice(ind, 1);
		let str = arr.join(',');
		sessionStorage.setItem('openedTeamAccordions', str);
	}
}

function toggleChildListNodeState(childNode) {
	if (
		!sessionStorage
			.getItem('openedTeamChildNodes')
			.split(',')
			.includes(childNode.id)
	) {
		sessionStorage.setItem(
			'openedTeamChildNodes',
			sessionStorage.getItem('openedTeamChildNodes') + `${childNode.id},`
		);
	} else {
		let arr = sessionStorage.getItem('openedTeamChildNodes').split(',');
		let ind = arr.indexOf(childNode.id);
		arr.splice(ind, 1);
		let str = arr.join(',');
		sessionStorage.setItem('openedTeamChildNodes', str);
	}
}

function confirmAndDeleteMember(e, memberId, memberEmail, memberName) {
	let confrmation = confirm(
		`All data at this location, including nested data and all the images of this member, would be permanently deleted!!\nAre you sure you want to delete ${memberName}?`
	);
	if (confrmation) {
		db.ref(`team/${memberId}`)
			.remove()
			.then(() => {
				let memberStorageRef = storage.ref(
					`team/${memberEmail.replaceAll('.', '*_*')}`
				);
				memberStorageRef.listAll().then(res => {
					res.items.forEach(itemRef => {
						storage
							.ref(itemRef.fullPath)
							.delete()
							.then(() => {
								alert(
									`${memberName} data was deleted successfully!!`
								);
							})
							.catch(error =>
								alert(
									`Sorry, something went wrong!! ${itemRef.fullPath} could not be deleted: ${error.code}.\nPlease try again later`
								)
							);
					});
				});
			})
			.catch(err => {
				console.log(error);
				alert(
					`Sorry, something went wrong!! ${memberName} could not be deleted. Please try again later`
				);
			});
	}
}

function createNewEvent(e) {
	let error = false;
	const input = document.querySelectorAll('#modal input, #modal textarea');
	for (let i = 0; i < input.length; i++) {
		const desc = document.getElementsByClassName('text-input-error')[i];
		if (input[i].value.trim() === '' && i < 7) {
			input[i].classList.add('error');
			document
				.getElementsByTagName('label')
				[i].classList.add('input-error');
			switch (i) {
				case 0:
					desc.innerText = 'Invalid Name';
					break;
				case 1:
					desc.innerText = 'Invalid Email';
					break;
				case 2:
					desc.innerText = 'Invalid Description';
					break;
				case 3:
					desc.innerText = 'Invalid Team';
					break;
				case 4:
					desc.innerText = 'Invalid Position';
					break;
				case 5:
					desc.innerText = 'Invalid Rank';
					break;
				case 6:
					desc.innerText = 'Invalid Roll No.';
					break;
			}

			error = true;
		}

		if (i === 1) {
			if (
				!/^[a-zA-Z0-9]\.{0,1}([a-zA-Z0-9]+\.)*[a-zA-Z0-9]+@([a-z]+\.)+[a-z]{2,4}$/.test(
					input[i].value.trim()
				)
			) {
				input[i].classList.add('error');
				document
					.getElementsByTagName('label')
					[i].classList.add('input-error');
				desc.innerText = 'Invalid email';
				error = true;
			}
		} else if (i === 10) {
			if (document.getElementById('image').files.length === 0) {
				input[i].classList.add('error');
				document
					.getElementsByTagName('label')
					[i].classList.add('input-error');
				desc.innerText = 'Invalid member img';
				error = true;
			} else if (
				!['jpg', 'jpeg', 'png'].includes(
					document
						.getElementById('image')
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
		}
	}

	if (error) {
		return;
	}
	const name = document.getElementById('name').value.trim();
	const email = document.getElementById('email').value.trim();
	const desc = document.getElementById('description').value.trim();
	const team = document.getElementById('team').value.trim();
	const position = document.getElementById('position').value.trim();
	const rank = document.getElementById('rank').value.trim();
	const rollno = document.getElementById('rollno').value.trim();
	const website = document.getElementById('website').value.trim();
	const github = document.getElementById('github').value.trim();
	const linkedIn = document.getElementById('linkedin').value.trim();
	const image = document.getElementById('image').files;

	const memberData = {
		name,
		email,
		desc,
		team,
		position,
		rank,
		rollno,
		links: {},
	};

	if (website) {
		memberData.links.website = website;
	}
	if (github) {
		memberData.links.github = github;
	}
	if (linkedIn) {
		memberData.links.linkedIn = linkedIn;
	}

	uploadImage(email, memberData, image);
}

function uploadImage(memberEmail, memberData, imageArr) {
	let storageRef = storage.ref(
		`team/${memberEmail.replaceAll('.', '*_*')}/${imageArr[0].name}`
	);
	let uploadTask = storageRef.put(imageArr[0], {
		contentType: `image/${imageArr[0].name.split('.')[1]}`,
	});

	uploadTask.on(
		firebase.storage.TaskEvent.STATE_CHANGED,
		snapshot => {
			let buttons = document.querySelectorAll('.button-lg');
			for (let btn of buttons) {
				btn.disabled = true;
			}
			let fileUploaderIcon = document.querySelector(
				'.files-uploader-icon'
			);
			let progress =
				(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			fileUploaderIcon.classList.remove('hidden');
			fileUploaderIcon.parentNode.children[1].disabled = true;
			fileUploaderIcon.children[0].innerText = `${Math.round(progress)}%`;
		},
		error => {
			console.log(error);
			alert(
				`Sorry, Error Occured while Uploading the image: ${error.code}`
			);
		},
		() => {
			uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
				let fileUploaderIcon = document.querySelectorAll(
					'.files-uploader-icon'
				)[0];
				fileUploaderIcon.children[1].classList.add('hidden');
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = 'visible';
				let data = memberData;
				data.links.imgUrl = downloadURL;
				createNewMemberData(data);
			});
		}
	);
}

function createNewMemberData(memberData) {
	let teamRef = db.ref('team');
	let id = teamRef.push().getKey();

	teamRef
		.child(id)
		.set({
			...memberData,
			id,
		})
		.then(() => {
			setTimeout(() => {
				document.getElementsByClassName(
					'nav-loader'
				)[0].style.visibility = null;
				resetFormDataAndCloseForm();
				setTimeout(() => alert('Member Created Successfully'), 100);
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
