import { ethers } from "hardhat";


async function main() {

    const Adapter = await ethers.getContractFactory("Adapter");
    const adapter = await Adapter.deploy();

    await adapter.deployed();

    console.log("Adapter deployed to:", adapter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

