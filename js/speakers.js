(function speaker() {
    var main = document.querySelector('main')
    Papa.parse("data.csv", {
        download: true,
        complete: handleResults,
        error: function(err, file, inputElem, reason) {
            console.error(err, file, inputElem, reason)
        }
    })

    function handleResults(result) {
        // {data:[title,item1,item2...],errors,meta}
        var title = result.data[0]
            // console.log(title)
        result.data.forEach(function(data, i) {
            if (i > 0) {
                // console.log(data)
                var addHTML = "<div class='aSpeaker'><h2>" + data[1] + "</h2>" + "<h3>Topic: " + data[5] + "</h3>" + "<p>" + data[6] + "</p></div>";
                main.innerHTML += addHTML
            }
        })
    }
})()