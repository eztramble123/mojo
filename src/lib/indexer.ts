import { createPublicClient, http, parseAbiItem, type Log } from "viem";
import { PrismaClient } from "@/generated/prisma/client";

const CHUNK_SIZE = 10_000;

const SESSION_ADDRESS = (process.env.NEXT_PUBLIC_MOJO_SESSION_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;
const FIGHTER_ADDRESS = (process.env.NEXT_PUBLIC_MOJO_FIGHTER_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

const RPC_URL =
  process.env.MONAD_RPC_URL ||
  process.env.NEXT_PUBLIC_MONAD_RPC_URL ||
  "https://testnet.monad.xyz/v1";

// Parsed ABI event items
const sessionCreated = parseAbiItem(
  "event SessionCreated(uint256 indexed sessionId, address indexed exerciser, uint8 exerciseType, uint256 targetReps)"
);
const sessionResolved = parseAbiItem(
  "event SessionResolved(uint256 indexed sessionId, uint256 actualReps, bool targetMet)"
);
const betPlaced = parseAbiItem(
  "event BetPlaced(uint256 indexed sessionId, address indexed bettor, bool isUp, uint256 amount)"
);
const betClaimed = parseAbiItem(
  "event BetClaimed(uint256 indexed sessionId, address indexed bettor, uint256 payout)"
);
const fighterCreated = parseAbiItem("event FighterCreated(address indexed owner)");
const statsUpdated = parseAbiItem(
  "event StatsUpdated(address indexed owner, uint256 strength, uint256 agility, uint256 endurance)"
);
const challengeCreated = parseAbiItem(
  "event ChallengeCreated(uint256 indexed challengeId, address indexed challenger, address indexed opponent, uint256 wager)"
);
const challengeAccepted = parseAbiItem(
  "event ChallengeAccepted(uint256 indexed challengeId)"
);
const battleResolved = parseAbiItem(
  "event BattleResolved(uint256 indexed challengeId, address indexed winner, uint256 payout)"
);

export async function runIndexer(prisma: PrismaClient) {
  const client = createPublicClient({
    transport: http(RPC_URL),
  });

  // Get or create IndexerState
  let state = await prisma.indexerState.findUnique({ where: { id: 1 } });
  if (!state) {
    state = await prisma.indexerState.create({ data: { id: 1, lastBlock: 0 } });
  }

  const currentBlock = Number(await client.getBlockNumber());
  let fromBlock = state.lastBlock + 1;

  if (fromBlock > currentBlock) {
    console.log("Already up to date at block", currentBlock);
    return;
  }

  console.log(`Indexing from block ${fromBlock} to ${currentBlock}...`);

  while (fromBlock <= currentBlock) {
    const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, currentBlock);
    console.log(`  Chunk: ${fromBlock} - ${toBlock}`);

    // Fetch all logs in parallel
    const [
      sessionCreatedLogs,
      sessionResolvedLogs,
      betPlacedLogs,
      betClaimedLogs,
      fighterCreatedLogs,
      statsUpdatedLogs,
      challengeCreatedLogs,
      challengeAcceptedLogs,
      battleResolvedLogs,
    ] = await Promise.all([
      client.getLogs({
        address: SESSION_ADDRESS,
        event: sessionCreated,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }),
      client.getLogs({
        address: SESSION_ADDRESS,
        event: sessionResolved,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }),
      client.getLogs({
        address: SESSION_ADDRESS,
        event: betPlaced,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }),
      client.getLogs({
        address: SESSION_ADDRESS,
        event: betClaimed,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }),
      client.getLogs({
        address: FIGHTER_ADDRESS,
        event: fighterCreated,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }),
      client.getLogs({
        address: FIGHTER_ADDRESS,
        event: statsUpdated,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }),
      client.getLogs({
        address: FIGHTER_ADDRESS,
        event: challengeCreated,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }),
      client.getLogs({
        address: FIGHTER_ADDRESS,
        event: challengeAccepted,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }),
      client.getLogs({
        address: FIGHTER_ADDRESS,
        event: battleResolved,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      }),
    ]);

    // Process SessionCreated
    for (const log of sessionCreatedLogs) {
      const { sessionId, exerciser, exerciseType, targetReps } = log.args as {
        sessionId: bigint;
        exerciser: string;
        exerciseType: number;
        targetReps: bigint;
      };
      const block = await client.getBlock({ blockNumber: log.blockNumber! });
      await prisma.session.upsert({
        where: { id: Number(sessionId) },
        create: {
          id: Number(sessionId),
          exerciser: exerciser.toLowerCase(),
          exerciseType,
          targetReps: Number(targetReps),
          startTime: Number(block.timestamp),
        },
        update: {},
      });
    }

    // Process SessionResolved
    for (const log of sessionResolvedLogs) {
      const { sessionId, actualReps, targetMet } = log.args as {
        sessionId: bigint;
        actualReps: bigint;
        targetMet: boolean;
      };
      await prisma.session.update({
        where: { id: Number(sessionId) },
        data: {
          actualReps: Number(actualReps),
          status: 1, // Resolved
          targetMet,
        },
      });
    }

    // Process BetPlaced
    for (const log of betPlacedLogs) {
      const { sessionId, bettor, isUp, amount } = log.args as {
        sessionId: bigint;
        bettor: string;
        isUp: boolean;
        amount: bigint;
      };
      await prisma.bet.upsert({
        where: {
          sessionId_bettor: {
            sessionId: Number(sessionId),
            bettor: bettor.toLowerCase(),
          },
        },
        create: {
          sessionId: Number(sessionId),
          bettor: bettor.toLowerCase(),
          isUp,
          amount: amount.toString(),
        },
        update: {
          isUp,
          amount: amount.toString(),
        },
      });

      // Update session totals
      const session = await prisma.session.findUnique({
        where: { id: Number(sessionId) },
      });
      if (session) {
        const bets = await prisma.bet.findMany({
          where: { sessionId: Number(sessionId) },
        });
        const totalUp = bets
          .filter((b) => b.isUp)
          .reduce((sum, b) => sum + BigInt(b.amount), 0n);
        const totalDown = bets
          .filter((b) => !b.isUp)
          .reduce((sum, b) => sum + BigInt(b.amount), 0n);
        await prisma.session.update({
          where: { id: Number(sessionId) },
          data: {
            totalUpBets: totalUp.toString(),
            totalDownBets: totalDown.toString(),
          },
        });
      }
    }

    // Process BetClaimed
    for (const log of betClaimedLogs) {
      const { sessionId, bettor, payout } = log.args as {
        sessionId: bigint;
        bettor: string;
        payout: bigint;
      };
      await prisma.bet.updateMany({
        where: {
          sessionId: Number(sessionId),
          bettor: bettor.toLowerCase(),
        },
        data: {
          claimed: true,
          payout: payout.toString(),
        },
      });
    }

    // Process FighterCreated
    for (const log of fighterCreatedLogs) {
      const { owner } = log.args as { owner: string };
      await prisma.fighter.upsert({
        where: { address: owner.toLowerCase() },
        create: { address: owner.toLowerCase() },
        update: {},
      });
    }

    // Process StatsUpdated
    for (const log of statsUpdatedLogs) {
      const { owner, strength, agility, endurance } = log.args as {
        owner: string;
        strength: bigint;
        agility: bigint;
        endurance: bigint;
      };
      const str = Number(strength);
      const agi = Number(agility);
      const end = Number(endurance);
      await prisma.fighter.upsert({
        where: { address: owner.toLowerCase() },
        create: {
          address: owner.toLowerCase(),
          strength: str,
          agility: agi,
          endurance: end,
          totalReps: str + agi + end,
          level: Math.floor((str + agi + end) / 10),
        },
        update: {
          strength: str,
          agility: agi,
          endurance: end,
          totalReps: str + agi + end,
          level: Math.floor((str + agi + end) / 10),
        },
      });
    }

    // Process ChallengeCreated
    for (const log of challengeCreatedLogs) {
      const { challengeId, challenger, opponent, wager } = log.args as {
        challengeId: bigint;
        challenger: string;
        opponent: string;
        wager: bigint;
      };
      // Ensure both fighters exist
      for (const addr of [challenger, opponent]) {
        await prisma.fighter.upsert({
          where: { address: addr.toLowerCase() },
          create: { address: addr.toLowerCase() },
          update: {},
        });
      }
      await prisma.challenge.upsert({
        where: { id: Number(challengeId) },
        create: {
          id: Number(challengeId),
          challenger: challenger.toLowerCase(),
          opponent: opponent.toLowerCase(),
          wager: wager.toString(),
        },
        update: {},
      });
    }

    // Process ChallengeAccepted
    for (const log of challengeAcceptedLogs) {
      const { challengeId } = log.args as { challengeId: bigint };
      await prisma.challenge.update({
        where: { id: Number(challengeId) },
        data: { status: 1 }, // Accepted
      });
    }

    // Process BattleResolved
    for (const log of battleResolvedLogs) {
      const { challengeId, winner, payout } = log.args as {
        challengeId: bigint;
        winner: string;
        payout: bigint;
      };
      const challenge = await prisma.challenge.update({
        where: { id: Number(challengeId) },
        data: {
          status: 2, // Resolved
          winner: winner.toLowerCase(),
          payout: payout.toString(),
        },
      });

      // Update win/loss records
      const loser =
        challenge.challenger === winner.toLowerCase()
          ? challenge.opponent
          : challenge.challenger;
      await prisma.fighter.update({
        where: { address: winner.toLowerCase() },
        data: { wins: { increment: 1 } },
      });
      await prisma.fighter.update({
        where: { address: loser },
        data: { losses: { increment: 1 } },
      });
    }

    fromBlock = toBlock + 1;
  }

  // Update lastBlock
  await prisma.indexerState.update({
    where: { id: 1 },
    data: { lastBlock: currentBlock },
  });

  console.log(`Indexed up to block ${currentBlock}`);
}
