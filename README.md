# Crowdfunding dApp

Creating crowdfunding dApp with Rust, Solana, Anchor framework, ReactJS, Bootstrap
and other necessary libraries.

Tutorial: https://www.udemy.com/course/solana-developer/

## Running the app

Term 1: `cd frontend; yarn dev`

Term 2: `anchor build`

## Feature implementation status

- [x] Creating smart contract for crowdfunding purpose with Rust and Anchor framework.
- [x] Creating ReactJS project which connects to Phantom wallet.
- [x] Communicating with our smart contract over Phantom wallet.
- [x] Getting campaign info from current user's wallet address.
- [x] Donating campaign.
- [x] Withdraw funds from a campaign.
- [ ] Staking SOL with Typescript.
- [ ] Building NFT project.

---

## Some Commands

- Request airdrop:
  `solana airdrop 2 ADDRESSHERE --url https://api.devnet.solana.com`
  `solana airdrop 2 ADDRESSHERE --url devnet`

- Check balance:
  `solana balance ADDRESSHERE --url https://api.devnet.solana.com`

- Getting ready solana network in local:

```bash
# Install solana
sh -c "$(curl -sSfL https://release.solana.com/v1.18.14/install)"
solana --version

# Install spl-token
cargo install spl-token-cli

# Create new solana wallet
solana-keygen new
# After creating wallet you can get public key:
solana-keygen pubkey
# Check your wallet's balance on specific network:
solana balance --url devnet

# Create a new token
spl-token create-token --url devnet

```
