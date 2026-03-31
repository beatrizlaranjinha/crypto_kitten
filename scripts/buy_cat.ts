import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import idl from "../target/idl/crypto_kitten.json";
import { CryptoKitten } from "../target/types/crypto_kitten";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program(
    idl as CryptoKitten,
    provider
  ) as Program<CryptoKitten>;

  const name = "Mimi";

  const [catPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("cat"), Buffer.from(name)],
    program.programId
  );

  const buyer = Keypair.generate();

  console.log("Airdropping SOL to buyer...");

  const sig = await provider.connection.requestAirdrop(
    buyer.publicKey,
    1_000_000_000
  );
  await provider.connection.confirmTransaction(sig);

  console.log("Buying cat...");

  await program.methods
    .buyCat()
    .accounts({
      catAccount: catPda,
      buyer: buyer.publicKey,
      seller: provider.wallet.publicKey,
    })
    .signers([buyer])
    .rpc();

  const cat = await program.account.cat.fetch(catPda);

  console.log("----- CAT BOUGHT -----");
  console.log("Cat Address:", catPda.toBase58());
  console.log("New Owner:", cat.owner.toBase58());
  console.log("Name:", cat.name);
  console.log("Level:", cat.level);
  console.log("DNA:", cat.dna.toString());
}

main().catch((err) => {
  console.error(err);
});
