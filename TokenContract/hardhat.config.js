require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc", // Arbitrum Sepolia RPC
      accounts: [`<PRIVATE_KEY>`],
    },
  },
  solidity: "0.8.28",
};
