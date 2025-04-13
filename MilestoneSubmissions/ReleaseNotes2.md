# 📢 Fridge Fusion - Release Notes 2
## 🗓️ April 10, 2025

---

## ✨ Highlights and Features

- **Database Is No Longer Stored in Github Repository**
  - Database creates itself in a volume when running docker compose up.

- **Home Page**
  - A landing page that outlines the function, purpose, and tone of our site.
  - Links to other pages.

- **Ingredients Page**
  - User can add and remove ingredients from their Fridge page.
  - User cam add ingredients based on a drop down.

- **Recipes Page**
  - Recipes pulled from Spoonacular based on ingredients.
  - Ingredients that the user has within their ingredients is bolded within the recipes.

- **Log Out**
  - User can now logout.
  - Logging out redirects the user to the logout page with a confirmation message.

- **Style Changes**
  - Added font styling to our frontend.
  - Added a consistent color scheme.
  - Formatted forms to make it more intuitive.
  - Added visual flare with images and icons.

---

## 🔧 Bug Fixes & Improvements
- Added more tests, specifically to see if every page renders properly. Also added tests specifically for routes and controllers.
- Edited handlebars files to allow for cross-platform compatibility in font and imgages.