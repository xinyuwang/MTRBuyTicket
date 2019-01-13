var g_ticketUrl = "https://www.ticketing.highspeed.mtr.com.hk/its/?lang=zh_HK";

//t could be others, fine with 1.
var g_captchaUrl = "https://www.ticketing.highspeed.mtr.com.hk/its/captcha.jpg?t=1";

//yunpian.com
var g_smsUrl = "https://sms.yunpian.com/v2/sms/single_send.json";
var g_smsKey = "837ebc2af3ab2db22cfd6b8c821c2d6f";


//Ruokuai account information
var g_codeUser = "wmw1989";
var g_codePsw = "testtest";
var g_apiUrl = "http://api.ruokuai.com/create.json";
var g_softKey = "918c2c4e4d494ee491d197150fcdd01c";
var g_softID = 22692;
var g_typeID = 3000;


let err = (msg) => {

    //throw new Error(msg);
    console.log(msg);

};

let sendsms = (msg, tel, callback) => {

    $.ajax({
        type: 'POST',
        accepts: 'application/json;charset=utf-8;',
        contentType: 'application/x-www-form-urlencoded;charset=utf-8;',
        url: g_smsUrl,
        data: {
            apikey: g_smsKey,
            text: `	【YYYHHJCH】您好，系统提醒您当前触发的事件为"车票刷新"，详情为"${msg}"，请您及时上线处理！`,
            mobile: tel
        },
        success: function (data) {
            callback(data);
        },

        error: function (data) {
            err('Post Ruokuai Error');
        }
    });

};

let captcha = (callback) => {

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            var fd = new FormData();
            fd.append('username', g_codeUser);
            fd.append('password', g_codePsw);
            fd.append('typeid', g_typeID);
            fd.append('softid', g_softID);
            fd.append('softkey', g_softKey);
            fd.append('image', this.response);

            $.ajax({
                type: 'POST',
                accepts: 'multipart/form-data',
                url: g_apiUrl,
                timeout: 600000,
                data: fd,
                processData: false,
                contentType: false,

                success: function (data) {
                    callback(data["Result"]);
                },

                error: function (data) {
                    err('Post Ruokuai Error');
                }
            });

        }
    };

    xhr.open('GET', g_captchaUrl);
    xhr.responseType = 'blob';
    xhr.send();

};

//click the browserAction to redirect the URL
chrome.browserAction.onClicked.addListener(function (tab) {

    chrome.tabs.update(null, { url: g_ticketUrl });

});


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    /* If the received message has the expected format... */
    if (msg['type'] === "captcha") {

        captcha(code => {

            if (typeof code === 'string' && code.length === 4) {

                sendResponse({
                    type: 'captcha',
                    data: { code }
                });

            }
            else {

                sendResponse({
                    type: 'error',
                    data: 'error code format or length'
                });

            }

        });

    } else if (msg['type'] === "sms") {

        //assert data = {msg, tel}
        sendsms(msg.data.msg, msg.data.tel, res => {

            if (res['code'] === 0) {
                //send success

                sendResponse({
                    type: 'sms',
                    data: { success: true }
                });

            }
            else {

                sendResponse({
                    type: 'error',
                    data: 'error send SMS'
                });

            }

        });

    }

    return true;

});



