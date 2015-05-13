function isInt(value) {
  return !isNaN(value) && 
  parseInt(Number(value)) == value && 
  !isNaN(parseInt(value, 10));
}

chrome.runtime.onMessage.addListener(function (msg, sender) {
    if ((msg.from === 'content') && isInt(msg.value)) {
        /* Enable the page-action for the requesting tab */
        chrome.browserAction.setBadgeText({
          text: msg.value.toString(), 
          tabId: sender.tab.id
        });
    }
});