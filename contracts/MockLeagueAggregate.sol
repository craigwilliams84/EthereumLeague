pragma solidity ^0.4.2;
import "LeagueAggregateI.sol";

contract MockLeagueAggregate is LeagueAggregateI {

    address owner;
    bool private isLeagueParticipantAddressValue;
    bool private isRefereeValue;
    

    function MockLeagueAggregate(bool isParticipantAddress, bool isReferee) {
        owner = msg.sender;
        isLeagueParticipantAddressValue = isParticipantAddress;
        isRefereeValue = isReferee;
    }
    
    function isParticipantAddress(uint leagueId, uint participantId, address potentialParticipantAddress) constant returns (bool) {
        return isLeagueParticipantAddressValue;
    }
    
    function isRefereeAddress(uint leagueId, address potentialRefereeAddress) constant returns (bool) {
        return isRefereeValue;
    }
    
    function addResult(uint leagueId, uint homeParticipantId, 
        uint16 homeParticipantScore, uint awayParticipantId, uint16 awayParticipantScore) {
        
    }

    function killMe() {
        if (msg.sender == owner) {
            suicide(owner);
        }
    }
}