// Requirements
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcryptjs = require("bcryptjs");

// Server Configuration || Middleware
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: { 
    longURL: "http://www.lighthouselabs.ca", 
    user_id: "user2RandomID" 
  },
  "9sm5xK": { 
    longURL: "http://www.google.com", 
    user_id: "userRandomID" 
  },
};

const urlsForUser = (user_id, urlDatabase) => {
  let filteredUrls = {};
  for (shortURL in urlDatabase) {
    if (urlDatabase[shortURL].user_id === user_id) {
      filteredUrls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return filteredUrls;
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
  const user_id = req.session.user_id;

  if (!user_id) {
    res.redirect("/login");
    return;
  };
  const templateVars = { user: users[user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const variableDatabase = urlsForUser(user_id, urlDatabase);
  const templateVars = { urls: variableDatabase, user: users[user_id] };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send("longURL not found");
  };
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    user_id: req.session.user_id,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = urlDatabase[shortURL];
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { shortURL, longURL, user };

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
  };

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
  };

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = req.body;
  urlDatabase[shortURL].longURL = longURL;

  res.redirect(`/urls/${shortURL}`);
});

/// USERS OBJECT ///

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
////// CONDTIONAL FUNCTIONS //////

const isMissingParam = (req) => {
  if (!req.body.email || !req.body.password) {
    return true;
  };
  return false;
};

const getUserByEmail = (email, users) => {
  for (let user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    };
  };
  return null;
};

const emailExists = (email) => {
  const user = getUserByEmail(email);
  if (user) {
    return true;
  };
  return false;
};
//////////////////////////////////

/// LOGIN ///

app.get("/login", (req, res) => {
  res.render("login", { user_id: req.session.user_id, user: "" });
});

app.post("/login", (req, res) => {
  console.log("req.body:", req.body);
  const user = getUserByEmail(req.body.email, users);
  const password = req.body.password;

  if (!user) {
    return res.status(403).send("Email Cannot Be Found");
  };

  if (!bcryptjs.compareSync(password, user.password)) {
    return res.status(403).send("Error. Incorrect Password");
  };

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");

  res.redirect("/urls");
});

function generateRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/// REGISTRATION PAGE ///
app.get("/register", (req, res) => {
  res.render("register", { user_id: req.session.user_id, user: "" });
});

app.post("/register", (req, res) => {
  if (isMissingParam(req)) {
    return res.status(400).send("Email & Password Are Required");
  };

  if (emailExists(req.body.email)) {
    return res.status(400).send("Email Already Exists");
  };
  const password = req.body.password;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const user_id = generateRandomString();
  const user = {
    id: user_id,
    email: req.body.email,
    password: hashedPassword,
  };
  users[user_id] = user;
  console.log(users);
  req.session.user_id = user.id;
  res.redirect("/urls");
});

// Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = { getUserByEmail };
