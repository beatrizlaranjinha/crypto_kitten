import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../target/idl/crypto_kitten.json";
import { CryptoKitten } from "../target/types/crypto_kitten";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program(
    idl as CryptoKitten,
    provider
  ) as Program<CryptoKitten>;

  const catAddress = new PublicKey(
    "6cC9o58L5zwwFrDbJFSmwEBuspUykfNkUvhngiC6U7TH"
  );

  console.log("Leveling up cat...");

  await program.methods
    .levelUpCat()
    .accounts({
      catAccount: catAddress,
      user: provider.wallet.publicKey,
    })
    .rpc();

  const cat = await program.account["cat"].fetch(catAddress);

  console.log("----- CAT AFTER LEVEL UP -----");
  console.log("Address:", catAddress.toBase58());
  console.log("Owner:", cat.owner.toBase58());
  console.log("Name:", cat.name);
  console.log("Level:", cat.level);
  console.log("DNA:", cat.dna.toString());
}

main().catch((err) => {
  console.error(err);
});
