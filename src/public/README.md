# Public Assets - Notinow Favicons

This folder contains the favicon and icon assets for the Notinow PWA.

## Current Files

- ✅ `favicon.svg` - SVG favicon with the blue/purple "n" logo (created automatically)

## Required PNG Files (Manual Upload Needed)

The following PNG files need to be added manually to this `/public` folder. You can generate these from the provided blue "n" logo image:

### Files Needed:
1. **`favicon.ico`** - Traditional ICO format (16x16, 32x32, 48x48 combined)
2. **`favicon-16x16.png`** - 16x16 PNG favicon
3. **`favicon-32x32.png`** - 32x32 PNG favicon
4. **`apple-touch-icon.png`** - 180x180 PNG for iOS home screen
5. **`icon-192.png`** - 192x192 PNG for PWA (already referenced in index.html)
6. **`icon-512.png`** - 512x512 PNG for PWA splash screens

### How to Generate These Files:

1. **Using Online Tools:**
   - Visit [favicon.io](https://favicon.io/favicon-converter/)
   - Upload the blue "n" logo image
   - Download the generated package
   - Copy the files to `/public` folder

2. **Using Design Tools (Figma/Photoshop):**
   - Export the logo at different sizes
   - Save as PNG with transparent background
   - Rename according to the list above

3. **Using Command Line (ImageMagick):**
   ```bash
   convert logo.png -resize 16x16 favicon-16x16.png
   convert logo.png -resize 32x32 favicon-32x32.png
   convert logo.png -resize 180x180 apple-touch-icon.png
   convert logo.png -resize 192x192 icon-192.png
   convert logo.png -resize 512x512 icon-512.png
   ```

## Branding Guidelines

The Notinow logo should follow these specifications:
- **Primary Color:** `#7C3AED` (violet/purple) - for the "n"
- **Background:** White or transparent
- **Typography:** Clean, modern sans-serif
- **Shape:** Rounded corners (6px border-radius for backgrounds)

## After Adding PNG Files

Once you've added the PNG files, make sure to:
1. Update `/index.html` to reference all favicon sizes
2. Update `/manifest.json` to include the PNG icons
3. Test on multiple devices (iOS, Android, Desktop browsers)
