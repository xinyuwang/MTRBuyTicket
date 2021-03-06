﻿
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
        if (res && res['type'] && res['type'] === "captcha" && res['data'] && res['data']['code']) {
            callback(res.data.code);
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

    return `${trainNum} Train found. ${arrMsg.join(" | ")};`;

};

//do send sms
let sendsms = (msg, tel, callback) => {

    chrome.runtime.sendMessage({
        type: "sms",
        data: { msg, tel }
    }, function (res) {
        if (res && res['type'] && res['type'] === "sms" && res['data'] && res['data']['success'] === true) {
            callback(res.data.success);
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
                        轮询间隔(分钟)<br>
                        <span style="white-space: nowrap">
                            <input id="intervalNum" type="text" value="5" class="ui-autocomplete-input" autocomplete="off">
                        </span>
                    </li>

                    <li>
                        <span class="required-field">*</span>
                        电话号码(中国内地)<br>
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

    //main interval function
    let interval_function = () => {

        let telNum = $('#telNum').val();

        //Handle captcha
        captcha(code => {
            $('#captcha').val(code);

            //submit
            submit(res => {
                console.log(res);

                if (res['success'] === true) {
                    //has tickets
                    console.log(makemsg(res.data));
                    sendsms(makemsg(res.data), telNum, (smsRes) => {

                        if (smsRes) {
                            console.log('Successful send message, close timer.');
                            clearInterval(interval_timer);
                            interval_timer = null;
                        }
                    });

                }

            });
        });

    };

    //setInterval

    let interval_timer = null;

    $('#startBtn').click(() => {

        let intervalNum = $('#intervalNum').val() - 0;
        if (intervalNum < 5) {
            alert('因成本问题，轮训时间在5分钟以上。');
            return;
        }

        let telNum = $('#telNum').val();
        if (/^1[34578]\d{9}$/.test(telNum) === false) {
            alert("手机号码有误，请重填");
            return;
        }

        if (!interval_timer) {
            interval_timer = setInterval(interval_function, intervalNum * 1000 * 60);
            
            $('#intervalNum').prop('readonly', false);
            $('#telNum').prop('readonly', false);
            $('#startBtn').prop('disabled', true);
            $('#stopBtn').prop('disabled', false);

            alert('监控已开始');
        }

    });

    $('#stopBtn').click(() => {

        if (interval_timer) {
            clearInterval(interval_timer);
            interval_timer = null;

            $('#intervalNum').prop('readonly', true);
            $('#telNum').prop('readonly', true);
            $('#startBtn').prop('disabled', false);
            $('#stopBtn').prop('disabled', true);

            alert('监控已停止');
        }

    });

    //default lock stop button
    $('#stopBtn').prop('disabled', true);

})();

