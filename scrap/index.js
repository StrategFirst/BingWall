// Libraries
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

class BingWallError extends Error {
	constructor(message) {
		super(message);
		this.name = "BingWallError";
	}
}
  
async function get_GPS( origin_DOM, origin_HTML ) {
	try {
		// Use search button link
		const location_btn = origin_DOM.querySelector(".mappin");
		if( location_btn == null) {
			throw new BingWallError("NoGPS Found for this country")
		}
		const location_path = location_btn.parentNode.parentNode.getAttribute('href');
		// To find the map widget and is GPS coord in an intern url
		let GPS_coord = await fetch(`https://bing.com${location_path}`)
						.then( res => res.text() )
						.then( txt => parse(txt) )
						.then( dom => dom.querySelector('#mv_baseMap')
											.getAttribute('src')
											.match(/([0-9]+\.[0-9]+),([0-9]+\.[0-9]+)/) )
						.catch( () => [null, null, null] )
		// Safe guards
		if( GPS_coord == null ) {
			GPS_coord = [null, null, null]
		}
		
		const lat = GPS_coord[1];
		const long = GPS_coord[2];

		return {lat,long};
	} catch(err) {
		if( err instanceof BingWallError ) {
			console.warn( err )
		} else {
			console.error( err )
		}
		return {lat:null,long:null};
	}
}

async function get_OGP( origin_DOM, origin_HTML ) {
	try {
		// Extract from the DOM OpenGraphProtocol meta key pair
		let OGP_key_value_pair = Object.fromEntries( origin_DOM
													.querySelectorAll('meta')
													.map( tag => [ tag.getAttribute('property') , tag.getAttribute('content') ] )
		)
		
		try {
			// Due to some convention the og:description field is cut of at 50'th character so we fill using the page
			const shorten_desc = OGP_key_value_pair["og:description"]								// extract the current
			const regex_desc = new RegExp(`"Description":"[^"]*${ shorten_desc
				.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")												// Escape meaningfull chars
				.replace(/["'<>]/g,'[^"]{1,10}')															// Bing put some chars in unicode escape sequence
			}[^"]*"`,'g')															
			const all_descs = origin_HTML.match( regex_desc )											// find in the page all the versions of the description
			const all_descs_len = all_descs.map( k=>k.length )										// extract the longest description
			const full_length_desc = all_descs[ all_descs_len.indexOf( Math.max( ... all_descs_len ) ) ]
			OGP_key_value_pair["og:description"] = full_length_desc.replace('"Description":','')	// replace the og one with the first longest
		} catch (err) {
			console.error( err )
		}

		return {
			url: OGP_key_value_pair["og:image"],
			desc: OGP_key_value_pair["og:description"],
			title: OGP_key_value_pair["og:title"],
		}
	} catch(err) {
		console.error( err )
		return {
			url: null,
			desc: null,
			title: null,
		}
	}
}
// Main
async function TodayMetadata() {
	return (
			( await Promise.all(
				COUNTRIES.map(
					async (country) => {
						try {
							// Grab the page content
							const HTMLPage = await fetch(
								`https://www.bing.com?cc=${country.code}`,
								{headers: {'User-Agent': 'NodeJS'}}
							).then( res => res.text() );

							// Use metadata finder :
							const GPS_coord = await get_GPS(parse(HTMLPage), HTMLPage);
							const OGP_value = await get_OGP(parse(HTMLPage), HTMLPage);

							// Add locals metadata :
							const country_info = {
								country: country.name,
								country_code: country.code,
							};
							const paths_info = {
								url : OGP_value.url.replace('_tmb.jpg&rf=','_1920x1080.webp&qlt=100'),
								file : OGP_value.url.match(/OHR\.(.*)_([^_]+)_tmb/)[1],
							}

							// Results :
							return {...GPS_coord, ...OGP_value, ...country_info, ...paths_info}
						} catch( err ) {
							console.error( err )
							return undefined;
						}
						
					}
				)
			) )
			.filter( x => x != undefined )
	
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