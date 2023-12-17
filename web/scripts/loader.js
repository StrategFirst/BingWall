/* Tool functions */
function toImageDom( path , name ) {
    let domElem = document.createElement('img')
    domElem.src = path;
    domElem.alt = `Picture of ${name}, from Bings dailys images`;
    domElem.title = name;
    domElem.loading = 'lazy';
    domElem.onclick = event => {
        let x = document.createElement('a');
        x.href = event.target.src;
        x.target = '_blank';
        document.body.appendChild(x);
        x.click();
        document.body.removeChild(x);
    };
    return domElem;
}

function txtSourceCleanup( srcTxt ) {
    return srcTxt
        .replace( '<' , '&lt;' )
        .replace( '>' , '&gt;' )
        .replace( /\\u[0-9A-F]{4}/gi , x=>String.fromCharCode(parseInt(x[0].substring(2))) )
}

window.toDescDomCount=0

function toDescDom( path , name ) {
    const METADATA = (DAILY_METADATA[name] != undefined) ? DAILY_METADATA : MONTHLY_METADATA
    let domElem = document.createElement('article')
    let descIte = METADATA[name].descriptions.values()
    let titleCleans = [... METADATA[name].titles.values()].filter( title => !(title.match(/^Info$/i)) )
    let titleIte = titleCleans[Symbol.iterator]()
    let x;
    domElem.innerHTML = `
    <div class="interact-panel">
        <label class="neo-check" for="desc-link-${x=(window.toDescDomCount+=1)}"> <input type="checkbox" id="desc-link-${x}"/> <div> <i class="local-icon">moon</i>   </div> </label>
        <label class="neo-check" for="desc-link-${x=(window.toDescDomCount+=1)}"> <input type="checkbox" id="desc-link-${x}"/> <div> <i class="local-icon">github</i> </div> </label>
        <label class="neo-check" for="desc-link-${x=(window.toDescDomCount+=1)}"> <input type="checkbox" id="desc-link-${x}"/> <div> <i class="local-icon">info</i>   </div> </label>
    </div>
    ${
        (titleCleans.length > 0)
        ?
        `
        <h3> Titres </h3>
        <p> ${ txtSourceCleanup(titleIte.next().value) } </p>
        ${
            (titleCleans.length > 1 )
            ?
            `
            <details>
            <summary> Autres titres </summary>
            <ul>
            ${ ([... titleIte]).map( k => `<li>${txtSourceCleanup(k)}</li>` ).join`` }
            </ul>
            </details>
            ` 
            : 
            ''
        }
        <br/>
        `
        :
        ''
    }
    <h3> Pays </h3>
    <p> ${ [... (METADATA[name].countries)].join`, `}. </p>
    ${
        (METADATA[name].titles.size > 0)
        ?
        `
        <br/>
        <h3> Descriptions </h3>
        <p> ${ txtSourceCleanup(descIte.next().value) } </p>
        ${
            (METADATA[name].titles.size > 1 )
            ?
            `
            <details>
            <summary> Autres langues </summary>
            <ul>
            ${ ([... descIte]).map( k => `<li>${ txtSourceCleanup(k) }</li>` ).join`` }
            </ul>
            </details>
            ` 
            : 
            ''
        }
        `
        :
        ''
    }
    ${
        /**/
        (METADATA[name].gps != null)
        ?
        addMarker(
            METADATA[name].gps.lat,
            METADATA[name].gps.long,
            titleCleans.length>0 ? titleCleans[0] : '_',
            path,
            (DAILY_METADATA[name] != undefined)
        )
        :
        ''
    }` 

    return domElem
} 

async function insertDom( locationXpath , img , desc ) {
    const target = document.querySelector(locationXpath)
    target.appendChild( img )
    target.appendChild( desc )
    return await waitLoad( img )  
}
function waitLoad( img ) {
    return new Promise( (resolve,reject) => {
        img.onload = () => resolve(img)
        img.onerror = reject
    })
}

function reshapeMetadata( arr ) {
    return arr.reduce( (result,entry) => { 
        if( result[entry.file] == undefined ) {
            result[entry.file] = { countries: new Set() , descriptions: new Set() , titles: new Set(), gps: null }
        }
        if(
            result[entry.file].gps === null &&
            entry.lat != null &&
            entry.long != null    
        ) {
            result[entry.file].gps = {lat: entry.lat, long: entry.long}
        }
        result[entry.file].countries.add( entry.country )
        result[entry.file].descriptions.add( entry.desc )
        if( entry.title )
            result[entry.file].titles.add( entry.title )
        return result
    },({}))
}

function uniquePerMonth( filePathList ) {
    const fileNameList = filePathList.map( filePath => filePath.match( /([^\/]+)\.webp/ )[1] )
    const fileFilterList = fileNameList.map( (fileName,ida) => fileNameList.reduce( (result,fn,idb) => ( (result) | ( (ida<idb) & (fn==fileName) ) ) , false ) )
    return filePathList.filter( (_,i) => !fileFilterList[i] )
}

/* Core functions */
async function getData( sourcePath , type ) {
    await fetch(sourcePath)
        .then( response => response.text() )
        .then( text => text.split`\n`
            .filter( line => line.match(/.webp/) ) 
            )
        .then( uniquePerMonth )
        .then( path => (path
            .map( filename => [ filename , filename.replace(/.*\/([^.\/]+)\.webp$/,(_,x)=>x)  ] )
            .map( (args) => [ toImageDom(...args) , toDescDom(...args) ] )
            ) )
        .then( domElements => Promise.all( domElements.map( domElement => insertDom( `main ${type} div` , ...domElement ) ) ) )
        .then( () => document.querySelector(`${type}.loading`).classList.remove('loading') )
        .catch( (reason) => {
            console.error( reason );
            console.error( `An error occured for the above reason please consider reaching out our services by creating an ticket on https://github.com/StrategFirst/BingWall/issues/new/choose with the above information and any other usefull information folowing the given rules. Thanks.`)
            document.querySelector(`${type}.loading`).classList.remove('loading')
            document.querySelector(`${type}.loading`).classList.add('laoding-failure')
        })
}

function dataDaily() { return getData( './resources/list.txt' , '#daily' ); }
function dataMonthly() { return getData( './monthly-resources/list.txt' , '#monthly' ); }

async function metadataDaily() {
    return await fetch('./resources/metadata.json')
        .then( response => response.json() )
        .then( reshapeMetadata )
}

async function metadataMonthly() {
    return await fetch('./monthly-resources/list.txt')
        .then( response => response.text() )
        .then( text => text.split`\n` )
        .then( paths => [...(new Set(paths.filter( p => p.match(/.webp$/) ).map( p => p.replace( /[^\\/]+.webp$/ , 'metadata.json' ) )))] )
        .then( list => Promise.all( list.map( p=>fetch(p).then(res=>res.json()))) )
        .then( meta => meta.flat() )
        .then( reshapeMetadata )
}

/* Main flow */

let DAILY_METADATA;
let MONTHLY_METADATA;

async function main() {
    try {
        async function routine_daily() {
            DAILY_METADATA = await metadataDaily()
            await dataDaily()
        }
        async function routine_monthly() {
            MONTHLY_METADATA = await metadataMonthly()
            await dataMonthly()
        }
        
        await Promise.all( [ routine_daily() , routine_monthly() ] )
    } catch (err) {
        console.error( err )
        console.trace( err )
        console.error( `An error occured for the above reason please consider reaching out our services by creating an ticket on https://github.com/StrategFirst/BingWall/issues/new/choose with the above information and any other usefull information folowing the given rules. Thanks.`)
    }
}

main()