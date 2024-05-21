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
import idlJson from "../../types/crowdfunding/crowdfunding-idl.json";

import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { tryInvoke } from "../../types";

import { Crowdfunding, IDL } from "../../types/crowdfunding/crowdfunding";

const programId = new PublicKey(idlJson.metadata.address);
const network = clusterApiUrl("devnet");

const opts: SendOptions = {
  preflightCommitment: "processed",
};

const { SystemProgram } = web3;

export type CampaignType = {
  pubkey: web3.PublicKey;
  admin: web3.PublicKey;
  name: string;
  description: string;
  amountDonated: BN;
};

export default function CampaignManager(props: any) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignType[] | null>(null);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts);
    return provider;
  };

  const checkIfWalletConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found.");

          const response = await solana.connect({
            onlyIfTrusted: true,
          });

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
    }
  };

  const getCampaigns = async () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = getProvider();
    const program = new Program<Crowdfunding>(IDL, programId, provider);

    const campaignsResult = await Promise.all(
      (await connection.getProgramAccounts(programId)).map(
        async (campaign) => ({
          ...(await program.account.campaign.fetch(campaign.pubkey)),
          pubkey: campaign.pubkey,
        })
      )
    );

    console.log(">>>  campaignsResult:", campaignsResult);

    //setCampaigns(campaignsResult);
  };

  const createCampaign = async () => {
    await tryInvoke(async () => {
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
    await tryInvoke(async () => {
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
    await tryInvoke(async () => {
      const provider = getProvider();
      const program = new Program<Crowdfunding>(IDL, programId, provider);

      const donateResult = await program.methods
        .withdraw(new BN(0.2 * web3.LAMPORTS_PER_SOL))
        .accounts({
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
        &nbsp;
        <Button variant="primary" onClick={getCampaigns}>
          Get Campaigns
        </Button>
        <br />
        Connected wallet: <strong>{walletAddress}</strong>
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
    const onLoadHandler = async () => {
      await checkIfWalletConnected();
    };
    window.addEventListener("load", onLoadHandler);

    return () => {
      window.removeEventListener("load", onLoadHandler);
    };
  }, []);

  return (
    <main>
      <div className="container marketing">
        <h1 className="mb-3">Crowdfunding With Solana</h1>

        <hr />

        {!!walletAddress
          ? renderConnectedContainer()
          : renderNotConnectedContainer()}
      </div>
    </main>
  );
}
