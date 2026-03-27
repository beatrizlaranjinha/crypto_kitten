use anchor_lang::prelude::*;

declare_id!("EzMSo5rEQjNAKwkFpuLRJ5Hna3JVruA55mnGMBiZv6wq");

#[program]
pub mod crypto_kitten {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
