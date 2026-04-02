// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract CeloArcadeUSDmV3 {
    uint8 public constant MAX_GAME_TYPE = 4;
    uint8 public constant MAX_DIFFICULTY = 2;
    uint256 public constant CLAIM_COOLDOWN = 7 days;

    uint256 public constant MIN_ENTRY_FEE = 0.01 ether; // 0.01 USDm
    uint256 public constant MAX_ENTRY_FEE = 5 ether; // 5 USDm

    uint256 private constant MAX_LEADERBOARD_SIZE = 10;
    uint256 private constant CREATOR_BPS = 2000; // 20%
    uint256 private constant BPS_DENOMINATOR = 10000;

    struct Player {
        bool hasAccess;
        uint256 totalScore;
        uint256 gamesPlayed;
        uint256 lastPlayTime;
        uint256 seasonJoined;
    }

    struct GameScore {
        uint256 score;
        uint8 difficulty;
        uint256 timestamp;
    }

    struct LeaderboardEntry {
        address player;
        uint256 totalScore;
    }

    IERC20 public immutable usdmToken;
    address public owner;
    uint256 public creatorEarnings;
    uint256 public prizePool;
    uint256 public seasonNumber;
    uint256 public seasonStartTime;
    uint256 public totalPlayers;
    uint256 public totalGamesPlayed;
    uint256 public lastClaimTime;

    // Mutable entry fee for V3.
    uint256 public entryFee;

    mapping(address => Player) public players;
    mapping(address => mapping(uint8 => GameScore)) private _gameScores;
    LeaderboardEntry[10] public leaderboard;

    bool private _entered;

    event AccessGranted(address indexed player, uint256 deposited, uint256 toPrizePool, uint256 season);
    event CreatorWithdraw(address indexed owner, uint256 amount);
    event EntryFeeUpdated(uint256 oldFee, uint256 newFee, address indexed updatedBy, uint256 timestamp);
    event GamePlayed(
        address indexed player,
        uint8 gameType,
        uint8 difficulty,
        uint256 rawScore,
        uint256 finalScore,
        uint256 newTotalScore
    );
    event LeaderboardUpdated(address indexed player, uint256 rank, uint256 totalScore);
    event NewSeasonStarted(uint256 season, uint256 timestamp);
    event PrizePoolClaimed(address indexed winner, uint256 amount, uint256 season);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier nonReentrant() {
        require(!_entered, "Reentrancy guard");
        _entered = true;
        _;
        _entered = false;
    }

    constructor(address usdmTokenAddress, uint256 initialEntryFee) {
        require(usdmTokenAddress != address(0), "Invalid token");
        owner = msg.sender;
        usdmToken = IERC20(usdmTokenAddress);
        seasonNumber = 1;
        seasonStartTime = block.timestamp;
        lastClaimTime = block.timestamp;

        _setEntryFee(initialEntryFee);
    }

    // Backward compatibility with older frontend ABIs.
    function ENTRY_FEE() external view returns (uint256) {
        return entryFee;
    }

    function setEntryFee(uint256 newEntryFee) external onlyOwner {
        _setEntryFee(newEntryFee);
    }

    function depositToPlay() external nonReentrant {
        _safeTransferFrom(address(usdmToken), msg.sender, address(this), entryFee);

        uint256 creatorShare = (entryFee * CREATOR_BPS) / BPS_DENOMINATOR;
        uint256 prizeShare = entryFee - creatorShare;

        creatorEarnings += creatorShare;
        prizePool += prizeShare;

        Player storage player = players[msg.sender];
        if (!player.hasAccess) {
            player.hasAccess = true;
            player.seasonJoined = seasonNumber;
            totalPlayers += 1;
        }

        emit AccessGranted(msg.sender, entryFee, prizeShare, seasonNumber);
    }

    function submitScore(uint8 gameType, uint256 rawScore, uint8 difficulty) external {
        require(gameType <= MAX_GAME_TYPE, "Invalid game type");
        require(difficulty <= MAX_DIFFICULTY, "Invalid difficulty");

        Player storage player = players[msg.sender];
        require(player.hasAccess, "Access not granted");

        if (player.seasonJoined != seasonNumber) {
            _resetPlayerForSeason(msg.sender, player);
        }

        uint256 finalScore = (rawScore * getMultiplier(difficulty)) / 100;
        player.totalScore += finalScore;
        player.gamesPlayed += 1;
        player.lastPlayTime = block.timestamp;
        totalGamesPlayed += 1;

        GameScore storage bestScore = _gameScores[msg.sender][gameType];
        if (finalScore > bestScore.score) {
            bestScore.score = finalScore;
            bestScore.difficulty = difficulty;
            bestScore.timestamp = block.timestamp;
        }

        _upsertLeaderboard(msg.sender, player.totalScore);
        emit GamePlayed(msg.sender, gameType, difficulty, rawScore, finalScore, player.totalScore);
    }

    function claimPrizePool() external nonReentrant {
        require(canClaimPrize(), "Prize not claimable");
        require(leaderboard[0].player == msg.sender, "Only top player can claim");

        uint256 claimAmount = prizePool;
        require(claimAmount > 0, "Prize pool empty");

        prizePool = 0;
        lastClaimTime = block.timestamp;
        _safeTransfer(address(usdmToken), msg.sender, claimAmount);

        uint256 claimedSeason = seasonNumber;
        emit PrizePoolClaimed(msg.sender, claimAmount, claimedSeason);

        seasonNumber += 1;
        seasonStartTime = block.timestamp;
        _clearLeaderboard();
        emit NewSeasonStarted(seasonNumber, seasonStartTime);
    }

    function withdrawCreatorEarnings() external onlyOwner nonReentrant {
        uint256 amount = creatorEarnings;
        require(amount > 0, "No earnings");

        creatorEarnings = 0;
        _safeTransfer(address(usdmToken), owner, amount);
        emit CreatorWithdraw(owner, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    function checkAccess(address player) external view returns (bool) {
        return players[player].hasAccess;
    }

    function getMultiplier(uint8 difficulty) public pure returns (uint256) {
        if (difficulty == 0) return 100; // Easy 1x
        if (difficulty == 1) return 150; // Medium 1.5x
        if (difficulty == 2) return 200; // Hard 2x
        revert("Invalid difficulty");
    }

    function getPrizePool() external view returns (uint256) {
        return prizePool;
    }

    function getCurrentSeason() external view returns (uint256) {
        return seasonNumber;
    }

    function getArcadeStats()
        external
        view
        returns (uint256 _prizePool, uint256 _totalPlayers, uint256 _totalGamesPlayed, uint256 _season)
    {
        return (prizePool, totalPlayers, totalGamesPlayed, seasonNumber);
    }

    function getLeaderboard() external view returns (LeaderboardEntry[10] memory) {
        return leaderboard;
    }

    function getTopPlayer() external view returns (address, uint256) {
        return (leaderboard[0].player, leaderboard[0].totalScore);
    }

    function canClaimPrize() public view returns (bool) {
        if (leaderboard[0].player == address(0) || prizePool == 0) return false;
        return block.timestamp >= lastClaimTime + CLAIM_COOLDOWN;
    }

    function getTimeUntilNextClaim() external view returns (uint256) {
        uint256 claimAt = lastClaimTime + CLAIM_COOLDOWN;
        if (block.timestamp >= claimAt) return 0;
        return claimAt - block.timestamp;
    }

    function getPlayerStats(address playerAddress)
        external
        view
        returns (bool hasAccess, uint256 totalScore, uint256 gamesPlayed, uint256 lastPlayTime, uint256 seasonJoined)
    {
        Player memory player = players[playerAddress];
        if (!player.hasAccess) {
            return (false, 0, 0, 0, 0);
        }

        if (player.seasonJoined != seasonNumber) {
            return (true, 0, 0, player.lastPlayTime, player.seasonJoined);
        }

        return (true, player.totalScore, player.gamesPlayed, player.lastPlayTime, player.seasonJoined);
    }

    function getPlayerGameScore(address playerAddress, uint8 gameType)
        external
        view
        returns (uint256 score, uint8 difficulty, uint256 timestamp)
    {
        require(gameType <= MAX_GAME_TYPE, "Invalid game type");
        if (players[playerAddress].seasonJoined != seasonNumber) {
            return (0, 0, 0);
        }

        GameScore memory gameScore = _gameScores[playerAddress][gameType];
        return (gameScore.score, gameScore.difficulty, gameScore.timestamp);
    }

    function getAllPlayerGameScores(address playerAddress) external view returns (uint256[5] memory scores) {
        if (players[playerAddress].seasonJoined != seasonNumber) {
            return scores;
        }

        for (uint8 i = 0; i <= MAX_GAME_TYPE; i++) {
            scores[i] = _gameScores[playerAddress][i].score;
        }
    }

    receive() external payable {
        revert("CELO not accepted");
    }

    function _setEntryFee(uint256 newEntryFee) internal {
        require(newEntryFee >= MIN_ENTRY_FEE, "Entry fee too low");
        require(newEntryFee <= MAX_ENTRY_FEE, "Entry fee too high");

        uint256 oldFee = entryFee;
        entryFee = newEntryFee;
        emit EntryFeeUpdated(oldFee, newEntryFee, msg.sender, block.timestamp);
    }

    function _resetPlayerForSeason(address playerAddress, Player storage player) internal {
        player.totalScore = 0;
        player.gamesPlayed = 0;
        player.seasonJoined = seasonNumber;

        for (uint8 i = 0; i <= MAX_GAME_TYPE; i++) {
            delete _gameScores[playerAddress][i];
        }
    }

    function _clearLeaderboard() internal {
        for (uint256 i = 0; i < MAX_LEADERBOARD_SIZE; i++) {
            delete leaderboard[i];
        }
    }

    function _upsertLeaderboard(address playerAddress, uint256 totalScore) internal {
        uint256 index = MAX_LEADERBOARD_SIZE;

        for (uint256 i = 0; i < MAX_LEADERBOARD_SIZE; i++) {
            if (leaderboard[i].player == playerAddress) {
                index = i;
                break;
            }
        }

        if (index == MAX_LEADERBOARD_SIZE) {
            for (uint256 i = 0; i < MAX_LEADERBOARD_SIZE; i++) {
                if (leaderboard[i].player == address(0)) {
                    index = i;
                    break;
                }
            }

            if (index == MAX_LEADERBOARD_SIZE) {
                if (totalScore <= leaderboard[MAX_LEADERBOARD_SIZE - 1].totalScore) {
                    return;
                }
                index = MAX_LEADERBOARD_SIZE - 1;
            }

            leaderboard[index] = LeaderboardEntry({ player: playerAddress, totalScore: totalScore });
        } else {
            leaderboard[index].totalScore = totalScore;
        }

        while (index > 0 && leaderboard[index].totalScore > leaderboard[index - 1].totalScore) {
            LeaderboardEntry memory previous = leaderboard[index - 1];
            leaderboard[index - 1] = leaderboard[index];
            leaderboard[index] = previous;
            index -= 1;
        }

        emit LeaderboardUpdated(playerAddress, index + 1, totalScore);
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transfer failed");
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transferFrom failed");
    }
}
