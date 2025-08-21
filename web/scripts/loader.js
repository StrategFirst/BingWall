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

function toDummyDom( path, name) {
    let dm = document.createElement('div');
    dm.classList.add('dummy-div')
    return dm;
}

function toPanelDom( path, name ) {
    
    if(DAILY_METADATA[name] != undefined) {
        md = DAILY_METADATA[name];
        old = false;
        
    } else {
        md = MONTHLY_METADATA[name];
        old = true;
    }


    let panel = document.createElement('div');
    panel.classList.add("interact-panel");
    txt_dom = '';


    txt_dom += `<label class="neo-check" for="desc-link-details${ll=(window.toDescDomCount+=1)}"> <input type="checkbox" onchange="change_description(event)" id="desc-link-details${ll}" /> <div> <i class="local-icon">info</i>     </div> </label>`;

    if(md.gps != null) {
        let titleCleans = [... md.titles.values()].filter( title => !(title.match(/^Info$/i)) )[0];
        if( titleCleans == undefined ) {
            titleCleans = 'Missing Clean Title';
            console.warn('Missing clean title');
            console.trace();
        }
        let marker_ref_id = addMarker(
            md.gps.lat,
            md.gps.long,
            titleCleans,
            path,
            old,
        )
        txt_dom += `<label class="neo-check" for="desc-link-local${ll=(window.toDescDomCount+=1)}"> <input type="checkbox" onchange="change_findmarker(event)" id="desc-link-local${ll}" markerid="${marker_ref_id}"/> <div> <i class="local-icon">local</i>    </div> </label>`;
    }
    txt_dom += `<label class="neo-check" for="desc-link-file${ll=(window.toDescDomCount+=1)}"> <input type="checkbox" onchange="change_downloadimg(event)" id="desc-link-file${ll}" /> <div> <i class="local-icon">img-file</i> </div> </label>`;
    
    panel.innerHTML = txt_dom;

    return panel;
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
    <div class="description-panel">
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
    <br/>
    <h3> Credit </h3>
    ${
        (METADATA[name].credit != null)
        ?
        `<p> ${METADATA[name].credit} </p>`
        :
        '<p> Crédit inconnu </p>'
    }
    </div>
    ` 

    return domElem
} 

async function insertDom( locationXpath , img , panel, desc, dummy ) {
    const target = document.querySelector(locationXpath)
    target.appendChild( img )
    target.appendChild( panel )
    target.appendChild( desc )
    target.appendChild( dummy )
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
            result[entry.file] = {countries: new Set(), descriptions: new Set(), titles: new Set(), gps: null, credit: null}
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
        if(
            result[entry.file].credit === null &&
            entry.credit != null
        ) {
            result[entry.file].credit = entry.credit
        }
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
            .map( (args) => [ toImageDom(...args) , toPanelDom(...args), toDescDom(...args), toDummyDom(...args) ] )
            ) )
        .then( domElements => Promise.all( domElements.map( domElement => insertDom( `main ${type} div` , ...domElement ) ) ) )
        .then( updateLocalIcon )
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
