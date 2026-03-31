// importar bibliotecas necessárias (Anchor e Solana)
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

  // endereço do gato que queremos dar level up
  const catAddress = new PublicKey(
    "98u8byKU6pRysXgCw3B38iKPfMH4ERiyLaQqqECAx9vv"
  );

  // chamar a função level_up_cat do programa
  console.log("Leveling up cat...");
  await program.methods
    .levelUpCat()
    .accounts({
      catAccount: catAddress, // gato a atualizar
      user: provider.wallet.publicKey, // dono do gato (tem de assinar)
    })
    .rpc();

  // ir buscar os dados atualizados do gato
  const cat = await program.account["cat"].fetch(catAddress);

  // mostrar informação depois do level up
  console.log("----- CAT AFTER LEVEL UP -----");
  console.log("Address:", catAddress.toBase58());
  console.log("Owner:", cat.owner.toBase58());
  console.log("Name:", cat.name);
  console.log("Level:", cat.level);
  console.log("DNA:", cat.dna.toString());
}

// correr a função principal
main().catch((err) => {
  console.error(err);
});
