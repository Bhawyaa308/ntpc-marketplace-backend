const { pool } = require('../config/db');

async function createListing({
  seller_id,
  category_id,
  township_id,
  title,
  description,
  price,
  condition,
  is_negotiable,
  status,
  view_count,
  expires_at,
  sold_at,
}) {
  const { rows } = await pool.query(
    `INSERT INTO listings (
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    RETURNING
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at`,
    [
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
    ]
  );

  return rows[0];
}

async function getActiveListings(page, limit) {
  const offset = (page - 1) * limit;

  const totalResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM listings
     WHERE status = 'ACTIVE'`
  );

  const { rows } = await pool.query(
    `SELECT
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at
    FROM listings
    WHERE status = 'ACTIVE'
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    data: rows,
    total: Number(totalResult.rows[0].total),
  };
}

async function findListingById(listing_id) {
  const { rows } = await pool.query(
    `SELECT
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at
    FROM listings
    WHERE listing_id = $1
    LIMIT 1`,
    [listing_id]
  );
  return rows[0];
}

async function incrementViewCount(listing_id) {
  const { rows } = await pool.query(
    `UPDATE listings
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE listing_id = $1
    RETURNING
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at`,
    [listing_id]
  );

  return rows[0];
}

async function updateListingById(listing_id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  if (!setClause) {
    return findListingById(listing_id);
  }

  const { rows } = await pool.query(
    `UPDATE listings
    SET ${setClause}, updated_at = NOW()
    WHERE listing_id = $${keys.length + 1}
    RETURNING
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at`,
    [...values, listing_id]
  );

  return rows[0];
}

async function expireListing(listing_id) {
  const { rows } = await pool.query(
    `UPDATE listings
    SET status = 'EXPIRED', updated_at = NOW()
    WHERE listing_id = $1
    RETURNING
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at`,
    [listing_id]
  );

  return rows[0];
}

async function updateListingToSold(listing_id) {
  const { rows } = await pool.query(
    `UPDATE listings
    SET status = 'SOLD', sold_at = NOW(), updated_at = NOW()
    WHERE listing_id = $1
    RETURNING
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at`,
    [listing_id]
  );

  return rows[0];
}

async function addListingImages(listing_id, imageUrls) {
  const { rows } = await pool.query(
    `UPDATE listings
     SET image_urls = image_urls || $2::jsonb
     WHERE listing_id = $1
     RETURNING listing_id, seller_id, category_id, township_id, title, description, price, condition, is_negotiable, status, view_count, image_urls, expires_at, sold_at, created_at, updated_at`,
    [listing_id, JSON.stringify(imageUrls)]
  );
  return rows[0];
}

async function removeListingImage(listing_id, imageUrl) {
  const { rows } = await pool.query(
    `UPDATE listings
     SET image_urls = image_urls - $2::text
     WHERE listing_id = $1
     RETURNING listing_id, seller_id, category_id, township_id, title, description, price, condition, is_negotiable, status, view_count, image_urls, expires_at, sold_at, created_at, updated_at`,
    [listing_id, imageUrl]
  );
  return rows[0];
}

async function getListingImages(listing_id) {
  const { rows } = await pool.query(
    `SELECT image_urls FROM listings WHERE listing_id = $1`,
    [listing_id]
  );
  return rows[0]?.image_urls || [];
}

module.exports = {
  createListing,
  getActiveListings,
  findListingById,
  incrementViewCount,
  updateListingById,
  expireListing,
  updateListingToSold,
  addListingImages,
  removeListingImage,
  getListingImages,
};
