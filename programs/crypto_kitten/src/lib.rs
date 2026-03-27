use anchor_lang::prelude::*;
//Importar a framework

declare_id!("EzMSo5rEQjNAKwkFpuLRJ5Hna3JVruA55mnGMBiZv6wq"); // endereço da blockchain

//contrato
#[program]
pub mod crypto_kitten {
    //aquui dentro ficam instruções
    use super::*;

    //instrução da blockchain
    // ctx contém tudo a que a função precisa : accounts , wallet e sistema
    pub fn create_cat(ctx: Context<CreateCat>, name: String) -> Result<()> {
        let cat = &mut ctx.accounts.cat_account; //aceder a conta onde o gato é guardado
        cat.owner = ctx.accounts.user.key(); //guardar o dono
        cat.name = name; //guardar o nome
        cat.level = 1; //nivel inicial
        Ok(())
    }
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

//estrutura do gato
//
#[account]
#[derive(InitSpace)]
pub struct Cat {
    pub owner: Pubkey, //dono do gato
    #[max_len(50)]
    pub name: String, //maximo de 50 caracteres
    pub level: u8,     //nivel
}
