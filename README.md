# Welcome to your Skola Project

## Project info

**URL**: https://lovable.dev/projects/a9a71580-f3fe-447a-a3db-8a90d1ac97a5

## Project Structure

This project is a frontend-only implementation of the Skola educational platform. The application uses React with mock data services to simulate backend functionality.

### Key Components

- **Frontend**: A React application built with TypeScript, Vite, and shadcn-ui components
- **Mock Services**: Simulated API services that provide data without requiring a backend
- **Authentication**: Mock authentication flow with simulated JWT tokens

## How to run this code?

There are several ways of editing and running your application.

### Run Locally

If you want to work locally using your own IDE, you can clone this repo and run it. The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Features

### Lecturer-Student Linking

The application includes a feature that allows students to connect with their lecturers using unique lecturer IDs. This creates a direct communication channel between students and lecturers.

## Mock Data

The application uses mock data services that simulate a backend API. This means you can test most functionality without needing to set up a separate backend server. The mock services include:

- Authentication (login/signup)
- Course management
- Unit management
- Student-lecturer connections

## How to Extend

If you want to add real backend functionality in the future:

1. Create a new backend API with the endpoints that match the current mock API structure
2. Update the `ApiService.ts` file to use real API calls instead of mock responses
3. Configure the appropriate connection settings in your environment

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a9a71580-f3fe-447a-a3db-8a90d1ac97a5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Features

### Lecturer-Student Linking

The application includes a feature that allows students to connect with their lecturers using unique lecturer IDs. This creates a direct communication channel between students and lecturers.

For detailed implementation documentation, see [Lecturer-Student Linking Documentation](./docs/LECTURER_STUDENT_LINKING.md).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a9a71580-f3fe-447a-a3db-8a90d1ac97a5) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
