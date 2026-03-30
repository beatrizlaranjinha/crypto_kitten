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

  const name = "fibo";

  const [catPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("cat"), Buffer.from(name)],
    program.programId
  );

  console.log("Creating cat...");

  await program.methods
    .createCat(name)
    .accounts({
      user: provider.wallet.publicKey,
    })
    .rpc();

  const cat = await program.account.cat.fetch(catPda);

  console.log("----- CAT CREATED -----");
  console.log("Address:", catPda.toBase58());
  console.log("Owner:", cat.owner.toBase58());
  console.log("Name:", cat.name);
  console.log("Level:", cat.level);
  console.log("DNA:", cat.dna.toString());
}

main().catch((err) => {
  console.error(err);
});
