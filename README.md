# Leagr
A decentralized sports / esports league management application built on top of the Ethereum blockchain.

## Current Features
* Login via MetaMask or private key phrase.
* Anyone with an Ethereum account can create a league specifying parameters such as the entry fee (in ether) and the number of particpiants.
* League creators assign referee's to the league.
* Anyone with a valid league id can join the league, as long as it is not already full (ie. the league is in progress).
* Referee's can submit results to a league that is in progress.  However, the points are not designated to the winner (or drawers) until both parties have agreed the result.  If the result is not agreed by both parties, then the result enters a dispute state.  (Dispute resolution has not yet been implemented).
* Once all results have been submitted and confirmed, the winner is calculated, and funds are allocated to said winner.
* The winner is then able to withdraw the funds to their Ethereum account.

## TODO
* Dispute resolution quorum
* Referee approval quorum (In Progress)
* Better bank features (eg. History of winnings)

## To run

- Start a local ethereum client (geth / parity etc)

- Download dependencies
```
npm install
```

- Compile contracts
```
truffle compile
```

- Deploy contracts to the blockchain
```
truffle migrate
```

- Build the frontend and serve
```
gulp serve
```

## To test
### Javascript
Javascript unit tests are written in jasmine and can be executed by running
```
gulp test
```

### Solidity
The solidity smart contract tests can be executed by running
```
truffle test
```

Note, that testrpc must be running in order for these tests to run.
