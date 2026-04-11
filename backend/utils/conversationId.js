/**
 * One conversation id formula for the whole stack: sorted user ObjectIds as strings.
 */
function makeConversationId(userIdA, userIdB) {
  return [String(userIdA), String(userIdB)].sort().join('_');
}

module.exports = { makeConversationId };
