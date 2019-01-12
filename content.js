
//Init UI
(() => {



})();





//listen the event from background

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

    /* If the received message has the expected format... */
    if (msg.text && msg.text == "set")) {

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
