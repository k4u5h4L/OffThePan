// jshint esversion:8

const express = require("express");
const bodyParser = require("body-parser");
// const https = require("https"); // fir api calls using https
const fetch = require("node-fetch");
const isValid = require(__dirname + "/validate.js");
const filter = require(__dirname + "/inputFilter.js");
const nodeMailer = require("nodemailer");

require("dotenv").config();
const PORT = 3000;

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    quoteSearch().then((data) => {
        // console.log(data);
        if (data.length == 0) {
            const backup = {
                text: "All you need is love. But a little chocolate now and then doesn't hurt.",
                author: "Charles M. Schulz",
            };
            res.render("index", { data: backup });
        } else {
            const numberOfQuotes = data.length - 1;
            const rand = Math.floor(Math.random() * numberOfQuotes); // generating a random number
            const quoteData = data[rand];

            res.render("index", { data: quoteData });
        }
    });
});

async function quoteSearch() {
    const apiUrl = "https://type.fit/api/quotes/";

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

app.get("/about", (req, res) => {
    res.render("about");
});

app.route("/contact")
    .get((req, res) => {
        res.render("contact");
    })
    .post((req, res) => {
        const contactInfo = {
            name: req.body.name,
            email: req.body.contactEmail,
            subject: req.body.subject,
            message: req.body.message,
        };

        let transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASSWD,
            },
        });

        const message = {
            from: process.env.EMAIL_ID, // Sender address
            to: "kaushal.bhat@yahoo.com", // List of recipients
            subject: "Email from " + contactInfo.email + " about " + contactInfo.subject, // Subject line
            text: contactInfo.message, // Plain text body
        };
        transport.sendMail(message, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log(info);
            }
        });

        res.render("thankyou", { data: contactInfo.name });
    });

app.get("/test", (req, res) => {
    res.render("reference");
});

app.post("/quickSearch", (req, res) => {
    let search = req.body.searchItem.trim();
    const initialUrl = "https://spoonacular.com/recipeImages/";

    const tempVal = isValid.validate(search);

    if (!tempVal) {
        console.log("The input has more than a single word and/or contains symbols.");
        res.render("failure", {
            data: "Your input is not valid. Please try again withput symbols and special characters",
        });
        return false;
    }

    search = search.replace(/\s/g, "%20");
    console.log(search);

    // if you're using https module for api calls instead of fetch()
    // https.get(apiUrl, (response) => {
    //     console.log(response.statusMessage);

    //     if (response.statusCode != 200) {
    //         res.render("failure", { data: "We could not find anything what you searched for." });
    //         return false;
    //     }

    //     response.on("data", (data) => {
    //         try {
    //             console.log(JSON.parse(data));
    //         } catch (e) {
    //             console.log("The file wasn't in a valid JSON format.");

    //             res.render("failure", { data: "Sorry. Something went wrong on our end!" });
    //             return false;
    //         }

    //         const searchData = JSON.parse(data);
    //         const image = searchData.results[0].image;

    //         // const imageUrl = initialUrl + searchData.results[0].id + "-636x393.jpg"; // use this if the other doesn't work
    //         const imageUrl = initialUrl + image;

    quickSearchData(search).then((data) => {
        // console.log(data);
        if (data.results.length == 0) {
            res.render("failure", { data: "We could not find anything what you searched for." });
        } else {
            res.render("list", { searchData: data, query: search, imageUrl: initialUrl });
        }
    });

    //res.render("list", { data: searchData, query: search, imageLocation: imageUrl });
    //     });
    // });
});

async function quickSearchData(search) {
    const apiUrl =
        "https://api.spoonacular.com/recipes/search?query=" +
        search +
        "&number=5&apiKey=" +
        process.env.API_KEY;

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

async function vegetarianSearch() {
    const apiUrl =
        "https://api.spoonacular.com/recipes/search?number=5&diet=vegetarian&apiKey=" + process.env.API_KEY;

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

app.get("/search", (req, res) => {
    res.render("search");
});

app.get("/vegetarian", (req, res) => {
    vegetarianSearch().then((data) => {
        // console.log(data);
        const initialUrl = "https://spoonacular.com/recipeImages/";
        if (data.results.length == 0) {
            res.render("failure", { data: "We could not find anything what you searched for." });
        } else {
            res.render("list", { searchData: data, query: "Vegetarians", imageUrl: initialUrl });
        }
    });
});

app.post("/featured/:foodTitle", (req, res) => {
    const searchTitle = req.params.foodTitle;
    // if (searchTitle == "burger" || searchTitle == "salads" || searchTitle == "desserts") {
    quickSearchData(searchTitle).then((data) => {
        // console.log(data);
        const initialUrl = "https://spoonacular.com/recipeImages/";
        if (data.results.length == 0) {
            res.render("failure", { data: "We could not find anything what you searched for." });
        } else {
            res.render("featuredList", { searchData: data, query: "burgers", imageUrl: initialUrl });
        }
    });
    // } else {
    //     res.render("failure", { data: "This page is not available!" });
    // }
});

app.post("/ingredientSearch", (req, res) => {
    //let ingredients = req.body.ingredients;
    let ingredients = filter.validate(req.body.ingredients);

    ingredientSearch(ingredients).then((data) => {
        res.render("recipe", { searchData: data });
    });
});

// app.post("/nutrientSearch", (req, res) => {
//     //let ingredients = req.body.ingredients;
//     let ingredients = filter.validate(req.body.ingredients);

//     ingredientSearch(ingredients).then((data) => {
//         res.send(data);
//     });
// });

app.post("/cuisineSearch", (req, res) => {
    const cuisine = req.body.cuisine;
    console.log(cuisine);

    res.send(cuisine);
});

async function ingredientSearch(search) {
    const apiUrl =
        "https://api.spoonacular.com/recipes/findByIngredients?ingredients=" +
        search +
        "number=5&apiKey=" +
        process.env.API_KEY;

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

async function nutrientSearch(search) {
    const apiUrl =
        "https://api.spoonacular.com/recipes/findByIngredients?ingredients=" +
        search +
        "number=5&apiKey=" +
        process.env.API_KEY;

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

async function cuisineSearch(search) {
    const apiUrl =
        "https://api.spoonacular.com/recipes/findByIngredients?ingredients=" +
        search +
        "number=5&apiKey=" +
        process.env.API_KEY;

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

app.get("*", (req, res) => {
    res.render("failure", { data: "This page is not available!" });
});

app.listen(PORT, () => console.log("Server is running on port " + PORT));

// const Tesseract = require('tesseract.js');
// Tesseract.recognize(
//     'https://tesseract.projectnaptha.com/img/eng_bw.png',
//     'eng',
//     { logger: m => console.log(m) }
// ).then(({ data: { text } }) => {
//     console.log(text);
// });
