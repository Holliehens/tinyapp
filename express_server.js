// Requirements
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

// Server Configuration || Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca" },
  "9sm5xK": { longURL: "http://www.google.com" },
};

// Routes || Endpoints
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies.username; 
  const templateVars = { username };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { urls: urlDatabase, username };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body; 
  if (!longURL) {
    return res.status(400).send("longURL not found");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    // userId: userId
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = urlDatabase[shortURL];
  const username = req.cookies.username; 
  const templateVars = { shortURL, longURL, username };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // extract the shortURL from params
  const { shortURL } = req.params;

  // search for shortURL in database
  const urlObject = urlDatabase[shortURL];

  // validate that shortURL exist in database
  if (!urlObject) {
    return res.status(400).send("shortURL not found");
  }

  // redirect the user to longURL property within the shortURL object
  res.redirect(urlObject.longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // extract the shortURL from params
  const { shortURL } = req.params;

  // search for shortURL in database
  const urlObject = urlDatabase[shortURL];

  // validate that shortURL exist in database
  if (!urlObject) {
    return res.status(400).send("shortURL not found");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = req.body;
  urlDatabase[shortURL].longURL = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const username = req.body.username;

  // cookie takes the arg of (key, value). key sets the cookie name.
  res.cookie("username", username);

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");

  res.redirect("/urls");
});

function generateRandomString(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

  /// REGISTRATION PAGE ///
  //  app.get("/register", (req, res) => {
  //     //template variable
  //     const templateReg =

  //     res.render("register")
  //  });

// Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
