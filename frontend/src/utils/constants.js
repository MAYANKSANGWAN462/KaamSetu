// Purpose: Stores shared UI constants for roles, category taxonomy, and pricing presets.
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
}

export const JOB_CATEGORY_GROUPS = [
  {
    group: 'Construction',
    options: [
      { value: 'Mason', label: 'Mason' },
      { value: 'Helper', label: 'Helper' },
      { value: 'Electrician', label: 'Electrician' },
    ]
  },
  {
    group: 'Agriculture',
    options: [
      { value: 'Field Worker', label: 'Field Worker' },
      { value: 'Harvester', label: 'Harvester' }
    ]
  },
  {
    group: 'Household',
    options: [
      { value: 'Maid', label: 'Maid' },
      { value: 'Cook', label: 'Cook' }
    ]
  },
  {
    group: 'Technical',
    options: [
      { value: 'Mechanic', label: 'Mechanic' },
      { value: 'IT Support', label: 'IT Support' }
    ]
  },
  {
    group: 'Other',
    options: [
      { value: 'Other', label: 'Other' }
    ]
  }
]

export const JOB_CATEGORIES = JOB_CATEGORY_GROUPS.flatMap((categoryGroup) => categoryGroup.options)

export const PRICE_PRESETS = [300, 500, 800, 1000]

export const AVAILABILITY_STATUS = [
  { value: 'available', label: 'Available Today' },
  { value: 'tomorrow', label: 'Available Tomorrow' },
  { value: 'busy', label: 'Busy' }
]

export const JOB_STATUS = {
  OPEN: 'open',
  FILLED: 'filled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const SKILL_LIST = [
  'Masonry', 'Plastering', 'Tiling', 'Welding', 'Carpentry', 'Plumbing',
  'Electrical Wiring', 'Painting', 'Roofing', 'Scaffolding',
  'Driving', 'Delivery', 'Loading', 'Forklift Operation',
  'Cooking', 'Cleaning', 'Housekeeping', 'Childcare', 'Elderly Care',
  'Farming', 'Harvesting', 'Irrigation', 'Pesticide Application',
  'Mechanic', 'AC Repair', 'Mobile Repair', 'IT Support',
  'Security', 'Tailoring', 'Embroidery', 'Screen Printing',
  'Event Setup', 'Photography Assistant', 'Packaging', 'Data Entry'
]

export const WAGE_UNITS = ['hourly', 'daily', 'per job']

export const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'wage', label: 'Highest Pay' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'recent', label: 'Most Recent' },
]

export const DISTANCE_OPTIONS = [5, 10, 25, 50, 100]