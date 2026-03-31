// // frontend/src/translations/index.js
// // Centralized translation management with all language files

// import en from './en';
// import hi from './hi';
// import pa from './pa';
// import ta from './ta';
// import bn from './bn';

// const translations = {
//   en: {
//     // Auth
//     'auth.login': 'Login',
//     'auth.register': 'Register',
//     'auth.email': 'Email Address',
//     'auth.password': 'Password',
//     'auth.confirmPassword': 'Confirm Password',
//     'auth.name': 'Full Name',
//     'auth.phone': 'Phone Number',
//     'auth.selectRole': 'I want to',
//     'auth.hireWorker': 'Hire a Worker',
//     'auth.becomeWorker': 'Become a Worker',
//     'auth.forgotPassword': 'Forgot Password?',
//     'auth.noAccount': "Don't have an account?",
//     'auth.haveAccount': 'Already have an account?',
//     'auth.loginSuccess': 'Login successful!',
//     'auth.registerSuccess': 'Registration successful!',
//     'auth.logout': 'Logout',
    
//     // Common
//     'common.loading': 'Loading...',
//     'common.error': 'Error',
//     'common.success': 'Success',
//     'common.save': 'Save',
//     'common.cancel': 'Cancel',
//     'common.delete': 'Delete',
//     'common.edit': 'Edit',
//     'common.view': 'View',
//     'common.apply': 'Apply',
//     'common.post': 'Post',
//     'common.search': 'Search',
//     'common.filter': 'Filter',
//     'common.clear': 'Clear',
//     'common.back': 'Back',
//     'common.next': 'Next',
//     'common.previous': 'Previous',
//     'common.submit': 'Submit',
//     'common.update': 'Update',
//     'common.close': 'Close',
//     'common.confirm': 'Confirm',
//     'common.all': 'All',
//     'common.today': 'Today',
//     'common.week': 'This Week',
//     'common.month': 'This Month',
    
//     // Navigation
//     'nav.home': 'Home',
//     'nav.search': 'Find Workers',
//     'nav.findJobs': 'Find Jobs',
//     'nav.myJobs': 'My Jobs',
//     'nav.myApplications': 'My Applications',
//     'nav.dashboard': 'Dashboard',
//     'nav.profile': 'Profile',
//     'nav.messages': 'Messages',
//     'nav.admin': 'Admin',
//     'nav.settings': 'Settings',
    
//     // Home Page
//     'home.hero.title': 'Find Trusted Local Workers',
//     'home.hero.subtitle': 'Connect with skilled professionals in your area',
//     'home.hero.search': 'Search for workers or jobs...',
//     'home.hero.location': 'Your Location',
//     'home.hero.category': 'Select Category',
//     'home.categories.title': 'Popular Categories',
//     'home.howItWorks.title': 'How It Works',
//     'home.howItWorks.step1.title': 'Post a Job',
//     'home.howItWorks.step1.desc': 'Describe your requirements and budget',
//     'home.howItWorks.step2.title': 'Get Applications',
//     'home.howItWorks.step2.desc': 'Receive proposals from skilled workers',
//     'home.howItWorks.step3.title': 'Choose & Hire',
//     'home.howItWorks.step3.desc': 'Select the best candidate for your job',
//     'home.cta.title': 'Ready to Get Started?',
//     'home.cta.subtitle': 'Join thousands of satisfied customers',
//     'home.cta.hire': 'Hire a Worker',
//     'home.cta.work': 'Start Working',
//     'home.stats.workers': 'Active Workers',
//     'home.stats.jobs': 'Jobs Completed',
//     'home.stats.users': 'Happy Users',
//     'home.stats.cities': 'Cities Served',
    
//     // Search/Worker Cards
//     'worker.experience': '{{years}} years experience',
//     'worker.rating': '{{rating}} ★',
//     'worker.reviews': '({{count}} reviews)',
//     'worker.hourlyRate': '₹{{rate}}/hour',
//     'worker.dailyRate': '₹{{rate}}/day',
//     'worker.viewProfile': 'View Profile',
//     'worker.hireNow': 'Hire Now',
//     'worker.skills': 'Skills',
//     'worker.location': 'Location',
//     'worker.available': 'Available Now',
//     'worker.busy': 'Currently Busy',
//     'worker.portfolio': 'Portfolio',
//     'worker.about': 'About',
    
