# Campus Discord Control Panel

This project is a comprehensive Discord server control panel designed to simplify server management tasks. Built using
FastAPI for the backend and Vite React for the frontend, it offers a user-friendly web interface to manage various
aspects of your Discord server, including categories, channels, roles, users, and events.

## Table of Contents

- [Features](#features)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Installation](#installation)
- [Launch](#launch)

## Features

- **Category Management:**
    - Create, rename, reorder, and delete categories
    - Manage role-based permissions for categories
- **Channel Management:**
    - Create text and voice channels within categories
    - Rename, reorder, and delete channels
- **Role Management:**
    - View a list of server roles
    - Create and rename server roles
    - Delete editable roles
- **User Management:**
    - View a list of server users
    - Rename users' server nicknames
    - Kick users from the server
    - Manage user roles
- **Event Queue Creation:**
    - Create queue in Discord channels for events like lav works defenses or presentations
- **User Authentication:**
    - Secure user authentication via Discord OAuth2
- **Role-Based Authorization:**
    - Access to the control panel is restricted to users with 'staff' roles on the Discord server
- **Filtering and Search:**
    - Search and filter functionalities for users, roles, and logs
- **Action Logging:** 
    - Keeps track of administrative actions for better monitoring and accountability

## Environment Variables

To run the backend and frontend applications correctly, you need to set up the following environment variables. Create a
`.env` file in the root directory of the project and populate it with the necessary values. You can use `.env.sample` as
a template

- `DISCORD_BOT_TOKEN`: Your Discord bot token. You can obtain this from
  the [Discord Developer Portal](https://discord.com/developers/applications). Create a bot application and copy the
  token from the "Bot" tab
- `ADMINISTRATOR_ROLE_ID`: Staff role id for the Discord server managers
- `TEACHER_ROLE_ID`: Staff role id for the teacher
- `STUDENT_ROLE_ID`: General role id for all students
- `GUILD_ID`:Guild id where the system is used
- `SUPABASE_DIRECT_URL`: Supabase Direct Connection URL. This is used for direct database operations, specifically for
  checking and creating the logs table
- `VITE_SUPABASE_URL`: Supabase API URL. Used by both frontend and backend to connect to your Supabase project
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Supabase API Key. Used by both frontend and backend for secure access to
  Supabase
- `VITE_API_URL`: The URL where your backend API is running. If you are running the backend locally with Docker Compose,
  this will be `http://127.0.0.1:8000`

> **Important:** See [Supabase Setup](#supabase-setup) for instructions how to obtain Supabase environment variables

## Supabase Setup

This project uses [Supabase](https://supabase.com/) as a backend service for user authentication and logging. Follow
these steps to set up your Supabase project and obtain the necessary credentials

1. **Create a Supabase Project:**
    - Go to the [Supabase website](https://supabase.com/) and sign up or log in
    - Click on **"New project"**
    - Choose your organization, set a database password, select a region closest to you, and give your project a name
    - Click **"Create new project"**. Wait for the project to be set up (it might take a few minutes)

2. **Enable Discord OAuth2 Authentication:**
    - In your Supabase project dashboard, navigate to **"Authentication"** > **"Sign In / Up"**
    - Find **"Discord"** and enable it
    - Copy the `Callback URL (for OAuth)`
    - You will need to configure the Discord OAuth2 application. Follow the instructions in the Supabase documentation
      by clicking "Discord" in the providers list. You will need to:
        - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
        - Navigate to **"OAuth2"**
        - Paste redirects `Callback URL (for OAuth)` from the **"Supabase Discord Authentication"** into **"Redirects"**
        - Copy the `Client ID` and `Client Secret`
        - Back in Supabase, paste the `Client ID` and `Client Secret` into the respective fields and save

### Obtaining Supabase API Keys

1. In your Supabase project dashboard, navigate to **"Project settings"** > **"Data API"**
2. **`VITE_SUPABASE_URL` (Supabase API URL):** Copy the `Project URL`
3. **`VITE_SUPABASE_SERVICE_ROLE_KEY` (Supabase API Key):** Copy the `service_role secret` key

### Obtaining Supabase Database Direct URL

1. In your Supabase project dashboard, navigate to **"Connect"** at the top of the page
2. Copy the **"Direct connection URL"**
3. Navigate to **"Project settings"** > **"Database"** and copy `Database password` that will be used as part of the direct url

## Installation and Launch

1. **Clone the repository:**

2. **Set up Environment Variables:**
    - Create a `.env` file in the root directory
    - Populate the `.env` file with the environment variables

3. **Invite your Discord bot to the server that will be managed with its own bot role with admin access to the server**

4. **Build and run using Docker Compose:**
    - Ensure you have [Docker](https://www.docker.com/get-started/) installed
    - From the root directory of the project, run:
      ```bash
      docker-compose up --build
      ```
    > This will build both the backend and frontend Docker images and start the services

Once the installation is complete, and Docker Compose is running:

1. **Access the Frontend:** Open your web browser and go to the URL where your frontend is running. If you are running the backend locally with Docker Compose,
  this will be `http://127.0.0.1:8080`
2. **Login:** Click on the **"Login via Discord"** button to authenticate with your Discord account. Ensure you are logged
   into the correct Discord account in your browser
   After successful login, you will be redirected to the control panel dashboard and can start managing your Discord
   server
