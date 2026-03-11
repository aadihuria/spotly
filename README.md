# Spotly

## Overview

Spotly is a campus discovery app designed to help students find, rate, and review the best places around campus. The idea is similar to apps like Beli or Yelp but focused specifically on college campuses.

Users can discover study spots, restaurants, coffee shops, and other useful locations around campus. The goal is to make it easy for students to quickly see where the best places are to study, work, or hang out based on ratings and reviews from other students.

This repository contains the front-end and core application logic for the project.

---

# Tech Stack

The project currently uses the following technologies:

**Frontend**

* Next.js
* React
* JavaScript
* CSS / Tailwind (if applicable)

**Development Tools**

* Node.js
* npm
* Git + GitHub for version control

(If we later add a database like Supabase or Firebase it will be added here.)

---

# How the Project is Structured

The repository is organized roughly like this:

```
spotly/
│
├── app/              # Main pages and routing
├── components/       # Reusable UI components
├── public/           # Static assets (images, icons, etc.)
├── styles/           # Styling files
├── package.json      # Project dependencies and scripts
└── README.md
```

* `app/` contains the main pages and routing logic.
* `components/` contains reusable UI elements.
* `public/` stores images and other static assets.
* `package.json` defines all dependencies and scripts.

---

# Running the Project Locally

Follow these steps to run the project on your machine.

## 1. Clone the repository

```
git clone https://github.com/aadihuria/spotly.git
```

## 2. Navigate into the project

```
cd spotly
```

## 3. Install dependencies

```
npm install
```

This installs all required packages defined in `package.json`.

## 4. Start the development server

```
npm run dev
```

## 5. Open the app

Open a browser and go to:

```
http://localhost:3000
```

The application should now be running locally.

---

# Making Changes to the Project

Once the project is running locally, you can edit any files in the repository and the app will automatically update in the browser.

Typical development workflow:

1. Start the dev server

```
npm run dev
```

2. Edit code in the project files

3. Save the file

Next.js will automatically reload the page with the new changes.

---

# Pushing Changes to GitHub

When you make updates to the project:

1. Add the changes

```
git add .
```

2. Commit the changes

```
git commit -m "Describe what you changed"
```

3. Push to GitHub

```
git push
```

This will update the repository so everyone working on the project has the latest version.

---

# Future Features

Planned features for Spotly include:

* Study spot discovery
* Ratings and reviews
* Search functionality
* Leaderboards / top locations
* User profiles
* Saved locations

---

# Notes

If you run into issues installing dependencies or running the dev server, make sure you have:

* Node.js installed
* npm installed

You can check with:

```
node -v
npm -v
```

---

# Contributors

* Aadi Huria
* Devarsh Das
