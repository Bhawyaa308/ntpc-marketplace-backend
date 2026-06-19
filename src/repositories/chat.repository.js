const { pool } = require('../config/db');

async function getListingById(listing_id) {
  const { rows } = await pool.query(
    `SELECT listing_id, seller_id
     FROM listings
     WHERE listing_id = $1
     LIMIT 1`,
    [listing_id]
  );

  return rows[0];
}

async function findOrCreateChatRoom(listing_id, buyer_id, seller_id) {
  const { rows } = await pool.query(
    `SELECT room_id, listing_id, buyer_id, seller_id, last_message_at, is_active, created_at
     FROM chat_rooms
     WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3
     LIMIT 1`,
    [listing_id, buyer_id, seller_id]
  );

  if (rows.length > 0) {
    return rows[0];
  }

  // Create new room
  const createResult = await pool.query(
    `INSERT INTO chat_rooms (listing_id, buyer_id, seller_id, is_active, created_at)
     VALUES ($1, $2, $3, TRUE, NOW())
     RETURNING room_id, listing_id, buyer_id, seller_id, last_message_at, is_active, created_at`,
    [listing_id, buyer_id, seller_id]
  );

  return createResult.rows[0];
}

async function getChatRoomById(room_id) {
  const { rows } = await pool.query(
    `SELECT room_id, listing_id, buyer_id, seller_id, last_message_at, is_active, created_at
     FROM chat_rooms
     WHERE room_id = $1
     LIMIT 1`,
    [room_id]
  );

  return rows[0];
}

async function getUserChatRooms(user_id) {
  const { rows } = await pool.query(
    `SELECT 
       cr.room_id,
       cr.listing_id,
       cr.buyer_id,
       cr.seller_id,
       cr.last_message_at,
       cr.is_active,
       cr.created_at,
       l.title AS listing_title,
       CASE 
         WHEN cr.buyer_id = $1 THEN cr.seller_id 
         ELSE cr.buyer_id 
       END AS other_participant_id,
       m.message AS last_message,
       m.created_at AS last_message_timestamp
     FROM chat_rooms cr
     JOIN listings l ON l.listing_id = cr.listing_id
     LEFT JOIN messages m ON m.message_id = (
       SELECT message_id FROM messages 
       WHERE room_id = cr.room_id 
       ORDER BY created_at DESC 
       LIMIT 1
     )
     WHERE cr.buyer_id = $1 OR cr.seller_id = $1
     ORDER BY cr.last_message_at DESC NULLS LAST`,
    [user_id]
  );

  return rows;
}

async function getRoomMessages(room_id) {
  const { rows } = await pool.query(
    `SELECT message_id, room_id, sender_id, message, created_at
     FROM messages
     WHERE room_id = $1
     ORDER BY created_at ASC`,
    [room_id]
  );

  return rows;
}

async function createMessage(room_id, sender_id, message_text) {
  const { rows } = await pool.query(
    `INSERT INTO messages (room_id, sender_id, message, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING message_id, room_id, sender_id, message, created_at`,
    [room_id, sender_id, message_text]
  );

  return rows[0];
}

async function updateRoomLastMessage(room_id) {
  const { rows } = await pool.query(
    `UPDATE chat_rooms
     SET last_message_at = NOW()
     WHERE room_id = $1
     RETURNING room_id, listing_id, buyer_id, seller_id, last_message_at, is_active, created_at`,
    [room_id]
  );

  return rows[0];
}

module.exports = {
  getListingById,
  findOrCreateChatRoom,
  getChatRoomById,
  getUserChatRooms,
  getRoomMessages,
  createMessage,
  updateRoomLastMessage,
};
