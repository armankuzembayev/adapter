const { expect } = require("chai");
const { ethers } = require("hardhat");

import * as Configs from "../config"

describe("Adapter", function ()  {

    let Adapter: any;
    let adapter: any;
    let ACDM: any;
    let acdm: any;
    let TST: any;
    let tst: any;
    let POP: any;
    let pop: any;

    let factoryContract: any;
    let routerContract: any;
    let owner: any;
    let addr1: any;
    let addr2: any;
    let addr3: any;
    let zeroAddress = ethers.utils.getAddress(Configs.zeroAddress)

    beforeEach(async function() {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        ACDM = await ethers.getContractFactory("Erc20");
        let name = Configs.nameACDM;
        let symbol = Configs.symbolACDM;
        const decimals = Configs.decimals;
        const totalSupply = Configs.totalSupply;

        acdm = await ACDM.deploy(name, symbol, decimals, ethers.utils.parseEther(totalSupply));
        await acdm.deployed();

        TST = await ethers.getContractFactory("Erc20");
        name = Configs.nameTST;
        symbol = Configs.symbolTST;

        tst = await TST.deploy(name, symbol, decimals, ethers.utils.parseEther(totalSupply));
        await tst.deployed();

        POP = await ethers.getContractFactory("Erc20");
        name = Configs.namePOP;
        symbol = Configs.symbolPOP;

        pop = await POP.deploy(name, symbol, decimals, ethers.utils.parseEther(totalSupply));
        await pop.deployed();


        factoryContract = await ethers.getContractAt("IUniswapV2Factory", Configs.factoryAddress);

        routerContract = await ethers.getContractAt("IUniswapV2Router", Configs.routerAddress);

        Adapter = await ethers.getContractFactory("Adapter");

        adapter = await Adapter.deploy();
        await adapter.deployed();

        await acdm.approve(adapter.address, ethers.utils.parseEther("1000"));
        await tst.approve(adapter.address, ethers.utils.parseEther("1000"));
        await pop.approve(adapter.address, ethers.utils.parseEther("1000"));
        
        await acdm.mint(owner.address, ethers.utils.parseEther("10000"));
        await tst.mint(owner.address, ethers.utils.parseEther("10000"));
        await pop.mint(owner.address, ethers.utils.parseEther("10000"));
    });


    describe("CreatePair", function() {

        it("Should create or get pair correctly", async function() {
            await expect(adapter.createPair(acdm.address, zeroAddress)).
            to.be.revertedWith("Zero address provided");

            await adapter.createPair(acdm.address, tst.address);

            let pair = adapter.getPair(acdm.address, tst.address);
            expect(await adapter.createPair(acdm.address, tst.address)).
            to.emit(adapter, "Pair").withArgs(pair);   
        });
    });

    describe("Add and Remove Liquidity", function() {

        it("Should add liquidity correctly", async function() {
            
            await adapter.createPair(acdm.address, tst.address);

            await adapter.addLiquidity(
                acdm.address, tst.address, 
                ethers.utils.parseEther("10"), ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1"), ethers.utils.parseEther("1"),
                owner.address
            );
            
            let amountA;
            let amountB; 
            let liquidity;

            await adapter.on("AddLiquidity", async (amountA : any, amountB : any, liquidity : any) => {

                expect(amountA).equal(ethers.utils.parseEther("10"));
                expect(amountB).equal(ethers.utils.parseEther("100"));

                const balance = await adapter.getPairBalance(acdm.address, tst.address);
                expect(liquidity).equal(balance);
            });

        });

        it("Should remove liquidity correctly", async function() {
            
            await adapter.createPair(acdm.address, tst.address);

            await adapter.addLiquidity(
                acdm.address, tst.address, 
                ethers.utils.parseEther("10"), ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1"), ethers.utils.parseEther("1"),
                owner.address
            );
            
            const balance = await adapter.getPairBalance(acdm.address, tst.address);

            const pair = await adapter.getPair(acdm.address, tst.address);
            const pairContract = await ethers.getContractAt("Erc20", pair);
            await pairContract.approve(adapter.address, ethers.utils.parseEther("1000"));

            await adapter.removeLiquidity(
                acdm.address, tst.address,
                balance,
                ethers.utils.parseEther("1"), ethers.utils.parseEther("1"),
                owner.address
            );

            let amountAA;
            let amountBB;

            await adapter.on("RemoveLiquidity", async (amountAA : any, amountBB : any) => {

                expect(amountAA).equal(ethers.utils.parseEther("10"));
                expect(amountBB).equal(ethers.utils.parseEther("100"));

                expect(await adapter.getPairBalance(acdm.address, tst.address)).
                to.be.equal(ethers.utils.parseEther("0"));
            });

        });

        it("Should add liquidity eth correctly", async function() {
            
            await adapter.createPair(acdm.address, Configs.wethAddress);

            const tx = {
                value: ethers.utils.parseEther("2")
            }

            await adapter.addLiquidityETH(
                acdm.address,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1"), ethers.utils.parseEther("1"),
                owner.address, tx
            );
            
            let amountA;
            let amountB;
            let liquidity;

            await adapter.on("AddLiquidity", async (amountA : any, amountB : any, liquidity : any) => {

                expect(amountA).equal(ethers.utils.parseEther("100"));
                expect(amountB).equal(ethers.utils.parseEther("2"));

                const balance = await adapter.getPairBalance(acdm.address, tst.address);
                expect(liquidity).equal(balance);
            });
        });

        it("Should remove liquidity ETH correctly", async function() {
            
            await adapter.createPair(acdm.address, Configs.wethAddress);

            const tx = {
                value: ethers.utils.parseEther("2")
            }

            await adapter.addLiquidityETH(
                acdm.address,
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1"), ethers.utils.parseEther("1"),
                owner.address, tx
            );
        

            const balance = await adapter.getPairBalance(acdm.address, Configs.wethAddress);

            const pair = await adapter.getPair(acdm.address, Configs.wethAddress);
            const pairContract = await ethers.getContractAt("Erc20", pair);
            await pairContract.approve(adapter.address, ethers.utils.parseEther("1000"));

            await adapter.removeLiquidityETH(
                acdm.address,
                balance,
                ethers.utils.parseEther("1"), ethers.utils.parseEther("1"),
                owner.address
            );

            let amountToken;
            let amountETH;

            await adapter.on("RemoveLiquidity", async (amountToken : any, amountETH : any) => {

                expect(amountToken).equal(ethers.utils.parseEther("100"));
                expect(amountETH).equal(ethers.utils.parseEther("2"));

                expect(await adapter.getPairBalance(acdm.address, Configs.wethAddress)).
                to.be.equal(ethers.utils.parseEther("0"));
            });
        });
    });

    describe("Swap", function() {

        it("Should swap correctly", async function() {
            
            await adapter.createPair(acdm.address, tst.address);
            await adapter.createPair(acdm.address, pop.address);

            await adapter.addLiquidity(
                acdm.address, tst.address, 
                ethers.utils.parseEther("10"), ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1"), ethers.utils.parseEther("1"),
                owner.address
            );

            await adapter.addLiquidity(
                acdm.address, pop.address, 
                ethers.utils.parseEther("50"), ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1"), ethers.utils.parseEther("1"),
                owner.address
            );

            const path = [tst.address, acdm.address, pop.address];

            await adapter.swap(
                ethers.utils.parseEther("10"),
                ethers.utils.parseEther("0.1"),
                path,
                owner.address
            );
            
            let amount;

            await adapter.on("Swap", async (amount : any) => {
                expect(amount).equal(ethers.utils.parseEther("2"));
            });

        });
    });

    describe("Get amount", function() {

        it("Should get amount correctly", async function() {
            
            await adapter.createPair(acdm.address, tst.address);

            await adapter.addLiquidity(
                acdm.address, tst.address, 
                ethers.utils.parseEther("10"), ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1"), ethers.utils.parseEther("1"),
                owner.address
            );

            const path = [tst.address, acdm.address];

            expect(await adapter.getAmountsOut(
                ethers.utils.parseEther("20"),
                path
            )).to.be.at.most(ethers.utils.parseEther("2"));
        });
    });
});