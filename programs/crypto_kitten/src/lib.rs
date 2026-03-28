use anchor_lang::prelude::*;
use solana_sha256_hasher::hash;
//Importar a framework

declare_id!("DYRqYYqzCTXk6ihmAjSpK2PmoHhLfgEWGCZrNNCiNf3L"); // endereço da blockchain

const DNA_DIGITS: u64 = 16; //valor fixo de dna
const DNA_MODULUS: u64 = 10u64.pow(DNA_DIGITS as u32); //delimitar os 16 digitos random % 10^16

//contrato
#[program]
pub mod crypto_kitten {
    //aquui dentro ficam instruções
    use super::*;

    //instrução da blockchain
    // ctx contém tudo a que a função precisa : accounts , wallet e sistema
    pub fn create_cat(ctx: Context<CreateCat>, name: String) -> Result<()> {
        let cat = &mut ctx.accounts.cat_account; //aceder a conta onde o gato é guardado
        let dna = _generate_random_dna(&name); //gerar DNA automaticamente a partir do nome

        cat.owner = ctx.accounts.user.key(); //guardar o dono
        cat.name = name.clone(); //guardar o nome
        cat.level = 1; //nivel inicial
        cat.dna = dna;

        emit!(CatCreated {
            owner: ctx.accounts.user.key(),
            name,
            dna,
        }); //guarda o owner name dna

        Ok(())
    }

    pub fn level_up_cat(ctx: Context<LevelUpCat>) -> Result<()> {
        let cat = &mut ctx.accounts.cat_account;
        require_keys_eq!(cat.owner, ctx.accounts.user.key(), CustomError::NotOwner); //verifica se quem esta a chamar é o dono
        cat.level += 1; //aumenta de nivel
        Ok(())
    }
}

//função privada
fn _generate_random_dna(name: &str) -> u64 {
    let hash_result = hash(name.as_bytes());
    let bytes = hash_result.to_bytes();

    let mut first_eight = [0u8; 8];
    first_eight.copy_from_slice(&bytes[..8]); //Usa só os 8 bytes

    let number = u64::from_le_bytes(first_eight);
    number % DNA_MODULUS //garante no max. 16 digits
                         //mimi -> hash -> numero -> DNA(16DIGITS)
}

#[event]
pub struct CatCreated {
    pub owner: Pubkey,
    pub name: String,
    pub dna: u64,
}

#[derive(Accounts)]
pub struct CreateCat<'info> {
    //conta do gato
    #[account(
        init, //cria uma nova account
        payer = user, //quem paga é o utilizador
        space = 8 + Cat::INIT_SPACE //quanto espaço vai ocupar
    )]
    pub cat_account: Account<'info, Cat>,

    #[account(mut)]
    pub user: Signer<'info>, //quem esta a chamar a função tem de assinar a transação , é a wallet

    pub system_program: Program<'info, System>, //para criar accounts na blockchain
}

#[derive(Accounts)]
pub struct LevelUpCat<'info> {
    #[account(mut)]
    pub cat_account: Account<'info, Cat>,

    #[account(mut)]
    pub user: Signer<'info>,
}

//estrutura do gato
//
#[account]
#[derive(InitSpace)]
pub struct Cat {
    pub owner: Pubkey, //dono do gato
    #[max_len(50)]
    pub name: String, //maximo de 50 caracteres
    pub level: u8,     //nivel
    pub dna: u64,
}

#[error_code]
pub enum CustomError {
    #[msg("Apenas o dono do gato pode fazer level up.")]
    NotOwner,
}
