//t could be others, fine with 1.
var g_captcha_url = "https://www.ticketing.highspeed.mtr.com.hk/its/captcha.jpg?t=1";

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


})();



let submit = new Promise((resolve, reject) => {

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
            },
        });

    });

});



//listen the event from background

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

    /* If the received message has the expected format... */
    if (msg.text && msg.text == "set") {

        _store = msg.store;

        InitConfig(msg.store);

        if (msg.text == "login") {


            //if need auto code
            var bAutoCode = msg.bAutoCode;
            var bLocalCode = msg.bLocalCode;
            var sLocalCodeServer = msg.localCodeURL;
            var sLocalCoder = msg.localCoder;

            if (bAutoCode == 'Auto' || bLocalCode == 'Auto') {
                //For write the code
                intervalID = setInterval(function () {

                    var codeDiv = document.getElementById('captcha');
                    if (codeDiv) {
                        var code_src = codeDiv["src"];
                        if (code_src.length > 10) {

                            clearInterval(intervalID);

                            var xhr = new XMLHttpRequest();
                            xhr.onreadystatechange = function () {
                                if (this.readyState == 4 && this.status == 200) {

                                    var bSubmit = true;

                                    //Use remote code
                                    if (bAutoCode == 'Auto') {
                                        var fd = new FormData();
                                        fd.append('username', autoCodeUser);
                                        fd.append('password', autoCodePsw);
                                        fd.append('typeid', autoTypeID);
                                        fd.append('softid', autoSoftID);
                                        fd.append('softkey', autoCodeKey);
                                        fd.append('image', this.response);


                                        $.ajax({
                                            type: 'POST',
                                            accepts: 'multipart/form-data',
                                            url: autoCodeUrl,
                                            timeout: 600000,
                                            data: fd,
                                            processData: false,
                                            contentType: false
                                        }).done(function (data) {

                                            DoLog("Get the AutoCode = " + data["Result"]);

                                            $('#captchaInput').val(data["Result"]);

                                        });
                                    }


                                }
                            }
                            xhr.open('GET', code_src);
                            xhr.responseType = 'blob';
                            xhr.send();

                        }

                    }

                }, 100);

            }

        }

        sendResponse(msg.text);
    }
});
