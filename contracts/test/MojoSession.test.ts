import { expect } from "chai";
import hre from "hardhat";
import { MojoToken, MojoSession, MojoFighter } from "../typechain-types";

const { ethers } = hre;

describe("MojoMan Contracts", function () {
  let mojoToken: MojoToken;
  let mojoSession: MojoSession;
  let mojoFighter: MojoFighter;
  let owner: any, exerciser: any, bettor1: any, bettor2: any;

  beforeEach(async function () {
    [owner, exerciser, bettor1, bettor2] = await ethers.getSigners();

    const MojoTokenFactory = await ethers.getContractFactory("MojoToken");
    mojoToken = await MojoTokenFactory.deploy();

    const MojoSessionFactory = await ethers.getContractFactory("MojoSession");
    mojoSession = await MojoSessionFactory.deploy(await mojoToken.getAddress());

    const MojoFighterFactory = await ethers.getContractFactory("MojoFighter");
    mojoFighter = await MojoFighterFactory.deploy(await mojoSession.getAddress());

    // Authorize session contract to mint tokens
    await mojoToken.setMinter(await mojoSession.getAddress(), true);
  });

  describe("MojoToken", function () {
    it("should allow authorized minters to mint", async function () {
      await mojoToken.setMinter(owner.address, true);
      await mojoToken.mint(exerciser.address, ethers.parseEther("100"));
      expect(await mojoToken.balanceOf(exerciser.address)).to.equal(ethers.parseEther("100"));
    });

    it("should reject unauthorized minters", async function () {
      await expect(
        mojoToken.connect(exerciser).mint(exerciser.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Not authorized to mint");
    });
  });

  describe("MojoSession", function () {
    it("should create a session", async function () {
      await mojoSession.connect(exerciser).createSession(0, 20); // Pushups, 20 reps
      const session = await mojoSession.getSession(0);
      expect(session.exerciser).to.equal(exerciser.address);
      expect(session.targetReps).to.equal(20);
    });

    it("should allow betting on a session", async function () {
      await mojoSession.connect(exerciser).createSession(0, 20);
      await mojoSession.connect(bettor1).placeBet(0, true, { value: ethers.parseEther("1") });
      await mojoSession.connect(bettor2).placeBet(0, false, { value: ethers.parseEther("1") });

      const session = await mojoSession.getSession(0);
      expect(session.totalUpBets).to.equal(ethers.parseEther("1"));
      expect(session.totalDownBets).to.equal(ethers.parseEther("1"));
    });

    it("should resolve session and mint tokens", async function () {
      await mojoSession.connect(exerciser).createSession(0, 20);
      await mojoSession.connect(exerciser).resolveSession(0, 25);

      // 25 reps * 10 MOJO = 250 MOJO
      expect(await mojoToken.balanceOf(exerciser.address)).to.equal(ethers.parseEther("250"));
    });

    it("should pay out winning bettors", async function () {
      await mojoSession.connect(exerciser).createSession(0, 20);
      await mojoSession.connect(bettor1).placeBet(0, true, { value: ethers.parseEther("1") });
      await mojoSession.connect(bettor2).placeBet(0, false, { value: ethers.parseEther("1") });

      // Exerciser hits target
      await mojoSession.connect(exerciser).resolveSession(0, 25);

      const balBefore = await ethers.provider.getBalance(bettor1.address);
      await mojoSession.connect(bettor1).claimBet(0);
      const balAfter = await ethers.provider.getBalance(bettor1.address);

      // Winner should get ~2 ETH (minus gas)
      expect(balAfter - balBefore).to.be.greaterThan(ethers.parseEther("1.9"));
    });
  });

  describe("MojoFighter", function () {
    it("should create a fighter", async function () {
      await mojoFighter.connect(exerciser).createFighter();
      const fighter = await mojoFighter.getFighter(exerciser.address);
      expect(fighter.exists).to.be.true;
      expect(fighter.level).to.equal(1);
    });

    it("should sync stats from session", async function () {
      await mojoFighter.connect(exerciser).createFighter();
      await mojoSession.connect(exerciser).createSession(0, 20); // Pushups
      await mojoSession.connect(exerciser).resolveSession(0, 15);
      await mojoFighter.connect(exerciser).syncStats(0);

      const fighter = await mojoFighter.getFighter(exerciser.address);
      expect(fighter.strength).to.equal(15); // Pushups -> strength
    });

    it("should handle PvP challenges", async function () {
      await mojoFighter.connect(exerciser).createFighter();
      await mojoFighter.connect(bettor1).createFighter();

      // Give exerciser some stats
      await mojoSession.connect(exerciser).createSession(0, 10);
      await mojoSession.connect(exerciser).resolveSession(0, 10);
      await mojoFighter.connect(exerciser).syncStats(0);

      // Challenge
      await mojoFighter.connect(exerciser).challenge(bettor1.address, { value: ethers.parseEther("0.1") });
      await mojoFighter.connect(bettor1).acceptChallenge(0, { value: ethers.parseEther("0.1") });
      await mojoFighter.resolveBattle(0);

      const challenge = await mojoFighter.getChallenge(0);
      expect(challenge.status).to.equal(2); // Resolved
      expect(challenge.winner).to.not.equal(ethers.ZeroAddress);
    });
  });
});
