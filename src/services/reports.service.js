const reportsRepository = require('../repositories/reports.repository');
const listingsRepository = require('../repositories/listings.repository');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function createReport(user_id, payload) {
  const listing_id = payload.listing_id;
  const reason = payload.reason;

  if (!listing_id || isNaN(listing_id)) {
    throw createError(400, 'Valid listing_id is required');
  }

  if (!reason || typeof reason !== 'string' || reason.trim() === '') {
    throw createError(400, 'Reason is required');
  }

  const listing = await listingsRepository.findListingById(listing_id);
  if (!listing) {
    throw createError(404, 'Listing not found');
  }

  if (listing.seller_id === user_id) {
    throw createError(403, 'You cannot report your own listing');
  }

  const alreadyReported = await reportsRepository.checkDuplicateReport(user_id, listing_id);
  if (alreadyReported) {
    throw createError(400, 'You have already reported this listing');
  }

  const report = await reportsRepository.createReport(listing_id, user_id, reason);
  return report;
}

async function getReportsByUser(user_id) {
  return reportsRepository.getReportsByUser(user_id);
}

module.exports = {
  createReport,
  getReportsByUser,
};
