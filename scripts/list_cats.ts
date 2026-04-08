import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "../target/idl/crypto_kitten.json";
import { CryptoKitten } from "../target/types/crypto_kitten";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program(
    idl as CryptoKitten,
    provider
  ) as Program<CryptoKitten>;

  const cats = await program.account.cat.all();

  console.log("----- ALL CATS -----");

  cats.forEach((catData, index) => {
    const cat = catData.account;

    console.log(`\nCat #${index + 1}`);
    console.log("Address:", catData.publicKey.toBase58());
    console.log("Owner:", cat.owner.toBase58());
    console.log("Name:", cat.name);
    console.log("Level:", cat.level);
    console.log("DNA:", cat.dna.toString());
  });
}

main().catch((err) => {
  console.error(err);
});
