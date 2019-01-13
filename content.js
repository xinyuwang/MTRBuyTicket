
let err = (msg) => {

    //throw new Error(msg);
    console.log(msg);

};

//submit form
let submit = (callback) => {

    let frm = $('#query_form');

    $.ajax({
        type: frm.attr('method'),
        url: frm.attr('action'),
        data: frm.serialize(),

        success: function (data) {
            callback(data);
        },

        error: function (data) {
            err('Submit MTR form error');
        }
    });

};

//handle captcha
let captcha = (callback) => {

    chrome.runtime.sendMessage({
        type: "captcha"
    }, function (res) {
        if (res && res['type'] && res['type'] === "captcha" && res['data']) {
            callback(res.data);
        }
        else {
            err('Received error code from background.js');
        }
    });

};

//make message
let makemsg = (data) => {

    let trainNum = data.length;

    let arrMsg = [];

    data.forEach((val, idx, arr) => {
        let arrPrice = [];
        val.seatTypes.forEach(v => {
            if (v.availFlag === true) {
                arrPrice.push(v.price);
            }
        });

        let msg = `No. ${idx}, ${val.stationTrainCode}(${val.arriveTime}-${val.departTime}), Price. (${arrPrice.join('/')})`;
        arrMsg.push(msg);

    });

    return `${trainNum} Train found. ${arrMsg.join(" | ")};`

}

let sendsms = (msg, callback) => {

    chrome.runtime.sendMessage({
        type: "sms",
        data: msg
    }, function (res) {
        if (res && res['type'] && res['type'] === "sms") {
            callback(res.data);
        }
        else {
            err('sms send error from background.js');
        }
    });

}

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
                            <input id="intervalNum" type="text" value="60" class="ui-autocomplete-input" autocomplete="off">
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
            <input type="button" class="searchbutton5" border="0" value="开始轮询" id="startBtn">
            <input type="button" class="searchbutton5" border="0" value="停止监控" id="stopBtn">
        </div>

    `);

    $('.searchbg_t').append(ui);


    //main

    let intervalNum = $('#intervalNum').val() - 0;
    let telNum = $('#telNum').val();

    let interval_function = () => {

        //Handle captcha
        captcha(data => {
            $('#captcha').val(data);

            //submit
            submit(res => {
                console.log(res);

                if (res['success'] === true) {
                    //has tickets
                    console.log(makemsg(res.data));

                }

            });
        });

    };

    //setInterval


    $('#startBtn').click(() => {
        interval_function();
    });


})();

