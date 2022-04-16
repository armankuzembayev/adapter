import { ethers } from "hardhat";

import * as Configs from "../config"

async function main() {

    const Acdm = await ethers.getContractFactory("Erc20");
    const acdm = await Acdm.deploy(
        Configs.nameACDM, Configs.symbolACDM, 
        Configs.decimals, ethers.utils.parseEther(Configs.totalSupply)
    );
    await acdm.deployed();

    const Tst = await ethers.getContractFactory("Erc20");
    const tst = await Tst.deploy(
        Configs.nameTST, Configs.symbolTST, 
        Configs.decimals, ethers.utils.parseEther(Configs.totalSupply)
    );
    await tst.deployed();

    const Pop = await ethers.getContractFactory("Erc20");
    const pop = await Pop.deploy(
        Configs.namePOP, Configs.symbolPOP, 
        Configs.decimals, ethers.utils.parseEther(Configs.totalSupply)
    );

    await pop.deployed();

    console.log("ACDM deployed to:", acdm.address);
    console.log("TST deployed to:", tst.address);
    console.log("POP deployed to:", pop.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

