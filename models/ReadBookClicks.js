const db = require("../db"); // Import your database connection

const ReadBookClicks = {
  // Count read book clicks
  create: (user_id, book_id) => {
    return db.query(
      "INSERT INTO Read_Book_Clicks (user_id, book_id, click) VALUES ($1, $2, true) RETURNING *",
      [user_id, book_id]
    );
  },
};

module.exports = ReadBookClicks;
