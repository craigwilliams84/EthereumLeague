pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Fundable.sol';

/**
 * A bank contract for the Leagr application that receives all the funds collected from via
 * particpants joining a league within the League Contract.
 *
 * Funds can be unlocked for withdrawal for a particular address by calling the addAvailableFunds
 * function.  (This can only be triggered from the League Contract, usually when a league has completed).
 */
contract Bank is Ownable, Fundable {
  address leagueContractAddress;
  mapping (address => uint) availableFunds;

  function() payable {
  }

  function addAvailableFunds(address toAddress, uint amount) external onlyLeagueContract {
    availableFunds[toAddress] = availableFunds[toAddress] + amount;
  }

  function withdrawFunds() external hasFunds{
    uint amount = availableFunds[msg.sender];

    availableFunds[msg.sender] = 0;
    msg.sender.transfer(amount);

    FundsWithdrawn(msg.sender, amount);
  }

  function getAvailableFunds() external constant returns (uint) {
    return availableFunds[msg.sender];
  }

  function setLeagueContractAddress(address theAddress) external onlyOwner {
    leagueContractAddress = theAddress;
  }

  modifier onlyLeagueContract() {
    require(leagueContractAddress == msg.sender);
    _;
  }

  modifier hasFunds() {
    assert(availableFunds[msg.sender] > 0);
    _;
  }

  event FundsWithdrawn(address indexed accountAddress, uint amount);
}