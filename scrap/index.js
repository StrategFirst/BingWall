// Libraries
import { writeFile } from 'fs/promises'
import { parse } from 'node-html-parser'

// Config
import COUNTRIES from '/etc/scrapconfig/countries.json' assert { type: 'json' }

// Custom Error
class BingWallError extends Error {
	constructor(message) {
		super(message);
		this.name = "BingWallError";
	}
}


// Tool function
/**
 * Download from the given `webURL` a file and
 * write it to `localPath`
 * 
 * JSDoc :
 * 
 * @param {Document} webURL
 * @param {string} localPath
 * @return {Promise<undefined>}
 * 
 */
async function fileFromURL( webURL , localPath ) {
	return fetch( webURL )
		.then( response => response.arrayBuffer() )
		.then( data => writeFile( localPath, Buffer.from(data) ) );
}

// Metadata extractor
/**
 * From the parsed dom and is original string of an HTML page
 * extract the GPS information
 * 
 * JSDoc :
 * 
 * @param {Document} origin_DOM
 * @param {string} origin_HTML
 * @return {Promise<{lat: string | null;long: string | null;}>}
 * 
 */
async function get_GPS( origin_DOM, origin_HTML ) {
	try {
		// Find the button who reference the location :
		const location_btn = origin_DOM.querySelector(".mappin");
		if( location_btn == null) {
			throw new BingWallError("NoGPS Found for this country")
		}
		// Extract the link of this button :
		const location_path = location_btn.parentNode.parentNode.getAttribute('href');
		// Get the linked page :
		let GPS_coord = await fetch(`https://bing.com${location_path}`)
						.then( res => res.text() )
						.then( txt => parse(txt) )
						// Find the display map widget
						.then( dom => dom.querySelector('#mv_baseMap')
											.getAttribute('src')
											// Extract from the small element the GPS coords
											.match(/(-?[0-9]+\.[0-9]+),(-?[0-9]+\.[0-9]+)/) )
						// Handle crashes
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

/**
 * From the parsed dom and is original string of an HTML page
 * extract the OGP information
 * 
 * It find the extended value for fields with more than the 50 chars threshold
 * 
 * JSDoc :
 * 
 * @param {Document} origin_DOM
 * @param {string} origin_HTML
 * @return {Promise<{url: string | null;desc: string | null;title: string | null;}>}
 * 
 */
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
		};
	} catch(err) {
		console.error( err )
		return {
			url: null,
			desc: null,
			title: null,
		}
	}
}


// Core function
/**
 * For all the countries within the config extract a bunch of metadata
 * 
 * @return {Promise<[{lat: string | null;long: string | null; url: string; file: string; desc: string | null;title: string | null;}]>}
 * 
 */
async function TodayMetadata() {
	return (
		await Promise.all(
			COUNTRIES.map(
				async (country) => {
					try {
						// Grab the page content
						const HTMLPage = await fetch(
							`https://www.bing.com?cc=${country.code}`,
							{headers: {'User-Agent': 'NodeJS'}}
						).then( res => res.text() );

						// Use metadata finder :
						let GPS_coord, OGP_value;
						[GPS_coord, OGP_value] = await Promise.all([
							get_GPS(parse(HTMLPage), HTMLPage),
							get_OGP(parse(HTMLPage), HTMLPage),
						]);

						// Add locals metadata :
						const country_info = {
							country: country.name,
							country_code: country.code,
						};
						const paths_info = {
							url : OGP_value.url.replace('_tmb.jpg&rf=','_1920x1080.webp&qlt=100'),
							file : OGP_value.url.match(/OHR\.(.*)_([^_]+)_tmb/)[1],
						};

						// Results :
						return {...GPS_coord, ...OGP_value, ...country_info, ...paths_info};
					} catch( err ) {
						console.error( err )
						return undefined;
					}		
				}
			)
		)
	).filter( x => x != undefined );
}

/**
 * From all the listed metadata get the corresponding data locally!
 * 
 * JSDoc :
 * @param {[{lat: string | null;long: string | null; url: string; file: string; desc: string | null;title: string | null;}]} metadata
 * @return {Promise<void>}
 */
async function TodayData( metadata ) {
	// Download only once (by going from array to object and vice versa)
	let A = Promise.all(
		Object.entries(
			Object.fromEntries(
				metadata.map( md => [md.file,md.url] )
			)
		)
		.map( ([file,url]) => fileFromURL(url,`/var/resources/${file}.webp`) )
	)

	let B = writeFile( `/var/resources/metadata.json` , JSON.stringify(metadata) )

	await Promise.all([A,B]);
}

// Main
TodayMetadata().then( TodayData )