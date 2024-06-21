# Send IT

## About

Send iT is a UI to send ERC-20 tokens on Ethereum mainnet/Sepolia. The app uses NextJs 14 app router and Tailwind as it's CSS framework.

## Getting Started

### 1)Install dependencies

Clone this repository and run the following command to install all dependencies. The app uses Node v18.20.0.

```bash
pnpm install
```

### 2)Environment

Setup a .env.local file and create the respective keys for your project

```bash
NEXT_PUBLIC_PROJECT_ID=""  //Wallet Connect API key(Project ID),
NEXT_PUBLIC_ALCHEMY_SEPOLIA=""
NEXT_PUBLIC_ALCHEMY_MAINNET=""
```

### 3) Run local server

Use the following command to run the project on your local machine.

```bash
pnpm run dev
#or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

Test Deployement [here] (https://erc-20-rosy.vercel.app/)
