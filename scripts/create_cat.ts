import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, Keypair } from "@solana/web3.js";
import idl from "../target/idl/crypto_kitten.json";
import { CryptoKitten } from "../target/types/crypto_kitten";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program(
    idl as CryptoKitten,
    provider
  ) as Program<CryptoKitten>;

  const catAccount = Keypair.generate();

  console.log("Creating cat...");

  await program.methods
    .createCat("Mimi")
    .accounts({
      catAccount: catAccount.publicKey,
      user: provider.wallet.publicKey,
    })
    .signers([catAccount])
    .rpc();

  const cat = await program.account["cat"].fetch(catAccount.publicKey);

  console.log("----- CAT CREATED -----");
  console.log("Address:", catAccount.publicKey.toBase58());
  console.log("Owner:", cat.owner.toBase58());
  console.log("Name:", cat.name);
  console.log("Level:", cat.level);
  console.log("DNA:", cat.dna.toString());
}

main().catch((err) => {
  console.error(err);
});
