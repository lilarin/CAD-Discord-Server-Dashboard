# Library Management System API

The goal of this project is to develop a comprehensive online management system for a library using Django REST Framework (DRF). The system provides APIs to manage various library operations, including managing books, authors, borrowing activities, and more. The API is designed to be used by front-end applications or other systems to interact with the library's resources.

## Authentication

To use the API, you need to create a user account and obtain a JWT token:

- **Register**: `POST /api/user/register/`
- **Verify Token**: `POST /api/user/token/verify/`
- **Refresh Token**: `POST /api/user/token/refresh/`

## Features

- **Admin Panel**: Customized management interface at `/admin/`.
- **Book Management**: Full CRUD operations for books, including title, author, cover type, inventory, and daily fee.
- **Borrowing System**: Manage borrowing and returning of books with validations on availability and user eligibility.
- **Payments Service**: Handle book borrowing payments via Stripe.
- **Search and Filtering**: Easily search and filter books and authors.
- **JWT Authentication**: Secure API access using JWT tokens.
- **Notifications Service**: Send alerts about borrowings and overdue items via Telegram.
- **Swagger Docs**: Interactive API documentation available at `/swagger/`.

## Installation

1. **Clone the repository**:
    ```
    git clone https://github.com/lilarin/library-API.git
    ```
2. **Create a virtual environment**:
    ```
    python -m venv env
    source env/bin/activate
    ```
3. **Install dependencies**:
    ```
    pip install -r requirements.txt
    ```
4. **Apply migrations**:
    ```
    python manage.py migrate
    ```
5. **Create a superuser**:
    ```
    python manage.py createsuperuser
    ```
6. **Run the development server**:
    ```
    python manage.py runserver
    ```
    > **Note**: Running the development server this way will not start Celery.

7. **Run with Docker**:
    ```
    docker-compose up --build
    ```

## API Endpoints

- **Admin**:
  - `/admin/`
- **Books**:
  - `/api/book/`
  - `/api/book/<id>/`
- **Users**:
  - `/api/user/`
  - `/api/user/me/`
- **Borrowings**:
  - `/api/borrowing/`
  - `/api/borrowing/<id>/`
- **Payments**:
  - `/api/payment/`
  - `/api/payment/<id>/`

## Project Team

- **Team Leader**: Pavlo Krakovych
- **Developers**:
  - Vladyslav Chichkan
  - Stanislav Sudakov
  - Bohdan Kuzik
  - Bohdan Zinchenko
  - Nykyta Nykolaitsev

## Environment Variables

This project uses environment variables to manage sensitive settings like API keys, database configurations, and more. Ensure you create a `.env.sample` file in the root directory and set the required environment variables before running the project.
