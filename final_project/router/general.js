const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!isValid(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

function fetchBookList() {
    return new Promise((resolve, reject) => {
        try {
            resolve(JSON.stringify(books,null,4));
        } catch (error) {
            console.error('Error fetching book list:', error);
            reject(new Error('Failed to fetch book list'));
        }
    });
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    fetchBookList()
        .then(bookList => {
            res.status(200).json(bookList);
        })
        .catch(error => {
            res.status(500).json({ message: 'Internal Server Error' });
        });
});

// Function to get book details based on ISBN
function getBookDetails(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error('Book not found'));
        }
    });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    getBookDetails(isbn)
        .then(book => {
            res.status(200).json(book);
        })
        .catch(error => {
            res.status(404).json({ message: 'Book not found' });
        });
});

// Function to get books based on author
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        const filteredBooks = {};
        for (let bookId in books) {
            if (books[bookId].author === author) {
                filteredBooks[bookId] = books[bookId];
            }
        }

        if (Object.keys(filteredBooks).length > 0) {
            resolve(filteredBooks);
        } else {
            reject(new Error('No books found for the author'));
        }
    });
}
  
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;

    getBooksByAuthor(author)
        .then(filteredBooks => {
            res.status(200).json(filteredBooks);
        })
        .catch(error => {
            res.status(404).json({ message: 'No books found for the author' });
        });
});

// Function to get books based on title
function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        const filteredBooks = {};
        for (let bookId in books) {
            if (books[bookId].title === title) {
                filteredBooks[bookId] = books[bookId];
            }
        }

        if (Object.keys(filteredBooks).length > 0) {
            resolve(filteredBooks);
        } else {
            reject(new Error('No books found with the specified title'));
        }
    });
}

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;

    getBooksByTitle(title)
        .then(filteredBooks => {
            res.status(200).json(filteredBooks);
        })
        .catch(error => {
            res.status(404).json({ message: 'No books found with the specified title' });
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews);
});

module.exports.general = public_users;
