import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
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

  // nome do gato a criar
  const name = "fibonacciiiii";

  // calcular a PDA do gato a partir do nome
  const [catPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("cat"), Buffer.from(name)],
    program.programId
  );

  // chamar a função create_cat do programa
  console.log("Creating cat...");
  await program.methods
    .createCat(name)
    .accounts({
      user: provider.wallet.publicKey, // quem cria o gato
    })
    .rpc();

  // ir buscar os dados do gato criado
  const cat = await program.account.cat.fetch(catPda);

  console.log(`
    |\\__/,|   (\`\\
  _.|o o  |_   ) )
-(((---(((--------
  `);

  // mostrar informação do gato
  console.log("Address:", catPda.toBase58());
  console.log("Owner:", cat.owner.toBase58());
  console.log("Name:", cat.name);
  console.log("Level:", cat.level);
  console.log("DNA:", cat.dna.toString());
}

// correr a função principal
main().catch((err) => {
  console.error(err);
});
