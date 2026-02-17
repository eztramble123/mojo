// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MojoSession.sol";

contract MojoFighter {
    struct Fighter {
        uint256 strength;   // from pushups
        uint256 agility;    // from jumping jacks
        uint256 endurance;  // from squats
        uint256 totalReps;
        uint256 level;
        uint256 wins;
        uint256 losses;
        bool exists;
    }

    enum ChallengeStatus { Pending, Accepted, Resolved, Cancelled }

    struct Challenge {
        address challenger;
        address opponent;
        uint256 wager;
        ChallengeStatus status;
        address winner;
    }

    MojoSession public mojoSession;
    mapping(address => Fighter) public fighters;
    mapping(uint256 => bool) public syncedSessions;

    uint256 public nextChallengeId;
    mapping(uint256 => Challenge) public challenges;

    // Level thresholds
    uint256[] public levelThresholds;

    event FighterCreated(address indexed owner);
    event StatsUpdated(address indexed owner, uint256 strength, uint256 agility, uint256 endurance);
    event ChallengeCreated(uint256 indexed challengeId, address indexed challenger, address indexed opponent, uint256 wager);
    event ChallengeAccepted(uint256 indexed challengeId);
    event BattleResolved(uint256 indexed challengeId, address indexed winner, uint256 payout);

    constructor(address _mojoSession) {
        mojoSession = MojoSession(_mojoSession);
        // Level thresholds: 0, 10, 30, 60, 100, 150, 210, 280, 360, 450
        levelThresholds.push(0);
        levelThresholds.push(10);
        levelThresholds.push(30);
        levelThresholds.push(60);
        levelThresholds.push(100);
        levelThresholds.push(150);
        levelThresholds.push(210);
        levelThresholds.push(280);
        levelThresholds.push(360);
        levelThresholds.push(450);
    }

    function createFighter() external {
        require(!fighters[msg.sender].exists, "Fighter already exists");
        fighters[msg.sender] = Fighter({
            strength: 0,
            agility: 0,
            endurance: 0,
            totalReps: 0,
            level: 1,
            wins: 0,
            losses: 0,
            exists: true
        });
        emit FighterCreated(msg.sender);
    }

    function syncStats(uint256 sessionId) external {
        require(fighters[msg.sender].exists, "Create fighter first");
        require(!syncedSessions[sessionId], "Already synced");

        (
            address exerciser,
            MojoSession.ExerciseType exerciseType,
            ,  // targetReps
            uint256 actualReps,
            ,  // startTime
            MojoSession.SessionStatus status,
            ,  // totalUpBets
               // totalDownBets
        ) = mojoSession.sessions(sessionId);

        require(exerciser == msg.sender, "Not your session");
        require(status == MojoSession.SessionStatus.Resolved, "Session not resolved");

        syncedSessions[sessionId] = true;
        Fighter storage fighter = fighters[msg.sender];

        if (exerciseType == MojoSession.ExerciseType.Pushups) {
            fighter.strength += actualReps;
        } else if (exerciseType == MojoSession.ExerciseType.JumpingJacks) {
            fighter.agility += actualReps;
        } else if (exerciseType == MojoSession.ExerciseType.Squats) {
            fighter.endurance += actualReps;
        }

        fighter.totalReps += actualReps;
        fighter.level = _calculateLevel(fighter.totalReps);

        emit StatsUpdated(msg.sender, fighter.strength, fighter.agility, fighter.endurance);
    }

    function challenge(address opponent) external payable returns (uint256) {
        require(fighters[msg.sender].exists, "Create fighter first");
        require(fighters[opponent].exists, "Opponent has no fighter");
        require(msg.sender != opponent, "Cannot challenge self");
        require(msg.value > 0, "Wager must be > 0");

        uint256 challengeId = nextChallengeId++;
        challenges[challengeId] = Challenge({
            challenger: msg.sender,
            opponent: opponent,
            wager: msg.value,
            status: ChallengeStatus.Pending,
            winner: address(0)
        });

        emit ChallengeCreated(challengeId, msg.sender, opponent, msg.value);
        return challengeId;
    }

    function acceptChallenge(uint256 challengeId) external payable {
        Challenge storage c = challenges[challengeId];
        require(c.status == ChallengeStatus.Pending, "Not pending");
        require(msg.sender == c.opponent, "Not the opponent");
        require(msg.value == c.wager, "Must match wager");

        c.status = ChallengeStatus.Accepted;
        emit ChallengeAccepted(challengeId);
    }

    function resolveBattle(uint256 challengeId) external {
        Challenge storage c = challenges[challengeId];
        require(c.status == ChallengeStatus.Accepted, "Not accepted");

        Fighter storage attacker = fighters[c.challenger];
        Fighter storage defender = fighters[c.opponent];

        // Deterministic battle using block.prevrandao
        uint256 seed = uint256(keccak256(abi.encodePacked(block.prevrandao, challengeId)));
        uint256 attackerRandom = seed % (attacker.totalReps + 1);
        uint256 defenderRandom = uint256(keccak256(abi.encodePacked(seed))) % (defender.totalReps + 1);

        uint256 attackerPower = attacker.strength * 3 + attacker.agility * 2 + attacker.endurance * 2 + attackerRandom;
        uint256 defenderPower = defender.strength * 3 + defender.agility * 2 + defender.endurance * 2 + defenderRandom;

        uint256 totalPot = c.wager * 2;
        address winner;

        if (attackerPower >= defenderPower) {
            winner = c.challenger;
            attacker.wins++;
            defender.losses++;
        } else {
            winner = c.opponent;
            defender.wins++;
            attacker.losses++;
        }

        c.winner = winner;
        c.status = ChallengeStatus.Resolved;

        (bool success,) = payable(winner).call{value: totalPot}("");
        require(success, "Transfer failed");

        emit BattleResolved(challengeId, winner, totalPot);
    }

    function cancelChallenge(uint256 challengeId) external {
        Challenge storage c = challenges[challengeId];
        require(c.status == ChallengeStatus.Pending, "Not pending");
        require(msg.sender == c.challenger, "Not challenger");

        c.status = ChallengeStatus.Cancelled;
        (bool success,) = payable(msg.sender).call{value: c.wager}("");
        require(success, "Transfer failed");
    }

    function getFighter(address addr) external view returns (Fighter memory) {
        return fighters[addr];
    }

    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        return challenges[challengeId];
    }

    function _calculateLevel(uint256 totalReps) internal view returns (uint256) {
        for (uint256 i = levelThresholds.length - 1; i > 0; i--) {
            if (totalReps >= levelThresholds[i]) {
                return i + 1;
            }
        }
        return 1;
    }
}
