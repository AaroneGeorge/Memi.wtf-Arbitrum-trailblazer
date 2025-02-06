const { ethers } = require("hardhat");

async function main() {
  // Getting a contract to deploy
  const [deployer] = await hre.ethers.getSigners();
  var newContract = await ethers.getContractFactory("TokenFactory");
  const initialOwner = deployer.address; // Use the deployer's address as the initial owner

  console.log("initialOwner", initialOwner);

  // Deploying a new contract
  var deployedContract = await newContract.deploy(initialOwner);
  console.log("Contract address is: " + deployedContract);
}

main();
