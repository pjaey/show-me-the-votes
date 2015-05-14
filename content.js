/* 
content.js: contains the functions that must be executed everytime a page is loaded. 
*/

/* let the page load completely and then run execute() */
setTimeout(execute, 1000);

/* 
First gets all the links available on the page and then applies regex to all the links.
Then make an api call to get back the data which is used by popup.   
*/
function execute() {
    if (!api_info || !api_info.pattern || !api_info.matching_index || !api_info.api_link) {
        process_results([]);
        return;
    }
    /* Get all links */
    var hrefs = [], all_links = document.links;
    for (var i = 0; i < all_links.length; i++) {
        hrefs.push(all_links[i].href);
    }
    /* extract pattern from the links */
    var pattern = (api_info.pattern),
        patterns = [],
        found = false;
    for (var i = 0; i < hrefs.length; i++) {
        var match = hrefs[i].match(pattern);
        if (match !== null && match.length >= 2) {
            patterns.push(match[api_info.matching_index]);
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
            jQuery.getJSON(String.format(api_info.api_link, query_param),
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
    /* render number of links on the batch/icon by sending a message to background */
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

/* String format function found at http://stackoverflow.com/questions/610406/ */
if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
        });
    };
}