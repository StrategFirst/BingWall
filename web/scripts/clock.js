setInterval( () => {

	const delta = (1000 * 60 * 60 * 24) - ( new Date() - new Date(document.lastModified) ) ;

	
	const domTarget = document.querySelector('#countdown')

	if( delta < 0 ) {

		domTarget.innerText = `Rafraichir`
		domTarget.onclick = () => document.location.reload()
		domTarget.classList.add('expired')
		domTarget.style.setProperty( '--jauge-state' , 1 )

	} else {
		const delayText = `${(~~(delta/3600000))%60}h ${(~~(delta/60000))%60}m ${(~~(delta/1000))%60}s`
		const delayRatio = delta / (1000 * 60 * 60 * 24)

		domTarget.innerText = delayText
		domTarget.style.setProperty( '--jauge-state' , (~~(delayRatio*1e5))/1e5 )
	}

}, 1000)