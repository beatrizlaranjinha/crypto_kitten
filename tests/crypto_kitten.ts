import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CryptoKitten } from "../target/types/crypto_kitten";

describe("crypto_kitten", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CryptoKitten as Program<CryptoKitten>;

  it("Creates a cat", async () => {
    const catAccount = anchor.web3.Keypair.generate();

    await program.methods
      .createCat("Mimi")
      .accounts({
        catAccount: catAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([catAccount])
      .rpc();

    const catData = await program.account.cat.fetch(catAccount.publicKey);

    console.log("Cat owner:", catData.owner.toBase58());
    console.log("Cat name:", catData.name);
    console.log("Cat level:", catData.level);
  });
});
