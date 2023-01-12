const { expect } = require("chai");
const BN = require("ethers").BigNumber;
const { ethers } = require("hardhat");
const {describe} = require("mocha");
require("@nomicfoundation/hardhat-chai-matchers");

const { BigNumber } = require("@ethersproject/bignumber");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const duration = {
  seconds(val) {
    return BN.from(val);
  },
  minutes(val) {
    return BN.from(val).mul(this.seconds("60"));
  },
  hours(val) {
    return new BN.from(val).mul(this.minutes("60"));
  },
  days(val) {
    return new BN.from(val).mul(this.hours("24"));
  },
  weeks(val) {
    return new BN.from(val).mul(this.days("7"));
  },
  years(val) {
    return new BN.from(val).mul(this.days("365"));
  },
};


describe("Testing uniswapv3  function", function(){

    beforeEach(async () => {

        [owner, user1 ,user2, user3, lptoken, lptoken1, lptoken2, user4, user5, ...addrs] = await ethers.getSigners();

        TOKEN1 = await ethers.getContractFactory("FIRSTTOKEN");
        token1 = await TOKEN1.deploy();
        
       // console.log("token1++++++++++++", await token1.address);

        TOKEN2 = await ethers.getContractFactory("SECONDTOKEN");
        token2 = await TOKEN2.deploy();
        //console.log("token2++++++++++++", await token2.address);

        WETh = await ethers.getContractFactory("WETH");
        Weth = await WETh.deploy();
        //console.log("Weth", await Weth.address) 
    
        // UniswapV3PoolDeployer = await ethers.getContractFactory("UniswapV3PoolDeployer");
        // Deployer = await UniswapV3PoolDeployer.deploy();
       // console.log("deployer", await Deployer.address);

        UniswapV3factory = await ethers.getContractFactory("UniswapV3Factory");
        Factory = await UniswapV3factory.deploy();
        console.log("factory",await Factory.address);

        CalHash = await ethers.getContractFactory("CalHash");
        callhash = await CalHash.deploy();
        console.log("init_code_hash ====>",await callhash.getInitHash());
        
        // let HASH = await pooladdresstest.POOL_INIT_CODE_HASH();
        // console.log("hash===",HASH)

        UniswapV3Pool = await ethers.getContractFactory("UniswapV3Pool");
       //v3pool = await UniswapV3Pool.deploy();

       NFTDescriptor = await ethers.getContractFactory("NFTDescriptor");
       nftdescriptor = await NFTDescriptor.deploy();

       NonfungibleTokenPositionDescriptor = await ethers.getContractFactory("NonfungibleTokenPositionDescriptor", {libraries: {NFTDescriptor: nftdescriptor.address }});
       nonfungibletokenpositiondescriptor = await NonfungibleTokenPositionDescriptor.deploy(Weth.address,"0x7dd481eb4b63b94bb55e6b98aabb06c3b8484f82a4d656d6bca0b0cf9b446be0");
             
        NonfungiblePositionManager = await ethers.getContractFactory("NonfungiblePositionManager");
        nonfungiblePositionManager = await NonfungiblePositionManager.deploy(Factory.address,Weth.address,nonfungibletokenpositiondescriptor.address);
        console.log("nonfungiblePositionManager",await nonfungiblePositionManager.address);

        QuoterV2 = await ethers.getContractFactory("QuoterV2");
        quoterv2 = await QuoterV2.deploy(Factory.address,Weth.address);

        SwapRouter = await ethers.getContractFactory("SwapRouter");
        swaprouter = await SwapRouter.deploy(Factory.address,Weth.address);
        console.log("before each done");
        })

        describe("adding liquidity ",async ()=>{



            it("adding liquidity of  two  token in different ratio for 0.3 %", async()=>{
      
              await token1.mint(owner.address, 1);
              await token2.mint(owner.address, 5000);
      
              await token1.approve(nonfungiblePositionManager.address,1);
              await token2.approve(nonfungiblePositionManager.address,5000);
              console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
              console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));
      
           //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79236085132454337593543950336n)
          
              await Factory.createPool(token1.address,token2.address,3000);
              const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
              console.log("poolinstance",poolinstance);
              const PoolAddress = UniswapV3Pool.attach(poolinstance);
            // console.log("pooladdress", PoolAddress);
              await PoolAddress.initialize(5602277097478614198912276234240n);
                                        
      
             await nonfungiblePositionManager.mint(
              [token1.address,
                token2.address,
                3000,
                84000,//85140
                86220,//85200
                1,
                5000,
                0,
                0,
                owner.address,
                1863869999]
             )
            //  await expect(nonfungiblePositionManager.connect(owner).mint(
            //   [token1.address,
            //     token2.address,
            //     3000,
            //     -120,
            //     120,
            //     BN.from("2").mul(BN.from("10").pow("18")),
            //     BN.from("2").mul(BN.from("10").pow("18")),
            //     0,
            //     0,
            //     owner.address,
            //     1863869999]
            //  ))
            //  .to.emit(nonfungiblePositionManager, 'IncreaseLiquidity')
            //  .withArgs(1,334350999671639533818n, 2000000000000000000n, 2000000000000000000n);
            
           //  await nonfungiblePositionManager.mint([token2.address,token1.address,500,23020,23030,100,100,0,0,owner.address,1863869999]);
             console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
             console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
             console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
             console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
             console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
            //  console.log("nft metadata",await nonfungiblePositionManager.tokenURI(1));
            
             
            })
            it("adding liquidity of  two  token in different ratio for 1 %", async()=>{
      
                await token1.mint(owner.address, 1000);
                await token2.mint(owner.address, 5000);
        
                await token2.approve(nonfungiblePositionManager.address,100000);
                await token1.approve(nonfungiblePositionManager.address,100000);
                console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
                console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));
        
             //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79236085132454337593543950336n)
            
                await Factory.createPool(token1.address,token2.address,10000);
                const poolinstance = await Factory.getPool(token1.address,token2.address,10000);
                console.log("poolinstance",poolinstance);
                const PoolAddress = UniswapV3Pool.attach(poolinstance);
              // console.log("pooladdress", PoolAddress);
                await PoolAddress.initialize(5602277097478614198912276234240n);
                                          
        
               await nonfungiblePositionManager.mint(
                [token1.address,
                  token2.address,
                  10000,
                  85000,
                  85200,
                  1,
                  5000,
                  0,
                  0,
                  owner.address,
                  1863869999]
               )
              //  await expect(nonfungiblePositionManager.connect(owner).mint(
              //   [token1.address,
              //     token2.address,
              //     3000,
              //     -120,
              //     120,
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     0,
              //     0,
              //     owner.address,
              //     1863869999]
              //  ))
              //  .to.emit(nonfungiblePositionManager, 'IncreaseLiquidity')
              //  .withArgs(1,334350999671639533818n, 2000000000000000000n, 2000000000000000000n);
              
             //  await nonfungiblePositionManager.mint([token2.address,token1.address,500,23020,23030,100,100,0,0,owner.address,1863869999]);
               console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
               console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
               console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
               console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
               console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
              //  console.log("nft metadata",await nonfungiblePositionManager.tokenURI(1));
              
               
              })
              it("adding liquidity of  two  token in different ratio for 0.05 %", async()=>{
      
                await token1.mint(owner.address, 1000);
                await token2.mint(owner.address, 5000);
        
                await token2.approve(nonfungiblePositionManager.address,100000);
                await token1.approve(nonfungiblePositionManager.address,100000);
                console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
                console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));
        
             //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79236085132454337593543950336n)
            
                await Factory.createPool(token1.address,token2.address,500);
                const poolinstance = await Factory.getPool(token1.address,token2.address,500);
                console.log("poolinstance",poolinstance);
                const PoolAddress = UniswapV3Pool.attach(poolinstance);
              // console.log("pooladdress", PoolAddress);
                await PoolAddress.initialize(5602277097478614198912276234240n);
                                          
        
               await nonfungiblePositionManager.mint(
                [token1.address,
                  token2.address,
                  500,
                  85170,
                  85180,
                  1,
                  5000,
                  0,
                  0,
                  owner.address,
                  1863869999]
               )
              //  await expect(nonfungiblePositionManager.connect(owner).mint(
              //   [token1.address,
              //     token2.address,
              //     3000,
              //     -120,
              //     120,
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     0,
              //     0,
              //     owner.address,
              //     1863869999]
              //  ))
              //  .to.emit(nonfungiblePositionManager, 'IncreaseLiquidity')
              //  .withArgs(1,334350999671639533818n, 2000000000000000000n, 2000000000000000000n);
              
             //  await nonfungiblePositionManager.mint([token2.address,token1.address,500,23020,23030,100,100,0,0,owner.address,1863869999]);
               console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
               console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
               console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
               console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
               console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
              //  console.log("nft metadata",await nonfungiblePositionManager.tokenURI(1));
              
               
              })


              it("adding liquidity of  two  token in different ratio ", async()=>{
      
                await token1.mint(owner.address, 1000);
                await token2.mint(owner.address, 5000);
        
                await token2.approve(nonfungiblePositionManager.address,100000);
                await token1.approve(nonfungiblePositionManager.address,100000);
                console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
                console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));
        
             //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79236085132454337593543950336n)
            
                await Factory.createPool(token1.address,token2.address,500);
                const poolinstance = await Factory.getPool(token1.address,token2.address,500);
                console.log("poolinstance",poolinstance);
                const PoolAddress = UniswapV3Pool.attach(poolinstance);
              // console.log("pooladdress", PoolAddress);
                await PoolAddress.initialize(120806711464115414763401379840n);
                                          
        
               await nonfungiblePositionManager.mint(
                [token1.address,
                  token2.address,
                  500,
                  8370,//7320
                  8380,//9550
                  200,
                  465,
                  0,
                  0,
                  owner.address,
                  1863869999]
               )
              //  await expect(nonfungiblePositionManager.connect(owner).mint(
              //   [token1.address,
              //     token2.address,
              //     3000,
              //     -120,
              //     120,
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     0,
              //     0,
              //     owner.address,
              //     1863869999]
              //  ))
              //  .to.emit(nonfungiblePositionManager, 'IncreaseLiquidity')
              //  .withArgs(1,334350999671639533818n, 2000000000000000000n, 2000000000000000000n);
              
             //  await nonfungiblePositionManager.mint([token2.address,token1.address,500,23020,23030,100,100,0,0,owner.address,1863869999]);
               console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
               console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
               console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
               console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
               console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
              //  console.log("nft metadata",await nonfungiblePositionManager.tokenURI(1));
              
               
              })
              it("adding liquidity of  two  token in different ratio prashant ", async()=>{
      
                await token1.mint(owner.address, 1000);
                await token2.mint(owner.address, 5000);
        
                await token2.approve(nonfungiblePositionManager.address,100000);
                await token1.approve(nonfungiblePositionManager.address,100000);
                console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
                console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));
        
             //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79236085132454337593543950336n)
            
                await Factory.createPool(token1.address,token2.address,500);
                const poolinstance = await Factory.getPool(token1.address,token2.address,500);
                console.log("poolinstance",poolinstance);
                const PoolAddress = UniswapV3Pool.attach(poolinstance);
              // console.log("pooladdress", PoolAddress);
                await PoolAddress.initialize(792281625142643375935439503360n);
                                          
        
               await nonfungiblePositionManager.mint(
                [token1.address,
                  token2.address,
                  500,
                  46020,
                  46080,
                  3,
                  300,
                  0,
                  0,
                  owner.address,
                  1863869999]
               )
              //  await expect(nonfungiblePositionManager.connect(owner).mint(
              //   [token1.address,
              //     token2.address,
              //     3000,
              //     -120,
              //     120,
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     0,
              //     0,
              //     owner.address,
              //     1863869999]
              //  ))
              //  .to.emit(nonfungiblePositionManager, 'IncreaseLiquidity')
              //  .withArgs(1,334350999671639533818n, 2000000000000000000n, 2000000000000000000n);
              
             //  await nonfungiblePositionManager.mint([token2.address,token1.address,500,23020,23030,100,100,0,0,owner.address,1863869999]);
               console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
               console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
               console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
               console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
               console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
              //  console.log("nft metadata",await nonfungiblePositionManager.tokenURI(1));
              
               
              })
              it("adding liquidity of  two  token in different ratio prashant ", async()=>{
      
                await token1.mint(owner.address, 1000);
                await token2.mint(owner.address, 5000);
        
                await token2.approve(nonfungiblePositionManager.address,100000);
                await token1.approve(nonfungiblePositionManager.address,100000);
                console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
                console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));
        
             //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79236085132454337593543950336n)
            
                await Factory.createPool(token1.address,token2.address,500);
                const poolinstance = await Factory.getPool(token1.address,token2.address,500);
                console.log("poolinstance",poolinstance);
                const PoolAddress = UniswapV3Pool.attach(poolinstance);
              // console.log("pooladdress", PoolAddress);
                await PoolAddress.initialize(120806711464115414763401379840n);
                                          
        
               await nonfungiblePositionManager.mint(
                [token1.address,
                  token2.address,
                  500,
                  8390,
                  8470,
                  200,
                  465,
                  0,
                  0,
                  owner.address,
                  1863869999]
               )
              //  await expect(nonfungiblePositionManager.connect(owner).mint(
              //   [token1.address,
              //     token2.address,
              //     3000,
              //     -120,
              //     120,
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     BN.from("2").mul(BN.from("10").pow("18")),
              //     0,
              //     0,
              //     owner.address,
              //     1863869999]
              //  ))
              //  .to.emit(nonfungiblePositionManager, 'IncreaseLiquidity')
              //  .withArgs(1,334350999671639533818n, 2000000000000000000n, 2000000000000000000n);
              
             //  await nonfungiblePositionManager.mint([token2.address,token1.address,500,23020,23030,100,100,0,0,owner.address,1863869999]);
               console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
               console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
               console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
               console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
               console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
              //  console.log("nft metadata",await nonfungiblePositionManager.tokenURI(1));
              
               
              })

      })

      describe("increase liquidity", async()=>{
        it("increasing liquidity when two tokens are added in different ratio", async()=>{

          await token1.mint(owner.address, 3);
              await token2.mint(owner.address, 15000);
      
              await token1.approve(nonfungiblePositionManager.address,3);
              await token2.approve(nonfungiblePositionManager.address,15000);
              console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
              console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));
      
           //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79236085132454337593543950336n)
          
              await Factory.createPool(token1.address,token2.address,3000);
              const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
              console.log("poolinstance",poolinstance);
              const PoolAddress = UniswapV3Pool.attach(poolinstance);
            // console.log("pooladdress", PoolAddress);
              await PoolAddress.initialize(5602277097478614198912276234240n);
                                        
      
             await nonfungiblePositionManager.mint(
              [token1.address,
                token2.address,
                3000,
                83760,//85140
                86340,//85200
                1,
                5000,
                0,
                0,
                owner.address,
                1863869999]
             )
            //  await expect(nonfungiblePositionManager.connect(owner).mint(
            //   [token1.address,
            //     token2.address,
            //     3000,
            //     -120,
            //     120,
            //     BN.from("2").mul(BN.from("10").pow("18")),
            //     BN.from("2").mul(BN.from("10").pow("18")),
            //     0,
            //     0,
            //     owner.address,
            //     1863869999]
            //  ))
            //  .to.emit(nonfungiblePositionManager, 'IncreaseLiquidity')
            //  .withArgs(1,334350999671639533818n, 2000000000000000000n, 2000000000000000000n);
            
           //  await nonfungiblePositionManager.mint([token2.address,token1.address,500,23020,23030,100,100,0,0,owner.address,1863869999]);
             console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
             console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
             console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
             console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
             console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
            //  console.log("nft metadata",await nonfungiblePositionManager.tokenURI(1));
            //  await nonfungiblePositionManager.increaseLiquidity([1,2,10000,0,0,1863869999]);
            //  console.log("balance of token 1 in v3 pool after increasing liquidity", await token1.balanceOf(PoolAddress.address));
            //  console.log("balance of token 2 in v3 pool after increasing liqidity", await token2.balanceOf(PoolAddress.address));


        })
      })



    })