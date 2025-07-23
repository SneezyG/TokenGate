require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const tokenABI = require('./abi/token.json');

const app = express();
const port = process.env.PORT || 3000;

// Setup provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Setup contract instance
const tokenContract = new ethers.Contract(
  process.env.TOKEN_ADDRESS,
  tokenABI,
  provider
);

// Route: /check-access?wallet=0x...
app.get('/check-access', async (req, res) => {
  const wallet = req.query.wallet;

  if (!wallet || !ethers.isAddress(wallet)) {
    return res.status(400).json({ error: 'Invalid or missing wallet address' });
  }

  try {
    const balance = await tokenContract.balanceOf(wallet);
    const hasAccess = balance.gt(0); // true if balance > 0

    return res.json({ wallet, hasAccess, balance: balance.toString() });
  } catch (error) {
    console.error('Error checking token balance:', error);
    return res.status(500).json({ error: 'Blockchain query failed' });
  }
});

app.listen(port, () => {
  console.log(`✅ Token Gating API running on http://localhost:${port}`);
});
