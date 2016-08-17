import "StringUtils.sol";

contract LeagueAggregate {

    struct League {
        uint id;
        bytes32 name;
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
    //Using array rather than mapping as we want to iterate over
    //and league indexes are incremental anyway
    League[] leagues;
    
    uint currentId = 0;

    function LeagueAggregate() {
        owner = msg.sender;
    }

    function addLeague(bytes32 name, uint pointsForWin, uint pointsForDraw) {
        uint id = getNewId();
        leagues.length = leagues.length + 1;
        leagues[id].id = id;
        leagues[id].name = name;
        leagues[id].pointsForWin = pointsForWin;
        leagues[id].pointsForDraw = pointsForDraw;
        leagues[id].adminAddress = msg.sender;
    }
    
    function addParticipantToLeague(uint leagueId, bytes32 participantName) onlyAdmin(leagueId) {
        League league = leagues[leagueId];
        
        //Check team doesn't exist
        if (doesLeagueContainParticipant(leagueId, participantName)) {
            throw;
        } else {
            league.participants.push(Participant(getNewId(), participantName, msg.sender));
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
        uint homeParticipantScore, uint awayParticipantId, uint awayParticipantScore) {
        
        League league = leagues[leagueId];

        if (homeParticipantScore > awayParticipantScore) {
            //Home win
            league.scores[homeParticipantId] =+ league.pointsForWin;
        } else if (homeParticipantScore < awayParticipantScore) {
            //Away win
            league.scores[awayParticipantId] =+ league.pointsForWin;
        } else {
            //Draw
            league.scores[homeParticipantId]++;
            league.scores[awayParticipantId]++;
        }
    }
    
    function getLeagueName(uint id) constant returns (bytes32) {
        return leagues[id].name;
    }
    
    function getLeaguesForAdmin(address adminAddress) constant returns (uint[]) {
        uint[] memory leagueIds;

        //Push not available for memory arrays so we need to keep a count
        uint foundLeagueCount;
        
        for(uint i = 0; i < leagues.length; i++) {
            if (leagues[i].adminAddress == adminAddress) {
                leagueIds[foundLeagueCount] = leagues[i].id;
                foundLeagueCount++;
            }
        }
        
        return leagueIds;
    }
    
    function getNewId() private returns (uint id) {
        return currentId++;
    }

    modifier onlyOwner (string name) {
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

    function killMe() {
        if (msg.sender == owner) {
            suicide(owner);
        }
    }
}