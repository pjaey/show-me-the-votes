/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    /* First, validate the message's structure */
    if ((msg.from === 'popup') && (msg.subject === 'links')) {
        var hrefs = [], all_links = document.links;
        for (var i = 0; i < all_links.length; i++) {
            hrefs.push(all_links[i].href);
        }
        var domInfo = {
            links: hrefs
        };
        /* Directly respond to the sender (popup),
         * through the specified callback */
        response(domInfo);
    }
});  