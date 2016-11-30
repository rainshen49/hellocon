(function schedule() {
    var main = document.querySelector('main')
    Papa.parse("data/schedule.csv", {
        download: true,
        complete: handleResults,
        error: function(err, file, inputElem, reason) {
            console.error(err, file, inputElem, reason)
        }
    })

    function handleResults(result) {
        // {data:[row1,row2,row3],errors,meta}
        // row0=[day,time,topic,content,,day,time,topic,content]
        // row =[   ,time,topic,content,,   ,time,topic,content]
        var data = result.data;
        var schedule = [
            [],
            []
        ];
        data.forEach(function(row, i) {
            if (i > 0) {
                if (row[1])
                    schedule[0].push({ time: row[1], topic: row[2], content: row[3] });
                if (row[6])
                    schedule[1].push({ time: row[6], topic: row[7], content: row[8] });
            }
        })
        generateCalendar(schedule)
            // console.log(schedule)
    }

    function generateCalendar(schedule) {
        var day = [document.querySelector('#one'), document.querySelector('#two')]
        var HTMLTmp = ""
        for (var i = 0; i < 2; i++) {
            schedule[i].forEach(function(event) {
                HTMLTmp += '<div class="event" onclick="toggleFlip(event)"><h3 class="topic">' + event.topic + '</h3>' + '<p class="time">' + event.time + '</p>' +
                    '<p class="content hidden">' + event.content + '</p>' + '</div>'
            })
            day[i].innerHTML = HTMLTmp;
            HTMLTmp = ''
        }
    }
})()

function toggleFlip(event) {
    var clip = event.target
    if (clip.className.slice(0, 5) != "event") {
        clip = clip.parentNode
    }
    clip.classList.toggle('show');
    clip.children[0].classList.toggle('hidden');
    clip.children[1].classList.toggle('hidden');
    clip.children[2].classList.toggle('hidden');
}