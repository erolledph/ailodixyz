# GitHub OAuth Setup Guide

## Issue Description
You're encountering the error: "The redirect_uri is not associated with this application" when trying to authenticate with GitHub OAuth.

## Solution: Register Callback URLs

### Step 1: Access Your GitHub OAuth Application
1. Go to [GitHub.com](https://github.com) and sign in
2. Click your profile picture (top right) → **Settings**
3. In the left sidebar, scroll down to **Developer settings**
4. Click **OAuth Apps**
5. Find your application (likely named something like "AI Lodi CMS" or similar)
6. Click on your application name to edit it

### Step 2: Add Authorization Callback URLs
In the "Authorization callback URL" field, you need to add these URLs:

#### Production URLs (Required)
```
https://ailodi.xyz/api/auth/github/callback
```

#### Development URLs (Recommended for testing)
```
http://localhost:3000/api/auth/github/callback
http://localhost:5173/api/auth/github/callback
http://127.0.0.1:3000/api/auth/github/callback
```

### Step 3: Multiple Callback URLs
GitHub allows multiple callback URLs. Add them one at a time:

1. Enter the first URL in the "Authorization callback URL" field
2. Click **Update application**
3. Edit the application again
4. Add the next URL
5. Repeat until all URLs are added

### Step 4: Environment Variables Check
Ensure your environment variables are correctly set:

#### In your `.env.local` (for development):
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
ADMIN_GITHUB_USERNAME=your_github_username
```

#### In your Cloudflare Pages environment variables (for production):
```env
NEXT_PUBLIC_SITE_URL=https://ailodi.xyz
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
ADMIN_GITHUB_USERNAME=your_github_username
```

### Step 5: Test the OAuth Flow
1. Deploy your changes to Cloudflare Pages
2. Try accessing the CMS admin: `https://ailodi.xyz/cms-admin`
3. You should be redirected to GitHub for authentication
4. After successful authentication, you should be redirected back to your CMS

## Troubleshooting

### If you still get redirect_uri errors:
1. Double-check that the callback URL exactly matches what's in your GitHub OAuth app settings
2. Ensure there are no trailing slashes or extra characters
3. Verify that `NEXT_PUBLIC_SITE_URL` in your environment matches the domain in your callback URL

### If you can't find your OAuth application:
1. You may need to create a new one at: https://github.com/settings/applications/new
2. Use these settings:
   - **Application name**: AI Lodi CMS
   - **Homepage URL**: https://ailodi.xyz
   - **Authorization callback URL**: https://ailodi.xyz/api/auth/github/callback

### Common Issues:
- **Case sensitivity**: URLs are case-sensitive
- **Protocol mismatch**: Make sure you're using `https://` for production and `http://` for local development
- **Port numbers**: Include the correct port for local development (usually `:3000`)

## Security Notes
- Never commit your `GITHUB_CLIENT_SECRET` to version control
- Use environment variables for all sensitive configuration
- The `ADMIN_GITHUB_USERNAME` should be set to your GitHub username to restrict CMS access