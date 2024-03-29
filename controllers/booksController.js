const Book = require("../models/Book");

// Create a new book
async function createBook(req, res) {
  try {
    const { title, rating, heardOfBefore } = req.body;

    const book = new Book({
      title,
      rating,
      heardOfBefore,
    });

    await book.save();

    res.status(201).json({ message: "Book created successfully", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create book" });
  }
}

// Get a list of books
async function getBooks(req, res) {
  try {
    const books = await Book.find().sort({ rating: -1, heardOfBefore: -1 });

    res.status(200).json({ books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
}

// Rate a book
async function rateBook(req, res) {
  try {
    const { bookId } = req.params;
    const { rating } = req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $set: { rating } },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Book rating updated successfully", book: updatedBook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update book rating" });
  }
}

module.exports = {
  createBook,
  getBooks,
  rateBook,
};
