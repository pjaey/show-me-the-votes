/* Private function to get a standard table to display links info */
function getTable(headers) {
    var table = document.createElement('table');
    table.setAttribute("border", "1");
    table.setAttribute("cellpadding", "3");
    table.setAttribute("style", "border-collapse:collapse");
    if (headers !== null && headers.length > 0) {
        var row = table.insertRow(0);
        for (var row_index = 0; row_index < headers.length; row_index++) {
            row.insertCell(row_index).innerHTML = headers[row_index];
        }
    }
    return table;
}

/* Update the relevant fields with the new data */
function setStackExchangeInfo(dom) {
    /* TODO: support multiple patterns and read them from a file */
    /* TODO: replace pattern with 'http://([^.]*?)\.com/questions/([0-9]*?)/|
     http://([^.]*?).stackexchange\.com/questions/([0-9]*?)/' */
    var pattern = ('^https{0,1}://stackoverflow\.com/questions/([0-9]*?)/'),
        hashes = [],
        found = false;
    for (var i = 0; i < dom.links.length; i++) {
        var match = dom.links[i].match(pattern);
        if (match !== null && match.length >= 2) {
            hashes.push(match[1]);
        }
    }

    var seen = {},
        unique_hashes = hashes.filter(function (item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        }),
        content = document.getElementById('content-area'),
        header = document.createElement('h3');
    header.setAttribute("style", "text-align: center;");
    content.appendChild(header);
    if (unique_hashes < 1) {
        header.textContent = 'No stackoverflow links were found on this page';
        return;
    }
    header.textContent = 'StackOverflow Links'
    var table = getTable(['Title', 'Score', 'Answers']);
    content.appendChild(table);
    var query_param, chunk = 100;
    for (var i = 0, j = unique_hashes.length; i < j; i += chunk) {
        query_param = unique_hashes.slice(i, i + chunk).join(';');
        jQuery.getJSON('https://api.stackexchange.com/2.2/questions/' +
                query_param +
                '?order=desc&sort=votes&site=stackoverflow',
                function (response) {
                    if (response.hasOwnProperty("items")) {
                        var items = response['items'];
                        for (var index = 0; index < items.length; index++) {
                            var row = table.insertRow(index + 1);
                            /* make the title clickable */
                            var cell0 = row.insertCell(0);
                            var aTag = document.createElement('a');
                            aTag.setAttribute('href', items[index].link);
                            aTag.setAttribute('id', 'atag' + index);
                            aTag.innerHTML = items[index].title;
                            cell0.appendChild(aTag);
                            //open a new tab if clicked on aTag
                            aTag.addEventListener('click', function () {
                                var target = event.target || event.srcElement;
                                chrome.tabs.create({url: this.href});
                            });
                            row.insertCell(1).innerHTML = items[index].score;
                            row.insertCell(2).innerHTML = items[index].answer_count;
                        }
                        
                    }
                });
    }
}

/* Once the DOM is ready... */
window.addEventListener('DOMContentLoaded', function () {
    /* ...query for the active tab... */
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        /* ...and send a request to get all the links... */
        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'links'},
            setStackExchangeInfo);
    });
});