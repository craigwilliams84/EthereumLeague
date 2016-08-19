contract LeagueAggregateI {
    function isReferee(
        uint leagueId, address potentialRefereeAddress) constant returns (bool) {}
    
    function isParticipant(
        uint leagueId, uint participantId, address) constant returns (bool) {}

    function addResult(uint leagueId, uint homeParticipantId, 
        uint homeParticipantScore, uint awayParticipantId, uint awayParticipantScore) {}
}