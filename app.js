const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => res.render("index"));
app.get("/manager_login", (req, res) => res.render("manager_login")); // Correct route
app.get("/user_login", (req, res) => res.render("user_login")); // Correct route

app.post("/manager_login", (req, res) => {
  const { managerId, password } = req.body;
  if (managerId === "admin" && password === "1234") {
    db.query(
      "SELECT account_type, COUNT(*) AS total_accounts, SUM(balance) AS total_balance FROM accounts GROUP BY account_type",
      (err, results) => {
        if (err) throw err;
        res.render("manager_dashboard", { results });
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/user_login", (req, res) => {
  const { accountType, name, aadharNumber } = req.body;
  db.query(
    "SELECT * FROM accounts WHERE name = ? AND aadhar_number = ? AND account_type = ?",
    [name, aadharNumber, accountType],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        res.render("account_details", { account: results[0] });
      } else {
        res.render("create_account", { name, aadharNumber, accountType });
      }
    }
  );
});

app.post("/create_account", (req, res) => {
  const { name, aadharNumber, accountType, initialBalance } = req.body;
  const accountNumber =
    accountType.substring(0, 3).toUpperCase() +
    Math.floor(Math.random() * 1000000);
  db.query(
    "INSERT INTO accounts (account_number, name, aadhar_number, account_type, balance) VALUES (?, ?, ?, ?, ?)",
    [accountNumber, name, aadharNumber, accountType, initialBalance],
    (err) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
