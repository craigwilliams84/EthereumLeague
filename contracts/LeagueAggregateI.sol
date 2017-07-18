pragma solidity ^0.4.11;
contract LeagueAggregateI {
    function isRefereeAddress(
        uint leagueId, address potentialRefereeAddress) constant returns (bool);
    
    function isParticipantAddress(
        uint leagueId, uint participantId, address potentialParticipantAddress) constant returns (bool);

    function addResult(uint leagueId, uint homeParticipantId, 
        uint16 homeParticipantScore, uint awayParticipantId, uint16 awayParticipantScore);
}