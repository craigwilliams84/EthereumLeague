import "StringUtils.sol";
import "LeagueAggregateI.sol";

contract LeagueAggregate is LeagueAggregateI {

    struct League {
        uint id;
        bytes32 name;
        uint entryFee;
        uint pointsForWin;
        uint pointsForDraw;
        address adminAddress;
        address[] referees;
        Participant[] participants;
        mapping (uint => uint) scores;
    }
    
    struct Participant {
        uint id;
        bytes32 name;
        address adminAddress;
    }

    address owner;
    address[] administrators;
    address resultAggregateAddress;
    //Using array rather than mapping as we want to iterate over
    //and league indexes are incremental anyway
    League[] leagues;
    mapping (address => uint) availableFunds;
    
    uint currentId = 0;

    function LeagueAggregate() {
        owner = msg.sender;
    }

    function addLeague(bytes32 name, uint pointsForWin, uint pointsForDraw, uint entryFee) {
        uint id = getNewId();
        leagues.length = leagues.length + 1;
        leagues[id].id = id;
        leagues[id].name = name;
        leagues[id].pointsForWin = pointsForWin;
        leagues[id].pointsForDraw = pointsForDraw;
        leagues[id].entryFee = entryFee;
        leagues[id].adminAddress = msg.sender;
        
        OnLeagueAdded(id);
    }
    
    function addRefereeToLeague(uint leagueId, address refereeAddress) onlyAdmin(leagueId) {
    	leagues[leagueId].referees.push(refereeAddress);
    }
    
    function joinLeague(uint leagueId, bytes32 participantName) {

        //Check team doesn't exist
        if (doesLeagueContainParticipant(leagueId, participantName)) {
            throw;
        } else {
        	//Check the entry fee is correct
        	if (msg.value < leagues[leagueId].entryFee) {
        		//Too low, add funds to be withdrawn
        		availableFunds[msg.sender] =+ msg.value;
        	} else {
        		if (msg.value > leagues[leagueId].entryFee) {
        			//Too high, add remainder to available funds to withdraw
        			availableFunds[msg.sender] =+ msg.value - leagues[leagueId].entryFee;
        		}
            	uint index = leagues[leagueId].participants.length;
        		leagues[leagueId].participants.length = index + 1;
        		uint id = getNewId();
        		leagues[leagueId].participants[index].id = id;
        		leagues[leagueId].participants[index].name = participantName;
        		leagues[leagueId].participants[index].adminAddress = msg.sender;
        		leagues[leagueId].scores[id] = 0;
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
    
    function isReferee(uint leagueId, address potentialRefereeAddress) constant returns (bool) {
        League league = leagues[leagueId];
        
        for (uint i = 0; i < league.referees.length; i++) {
            if (league.referees[leagueId] == potentialRefereeAddress) {
                return true;
            }
        }
        
        return false;
    }
    
    function addResult(uint leagueId, uint homeParticipantId, 
        uint homeParticipantScore, uint awayParticipantId, uint awayParticipantScore) onlyResultAggregateContract {

        if (homeParticipantScore > awayParticipantScore) {
            //Home win
            leagues[leagueId].scores[homeParticipantId] =+ leagues[leagueId].pointsForWin;
        } else if (homeParticipantScore < awayParticipantScore) {
            //Away win
            leagues[leagueId].scores[awayParticipantId] =+ leagues[leagueId].pointsForWin;
        } else {
            //Draw
            leagues[leagueId].scores[homeParticipantId] += leagues[leagueId].pointsForDraw;
            leagues[leagueId].scores[awayParticipantId] += leagues[leagueId].pointsForDraw;
        }
    }
    
    function getLeaguesForAdmin(address adminAddress) constant returns (uint[]) {

        //Push not available for memory arrays so we need to keep a count
        uint foundLeagueCount;
        
        for(uint i = 0; i < leagues.length; i++) {
            if (leagues[i].adminAddress == adminAddress) {
                foundLeagueCount++;
            }
        }
        
        //Memory arrays can't be dynamic...Is there a better way to do this rather than iterating twice??
        uint[] memory leagueIds = new uint[](foundLeagueCount);
        
        foundLeagueCount = 0;
        
        //Can't use i again here
        for(uint x = 0; x < leagues.length; x++) {
            if (leagues[x].adminAddress == adminAddress) {
                leagueIds[foundLeagueCount] = leagues[x].id;
                foundLeagueCount++;
            }
        }
        
        return leagueIds;
    }
    
    function getLeagueDetails(uint leagueId) constant returns (bytes32 name, uint[] participantIds, bytes32[] participantNames, uint[] participantScores) {
    
        League league = leagues[leagueId];
        uint[] memory partIds = new uint[](league.participants.length);
        bytes32[] memory partNames = new bytes32[](league.participants.length);
        uint[] memory partScores = new uint[](league.participants.length);
        
        for (uint i = 0; i < league.participants.length; i++) {
            Participant participant = league.participants[i];
            partIds[i] = participant.id;
            partNames[i] = participant.name;
            partScores[i] = league.scores[participant.id];
        }

        return(league.name, partIds, partNames, partScores);
    }
    
    function getNewId() private returns (uint id) {
        return currentId++;
    }
    
    function setResultAggregateAddress(address resultAggAdd) onlyOwner {
    	resultAggregateAddress = resultAggAdd;
    }

    modifier onlyOwner () {
        if (msg.sender != owner) {
            throw;
        }
        _
    }
    
    modifier onlyAdmin (uint leagueId) {
        if (leagues[leagueId].adminAddress != msg.sender) {
            throw;
        }
        _
    }
    
    modifier onlyResultAggregateContract () {
        if (resultAggregateAddress != msg.sender) {
            throw;
        }
        _
    }
    
    event OnLeagueAdded(uint indexed id);

    function killMe() {
        if (msg.sender == owner) {
            suicide(owner);
        }
    }
}