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
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", user_id: "user2RandomID" },
  "9sm5xK": { longURL: "http://www.google.com", user_id: "userRandomID"  },
};

const urlsForUser = (user_id, urlDatabase) => {
  let filteredUrls = {};
  for (shortURL in urlDatabase) {
   if (urlDatabase[shortURL].user_id === user_id) {
    filteredUrls[shortURL] = urlDatabase[shortURL].longURL;
   };
  };
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
  const user_id = req.cookies.user_id; 
  // If someone is not logged in when trying to access /urls/new, redirect them to the login page.
  if (user_id === null || user_id === undefined) {
    res.redirect("/login");
    return;
  }
  const templateVars = { user_id, user: users };
  res.render("urls_new", templateVars);

});
// line urls: wtvrthe function is
app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const variableDatabase = urlsForUser(user_id, urlDatabase);
  const templateVars = { urls: variableDatabase, user: users[user_id] };
  
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
    user_id: req.cookies.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = urlDatabase[shortURL];
  const user_id = req.cookies.user_id; 
  const user = users[user_id]
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

  /// USERS OBJECT ///

  const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  }
  // /// CONDTIONAL FUNCTIONS /// //

    const isMissingParam = (req) => {
      if (!req.body.email || !req.body.password) {
        return true;
      } 
      return false;
    }

    const findUserByEmail = (email) => {
      for (let user_id in users) {
          if (users[user_id].email === email) {
            return users[user_id];
          } 
        }
        return null;
    };

    const emailExists = (email) => {
      const user = findUserByEmail(email);
      if (user) {
        return true;
      }
      return false;
       
    };

    //////////////////////////////////

        /// LOGIN ///

app.get("/login", (req, res) => {

    res.render("login", { user_id: req.cookies.user_id, user: ""});
});

app.post("/login", (req, res) => {
  const user = findUserByEmail(req.body.email);

if (!user) {
  return res.status(403).send("Email Cannot Be Found");
};

if (user.password != req.body.password) {
  return res.status(403).send("Error. Incorrect Password");
};

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

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

      res.render("register", { user_id: req.cookies.user_id, user: ""});
  });


app.post("/register", (req, res) => {
    if (isMissingParam(req)) {
      return res.status(400).send("Email & Password Are Required");
    }

    if (emailExists(req.body.email)) {
      return res.status(400).send("Email Already Exists");
    }
    const user_id = generateRandomString();
    const user = {
      id: user_id,
      email: req.body.email,
      password: req.body.password,
    };
    users[user_id] = user

    res.cookie("user_id", user_id);
    res.redirect("/urls");
  });

 

  
 
// Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});







// Function argument demo

// function calculateCostPerPerson(total, numberOfPeople=4, taxRate=0.14) {
//   if (typeof total !== 'number') { throw new Error('Provided something weird for total') }
//   if (typeof numberOfPeople !== 'number') { throw new Error('Provided something weird for numberOfPeople') }
//   if (typeof taxRate !== 'number') { throw new Error('Provided something weird for taxRate') }
//   return (total * (1+taxRate)) / numberOfPeople;
// }

// console.log(calculateCostPerPerson(80));
// console.log(calculateCostPerPerson('tomato', 3));
// console.log(calculateCostPerPerson(26, 2, 0.11));