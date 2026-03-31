// Purpose: Defines structured job and worker categories used across models and APIs.
const CATEGORY_TREE = {
  Construction: ['Mason', 'Helper', 'Electrician'],
  Agriculture: ['Field Worker', 'Harvester'],
  Household: ['Maid', 'Cook'],
  Technical: ['Mechanic', 'IT Support'],
  Other: ['Other']
};

const SUBCATEGORY_VALUES = Object.values(CATEGORY_TREE).flat();

module.exports = {
  CATEGORY_TREE,
  SUBCATEGORY_VALUES
};
