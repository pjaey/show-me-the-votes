/* Private function to get a standard table to display links info */
function getTable(headers) {
    var table = document.createElement('table');
    table.setAttribute("border", "1");
    table.setAttribute("cellpadding", "3");
    table.setAttribute("style", "border-collapse:collapse");
    if (headers !== null && headers.length > 0) {
        var row = table.insertRow(0);
        for (var row_index = 0; row_index < headers.length; row_index++) {
            row.insertCell(row_index).innerHTML = '<div align="center"><b>' + 
            headers[row_index] + 
            '</b></div>';
        }
    }
    return table;
}

/* 
Gets an <a> element. Since we want to open a new tab everytime the link is
clicked, an event listener is attached to each of these tags.    
*/
function getATag(href, text) {
    var aTag = document.createElement('a');
    aTag.setAttribute('href', href);
    aTag.innerHTML = text;
    //open a new tab if clicked on aTag
    aTag.addEventListener('click', function () {
        var target = event.target || event.srcElement;
        chrome.tabs.create({url: this.href});
    });
    return aTag;
}

/* Update the relevant fields with the data */
function setStackOverflowInfo(json_list) {
    /* TODO: support multiple patterns and read them from a file */
    /*  
    TODO: replace pattern with 'http://([^.]*?)\.com/questions/([0-9]*?)/|
    http://([^.]*?).stackexchange\.com/questions/([0-9]*?)/' 
     */
    var content = document.getElementById('content-area'),
        header = document.createElement('h3');
    header.setAttribute("style", "text-align: center;");
    content.appendChild(header);
    if (json_list.length == 0) {
        header.textContent = 'No links found'
        return;
    }
    header.textContent = 'StackOverflow Links'
    var table = getTable(['Title', 'Score', 'Answers']);
    content.appendChild(table);
    for (var index = 0; index < json_list.length; index++) {
        var row = table.insertRow(index + 1);
        /* make the title clickable */
        row.insertCell(0).appendChild(getATag(json_list[index].link, 
            json_list[index].title));
        row.insertCell(1).innerHTML = json_list[index].score;
        row.insertCell(2).innerHTML = json_list[index].answer_count;
    }
}

window.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', query: 'json_list'},
            setStackOverflowInfo);
    });
});