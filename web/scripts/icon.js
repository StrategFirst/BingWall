function updateLocalIcon() {

	async function getIcon(key) {
		const lsk = `svg-icon.${key}`;

		// Try to use localStorage as buffer cache
		let fromBuffer = localStorage.getItem(lsk);
		if( fromBuffer != null ) {
			return fromBuffer;
		}

		// Normal load and save in buffer cache
		let res = await fetch(`./assets/${key}.svg`);
		let txt = await res.text();
		localStorage.setItem(lsk, txt);
		return txt;
	}


	([... document.querySelectorAll(':not(.local-icon-loaded).local-icon')])
		.forEach( (srcElem) => getIcon(srcElem.innerText)
						.then( txt => srcElem.parentNode.innerHTML = txt )
						.then( ___ => srcElem.classList.add('local-icon-loaded'))
		)
}

updateLocalIcon()

document.body.addEventListener('change', updateLocalIcon)
