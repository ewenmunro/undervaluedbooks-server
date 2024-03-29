const db = require("../db"); // Import the PostgreSQL connection pool

const Book = {
  // Find a book by title and author
  findByTitleAndAuthor: async (title, author) => {
    try {
      const query = `
      SELECT * FROM books
      WHERE title = $1 AND author = $2;
    `;

      const values = [title, author];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find book by title and author:", error);
      throw error;
    }
  },

  // Add book to the database
  create: async (title, author, description, readBook) => {
    try {
      const query = `
        INSERT INTO books (title, author, description, read_book_link)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

      const values = [title, author, description, readBook];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to create book:", error);
      throw error;
    }
  },

  // Retrieve all books
  getAll: async () => {
    try {
      const query = `
        SELECT * FROM books;
      `;

      const result = await db.query(query);

      return result.rows;
    } catch (error) {
      console.error("Failed to fetch books:", error);
      throw error;
    }
  },

  // Get book details by title
  getByTitle: async (title) => {
    try {
      const query = {
        text: "SELECT * FROM books WHERE title = $1",
        values: [title],
      };

      const result = await db.query(query);

      // Return the first row if a book is found, otherwise return null
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error("Error fetching book details:", error);
      throw error;
    }
  },
};

module.exports = Book;
