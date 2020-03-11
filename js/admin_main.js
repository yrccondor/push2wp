/**
 * Main script for PTW Shell
 * @author Axton
 */

// Global variables
let shellVersion = "0.1.0";
let commandList = ["create", "list", "clear", "help", "remove", "log", "pause"];
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
let tabMode = false;
let filteredCommand = [];
let filteredSuggestion = [];

// Init history command list for session storage
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
    // Replace NO-BREAK SPACE to NORMAL SPACE
    let rawInput = jQuery(".input-text").text().replace(/\u00A0/g, " ");

    // Filter out history commands and suggestions
    filterHistory(rawInput);
    filterCommand(rawInput);
})

/**
 * Filter out history commands for history navigation. In most cases, it's better to read the global variable instead of the return value
 * 
 * @param {string} input raw input for filter
 * @return {object} an array contains filtered history commands
 */
function filterHistory(input){
    // Reset the cursor
    historyCursor = -1;
    if(nowInput === null){
        filteredHistory = [];
        for(item of history){
            if(item.indexOf(input) === 0){
                filteredHistory.push(item);
            }
        }
    }
    return filteredHistory;
}

/**
 * Filter out suggestions for auto-completion. In most cases, it's better to read the global variable instead of the return value
 * 
 * @param {string} input raw input for filter
 * @return {object} an array contains filtered commands and suggestions
 */
function filterCommand(input){
    filteredCommand = [];
    filteredSuggestion = [];
    // Keep the last SPACE
    if(input.substr(-1) === " " || input.substr(-1) === "\u00A0"){
        input = input.split(/\|\||;|&&/).pop().trim() + " ";
    }else{
        input = input.split(/\|\||;|&&/).pop().trim();
    }
    let splitedInput = input.split(" ");
    if(splitedInput[splitedInput.length - 1] === "" && input.trim() !== ""){
        splitedInput.pop();
    }
    if(splitedInput[0] === "" && input.trim() !== ""){
        splitedInput.shift();
    }
    if(input.trim() === ""){
        splitedInput = [""];
    }
    if(splitedInput.length === 1){
        for(item of commandList){
            if(item.indexOf(input) === 0){
                filteredCommand.push(item);
                filteredSuggestion.push(item.substr(input.length));
            }
        }
    }else{
        // Filter out commands just for 'create' command
        for(item of createArgList){
            if(item.indexOf(splitedInput[splitedInput.length - 1]) === 0){
                filteredCommand.push(item);
                filteredSuggestion.push(item.substr(splitedInput[splitedInput.length - 1].length));
            }
        }
    }

    // Display the first suggestion below the input
    if(input !== ""){
        jQuery("#tip").text(filteredSuggestion[0] || "");
    }else{
        jQuery("#tip").text("");
    }
    return [filteredCommand, filteredSuggestion];
}

/**
 * Add a command into history command list
 * 
 * @param {string} command the command need to add into history command list
 * @return {object} the history command list
 */
function addHistory(command){
    // List is too long, remove the earliest command
    if(history.length >= 500){
        history.pop();
    }
    history.unshift(command);
    sessionStorage.setItem("ptw_history", JSON.stringify(history));
    return history
}

document.addEventListener("keydown", parseKey, false);

/**
 * Parse key input and bind special keys to corresponding actions
 * 
 * @param {object} event keydown event object
 */
