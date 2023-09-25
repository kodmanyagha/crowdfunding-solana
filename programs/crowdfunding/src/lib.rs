use anchor_lang::prelude::*;

declare_id!("4Mhozxxdm44cTcC22gpCpiQiHEtaaPCkdDG2ULrPrCVy");

#[program]
pub mod crowdfunding {
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    use super::*;

    pub fn create(ctx: Context<Create>, name: String, description: String) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        campaign.name = name;
        campaign.description = description;
        campaign.amount_donated = 0;
        campaign.admin = *ctx.accounts.user.key;

        //let foo = Some(10);
        //foo.and_then(|x| {
        //    println!("{}", x);
        //    Some(x)
        //})
        //.and_then(|x| {
        //    println!("{}", x);
        //    Some(x)
        //});

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        let user = &mut ctx.accounts.user;

        if campaign.admin != *user.key {
            return Err(ProgramError::IncorrectProgramId);
        }

        /* Because the rent is based on the amount of data that's stored
        in the account. In other words, the data loads. And then we subtract
        the rent from the campaign balance in the if statement. */
        let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());

        if **campaign.to_account_info().lamports.borrow() - rent_balance < amount {
            return Err(ProgramError::InsufficientFunds);
        }

        /* When you initialize any account in Solana, the acoount needs
        to store some SOL as rent in over some period of time. That SOL
        reserved for rent will eventually be collected and either
        needs to be replenished (doldurulan) or the account won't be usable anymore.
        Alternatively, if two years worth of rent is stored in the Solana
        account's balance and no rent will be collected and the account
        can be used indefinitely (süresiz olarak). This is what we called
        rent exemption (muafiyet). */

        /* Olaylar olaylar. Şuraya bak aga evlere şenlik. Düğün var düğün
        koşun gelin mevzu çıktı. Olim bu ne çift yıldızlar soru işaretleri
        falanlar filanlar. Neler oluyor olim burda? Bir de tutorialda
        "This is pretty simple actually" demesi yok mu kahroldum orda. */
        **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
        **user.to_account_info().try_borrow_mut_lamports()? += amount;

        Ok(())
    }

    /* In this function, we're going to transfer funds from the users account
    and transfer those funds into the campaign account. However, the way we
    transfer funds in the donate function will be different from the way
    we did it in the withdrawal function. */
    pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult {
        let instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.campaign.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &instruction,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.campaign.to_account_info(),
            ],
        )?;

        ctx.accounts.campaign.amount_donated += amount;
        //(&mut ctx.accounts.campaign).amount_donated += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    /* For this project the campaign account needs to be a program derived account.
    Why? Because in this project we're dealing with actual funds. The campaign
    account needs to be able to send funds from itself to someone else. Like when
    a campaign admin wants to withdraw money from his campaign. Their campaign account
    needs to be able to send money from itself to the admin. But tihs campaign acount
    isn't a wallet that's controlled by a user. So in this case, the campaign account
    needs to actually get permission from our program to send money. And that's why
    the campaign account needs to be a program derived account. So how do we make
    the campaign account a program derived account? Two things we need to add to the
    macro for the campaign. First, we'll add an array called `seeds`, and we'll
    specify two seeds. First we'll do CAMPAIGN_DEMO, and user.key().as_ref().
    So with the seeds that we specified, so we're usign CAMPAIGN_DEMO and also
    the user's public key and using these seeds Solana will use a hash function
    to determine the address for a new program derived account. However, there
    is a possibility that the address that the hash function generated is already
    being used for someone's wallet somewhere, in which case we can add a `bump` like
    this. What this does is add an eight bit bump to the hash function until we
    find an address that isn't being used for a wallet. Now, we're almost done with
    the create functionality. */
    #[account(init, payer=user, space=9000, seeds=[b"CAMPAIGN_DEMO".as_ref(), user.key().as_ref()], bump)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/* Specify that this is a context. */
#[derive(Accounts)]
pub struct Withdraw<'info> {
    /* We only need two accounts. One is campaign and other is user as signer.
    Both of them must be mutable and for making this we must add `account(mut)`
    macro. */
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub user: Signer<'info>,
}

/* Remember how the system program is used to allow the user to authorize sending
money out of their wallet. That means for this context, we'll need the system
program. */
#[derive(Accounts)]
pub struct Donate<'info> {
    /* We only need two accounts. One is campaign and other is user as signer.
    Both of them must be mutable and for making this we must add `account(mut)`
    macro. */
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/* Over here first we'll add an `account` macro. So that's just account. In
campaign account we'll keep track of four things. First is the admin, which is
a Solana user has the ability to withdraw funds from the campaign. This will be
of type Pubkey. Then the name of our account. Then the description of our
account. And finally, the amount donated. And you'll see these match with the
properties that we used in our `create()` function. */
#[account]
pub struct Campaign {
    pub admin: Pubkey,
    pub name: String,
    pub description: String,
    pub amount_donated: u64,
}
