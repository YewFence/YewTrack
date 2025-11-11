# Project Overview

This is a full-stack web application project. It consists of a Vue.js 3 frontend and an Express.js backend, both written in TypeScript. The project uses `pnpm` as its package manager.

- **Frontend (`frontend/`):** A Vue.js 3 application built with Vite. It uses TypeScript and is set up with Tailwind CSS.

# Building and Running

## Frontend (`frontend/`)

To work with the frontend, navigate to the `frontend` directory.

- **Install Dependencies:**
  ```bash
  pnpm install
  ```
- **Run Development Server:**
  ```bash
  pnpm run dev
  ```
- **Build for Production:**
  ```bash
  pnpm run build
  ```
- **Preview Production Build:**
  ```bash
  pnpm run preview
  ```

## Backend (`backend/`)

To work with the backend, navigate to the `backend` directory.

- **Install Dependencies:**
  ```bash
  pnpm install
  ```
- **Run Development Server:**
  ```bash
  pnpm run dev
  ```

# Development Conventions

- **TypeScript:** Both the frontend and backend use TypeScript. Adhere to the configurations in the respective `tsconfig.json` files.
- **Package Management:** Use `pnpm` for managing all dependencies.
- **Styling:** The frontend uses Tailwind CSS.
- **API:** The backend provides an API for the frontend. The details of the API can be found in the `backend/src/index.ts` file.
