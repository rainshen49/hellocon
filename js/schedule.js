(function schedule() {
    var xhr = new XMLHttpRequest
    xhr.open('get', 'helloconschedule.html')
    xhr.send()
    xhr.onload = function(intro) {
        document.querySelector('main').innerHTML = xhr.response;
    }
})()