// Libraries
import fetch from 'node-fetch'
import { writeFile } from 'fs/promises'
import { parse } from 'node-html-parser'

// Config
import COUNTRIES from '/etc/scrapconfig/countries.json' assert { type: 'json' }

// Usefull function
async function fileFromURL( webURL , localPath ) {
	return fetch( webURL )
		.then( response => response.arrayBuffer() )
		.then( data => writeFile( localPath, Buffer.from(data) ) );
}

// Main
async function TodayMetadata() {
	return (
			( await Promise.all(
				COUNTRIES.map(
					async (country) => {
						let OGP_key_value_pair, HTMLPage;
						try {
							// Grab the page content
							HTMLPage = await fetch( `https://www.bing.com?cc=${country.code}` , {headers: {'User-Agent': 'NodeJS'}} ).then( res => res.text() );
							// Take every OGP key pair
							OGP_key_value_pair = Object.fromEntries( 
								parse( HTMLPage )
									.querySelectorAll('meta')
									.map( tag => [ tag.getAttribute('property') , tag.getAttribute('content') ] )
							)
						} catch( err ) {
							console.error( country , 1 , err )
							return undefined;
						}
						try {
							// Due to some convention the og:description field is cut of at 50'th character so we fill using the page
							const shorten_desc = OGP_key_value_pair["og:description"]							// extract the current
							const all_descs = HTMLPage.match( new RegExp(`"[^"]*${shorten_desc.replace(/["'<>]/g,'.+')}[^"]*"`,'g') )	// find in the page all the versions of the description ( cutted or not )
							const all_descs_len = all_descs.map( k=>k.length )									// extract the longest description
							const full_length_desc = all_descs[ all_descs_len.indexOf( Math.max( ... all_descs_len ) ) ]
							OGP_key_value_pair["og:description"] = full_length_desc											// replace the og one with the first longest
						} catch( err ) {
							console.error( country , 2 , err )
							return undefined;
						}
						return [ OGP_key_value_pair["og:image"] , OGP_key_value_pair["og:description"] , country.name , country.code ];
					}
				)
			) )
		
			.filter( x => x != undefined )
			.map( ([url,desc,country,country_code]) => ({
					country, desc, country_code,
					'url' : url.replace('_tmb.jpg&rf=','_1920x1080.webp&qlt=100'),
					'file' : url.match(/OHR\.(.*)_([^_]+)_tmb/)[1]
			}) )
	
	)
}

async function TodayData( metadata ) {

	// Download only once
	await Promise.all(
		Object.entries(
			Object.fromEntries(
				metadata.map( md => [md.file,md.url] )
			)
		)
		.map( ([file,url]) => fileFromURL(url,`/var/resources/${file}.webp`) )
	)

	await writeFile( `/var/resources/metadata.json` , JSON.stringify(metadata) )

}
TodayMetadata().then( TodayData )