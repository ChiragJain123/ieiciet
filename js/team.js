let assignFirebase = () => {};
let fetchTeamMembersAndShow = () => {};
{
	let firebase = null;
	let db = null;
	assignFirebase = (firebaseObject, dbObject) => {
		firebase = firebaseObject;
		db = dbObject;

		assignFirebase = null;
	};

	fetchTeamMembersAndShow = async () => {
		let ref = db.ref('team');
		let memberCardContainer = document.querySelector(
			'#our-team .row.active-with-click'
		);

		ref.on('value', snapshot => {
			memberCardContainer.innerHTML = '';
			let membersData = snapshot.val();
			let arr = [];
			for (const memberData in membersData) {
				arr.push(membersData[memberData]);
			}
			arr.sort((a, b) => a.rank - b.rank);

			for (const memberData of arr) {
				memberCardContainer.innerHTML += `
                    <div class="col-md-4 col-sm-6 col-xs-12">
                        <article class="card Red">
                            <h2>
                                <span>${memberData.name}</span>
                                <strong>
                                    <i class="fa fa-fw fa-star"></i>
                                    ${
										memberData.position === 'member'
											? `${memberData.team} team`
											: memberData.position
									}
                                </strong>
                            </h2>
                            <div class="card-content">
                                <div class="img-container">
                                    <img class="img-responsive"
                                        src="${memberData.links.imgUrl}"
                                        class="hidden"
                                        onload="
                                            this.parentNode.children[1].classList.add('d-none');
                                            this.classList.remove('hidden');
                                        "
                                        width="100%">
                                    <div class="spinner-outer-container">
                                            <div class="spinner-border" role="status">
                                            <span class="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-description">${
									memberData.desc
								}</div>
                            </div>
                            <a class="card-btn-action">
                                <i class="fa fa-bars"></i>
                            </a>
                            <div class="card-footer">
                                <h4>
                                    Social
                                </h4>
                                ${
									memberData.links.website
										? `<a class="fa fa-fw fa-globe" href="${memberData.links.website}" target="_blank" rel="noreferrer noopener"></a>`
										: ''
								}
                                ${
									memberData.links.github
										? `<a class="fa fa-fw fa-github" href="${memberData.links.github}" target="_blank" rel="noreferrer noopener"></a>`
										: ''
								}
                                ${
									memberData.links.linkedIn
										? `<a class="fa fa-fw fa-linkedin" href="${memberData.links.linkedIn}" target="_blank" rel="noreferrer noopener"></a>`
										: ''
								}
                            </div>
                        </article>
                    </div>
                `;
			}

			assignFunctionalityToCards();
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
					}, 500);
					document.getElementById('root').style.display = null;
				}
			}, 500);
		});
	};

	function assignFunctionalityToCards() {
		$(function () {
			$('.card > .card-btn-action').click(function () {
				var card = $(this).parent('.card');
				var icon = $(this).children('i');
				icon.addClass('fa-spin-fast');

				if (card.hasClass('card-active')) {
					card.removeClass('card-active');

					window.setTimeout(function () {
						icon.removeClass('fa-arrow-left')
							.removeClass('fa-spin-fast')
							.addClass('fa-bars');
					}, 800);
				} else {
					card.addClass('card-active');

					window.setTimeout(function () {
						icon.removeClass('fa-bars')
							.removeClass('fa-spin-fast')
							.addClass('fa-arrow-left');
					}, 800);
				}
			});
		});
	}
}
