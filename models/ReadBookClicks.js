const db = require("../db"); // Import your database connection

const ReadBookClicks = {
  // Count read book clicks
  create: (user_id, book_id) => {
    return db.query(
      "INSERT INTO Read_Book_Clicks (user_id, book_id, click) VALUES ($1, $2, true) RETURNING *",
      [user_id, book_id]
    );
  },

  // Delete read book clicks associate with user
  delete: async (userId) => {
    try {
      const query = "DELETE FROM read_book_clicks WHERE user_id = $1";
      const values = [userId];
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = ReadBookClicks;
