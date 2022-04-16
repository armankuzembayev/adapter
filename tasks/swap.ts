import { task } from "hardhat/config";


task("swap", "Swap tokens")
    .addParam("token", "Token address")
    .addParam("amount", "Amount In")
    .addParam("amountmin", "Amount Out Min")
    .addParam("path", "Path to token")
    .addParam("to", "Send to")
    .setAction(async  (taskArgs, { ethers }) => {

    const adapter = await ethers.getContractAt("Adapter", taskArgs.token);
    await adapter.swap(
        taskArgs.amount, 
        taskArgs.amountmin,
        taskArgs.path,
        taskArgs.to);    
});