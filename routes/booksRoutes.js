const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const config = require("../config");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email,
    pass: config.password,
  },
});

// Route to check if a book already exists
router.get("/checkbook", async (req, res) => {
  try {
    const { title, author } = req.query;

    // Find a book with the same title and author in the database
    const existingBook = await Book.findByTitleAndAuthor(title, author);

    if (existingBook) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to check if the book exists" });
  }
});

// Route to create a new book and send email for review
router.post("/reviewbook", authMiddleware, async (req, res) => {
  try {
    const { title, author, description } = req.body;
    const user = req.user;

    // Create a new book object
    const book = { title, author, description };

    // Send email for review with user's email address
    await sendReviewEmail(book, user);

    res.status(201).json({ message: "Book details sent for review" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send book details for review" });
  }
});

// Function to send review email
async function sendReviewEmail(book, user) {
  try {
    // Convert title and description to lowercase, and replace spaces with dashes
    const formattedTitle = encodeURIComponent(
      book.title.toLowerCase().replace(/\s+/g, "-")
    );

    const formattedAuthor = encodeURIComponent(
      book.author.toLowerCase().replace(/\s+/g, "-")
    );

    const formattedDescription = encodeURIComponent(
      book.description.toLowerCase().replace(/\s+/g, "-")
    );

    // Email content
    const emailContent = `
      User Details:
      User ID: ${user.user_id}

      Book Details:
      Title: ${book.title}
      Author: ${book.author}
      Description: ${book.description}

      Master Add Book:
      https://www.undervaluedbooks.com/master/addbook/${formattedTitle}/${formattedAuthor}/${formattedDescription}/${user.user_id}
    `;

    // Email options
    const mailOptions = {
      from: config.email,
      to: config.email,
      subject: "Book Review Request",
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending review email:", error);
    throw new Error("Failed to send review email");
  }
}

// Route to reject book details submitted by a user
router.post("/reject", authMiddleware, async (req, res) => {
  try {
    const { title, author, userId } = req.body;

    // Retrieving Master User's details
    const masterUser = req.user;

    // Format the title: make the first letter of each word uppercase and replace dashes with spaces
    const formattedTitle = title
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Making sure the userId from the input form is an integer
    const user_id = parseInt(userId, 10);

    // Fetch user details from the database using user_id
    const user = await User.findByUserId(user_id);

    // Throw error if user is not found
    if (!user) {
      throw new Error("User not found for the given user_id.");
    }

    if (masterUser.user_id === 1) {
      // Send rejection email to the user
      await sendRejectionEmail(
        user.email,
        user.username,
        formattedTitle,
        author
      );

      res
        .status(200)
        .json({ message: `${formattedTitle} rejected successfully` });
    } else {
      console.error("Not Master User!");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reject book" });
  }
});

// Function to send rejection email to the user
async function sendRejectionEmail(userEmail, username, bookTitle, author) {
  try {
    // Email content
    const emailContent = `
      Hi ${username},

      Your book submission for "${bookTitle} by ${author}" has been rejected.

      If you have any questions or concerns, please contact us.

      Sincerely,
      Undervalued Books
    `;

    // Email options
    const mailOptions = {
      from: config.email,
      to: userEmail,
      subject: "Book Submission Rejected",
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw new Error("Failed to send rejection email");
  }
}

// Route to approve book details
router.post("/addbook", authMiddleware, async (req, res) => {
  try {
    const { title, author, description, readBook, userId } = req.body;

    // Retrieving Master User's details
    const masterUser = req.user;

    // Convert title to lowercase, and replace spaces with dashes
    const formattedTitle = encodeURIComponent(
      title.toLowerCase().replace(/\s+/g, "-")
    );

    // Making sure the userId from the input form is an integer
    const user_id = parseInt(userId, 10);

    // Fetch user details from the database using user_id
    const user = await User.findByUserId(user_id);

    if (!user) {
      throw new Error("User not found for the given user_id.");
    }

    if (masterUser.user_id === 1) {
      // Add book to the database
      await Book.create(title, author, description, readBook);

      // Send approval email to the user
      await sendApprovalEmail(
        user.email,
        user.username,
        title,
        formattedTitle,
        author
      );

      res.status(200).json({
        message: `Book "${title}" approved and added to the database`,
      });
    } else {
      console.error("Not Master User!");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Function to send approval email to the user
async function sendApprovalEmail(
  userEmail,
  username,
  bookTitle,
  formattedBookTitle,
  author
) {
  try {
    // Email content
    const emailContent = `
      Dear ${username},

      Your book submission for "${bookTitle} by ${author}" has been approved. You can view your submission here: https://www.undervaluedbooks.com/books/${formattedBookTitle}

      Thank you for your contribution!

      Sincerely,
      Undervalued Books
    `;

    // Email options
    const mailOptions = {
      from: config.email,
      to: userEmail,
      subject: "Book Submission Approved",
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending approval email:", error);
    throw new Error("Failed to send approval email");
  }
}

// Route to get a list of books
router.get("/allbooks", async (req, res) => {
  try {
    // Fetch all books from the database
    const books = await Book.getAll();

    res.status(200).json({ books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.get("/bookdetails", async (req, res) => {
  try {
    const { title } = req.query;

    // Fetch book details from the database based on title
    const book = await Book.getByTitle(title);

    if (book) {
      res.status(200).json({ book });
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch book details" });
  }
});

module.exports = router;
