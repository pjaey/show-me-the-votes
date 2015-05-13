 /* let the page load completely */
setTimeout(execute, 1000);

function execute() {
    /* Get all links */
    var hrefs = [], all_links = document.links;
    for (var i = 0; i < all_links.length; i++) {
        hrefs.push(all_links[i].href);
    }
    /* extract pattern from the links */
    var pattern = ('^https{0,1}://stackoverflow\.com/questions/([0-9]*?)/'),
        patterns = [],
        found = false;
    for (var i = 0; i < hrefs.length; i++) {
        var match = hrefs[i].match(pattern);
        if (match !== null && match.length >= 2) {
            patterns.push(match[1]);
        }
    }
    /* retain only unique entries */
    var seen = {},
        unique_patterns = patterns.filter(function (item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });

    /* make an api call */
    if (unique_patterns.length >= 1) {
        var query_param, chunk = 100;
        for (var i = 0, j = unique_patterns.length; i < j; i += chunk) {
            query_param = unique_patterns.slice(i, i + chunk).join(';');
            jQuery.getJSON('https://api.stackexchange.com/2.2/questions/' + 
                query_param +
                '?order=desc&sort=votes&site=stackoverflow',
                function (json) {
                    if (json.hasOwnProperty('items')) {
                        process_results(json['items']);
                    } else {
                        process_results([]);
                    }
                }
            );
        }  
    } else {
        process_results([]);
    }
}

/* talk with background and popup */
function process_results(json_list) {
    /* render number of links on the batch/icon */
    chrome.runtime.sendMessage({        
        from: 'content',       
        value: json_list.length      
    });

    /* Listen for message from the popup */
    chrome.runtime.onMessage.addListener(function (msg, sender, response) {
        if ((msg.from === 'popup') && (msg.query === 'json_list')) {
            response(json_list);
        }
    });
} 
