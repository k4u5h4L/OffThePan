// jshint esversion:8

const SpeechRecognition = window.webkitSpeechRecognition;

let recognition = new SpeechRecognition();

let Textbox = $("#textbox");
let instructions = $("instructions");

let Content = "";

recognition.continuous = true;

recognition.onresult = function (event) {
    let current = event.resultIndex;

    let transcript = event.results[current][0].transcript;

    Content += transcript;
    Textbox.val(Content);
};

recognition.onstart = function () {
    instructions.text("Voice recognition is ON.");
};

recognition.onspeechend = function () {
    instructions.text("No activity.");
};

recognition.onerror = function (event) {
    if (event.error == "no-speech") {
        instructions.text("Try again.");
    }
};

$("#start-btn").on("click", function (e) {
    if (Content.length) {
        Content += " ";
    }
    recognition.start();
});

$("#stop-btn").on("click", function (e) {
    recognition.stop();
});

Textbox.on("input", function () {
    Content = $(this).val();
});
