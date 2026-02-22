# Image Quality Testing Guide

## Quick Reference: Grid vs Lightbox

| View | Image Source | Processing |
|------|--------------|------------|
| **Grid** | `web_url` | Resized to max 2400px, JPEG quality 92, progressive |
| **Lightbox** | `full_url` | Original full-resolution image |

## Manual Testing Steps

### 1. Navigate to the gallery
Open: http://localhost:3000/g/ofir?preview=1

### 2. Grid view screenshot
- Scroll down to find **test1.JPG** and **test2.JPG** in the gallery grid
- Take a screenshot of the grid showing these photos

### 3. Lightbox view screenshot
- Click on one of the test photos to open the lightbox
- Take a screenshot of the full-view lightbox

### 4. Check Network tab (DevTools)
1. Open DevTools (F12 or right-click → Inspect)
2. Go to **Network** tab
3. Filter by **Img** (or type "test" in the filter)
4. Refresh the page or scroll to load the test photos
5. Note the **Size** column for:
   - `web_url` images (grid thumbnails) – look for paths containing `/web/`
   - `full_url` images (lightbox) – original paths when you click to open

### 5. What to look for
- **web_url** (grid): Should be ~200KB–800KB per image (depends on dimensions)
- **full_url** (lightbox): Typically larger, original file size
- Quality: Grid uses `object-cover` so images are cropped to fit; lightbox shows full image

## Current image-processing settings
- `WEB_MAX_WIDTH`: 2400px
- `WEB_QUALITY`: 92
- Progressive JPEG: enabled
