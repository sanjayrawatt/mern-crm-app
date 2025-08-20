const Activity = require('../models/Activity');

/**
 * Logs an activity in the database.
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} type - The type of activity (e.g., 'UPDATE').
 * @param {string} description - The human-readable description of the activity.
 * @param {string} relatedToId - The ID of the record the activity is related to.
 * @param {string} relatedModelName - The model name of the related record.
 */
const logActivity = async (userId, type, description, relatedToId, relatedModelName) => {
  try {
    const activity = new Activity({
      user: userId,
      type: type,
      description: description,
      relatedTo: relatedToId,
      relatedModel: relatedModelName,
    });
    await activity.save();
    console.log(`Activity logged: ${description}`);
  } catch (error) {
    // In a real application, you might want more robust error handling here
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
