import "LeagueAggregateI.sol";

contract ResultAggregate {
    address owner;
    address[] administrators;
    mapping (uint => Result) results;
    LeagueAggregateI leagueAggregate;
    uint currentId = 0;

    function ResultAggregate(address leagueAggregateAddress) {
        owner = msg.sender;
        leagueAggregate = LeagueAggregateI(leagueAggregateAddress);
    }
    
    function addResult(uint leagueId, uint homeParticipantId, 
        uint homeParticipantScore, uint awayParticipantId, uint awayParticipantScore) onlyReferee(leagueId) {
        
        uint id = getNewId();
        Result result = results[id];
        result.id = id;
        result.leagueId = leagueId;
        result.status = ResultStatus.PENDING;
        result.homeParticipantId = homeParticipantId;
        result.homeParticipantScore = homeParticipantScore;
        result.awayParticipantId = awayParticipantId;
        result.awayParticipantScore = awayParticipantScore;
        result.referee = msg.sender;
    }
    
    function acceptResult(uint resultId) 
        onlyParticipant(resultId) hasNotActed(resultId) atStatus(resultId, ResultStatus.PENDING) {
        
        if (results[resultId].acted != address(0)) {
            changeStatus(resultId, ResultStatus.ACCEPTED);
        } else {
            results[resultId].acted = msg.sender;
        }
    }
    
    function disputeResult(uint resultId) 
        onlyParticipant(resultId) hasNotActed(resultId) atStatus(resultId, ResultStatus.PENDING){
        
    }
    
    function changeStatus(uint resultId, ResultStatus status) private {
        Result result = results[resultId];
        result.status = status;

        if (status == ResultStatus.ACCEPTED) {
            leagueAggregate.addResult(result.leagueId, result.homeParticipantId, 
                result.homeParticipantScore, result.awayParticipantId, result.awayParticipantScore);
        }
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
    
    modifier onlyReferee (uint leagueId) {
        
        if (!leagueAggregate.isReferee(leagueId, msg.sender)) {
            throw;
        }
        _
    }
    
    modifier onlyParticipant (uint resultId) {
        Result result = results[resultId];
        
        
        if (!leagueAggregate.isParticipant(result.leagueId, result.homeParticipantId, msg.sender)
                && !leagueAggregate.isParticipant(result.leagueId, result.awayParticipantId, msg.sender)) {
            throw;
        }
        _
    }
    
    modifier hasNotActed (uint resultId) {
        
        if (results[resultId].acted == msg.sender) {
            throw;
        }
        _
    }
    
    modifier atStatus(uint resultId, ResultStatus status) {
        if (results[resultId].status != status) {
            throw;
        }
        _
    }

    function killMe() {
        if (msg.sender == owner) {
            suicide(owner);
        }
    }
    
    enum ResultStatus { PENDING, DISPUTED, ACCEPTED, MODIFIED, RESOLVED } 
    struct Result {
        uint id;
        uint leagueId;
        ResultStatus status;
        uint homeParticipantId;
        uint homeParticipantScore;
        uint awayParticipantId;
        uint awayParticipantScore;
        address referee;
        address acted;
    }
}