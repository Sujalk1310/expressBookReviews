const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username; // Get the username from the session
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!username || !isbn || !review) {
        return res.status(400).json({ message: "Invalid request. Please provide username, ISBN, and review." });
    }

    // Find the book in the 'books' array by ISBN
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }
    
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review successfully added or updated." });
});

// Delete a book review for the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username; // Get the username from the session
    const isbn = req.params.isbn;

    if (!username || !isbn) {
        return res.status(400).json({ message: "Invalid request. Please provide username and ISBN." });
    }

    // Find the book in the 'books' object by ISBN
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the user has a review for this book
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user and book." });
    }

    // Delete the user's review for this book
    delete book.reviews[username];

    return res.status(200).json({ message: "Review successfully deleted." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
