import { task } from "hardhat/config";


task("addLiquidity", "Add Liquidity")
    .addParam("token", "Token address")
    .addParam("token1", "First token")
    .addParam("token2", "Second token")
    .addParam("amount1", "First amount")
    .addParam("amount2", "Second amount")
    .addParam("amount1min", "First amount min")
    .addParam("amount2min", "Second amount min")
    .addParam("to", "Send to")
    .setAction(async  (taskArgs, { ethers }) => {

    const adapter = await ethers.getContractAt("Adapter", taskArgs.token);
    await adapter.addLiquidity(
        taskArgs.token1, taskArgs.token2,
        taskArgs.amount1, taskArgs.amount2,
        taskArgs.amount1min, taskArgs.amount2min,
        taskArgs.to);    
});