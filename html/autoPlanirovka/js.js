document.getElementById("go").addEventListener("click", main);

$('h2.key').click(function() {alert('fda')})

//$('h2.key').click(function() {
//    console.log(this);
////    $('div.snippetsBlock[number="' this.a '"]')
//})

function main(mouseEvent) {
    //делаем массив с ключами
    var keys = document.getElementById('keys').value.split('\n');

    //фильтруем его от пустых строк и пробелов
    for (var i = 0; i < keys.length; i++) {
        keys[i] = trim(keys[i]);
        if (keys[i] === "") {
            keys.splice(i, 1);
            i--;
        }
    };

    //создаем новую вкладку с поиском с первым запросом
    var searchTabId = -1;
    chrome.tabs.create({
        url: 'https://yandex.ru/search/?lr=39&text=' + keys[0],
        active: false
    }, function (tab) {
        searchTabId = tab.id;
    });

    //слушаем runtime.onMessage, когда приходит связка (фраза + жирные слова) -
    //добавляем её в keysAndBoldWords и обновляем странцу с поиском на следующий запрос,
    //когда запросы заканчиваются, распечатываем результат
    var keysAndBoldWords = {};
    var keysCounter = 0;
    var resultTable = '';
    var issues = '';
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
//            console.log("Получили:")
            console.log(request);
            /*console.log(sender);*/

            resultTable += '<section>';

            resultTable += '<div class="number">' + keysCounter + '</div>';
            resultTable += '<div class="phrase">' + request.query + '</div>';
            resultTable += '<div class="addWords">' + request.data.boldWords + '</div>';
            resultTable += '<div class="commerce">' +  '</div>';
            resultTable += '<div class="internal">' +  '</div>';
            resultTable += '<div number="' + keysCounter + '" class="issue">Нажми</div>';

            resultTable += '</section>';

            issues += generateSnippetsBlock(request.data.snippets,keysCounter);


            //keysAndBoldWords[request.query] = request.boldWords.join(', ');
            keysCounter++;

            if (keysCounter >= keys.length) {

                resultTable += '</div>';
                $('div.planTable').append(resultTable);
                $('div.issueView').append(issues);

                $('div.issue').click(function() {
                    $('div.snippetsBlock').hide();
                    $('div.snippetsBlock[number="' + $(this).attr("number") + '"]').toggle("slow");
                })
                return;
            }


            chrome.tabs.update(searchTabId, {
                url: 'https://yandex.ru/search/?lr=39&text=' + keys[keysCounter]
            });
//            sendResponse("bar");
        }
    );
}

function generateResultTable(data) {
    $result = $('#resultTable')
    $result.show();
    $result= $('#resultTable').find('tbody');

    for (var query in data) {
        $result.append('<tr><td>' + query + '</td>\
            <td>' + data[query] + '</td></tr>');
     }
}

function generateSnippetsBlock(snips,id) {
    var result = '<div number="' + id + '" class="snippetsBlock">';
    snips.forEach(function (obj, i) {
        result += generateSnippet(obj, i);
    })
    result += '</div>';
    return result;

}

function generateSnippet(snip, i) {
    return '<div class="snippet">' +
        '<h3>' + (i+1) + '.  <a target="_blank" href="' + snip.url + '">' + snip.title + '</a></h3>'
        + '<p class="url">' + snip.url + '</p>'
        + '<p class="text">' + snip.text + '</p>'
        + '</div>';
}

