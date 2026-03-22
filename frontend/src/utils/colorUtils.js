// Helper functions for avatar colors and initials
export const stringToColor = (string) => {
  // Add null check to handle undefined or null strings
  if (!string) return '#000000'; // Default color for undefined names
  
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

export const adjustColor = (color, amount) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => 
    ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
  );
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const getPlanColor = (plan) => {
  switch(plan) {
    case 'Oro':
      return '#ffc107';
    case 'Esmeralda':
      return '#4caf50';
    case 'Premium':
      return '#9c27b0';
    default:
      return '#3699ff';
  }
};