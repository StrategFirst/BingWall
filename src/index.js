// Libraries
import fetch from 'node-fetch'
import { writeFile } from 'fs/promises'
import { parse } from 'node-html-parser'

// Config
import COUNTRIES from '/etc/scrapconfig/countries.json' assert { type: 'json' }
import URIS from '/etc/scrapconfig/uris.json' assert { type: 'json' }

// Usefull function
async function fileFromURL( webURL , localPath ) {
	return fetch( webURL )
		.then( response => response.arrayBuffer() )
		.then( data => writeFile( localPath, Buffer.from(data) ) );
}

// Main
for(const country of COUNTRIES ) {
	
	fetch( `${URIS.source}?cc=${country.code}` )	// Page à scrapper
		.then( response => response.text() )		// Récupération de l'HTML
		.then( text => parse(text) ) 				// Parsing de la page HTML
		.then( result => URIS.dom
							.map( ({path}) => result.querySelector(path) ) 				// Recherche des balises souhaités
							.filter( element => (element != null ) ) 					// Retrait des recherches échoués
							.map( tag => `${URIS.source}${tag.getAttribute('href')}` )	// Génération de l'URL complète
							.map( data => data.replace(/1920x1200/g,'1920x1080') )		// Tricks : l'image est dispo avec une résolution de 1920x1080 et cette résolution n'as pas de watermark ^^
							.filter( element => (element != null ) ) 					// Retrait des recherches échoués (au cas où)
							.forEach( imageURL => {
								let source = imageURL
								let destination = (new URL(imageURL)).searchParams.get('id');	// Le nom est dans l'URL mais attention il reste un artifact d'un truc mal fait chez eux 
								if( destination == null ) return; 								// Sécurité de plus
								destination = `${URIS.destination}${destination.replace(/OHR.([^_]+).*jpg/,(_,m)=>`${m}.jpg`)}`	// Nettoyage du nom du fichier pour récupérer le prefix et suffix de bing qui pour nous est inutile et lourd
								fileFromURL( source , destination ) 							// Téléchargement
							} )
			)
}