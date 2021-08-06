let eventHandler = e => {
	if (e.type === 'keyup' && e.key !== 'Enter') {
		return;
	}
	let val = e.target.value.slice(1, e.target.value.length - 1);
	updateDb({
		[`${e.target.parentNode.children[1].getAttribute('data-path')}`]: val,
	});
};
function fetchUsersListAndUdpateTable() {
	db.ref(`users`).on('value', snapshot => {
		let usersData = snapshot.val();
		let users = [];
		for (let user in usersData) {
			users.push(usersData[user]);
		}
		users.sort(
			(a, b) =>
				new Date(b.accountCreationInfo.date).getTime() -
				new Date(a.accountCreationInfo.date).getTime()
		);
		let tbody = document.querySelector(
			'#users-list-card .card-body table tbody'
		);
		let spinnerWrapper = document.getElementById('spinner-loader-wrapper');
		let table = document.querySelector('#users-list-card .card-body table');
		let cardBody = document.querySelector('#users-list-card .card-body');
		cardBody.style.overflowY = 'hidden';

		tbody.innerHTML = '';
		let index = 1;
		for (let user of users) {
			tbody.innerHTML += `
                <tr class="accordion-toggle collapsed" id="${user.uid}">
                    <th socpe="row">${index}</td>
                    <td>${user.email}</td>
                    <td>
                        <span
                            class="material-icons-outlined table-icons accordion-toggle collapsed"
                            id="accordion${index}" data-toggle="collapse" data-parent="#accordion${index}"
                            href="#collapse${index}" onclick="toggleAccordionState(this, '${
				user.uid
			}')">
                            edit
                        </span>
                    </td>
                </tr>
                <tr class="editor">
                    <td colspan="4">
                        <div id="collapse${index}" class="collapse in data-tree col-xl ${
				sessionStorage
					.getItem('openedUserAccordions')
					.split(',')
					.includes(user.uid) && 'show'
			}">
                            <div class="data-tree-default">${user.uid}</div>
                            <ul class="data-tree-default-ul">
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
			let listNode = document.querySelectorAll('.data-tree-default-ul')[
				index - 1
			];
			for (const item in user) {
				listNode.innerHTML += `
                    <li class='${
						typeof user[item] === 'object'
							? 'data-tree-closed'
							: 'data-tree-leaf'
					}' data-id='${user.uid}'>
                        <div>
                            <ins class='data-tree-icon' data-child='${JSON.stringify(
								user[item]
							)}' onclick="toggleChildList(this)" id="${`${user.uid}-${item}`}"}>&nbsp;</ins>
                            <span class='data-tree-content' data-path="${`/${user.uid}/${item}`}">${item}${
					typeof user[item] !== 'object' ? ':' : ''
				}</span>
                            ${
								typeof user[item] !== 'object'
									? `<input type="text" class="data-tree-input" value='"${
											user[item]
									  }"' style="width: ${
											user[item].toString().length + 5
									  }ch;" ${
											['email', 'uid'].includes(item) &&
											'disabled'
									  }>`
									: ''
							}
                        </div>
                        ${typeof user[item] === 'object' ? '<ul></ul>' : ''}
                    </li>
                `;
			}
			index++;
		}
		let tempEleArr = [];
		let childrenIdsToBeOpened = sessionStorage
			.getItem('openedUsersChildNodes')
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
		if (sessionStorage.getItem('usersAccordionScrollPositions')) {
			let scrollPositions = sessionStorage
				.getItem('usersAccordionScrollPositions')
				.split(',');
			let ind = 0;
			for (let ele of document.querySelectorAll('.collapse')) {
				ele.scrollTop = scrollPositions[ind];
				ind++;
			}
			sessionStorage.setItem('usersAccordionScrollPositions', null);
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
								  }"'  style="width: ${
										data[item].toString().length + 5
								  }ch;">`
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
			.getItem('openedUsersChildNodes')
			.split(',');
		let updatedOpenedElementIds = [];
		for (let i = 0; i < openedElementIds.length; i++) {
			if (!openedElementIds[i].includes(e.id)) {
				updatedOpenedElementIds.push(openedElementIds[i]);
			}
		}
		sessionStorage.setItem(
			'openedUsersChildNodes',
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
		'usersAccordionScrollPositions',
		scrollPositions.join(',')
	);
	db.ref('users').update(updates);
}

function toggleAccordionState(e, uid) {
	if (
		!sessionStorage.getItem('openedUserAccordions').split(',').includes(uid)
	) {
		sessionStorage.setItem(
			'openedUserAccordions',
			sessionStorage.getItem('openedUserAccordions') + `${uid},`
		);
	} else {
		let arr = sessionStorage.getItem('openedUserAccordions').split(',');
		let ind = arr.indexOf(uid);
		arr.splice(ind, 1);
		let str = arr.join(',');
		sessionStorage.setItem('openedUserAccordions', str);
	}
}

function toggleChildListNodeState(childNode) {
	if (
		!sessionStorage
			.getItem('openedUsersChildNodes')
			.split(',')
			.includes(childNode.id)
	) {
		sessionStorage.setItem(
			'openedUsersChildNodes',
			sessionStorage.getItem('openedUsersChildNodes') + `${childNode.id},`
		);
	} else {
		let arr = sessionStorage.getItem('openedUsersChildNodes').split(',');
		let ind = arr.indexOf(childNode.id);
		arr.splice(ind, 1);
		let str = arr.join(',');
		sessionStorage.setItem('openedUsersChildNodes', str);
	}
}
