import { seedUtils } from "@waves/waves-transactions"

export class NeutrinoContractAccounts{
    oracles: Array<seedUtils.Seed>;
    admins: Array<seedUtils.Seed>;
    auctionContract: seedUtils.Seed;
    neutrinoContract: seedUtils.Seed;
    rpdContract: seedUtils.Seed;
    controlContract: seedUtils.Seed; 
    liquidationContract: seedUtils.Seed;
}