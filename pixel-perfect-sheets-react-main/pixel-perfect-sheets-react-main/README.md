
# React Spreadsheet Application

A pixel-perfect React spreadsheet application built with modern web technologies, featuring a Google Sheets-like experience with interactive cells, sorting, filtering, and responsive design.

## 🚀 Features

- **Interactive Spreadsheet**: Click to select cells, double-click to edit
- **Google Sheets-like Experience**: Familiar interface with cell selection, editing, and navigation
- **Sorting & Filtering**: Sort columns and search through data
- **Multiple Sheet Support**: Tab-based sheet navigation
- **Responsive Design**: Works seamlessly across different screen sizes
- **Keyboard Navigation**: Full keyboard support for spreadsheet operations
- **Rich Toolbar**: Formatting options and cell manipulation tools

## 🛠 Tech Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with strict mode
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Vite** - Fast build tool and development server
- **Lucide React** - Beautiful icons for the interface

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-spreadsheet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🔧 Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🏗 Architecture & Trade-offs

### Component Structure
- **Spreadsheet.tsx** - Main spreadsheet component containing all functionality
- **Modular Design** - Separated concerns for cells, headers, and toolbar
- **Local State Management** - Used React's built-in state management for simplicity

### Key Design Decisions

1. **Custom Table Implementation** - Built a custom spreadsheet grid instead of using react-table for more control over cell interactions and styling

2. **Cell-based Data Structure** - Used a flat object structure with cell IDs as keys for efficient lookups and updates

3. **Inline Editing** - Implemented smooth transition between view and edit modes with proper focus management

4. **Responsive Grid** - Used CSS Grid and Flexbox for a responsive layout that works on all screen sizes

### Performance Considerations
- **Virtualization** - For large datasets, consider implementing virtual scrolling
- **Memoization** - Cell components could be memoized to prevent unnecessary re-renders
- **Debounced Search** - Search functionality uses immediate updates (could be debounced for better performance)

## 🎨 Styling Approach

- **Tailwind CSS** - Utility-first approach for consistent styling
- **Component-based Classes** - Organized styles using the `cn()` utility for conditional classes
- **Hover States** - Interactive feedback for better user experience
- **Focus Management** - Proper focus indicators and keyboard navigation

## 🚀 Features Implemented

✅ **Core Requirements**
- Pixel-perfect layout matching Figma design
- Google Sheets-like spreadsheet experience
- Interactive buttons and tabs with console logging
- TypeScript with strict mode
- Tailwind CSS styling

✅ **Interactive Features**
- Cell selection and editing
- Column sorting with visual indicators
- Search functionality
- Multiple sheet tabs
- Toolbar with formatting options
- Row and column headers

✅ **User Experience**
- Smooth transitions and hover effects
- Keyboard navigation support
- Responsive design
- Clean, modern interface

## 🎯 Future Enhancements

- **Keyboard Navigation** - Arrow key navigation between cells
- **Column Resizing** - Drag to resize column widths
- **Column Hide/Show** - Toggle column visibility
- **Data Validation** - Cell-level validation rules
- **Formula Support** - Basic formula calculations
- **Export Functionality** - Export to CSV/Excel formats

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive enhancement approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
