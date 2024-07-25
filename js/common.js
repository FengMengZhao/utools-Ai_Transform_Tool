export const API_BASE_URL = 'https://www.ai-reading.me';
export const API_CONTENT_CONVERT_ENDPOINT = '/api/txt_transform/content_convert';


function formatFileSize(size) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let fileSize = size;

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
        fileSize /= 1024;
        unitIndex++;
    }

    return fileSize.toFixed(2) + ' ' + units[unitIndex];
}

function handleProcessButtonClick({
    ruleInput,
    textInput,
    fileInput,
    processButton,
    processFunction,
    inputType, // 'text' 或 'file'
    allowEmptyRule = false
}) {
    var ruleValue = ruleInput.value.trim();
    var inputText = textInput ? textInput.value.trim() : null;
    var files = fileInput ? fileInput.files : null;

    // 是否违背规则校验
    var ifRule = false;
    // 是否违背输入校验
    var ifInput = false;

    // 重置错误消息
    var ruleErrorTextContent = '';
    ruleInput.style.borderColor = ''; // 重置边框颜色

    // 校验规则输入框
    if (!allowEmptyRule && ruleValue === '') {
        ruleErrorTextContent = '规则不能为空';
        ifRule = true;
    } else if (ruleValue.length > 50) {
        ruleErrorTextContent = '规则不能超过50个字';
        ifRule = true;
    }

    // 根据输入类型进行校验
    if (inputType === 'text') {
        if (inputText === '') {
            if (ruleErrorTextContent.trim() !== '') {
                ruleErrorTextContent += ', ';
            }
            ruleErrorTextContent += '输入不能为空';
            ifInput = true;
        }
    } else if (inputType === 'file') {
        if (!files || files.length === 0) {
            if (ruleErrorTextContent.trim() !== '') {
                ruleErrorTextContent += ', ';
            }
            ruleErrorTextContent += '请至少选择一个文件';
            ifInput = true;
        }
    }

    if (ruleErrorTextContent) {
        layui.use(['layer'], function(){
            var layer = layui.layer;
            layer.msg(ruleErrorTextContent, {icon: 2, time: 2000, offset: 'rt'});
        });

        // 边框颜色变红
        if (ifRule) {
            ruleInput.style.borderColor = 'red';
        }
        if (ifInput) {
            if (inputType === 'text') {
                textInput.style.borderColor = 'red';
            } else if (inputType === 'file') {
                fileInput.parentElement.style.borderColor = 'red';
            }
        }

        return; // 阻止继续执行
    }

    // 校验通过，禁用输入框和按钮
    ruleInput.disabled = true;
    if (textInput) {
        textInput.disabled = true;
        textInput.style.borderColor = '';
    }
    if (fileInput) {
        fileInput.disabled = true;
        fileInput.parentElement.style.borderColor = '';
    } 
    processButton.disabled = true;

    const outputArea = document.getElementById('outputArea');
    if(outputArea) outputArea.value = 'Processing, please wait...';

    // 保存原始图标
    const originalIcon = processButton.innerHTML;

    // 插入动态转动图标
    processButton.innerHTML = '<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>';
    processButton.classList.add('button-disabled');
    processButton.classList.remove('layui-icon-transfer');

    // 发起请求
    let processPromise;
    if (inputType === 'text') {
        processPromise = processFunction(inputText, ruleValue);
    } else if (inputType === 'file') {
        const fileAttributes = Array.from(files).map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModifyTime: new Date(file.lastModified).toLocaleString()
        }));
        processPromise = processFunction(fileAttributes, ruleValue);
    }

    processPromise
        .finally(() => {
            // 恢复原始图标和按钮状态
            processButton.innerHTML = originalIcon;
            processButton.classList.remove('button-disabled');
            processButton.classList.add('layui-icon-transfer');

            // 重新启用输入框和按钮
            ruleInput.disabled = false;
            if (textInput) textInput.disabled = false;
            if (fileInput) fileInput.disabled = false;
            processButton.disabled = false;
        });
}

// 公共函数：为元素添加Enter键监听器
function addEnterKeyListener(inputElement, buttonElement) {
    if (inputElement) {
        inputElement.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // 防止默认的Enter键行为
                if (!buttonElement.disabled) {
                    buttonElement.click();
                }
            }
        });
    }
}

// 公共函数：为元素添加点击监听器
function addClickListener(clickElement, buttonElement) {
    if (clickElement) {
        clickElement.addEventListener('click', function() {
            buttonElement.click();
        });
    }
}

function showMessage(msg, isSuccess) {
    layui.use(['layer'], function(){
        var layer = layui.layer;
        layer.msg(msg, {icon: isSuccess ? 1 : 2, offset: 'rt'});
    });
}

export { formatFileSize, handleProcessButtonClick, addEnterKeyListener, addClickListener, showMessage };