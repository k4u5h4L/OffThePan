// jshint esversion: 8

let loadingGif = document.getElementById("loadingGif");

let loadFile = function (event) {
    let imageText = URL.createObjectURL(event.target.files[0]);
    scan(imageText);
};

function print(text) {
    document.getElementById("textbox").value = text;
}

function scan(src1) {
    document.getElementById("readStatus").innerHTML = "loading...";
    loadingGif.src = "../img/gifs/loading-model.gif";

    Tesseract.recognize(src1, "eng", {
        logger: (m) => {
            console.log(m);
            document.getElementById("readStatus").innerHTML = m.status;
        },
    }).then(({ data: { text } }) => {
        console.log(text);
        document.getElementById("readStatus").innerHTML = "Done!";
        loadingGif.removeAttribute("src");
        print(text);
    });
}
