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

       TickMath = await ethers.getContractFactory("contracts/libraries/TickMath.sol:TickMath");
       tickmath = await TickMath.deploy();
       AvgTick = await  ethers.getContractFactory("AvgTick");
       avgtick = await  AvgTick.deploy();

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



      it("adding liquidity of  two  token in different ratio", async()=>{

        await token1.mint(owner.address, 10000);
        await token2.mint(owner.address, 10000);

        await token2.approve(nonfungiblePositionManager.address,100000);
        await token1.approve(nonfungiblePositionManager.address,100000);
        console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
        console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));

     //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79236085132454337593543950336n)
    
        await Factory.createPool(token1.address,token2.address,3000);
        const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
        console.log("poolinstance==================",poolinstance);
        const PoolAddress = UniswapV3Pool.attach(poolinstance);
      // console.log("pooladdress", PoolAddress);

        await PoolAddress.initialize(79228162514264337593543950336n);
        


       await nonfungiblePositionManager.mint(
        [token1.address,
          token2.address,
          3000,
          -887272,
          887272,
          5000,
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

    it("adding liquidity of two tokens in same ratio ", async ()=>{
        // await token1.mint(owner.address,BN.from("1000").mul(BN.from("10").pow("18")));
        // await token2.mint(owner.address, BN.from("1000").mul(BN.from("10").pow("18")));

        await token1.mint(owner.address, BN.from("1000").mul(BN.from("10").pow("18")));
        await token2.mint(owner.address, BN.from("3000").mul(BN.from("10").pow("18")));

        await token2.approve(nonfungiblePositionManager.address,BN.from("1000").mul(BN.from("10").pow("18")));
        await token1.approve(nonfungiblePositionManager.address,BN.from("3000").mul(BN.from("10").pow("18")));
        console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
        console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));

     //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79236085132454337593543950336n)
    
        await Factory.createPool(token1.address,token2.address,3000);
        const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
        console.log("poolinstance",poolinstance);
        const PoolAddress = UniswapV3Pool.attach(poolinstance);
      // console.log("pooladdress", PoolAddress);
        await PoolAddress.initialize(79224201403219477170569942574n);


       await nonfungiblePositionManager.mint(
        [token1.address,
          token2.address,
          3000,
          -120,
          60,
          1000,//BN.from("1000").mul(BN.from("10").pow("18")),
          2000,//BN.from("2000").mul(BN.from("10").pow("18")),
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

    it("adding liquidity of only ETH",async()=>{
      await Weth.deposit({ value: 1000});
      await token2.mint(owner.address,1000);
      await Weth.connect(user1).deposit({ value: 1000});
     await token2.connect(user1).mint(user1.address,1000)
      await Weth.approve(nonfungiblePositionManager.address,1000);
      await token2.approve(nonfungiblePositionManager.address,1000);

      await Weth.connect(user1).approve(nonfungiblePositionManager.address,1000);
      await token2.connect(user1).approve(nonfungiblePositionManager.address,1000);
      console.log("balance of weth(owner) before mint", await Weth.balanceOf(owner.address));
      console.log("balance of token 2(owner) before mint", await token2.balanceOf(owner.address));
      //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(Weth.address,token2.address,3000,79228162514264337593543950336n);

         await Factory.createPool(Weth.address,token2.address,3000);
        const poolinstance = await Factory.getPool(Weth.address,token2.address,3000);
        //console.log("poolinstance",poolinstance);
        const PoolAddress = UniswapV3Pool.attach(poolinstance);
      // console.log("pooladdress", PoolAddress);
        await PoolAddress.initialize(7922816251426433759354395033n);
      console.log("ETHER balance in nonfungilepositionmanger before mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
      console.log("ETHER balance of pool before mint",await ethers.provider.getBalance(PoolAddress.address));   
      console.log("balance of token 2 in v3 pool before mint", await token2.balanceOf(PoolAddress.address));
      console.log("balance of weth in v3 pool before mint", await Weth.balanceOf(PoolAddress.address));
      // await nonfungiblePositionManager.mint(
      //   [Weth.address,
      //     token2.address,
      //     3000,
      //     -120,
      //     120,
      //     1000,
      //     1000,
      //     0,
      //     0,
      //     owner.address,
      //     1863869999],{ value: 1000}
      //  )

         await expect(nonfungiblePositionManager.connect(owner).mint(
        [Weth.address,
          token2.address,
          3000,
          -120,
          120,
          1000,
          0,
          0,
          0,
          owner.address,
          1863869999],{value:1000}
       ))
       .to.emit(nonfungiblePositionManager, 'IncreaseLiquidity')
       .withArgs(1,83336, 1000, 0);

       console.log("balance of weth(0wner) after mint", await Weth.balanceOf(owner.address));
       console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
       //console.log("balance of weth in nonfungible after mint", await Weth.balanceOf(nonfungiblePositionManager.address));
      console.log("balance of token 2 in nonfungible after mint", await token2.balanceOf(nonfungiblePositionManager.address));
       console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
       console.log("ETHER balance in nonfungilepositionmanger after mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
       console.log("ETHER balance of pool after mint",await ethers.provider.getBalance(PoolAddress.address));       
       console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
       console.log("balance of weth in v3 pool after mint", await Weth.balanceOf(PoolAddress.address));

      
      
       await nonfungiblePositionManager.decreaseLiquidity([1,83336,0,0,1764515896]);
       await nonfungiblePositionManager.collect([1,owner.address,999,999]);
       console.log("balance of weth in v3 pool after removing liquidity", await Weth.balanceOf(PoolAddress.address));
       //console.log("balance of token 2 in v3 pool after removing liquidity", await token2.balanceOf(PoolAddress.address));
       console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
       //console.log("nft metadata after removing liquidity",await nonfungiblePositionManager.tokenURI(1));
      // console.log("owner of nft", await nonfungiblePositionManager.ownerOf(1))
       await nonfungiblePositionManager.burn(1);
       console.log("NFT balance after burn",await nonfungiblePositionManager.balanceOf(owner.address));

    })

    it("addliquidity of ETH(wei) and token in same ratio", async ()=>{

      await Weth.deposit({ value: 1000});
      await token2.mint(owner.address,1000);
     
      await Weth.approve(nonfungiblePositionManager.address,1000);
      await token2.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of weth(owner) before mint", await Weth.balanceOf(owner.address));
      console.log("balance of token 2(owner) before mint", await token2.balanceOf(owner.address));
      //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(Weth.address,token2.address,3000,79228162514264337593543950336n);

         await Factory.createPool(Weth.address,token2.address,3000);
        const poolinstance = await Factory.getPool(Weth.address,token2.address,3000);
        //console.log("poolinstance",poolinstance);
        const PoolAddress = UniswapV3Pool.attach(poolinstance);
      // console.log("pooladdress", PoolAddress);
        await PoolAddress.initialize(79228162514264337593543950336n);
      console.log("ETHER balance in nonfungilepositionmanger before mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
      console.log("ETHER balance of pool before mint",await ethers.provider.getBalance(PoolAddress.address));   
      console.log("balance of token 2 in v3 pool before mint", await token2.balanceOf(PoolAddress.address));
      console.log("balance of weth in v3 pool before mint", await Weth.balanceOf(PoolAddress.address));
      await nonfungiblePositionManager.mint(
        [Weth.address,
          token2.address,
          3000,
          -120,
          120,
          1000,
          1000,
          0,
          0,
          owner.address,
          1863869999],{ value: 1000}
       )

       console.log("balance of weth(0wner) after mint", await Weth.balanceOf(owner.address));
       console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
       //console.log("balance of weth in nonfungible after mint", await Weth.balanceOf(nonfungiblePositionManager.address));
      console.log("balance of token 2 in nonfungible after mint", await token2.balanceOf(nonfungiblePositionManager.address));
       console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
       console.log("ETHER balance in nonfungilepositionmanger after mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
       console.log("ETHER balance of pool after mint",await ethers.provider.getBalance(PoolAddress.address));       
       console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
       console.log("balance of weth in v3 pool after mint", await Weth.balanceOf(PoolAddress.address));
    })
  })

  describe("swap", async()=>{
    it("swap token2 for token1(exactInputSingle)", async()=>{
      await token1.mint(owner.address,1000);
      await token2.mint(owner.address,1000);
      await token2.mint(user1.address,300);
      await token2.connect(user1).approve(swaprouter.address,300);
      await token2.approve(nonfungiblePositionManager.address,1000);
      await token1.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
      console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));

   //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79228162514264337593543950336n);

   await Factory.createPool(token1.address,token2.address,3000);
   const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
   console.log("poolinstance",poolinstance);
   const PoolAddress = UniswapV3Pool.attach(poolinstance);
 // console.log("pooladdress", PoolAddress);
   await PoolAddress.initialize(79228162514264337593543950336n);
   await nonfungiblePositionManager.mint(
    [token1.address,
      token2.address,
      3000,
      -120,
      120,
      1000,
      1000,
      0,
      0,
      owner.address,
      1863869999]
   )

   console.log("balance of token 1 after mint", await token1.balanceOf(owner.address));
   console.log("balance of token 2 after mint", await token2.balanceOf(owner.address));
   console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
   console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
   console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));

   //await quoterv2.connect(user1).quoteExactInputSingle([token2.address,token1.address,10,3000,1461446703485210103287273052203988822378723970341n]);
  //  await PoolAddress.swap(
  //   owner.address,false, 100,1461446703485210103287273052203988822378723970341n,"0x0000000000000000000000000000000000000000000000000000000000000000" )

       // console.log("",zeroForOne);
  await swaprouter.connect(user1).exactInputSingle([token2.address,token1.address,3000,user1.address,1863869999,300,298,609228162514264337593543950336n]);
  console.log("balance of token 1 in v3 pool after swap", await token1.balanceOf(PoolAddress.address));
  console.log("balance of token 2 in v3 pool after swap", await token2.balanceOf(PoolAddress.address));

    })

    it("swap token2 for token1(exactOutputSingle)", async()=>{
      await token1.mint(owner.address,1000);
      await token2.mint(owner.address,1000);
      await token2.mint(user1.address,300);
      await token2.connect(user1).approve(swaprouter.address,300);
      await token2.approve(nonfungiblePositionManager.address,1000);
      await token1.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
      console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));
      await Factory.createPool(token1.address,token2.address,3000);
      const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
      console.log("poolinstance",poolinstance);
      const PoolAddress = UniswapV3Pool.attach(poolinstance);
    // console.log("pooladdress", PoolAddress);
      await PoolAddress.initialize(79228162514264337593543950336n);
      await nonfungiblePositionManager.mint(
       [token1.address,
         token2.address,
         3000,
         -120,
         120,
         1000,
         1000,
         0,
         0,
         owner.address,
         1863869999]
      )
   
      console.log("balance of token 1 after mint", await token1.balanceOf(owner.address));
      console.log("balance of token 2 after mint", await token2.balanceOf(owner.address));
      console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
      console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
      console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
      await swaprouter.connect(user1).exactOutputSingle([token2.address,token1.address,3000,user1.address,1863869999,298,300,609228162514264337593543950336n]);
      console.log("balance of token 1 in v3 pool after swap", await token1.balanceOf(PoolAddress.address));
      console.log("balance of token 2 in v3 pool after swap", await token2.balanceOf(PoolAddress.address));
    });

    it("swap token1 for token2(exactInputSingle)", async()=>{

      await token1.mint(owner.address,1000);
      await token2.mint(owner.address,1000);
      await token1.mint(user1.address,300);
      await token1.connect(user1).approve(swaprouter.address,300);
      await token2.approve(nonfungiblePositionManager.address,1000);
      await token1.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of token 1(owner) before mint", await token1.balanceOf(owner.address));
      console.log("balance of token 2(owner) before mint", await token2.balanceOf(owner.address));

   //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79228162514264337593543950336n);

   await Factory.createPool(token1.address,token2.address,3000);
   const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
   console.log("poolinstance",poolinstance);
   const PoolAddress = UniswapV3Pool.attach(poolinstance);
 // console.log("pooladdress", PoolAddress);
   await PoolAddress.initialize(79228162514264337593543950336n);
                                
   await nonfungiblePositionManager.mint(
    [token1.address,
      token2.address,
      3000,
      -120,
      120,
      1000,
      1000,
      0,
      0,
      owner.address,
      1863869999]
   )

   console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
   console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
   console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
   console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
   console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));

   //await quoterv2.connect(user1).quoteExactInputSingle([token2.address,token1.address,10,3000,1461446703485210103287273052203988822378723970341n]);
  //  await PoolAddress.swap(
  //   owner.address,false, 100,1461446703485210103287273052203988822378723970341n,"0x0000000000000000000000000000000000000000000000000000000000000000" )

       // console.log("",zeroForOne);
  await swaprouter.connect(user1).exactInputSingle([token1.address,token2.address,3000,user1.address,1863869999,300,298,6092281625142643375935439503n]);
  console.log("balance of token 1 in v3 pool after swap", await token1.balanceOf(PoolAddress.address));
  console.log("balance of token 2 in v3 pool after swap", await token2.balanceOf(PoolAddress.address));

    })

    it("swap token1 for token2(exactOutputSingle)", async()=>{

      await token1.mint(owner.address,1000);
      await token2.mint(owner.address,1000);
      await token1.mint(user1.address,300);
      await token1.connect(user1).approve(swaprouter.address,300);
      await token2.approve(nonfungiblePositionManager.address,1000);
      await token1.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of token 1(owner) before mint", await token1.balanceOf(owner.address));
      console.log("balance of token 2(owner) before mint", await token2.balanceOf(owner.address));

   //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79228162514264337593543950336n);

   await Factory.createPool(token1.address,token2.address,3000);
   const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
   console.log("poolinstance",poolinstance);
   const PoolAddress = UniswapV3Pool.attach(poolinstance);
 // console.log("pooladdress", PoolAddress);
   await PoolAddress.initialize(79228162514264337593543950336n);
                                
   await nonfungiblePositionManager.mint(
    [token1.address,
      token2.address,
      3000,
      -120,
      120,
      1000,
      1000,
      0,
      0,
      owner.address,
      1863869999]
   )

   console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
   console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
   console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
   console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
   console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));

   //await quoterv2.connect(user1).quoteExactInputSingle([token2.address,token1.address,10,3000,1461446703485210103287273052203988822378723970341n]);
  //  await PoolAddress.swap(
  //   owner.address,false, 100,1461446703485210103287273052203988822378723970341n,"0x0000000000000000000000000000000000000000000000000000000000000000" )

       // console.log("",zeroForOne);
  await swaprouter.connect(user1).exactOutputSingle([token1.address,token2.address,3000,user1.address,1863869999,298,300,6092281625142643375935439503n]);
  console.log("balance of token 1 in v3 pool after swap", await token1.balanceOf(PoolAddress.address));
  console.log("balance of token 2 in v3 pool after swap", await token2.balanceOf(PoolAddress.address));

    })

    it("swap token for ETH(exactInputSingle)", async()=>{

      await Weth.deposit({ value: 1000});
      await token2.mint(owner.address,1000);
      await token2.connect(user1).mint(user1.address,300);
      await token2.connect(user1).approve(swaprouter.address,300);
      await Weth.approve(nonfungiblePositionManager.address,1000);
      await token2.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of weth(owner) before mint", await Weth.balanceOf(owner.address));
      console.log("balance of token 2(owner) before mint", await token2.balanceOf(owner.address));
      //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(Weth.address,token2.address,3000,79228162514264337593543950336n);

         await Factory.createPool(Weth.address,token2.address,3000);
        const poolinstance = await Factory.getPool(Weth.address,token2.address,3000);
        //console.log("poolinstance",poolinstance);
        const PoolAddress = UniswapV3Pool.attach(poolinstance);
      // console.log("pooladdress", PoolAddress);
        await PoolAddress.initialize(79228162514264337593543950336n);
      console.log("ETHER balance in nonfungilepositionmanger before mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
      console.log("ETHER balance of pool before mint",await ethers.provider.getBalance(PoolAddress.address));   
      console.log("balance of token 2 in v3 pool before mint", await token2.balanceOf(PoolAddress.address));
      console.log("balance of weth in v3 pool before mint", await Weth.balanceOf(PoolAddress.address));
      await nonfungiblePositionManager.mint(
        [Weth.address,
          token2.address,
          3000,
          -120,
          120,
          1000,
          1000,
          0,
          0,
          owner.address,
          1863869999],{ value: 1000}
       )

       console.log("balance of weth(0wner) after mint", await Weth.balanceOf(owner.address));
       console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
       //console.log("balance of weth in nonfungible after mint", await Weth.balanceOf(nonfungiblePositionManager.address));
      console.log("balance of token 2 in nonfungible after mint", await token2.balanceOf(nonfungiblePositionManager.address));
       console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
       console.log("ETHER balance in nonfungilepositionmanger after mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
       console.log("ETHER balance of pool after mint",await ethers.provider.getBalance(PoolAddress.address));       
       console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
       console.log("balance of weth in v3 pool after mint", await Weth.balanceOf(PoolAddress.address));

       await swaprouter.connect(user1).exactInputSingle([token2.address,Weth.address,3000,user1.address,1863869999,300,298,609228162514264337593543950336n]);
       console.log("balance of Weth in v3 pool after swap", await Weth.balanceOf(PoolAddress.address));
       console.log("balance of token 2 in v3 pool after swap", await token2.balanceOf(PoolAddress.address));
     

    })

    it("swap token for ETH (exactOutputSingle)", async()=>{
      await Weth.deposit({ value: 1000});
      await token2.mint(owner.address,1000);
      await token2.connect(user1).mint(user1.address,300);
      await token2.connect(user1).approve(swaprouter.address,300);
      await Weth.approve(nonfungiblePositionManager.address,1000);
      await token2.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of weth(owner) before mint", await Weth.balanceOf(owner.address));
      console.log("balance of token 2(owner) before mint", await token2.balanceOf(owner.address));
      //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(Weth.address,token2.address,3000,79228162514264337593543950336n);

         await Factory.createPool(Weth.address,token2.address,3000);
        const poolinstance = await Factory.getPool(Weth.address,token2.address,3000);
        //console.log("poolinstance",poolinstance);
        const PoolAddress = UniswapV3Pool.attach(poolinstance);
      // console.log("pooladdress", PoolAddress);
        await PoolAddress.initialize(79228162514264337593543950336n);
      console.log("ETHER balance in nonfungilepositionmanger before mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
      console.log("ETHER balance of pool before mint",await ethers.provider.getBalance(PoolAddress.address));   
      console.log("balance of token 2 in v3 pool before mint", await token2.balanceOf(PoolAddress.address));
      console.log("balance of weth in v3 pool before mint", await Weth.balanceOf(PoolAddress.address));
      await nonfungiblePositionManager.mint(
        [Weth.address,
          token2.address,
          3000,
          -120,
          120,
          1000,
          1000,
          0,
          0,
          owner.address,
          1863869999],{ value: 1000}
       )

       console.log("balance of weth(0wner) after mint", await Weth.balanceOf(owner.address));
       console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
       //console.log("balance of weth in nonfungible after mint", await Weth.balanceOf(nonfungiblePositionManager.address));
      console.log("balance of token 2 in nonfungible after mint", await token2.balanceOf(nonfungiblePositionManager.address));
       console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
       console.log("ETHER balance in nonfungilepositionmanger after mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
       console.log("ETHER balance of pool after mint",await ethers.provider.getBalance(PoolAddress.address));       
       console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
       console.log("balance of weth in v3 pool after mint", await Weth.balanceOf(PoolAddress.address));

       await swaprouter.connect(user1).exactOutputSingle([token2.address,Weth.address,3000,user1.address,1863869999,298,300,609228162514264337593543950336n]);
       console.log("balance of Weth in v3 pool after swap", await Weth.balanceOf(PoolAddress.address));
       console.log("balance of token 2 in v3 pool after swap", await token2.balanceOf(PoolAddress.address));

    })

    it("swap ETH for token(exactInputSingle)",async()=>{

      await Weth.deposit({ value: 1000});
      await token2.mint(owner.address,1000);
      await Weth.connect(user1).deposit({ value: 400})
      await Weth.connect(user1).approve(swaprouter.address,400);
      await Weth.approve(nonfungiblePositionManager.address,1000);
      await token2.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of weth(owner) before mint", await Weth.balanceOf(owner.address));
      console.log("balance of token 2(owner) before mint", await token2.balanceOf(owner.address));
      //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(Weth.address,token2.address,3000,79228162514264337593543950336n);

         await Factory.createPool(Weth.address,token2.address,3000);
        const poolinstance = await Factory.getPool(Weth.address,token2.address,3000);
        //console.log("poolinstance",poolinstance);
        const PoolAddress = UniswapV3Pool.attach(poolinstance);
      // console.log("pooladdress", PoolAddress);
        await PoolAddress.initialize(79228162514264337593543950336n);
      console.log("ETHER balance in nonfungilepositionmanger before mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
      console.log("ETHER balance of pool before mint",await ethers.provider.getBalance(PoolAddress.address));   
      console.log("balance of token 2 in v3 pool before mint", await token2.balanceOf(PoolAddress.address));
      console.log("balance of weth in v3 pool before mint", await Weth.balanceOf(PoolAddress.address));
      await nonfungiblePositionManager.mint(
        [Weth.address,
          token2.address,
          3000,
          -120,
          120,
          1000,
          1000,
          0,
          0,
          owner.address,
          1863869999],{ value: 1100}
       )

       console.log("balance of weth(0wner) after mint", await Weth.balanceOf(owner.address));
       console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
       //console.log("balance of weth in nonfungible after mint", await Weth.balanceOf(nonfungiblePositionManager.address));
      console.log("balance of token 2 in nonfungible after mint", await token2.balanceOf(nonfungiblePositionManager.address));
       console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
       console.log("ETHER balance in nonfungilepositionmanger after mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
       console.log("ETHER balance of pool after mint",await ethers.provider.getBalance(PoolAddress.address));       
       console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
       console.log("balance of weth in v3 pool after mint", await Weth.balanceOf(PoolAddress.address));

       await swaprouter.connect(user1).exactInputSingle([Weth.address,token2.address,3000,user1.address,1863869999,400,397,6092281625142643375935439503n]);
       console.log("balance of Weth in v3 pool after swap", await Weth.balanceOf(PoolAddress.address));
       console.log("balance of token 2 in v3 pool after swap", await token2.balanceOf(PoolAddress.address));

    })

    it("swap ETH for token(exactOutputSingle)",async()=>{

      await Weth.deposit({ value: 1000});
      await token2.mint(owner.address,1000);
      await Weth.connect(user1).deposit({ value: 400})
      await Weth.connect(user1).approve(swaprouter.address,400);
      await Weth.approve(nonfungiblePositionManager.address,1000);
      await token2.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of weth(owner) before mint", await Weth.balanceOf(owner.address));
      console.log("balance of token 2(owner) before mint", await token2.balanceOf(owner.address));
      //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(Weth.address,token2.address,3000,79228162514264337593543950336n);

         await Factory.createPool(Weth.address,token2.address,3000);
        const poolinstance = await Factory.getPool(Weth.address,token2.address,3000);
        //console.log("poolinstance",poolinstance);
        const PoolAddress = UniswapV3Pool.attach(poolinstance);
      // console.log("pooladdress", PoolAddress);
        await PoolAddress.initialize(79228162514264337593543950336n);
      console.log("ETHER balance in nonfungilepositionmanger before mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
      console.log("ETHER balance of pool before mint",await ethers.provider.getBalance(PoolAddress.address));   
      console.log("balance of token 2 in v3 pool before mint", await token2.balanceOf(PoolAddress.address));
      console.log("balance of weth in v3 pool before mint", await Weth.balanceOf(PoolAddress.address));
      await nonfungiblePositionManager.mint(
        [Weth.address,
          token2.address,
          3000,
          -120,
          120,
          1000,
          1000,
          0,
          0,
          owner.address,
          1863869999],{ value: 1100}
       )

       console.log("balance of weth(0wner) after mint", await Weth.balanceOf(owner.address));
       console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
       //console.log("balance of weth in nonfungible after mint", await Weth.balanceOf(nonfungiblePositionManager.address));
      console.log("balance of token 2 in nonfungible after mint", await token2.balanceOf(nonfungiblePositionManager.address));
       console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
       console.log("ETHER balance in nonfungilepositionmanger after mint",await ethers.provider.getBalance(nonfungiblePositionManager.address));
       console.log("ETHER balance of pool after mint",await ethers.provider.getBalance(PoolAddress.address));       
       console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
       console.log("balance of weth in v3 pool after mint", await Weth.balanceOf(PoolAddress.address));

       await swaprouter.connect(user1).exactOutputSingle([Weth.address,token2.address,3000,user1.address,1863869999,397,400,6092281625142643375935439503n]);
       console.log("balance of Weth in v3 pool after swap", await Weth.balanceOf(PoolAddress.address));
       console.log("balance of token 2 in v3 pool after swap", await token2.balanceOf(PoolAddress.address));

    })
  })

  describe("adding liquidity in different ratio",async()=>{
    it("adding liquidity of token to token", async()=>{

      await token1.mint(owner.address,100000);
      await token2.mint(owner.address,100000);

      await token2.approve(nonfungiblePositionManager.address,10000);
      await token1.approve(nonfungiblePositionManager.address,10000);
      console.log("balance of token 1 before mint", await token1.balanceOf(owner.address));
      console.log("balance of token 2 before mint", await token2.balanceOf(owner.address));

   //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79228162514264337593543950336n)
  
      await Factory.createPool(token1.address,token2.address,3000);
      const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
      console.log("poolinstance",poolinstance);
      const PoolAddress = UniswapV3Pool.attach(poolinstance);
    // console.log("pooladdress", PoolAddress);
      await PoolAddress.initialize(79228162514264337593543950336n);


     await nonfungiblePositionManager.mint(
      [token1.address,
        token2.address,
        3000,
        -240,
        240,
        1000,
        1000,
        0,
        0,
        owner.address,
        1863869999]
     )
 
    
   //  await nonfungiblePositionManager.mint([token2.address,token1.address,500,23020,23030,100,100,0,0,owner.address,1863869999]);
     console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
     console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
     console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
     console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
     console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));

     //console.log("nft metadata",await nonfungiblePositionManager.tokenURI(1));
    

    })
  })

  describe("removing liquidity",async()=>{
    it.only("removing full liquidity (token to token pair)",async()=>{

      await token1.mint(owner.address,1000);
      await token2.mint(owner.address,1000);

      await token2.approve(nonfungiblePositionManager.address,1000);
      await token1.approve(nonfungiblePositionManager.address,1000);
      console.log("balance of token 1(owner) before mint", await token1.balanceOf(owner.address));
      console.log("balance of token 2(owner) before mint", await token2.balanceOf(owner.address));

   //await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token1.address,token2.address,3000,79228162514264337593543950336n)
  
      await Factory.createPool(token1.address,token2.address,3000);
      const poolinstance = await Factory.getPool(token1.address,token2.address,3000);
      console.log("poolinstance",poolinstance);
      const PoolAddress = UniswapV3Pool.attach(poolinstance);
    // console.log("pooladdress", PoolAddress);
      await PoolAddress.initialize(79228162514264337593543950336n);


    //  await nonfungiblePositionManager.mint(
    //   [token1.address,
    //     token2.address,
    //     3000,
    //     -120,
    //     120,
    //     1000,
    //     1000,
    //     0,
    //     0,
    //     owner.address,
    //     1863869999]
    //  )
     await expect(nonfungiblePositionManager.connect(owner).mint(
      [token1.address,
        token2.address,
        3000,
        -120,
        120,
        1000,
        1000,
        0,
        0,
        owner.address,
        1863869999]
     ))
     .to.emit(nonfungiblePositionManager, 'IncreaseLiquidity')
     .withArgs(1,167175, 1000,1000);
    
   
   console.log("balance of token 1(owner) after mint", await token1.balanceOf(owner.address));
   console.log("balance of token 2(owner) after mint", await token2.balanceOf(owner.address));
   console.log("balance of token 1 in v3 pool after mint", await token1.balanceOf(PoolAddress.address));
   console.log("balance of token 2 in v3 pool after mint", await token2.balanceOf(PoolAddress.address));
   console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
   
   //console.log("nft metadata before removing liquidity",await nonfungiblePositionManager.tokenURI(1));
  //  let position_detail = await nonfungiblePositionManager.returnstruct(1);
  //  console.log("position_detail",position_detail);
  
   await nonfungiblePositionManager.decreaseLiquidity([1,167175,0,0,1764515896]);
   await nonfungiblePositionManager.collect([1,owner.address,999,999]);
   //await nonfungiblePositionManager.decreaseLiquidity([1,167175,0,0,1764515896]);
   console.log("balance of token 1 in v3 pool after removing liquidity", await token1.balanceOf(PoolAddress.address));
   console.log("balance of token 2 in v3 pool after removing liquidity", await token2.balanceOf(PoolAddress.address));
   console.log("NFT balance",await nonfungiblePositionManager.balanceOf(owner.address));
   //console.log("nft metadata after removing liquidity",await nonfungiblePositionManager.tokenURI(1));
   console.log("owner of nft", await nonfungiblePositionManager.ownerOf(1))
   console.log("tick lower",await nonfungiblePositionManager.connect(owner).positions(1));
   console.log("average  tick ===================", await avgtick.getaveragetick(79228162514264337593543950336n));
   await nonfungiblePositionManager.burn(1);
   console.log("NFT balance after burn",await nonfungiblePositionManager.balanceOf(owner.address));
  //  let details2=await nonfungiblePositionManager.positions(1);
  //  console.log("details of nft after  removing liquidity",details2);
    })

    it("removing full liquidity (ETH to token pair)",async()=>{
      
    })
  })
})




     