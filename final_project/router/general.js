const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Helper route serving raw books data for Axios calls
public_users.get('/booksdata', (req, res) => {
  return res.status(200).json(books);
});

// Task 10: Get the book list available in the shop using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/booksdata');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books list", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get('http://localhost:5000/booksdata');
    const allBooks = response.data;
    if (allBooks[isbn]) {
      return res.status(200).send(JSON.stringify(allBooks[isbn], null, 4));
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book by ISBN", error: error.message });
  }
});

// Task 12: Get book details based on author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get('http://localhost:5000/booksdata');
    const allBooks = response.data;
    const matchingBooks = [];

    Object.keys(allBooks).forEach((key) => {
      if (allBooks[key].author === author) {
        matchingBooks.push({
          isbn: key,
          title: allBooks[key].title,
          reviews: allBooks[key].reviews
        });
      }
    });

    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify({ booksbyauthor: matchingBooks }, null, 4));
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by author", error: error.message });
  }
});

// Task 13: Get all books based on title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get('http://localhost:5000/booksdata');
    const allBooks = response.data;
    const matchingBooks = [];

    Object.keys(allBooks).forEach((key) => {
      if (allBooks[key].title === title) {
        matchingBooks.push({
          isbn: key,
          author: allBooks[key].author,
          reviews: allBooks[key].reviews
        });
      }
    });

    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify({ booksbytitle: matchingBooks }, null, 4));
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by title", error: error.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
