import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import idl from "../target/idl/crypto_kitten.json";
import { CryptoKitten } from "../target/types/crypto_kitten";

// função principal
async function main() {
  // configurar o provider (wallet + rede)
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // carregar o programa (smart contract)
  const program = new Program(
    idl as CryptoKitten,
    provider
  ) as Program<CryptoKitten>;

  // nome do gato que vamos comprar
  const name = "fibonacciiiii";

  // calcular a PDA do gato a partir do nome
  const [catPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("cat"), Buffer.from(name)],
    program.programId
  );

  // criar um novo utilizador (buyer)
  const buyer = Keypair.generate();

  // dar SOL ao buyer para ele poder comprar
  console.log("Airdropping SOL to buyer...");
  const sig = await provider.connection.requestAirdrop(
    buyer.publicKey,
    1_000_000_000
  );
  await provider.connection.confirmTransaction(sig);

  // chamar a função buy_cat do programa
  console.log("Buying cat...");
  await program.methods
    .buyCat()
    .accounts({
      catAccount: catPda, // gato que vai ser comprado
      buyer: buyer.publicKey, // quem compra
      seller: provider.wallet.publicKey, // quem vende (dono atual)
    })
    .signers([buyer]) // buyer tem de assinar (vai pagar)
    .rpc();

  // ir buscar os dados atualizados do gato
  const cat = await program.account.cat.fetch(catPda);

  // mostrar resultado final
  console.log("----- CAT BOUGHT -----");
  console.log("Cat Address:", catPda.toBase58());
  console.log("New Owner:", cat.owner.toBase58());
  console.log("Name:", cat.name);
  console.log("Level:", cat.level);
  console.log("DNA:", cat.dna.toString());
}

// correr a função principal
main().catch((err) => {
  console.error(err);
});
