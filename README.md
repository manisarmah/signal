# The Signal

A real-time developer identity aggregator ("Pulse"). 
Combines your GitHub activity with manual proofs of work (images/PDFs) into a chronological feed.

## Features

- **Real-time Feed**: Fetches GitHub events (Stars, Pushes, PRs) instantly.
- **Manual Proofs**: Upload screenshots or PDFs for work not captured on GitHub.
- **Public Profiles**: Share your `/p/[username]` link with anyone.
- **Unified Timeline**: Merges all activities into a single chronological stream.

## Deployment Instructions

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Deploy on Vercel
1.  Go to [Vercel New Project](https://vercel.com/new).
2.  Import this repository.
3.  **Environment Variables**:
    Add the following variables (copy values from your local `.env.local`):
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4.  Click **Deploy**.

## Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000).
