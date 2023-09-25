import {
  AnchorProvider,
  BN,
  Program,
  utils,
  web3,
} from "@project-serum/anchor";
import {
  Connection,
  PublicKey,
  SendOptions,
  clusterApiUrl,
} from "@solana/web3.js";
import idlJson from "./types/crowdfunding/crowdfunding-idl.json";

import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/footer";
import Header from "./components/header";
import MainPage from "./pages/main-page";
import { tryCall } from "./types";

import { Buffer } from "buffer";
import { Crowdfunding, IDL } from "./types/crowdfunding/crowdfunding";

// @ts-ignore
window.Buffer = Buffer;

//console.log(
//  ">> program, anchor provider, web3",
//  Program,
//  AnchorProvider,
//  web3,
//  utils,
//  BN,
//  clusterApiUrl
//);

const programId = new PublicKey(idlJson.metadata.address);
const network = clusterApiUrl("devnet");

/* This controls how we want to acknowledge when a tx is done. Basically,
we can choose when to receive a confirmation for when a tx has succeeded.
Because the blockchain is fully decentralized. We can choose how long we
want to wait for a tx. Do you want to wait for just one note to acknowledge
our tx? Do you want to wait for the whole Solana chain to acknowledge
our tx? In this case we simply wait for our tx to be confirmed by
the node where connected to. This is generally ok. But if you want to be
super sure, you may use something like "finalized" value. But for now,
let's just stick with processed. */
const opts: SendOptions = {
  preflightCommitment: "processed",
};

/* We will use this for calling our SC functions. */
const { SystemProgram } = web3;

export type CampaignType = {
  pubkey: web3.PublicKey;
  admin: web3.PublicKey;
  name: string;
  description: string;
  amountDonated: BN;
};

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignType[] | null>(null);

  /* This is creating a provider. A provider is an authenticated connection
  to Solana. Notice how window.solana is needed here. Why? Because
  to make it provider we need a connected wallet. You already did
  this earlier when you could connect on Phantom, which gave you permisson
  to give our web app access to our wallet. Remember, you can't communicate
  with Solana at all, unless (olmadıkça, olmazsa) you have a connected wallet. */
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts);
    return provider;
  };

  const checkIfWalletConnected = async () => {
    try {
      /* If you have the phantom wallet installed, it will automatically inject a special
      object called solana into your window object. Then we can retrieve that object.
      
      https://stackoverflow.com/questions/73190843/what-is-window-solana-type

      */

      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found.");

          /* After checking `solana` object in `window` object
          then you can start to fun. Once we have access to solana object, we can
          start getting access to the functions of our Solana program. Basically
          the phantom wallet doesn't just give out walelt credentials to every
          website we go to. It only gives it to the websites that we authorize.
          */

          /* This tells the Phantom wallet that our app is authorized to
          access information about our wallet. But there is one argument
          we need to add. Which will be an object, an insider approach only
          if trusted is true. */
          const response = await solana.connect({
            onlyIfTrusted: true,
          });

          console.log(
            "Connected with public key:",
            response.publicKey.toString()
          );

          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert(
          "Not found any wallet, please install Phantom wallet to your browser."
        );
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error(e);
      }

      /* If Phantom doesn't allow our web app for connect to users wallet then it
      will throw an error. For allowing  */
    }
  };

  const getCampaigns = async () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = getProvider();
    const program = new Program<Crowdfunding>(IDL, programId, provider);

    /* In here we're rocking roll. */
    const campaignsResult = await Promise.all(
      (
        await connection.getProgramAccounts(programId)
      ).map(async (campaign) => ({
        ...(await program.account.campaign.fetch(campaign.pubkey)),
        pubkey: campaign.pubkey,
      }))
    );

    console.log(">>>  campaignsResult:", campaignsResult);

    setCampaigns(campaignsResult);
  };

  const createCampaign = async () => {
    await tryCall(async () => {
      // We need provider and program
      const provider = getProvider();
      const program = new Program<Crowdfunding>(IDL, programId, provider);

      const [campaign] = await PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .create("campaign name", "campaign description")
        .accounts({
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(">>>  tx:", tx);

      console.log(
        ">> Created a new campaign w/ address: ",
        campaign.toString()
      );
    });
  };

  const donate = async (publicKey: string) => {
    await tryCall(async () => {
      const provider = getProvider();
      const program = new Program<Crowdfunding>(IDL, programId, provider);

      const donateResult = await program.methods
        .donate(new BN(0.2 * web3.LAMPORTS_PER_SOL))
        .accounts({
          campaign: publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log(">>>  donateResult:", donateResult);
      await getCampaigns();
    });
  };

  const withdraw = async (publicKey: string) => {
    await tryCall(async () => {
      const provider = getProvider();
      const program = new Program<Crowdfunding>(IDL, programId, provider);

      const donateResult = await program.methods
        .withdraw(new BN(0.2 * web3.LAMPORTS_PER_SOL))
        .accounts({
          /* This time it still consist of the `campaign` and `user`. But we don't need
          the `systemProgram` so we can actually just get rid of this. Why? Because
          for the withdraw function, this campaign is a program derived account and we're
          withdrawing funds out of the campaign, which means our Solana program will take
          care of authorizing the tx. The `systemProgram` is only needed if the tx is sending
          funds from a users's wallet, which is not the case with the withdraw function. */
          campaign: publicKey,
          user: provider.wallet.publicKey,
        })
        .rpc();
      console.log(">>>  donateResult:", donateResult);
      await getCampaigns();
    });
  };

  const renderNotConnectedContainer = () => {
    return (
      <Button variant="primary" onClick={connectWallet}>
        Connect to wallet
      </Button>
    );
  };

  const renderConnectedContainer = () => {
    return (
      <>
        <Button variant="primary" onClick={createCampaign}>
          Create a campaign
        </Button>
        <Button variant="primary" onClick={getCampaigns}>
          Get Campaigns
        </Button>

        <br />
        {campaigns?.map((campaign, index) => (
          <div key={index}>
            <p>Campaign ID: {campaign.pubkey.toString()}</p>
            <p>
              Balance:
              {(
                campaign.amountDonated.toNumber() / web3.LAMPORTS_PER_SOL
              ).toString()}
            </p>
            <p>Name: {campaign.name}</p>
            <p>Description: {campaign.description}</p>
            <Button
              variant="success"
              onClick={() => donate(campaign.pubkey.toString())}
            >
              Click to donate!
            </Button>
            <Button
              variant="success"
              onClick={() => withdraw(campaign.pubkey.toString())}
            >
              Click to withdraw!
            </Button>

            <hr />
          </div>
        ))}
      </>
    );
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log("Connected with public key: ", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  useEffect(() => {
    /* We just need to call the check if wallet is connected function. So that
    we can use useEffect().
    
    I think this way is a little bit outdated. There must be more convenient ways
    for checking installed wallet. May be you can create a context and make all
    of these things in there. */

    const onLoadHandler = async () => {
      await checkIfWalletConnected();
    };
    window.addEventListener("load", onLoadHandler);

    return () => {
      window.removeEventListener("load", onLoadHandler);
    };
  }, []);

  return (
    <>
      <Header />

      <Routes>
        <Route index element={<MainPage />} />
      </Routes>
      <main>
        <div className="container marketing">
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
