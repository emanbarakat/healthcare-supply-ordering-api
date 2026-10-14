# Healthcare Supply & Ordering API

A sanitized public portfolio version of a TypeScript/Express backend for healthcare-related user management, product catalog, suppliers, and ordering workflows.

## Tech Stack

- Node.js
- TypeScript
- Express
- MongoDB / Mongoose
- JWT authentication
- bcrypt
- Cloudinary integration
- Swagger/OpenAPI
- PDF generation

## Main Domains

The codebase includes workflows for:

- doctors and pharmacists
- admin users
- products, medicines, and accessories
- brands and suppliers
- order management
- authentication and account-status handling

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Build:

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

## Configuration

Sensitive values are expected through environment variables only:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

See `.env.example` for placeholders.

## Security & Portfolio Notes

This repository was created from a sanitized snapshot with **fresh Git history**. Legacy credentials, personal filenames, backup files, and user-uploaded images from the original private development repository are not included here.

This is a portfolio/learning project and has not been presented as a production-ready healthcare system. A fresh security review, dependency update, and runtime test would be required before production use.

## Author

**Eman Barakat**
