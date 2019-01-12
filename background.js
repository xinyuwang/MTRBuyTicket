var g_running = false;
var g_URL = "https://www.ticketing.highspeed.mtr.com.hk/its/?lang=zh_HK";


//click the browserAction to redirect the URL
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.update(null, { url: g_URL });
});


