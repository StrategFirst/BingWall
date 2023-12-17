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
	while(target.nextElementSibling.tagName != 'ARTICLE') {
		if(target.tagName == 'BODY') return;

		target = target.parentNode;
	}
	if( event.target.checked )
		target.nextElementSibling.classList.add('description-shown')
	else
		target.nextElementSibling.classList.remove('description-shown')
}

function change_findmarker( event ) {
}

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