function change_lightmode( event ) {
	if( event.target.checked )
		document.querySelector(':root').classList.remove('light')
	else
		document.querySelector(':root').classList.add('light')
}

function change_infomode( event ) {
	const a = document.createElement('a')
	a.href = 'api/'
	a.target = '_blank'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	event.target.checked = false
}

function change_sourcecode( event ) {
	const a = document.createElement('a')
	a.href = 'https://github.com/StrategFirst/BingWall/'
	a.target = '_blank'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	event.target.checked = false
}

function change_localisation( event ) {
	let target = document.querySelector(':root');
	if( event.target.checked )
		target.classList.remove('map-disabled')
	else
		target.classList.add('map-disabled')
}

function change_description( event ) {
	let target = event.target;
	while(target.tagName != 'ARTICLE') {
		if(target.tagName == 'BODY') return;

		target = target.parentNode;
	}
	if( event.target.checked )
		target.classList.add('description-shown')
	else
		target.classList.remove('description-shown')
}