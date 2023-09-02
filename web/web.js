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

fetch('./resources/list.txt')
    .then( response => response.text() )
    .then( text => text.split`\n` )
    .then( data => data.filter( line => line != '' && line != 'list.txt' ) )
    .then( data => data.map( filename => [ filename , filename.replace(/\.\/resources\/([^.]+)\.webp/,(_,x)=>x)  ] ) )
    .then( paths => paths.map( (args) => toImageDom(...args) ) )
    .then( domElements => domElements.forEach( domElement => document.querySelector('header div').appendChild(domElement) ) )
    .then( () => document.querySelector('.daily-loading').classList.remove('daily-loading') )

fetch('./monthly-resources/list.txt')
    .then( response => response.text() )
    .then( text => text.split`\n` )
    .then( data => data.filter( line => line.match(/.webp/) ) )
    .then( data => data.map( filename => [ filename , filename.replace(/\.\/resources\/([^.]+)\.webp/,(_,x)=>x)  ] ) )
    .then( paths => paths.map( (args) => toImageDom(...args) ) )
    .then( domElements => domElements.forEach( domElement => document.querySelector('main div').appendChild(domElement) ) )
    .then( () => document.querySelector('.monthly-loading').classList.remove('monthly-loading') )

fetch('./resources/metadata.json')
    .then( response => response.json() )
    .then( console.table )