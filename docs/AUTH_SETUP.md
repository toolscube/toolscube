# Authentication Setup Guide

## Overview

Tools Cube uses **Better Auth** for authentication with support for:

- ✅ Email/Password authentication
- ✅ Google OAuth (optional)
- ✅ Password reset (with optional email)
- ✅ Guest access for most tools

## Quick Setup

### 1. Required Environment Variables

```bash
# Copy example file
cp .env.example .env

# Generate auth secret
openssl rand -base64 32
```

Update `.env`:

```env
DATABASE_URL="postgresql://localhost:5432/tools_cube"
BETTER_AUTH_SECRET="<generated-secret>"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Optional: Google OAuth

**Get credentials from:** https://console.cloud.google.com/apis/credentials

1. Create OAuth 2.0 Client ID
2. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Copy Client ID and Secret to `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 3. Optional: Email for Password Reset

**Without email config:** Password reset links will be logged to console (dev mode)

**With email config:** Users receive password reset emails

```env
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

**For Gmail:**

1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password (not your Gmail password)

## Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# (Optional) View database
npx prisma studio
```

## Features

### Authentication Flow

**Email/Password:**

1. Sign up → Account created
2. Sign in → Session established
3. Password reset → Link sent (email/console)

**Google OAuth:**

1. Click "Sign in with Google"
2. Authorize → Account created/linked
3. Redirect → Session established

### Guest Access

Most tools work without authentication:

- ✅ Text utilities
- ✅ Calculators
- ✅ Image tools
- ✅ SEO tools
- ✅ Basic URL shortener

### Authentication Required

Only for:

- 📊 Dashboard (view your links)
- 📈 Analytics (link stats)
- 🔧 Profile/Settings
- 🔗 Custom URL slugs (link ownership)

## Production Deployment

### Environment Variables

```env
# Production URLs
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
BETTER_AUTH_URL="https://yourdomain.com"

# Secure database
DATABASE_URL="postgresql://user:pass@prod-host:5432/tools_cube"

# Strong secret (32+ chars)
BETTER_AUTH_SECRET="<strong-random-secret>"

# Optional: OAuth
GOOGLE_CLIENT_ID="prod-client-id"
GOOGLE_CLIENT_SECRET="prod-client-secret"

# Optional: Email
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="<sendgrid-api-key>"
```

### Google OAuth Production Setup

1. Add production redirect URI:
   - `https://yourdomain.com/api/auth/callback/google`
2. Add to authorized domains
3. Update consent screen

### Email Providers

**Free options:**

- Gmail (with App Password)
- Outlook/Hotmail
- Yahoo Mail

**Transactional (better for production):**

- SendGrid (100 emails/day free)
- Mailgun (5000 emails/month free)
- AWS SES ($0.10 per 1000 emails)
- Resend (3000 emails/month free)

## Troubleshooting

### "Invalid credentials"

- Check `BETTER_AUTH_SECRET` is set
- Verify database connection
- Run `npx prisma generate`

### Google OAuth not working

- Check redirect URI matches exactly
- Verify credentials in Google Console
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Password reset link not working

- Check console logs if email not configured
- Verify `BETTER_AUTH_URL` matches your domain
- Check email provider credentials

### Database errors

- Run `npx prisma migrate dev`
- Check `DATABASE_URL` connection string
- Verify PostgreSQL is running

## Security Notes

### Production Checklist

- ✅ Use strong `BETTER_AUTH_SECRET` (32+ chars)
- ✅ Enable SSL for PostgreSQL
- ✅ Use HTTPS for production URLs
- ✅ Keep dependencies updated
- ✅ Use environment variables (never commit secrets)
- ✅ Enable rate limiting (if needed)
- ✅ Regular database backups

### Best Practices

1. **Secrets**: Use password managers or secret management services
2. **Database**: Use connection pooling in production
3. **OAuth**: Separate dev/prod credentials
4. **Email**: Use transactional email service in production
5. **Monitoring**: Set up error tracking (Sentry, etc.)

## Open Source Notes

This project is designed to be fork-friendly:

- ✅ Email is **optional** (console fallback)
- ✅ OAuth is **optional** (email/password works standalone)
- ✅ Most tools work **without authentication**
- ✅ No external API keys required
- ✅ PostgreSQL is the only hard dependency

### Running Without Email

Password reset links will be logged to console:

```
🔐 Password Reset Link: http://localhost:3000/forgot-password?token=...
```

Copy the link and open in browser.

### Running Without OAuth

Email/password authentication works perfectly without Google OAuth. Just skip the Google credentials.

## Support

- **Issues**: https://github.com/toolscube/tools-cube/issues
- **Docs**: [/docs](../docs)
- **License**: MIT
