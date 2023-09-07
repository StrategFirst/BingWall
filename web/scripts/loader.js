/* Tool functions */
function toImageDom( path , name ) {
    let domElem = document.createElement('img')
    domElem.src = path;
    domElem.alt = `Picture of ${name}, from Bings dailys images`;
    domElem.title = name;
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

function toDescDom( path , name ) {
    const METADATA = (DAILY_METADATA[name] != undefined) ? DAILY_METADATA : MONTHLY_METADATA
    let domElem = document.createElement('article')
    let descIte = METADATA[name].descriptions.values()
    domElem.innerHTML = `
    <h3> Pays </h3>
    <p> ${ [... (METADATA[name].countries)].join`, `}. </p>
    <br/>
    <h3> Description </h3>
    <p> ${ descIte.next().value} </p>
    <details>
    <summary> Autres langues </summary>
    <ul>
    ${ ([... descIte]).map( k => `<li>${k}</li>`) }
    </ul>
    </details>` 

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
            result[entry.file] = { countries: new Set() , descriptions: new Set() }
        }
        result[entry.file].countries.add( entry.country )
        result[entry.file].descriptions.add( entry.desc )
        return result
    },({}))
}

function uniquePerMonth( filePathList ) {
    console.log(filePathList)
    fileNameList = filePathList.map( filePath => filePath.match( /([^\/]+)\.webp/ )[1] )
    fileFilterList = fileNameList.map( (fileName,ida) => fileNameList.reduce( (result,fn,idb) => ( (result) | ( (ida<idb) & (fn==fileName) ) ) , false ) )
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
    async function routine_daily() {
        DAILY_METADATA = await metadataDaily()
        await dataDaily()
    }
    async function routine_monthly() {
        MONTHLY_METADATA = await metadataMonthly()
        await dataMonthly()
    }
    
    await Promise.all( [ routine_daily() , routine_monthly() ] )
}

main()