//     // Jobs
//     'job.post.title': 'Post a New Job',
//     'job.edit.title': 'Edit Job',
//     'job.title': 'Job Title',
//     'job.description': 'Job Description',
//     'job.budget': 'Budget (₹)',
//     'job.location': 'Location',
//     'job.category': 'Category',
//     'job.deadline': 'Deadline',
//     'job.status.open': 'Open',
//     'job.status.inProgress': 'In Progress',
//     'job.status.completed': 'Completed',
//     'job.status.cancelled': 'Cancelled',
//     'job.applications': 'Applications ({{count}})',
//     'job.posted': 'Posted {{date}}',
//     'job.noJobs': 'No jobs found',
//     'job.postSuccess': 'Job posted successfully!',
//     'job.updateSuccess': 'Job updated successfully!',
//     'job.deleteSuccess': 'Job deleted successfully!',
//     'job.applySuccess': 'Application submitted successfully!',
//     'job.alreadyApplied': 'Already Applied',
    
//     // Applications
//     'application.status.pending': 'Pending',
//     'application.status.accepted': 'Accepted',
//     'application.status.rejected': 'Rejected',
//     'application.bidAmount': 'Bid Amount',
//     'application.coverLetter': 'Cover Letter',
//     'application.accept': 'Accept Application',
//     'application.reject': 'Reject',
//     'application.withdraw': 'Withdraw',
    
//     // Dashboard
//     'dashboard.welcome': 'Welcome back, {{name}}!',
//     'dashboard.stats.totalJobs': 'Total Jobs',
//     'dashboard.stats.activeJobs': 'Active Jobs',
//     'dashboard.stats.completedJobs': 'Completed',
//     'dashboard.stats.totalEarnings': 'Total Earnings',
//     'dashboard.recentJobs': 'Recent Jobs',
//     'dashboard.recentApplications': 'Recent Applications',
//     'dashboard.viewAll': 'View All',
//     'dashboard.noJobs': "You haven't posted any jobs yet",
//     'dashboard.noApplications': "No applications received yet",
    
//     // Messages
//     'messages.title': 'Messages',
//     'messages.select': 'Select a conversation',
//     'messages.type': 'Type your message...',
//     'messages.send': 'Send',
//     'messages.noMessages': 'No messages yet',
//     'messages.startConversation': 'Start a conversation',
    
//     // Forms
//     'form.required': 'This field is required',
//     'form.invalidEmail': 'Please enter a valid email',
//     'form.passwordLength': 'Password must be at least 6 characters',
//     'form.passwordMatch': 'Passwords do not match',
//     'form.phoneInvalid': 'Please enter a valid phone number',
//     'form.budgetMin': 'Budget must be at least ₹100',
    
//     // Categories
//     'category.plumbing': 'Plumbing',
//     'category.electrician': 'Electrician',
//     'category.carpentry': 'Carpentry',
//     'category.painting': 'Painting',
//     'category.cleaning': 'Cleaning',
//     'category.construction': 'Construction',
//     'category.appliance': 'Appliance Repair',
//     'category.landscaping': 'Landscaping',
//     'category.pestControl': 'Pest Control',
//     'category.moving': 'Moving & Packing',
    
//     // Errors
//     'error.general': 'Something went wrong. Please try again.',
//     'error.network': 'Network error. Please check your connection.',
//     'error.unauthorized': 'Please login to continue',
//     'error.forbidden': 'You don\'t have permission to do this',
//     'error.notFound': 'Page not found',
//     'error.server': 'Server error. Please try again later.',
//   },
//   hi: {
//     // Hindi translations - simplified for brevity
//     'auth.login': 'लॉगिन',
//     'auth.register': 'रजिस्टर',
//     'common.loading': 'लोड हो रहा है...',
//     'nav.home': 'होम',
//     'nav.search': 'श्रमिक खोजें',
//     'home.hero.title': 'भरोसेमंद स्थानीय श्रमिक खोजें',
//     // ... rest of Hindi translations
//   },
//   pa: {},
//   ta: {},
//   bn: {},
// };

// export default translations;



// frontend/src/translations/index.js
// Centralized translation management with all language files

import en from './en';
import hi from './hi';
import pa from './pa';
import ta from './ta';
import bn from './bn';

// Create the translations object
const translations = {
  en: en || {},
  hi: hi || {},
  pa: pa || {},
  ta: ta || {},
  bn: bn || {}
};

// Make sure each language has at least basic translations
// If any language file is empty, provide fallback
if (Object.keys(translations.en).length === 0) {
  translations.en = {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'nav.home': 'Home',
    // Add more basic translations as needed
  };
}

export default translations;