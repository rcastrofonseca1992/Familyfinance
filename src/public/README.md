# Public Assets - Favicon Setup

This folder contains all favicon and icon assets for the Notinow PWA.

## ✅ Current Files

- ✅ `favicon.svg` - SVG favicon (modern browsers)

## 📋 Required Files (Need to be added)

To have complete favicon support across all platforms, you need to add the following files:

### Essential Files:
1. **`favicon.ico`** - Multi-resolution ICO (16x16, 32x32, 48x48)
   - Required for: Older browsers, default fallback
   - Format: ICO

2. **`favicon-16x16.png`** - 16x16 PNG
   - Required for: Browser tabs, bookmarks
   - Format: PNG with transparent background

3. **`favicon-32x32.png`** - 32x32 PNG
   - Required for: Browser tabs, bookmarks
   - Format: PNG with transparent background

### Apple iOS:
4. **`apple-touch-icon.png`** - 180x180 PNG
   - Required for: iOS home screen icon
   - Format: PNG (can have background)

### Android PWA:
5. **`android-chrome-192x192.png`** - 192x192 PNG
   - Required for: Android PWA, Chrome
   - Format: PNG with transparent background

6. **`android-chrome-512x512.png`** - 512x512 PNG
   - Required for: PWA splash screens, Android
   - Format: PNG with transparent background

## 🎨 Design Specifications

- **Logo**: Lowercase "n" character
- **Primary Color**: `#7C3AED` (violet/purple)
- **Background**: Transparent or white
- **Border Radius**: 6px (for backgrounds)
- **Font**: system-ui, -apple-system, sans-serif

## 🛠️ How to Generate Files

### Option 1: Online Tools (Easiest)
1. Visit [favicon.io](https://favicon.io/favicon-converter/) or [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload your logo (the blue "n" character)
3. Download the generated package
4. Copy all files to this `/src/public/` folder

### Option 2: From SVG (Using ImageMagick)
```bash
# Convert SVG to PNG at different sizes
convert favicon.svg -resize 16x16 favicon-16x16.png
convert favicon.svg -resize 32x32 favicon-32x32.png
convert favicon.svg -resize 180x180 apple-touch-icon.png
convert favicon.svg -resize 192x192 android-chrome-192x192.png
convert favicon.svg -resize 512x512 android-chrome-512x512.png

# Create ICO file
convert favicon-16x16.png favicon-32x32.png favicon.ico
```

### Option 3: Figma/Design Tools
1. Export the logo at each required size
2. Save as PNG with transparent background
3. Use an online ICO converter for `favicon.ico`

## ✅ Configuration Status

- ✅ Vite config: `publicDir: 'src/public'`
- ✅ HTML: All favicon links configured
- ✅ Manifest: `site.webmanifest` configured
- ✅ Paths: All use root-relative URLs (no `/public/` prefix)

## 🧪 Testing Checklist

After adding all files:
- [ ] Browser tab shows favicon
- [ ] iOS "Add to Home Screen" shows icon
- [ ] Android PWA installation shows icons
- [ ] PWA splash screens work
- [ ] Clear browser cache if old icon persists

## 📝 Notes

- All paths in HTML and manifest files use root-relative URLs (e.g., `/favicon.svg`)
- Vite automatically serves files from `src/public/` at the root path
- Files in this folder are NOT managed by Figma Make (protected)

