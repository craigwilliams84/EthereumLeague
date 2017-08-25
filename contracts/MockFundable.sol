pragma solidity ^0.4.11;

import './Fundable.sol';

contract MockFundable is Fundable {
  address toAddressArgument;
  uint amountArgument;
  uint numberOfCalls = 0;

  function() payable {
  }

  function addAvailableFunds(address toAddress, uint amount) external {
    toAddressArgument = toAddress;
    amountArgument = amount;
    numberOfCalls = numberOfCalls + 1;
  }

  function getAddAvailableFundsCalledArguments() constant returns (address, uint, uint) {
    return (toAddressArgument, amountArgument, numberOfCalls);
  }
}