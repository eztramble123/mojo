import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy MojoToken
  const MojoToken = await ethers.getContractFactory("MojoToken");
  const mojoToken = await MojoToken.deploy();
  await mojoToken.waitForDeployment();
  const tokenAddress = await mojoToken.getAddress();
  console.log("MojoToken deployed to:", tokenAddress);

  // Deploy MojoSession
  const MojoSession = await ethers.getContractFactory("MojoSession");
  const mojoSession = await MojoSession.deploy(tokenAddress);
  await mojoSession.waitForDeployment();
  const sessionAddress = await mojoSession.getAddress();
  console.log("MojoSession deployed to:", sessionAddress);

  // Deploy MojoFighter
  const MojoFighter = await ethers.getContractFactory("MojoFighter");
  const mojoFighter = await MojoFighter.deploy(sessionAddress);
  await mojoFighter.waitForDeployment();
  const fighterAddress = await mojoFighter.getAddress();
  console.log("MojoFighter deployed to:", fighterAddress);

  // Authorize MojoSession to mint tokens
  await mojoToken.setMinter(sessionAddress, true);
  console.log("MojoSession authorized as minter");

  console.log("\nUpdate .env.local with:");
  console.log(`NEXT_PUBLIC_MOJO_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_MOJO_SESSION_ADDRESS=${sessionAddress}`);
  console.log(`NEXT_PUBLIC_MOJO_FIGHTER_ADDRESS=${fighterAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
