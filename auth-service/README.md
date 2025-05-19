# Auth Service

Authentication microservice for the blog application.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/blog

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Strapi Configuration
STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your_strapi_api_token_here
```

## Strapi Integration

The auth service can optionally sync users with a Strapi backend. To enable this:

1. Get your Strapi API token:
   - Go to your Strapi admin panel
   - Navigate to Settings > API Tokens
   - Create a new API token with the following permissions:
     - `users-permissions.user.create`
     - `users-permissions.user.update`
     - `users-permissions.user.find`

2. Add the token to your `.env` file:
   ```env
   NEXT_PUBLIC_STRAPI_API_TOKEN=your_token_here
   ```

3. The service will automatically sync users with Strapi when they:
   - Register a new account
   - Update their profile
   - Log in (to ensure data consistency)

Note: The auth service will continue to work even if Strapi sync fails or is not configured. 