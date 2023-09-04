([... document.querySelectorAll('.local-icon')])
	.forEach( async (srcElem) => { 
		srcElem.parentNode.innerHTML = await fetch(`./assets/${srcElem.innerText}.svg`).then( res => res.text() )
	} )