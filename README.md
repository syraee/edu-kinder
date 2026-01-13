This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Getting Started

# Frontend (Next.js)

First, run the development server:

```bash
  npm run dev
# or
  yarn dev
# or
  pnpm dev
# or
  bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


# Backend (Node.js + Express)

1. Navigate to the backend folder:
    ```bash
      cd backend
    ```
2. Install dependencies: 

    ```bash
      npm install
    ```

3. Start the server in development mode
   ```bash
      npm run dev
   ```

By default, the backend runs on http://localhost:5000/api 
.
You should see:

Server running on port 5000

(Optional) - For writing API docs install swagger and swagger-autogen: 
```bash
  cd backend
```
```bash
  npm install swagger-ui-express
``` 

```bash
  npm install swagger-autogen
```
If you want to create new docs for endpoints type:
```bash
  node swagger.js
```

## Database

This project uses PostgreSQL with Prisma ORM
for database management. Follow these steps to set it up locally:

1. Prerequisites 

   1. Docker 
   2. Node.js and npm
   3. Install Prisma client
      ```bash
        npm install prisma @prisma/client
      ```
   4. (Optional) pgAdmin or VS Code PostgreSQL Extension for browsing data

2. Start PostgreSQL
    In the backend folder, there is a docker-compose.yml file. Run:

    ```bash
      docker-compose up -d
    ```
    
    This will start PostgreSQL with the following credentials:
    
    Host: localhost
    
    Port: 5432
    
    Check that the container is running:
    
    ```bash
      docker ps
    ```

3. Prisma setup

    Generate Prisma client and create database tables:

    ```bash
      npx prisma generate
      npx prisma migrate dev --name init
    ```

4. Seed test data

    Populate the database with example users:
    
    ```bash
      npm run seed
    ```
   
# Face recognition

Container for Python microservice was created together with database. Face recognition is automatically implemented in photo upload.

We use InsightFace - open source toolbox for face recognition and theirs buffalo-l model.
   

# Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
