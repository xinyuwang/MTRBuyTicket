//t could be others, fine with 1.
var g_captchaUrl = "https://www.ticketing.highspeed.mtr.com.hk/its/captcha.jpg?t=1";

//Ruokuai account information
var g_codeUser = "wmw1989";
var g_codePsw = "testtest";
var g_apiUrl = "http://api.ruokuai.com/create.json";
var g_softKey = "918c2c4e4d494ee491d197150fcdd01c";
var g_softID = 22692;
var g_typeID = 3000;

//submit form
var submit = new Promise((resolve, reject) => {

    let frm = $('#query_form');
    frm.submit((e) => {
        e.preventDefault();

        $.ajax({
            type: frm.attr('method'),
            url: frm.attr('action'),
            data: frm.serialize(),
            success: function (data) {
                resolve(data);
            },
            error: function (data) {
                reject(data);
            }
        });

    });

});

//handle captcha
var captcha = new Promise((resolve, reject) => {

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
                    resolve(data["Result"]);
                },

                error: function (data) {
                    reject(data);
                }
            });

        }
    };

    xhr.open('GET', g_captchaUrl);
    xhr.responseType = 'blob';
    xhr.send();

});

(() => {

    //Init UI
    let ui = $(`
        <div class="searchcontent_t">
            <div class="searchcontent1_t">
                <ul>
                    <li>
                        <span class="required-field">*</span>
                        轮询间隔<br>
                        <span style="white-space: nowrap">
                            <input id="intervalSecond" type="text" value="60" class="ui-autocomplete-input" autocomplete="off">
                        </span>
                    </li>

                    <li>
                        <span class="required-field">*</span>
                        电话号码<br>
                        <span style="white-space: nowrap">
                            <input id="telNum" type="text" value="" class="ui-autocomplete-input" autocomplete="off">
                        </span>
                    </li>

                </ul>
            </div>
        </div>

        <div class="searchbutton_t">
            <input type="button" class="searchbutton1" border="0" value="开始轮询" id="beginCheck">
        </div>

    `);

    $('.searchbg_t').append(ui);

    //Handle captcha
    captcha().then((data) => {
        alert(data);
    });


})();


//listen the event from background

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

    /* If the received message has the expected format... */
    if (msg.text && msg.text === "set") {
        
        sendResponse(msg.text);
    }
});
