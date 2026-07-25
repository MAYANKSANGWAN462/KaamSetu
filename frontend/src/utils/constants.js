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
// Covers all states/UTs — Tier 1, Tier 2, and key Tier 3 cities, sorted alphabetically.
export const INDIAN_CITIES = [
  'Adilabad', 'Agartala', 'Agra', 'Ahmedabad', 'Ahmednagar', 'Aizawl', 'Ajmer',
  'Akola', 'Aligarh', 'Allahabad', 'Alappuzha', 'Alwar', 'Ambala', 'Ambarnath',
  'Amravati', 'Amritsar', 'Anand', 'Anantapur', 'Anantnag', 'Arrah', 'Asansol',
  'Aurangabad',
  'Baddi', 'Bahadurgarh', 'Bahraich', 'Balasore', 'Balurghat', 'Banda',
  'Bangalore', 'Barabanki', 'Baramulla', 'Bardhaman', 'Bareilly', 'Bathinda',
  'Begusarai', 'Belagavi', 'Bellary', 'Berhampur', 'Bettiah', 'Bhagalpur',
  'Bharatpur', 'Bharuch', 'Bhavnagar', 'Bhilai', 'Bhilwara', 'Bhiwadi',
  'Bhiwani', 'Bhopal', 'Bhubaneswar', 'Bidar', 'Bikaner', 'Bilaspur', 'Bijapur',
  'Bokaro', 'Brahmapur', 'Bulandshahr', 'Burhanpur',
  'Chandigarh', 'Charkhi Dadri', 'Chennai', 'Chhindwara', 'Coimbatore',
  'Cuttack',
  'Darbhanga', 'Davangere', 'Dehradun', 'Delhi', 'Deoghar', 'Dewas',
  'Dhanbad', 'Dharamsala', 'Dhule', 'Dibrugarh', 'Dimapur', 'Durg', 'Durgapur',
  'Dwarka',
  'Eluru', 'Erode',
  'Faridabad', 'Faizabad', 'Firozabad',
  'Gandhinagar', 'Gangtok', 'Gaya', 'Ghaziabad', 'Giridih', 'Gorakhpur',
  'Gulbarga', 'Guntur', 'Gurugram', 'Guwahati', 'Gwalior',
  'Haldwani', 'Haldia', 'Hamirpur', 'Hanumangarh', 'Haridwar', 'Hassan',
  'Hazaribagh', 'Hisar', 'Hospet', 'Hoshiarpur', 'Hosur', 'Howrah', 'Hubli',
  'Hyderabad',
  'Imphal', 'Indore', 'Itanagar',
  'Jabalpur', 'Jaipur', 'Jalandhar', 'Jalgaon', 'Jammu', 'Jamnagar',
  'Jamshedpur', 'Jhansi', 'Jodhpur', 'Jorhat', 'Junagadh',
  'Kadapa', 'Kakinada', 'Kalaburagi', 'Kalyani', 'Kamarhati', 'Kannur',
  'Kanpur', 'Karimnagar', 'Karnal', 'Kashipur', 'Karur', 'Khammam',
  'Kharagpur', 'Kochi', 'Kohima', 'Kolhapur', 'Kolkata', 'Korba', 'Kota',
  'Kottayam', 'Kozhikode', 'Kurnool', 'Kurukshetra',
  'Latur', 'Leh', 'Lucknow', 'Ludhiana',
  'Machilipatnam', 'Madurai', 'Malegaon', 'Malda', 'Malappuram', 'Mandi',
  'Mangalore', 'Mathura', 'Meerut', 'Mirzapur', 'Moradabad', 'Mohali', 'Moga',
  'Morbi', 'Mumbai', 'Muzaffarnagar', 'Muzaffarpur', 'Mysore',
  'Nadiad', 'Nagercoil', 'Nagaon', 'Nagpur', 'Nalgonda', 'Nanded', 'Nashik',
  'Nellore', 'New Delhi', 'Nizamabad', 'Noida',
  'Ongole',
  'Palakkad', 'Palghar', 'Pali', 'Panaji', 'Panchkula', 'Panipat',
  'Panvel', 'Pathankot', 'Patiala', 'Patna', 'Pimpri-Chinchwad', 'Proddatur',
  'Puducherry', 'Pune', 'Puri', 'Purnia',
  'Rajahmundry', 'Raipur', 'Rajkot', 'Ramagundam', 'Rampur', 'Ranchi',
  'Rewa', 'Rewari', 'Rishikesh', 'Rohtak', 'Rohini', 'Roorkee', 'Rourkela',
  'Sagar', 'Saharanpur', 'Salem', 'Sambalpur', 'Sangli', 'Satna', 'Shahjahanpur',
  'Shillong', 'Shimla', 'Shimoga', 'Sikar', 'Silchar', 'Siliguri', 'Sirsa',
  'Sitapur', 'Solapur', 'Solan', 'Sonipat', 'Sopore', 'Srinagar', 'Surat',
  'Tezpur', 'Thane', 'Thiruvananthapuram', 'Thoothukudi', 'Thrissur',
  'Tiruchirappalli', 'Tirunelveli', 'Tirupur', 'Tirupati', 'Tonk', 'Tumkur',
  'Udaipur', 'Udupi', 'Ujjain',
  'Vadodara', 'Varanasi', 'Vasco da Gama', 'Vellore', 'Vijayawada',
  'Vijayapura', 'Visakhapatnam',
  'Warangal',
  'Yamunanagar',
]

export const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'wage', label: 'Highest Pay' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'recent', label: 'Most Recent' },
]

export const DISTANCE_OPTIONS = [5, 10, 25, 50, 100]