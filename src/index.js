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
					country => fetch( `https://www.bing.com?cc=${country.code}` )	
						.then( res => res.text() )					
						.then( txt => parse(txt) )					
						.then( dom => dom.querySelectorAll('meta') )
						.then( lst => lst.map( tag => [ tag.getAttribute('property') , tag.getAttribute('content') ] ) )
						.then( ent => Object.fromEntries(ent) )
						.then( obj => [ obj["og:image"] , obj["og:description"] , country.name ] )
				)
			) )
		
			.filter( x => x.every( k => k != undefined ) )
			.map( ([url,desc,country]) => ({
					country, desc,
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

	console.table( metadata )

}
TodayMetadata().then( TodayData )