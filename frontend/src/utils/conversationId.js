/**
 * Same formula as backend: sorted string ids.
 */
export const makeConversationId = (id1, id2) => {
  return [String(id1), String(id2)].sort().join('_');
};
