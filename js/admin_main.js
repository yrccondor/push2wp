let shellVersion = "0.1.0";
let commandList = ["create", "list", "clear", "help", "remove", "pause"];
let createArgList = ["github", "gitlab", "coding"];
let mode = "normal";
let guessedCommand = "";
let guessedCommandFollow = "";
let commandQueue = [];
let history = [];
let filteredHistory = [];
let historyCursor = -1;
let nowInput = null;
let historyMode = false;
if(sessionStorage.getItem("ptw_history")){
    history = JSON.parse(sessionStorage.getItem("ptw_history"));
}

jQuery(function(){
    jQuery(".input-text").focus();
    filterHistory("");
})

jQuery("#input").click(function(){
    jQuery(".input-text").focus();
})

jQuery(".input-text").on("input", function(){
    filterHistory(jQuery(".input-text").text());
})

function filterHistory(input){
    historyCursor = -1;
    if(nowInput === null){
        filteredHistory = [];
        for(item of history){
            if(item.indexOf(input) === 0){
                filteredHistory.push(item);
            }
        }
        console.log(filteredHistory);
    }
}

function addHistory(item){
    if(history.length >= 500){
        history.pop();
    }
    history.unshift(item);
    sessionStorage.setItem("ptw_history", JSON.stringify(history));
}

document.addEventListener("keydown", prsKey, false);
function prsKey(event) {
    jQuery('.input-text').focus();
    if(event.keyCode === 13){
        event.preventDefault();
        nowInput = null;
        historyMode = false;
        if(mode === "guess"){
            doCommand(jQuery(".input-choise").text());
        }else{
            let rawCommand = jQuery(".input-text").text();
            outputHead(rawCommand);
            if(rawCommand !== ""){
                addHistory(rawCommand);
            }
            commandQueue = [];
            rawCommand = rawCommand.split(";");
            for(command of rawCommand){
                command = command.split("&&");
                for(subCommand of command){
                    subCommand = subCommand.split("||");
                    for(singleCommand of subCommand){
                        commandQueue.push(singleCommand, 2);
                    }
                    commandQueue.pop();
                    commandQueue.push(1);
                }
                commandQueue.pop();
                commandQueue.push(0);
            }
            commandQueue.pop();
            console.log(commandQueue);
            doCommand(commandQueue.shift());
        }
        jQuery('.input-text').html('');
        filterHistory(jQuery(".input-text").text());
        jQuery('body,html').animate({
            scrollTop: jQuery(document).height()
        }, 0);
    }else if(event.keyCode === 38){
        event.preventDefault();
        if(!historyMode){
            nowInput = jQuery('.input-text').text();
            historyMode = true;
        }
        if(mode === "normal"){
            hisComm('up');
        }else{
            $('.input-choise').text($('.input-choise').text() + "^[[A");
        }
    }else if(event.keyCode === 40){
        event.preventDefault();
        if(!historyMode){
            nowInput = jQuery('.input-text').text();
            historyMode = true;
        }
        if(mode === "normal"){
            hisComm('down');
        }else{
            $('.input-choise').text($('.input-choise').text() + "^[[B");
        }
    }else{
        nowInput = null;
        historyMode = false;
        filterHistory(jQuery(".input-text").text());
    }
}

function hisComm(direction){
    if(direction === "up"){
        if(historyCursor < filteredHistory.length - 1){
            historyCursor++;
        }
    }else{
        if(historyCursor > -1){
            historyCursor--;
        }
        if(historyCursor === -1){
            jQuery(".input-text").text(nowInput);
            keepLastIndex(document.getElementsByClassName("input-text")[0]);
            return;
        }
    }
    jQuery(".input-text").text(filteredHistory[historyCursor]);
    keepLastIndex(document.getElementsByClassName("input-text")[0]);
}

function doNextCommand(status){
    if(commandQueue.length === 0){
        return;
    }
    let nextLogic = commandQueue.shift();
    if(typeof nextLogic !== "number"){
        output('<span class="color-err">'+phpContent["error"]+':</span> '+phpContent["command_error"]);
        let index = 0;
        let queueLength = commandQueue.length;
        for(command of commandQueue){
            if(command === 0){
                commandQueue = commandQueue.slice(index);
                break;
            }
            index++;
        }
        if(index === queueLength){
            commandQueue = [];
        }else{
            nextLogic = commandQueue.shift();
        }
    }
    if(nextLogic === 0){
        doCommand(commandQueue.shift());
    }else if(nextLogic === -1){
        doCommand(commandQueue.shift());
    }else if(nextLogic === 1 && status){
        doCommand(commandQueue.shift());
    }else if(nextLogic === 2 && !status){
        doCommand(commandQueue.shift());
    }else{
        let index = 0;
        let queueLength = commandQueue.length;
        for(command of commandQueue){
            if(command === 0){
                commandQueue = commandQueue.slice(index);
                break;
            }
            index++;
        }
        if(index === queueLength){
            commandQueue = [];
        }
    }
}

