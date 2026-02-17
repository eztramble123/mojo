// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MojoToken.sol";

contract MojoSession {
    enum SessionStatus { Active, Resolved, Expired }
    enum ExerciseType { Pushups, Squats, JumpingJacks }

    struct Session {
        address exerciser;
        ExerciseType exerciseType;
        uint256 targetReps;
        uint256 actualReps;
        uint256 startTime;
        SessionStatus status;
        uint256 totalUpBets;
        uint256 totalDownBets;
    }

    struct Bet {
        uint256 amount;
        bool isUp;
        bool claimed;
    }

    uint256 public constant SESSION_TIMEOUT = 30 minutes;
    uint256 public constant MOJO_PER_REP = 10 ether; // 10 MOJO (18 decimals) per rep

    MojoToken public mojoToken;
    uint256 public nextSessionId;
    mapping(uint256 => Session) public sessions;
    mapping(uint256 => mapping(address => Bet)) public bets;

    event SessionCreated(uint256 indexed sessionId, address indexed exerciser, ExerciseType exerciseType, uint256 targetReps);
    event BetPlaced(uint256 indexed sessionId, address indexed bettor, bool isUp, uint256 amount);
    event SessionResolved(uint256 indexed sessionId, uint256 actualReps, bool targetMet);
    event BetClaimed(uint256 indexed sessionId, address indexed bettor, uint256 payout);

    constructor(address _mojoToken) {
        mojoToken = MojoToken(_mojoToken);
    }

    function createSession(ExerciseType exerciseType, uint256 targetReps) external returns (uint256) {
        require(targetReps > 0, "Target must be > 0");
        uint256 sessionId = nextSessionId++;
        sessions[sessionId] = Session({
            exerciser: msg.sender,
            exerciseType: exerciseType,
            targetReps: targetReps,
            actualReps: 0,
            startTime: block.timestamp,
            status: SessionStatus.Active,
            totalUpBets: 0,
            totalDownBets: 0
        });
        emit SessionCreated(sessionId, msg.sender, exerciseType, targetReps);
        return sessionId;
    }

    function placeBet(uint256 sessionId, bool isUp) external payable {
        Session storage session = sessions[sessionId];
        require(session.status == SessionStatus.Active, "Session not active");
        require(msg.sender != session.exerciser, "Exerciser cannot bet");
        require(msg.value > 0, "Bet must be > 0");
        require(bets[sessionId][msg.sender].amount == 0, "Already bet");

        bets[sessionId][msg.sender] = Bet({
            amount: msg.value,
            isUp: isUp,
            claimed: false
        });

        if (isUp) {
            session.totalUpBets += msg.value;
        } else {
            session.totalDownBets += msg.value;
        }

        emit BetPlaced(sessionId, msg.sender, isUp, msg.value);
    }

    function resolveSession(uint256 sessionId, uint256 actualReps) external {
        Session storage session = sessions[sessionId];
        require(session.status == SessionStatus.Active, "Session not active");
        require(msg.sender == session.exerciser, "Only exerciser can resolve");

        session.actualReps = actualReps;
        session.status = SessionStatus.Resolved;

        // Mint MOJO tokens for completed reps
        if (actualReps > 0) {
            mojoToken.mint(msg.sender, actualReps * MOJO_PER_REP);
        }

        emit SessionResolved(sessionId, actualReps, actualReps >= session.targetReps);
    }

    function claimBet(uint256 sessionId) external {
        Session storage session = sessions[sessionId];
        Bet storage bet = bets[sessionId][msg.sender];
        require(bet.amount > 0, "No bet found");
        require(!bet.claimed, "Already claimed");

        uint256 payout = 0;

        if (session.status == SessionStatus.Resolved) {
            bool targetMet = session.actualReps >= session.targetReps;
            bool won = (bet.isUp && targetMet) || (!bet.isUp && !targetMet);

            if (won) {
                uint256 totalPool = session.totalUpBets + session.totalDownBets;
                uint256 winningPool = bet.isUp ? session.totalUpBets : session.totalDownBets;
                // Proportional share of total pool
                payout = (bet.amount * totalPool) / winningPool;
            }
        } else if (block.timestamp > session.startTime + SESSION_TIMEOUT) {
            // Session expired, refund bettors
            session.status = SessionStatus.Expired;
            payout = bet.amount;
        } else {
            revert("Session not resolved yet");
        }

        bet.claimed = true;
        if (payout > 0) {
            (bool success,) = payable(msg.sender).call{value: payout}("");
            require(success, "Transfer failed");
        }

        emit BetClaimed(sessionId, msg.sender, payout);
    }

    function getSession(uint256 sessionId) external view returns (Session memory) {
        return sessions[sessionId];
    }
}
