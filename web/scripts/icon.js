function updateLocalIcon() {
	([... document.querySelectorAll(':not(.local-icon-loaded).local-icon')])
		.forEach( (srcElem) => fetch(`./assets/${srcElem.innerText}.svg`)
								.then( res => res.text() )
								.then( txt => srcElem.parentNode.innerHTML = txt )
								.then( ___ => srcElem.classList.add('local-icon-loaded'))
		)
}

updateLocalIcon()

document.body.addEventListener('change', updateLocalIcon)