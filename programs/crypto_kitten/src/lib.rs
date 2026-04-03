use anchor_lang::prelude::*;
use solana_sha256_hasher::hash;
//Importar a framework

declare_id!("DYRqYYqzCTXk6ihmAjSpK2PmoHhLfgEWGCZrNNCiNf3L");
const DNA_DIGITS: u64 = 16; //valor fixo de dna
const DNA_MODULUS: u64 = 10u64.pow(DNA_DIGITS as u32); //delimitar os 16 digitos random % 10^16
const BASE_PRICE: u64 = 1_000_000_000; //preço base do gato

//contextossssss
#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCat<'info> {
    //conta do gato
    #[account(
        init, //cria uma nova account
        seeds = [b"cat", name.as_bytes()], //usar o nome como seed
        bump, //ajusta para garantir que não faz parte da curva ed...blahblahbah
        payer = user, //quem paga é o utilizador
        space = 8 + Cat::INIT_SPACE //quanto espaço vai ocupar -> a blockchain precisa de saber com antecedencia
    )]
    pub cat_account: Account<'info, Cat>, //o info é uma referencia para as contas (ensures that account information remains valid while being processed)

    #[account(mut)]
    pub user: Signer<'info>, //quem esta a chamar a função tem de assinar a transação , é a wallet

    pub system_program: Program<'info, System>, //para criar accounts na blockchain //system pertence ao anchor e mostra que a conta é segura e válida
}

#[derive(Accounts)]
pub struct LevelUpCat<'info> {
    #[account(mut)]
    pub cat_account: Account<'info, Cat>, //conta onde o gato esta guardado

    #[account(mut)]
    pub user: Signer<'info>, //o utlizador chama a função e tem de assinar a transação
}

#[derive(Accounts)]
pub struct BuyCat<'info> {
    #[account(mut)]
    pub cat_account: Account<'info, Cat>, //conta do gato que vai ser comprado

    #[account(mut)]
    pub buyer: Signer<'info>, //quem compra o gato

    #[account(mut)]
    pub seller: Signer<'info>, //dono atual que vende o gato

    pub system_program: Program<'info, System>, //necessário para transferir SOL
}

//estrutura do gato
#[account]
#[derive(InitSpace)]
pub struct Cat {
    pub owner: Pubkey, //dono do gato
    #[max_len(50)]
    pub name: String, //maximo de 50 caracteres
    pub level: u8,     //nivel
    pub dna: u64,      //o dna é u64 porque queremos guardar como um numero e não como hash
    pub bump: u8,      //é preciso guardar o bump porque precisamos dele para voltar a fazer o pda
}

#[event] //emitir as formações dos logs na block chain ("It logs “a cat was created with this owner, name and DNA”")
pub struct CatCreated {
    pub owner: Pubkey, //endreço da wallet que criou o gato
    pub name: String,  //nome do kitten
    pub dna: u64,
}

//mensagens de erro
#[error_code]
pub enum CustomError {
    #[msg("Apenas o dono do gato pode fazer level up.")]
    NotOwner,
}

//contrato
#[program]
pub mod crypto_kitten {
    //aquui dentro ficam instruções
    use super::*;

    //instrução da blockchain
    // ctx contém tudo a que a função precisa : accounts , wallet e sistema
    //função para criar gato
    pub fn create_cat(ctx: Context<CreateCat>, name: String) -> Result<()> {
        let cat = &mut ctx.accounts.cat_account; //aceder a conta onde o gato é guardado
        let dna = _generate_dna_from_name(&name); //gerar DNA automaticamente a partir do nome

        cat.owner = ctx.accounts.user.key(); //guardar o dono
        cat.name = name.clone(); //guardar o nome
        cat.level = 1; //nivel inicial
        cat.dna = dna;
        cat.bump = ctx.bumps.cat_account; //Guarda o bump da pda do gato para poder recriar e validar esta conta no futuro

        emit!(CatCreated {
            //chama para ser apresentado no frontend
            owner: ctx.accounts.user.key(),
            name,
            dna,
        }); //guarda o owner name dna

        Ok(())
    }

    //função para o gato subir de nivel
    pub fn level_up_cat(ctx: Context<LevelUpCat>) -> Result<()> {
        let cat = &mut ctx.accounts.cat_account; //obtem a conta do gato e permite muda la
        require_keys_eq!(cat.owner, ctx.accounts.user.key(), CustomError::NotOwner); //verifica se quem esta a chamar é o dono
        cat.level += 1; //aumenta de nivel
        Ok(())
    }

    //função para comprar um gato
    pub fn buy_cat(ctx: Context<BuyCat>) -> Result<()> {
        let cat = &mut ctx.accounts.cat_account; //aceder à conta do gato

        require_keys_eq!(cat.owner, ctx.accounts.seller.key(), CustomError::NotOwner); //verifica se o seller é o dono atual

        let price = BASE_PRICE * cat.level as u64; //quanto maior o nivel, maior o preço

        let cpi_context = CpiContext::new(
            //cross program invocation -> para chamar outro programa
            ctx.accounts.system_program.to_account_info(), //passa a referencia para o system program , o system program é quem faz a transferencia de SOL
            anchor_lang::system_program::Transfer {
                //Dados da transferencia
                from: ctx.accounts.buyer.to_account_info(), //de onde sai o dinheiro
                to: ctx.accounts.seller.to_account_info(),  //para onde vai o dinheiro
            },
        );

        anchor_lang::system_program::transfer(cpi_context, price)?; //chama o system program e transfere sol de forma segura , anchor_lanf fornece ferramentas para interagir com a solana de forma simples

        cat.owner = ctx.accounts.buyer.key(); //mudar o dono do gato

        Ok(())
    }
}

//função privada
fn _generate_dna_from_name(name: &str) -> u64 {
    //u64 pq é guardado como numero
    let hash_result = hash(name.as_bytes()); //gera um hash a partir do nome
    let bytes = hash_result.to_bytes(); //este hash passa para um array bytes

    let mut first_eight = [0u8; 8]; //cria um array de 8 bytes (tamanho de um u64)
    first_eight.copy_from_slice(&bytes[..8]); //copia os 1os 8tes do hash

    let number = u64::from_le_bytes(first_eight); //converte esses8 num numero u64
    number % DNA_MODULUS //garante no max. 16 digits
                         //mimi -> hash -> numero -> DNA(16DIGITS)
}
