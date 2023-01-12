require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");

 
module.exports = {
  networks: {
    hardhat: {
    }
  },
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};



