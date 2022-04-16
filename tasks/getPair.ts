import { task } from "hardhat/config";


task("getPair", "Get pair")
    .addParam("token", "Token address")
    .addParam("token1", "First token")
    .addParam("token2", "Second token")
    .setAction(async  (taskArgs, { ethers }) => {

    const adapter = await ethers.getContractAt("Adapter", taskArgs.token);
    await adapter.createPair(taskArgs.token1, taskArgs.token2);
    const pair = await adapter.getPair(taskArgs.token1, taskArgs.token2);

    console.log("Pair address:", pair);
    
});