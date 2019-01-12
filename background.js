var g_running = false;


//Begin click the browserAction
chrome.browserAction.onClicked.addListener(function (tab) {
    if (!g_running) {
        start();
        g_running = true;
    } else {
        stop(tab);
    }
});

function start() {

}

function stop() {

}




