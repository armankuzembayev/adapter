import { task } from "hardhat/config";


task("removeLiquidity", "Remove Liquidity")
    .addParam("token", "Token address")
    .addParam("token1", "First token")
    .addParam("token2", "Second token")
    .addParam("liquidity", "Liquidity")
    .addParam("amount1min", "First amount min")
    .addParam("amount2min", "Second amount min")
    .addParam("to", "Send to")
    .setAction(async  (taskArgs, { ethers }) => {

    const adapter = await ethers.getContractAt("Adapter", taskArgs.token);
    await adapter.removeLiquidity(
        taskArgs.token1, taskArgs.token2,
        taskArgs.liquidity,
        taskArgs.amount1min, taskArgs.amount2min,
        taskArgs.to);    
});