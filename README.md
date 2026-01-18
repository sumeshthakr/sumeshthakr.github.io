# Sumesh Thakur - ML & Computer Vision Portfolio

A modern, graph-based portfolio website showcasing expertise in Machine Learning, Computer Vision, and Graph Neural Networks.

## Features

### 🎯 Graph-Based Visualizations
- **3D Interactive Graph**: Main hero section featuring a Three.js-powered 3D graph representing skills and technologies
- **Mini Graph Animations**: D3.js-powered interactive graphs for each project section
- **Dynamic Node Creation**: Contact form submissions create new nodes in the visualization

### 🚀 Modern Design
- **Dark Theme**: Professional dark color scheme with neon accents
- **Responsive Design**: Fully responsive layout that works on all devices
- **Smooth Animations**: CSS transitions and JavaScript animations throughout
- **Typography**: Clean, modern typography with Inter and JetBrains Mono fonts

### 📱 Sections
- **Hero Section**: 3D graph visualization with key statistics
- **About**: Professional background and timeline
- **Research**: Publications and research highlights
- **Projects**: Featured projects with interactive graph visualizations
- **Contact**: Form with graph-based feedback

## Technologies Used

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern CSS with custom properties and animations
- **JavaScript ES6+**: Vanilla JavaScript with modern features
- **Three.js**: 3D graphics and WebGL rendering
- **D3.js**: Data-driven document manipulation for mini graphs

### Design & Styling
- **CSS Grid & Flexbox**: Modern layout techniques
- **CSS Custom Properties**: Theme management
- **Media Queries**: Responsive design
- **CSS Animations**: Smooth transitions and effects

## Installation & Setup

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Open in browser:**
   Simply open `index.html` in your web browser, or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

3. **View the site:**
   Navigate to `http://localhost:8000` in your browser.

### GitHub Pages Deployment

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/yourusername.github.io.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/" root folder
   - Save changes

3. **Access your site:**
   Your site will be available at `https://yourusername.github.io`

## Customization

### Colors & Theme
Edit the CSS custom properties in `styles.css`:
```css
:root {
    --primary-color: #4f8cff;
    --secondary-color: #7c5dff;
    --background-color: #0f172a;
    /* ... other colors */
}
```

### Content
Update the HTML content in `index.html`:
- Replace personal information in the hero section
- Update the about section with your background
- Modify research and project sections
- Update contact information

### Graph Data
Customize the 3D graph in `script.js`:
```javascript
const skills = [
    { name: 'Your Skill', pos: new THREE.Vector3(x, y, z) },
    // Add your skills
];
```

## Performance Optimizations

- **Lazy Loading**: External libraries loaded dynamically
- **Canvas Optimization**: Efficient Three.js rendering
- **CSS Optimization**: Minimized repaints and reflows
- **Responsive Images**: Optimized for different screen sizes

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **WebGL Support**: Required for 3D visualizations
- **JavaScript ES6+**: Modern JavaScript features used

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact via email: sumeshthkr@gmail.com

---

**Built with ❤️ using graph-based technologies**