function parseKey(event) {
    jQuery('.input-text').focus();
    if(event.keyCode === 13){
        // ENTER
        event.preventDefault();
        nowInput = null;
        historyMode = false;
        tabMode = false;
        jQuery("#tip").text("");
        // Whether asking for choice
        if(mode === "guess"){
            doCommand(jQuery(".input-choise").text().replace(/\u00A0/g, " ").trim());
        }else{
            // Combine multiple SPACE to single SPACE
            let rawCommand = jQuery(".input-text").text().replace(/\u00A0/g, " ").replace(/\u0020+/g, " ");

            // Print inputed command
            let keptSpaceInput = jQuery(".input-text").text();
            outputHead(keptSpaceInput);
            if(jQuery(".input-text").text() !== ""){
                addHistory(keptSpaceInput);
            }

            // Split the input into sigle commands
            commandQueue = [];
            rawCommand = rawCommand.split(";");
            for(command of rawCommand){
                command = command.split("&&");
                for(subCommand of command){
                    subCommand = subCommand.split("||");
                    for(singleCommand of subCommand){
                        // 2 => or
                        commandQueue.push(singleCommand, 2);
                    }
                    commandQueue.pop();
                    // 1 => and
                    commandQueue.push(1);
                }
                commandQueue.pop();
                // 0 => then
                commandQueue.push(0);
            }
            commandQueue.pop();
            console.log(commandQueue);
            doCommand(commandQueue.shift());
        }

        // Clear the input area
        jQuery('.input-text').html('');
        filterHistory(jQuery(".input-text").text().replace(/\u00A0/g, " "));

        // Keep the scroll bar in the end
        jQuery('body,html').animate({
            scrollTop: jQuery(document).height()
        }, 0);
    }else if(event.keyCode === 9){
        // TAB
        event.preventDefault();
        nowInput = null;
        historyMode = false;
        filterHistory(jQuery(".input-text").text().replace(/\u00A0/g, " "));
        filterCommand(jQuery(".input-text").text().replace(/\u00A0/g, " "));
        if(filteredCommand.length === 1){
            // When there is only one suggestion, just apply
            let input = jQuery(".input-text").text()
            let splitedInput = input.replace(/\u00A0/g, " ").trim().split(" ");
            let lastInput = splitedInput.pop();
            jQuery(".input-text").html(input.substr(0, input.length - lastInput.length) + filteredCommand[0] + "&nbsp;");
            filterCommand(jQuery(".input-text").text().replace(/\u00A0/g, " "));
            keepLastIndex(document.getElementsByClassName("input-text")[0]);
        }else{
            // When there are more then one suggestion, print choices
            if(filteredCommand.length >= 2){
                if(!tabMode){
                    tabMode = true;
                }else{
                    outputHead(jQuery(".input-text").text());
                    let outputHTML = "";
                    for(item of filteredCommand){
                        outputHTML += "<div class=\"tab-items\">"+item+"</div>";
                    }
                    outputHTML += "<br>";
                    output(outputHTML, "");
                    tabMode = false;
                }
            }
        }
    }else if(event.keyCode === 38){
        // UP
        event.preventDefault();
        tabMode = false;
        if(!historyMode){
            nowInput = jQuery(".input-text").text().replace(/\u00A0/g, " ");
            historyMode = true;
        }

        // If it is not in normal mode, print '^[[A' instead
        if(mode === "normal"){
            hisComm('up');
        }else{
            jQuery('.input-choise').text(jQuery('.input-choise').text() + "^[[A");
        }
        filterCommand(jQuery(".input-text").text().replace(/\u00A0/g, " "));
    }else if(event.keyCode === 39){
        // RIGHT
        nowInput = null;
        historyMode = false;
        tabMode = false;
        filterHistory(jQuery(".input-text").text().replace(/\u00A0/g, " "));

        // If it has been pressed when the cursor is in the end, apply the suggestion
        if(getCursorPosition(document.getElementsByClassName("input-text")[0]) === jQuery(".input-text").text().replace(/\u00A0/g, " ").length){
            if(jQuery("#tip").text() !== ""){
                jQuery(".input-text").html(jQuery(".input-text").text() + jQuery("#tip").text() + "&nbsp;");
                jQuery("#tip").text("");
            }
            filterCommand(jQuery(".input-text").text().replace(/\u00A0/g, " "));
            keepLastIndex(document.getElementsByClassName("input-text")[0])
        }
    }else if(event.keyCode === 40){
        // DOWN
        event.preventDefault();
        tabMode = false;
        if(!historyMode){
            nowInput = jQuery(".input-text").text().replace(/\u00A0/g, " ");
            historyMode = true;
        }

        // If it is not in normal mode, print '^[[B' instead
        if(mode === "normal"){
            hisComm('down');
        }else{
            jQuery('.input-choise').text(jQuery('.input-choise').text() + "^[[B");
        }
        filterCommand(jQuery(".input-text").text().replace(/\u00A0/g, " "));
    }else if(event.ctrlKey === true){
        if(event.keyCode === 67){
            // Ctrl+C
            nowInput = null;
            historyMode = false;
            tabMode = false;
            if(mode === "normal"){
                outputHead(jQuery(".input-text").text()+"^C");
            }else if(mode === "creating"){
                mode = "normal";
                output("^C");
                showInput();
            }else{
                mode = "normal";
                output(jQuery("#output-choise").html()+"<span class=\"printed-command\">"+jQuery(".input-choise").text()+"</span>"+"^C");
                showInput();
                hideChoise();
            }
            jQuery(".input-text").text("");
            jQuery(".input-choice").text("");
            jQuery("#tip").text("");
        }
    }else{
        // Other keys
        nowInput = null;
        historyMode = false;
        tabMode = false;
        filterHistory(jQuery(".input-text").text().replace(/\u00A0/g, " ").trim());
    }
}

