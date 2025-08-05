export const APP_CONFIG = {
  // Base URL for the application
  baseUrl: import.meta.env.PROD
    ? 'https://zenban.netlify.app'
    : 'http://localhost:5173',

  // App metadata
  name: 'Kanban Board',
  title: 'Kanban Board - Project Management Tool | Drag & Drop Task Manager',
  description:
    'A powerful, intuitive Kanban board application for managing projects and tasks. Features drag-and-drop functionality, customizable columns, GitHub integration, and real-time collaboration. Built with React and TypeScript.',
  keywords:
    'kanban board, project management, task management, drag and drop, productivity, workflow, agile, scrum, react, typescript',
  author: 'Kanban Board App',

  // Social media metadata
  social: {
    siteName: 'Kanban Board App',
    image: '/square-kanban.png', // Relative path to the image
  },

  // Theme
  themeColor: '#3b82f6',

  // Version
  version: '1.0.0',
} as const;

// Helper function to get absolute URL for images
export const getAbsoluteUrl = (path: string) => {
  return `${APP_CONFIG.baseUrl}${path}`;
};
