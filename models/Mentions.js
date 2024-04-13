const db = require("../db"); // Import the PostgreSQL connection pool

const Mentions = {
  // Add mention to the database
  addMention: async (user_id, book_id, mentioned) => {
    try {
      const query = `
        INSERT INTO Mentions (user_id, book_id, mentioned)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, book_id)
        DO UPDATE SET mentioned = EXCLUDED.mentioned
        RETURNING *;
      `;

      const values = [user_id, book_id, mentioned];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Error adding or updating mention:", error);
      throw error;
    }
  },

  // Check if user has already mentioned a book
  checkMention: async (user_id, book_id) => {
    try {
      const query = `
        SELECT mentioned FROM Mentions
        WHERE user_id = $1 AND book_id = $2;
      `;

      const values = [user_id, book_id];
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return null; // No mention found
      }

      return result.rows[0].mentioned;
    } catch (error) {
      console.error("Failed to check mention:", error);
      throw error;
    }
  },

  // Retrieve mentions for user
  getMentionsForUser: async (user_id) => {
    try {
      const query = `
        SELECT * FROM Mentions
        WHERE user_id = $1;
      `;

      const result = await db.query(query, [user_id]);

      return result.rows;
    } catch (error) {
      console.error("Failed to fetch mentions for user:", error);
      throw error;
    }
  },

  // Retrieve not mentioned books for user
  getNotMentionedBooks: async (userId) => {
    try {
      const query = `
        SELECT books.*
        FROM books
        LEFT JOIN mentions ON books.book_id = mentions.book_id AND mentions.user_id = $1
        WHERE mentions.mentioned IS NULL;
      `;
      const values = [userId];

      const { rows } = await db.query(query, values);
      return rows;
    } catch (error) {
      console.error("Error fetching books not mentioned by the user:", error);
      throw error;
    }
  },

  // Retrieve not heard before books for user
  getNotHeardBeforeBooks: async (userId) => {
    try {
      const query = `
        SELECT books.*
        FROM books
        LEFT JOIN mentions ON books.book_id = mentions.book_id AND mentions.user_id = $1
        WHERE mentions.mentioned IS false;
      `;
      const values = [userId];

      const { rows } = await db.query(query, values);
      return rows;
    } catch (error) {
      console.error(
        "Error fetching books not heard before by the user:",
        error
      );
      throw error;
    }
  },

  // Retrieve not heard before count for the user
  getNotHeardBeforeCount: async (book_id) => {
    try {
      const query = `
        SELECT COUNT(DISTINCT user_id) AS count
        FROM mentions
        WHERE book_id = $1 AND mentioned = false;
      `;

      const result = await db.query(query, [book_id]);
      return result.rows[0].count;
    } catch (error) {
      throw error;
    }
  },

  // Retrieve heard but not rated count
  getHeardNotRatedCount: async (book_id) => {
    try {
      const query = `
        SELECT COUNT(DISTINCT m.user_id) AS count
        FROM mentions m
        LEFT JOIN ratings r ON m.user_id = r.user_id AND m.book_id = r.book_id
        WHERE m.book_id = $1 AND r.rating IS NULL;
      `;

      const values = [book_id];
      const result = await db.query(query, values);
      return result.rows[0].count;
    } catch (error) {
      throw error;
    }
  },

  // Delete mentions associate with user
  delete: async (userId) => {
    try {
      const query = "DELETE FROM mentions WHERE user_id = $1";
      const values = [userId];
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Mentions;
