// main app

import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
// import https from "https"; // for api calls using https
import fetch from "node-fetch";
import isValid from "./validate";
// import filter from "./inputFilter";
import APIfilter from "./APIfilter";
import quotes from "./APIdata/quotes";
import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

const PORT = 3000;
const APIKey = process.env.API_KEY;

const app: Application = express();

app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// console.log(quotes[0]);

app.get("/", (req: Request, res: Response) => {
    // console.log(data);
    if (quotes.length == 0) {
        const backup = {
            text: "All you need is love. But a little chocolate now and then doesn't hurt.",
            author: "Charles M. Schulz",
        };
        res.render("index", { data: backup });
    } else {
        const numberOfQuotes = quotes.length - 1;
        const rand = Math.floor(Math.random() * numberOfQuotes); // generating a random number
        const quoteData = quotes[rand];

        res.render("index", { data: quoteData });
    }
});

// async function quoteSearch() {
//     const apiUrl = "https://type.fit/api/quotes/";

//     let response = await fetch(apiUrl);
//     let data = await response.json();

//     return data;
// }

app.get("/about", (req: Request, res: Response) => {
    res.render("about");
});

app.route("/contact")
    .get((req: Request, res: Response) => {
        res.render("contact");
    })
    .post((req: Request, res: Response) => {
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

app.get("/test", (req: Request, res: Response) => {
    res.render("reference");
});

app.post("/quickSearch", (req: Request, res: Response) => {
    let search = req.body.searchItem.trim();
    const initialUrl = "https://spoonacular.com/recipeImages/";

    const tempVal = isValid(search);

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

async function quickSearchData(search: string) {
    const apiUrl = `https://api.spoonacular.com/recipes/search?query=${search}&number=5&apiKey=${APIKey}`;

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

async function vegetarianSearch() {
    const apiUrl = `https://api.spoonacular.com/recipes/search?number=5&diet=vegetarian&apiKey=${APIKey}`;

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

app.get("/search", (req: Request, res: Response) => {
    res.render("search");
});

app.get("/vegetarian", (req: Request, res: Response) => {
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

app.post("/featured/:foodTitle", (req: Request, res: Response) => {
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

app.post("/ingredientSearch", (req: Request, res: Response) => {
    //let ingredients = req.body.ingredients;
    let ingredients = APIfilter(req.body.ingredients);

    ingredientSearch(ingredients).then((data) => {
        res.render("recipe", { searchData: data, searchQuery: req.body.ingredients });
        // res.send(data);
    });
});

// app.post("/nutrientSearch", (req: Request, res: Response) => {
//     //let ingredients = req.body.ingredients;
//     let ingredients = filter.validate(req.body.ingredients);

//     ingredientSearch(ingredients).then((data) => {
//         res.send(data);
//     });
// });

app.post("/cuisineSearch", (req: Request, res: Response) => {
    let cuisine = {
        name: APIfilter(req.body.cuisine),
        diet: req.body.diet,
        intol: req.body.intol,
    };
    console.log(cuisine);

    cuisineSearch(cuisine).then((data) => {
        res.render("recipe-cuisine", { searchData: data, searchQuery: req.body.cuisine });
        // res.send(data);
    });
});

app.post("/wineSearch", (req: Request, res: Response) => {
    //let ingredients = req.body.ingredients;
    let ingredients = APIfilter(req.body.wineInput);

    wineSearch(ingredients).then((data) => {
        // console.log(data);

        res.render("wine", {
            searchData: data,
            searchQuery: "Wine with " + req.body.wineInput,
        });

        //res.send(data);
    });
});

async function ingredientSearch(search: string) {
    console.log(search);
    // const apiUrl =
    //     "https://api.spoonacular.com/recipes/findByIngredients?ingredients=" +
    //     search +
    //     "number=5&apiKey=" +
    //     APIKey;

    const apiUrl = `http://www.recipepuppy.com/api/?i=${search}`;

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

async function wineSearch(search: string) {
    const apiUrl = `https://api.spoonacular.com/food/wine/pairing?food=${search}&apiKey=${APIKey}`;

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

async function cuisineSearch(search: any) {
    let intolerance = "";
    let apiUrl = "";

    if (search.intol == "none") {
        intolerance = "#";
    }

    if (search.diet == "whole30") {
        apiUrl = `https://api.spoonacular.com/recipes/search?cuisine=${search.name}&number=10&apiKey=${APIKey}&intolerances=${intolerance}`;
    } else {
        apiUrl = `https://api.spoonacular.com/recipes/search?cuisine=${search.name}&number=10&apiKey=${APIKey}&diet=${search.diet}&intolerances=${intolerance}`;
    }

    let response = await fetch(apiUrl);
    let data = await response.json();

    return data;
}

app.get("*", (req: Request, res: Response) => {
    res.render("failure", { data: "This page is not available!" });
});

app.listen(process.env.PORT || PORT, () => console.log(`Server is running on port ${PORT}`));
