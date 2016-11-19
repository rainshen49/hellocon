(function speaker() {
    var xhr = new XMLHttpRequest
    xhr.open('get', 'intro.html')
    xhr.send()
    xhr.onload = function(intro) {
        document.querySelector('main').innerHTML = xhr.response;
    }
})()