/**
 * Display history command accroding to the direction
 * 
 * @param {string} direction the direction of the key that had been pressed. "up" or "down" only
 * @return {string} the command need to be displayed
 */
function hisComm(direction){
    if(direction === "up"){
        if(historyCursor < filteredHistory.length - 1){
            historyCursor++;
        }
    }else{
        if(historyCursor > -1){
            historyCursor--;
        }

        // Out of range, show recent input
        if(historyCursor === -1){
            jQuery(".input-text").text(nowInput.replace(/\u0020/g, "\u00A0"));
            keepLastIndex(document.getElementsByClassName("input-text")[0]);
            return nowInput;
        }
    }
    jQuery(".input-text").text(filteredHistory[historyCursor]);
    keepLastIndex(document.getElementsByClassName("input-text")[0]);
    return filteredHistory[historyCursor];
}

/**
 * Excute the next command. Called when a single command was excuted
 * 
 * @param {boolean} status whether the last command was excuted successfully
 */
function doNextCommand(status){
    if(commandQueue.length === 0){
        // Nothing to excute, exit
        return;
    }
    let nextLogic = commandQueue.shift();
    if(typeof nextLogic !== "number"){
        // Something went wrong, print an error and move to the next command
        output('<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["command_error"]);
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

    // Call doCommand() to excute command
    if(nextLogic === 0){
        doCommand(commandQueue.shift());
    }else if(nextLogic === 1 && status){
        doCommand(commandQueue.shift());
    }else if(nextLogic === 2 && !status){
        doCommand(commandQueue.shift());
    }else{
        // If the condition is not satisfied, move to the next command
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

/**
 * Excute one single command
 * 
 * @param {string} command command that need to be excuted
 * @return {boolean} whether the command was excuted successfully
 */
function doCommand(command){
    let status = true;
    if(typeof command !== "string"){
        // Not a command, move to the next
        doNextCommand(false);
        return false;
    }
    command = command.trim();
    if(mode === "guess"){
        // Handle choice input
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
            // Comfirm, excute the command
            doCommand(guessedCommand + guessedCommandFollow);
            status = true;
        }else{
            status = false;
        }
        doNextCommand(status);
        return status;
    }
    if(command !== ""){
        if((command + " ").indexOf("rm -rf / ") === 0 || (command + " ").indexOf("rm -rf /* ") === 0){
            // Just for fun ;-)
            jQuery("#wpcontent").addClass("ptw-rm");
            setTimeout(()=>{
                jQuery("#wpcontent").removeClass("ptw-rm");
            }, 1000);
            output("BOOM!");
            doNextCommand(true);
            return true;
        }
        let commmandSequence = command.split(" ");
        let outputArg = ["", ""];
        if(commmandSequence[0] === "help"){
            // help
            if(commmandSequence.length > 1){
                output('<span class="color-warn">'+phpContent["warning"]+'</span>'+phpContent["ignored"]);
            }
            outputArg = ["Push2WP Verion "+phpContent["version"]+"<br>PTW Shell Verion "+shellVersion+"<br><br>&nbsp;&nbsp;<strong>create &lt;github/gitlab/coding&gt;</strong>: "+phpContent["help"]["create"]+"<br>&nbsp;&nbsp;<strong>list</strong>: "+phpContent["help"]["list"]+"<br>&nbsp;&nbsp;<strong>remove &lt;ID&gt;</strong>: "+phpContent["help"]["remove"]+"<br>&nbsp;&nbsp;<strong>pause</strong>: "+phpContent["help"]["pause"]+"<br>&nbsp;&nbsp;<strong>log &lt;length=50&gt;</strong>: "+phpContent["help"]["log"]+"<br>&nbsp;&nbsp;<strong>clear</strong>: "+phpContent["help"]["clear"]+"<br>&nbsp;&nbsp;<strong>help</strong>: "+phpContent["help"]["help"]+"<br>"];
            status = true;
        }else if(commmandSequence[0] === "clear"){
            // clear
            jQuery("#output").html("");
            outputArg = [""];
            status = true;
        }else if(commmandSequence[0] === "create"){
            // create
            if(commmandSequence.length > 2){
                output('<span class="color-warn">'+phpContent["warning"]+'</span>'+phpContent["ignored"]);
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
                outputArg = ['<span class="color-info">'+phpContent["create"]["source"]+source+'</span><br>'+phpContent["create"]["hold_on"]];
                createHook(commmandSequence[1], source);
                mode = "creating";
                status = true;
            }else{
                outputArg = ['<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["unknow_create"]];
                status = false;
            }
        }else if(commmandSequence[0] === "list"){
            // list
        }else if(commmandSequence[0] === "remove"){
            // remove
            if((commmandSequence.length > 2 && commmandSequence[commmandSequence.length - 1] !== "-f") || (commmandSequence.length > 3 && commmandSequence[2] === "-f")){
                output('<span class="color-warn">'+phpContent["warning"]+'</span>'+phpContent["ignored"]);
            }
            if(commmandSequence.length < 2 || commmandSequence[1] === "-f"){
                outputArg = ['<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["remove"]["arg_needed"]];
                status = false;
            }else if(!(/^[1-9]\d{0,2}$/.test(commmandSequence[1])) && commmandSequence[1] !== "-f"){
                outputArg = ['<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["remove"]["not_an_id"]];
                status = false;
            }else{
                outputArg = ['<span class="color-success">'+phpContent["done"]+'</span>'+phpContent["remove"]["success"]+'<div class="webhook-list">ID&nbsp;&nbsp;&nbsp;&nbsp;Source&nbsp;&nbsp;&nbsp;Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Secret<br>==================================================================================<br>'+commmandSequence[1]+'&nbsp;'.repeat(6 - commmandSequence[1].length)+'GitHub&nbsp;&nbsp;&nbsp;Verified&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2020-03-10 21:59:45&nbsp;&nbsp;&nbsp;hu7webfy5gf31b13yf3vhu898h139gh8<br>'+'==================================================================================<br>'+phpContent["total"]+'1'+'</div>', ''];
                status = true;
            }
        }else if(commmandSequence[0] === "log"){
            // log
            if(commmandSequence.length > 2){
                output('<span class="color-warn">'+phpContent["warning"]+'</span>'+phpContent["ignored"]);
            }
            if(commmandSequence.length > 1){
                // If length is specified
                if(!(/^[1-5]\d{0,1}$/.test(commmandSequence[1])) || parseInt(commmandSequence[1]) > 50){
                    outputArg = ['<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["log_error"]];
                    status = false;
                }else{
                    outputArg = ["\u200B", ""];
                    mode = "creating";
                    status = true;
                    hideInput();
                    getLog(parseInt(commmandSequence[1]));
                }
            }else{
                outputArg = ["\u200B", ""];
                mode = "creating";
                status = true;
                hideInput();
                getLog();
            }
        }else{
            // Unknown command, print an error
            outputArg = ['<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["unknown_command"][0]+commmandSequence[0]+phpContent["unknown_command"][1]];

            // Guess the command accroding to the edit distance
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
                // Show choice
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

/**
 * Hide the input area
 */
function hideInput(){
    jQuery("#input").hide();
}

/**
 * Show the input area and focus on it
 */
function showInput(){
    jQuery("#input").show();

    // Keep the scroll bar in the end
    jQuery('body,html').animate({
        scrollTop: jQuery(document).height()
    }, 0);
    jQuery(".input-text").focus();
}

/**
 * Hide the choise input area
 */
function hideChoise(){
    jQuery(".input-choise, #output-choise").css("display", "none");
}

/**
 * Show the choise input area and focus on it
 */
function showChoise(){
    jQuery("#output-choise").css("display", "inline");

    // Keep the scroll bar in the end
    jQuery('body,html').animate({
        scrollTop: jQuery(document).height()
    }, 0);
    jQuery(".input-choise").css("display", "inline").focus();
}

/**
 * Print '> command'
 * 
 * @param {string} command the command need to be printed
 * @return {string} the printed content
 */
function outputHead(command){
    return output('><span class="printed-command">'+command+'</span>');
}

/**
 * Print text to the screen
 * 
 * @param {string} text the content need to be printed
 * @param {string=} ending the ending of the content. Default is '<br>'
 * @return {string} the printed content
 */
function output(text, ending="<br>"){
    jQuery("#output").html(jQuery("#output").html()+text+ending);
    return text+ending;
}

/**
 * Show text in choice input area
 * 
 * @param {string} text the content need to be displayed
 */
function outputChoise(text){
    jQuery("#output-choise").html(text);
}

/**
 * Calculate the edit distance between two words
 * 
 * @param {string} s1 the first word
 * @param {string} s2 the second word
 * @return {number} the edit distance between the two words
 */
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

/**
 * Keep the cursor in the end
 * 
 * @param {object} element the input element
 */
function keepLastIndex(element) {
    if (window.getSelection) {
        element.focus();
        let range = window.getSelection();
        range.selectAllChildren(element);
        range.collapseToEnd()
    } else if (document.selection) {
        let range = document.selection.createRange();
        range.moveToElementText(element);
        range.collapse(false);
        range.select()
    }
}

/**
 * Get the position of the cursor in an input element
 * 
 * @param {object} element the input element
 * @return {number} the position of the cursor
 */
function getCursorPosition(element){
    let caretOffset = 0;
    let doc = element.ownerDocument || element.document;
    let win = doc.defaultView || doc.parentWindow;
    let sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            let range = win.getSelection().getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length
        }
    }
    return caretOffset;
}

// Format strings like PHP do
String.prototype.format= function(){
    let args = Array.prototype.slice.call(arguments);
    let count = 0;
    return this.replace(/%s/g,function(s,i){
        return args[count++];
    });
}

/**
 * Create a webhook
 * 
 * @param {string} source the source. "github", "gitlab" or "coding" only
 * @param {string} name the formated name of the source
 */
function createHook(source, name){
    jQuery.get(phpContent["admin_url"]+"?action=ptw_create&source="+source, function(result){
        if(result.status){
            if(mode === "creating"){
                // If not canceled
                output(phpContent["create"]["url_is"]+"<span class=\"color-info\">"+phpContent["admin_url"]+"?action=ptw_"+result.data.source+"&id="+result.data.id.toString()+"</span>");
                output(phpContent["create"]["secret_is"]+"<span class=\"color-info\">"+result.data.secret+"</span>");
                output(phpContent["create"]["donot_show"].format(name));
                output(phpContent["create"]["add"].format(name));
                output(phpContent["create"]["ping"].format(name, result.data.id.toString()));
                showInput();
                mode = "normal";
                doNextCommand(true);
            }else{
                // Canceled, remove it
                jQuery.get(phpContent["admin_url"]+"?action=ptw_remove&id="+result.data.id.toString());
            }
        }else{
            if(mode === "creating"){
                output('<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["no_permission"]);
                mode = "normal";
                showInput();
                doNextCommand(false);
            }
        }
    }).error(function(){
        // Something went wrong
        if(mode === "creating"){
            output('<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["unknown_error"]);
            mode = "normal";
            showInput();
            doNextCommand(false);
        }
    });
}

/**
 * Get logs through API
 * 
 * @param {string} length the length of the log. Default is 50
 */
function getLog(length=50){
    jQuery.get(phpContent["admin_url"]+"?action=ptw_log&length="+length.toString(), function(result){
        if(result.status){
            if(mode === "creating"){
                // If not canceled
                output("<div class=\"webhook-list\""+result.data+"</div>", "");
                showInput();
                mode = "normal";
                doNextCommand(true);
            }
        }else{
            if(mode === "creating"){
                output('<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["no_permission"]);
                mode = "normal";
                showInput();
                doNextCommand(false);
            }
        }
    }).error(function(){
        if(mode === "creating"){
            // Something went wrong
            output('<span class="color-err">'+phpContent["error"]+'</span>'+phpContent["unknown_error"]);
            mode = "normal";
            showInput();
            doNextCommand(false);
        }
    });
}