function doCommand(command){
    let status = true;
    if(typeof command !== "string"){
        status = false;
        doNextCommand(status);
        return;
    }
    command = command.trim();
    if(mode === "guess"){
        choise = command.toLowerCase();
        if(choise === ""){
            choise = "n";
        }
        hideChoise();
        jQuery(".input-choise").html("")
        showInput();
        mode = "normal";
        output(phpContent["do_you_mean"][0]+' \'<strong><span class="color-info">'+guessedCommand+'</span>'+guessedCommandFollow+'</strong>\''+phpContent["do_you_mean"][1]+' (y/N)<span class="printed-command">'+command+'</span>');
        if(choise === "y"){
            doCommand(guessedCommand + guessedCommandFollow);
            status = true;
        }else{
            status = false;
        }
        doNextCommand(status);
        return;
    }
    if(command !== ""){
        if(command === "rm -rf /" || command === "rm -rf /*"){
            jQuery("#wpcontent").addClass("ptw-rm");
            setTimeout(()=>{
                jQuery("#wpcontent").removeClass("ptw-rm");
            }, 1000);
            output("BOOM!");
            doNextCommand(true);
            return;
        }
        let commmandSequence = command.split(" ");
        let outputArg = ["", ""];
        if(commmandSequence[0] === "help"){
            if(commmandSequence.length > 1){
                output('<span class="color-warn">'+phpContent["warning"]+':</span> '+phpContent["ignored"]);
            }
            outputArg = ["Push2WP Verion "+phpContent["version"]+"<br>PTW Shell Verion "+shellVersion+"<br><br>&nbsp;&nbsp;<strong>create &lt;github/gitlab/coding&gt;</strong>: "+phpContent["help"]["create"]+"<br>&nbsp;&nbsp;<strong>list</strong>: "+phpContent["help"]["list"]+"<br>&nbsp;&nbsp;<strong>remove &lt;id&gt;</strong>: "+phpContent["help"]["remove"]+"<br>&nbsp;&nbsp;<strong>pause</strong>: "+phpContent["help"]["pause"]+"<br>&nbsp;&nbsp;<strong>clear</strong>: "+phpContent["help"]["clear"]+"<br>&nbsp;&nbsp;<strong>help</strong>: "+phpContent["help"]["help"]+"<br>"];
            status = true;
        }else if(commmandSequence[0] === "clear"){
            jQuery("#output").html("");
            outputArg = [""];
            status = true;
        }else if(commmandSequence[0] === "create"){
            if(commmandSequence.length > 2){
                output('<span class="color-warn">'+phpContent["warning"]+':</span> '+phpContent["ignored"]);
            }
            if(commmandSequence[1] === "github" || commmandSequence[1] === "gitlab" || commmandSequence[1] === "coding"){
                let source = "";
                if(commmandSequence[1] === "github"){
                    source = "GitHub";
                }else if(commmandSequence[1] === "gitlab"){
                    source = "GitLab";
                }else if(commmandSequence[1] === "coding"){
                    source = "Coding";
                }
                hideInput();
                createHook(commmandSequence[1]);
                outputArg = ['<span class="color-info">Target: '+source+'</span><br>Hold on a second...'];
                status = true;
            }else{
                outputArg = ['<span class="color-err">'+phpContent["error"]+':</span> '+phpContent["unknow_create"]];
                status = false;
            }
        }else{
            outputArg = ['<span class="color-err">'+phpContent["error"]+':</span> '+phpContent["unknow_command"][0]+commmandSequence[0]+phpContent["unknow_command"][1]];
            guessCommand = "";
            minDistance = Infinity;
            for(command of commandList){
                let editDist = editDistance(commmandSequence[0], command);
                if(editDist < minDistance && editDist <=2){
                    guessCommand = command;
                    minDistance = editDist;
                    if(editDist <= 1){
                        break;
                    }
                }
            }
            if(guessCommand !== ""){
                hideInput();
                showChoise();
                guessCommandFollow = "";
                if(commmandSequence.length >= 2){
                    commmandSequence.shift();
                    guessCommandFollow = " "+commmandSequence.join(" ");
                }
                outputChoise(phpContent["do_you_mean"][0]+' \'<strong><span class="color-info">'+guessCommand+'</span>'+guessCommandFollow+'</strong>\''+phpContent["do_you_mean"][1]+' (y/N)');
                mode = "guess";
                guessedCommand = guessCommand;
                guessedCommandFollow = guessCommandFollow;
            }else{
                status = false;
            }
        }
        output(...outputArg);
    }
    if(mode === "normal"){
        doNextCommand(status);
    }
    return status;
}

function hideInput(){
    jQuery("#input").hide();
}
function showInput(){
    jQuery("#input").show();
    jQuery(".input-text").focus();
}

function hideChoise(){
    jQuery(".input-choise, #output-choise").css("display", "none");
}
function showChoise(){
    jQuery("#output-choise").css("display", "inline");
    jQuery(".input-choise").css("display", "inline").focus();
}

function outputHead(command){
    output('><span class="printed-command">'+command+'</span>');
}

function output(text, ending="<br>"){
    jQuery("#output").html(jQuery("#output").html()+text+ending);
}
function outputChoise(text){
    jQuery("#output-choise").html(text);
}

function editDistance(s1, s2) {
    const len1 = s1.length;
    const len2 = s2.length;
    let matrix = [];
    for(let i = 0; i <= len1; i++){
        matrix[i] = new Array();
        for(let j = 0; j <= len2; j++){
            if(i == 0){
                matrix[i][j] = j;
            }else if(j == 0) {
                matrix[i][j] = i;
            }else{
                let cost = 0;
                if (s1[i - 1] != s2[j - 1]) {
                    cost = 1;
                }
                const temp = matrix[i - 1][j - 1] + cost;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, temp);
            }
        }
    }
    return matrix[len1][len2];
}

function keepLastIndex(obj) {
    if (window.getSelection) {
        obj.focus();
        let range = window.getSelection();
        range.selectAllChildren(obj);
        range.collapseToEnd()
    } else if (document.selection) {
        let range = document.selection.createRange();
        range.moveToElementText(obj);
        range.collapse(false);
        range.select()
    }
}

function createHook(source){
    showInput();
    return [source];
}