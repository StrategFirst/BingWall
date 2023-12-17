/**
 * Method triggerd on a switch changing state,
 * it switches the back and forth between light and dark mode
 * 
 * @param {MouseEvent} event The click event triggering this method
 */
function change_lightmode( event ) {
	if( event.target.checked )
		document.querySelector(':root').classList.remove('light')
	else
		document.querySelector(':root').classList.add('light')
}

/**
 * Method triggerd on a switch changing state,
 * it opens the api page in a new window/tab
 * 
 * @param {MouseEvent} event The click event triggering this method
 */
function change_infomode( event ) {
	const a = document.createElement('a')
	a.href = 'api/'
	a.target = '_blank'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	event.target.checked = false
}

/**
 * Method triggerd on a switch changing state,
 * it opens the github repository page in a new window/page
 * 
 * @param {MouseEvent} event The click event triggering this method
 */
function change_sourcecode( event ) {
	const a = document.createElement('a')
	a.href = 'https://github.com/StrategFirst/BingWall/'
	a.target = '_blank'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	event.target.checked = false
}

/**
 * Method triggerd on a switch changing state,
 * it shows or hide the map
 * 
 * @param {MouseEvent} event The click event triggering this method
 */
function change_localisation( event ) {
	if( event.target.checked )
		document.querySelector(':root').classList.remove('map-disabled')
	else
		document.querySelector(':root').classList.add('map-disabled')
}

/**
 * Method triggerd on a switch changing state,
 * it triggers the nearest picture description
 * 
 * @param {MouseEvent} event The click event triggering this method
 */
function change_description( event ) {
	let target = event.target;
	while(target.nextElementSibling.tagName != 'ARTICLE') {
		if(target.tagName == 'BODY') return;

		target = target.parentNode;
	}
	if( event.target.checked )
		target.nextElementSibling.classList.add('description-shown')
	else
		target.nextElementSibling.classList.remove('description-shown')
}

/**
 * Method triggerd on a switch changing state,
 * it puts into focus the relevant marker based on the event information
 * 
 * @param {MouseEvent} event The click event triggering this method
 */
function change_findmarker( event ) {
	// Make sure map is visible.
	let map_enable = document.getElementById('localisation');
	if(! map_enable.checked) map_enable.click();

	// Get the target marker reference
	let ref = event.target.getAttribute('markerid');
	
	// Make the popup appear
	if(document.getElementById(ref) == null) {
		document.querySelector(`img[title="${ref}"]`).click();
	}

	// Go to the popup
	let target = document.getElementById(ref);
	target.scrollIntoView({behavior:'smooth'});

	// Finish
	event.target.checked = false;
}

/**
 * Method triggerd on a switch changing state,
 * it download the nearest image
 * 
 * @param {MouseEvent} event The click event triggering this method
 */
function change_downloadimg( event ) {
	let target = event.target;
	while(target.previousElementSibling?.tagName != 'IMG') {
		if(target.tagName == 'BODY') return;

		target = target.parentNode;
	}
	const a = document.createElement('a')
	a.href = target.previousElementSibling.src
	a.target = '_blank'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	event.target.checked = false
}