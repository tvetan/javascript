function JavaScriptConsole(selector) {
    var consoleElement = document.querySelector(selector);

    var textArea = document.createElement("p");
    consoleElement.appendChild(textArea);

    var NORMAL = 0;
    var ERROR = 1;
    var WARNING = 2;

    var _write = function (args, type) {
        var text = document.createElement("span");
        if (args[0]) {
            if (type === NORMAL) {
                text.innerHTML = args[0].toString();
                text.style.color = "#fff";
            }
            else if (type === ERROR) {
                text.innerHTML = "Error: " + args[0].toString();
                text.style.color = "#f00";
            }
            else if (type === WARNING) {
                text.innerHTML = "Warning: " + args[0].toString();
                text.style.color = "#ff0";
            }

            for (var i = 1; i < args.length; i++) {
                var placeHolder = "{" + (i - 1) + "}";
                text.innerHTML = text.innerHTML.replace(placeHolder, args[i].toString());
            }

            textArea.appendChild(text);
            consoleElement.scrollTop = consoleElement.scrollHeight;
        }
    }

    // Writes on the console without line break (new line)
    this.write = function () {
        _write(arguments, NORMAL);
    }

    // Writes a line in the console
    this.writeLine = function writeLine() {
        _write(arguments, NORMAL);
        textArea.appendChild(document.createElement("br"));
    }

    // Writes an error in the console
    this.writeError = function writeError() {
        _write(arguments, ERROR);
        textArea.appendChild(document.createElement("br"));
    }

    // Writes a warning in the console
    this.writeWarning = function writeWarning() {
        _write(arguments, WARNING);
        textArea.appendChild(document.createElement("br"));
    }
}