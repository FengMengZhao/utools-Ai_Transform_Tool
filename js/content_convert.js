import {handleProcessButtonClick, addEnterKeyListener, showMessage, API_BASE_URL, API_CONTENT_CONVERT_ENDPOINT } from "./common.js";


var ruleInput = document.getElementById('transformationRule');
var textInput = document.getElementById('inputArea');
var processButton = document.getElementById('processButton');
var swapButton = document.getElementById('swapButton');
var outputArea = document.getElementById('outputArea');
var copyButton = document.getElementById('copyButton');
var clearButton = document.getElementById('clearButton');


// 调用公共函数
addEnterKeyListener(ruleInput, processButton);

// uTools API onPluginEnter(callback)
utools.onPluginEnter(({ code, type, payload }) => {
    console.log('用户进入插件应用', code, type, payload);
    if (textInput && payload && type==='over') {
        inputArea.value = payload;
        // 触发input事件，以便更新任何相关的UI状态
        inputArea.dispatchEvent(new Event('input'));
    }
});

if(ruleInput){
    ruleInput.addEventListener('input', function() {
        if (ruleInput.value.trim() !== '') {
            ruleInput.style.borderColor = ''; // 恢复默认边框颜色
        }
    });
}

if(textInput){
    textInput.addEventListener('input', function() {
        if (textInput.value.trim() !== '') {
            textInput.style.borderColor = ''; // 恢复默认边框颜色
        }
    });
}

if (swapButton) {
    swapButton.addEventListener('click', function() {
        const output = outputArea.value;
        if(output === ''){ 
            return;
        }
        document.getElementById('inputArea').value = output;
        document.getElementById('outputArea').value = '';
    });
}

if (copyButton) {
    copyButton.addEventListener('click', function() {
        outputArea.select();
        document.execCommand('copy');
        layui.use(['layer'], function(){
            var layer = layui.layer;
            layer.msg('已复制到剪贴板', {icon: 1, time: 2000, offset: 'rt'});
        });
    });
}

if (clearButton) {
    clearButton.addEventListener('click', function() {
        document.getElementById('inputArea').value = '';
        document.getElementById('inputArea').style.borderColor = ''; // 恢复默认边框颜色
    });
}


if (processButton) {
    processButton.addEventListener('click', function() { 
        handleProcessButtonClick({
            ruleInput: ruleInput,
            textInput: textInput,
            processButton: processButton,
            processFunction: processText,
            inputType: 'text'
        });
    });
}

async function processText(text, rule) {
    return fetch(`${API_BASE_URL}${API_CONTENT_CONVERT_ENDPOINT}`, {
        method: 'POST',
        body: JSON.stringify({ text, rule }),
        headers: { 
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        outputArea.value = data.data;
        ruleInput.value = '';
        showMessage(data.msg, data.success);
        return data;
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        showMessage(error.message, false);
        outputArea.value = '';
        throw error; // 重新抛出错误，以便调用者可以捕获
    });
}