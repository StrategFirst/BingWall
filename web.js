function toImageDom( path , name ) {
    let domElem = document.createElement('img')
    domElem.src = path;
    domElem.alt = `Picture of ${name}, from Bings dailys images`;
    domElem.title = name;
    return domElem;
}

fetch('./resources/list.txt')
    .then( response => response.text() )
    .then( text => text.split`\n` )
    .then( data => data.filter( line => line != '' && line != 'list.txt' ) )
    .then( data => data.map( filename => [ filename , filename.replace(/\.webp/,'')  ] ) )
    .then( paths => paths.map( (args) => toImageDom(...args) ) )
    .then( domElements => domElements.forEach( domElement => document.querySelector('main').appendChild(domElement) ) )
    .then( () => document.querySelector('aside').style.display = 'none' )

fetch('./resources/metadata.json')
    .then( response => response.json() )
    .then( console.table )