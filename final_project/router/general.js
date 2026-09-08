const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered" });
});

// Task 10: Get the book list available in the shop using async/Promise
public_users.get('/', async function (req, res) {
    try {
        const allBooks = await new Promise((resolve, reject) => {
            if (books) {
                resolve(books);
            } else {
                reject(new Error("No books available"));
            }
        });
        return res.status(200).json(allBooks);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Task 11: Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject(new Error("Book not found"));
            }
        });
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
});

// Task 12: Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchingBooks = await new Promise((resolve, reject) => {
            const results = Object.entries(books)
                .filter(([, book]) => book.author.toLowerCase() === author.toLowerCase())
                .reduce((acc, [isbn, book]) => {
                    acc[isbn] = book;
                    return acc;
                }, {});

            if (Object.keys(results).length > 0) {
                resolve(results);
            } else {
                reject(new Error("No books found for this author"));
            }
        });
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
});

// Task 13: Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const matchingBooks = await new Promise((resolve, reject) => {
            const results = Object.entries(books)
                .filter(([, book]) => book.title.toLowerCase() === title.toLowerCase())
                .reduce((acc, [isbn, book]) => {
                    acc[isbn] = book;
                    return acc;
                }, {});

            if (Object.keys(results).length > 0) {
                resolve(results);
            } else {
                reject(new Error("No books found for this title"));
            }
        });
        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
