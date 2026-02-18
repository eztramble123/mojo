import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MON");

  if (balance === 0n) {
    throw new Error("Deployer has no MON. Fund it via https://faucet.monad.xyz");
  }

  // Deploy MojoToken
  const MojoToken = await hre.ethers.getContractFactory("MojoToken");
  const mojoToken = await MojoToken.deploy();
  await mojoToken.waitForDeployment();
  const tokenAddress = await mojoToken.getAddress();
  console.log("MojoToken deployed to:", tokenAddress);

  // Deploy MojoSession
  const MojoSession = await hre.ethers.getContractFactory("MojoSession");
  const mojoSession = await MojoSession.deploy(tokenAddress);
  await mojoSession.waitForDeployment();
  const sessionAddress = await mojoSession.getAddress();
  console.log("MojoSession deployed to:", sessionAddress);

  // Deploy MojoFighter
  const MojoFighter = await hre.ethers.getContractFactory("MojoFighter");
  const mojoFighter = await MojoFighter.deploy(sessionAddress);
  await mojoFighter.waitForDeployment();
  const fighterAddress = await mojoFighter.getAddress();
  console.log("MojoFighter deployed to:", fighterAddress);

  // Authorize MojoSession to mint tokens
  const tx = await mojoToken.setMinter(sessionAddress, true);
  await tx.wait();
  console.log("MojoSession authorized as minter");

  console.log("\n=== Update .env.local with: ===");
  console.log(`NEXT_PUBLIC_MOJO_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_MOJO_SESSION_ADDRESS=${sessionAddress}`);
  console.log(`NEXT_PUBLIC_MOJO_FIGHTER_ADDRESS=${fighterAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
