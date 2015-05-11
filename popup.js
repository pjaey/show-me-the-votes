/* Update the relevant fields with the new data */
function setStackExchangeInfo(info) {
    //TODO: support multiple patterns and read them from a file
    var pattern = '/questions/([0-9]*?)/';
    var matches = [];
    for(var i=0; i<info.links.length; i++) {
      var match = info.links[i].match(pattern);
      if (match !== null && match.length >= 2) {
        matches.push(match[1]);
      }
    }
    var seen = {};
    unique_matches = matches.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
    var content = document.getElementById('content-area'),
        header = document.createElement('h3');
    content.appendChild(header);
    if (unique_matches < 1) {
        header.textContent = 'No links available';
        return;
    } 
    header.textContent = 'StackExchange Links'
    var table = document.createElement('table');
    table.setAttribute("border", "1");
    table.setAttribute("cellpadding", "3");
    table.setAttribute("style", "border-collapse:collapse");
    content.appendChild(table);
    for (var i=0; i< unique_matches.length; i++) {
        var row = table.insertRow(i);
        row.insertCell(0).innerHTML = unique_matches[i];
    }
}

/* Once the DOM is ready... */
window.addEventListener('DOMContentLoaded', function() {
    /* ...query for the active tab... */
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        /* ...and send a request to get all the links... */
        chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'links'},
                setStackExchangeInfo);
    });
});