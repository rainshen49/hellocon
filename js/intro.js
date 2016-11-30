(function intro() {
    var xhr = new XMLHttpRequest
    xhr.open('get', 'conduct.html')
    xhr.send()
    xhr.onload = function(intro) {
        document.querySelector('#code').innerHTML = xhr.response;
    }

    var modal = document.querySelector('#codeModal');
    var inModal = document.querySelector('#code');
    var trigger = document.querySelector('#codeTrigger');

    function toggleModal(ev) {
        ev.stopPropagation();
        modal.classList.toggle('hidden')
    }

    function preventBubble(ev) {
        ev.stopPropagation();
    }
    trigger.onclick = toggleModal;
    modal.onclick = toggleModal;
    inModal.onclick = preventBubble;
})()