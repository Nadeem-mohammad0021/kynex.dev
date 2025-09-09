# Adobe Fonts - Quador Bold-Italic Setup

The KYNEX.dev logo now uses Quador Bold-Italic from Adobe Fonts. This directory is preserved for reference but local font files are no longer needed.

## Adobe Fonts Setup Required:

### 1. Create an Adobe Fonts Project:
1. Go to [Adobe Fonts](https://fonts.adobe.com)
2. Search for "Quador" or visit: https://fonts.adobe.com/fonts/quador
3. Click "Add to Web Project" or "Activate"
4. Create a new web project or add to existing project
5. Make sure to select **Bold Italic (700 Italic)** weight
6. Copy your project kit ID

### 2. Update the Application:
1. Open `src/app/layout.tsx`
2. Find the line: `<link rel="stylesheet" href="https://use.typekit.net/your-kit-id.css" />`
3. Replace `your-kit-id` with your actual Adobe Fonts project ID

### 3. Font Configuration:
- **Font Family**: "quador"
- **Font Weight**: 700 (Bold)
- **Font Style**: Italic
- **Usage**: KYNEX logo text only

### 4. Verification:
Once configured, the KYNEX logo text will display in Quador Bold-Italic. The ".dev" portion will remain in the regular font.

### 5. Fallbacks:
If Adobe Fonts fails to load, the system will fall back to:
1. Arial (primary fallback)
2. System sans-serif font (final fallback)

## Benefits of Adobe Fonts:
- ✅ No local font files needed
- ✅ Optimized loading and performance
- ✅ Always up-to-date font versions
- ✅ Professional font licensing included
- ✅ Cross-browser compatibility
