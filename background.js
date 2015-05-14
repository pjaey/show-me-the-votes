/* 
background.js: contains a listener which updates badge text to contain number of links 
*/

function isInt(value) {
  return !isNaN(value) && 
  parseInt(Number(value)) == value && 
  !isNaN(parseInt(value, 10));
}

chrome.runtime.onMessage.addListener(function (msg, sender) {
    var tabId = sender.tab.id,
        total_links = msg.total_links;
    if ((msg.from === 'content') && isInt(total_links)) {
        /* Enable the page-action for the requesting tab */
        chrome.browserAction.setBadgeText({
          text: total_links.toString(), 
          tabId: tabId
        });
        if (parseInt(msg.total_links, 10) > 0) {
            var opt = {
                iconUrl: "icon.png",
                type: 'basic',
                title: 'StackOverflow links found',
                message: total_links + ' links found',
            };
            chrome.notifications.create('votes_' + tabId, opt, function() {
                setTimeout(function() {
                    chrome.notifications.clear('votes_' + tabId);
                }, 1500);
            });
        }
    }
});