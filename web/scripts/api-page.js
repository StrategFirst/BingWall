function select(event) {
    //
    [... document.querySelectorAll('li.selected')].map( li => li.classList.remove('selected') )
    //
    let x = event.target;
    while(x.tagName != 'LI') {
        if(x.tagName == 'BODY') return;
        x = x.parentNode;
    }
    //
    x.classList.add('selected')
}


[... document.querySelectorAll('body > ul > li')].map( li => li.addEventListener('click', select) )