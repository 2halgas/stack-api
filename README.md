# Node.js Express Boilerplate

A robust, scalable Node.js backend boilerplate using Express, TypeORM, PostgreSQL, and modern JavaScript practices. This project includes user authentication, avatar uploads, request logging, rate limiting, Swagger documentation, and more—ready to kickstart your next API development.

## Features

- **Authentication**: JWT-based login/signup with refresh tokens and password reset.
- **User Management**: CRUD operations for users, including profile updates with avatar uploads.
- **File Uploads**: Avatar image support with `multer`, stored locally with cleanup of old files.
- **Request Logging**: Morgan-based logging to files with daily rotation and 7-day cleanup.
- **Database**: PostgreSQL with TypeORM for ORM and migrations.
- **Security**: Helmet for HTTP headers, rate limiting, and input validation.
- **API Docs**: Swagger UI for interactive API documentation.
- **TypeScript**: Fully typed for better developer experience and maintainability.

## Prerequisites

- **Node.js**: v18.x or higher
- **PostgreSQL**: v13.x or higher
- **npm**: v9.x or higher

## Project Structure

```
stack-api/
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.ts     # TypeORM database setup
│   │   ├── multer.ts       # Multer file upload config
│   │   └── swagger.ts      # Swagger API docs config
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware (auth, error handling)
│   ├── models/             # TypeORM entities (e.g., User)
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions (auth, email)
│   ├── uploads/            # Local storage for avatar images
│   ├── logs/               # Request log files
│   └── index.ts            # App entry point
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/2halgas/stack-api.git
cd stack-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following:

```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASS=your_postgres_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 4. Set Up PostgreSQL

- Create a database in PostgreSQL:
  ```sql
  CREATE DATABASE your_database_name;
  ```
- The boilerplate uses TypeORM’s `synchronize: true` in development to auto-create tables. For production, run migrations (see below).

### 5. Run the App

```bash
npm run dev
```

- The server will start at `http://localhost:3000`.
- Swagger docs are available at `http://localhost:3000/api-docs`.

## Scripts

- **`npm run dev`**: Start the app with `nodemon` for development.
- **`npm run build`**: Compile TypeScript to JavaScript in `dist/`.
- **`npm start`**: Run the compiled app from `dist/`.
- **`npm run typeorm`**: Run TypeORM CLI (e.g., `npm run typeorm migration:generate -n Name`).

## API Endpoints

### Authentication

- **`POST /api/v1/auth/signup`**: Register a new user.
- **`POST /api/v1/auth/login`**: Log in and get access/refresh tokens.
- **`POST /api/v1/auth/refresh-token`**: Refresh access token.
- **`POST /api/v1/auth/logout`**: Log out (clear refresh token).
- **`POST /api/v1/auth/forgot-password`**: Request password reset email.
- **`POST /api/v1/auth/reset-password`**: Reset password with token.

### Users

- **`GET /api/v1/users`**: List all users (admin only).
- **`GET /api/v1/users/:id`**: Get a user by ID (admin only).
- **`POST /api/v1/users`**: Create a user (admin only).
- **`PATCH /api/v1/users/:id`**: Update a user (admin only).
- **`DELETE /api/v1/users/:id`**: Delete a user (admin only).
- **`GET /api/v1/users/me`**: Get current user’s profile.
- **`PATCH /api/v1/users/me`**: Update current user’s profile (supports avatar upload).

Explore all endpoints in Swagger at `/api-docs`.

## File Uploads

- Avatars are stored in `uploads/` at the project root.
- Use `PATCH /api/v1/users/me` with `multipart/form-data` and an `avatar` field (JPEG/JPG/PNG, max 5MB).
- Old avatars are automatically deleted when a new one is uploaded.

## Logging

- Request logs are stored in `src/logs/` with daily rotation (e.g., `access.log.2025-03-09.gz`).
- Logs older than 7 days are automatically deleted.

## Database Migrations

For production or when `synchronize: false`:

1. Generate a migration:
   ```bash
   npm run typeorm migration:generate -n AddFeature
   ```
2. Run migrations:
   ```bash
   npm run typeorm migration:run
   ```

## Security

- **Helmet**: Secures HTTP headers.
- **Rate Limiting**: 100 requests per 15 minutes per IP.
- **Input Validation**: Email format checks with `validator`.
- **JWT**: Secure authentication with access and refresh tokens.

## Extending the Boilerplate

- **Cloud Storage**: Replace local `uploads/` with AWS S3 or similar.
- **More Entities**: Add new models in `src/models/` and routes in `src/routes/`.
- **Custom Middleware**: Extend `src/middleware/` for additional functionality.

## Contributing

Feel free to fork, submit PRs, or open issues. Contributions are welcome!

## License

MIT License. See [LICENSE](LICENSE) for details.
