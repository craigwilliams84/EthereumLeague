pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import "./LeagueAggregateI.sol";
import "./Fundable.sol";

/**
 * The contract for managing league operations (adding, joining, adding referees, adding
 * confirmed results and league completion/payout).
 *
 * Results can be added only via the Result Contract.
 */
contract LeagueAggregate is LeagueAggregateI, Ownable {

    struct League {
        uint id;
        bytes32 name;
        LeagueStatus status;
        uint entryFee;
        uint8 pointsForWin;
        uint8 pointsForDraw;
        uint8 numOfEntrants;
        uint8 timesToPlayEachParticipant;
        address adminAddress;
        address[] referees;
        Participant[] participants;
        mapping (uint => uint16) scores;
        uint8 resultCount;
    }

    struct Participant {
        uint id;
        bytes32 name;
        address adminAddress;
    }

enum LeagueStatus { AWAITING_PARTICIPANTS, IN_PROGRESS, COMPLETED }

    address[] administrators;
    address resultAggregateAddress;
    Fundable bankContract;
    //Using array rather than mapping as we want to iterate over
    //and league indexes are incremental anyway
    League[] leagues;

    uint currentLeagueId = 0;
    uint currentParticipantId = 0;

    function addLeague(bytes32 name,
      uint8 pointsForWin, uint8 pointsForDraw, uint entryFee, uint8 numOfEntrants, uint8 timesToPlayEachParticipant) external {
        uint id = getNewLeagueId();
        leagues.length = leagues.length + 1;
        leagues[id].id = id;
        leagues[id].name = name;
        leagues[id].pointsForWin = pointsForWin;
        leagues[id].pointsForDraw = pointsForDraw;
        leagues[id].entryFee = entryFee;
        leagues[id].numOfEntrants = numOfEntrants;
        leagues[id].timesToPlayEachParticipant = timesToPlayEachParticipant;
        leagues[id].adminAddress = msg.sender;

        OnLeagueAdded(id, msg.sender);
    }

    function addRefereeToLeague(uint leagueId, address refereeAddress) external onlyAdmin(leagueId) {
        leagues[leagueId].referees.push(refereeAddress);
        OnRefereeAdded(leagueId, refereeAddress);
    }

    function joinLeague(uint leagueId, bytes32 participantName) external payable onlyWithStatus(leagueId, LeagueStatus.AWAITING_PARTICIPANTS) {
        //Check team doesn't exist
        if (doesLeagueContainParticipant(leagueId, participantName)) {
            throw;
        } else {
            //Check the entry fee is correct
            if (msg.value < leagues[leagueId].entryFee) {
                //Too low, add funds to be withdrawn
                addAvailableFunds(msg.sender, msg.value);
            } else {

                if (msg.value > leagues[leagueId].entryFee) {
                    //Too high, add remainder to available funds to withdraw
                    addAvailableFunds(msg.sender, msg.value - leagues[leagueId].entryFee);
                }

                uint index = leagues[leagueId].participants.length;
                leagues[leagueId].participants.length = index + 1;
                uint id = getNewParticipantId();
                leagues[leagueId].participants[index].id = id;
                leagues[leagueId].participants[index].name = participantName;
                leagues[leagueId].participants[index].adminAddress = msg.sender;
                leagues[leagueId].scores[id] = 0;

                if (leagues[leagueId].participants.length == leagues[leagueId].numOfEntrants) {
                    updateLeagueStatus(leagueId, LeagueStatus.IN_PROGRESS);
                }
                forwardFundsToBank();
                OnLeagueJoined(leagueId, id, msg.sender);
            }
        }
    }

    function doesLeagueContainParticipant(uint leagueId, bytes32 participantName) constant returns (bool){
        League league = leagues[leagueId];

        for (uint i = 0; i < league.participants.length; i++) {
            if (league.participants[i].name == participantName) {
                return true;
            }
        }

        return false;
    }

    function isParticipantAddress(uint leagueId, uint participantId, address potentialParticipantAddress) constant returns (bool) {
        League league = leagues[leagueId];

        for (uint i = 0; i < league.participants.length; i++) {
            if (league.participants[i].id == participantId) {

                if(league.participants[i].adminAddress == potentialParticipantAddress) {
                    return true;
                }

                return false;
            }
        }

        return false;
    }

    function isRefereeAddress(uint leagueId, address potentialRefereeAddress) constant returns (bool) {
        League league = leagues[leagueId];

        for (uint i = 0; i < league.referees.length; i++) {
            if (league.referees[leagueId] == potentialRefereeAddress) {
                return true;
            }
        }

        return false;
    }

    function addResult(uint leagueId, uint homeParticipantId,
      uint16 homeParticipantScore, uint awayParticipantId, uint16 awayParticipantScore) external onlyResultAggregateContract {

        if (homeParticipantScore > awayParticipantScore) {
            //Home win
            leagues[leagueId].scores[homeParticipantId] = leagues[leagueId].scores[homeParticipantId] + leagues[leagueId].pointsForWin;
        } else if (homeParticipantScore < awayParticipantScore) {
            //Away win
            leagues[leagueId].scores[awayParticipantId] = leagues[leagueId].scores[awayParticipantId] + leagues[leagueId].pointsForWin;
        } else {
            //Draw
            leagues[leagueId].scores[homeParticipantId] = leagues[leagueId].scores[homeParticipantId] + leagues[leagueId].pointsForDraw;
            leagues[leagueId].scores[awayParticipantId] = leagues[leagueId].scores[awayParticipantId] + leagues[leagueId].pointsForDraw;
        }

        leagues[leagueId].resultCount++;

        //Have all results been received?
        if (leagues[leagueId].resultCount == leagues[leagueId].numOfEntrants * leagues[leagueId].timesToPlayEachParticipant - 2) {
            completeLeague(leagueId);
        }
    }

    function getLeagueDetails(uint leagueId) constant returns (bytes32 name, uint[] participantIds, bytes32[] participantNames, uint16[] participantScores, uint entryFee, LeagueStatus status, uint8 numOfEntrants, uint8 timesToPlayEachParticpiant) {

        League league = leagues[leagueId];
        uint[] memory partIds = new uint[](league.participants.length);
        bytes32[] memory partNames = new bytes32[](league.participants.length);
        uint16[] memory partScores = new uint16[](league.participants.length);

        for (uint i = 0; i < league.participants.length; i++) {
            Participant participant = league.participants[i];
            partIds[i] = participant.id;
            partNames[i] = participant.name;
            partScores[i] = league.scores[participant.id];
        }

        return(league.name, partIds, partNames, partScores, league.entryFee, league.status, league.numOfEntrants, league.timesToPlayEachParticipant);
    }

    function setResultAggregateAddress(address resultAggAdd) external onlyOwner {
        resultAggregateAddress = resultAggAdd;
    }

    function setBankAddress(address theBankAddress) external onlyOwner {
        bankContract = Fundable(theBankAddress);
    }

    function forwardFundsToBank() private {
        bankContract.transfer(msg.value);
        ForwardedFunds(bankContract, msg.value);
    }

    function addAvailableFunds(address theAddress, uint amount) private{
        bankContract.addAvailableFunds(theAddress, amount);
    }

    function completeLeague(uint leagueId) private {
        leagues[leagueId].status = LeagueStatus.COMPLETED;

        //For now, winner takes all, but this could change (and the contract should take a cut also)
        //Need to cope with multiple top scores
        addAvailableFunds(getHighestScoreAddress(leagueId), leagues[leagueId].entryFee * leagues[leagueId].numOfEntrants);
    }

    //TODO Cope with multiple top scores
    function getHighestScoreAddress(uint leagueId) private returns (address){
        League league = leagues[leagueId];

        address highestAddress;
        uint16 highestScore;
        for (uint i = 0; i < league.participants.length; i++) {
            Participant participant = league.participants[i];
            if (league.scores[participant.id] > highestScore) {
                highestAddress = participant.adminAddress;
            }

            highestScore = league.scores[participant.id];
        }

        return highestAddress;
    }

    function updateLeagueStatus(uint leagueId, LeagueStatus leagueStatus) private {
        leagues[leagueId].status = leagueStatus;
    }

    function getNewLeagueId() private returns (uint id) {
        return currentLeagueId++;
    }

    function getNewParticipantId() private returns (uint id) {
        return currentParticipantId++;
    }

    modifier onlyAdmin (uint leagueId) {
        if (leagues[leagueId].adminAddress != msg.sender) {
            throw;
        }
        _;
    }

    modifier onlyResultAggregateContract () {
        if (resultAggregateAddress != msg.sender) {
            throw;
        }
        _;
    }

    modifier onlyWithStatus (uint leagueId, LeagueStatus status) {
        if (leagues[leagueId].status != status) {
            throw;
        }
        _;
    }

    event OnLeagueAdded(uint indexed leagueId, address indexed adminAddress);

    event OnLeagueJoined(uint indexed leagueId, uint indexed participantId, address indexed participantAddress);

    event OnRefereeAdded(uint indexed leagueId, address indexed refereeAddress);

    event ForwardedFunds(address bankAddress, uint amount);

    function killMe() {
        if (msg.sender == owner) {
            suicide(owner);
        }
    }
}