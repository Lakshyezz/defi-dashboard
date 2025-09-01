import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'DeFi Dashboard',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'YOUR_PROJECT_ID', // Get this from https://cloud.walletconnect.com
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NODE_ENV === 'development' ? [mainnet] : []),
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

console.log("here in wagmi.ts" , process.env.NEXT_PUBLIC_WC_PROJECT_ID);