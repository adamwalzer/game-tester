// starting individual code
var frame;
var input;
var output;
var outputText = 'CHANGE MY WORLD NOW GAME TESTING ENVIRONMENT';
var reload;
var demo;
var screen;
var copy;
var clear;
var gameData = {};

function setGameFrameSource(gfs) {
    document.cookie = 'testGameFrameSource=' + gfs;
    updateGameFrameSource(gfs);
}

function getCookieValue() {
    return document.cookie.replace(/(?:(?:^|.*;\s*)testGameFrameSource\s*\=\s*([^;]*).*$)|^.*$/, '$1');
}

function updateGameFrameSource(gfs) {
    var gameFrameSource = gfs || getCookieValue() ||
        'https://games-qa.changemyworldnow.com/3d-world/index.html';
    frame.src = gameFrameSource;
    input.value = gameFrameSource;
    updateOutput(`<br/>navigated to ${gameFrameSource}`);
}

function updateOutput(text = '') {
    outputText += text;
    output.innerHTML = outputText;
    output.scrollTop = output.scrollHeight;
}

function onInputKeyUp(e) {
    if (e.keyCode === 13) {
        if (this.value !== getCookieValue()) {
            gameData = {};
        }
        setGameFrameSource(this.value);
    }
}

function onScreenKeyUp(e) {
    if (e.keyCode === 13) {
        goToScreen(_.parseInt(this.value) || 0);
    }
}

function goToScreen(index) {
    gameData = _.defaults({
        name: 'save',
        highestScreenIndex: index,
        currentScreenIndex: index,
    }, gameData);

    onReloadClick();
}

function onReloadClick() {
    frame.contentWindow.location.reload();
}

function onDemoClick() {
    emitEvent({name: 'demo'});
}

function onCopyClick() {
    var textarea = document.createElement('textarea');
    textarea.textContent = outputText;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    /* eslint-disable no-alert */
    try {
        document.execCommand('copy');
        alert('Copy to clipboard succeeded.');
    } catch(ex) {
        alert('Copy to clipboard failed.', ex);
    } finally {
        document.body.removeChild(textarea);
    }
    /* eslint-enable no-alert */
}

function onClearClick() {
    outputText = 'CHANGE MY WORLD NOW GAME TESTING ENVIRONMENT';
    updateOutput();
}

function emitEvent(opts) {
    var e = new Event('platform-event');
    e = _.defaults(e, opts);
    frame.contentWindow.dispatchEvent(e);
}

function onGameEvent(e) {
    updateOutput(`<br/>Event:<br/>${JSON.stringify(e)}`);

    if (_.get(e, 'gameData.name') === 'save') {
        screen.value = _.get(e, 'gameData.currentScreenIndex');
    }
}

document.domain = 'changemyworldnow.com';

window.addEventListener('game-event', function (e) {
    var data = e.gameData;

    if (!data) return;

    if (data.name === 'init') {
        console.log('init', gameData);
        e.respond(gameData);
    } else if (data.name === 'save') {
        gameData = data;
    }
}, false);

window.onload = function () {
    frame = document.getElementById('frame');
    input = document.getElementById('input');
    output = document.getElementById('output');
    reload = document.getElementById('reload');
    demo = document.getElementById('demo');
    screen = document.getElementById('screen');
    copy = document.getElementById('copy');
    clear = document.getElementById('clear');

    input.onkeyup = onInputKeyUp;
    screen.onkeyup = onScreenKeyUp;

    reload.onclick = onReloadClick;
    demo.onclick = onDemoClick;
    copy.onclick = onCopyClick;
    clear.onclick = onClearClick;

    frame.addEventListener('game-event', onGameEvent);

    updateGameFrameSource();
};
