pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * A contract representing a referee vote within a league.
 */
contract RefereeVote is Ownable {

    struct VoteResult {
        //So we can differentiate between a referee that has been added and an empty VoteResult
        bool added;
        uint8 approvalCount;
        uint8 disapprovalCount;
        address[] voters;
    }

    address[] private refereeCandidates;
    address[] public acceptedReferees;
    VoteStatus public status = VoteStatus.PRE_VOTE;
    mapping(address => VoteResult) private refereeVoteResults;
    mapping(address => VoterParticipationStatus) private voters;
    uint private voterCount;
    uint8 private durationInDays;
    uint8 private acceptancePercentage;
    uint8 private maxVoters;
    uint private endTime;

    enum VoteStatus { PRE_VOTE, IN_PROGRESS, COMPLETED }
    enum Vote { APPROVE, DISAPPROVE }
    enum VoterParticipationStatus { NOT_REGISTERED, REGISTERED }

    function RefereeVote(uint8 _durationInDays, uint8 _acceptancePercentage, uint8 _maxVoters) {
        durationInDays = _durationInDays;
        acceptancePercentage = _acceptancePercentage;
        maxVoters = _maxVoters;
    }

    function addCandidate(address candidateAddress) external onlyOwner onlyAtStatus(VoteStatus.PRE_VOTE) {
        require(!isCandidate(candidateAddress));
        refereeCandidates.push(candidateAddress);
        refereeVoteResults[candidateAddress] = VoteResult(true, 0, 0, new address[](maxVoters));

        CandidateAdded(candidateAddress);
    }

    function startVote() onlyOwner onlyAtStatus(VoteStatus.PRE_VOTE) {
        status = VoteStatus.IN_PROGRESS;
        endTime = block.timestamp + (durationInDays * 24 * 60 * 60);
    }

    function addVoter(address voterAddress) external onlyOwner onlyAtStatus(VoteStatus.PRE_VOTE) {
        require(voterCount < maxVoters);
        voters[voterAddress] = VoterParticipationStatus.REGISTERED;
        voterCount++;
    }

    function vote(address refereeAddress, Vote vote) onlyRegistered onlyAtStatus(VoteStatus.IN_PROGRESS) {
        require(isCandidate(refereeAddress));
        checkSenderHasntAlreadyVoted(refereeAddress);

        if (!completeVoteIfDurationExceeded()) {
            if (vote == Vote.APPROVE) {
                refereeVoteResults[refereeAddress].approvalCount++;
            } else {
                refereeVoteResults[refereeAddress].disapprovalCount++;
            }

            refereeVoteResults[refereeAddress].voters.push(msg.sender);
        }
    }

    function completeVoteIfDurationExceeded() public returns (bool) {
        if (block.timestamp >= endTime) {
            completeVote();
            return true;
        }

        return false;
    }

    function isCandidate(address refereeAddress) private returns (bool) {
        return refereeVoteResults[refereeAddress].added;
    }

    function completeVote() private {
        status = VoteStatus.COMPLETED;
        
        setAcceptedReferees();
    }

    function setAcceptedReferees() private {
        uint acceptanceThreshold = (voterCount * acceptancePercentage) / 100;

        for (uint i = 0; i < refereeCandidates.length; i++) {
            VoteResult memory result = refereeVoteResults[refereeCandidates[i]];

            if (result.approvalCount >= acceptanceThreshold) {
                acceptedReferees.push(refereeCandidates[i]);
            }
        }
    }

    function checkSenderHasntAlreadyVoted(address refereeAddress) private {
        for (uint i = 0; i < refereeVoteResults[refereeAddress].voters.length; i++) {
            if (refereeVoteResults[refereeAddress].voters[i] == msg.sender) {
                revert();
            }
        }
    }

    modifier onlyAtStatus(VoteStatus requiredStatus) {
        require(status == requiredStatus);
        _;
    }

    //This will also fail if the address is not registered to vote as their map value will be NOT_REGISTERED
    modifier onlyRegistered() {
        require(voters[msg.sender] == VoterParticipationStatus.REGISTERED);
        _;
    }

    event CandidateAdded(address candidateAddress);
}