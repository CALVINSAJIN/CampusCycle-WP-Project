// Shared lists: edit here to add a category or condition (also update schema.sql + listingController.js)
export const CATEGORIES = [
  { name: 'Books', icon: '📚' },
  { name: 'Electronics', icon: '💻' },
  { name: 'Lab Equipment', icon: '🔬' },
  { name: 'Stationery', icon: '✏️' },
  { name: 'Academic Materials', icon: '🎓' },
  { name: 'Others', icon: '📦' },
];
export const CONDITIONS = { LIKE_NEW: 'Like New', GOOD: 'Good', FAIR: 'Fair' };
export const STATUSES = { AVAILABLE: 'Available', RESERVED: 'Reserved', COMPLETED: 'Completed' };
export const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'];
