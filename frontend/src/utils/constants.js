// Purpose: Stores shared UI constants for roles, category taxonomy, and pricing presets.
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
}

// NOTE: values must stay in sync with the backend category tree
// (backend/constants/categories.js) — createJob/updateProfile reject any
// category not in that list. Labels are display-only.
export const JOB_CATEGORY_GROUPS = [
  {
    group: 'Construction',
    options: [
      { value: 'Mason', label: 'Mason' },
      { value: 'Helper', label: 'Helper' },
      { value: 'Plumber', label: 'Plumber' },
      { value: 'Electrician', label: 'Electrician' },
      { value: 'Painter', label: 'Painter' },
      { value: 'Carpenter', label: 'Carpenter' },
      { value: 'Welder', label: 'Welder' },
    ]
  },
  {
    group: 'Agriculture',
    options: [
      { value: 'Field Worker', label: 'Field Worker' },
      { value: 'Irrigation', label: 'Irrigation' },
      { value: 'Harvester', label: 'Harvester' },
      { value: 'Livestock Handler', label: 'Livestock Handler' },
      { value: 'Pesticide Sprayer', label: 'Pesticide Sprayer' },
    ]
  },
  {
    group: 'Household',
    options: [
      { value: 'Maid', label: 'House Help' },
      { value: 'Cook', label: 'Cook' },
      { value: 'Nanny', label: 'Nanny' },
      { value: 'Driver', label: 'Driver' },
      { value: 'Security Guard', label: 'Security Guard' },
      { value: 'Gardener', label: 'Gardener' },
    ]
  },
  {
    group: 'Technical',
    options: [
      { value: 'Mechanic', label: 'Mechanic' },
      { value: 'AC Repair', label: 'AC Repair' },
      { value: 'IT Support', label: 'IT Support' },
      { value: 'Appliance Repair', label: 'Appliance Repair' },
      { value: 'CCTV Installer', label: 'CCTV Installer' },
    ]
  },
  {
    group: 'Other',
    options: [
      { value: 'General Labour', label: 'General Labour' },
      { value: 'Loader', label: 'Loader' },
      { value: 'Other', label: 'Other' },
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

// Common blue-collar work types offered as quick-pick suggestion chips.
// `value` must be a backend-valid category (see JOB_CATEGORY_GROUPS); `label`
// is the friendly text shown on the chip.
export const WORK_TYPES = [
  { value: 'Helper', label: 'Construction Helper' },
  { value: 'Driver', label: 'Driver' },
  { value: 'Electrician', label: 'Electrician' },
  { value: 'Maid', label: 'House Help' },
  { value: 'Field Worker', label: 'Agriculture Worker' },
  { value: 'Plumber', label: 'Plumber' },
  { value: 'Painter', label: 'Painter' },
  { value: 'Mason', label: 'Mason' },
  { value: 'Cook', label: 'Cook' },
  { value: 'Security Guard', label: 'Security Guard' },
  { value: 'Carpenter', label: 'Carpenter' },
  { value: 'Welder', label: 'Welder' },
  { value: 'Mechanic', label: 'Mechanic' },
  { value: 'Loader', label: 'Loader' },
  { value: 'Other', label: 'Other' },
]

// Indian cities used for the location autocomplete suggestions.
// Sorted alphabetically so "Char…" surfaces Chandigarh / Charkhi Dadri together.
export const INDIAN_CITIES = [
  'Agra', 'Ahmedabad', 'Ajmer', 'Aligarh', 'Allahabad', 'Amritsar', 'Aurangabad',
  'Bangalore', 'Bareilly', 'Bhopal', 'Bhubaneswar', 'Bikaner',
  'Chandigarh', 'Charkhi Dadri', 'Chennai', 'Coimbatore', 'Cuttack',
  'Dehradun', 'Delhi', 'Dhanbad', 'Durgapur',
  'Faridabad', 'Firozabad',
  'Ghaziabad', 'Gurugram', 'Guwahati', 'Gwalior',
  'Hisar', 'Howrah', 'Hubli', 'Hyderabad',
  'Indore',
  'Jabalpur', 'Jaipur', 'Jalandhar', 'Jammu', 'Jamshedpur', 'Jhansi', 'Jodhpur',
  'Kanpur', 'Karnal', 'Kochi', 'Kolkata', 'Kota', 'Kurukshetra',
  'Lucknow', 'Ludhiana',
  'Madurai', 'Meerut', 'Mumbai', 'Mysore',
  'Nagpur', 'Nashik', 'Noida',
  'Panipat', 'Patiala', 'Patna', 'Pune',
  'Raipur', 'Rajkot', 'Ranchi', 'Rohtak',
  'Salem', 'Shimla', 'Siliguri', 'Solapur', 'Sonipat', 'Srinagar', 'Surat',
  'Thane', 'Thiruvananthapuram', 'Tiruchirappalli',
  'Udaipur', 'Ujjain',
  'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam',
  'Warangal',
]

export const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'wage', label: 'Highest Pay' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'recent', label: 'Most Recent' },
]

export const DISTANCE_OPTIONS = [5, 10, 25, 50, 100]