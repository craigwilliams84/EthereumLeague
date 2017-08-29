pragma solidity ^0.4.11;

import "./LeagueAggregateI.sol";

contract ResultAggregate {
    address owner;
    address[] administrators;
    mapping (uint => Result[]) results;
    LeagueAggregateI leagueAggregate;
    uint currentId = 0;

    function ResultAggregate(address leagueAggregateAddress) {
        owner = msg.sender;
        leagueAggregate = LeagueAggregateI(leagueAggregateAddress);
    }
    
    function addResult(uint leagueId, uint homeParticipantId, 
        uint16 homeScore, uint awayParticipantId, uint16 awayScore) onlyReferee(leagueId) {
        
        uint id = getNewResultId(leagueId);
        results[leagueId].length++;
        results[leagueId][id].id = id;
        results[leagueId][id].leagueId = leagueId;
        results[leagueId][id].status = ResultStatus.PENDING;
        results[leagueId][id].homeParticipantId = homeParticipantId;
        results[leagueId][id].homeScore = homeScore;
        results[leagueId][id].awayParticipantId = awayParticipantId;
        results[leagueId][id].awayScore = awayScore;
        results[leagueId][id].referee = msg.sender;
    }
    
    function getPendingResultIds(uint leagueId) constant returns (uint[]) {
        return getResultIds(leagueId, ResultStatus.PENDING);
    }
    
    function getResultIds(uint leagueId, ResultStatus status) constant private returns (uint[]) {
        
        uint numResults = 0;
        for (uint i = 0; i < results[leagueId].length; i++) {
            if (results[leagueId][i].status == status) {
                numResults++;
            }
        }

        uint[] memory resultIds = new uint[](numResults);
        uint counter = 0;
        
        for (uint n = 0; n < results[leagueId].length; n++) {
            //It feels weird checking this twice but should be cheaper on gas
            //compared to storing the pending status id's in the previous loop
            if (results[leagueId][n].status == status) {
                resultIds[counter] = results[leagueId][n].id;
                counter++;
            }
        }
        
        return resultIds;
    }
    
    function getResultDetails(uint leagueId, uint resultId) constant returns(
        ResultStatus status, uint homePartId, uint16 homeScore, uint awayPartId, uint16 awayScore, address acted) {
        
        Result result = results[leagueId][resultId];
        return (result.status, result.homeParticipantId, result.homeScore, result.awayParticipantId, result.awayScore, result.acted);
    }
    
    function acceptResult(uint leagueId, uint resultId) 
        onlyParticipant(leagueId, resultId) hasNotActed(leagueId, resultId) atStatus(leagueId, resultId, ResultStatus.PENDING) {
        
        if (results[leagueId][resultId].acted != 0 
        	&& results[leagueId][resultId].acted != msg.sender) {
            changeStatus(leagueId, resultId, ResultStatus.ACCEPTED);
        } else {
            results[leagueId][resultId].acted = msg.sender;
        }
    }
    
    function disputeResult(uint leagueId, uint resultId) 
        onlyParticipant(leagueId, resultId) hasNotActed(leagueId, resultId) atStatus(leagueId, resultId, ResultStatus.PENDING){
        
    }
    
    function changeStatus(uint leagueId, uint resultId, ResultStatus status) private {
        Result result = results[leagueId][resultId];
        result.status = status;

        if (status == ResultStatus.ACCEPTED) {
            leagueAggregate.addResult(result.leagueId, result.homeParticipantId,
              result.homeScore, result.awayParticipantId, result.awayScore);
        }
    }
    
    function getNewResultId(uint leagueId) private returns (uint id) {
        return results[leagueId].length;
    }

    modifier onlyOwner (string name) {
        if (msg.sender != owner) {
            throw;
        }
        _;
    }
    
    modifier onlyReferee (uint leagueId) {
        
        if (!leagueAggregate.isRefereeAddress(leagueId, msg.sender)) {
            throw;
        }
        _;
    }
    
    modifier onlyParticipant (uint leagueId, uint resultId) {
        Result result = results[leagueId][resultId];    
        
        if (!leagueAggregate.isParticipantAddress(leagueId, result.homeParticipantId, msg.sender)
                && !leagueAggregate.isParticipantAddress(leagueId, result.awayParticipantId, msg.sender)) {
            throw;
        }
        _;
    }
    
    modifier hasNotActed (uint leagueId, uint resultId) {
        
        if (results[leagueId][resultId].acted == msg.sender) {
            throw;
        }
        _;
    }
    
    modifier atStatus(uint leagueId, uint resultId, ResultStatus status) {
        if (results[leagueId][resultId].status != status) {
            throw;
        }
        _;
    }

    function killMe() {
        if (msg.sender == owner) {
            suicide(owner);
        }
    }
    
    enum ResultStatus { PENDING, DISPUTED, ACCEPTED } 
    
    struct Result {
        uint id;
        uint leagueId;
        ResultStatus status;
        uint homeParticipantId;
        uint16 homeScore;
        uint awayParticipantId;
        uint16 awayScore;
        address referee;
        address acted;
    }
}