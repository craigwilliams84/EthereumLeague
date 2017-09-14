pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * The contract for managing referees (registering and updating trust ratings)
 *
 */
contract RefereeAggregate is Ownable {

    struct RefereeUser {
        address refereeAddress;
        bytes32 name;
        bytes32 location;
        uint trustRating;
    }

    mapping(address => RefereeUser) private referees;

    function register(bytes32 name, bytes32 location) external {
        //Check referee at this address doesn't already exist
        assert(referees[msg.sender].refereeAddress == 0);

        referees[msg.sender] = RefereeUser(msg.sender, name, location, 0);

        RefereeRegistered(msg.sender, name, location);
    }

    function getRefereeDetails(address refereeAddress) constant returns(bytes32 name, bytes32 location, uint trustRating) {
        assert(referees[refereeAddress].refereeAddress != 0);

        return (referees[refereeAddress].name, referees[refereeAddress].location, referees[refereeAddress].trustRating);
    }

    function isRegisteredReferee(address refereeAddress) constant returns (bool) {
        return referees[refereeAddress].refereeAddress != 0;
    }

    event RefereeRegistered(address indexed refereeAddress, bytes32 name, bytes32 location);
}