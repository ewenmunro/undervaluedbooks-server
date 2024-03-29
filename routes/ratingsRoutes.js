const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");
const authMiddleware = require("../middleware/authMiddleware");

// Check if a user has already rated a book
router.get("/checkrating", async (req, res) => {
  try {
    const { user_id, book_id } = req.query;

    // Check if the user has already rated the book
    const existingRating = await Rating.findByUserAndBook(user_id, book_id);

    if (existingRating) {
      return res
        .status(200)
        .json({ rated: true, userRating: existingRating.rating });
    } else {
      return res.status(200).json({ rated: false });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to check if the user has rated the book" });
  }
});

// Rate a book
router.post("/rate", authMiddleware, async (req, res) => {
  try {
    const { user_id, book_id, rating } = req.body;

    // Create a new rating in the database
    const newRating = await Rating.create(user_id, book_id, rating);

    res
      .status(201)
      .json({ message: "Book rated successfully", rating: newRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to rate the book" });
  }
});

// Edit book rating for user
router.post("/edit", authMiddleware, async (req, res) => {
  try {
    const { user_id, book_id, rating } = req.body;

    // Edit the user's rating for the book in the database
    const updatedRating = await Rating.edit(user_id, book_id, rating);

    res.status(200).json({ message: "Rating updated successfully" });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get books not rated by the user
router.get("/not-rated", authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.user;
    const notRatedBooks = await Rating.getNotRatedBooks(user_id);
    res.status(200).json({ books: notRatedBooks });
  } catch (error) {
    console.error("Error fetching books not rated by the user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get the count of ratings for a specific book
router.get("/rating-count", async (req, res) => {
  try {
    const { book_id } = req.query;

    // Fetch the count of ratings for the specified book
    const ratingCount = await Rating.getRatingCountForBook(book_id);

    res.status(200).json({ count: ratingCount });
  } catch (error) {
    console.error("Error fetching rating count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get the sum total of ratings for a specific book
router.get("/sum-total", async (req, res) => {
  try {
    const { book_id } = req.query;

    // Fetch the sum total of ratings for the specified book from the database
    const sumTotal = await Rating.getSumTotalRatingForBook(book_id);

    res.status(200).json({ sum_total: sumTotal });
  } catch (error) {
    console.error("Error fetching sum total of ratings for the book:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
