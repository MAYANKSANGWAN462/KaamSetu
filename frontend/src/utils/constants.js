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
  'Ambarnath', 'Amravati', 'Amreli', 'Amritsar', 'Amroha', 'Anand', 'Anantapur',
  'Anantnag', 'Angul', 'Araria', 'Arrah', 'Asansol', 'Aurangabad', 'Auriya', 'Azamgarh',
  'Baddi', 'Bagalkot', 'Baghpat', 'Bahadurgarh', 'Bahraich', 'Balaghat', 'Balasore',
  'Ballia', 'Balurghat', 'Banda', 'Bangalore', 'Bankura', 'Banswara', 'Barabanki',
  'Baramulla', 'Baran', 'Bardhaman', 'Bareilly', 'Baripada', 'Barmer', 'Basti',
  'Bathinda', 'Begusarai', 'Belagavi', 'Bellary', 'Berhampur', 'Bettiah', 'Betul',
  'Bhagalpur', 'Bhadrak', 'Bhandara', 'Bharatpur', 'Bharuch', 'Bhavnagar', 'Bhilai',
  'Bhilwara', 'Bhind', 'Bhiwadi', 'Bhiwani', 'Bhopal', 'Bhubaneswar', 'Bidar',
  'Bijapur', 'Bijnor', 'Bikaner', 'Bilaspur', 'Bokaro', 'Bongaigaon', 'Brahmapur',
  'Bulandshahr', 'Buldhana', 'Bundi', 'Burhanpur', 'Buxar',
  'Chamba', 'Chandigarh', 'Chandrapur', 'Chapra', 'Charkhi Dadri', 'Chengalpattu',
  'Chennai', 'Chhatarpur', 'Chhindwara', 'Chikkaballapur', 'Chikmagalur', 'Chitradurga',
  'Chittoor', 'Chittorgarh', 'Churachandpur', 'Churu', 'Coimbatore', 'Cooch Behar',
  'Cuddalore', 'Cuttack',
  'Damoh', 'Darbhanga', 'Darjeeling', 'Dausa', 'Davangere', 'Dehradun', 'Delhi',
  'Deoghar', 'Dewas', 'Dhamtari', 'Dhanbad', 'Dharamsala', 'Dharmapuri', 'Dharwad',
  'Dholpur', 'Dhubri', 'Dhule', 'Dibrugarh', 'Dimapur', 'Dindigul', 'Dumka',
  'Dungarpur', 'Durg', 'Durgapur', 'Dwarka',
  'Eluru', 'Erode', 'Etah', 'Etawah',
  'Faizabad', 'Faridabad', 'Faridkot', 'Farrukhabad', 'Fatehpur', 'Ferozepur', 'Firozabad',
  'Gadchiroli', 'Gadag', 'Gandhidham', 'Gandhinagar', 'Gangapur City', 'Gangtok',
  'Gaya', 'Ghaziabad', 'Ghazipur', 'Giridih', 'Goalpara', 'Golaghat', 'Gopalganj',
  'Gorakhpur', 'Gulbarga', 'Guna', 'Guntur', 'Gurdaspur', 'Gurugram', 'Guwahati', 'Gwalior',
  'Hajipur', 'Haldia', 'Haldwani', 'Hamirpur', 'Hanumangarh', 'Hapur', 'Hardoi',
  'Haridwar', 'Hassan', 'Hathras', 'Haveri', 'Hazaribagh', 'Hisar', 'Hoshangabad',
  'Hoshiarpur', 'Hospet', 'Hosur', 'Howrah', 'Hubli', 'Hyderabad',
  'Imphal', 'Indore', 'Itanagar',
  'Jabalpur', 'Jagdalpur', 'Jaipur', 'Jaisalmer', 'Jalandhar', 'Jalaun', 'Jalgaon',
  'Jalna', 'Jalore', 'Jalpaiguri', 'Jammu', 'Jamnagar', 'Jamshedpur', 'Jashpur',
  'Jaunpur', 'Jhajjar', 'Jhalawar', 'Jhansi', 'Jharsuguda', 'Jhunjhunu', 'Jind',
  'Jodhpur', 'Jorhat', 'Junagadh',
  'Kadapa', 'Kaithal', 'Kakinada', 'Kalaburagi', 'Kalyani', 'Kamarhati',
  'Kancheepuram', 'Kangra', 'Kanker', 'Kannauj', 'Kannur', 'Kanpur', 'Kapurthala',
  'Karauli', 'Karimganj', 'Karimnagar', 'Karnal', 'Karur', 'Karwar', 'Kasaragod',
  'Kashipur', 'Katihar', 'Khammam', 'Kharagpur', 'Khargone', 'Kishanganj', 'Kochi',
  'Kohima', 'Kokrajhar', 'Kolar', 'Kolhapur', 'Kolkata', 'Kollam', 'Kondagaon',
  'Koppal', 'Korba', 'Kota', 'Kottayam', 'Kozhikode', 'Krishnanagar', 'Kurnool',
  'Kurukshetra',
  'Lakhimpur', 'Lalitpur', 'Latur', 'Leh', 'Lucknow', 'Ludhiana', 'Lunglei',
  'Machilipatnam', 'Madhubani', 'Madurai', 'Mahasamund', 'Mainpuri', 'Malappuram',
  'Malda', 'Malegaon', 'Mancherial', 'Mandi', 'Mandla', 'Mandsaur', 'Mandya',
  'Mangalore', 'Mathura', 'Mau', 'Meerut', 'Mehsana', 'Mirzapur', 'Moga', 'Mohali',
  'Mokokchung', 'Moradabad', 'Morbi', 'Morena', 'Motihari', 'Muktsar', 'Mumbai',
  'Munger', 'Murshidabad', 'Muzaffarnagar', 'Muzaffarpur', 'Mysore',
  'Nadiad', 'Nagaon', 'Nagapattinam', 'Nagaur', 'Nagercoil', 'Nagpur', 'Nalanda',
  'Nalgonda', 'Namakkal', 'Namchi', 'Nanded', 'Nandurbar', 'Nashik', 'Navi Mumbai',
  'Navsari', 'Nawada', 'Neemuch', 'Nellore', 'New Delhi', 'Nizamabad', 'Noida', 'Nuh',
  'Ongole', 'Ooty', 'Osmanabad',
  'Palakkad', 'Palamu', 'Palghar', 'Pali', 'Palwal', 'Panaji', 'Panchkula', 'Panipat',
  'Panvel', 'Parbhani', 'Pathanamthitta', 'Pathankot', 'Patiala', 'Patna', 'Phagwara',
  'Pilibhit', 'Pimpri-Chinchwad', 'Pithoragarh', 'Pollachi', 'Ponnani', 'Porbandar',
  'Port Blair', 'Pratapgarh', 'Proddatur', 'Puducherry', 'Pudukkottai', 'Pune', 'Puri',
  'Purnia',
  'Rae Bareli', 'Raichur', 'Raiganj', 'Raigarh', 'Raipur', 'Rajahmundry', 'Rajapalayam',
  'Rajkot', 'Rajnandgaon', 'Rajsamand', 'Ramagundam', 'Ramanagara', 'Rampur', 'Ranchi',
  'Ranipet', 'Ratlam', 'Ratnagiri', 'Rewa', 'Rewari', 'Rishikesh', 'Rohini', 'Rohtak',
  'Roorkee', 'Rourkela', 'Rudrapur', 'Rupnagar',
  'Sagar', 'Saharanpur', 'Salem', 'Samastipur', 'Sambalpur', 'Sambhal', 'Sangareddy',
  'Sangli', 'Sangrur', 'Sasaram', 'Satara', 'Satna', 'Sawai Madhopur', 'Sehore',
  'Senapati', 'Shahjahanpur', 'Shamli', 'Shillong', 'Shimla', 'Shimoga', 'Shivpuri',
  'Siddipet', 'Sikar', 'Silchar', 'Siliguri', 'Silvassa', 'Singrauli', 'Sirohi',
  'Sirsa', 'Sitamarhi', 'Sitapur', 'Sivakasi', 'Siwan', 'Solan', 'Solapur', 'Sonipat',
  'Sopore', 'Sri Ganganagar', 'Srikakulam', 'Srinagar', 'Sultanpur', 'Surat',
  'Surendranagar', 'Suryapet',
  'Tehri', 'Tenkasi', 'Tezpur', 'Thane', 'Thanjavur', 'Thiruvananthapuram',
  'Thoothukudi', 'Thrissur', 'Tinsukia', 'Tiruchirappalli', 'Tirunelveli', 'Tirupati',
  'Tirupur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Tonk', 'Tumkur', 'Tura',
  'Udaipur', 'Udupi', 'Ujjain', 'Una', 'Unnao', 'Uttarkashi',
  'Vadodara', 'Vapi', 'Varanasi', 'Vasco da Gama', 'Vellore', 'Vidisha', 'Vijayawada',
  'Vijayapura', 'Villupuram', 'Virudhunagar', 'Visakhapatnam', 'Vizianagaram',
  'Warangal', 'Wardha', 'Washim', 'Wayanad',
  'Yamunanagar', 'Yavatmal',
]

export const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'wage', label: 'Highest Pay' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'recent', label: 'Most Recent' },
]

export const DISTANCE_OPTIONS = [5, 10, 25, 50, 100]