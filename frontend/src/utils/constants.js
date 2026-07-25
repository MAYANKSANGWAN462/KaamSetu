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
  'Akola', 'Alappuzha', 'Aligarh', 'Allahabad', 'Almora', 'Alwar', 'Ambala',
  'Ambarnath', 'Amravati', 'Amreli', 'Amritsar', 'Anand', 'Anantapur', 'Anantnag',
  'Angul', 'Arrah', 'Asansol', 'Aurangabad', 'Azamgarh',
  'Baddi', 'Bagalkot', 'Bahadurgarh', 'Bahraich', 'Balasore', 'Ballia',
  'Balurghat', 'Banda', 'Bangalore', 'Bankura', 'Barabanki', 'Baramulla',
  'Bardhaman', 'Bareilly', 'Baripada', 'Barmer', 'Basti', 'Bathinda',
  'Begusarai', 'Belagavi', 'Bellary', 'Berhampur', 'Betul', 'Bettiah', 'Bhagalpur',
  'Bhadrak', 'Bharatpur', 'Bharuch', 'Bhavnagar', 'Bhilai', 'Bhilwara', 'Bhind',
  'Bhiwadi', 'Bhiwani', 'Bhopal', 'Bhubaneswar', 'Bidar', 'Bijapur', 'Bikaner',
  'Bilaspur', 'Bokaro', 'Bongaigaon', 'Brahmapur', 'Bulandshahr', 'Bundi',
  'Burhanpur', 'Buxar',
  'Chamba', 'Chandigarh', 'Chandrapur', 'Chapra', 'Charkhi Dadri',
  'Chengalpattu', 'Chennai', 'Chhatarpur', 'Chhindwara', 'Chitradurga',
  'Chittorgarh', 'Churachandpur', 'Churu', 'Coimbatore', 'Cooch Behar', 'Cuttack',
  'Darbhanga', 'Darjeeling', 'Davangere', 'Dehradun', 'Delhi', 'Deoghar', 'Dewas',
  'Dhanbad', 'Dharamsala', 'Dharmapuri', 'Dharwad', 'Dhubri', 'Dhule',
  'Dibrugarh', 'Dimapur', 'Dindigul', 'Dumka', 'Dungarpur', 'Durg', 'Durgapur',
  'Dwarka',
  'Eluru', 'Erode', 'Etah', 'Etawah',
  'Faizabad', 'Faridabad', 'Faridkot', 'Ferozepur', 'Firozabad',
  'Gadag', 'Gandhinagar', 'Gangtok', 'Gaya', 'Ghaziabad', 'Ghazipur', 'Giridih',
  'Goalpara', 'Golaghat', 'Gorakhpur', 'Gulbarga', 'Guna', 'Guntur',
  'Gurdaspur', 'Gurugram', 'Guwahati', 'Gwalior',
  'Hajipur', 'Haldwani', 'Haldia', 'Hamirpur', 'Hanumangarh', 'Hardoi',
  'Haridwar', 'Hassan', 'Hazaribagh', 'Hisar', 'Hospet', 'Hoshangabad',
  'Hoshiarpur', 'Hosur', 'Howrah', 'Hubli', 'Hyderabad',
  'Imphal', 'Indore', 'Itanagar',
  'Jabalpur', 'Jagdalpur', 'Jaipur', 'Jaisalmer', 'Jalandhar', 'Jalgaon',
  'Jalpaiguri', 'Jammu', 'Jamnagar', 'Jamshedpur', 'Jaunpur', 'Jhajjar',
  'Jharsuguda', 'Jhansi', 'Jhunjhunu', 'Jind', 'Jodhpur', 'Jorhat', 'Junagadh',
  'Kadapa', 'Kaithal', 'Kakinada', 'Kalaburagi', 'Kalyani', 'Kamarhati',
  'Kangra', 'Kannauj', 'Kannur', 'Kanpur', 'Kapurthala', 'Karimnagar',
  'Karimganj', 'Karnal', 'Karur', 'Kashipur', 'Kasaragod', 'Khammam',
  'Kharagpur', 'Khargone', 'Kishanganj', 'Kochi', 'Kohima', 'Kokrajhar',
  'Kolar', 'Kolhapur', 'Kolkata', 'Koppal', 'Korba', 'Kota', 'Kottayam',
  'Kozhikode', 'Krishnanagar', 'Kurnool', 'Kurukshetra',
  'Lakhimpur', 'Latur', 'Leh', 'Lucknow', 'Ludhiana', 'Lunglei',
  'Machilipatnam', 'Madurai', 'Mainpuri', 'Malegaon', 'Malappuram', 'Malda',
  'Mandi', 'Mandya', 'Mangalore', 'Mathura', 'Mau', 'Meerut', 'Mehsana',
  'Mirzapur', 'Mohali', 'Moga', 'Mokokchung', 'Morbi', 'Morena', 'Moradabad',
  'Muktsar', 'Mumbai', 'Munger', 'Murshidabad', 'Muzaffarnagar', 'Muzaffarpur',
  'Mysore',
  'Nadiad', 'Nagaon', 'Nagaur', 'Nagercoil', 'Nagpur', 'Nalgonda', 'Nalanda',
  'Namakkal', 'Namchi', 'Nanded', 'Nashik', 'Navi Mumbai', 'Navsari', 'Nawada',
  'Nellore', 'New Delhi', 'Nizamabad', 'Noida', 'Nuh',
  'Ongole', 'Ooty', 'Osmanabad',
  'Palakkad', 'Palghar', 'Pali', 'Palamu', 'Palwal', 'Panaji', 'Panchkula',
  'Panipat', 'Panvel', 'Pathankot', 'Pathanamthitta', 'Patiala', 'Patna',
  'Pimpri-Chinchwad', 'Pithoragarh', 'Porbandar', 'Port Blair', 'Pratapgarh',
  'Proddatur', 'Puducherry', 'Pune', 'Puri', 'Purnia',
  'Rae Bareli', 'Raichur', 'Raigarh', 'Raiganj', 'Rajahmundry', 'Raipur',
  'Rajkot', 'Rajnandgaon', 'Ramagundam', 'Rampur', 'Ranchi', 'Ratlam',
  'Ratnagiri', 'Rewa', 'Rewari', 'Rishikesh', 'Rohini', 'Rohtak', 'Roorkee',
  'Rourkela', 'Rudrapur', 'Rupnagar',
  'Sagar', 'Saharanpur', 'Salem', 'Samastipur', 'Sambalpur', 'Sangli',
  'Sangrur', 'Satna', 'Sawai Madhopur', 'Sehore', 'Senapati', 'Shahjahanpur',
  'Shillong', 'Shimla', 'Shimoga', 'Shivpuri', 'Sikar', 'Silchar', 'Siliguri',
  'Silvassa', 'Singrauli', 'Sirsa', 'Sitapur', 'Sivakasi', 'Siwan', 'Solan',
  'Solapur', 'Sonipat', 'Sopore', 'Sri Ganganagar', 'Srinagar', 'Sultanpur',
  'Surendranagar', 'Surat',
  'Tehri', 'Tezpur', 'Thane', 'Thanjavur', 'Thiruvananthapuram', 'Thoothukudi',
  'Thrissur', 'Tiruchirappalli', 'Tirunelveli', 'Tiruvallur', 'Tirupur',
  'Tirupati', 'Tiruvannamalai', 'Tinsukia', 'Tonk', 'Tumkur', 'Tura',
  'Udaipur', 'Udupi', 'Ujjain', 'Una', 'Unnao', 'Uttarkashi',
  'Vadodara', 'Vapi', 'Varanasi', 'Vasco da Gama', 'Vellore', 'Vidisha',
  'Vijayawada', 'Vijayapura', 'Villupuram', 'Virudhunagar', 'Visakhapatnam',
  'Wardha', 'Warangal', 'Wayanad',
  'Yamunanagar', 'Yavatmal',
]

export const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'wage', label: 'Highest Pay' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'recent', label: 'Most Recent' },
]

export const DISTANCE_OPTIONS = [5, 10, 25, 50, 100]