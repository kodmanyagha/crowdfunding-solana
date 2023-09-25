import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crowdfunding } from "../target/types/crowdfunding";

describe("crowdfunding", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const userWallet = anchor.web3.Keypair.generate();

  const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;

  it("call create() function success.", async () => {
    const tx = await program.methods
      .create("foo", "bar")
      .accounts({
        user: provider.publicKey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
