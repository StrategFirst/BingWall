function change_lightmode( event ) {
	if( event.target.checked )
		document.querySelector(':root').classList.remove('light')
	else
		document.querySelector(':root').classList.add('light')
}

function change_infomode( event ) {
	if( event.target.checked )
		document.querySelector(':root').classList.add('info')
	else
		document.querySelector(':root').classList.remove('info')
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
	if( event.target.checked )
		document.querySelector(':root').classList.remove('map-disabled')
	else
		document.querySelector(':root').classList.add('map-disabled')
}