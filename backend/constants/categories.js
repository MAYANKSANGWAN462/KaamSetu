const CATEGORY_TREE = {
  Construction: [
    'Mason', 'Helper', 'Plumber', 'Electrician',
    'Painter', 'Carpenter', 'Welder'
  ],
  Agriculture: [
    'Field Worker', 'Irrigation', 'Harvester',
    'Livestock Handler', 'Pesticide Sprayer'
  ],
  Household: [
    'Maid', 'Cook', 'Nanny', 'Driver',
    'Security Guard', 'Gardener'
  ],
  Technical: [
    'Mechanic', 'Electrician', 'AC Repair',
    'IT Support', 'Appliance Repair', 'CCTV Installer'
  ],
  Other: ['General Labour', 'Loader', 'Helper', 'Other']
};

const CATEGORY_SLUGS = Object.keys(CATEGORY_TREE);

const SUBCATEGORY_VALUES = Object.values(CATEGORY_TREE).flat();

const ALL_CATEGORIES_FLAT = [...new Set([...CATEGORY_SLUGS, ...SUBCATEGORY_VALUES])];

const SKILL_LIST = [...new Set(SUBCATEGORY_VALUES)];

const WAGE_UNITS = ['hourly', 'daily', 'job'];

const DISTANCE_OPTIONS_KM = [5, 10, 25, 50, 100];

const SORT_OPTIONS = ['distance', 'wage', 'rating', 'recent'];

function isValidCategory(name) {
  if (!name || typeof name !== 'string') return false;
  return ALL_CATEGORIES_FLAT.some(
    (c) => c.toLowerCase() === name.trim().toLowerCase()
  );
}

function isValidWageUnit(unit) {
  return WAGE_UNITS.includes(unit);
}

function subcategoriesFor(parentKey) {
  return CATEGORY_TREE[parentKey] || [];
}

module.exports = {
  CATEGORY_TREE,
  CATEGORY_SLUGS,
  SUBCATEGORY_VALUES,
  SKILL_LIST,
  ALL_CATEGORIES_FLAT,
  WAGE_UNITS,
  DISTANCE_OPTIONS_KM,
  SORT_OPTIONS,
  isValidCategory,
  isValidWageUnit,
  subcategoriesFor
};