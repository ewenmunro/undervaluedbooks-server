const express = require("express");
const router = express.Router();
const Mentions = require("../models/Mentions");
const authMiddleware = require("../middleware/authMiddleware");

// Route to check if a user has mentioned a book
router.get("/checkmentioned", async (req, res) => {
  try {
    const { user_id, book_id } = req.query;

    // Check if the user has mentioned the book in the database
    const hasMentioned = await Mentions.checkMention(user_id, book_id);

    res.status(200).json({ hasMentioned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to check mention status" });
  }
});

// Route to add or update a mention
router.post("/mentioned", authMiddleware, async (req, res) => {
  try {
    const { user_id, book_id, mentioned } = req.body;

    // Add or update a mention in the database
    const mention = await Mentions.addMention(user_id, book_id, mentioned);

    res
      .status(201)
      .json({ message: "Mention added/updated successfully", mention });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add/update mention" });
  }
});

// Get books not mentioned by the user
router.get("/not-mentioned", authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.user;
    const notMentionedBooks = await Mentions.getNotMentionedBooks(user_id);
    res.status(200).json({ books: notMentionedBooks });
  } catch (error) {
    console.error("Error fetching books not mentioned by the user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get books not heard before by the user
router.get("/not-heard-before", authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.user;
    const notHeardBeforeBooks = await Mentions.getNotHeardBeforeBooks(user_id);
    res.status(200).json({ books: notHeardBeforeBooks });
  } catch (error) {
    console.error("Error fetching books not heard before by the user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get the count of users who haven't heard of a book before visiting the site
router.get("/not-heard-before-count", async (req, res) => {
  try {
    const { book_id } = req.query;
    const notHeardBeforeCount = await Mentions.getNotHeardBeforeCount(book_id);
    res.status(200).json({ count: notHeardBeforeCount });
  } catch (error) {
    console.error(
      "Error fetching count of users who haven't heard before:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get the count of users who have heard of a book but not rated it
router.get("/heard-not-rated-count", async (req, res) => {
  try {
    const { book_id } = req.query;
    const heardNotRatedCount = await Mentions.getHeardNotRatedCount(book_id);
    res.status(200).json({ count: heardNotRatedCount });
  } catch (error) {
    console.error(
      "Error fetching count of users who have heard but not rated:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
