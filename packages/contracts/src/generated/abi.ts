// 由 scripts/export-abi.ts 从 Hardhat 编译产物生成，不要手改。改了合约之后运行 `pnpm --filter @motif/contracts abi`。

export const motifTokenAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner_",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AllocationLengthMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CheckpointUnorderedInsertion",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ECDSAInvalidSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "ECDSAInvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "ECDSAInvalidSignatureS",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "increasedSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "cap",
        "type": "uint256"
      }
    ],
    "name": "ERC20ExceededSafeSupply",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "ERC2612ExpiredSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "signer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC2612InvalidSigner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "timepoint",
        "type": "uint256"
      },
      {
        "internalType": "uint48",
        "name": "clock",
        "type": "uint48"
      }
    ],
    "name": "ERC5805FutureLookup",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ERC6372InconsistentClock",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "currentNonce",
        "type": "uint256"
      }
    ],
    "name": "InvalidAccountNonce",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidShortString",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "requested",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "available",
        "type": "uint256"
      }
    ],
    "name": "MaxSupplyExceeded",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "bits",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "SafeCastOverflowedUintDowncast",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "str",
        "type": "string"
      }
    ],
    "name": "StringTooLong",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      }
    ],
    "name": "VotesExpiredSignature",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "fromDelegate",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "toDelegate",
        "type": "address"
      }
    ],
    "name": "DelegateChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "previousVotes",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newVotes",
        "type": "uint256"
      }
    ],
    "name": "DelegateVotesChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "EIP712DomainChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CLOCK_MODE",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SUPPLY",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint32",
        "name": "pos",
        "type": "uint32"
      }
    ],
    "name": "checkpoints",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint48",
            "name": "_key",
            "type": "uint48"
          },
          {
            "internalType": "uint208",
            "name": "_value",
            "type": "uint208"
          }
        ],
        "internalType": "struct Checkpoints.Checkpoint208",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "clock",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "delegatee",
        "type": "address"
      }
    ],
    "name": "delegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "delegatee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "delegateBySig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "delegates",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eip712Domain",
    "outputs": [
      {
        "internalType": "bytes1",
        "name": "fields",
        "type": "bytes1"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "chainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "verifyingContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "uint256[]",
        "name": "extensions",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "timepoint",
        "type": "uint256"
      }
    ],
    "name": "getPastTotalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timepoint",
        "type": "uint256"
      }
    ],
    "name": "getPastVotes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getVotes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "numCheckpoints",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const motifGovernorAbi = [
  {
    "inputs": [
      {
        "internalType": "contract IVotes",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "contract TimelockController",
        "name": "timelock",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint48",
            "name": "votingDelay",
            "type": "uint48"
          },
          {
            "internalType": "uint32",
            "name": "votingPeriod",
            "type": "uint32"
          },
          {
            "internalType": "uint256",
            "name": "proposalThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "quorumPercent",
            "type": "uint256"
          },
          {
            "internalType": "uint48",
            "name": "lateQuorumExtension",
            "type": "uint48"
          }
        ],
        "internalType": "struct MotifGovernor.Config",
        "name": "config",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "CheckpointUnorderedInsertion",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedCall",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "GovernorAlreadyCastVote",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "GovernorAlreadyQueuedProposal",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "GovernorDisabledDeposit",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "votes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "threshold",
        "type": "uint256"
      }
    ],
    "name": "GovernorInsufficientProposerVotes",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "targets",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "calldatas",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "values",
        "type": "uint256"
      }
    ],
    "name": "GovernorInvalidProposalLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "quorumNumerator",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "quorumDenominator",
        "type": "uint256"
      }
    ],
    "name": "GovernorInvalidQuorumFraction",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "GovernorInvalidSignature",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "GovernorInvalidVoteParams",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "GovernorInvalidVoteType",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "votingPeriod",
        "type": "uint256"
      }
    ],
    "name": "GovernorInvalidVotingPeriod",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "GovernorNonexistentProposal",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "GovernorNotQueuedProposal",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "GovernorOnlyExecutor",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "GovernorQueueNotImplemented",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      }
    ],
    "name": "GovernorRestrictedProposer",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "GovernorUnableToCancel",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "enum IGovernor.ProposalState",
        "name": "current",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "expectedStates",
        "type": "bytes32"
      }
    ],
    "name": "GovernorUnexpectedProposalState",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "currentNonce",
        "type": "uint256"
      }
    ],
    "name": "InvalidAccountNonce",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidShortString",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "bits",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "SafeCastOverflowedUintDowncast",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "str",
        "type": "string"
      }
    ],
    "name": "StringTooLong",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "EIP712DomainChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "oldVoteExtension",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "newVoteExtension",
        "type": "uint64"
      }
    ],
    "name": "LateQuorumVoteExtensionSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "string[]",
        "name": "signatures",
        "type": "string[]"
      },
      {
        "indexed": false,
        "internalType": "bytes[]",
        "name": "calldatas",
        "type": "bytes[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "voteStart",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "voteEnd",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "extendedDeadline",
        "type": "uint64"
      }
    ],
    "name": "ProposalExtended",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "etaSeconds",
        "type": "uint256"
      }
    ],
    "name": "ProposalQueued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldProposalThreshold",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newProposalThreshold",
        "type": "uint256"
      }
    ],
    "name": "ProposalThresholdSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldQuorumNumerator",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newQuorumNumerator",
        "type": "uint256"
      }
    ],
    "name": "QuorumNumeratorUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "oldTimelock",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newTimelock",
        "type": "address"
      }
    ],
    "name": "TimelockChange",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "support",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "weight",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "support",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "weight",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      }
    ],
    "name": "VoteCastWithParams",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldVotingDelay",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newVotingDelay",
        "type": "uint256"
      }
    ],
    "name": "VotingDelaySet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldVotingPeriod",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newVotingPeriod",
        "type": "uint256"
      }
    ],
    "name": "VotingPeriodSet",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BALLOT_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "CLOCK_MODE",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "COUNTING_MODE",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "EXTENDED_BALLOT_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes[]",
        "name": "calldatas",
        "type": "bytes[]"
      },
      {
        "internalType": "bytes32",
        "name": "descriptionHash",
        "type": "bytes32"
      }
    ],
    "name": "cancel",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "support",
        "type": "uint8"
      }
    ],
    "name": "castVote",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "support",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "castVoteBySig",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "support",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "castVoteWithReason",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "support",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      },
      {
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      }
    ],
    "name": "castVoteWithReasonAndParams",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "support",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      },
      {
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "castVoteWithReasonAndParamsBySig",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "clock",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eip712Domain",
    "outputs": [
      {
        "internalType": "bytes1",
        "name": "fields",
        "type": "bytes1"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "chainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "verifyingContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "uint256[]",
        "name": "extensions",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes[]",
        "name": "calldatas",
        "type": "bytes[]"
      },
      {
        "internalType": "bytes32",
        "name": "descriptionHash",
        "type": "bytes32"
      }
    ],
    "name": "execute",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes[]",
        "name": "calldatas",
        "type": "bytes[]"
      },
      {
        "internalType": "bytes32",
        "name": "descriptionHash",
        "type": "bytes32"
      }
    ],
    "name": "getProposalId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timepoint",
        "type": "uint256"
      }
    ],
    "name": "getVotes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timepoint",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      }
    ],
    "name": "getVotesWithParams",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes[]",
        "name": "calldatas",
        "type": "bytes[]"
      },
      {
        "internalType": "bytes32",
        "name": "descriptionHash",
        "type": "bytes32"
      }
    ],
    "name": "hashProposal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lateQuorumVoteExtension",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155BatchReceived",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC721Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "proposalDeadline",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "proposalEta",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "proposalNeedsQueuing",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "proposalProposer",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "proposalSnapshot",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalThreshold",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "proposalVotes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "againstVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "forVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "abstainVotes",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes[]",
        "name": "calldatas",
        "type": "bytes[]"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "propose",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes[]",
        "name": "calldatas",
        "type": "bytes[]"
      },
      {
        "internalType": "bytes32",
        "name": "descriptionHash",
        "type": "bytes32"
      }
    ],
    "name": "queue",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "timepoint",
        "type": "uint256"
      }
    ],
    "name": "quorum",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "quorumDenominator",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "timepoint",
        "type": "uint256"
      }
    ],
    "name": "quorumNumerator",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "quorumNumerator",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "relay",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "newVoteExtension",
        "type": "uint48"
      }
    ],
    "name": "setLateQuorumVoteExtension",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newProposalThreshold",
        "type": "uint256"
      }
    ],
    "name": "setProposalThreshold",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "newVotingDelay",
        "type": "uint48"
      }
    ],
    "name": "setVotingDelay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "newVotingPeriod",
        "type": "uint32"
      }
    ],
    "name": "setVotingPeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "state",
    "outputs": [
      {
        "internalType": "enum IGovernor.ProposalState",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "timelock",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [
      {
        "internalType": "contract IERC5805",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newQuorumNumerator",
        "type": "uint256"
      }
    ],
    "name": "updateQuorumNumerator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract TimelockController",
        "name": "newTimelock",
        "type": "address"
      }
    ],
    "name": "updateTimelock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "version",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingDelay",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingPeriod",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const

export const motifTimelockAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "minDelay",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "proposers",
        "type": "address[]"
      },
      {
        "internalType": "address[]",
        "name": "executors",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedCall",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "delay",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minDelay",
        "type": "uint256"
      }
    ],
    "name": "TimelockInsufficientDelay",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "targets",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "payloads",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "values",
        "type": "uint256"
      }
    ],
    "name": "TimelockInvalidOperationLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "TimelockUnauthorizedCaller",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "predecessorId",
        "type": "bytes32"
      }
    ],
    "name": "TimelockUnexecutedPredecessor",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "operationId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "expectedStates",
        "type": "bytes32"
      }
    ],
    "name": "TimelockUnexpectedOperationState",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "CallExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "CallSalt",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "predecessor",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "delay",
        "type": "uint256"
      }
    ],
    "name": "CallScheduled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "Cancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldDuration",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newDuration",
        "type": "uint256"
      }
    ],
    "name": "MinDelayChange",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CANCELLER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "EXECUTOR_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PROPOSER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "cancel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "payload",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "predecessor",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes[]",
        "name": "payloads",
        "type": "bytes[]"
      },
      {
        "internalType": "bytes32",
        "name": "predecessor",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "executeBatch",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMinDelay",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "getOperationState",
    "outputs": [
      {
        "internalType": "enum TimelockController.OperationState",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "getTimestamp",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "predecessor",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "hashOperation",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes[]",
        "name": "payloads",
        "type": "bytes[]"
      },
      {
        "internalType": "bytes32",
        "name": "predecessor",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "hashOperationBatch",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "isOperation",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "isOperationDone",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "isOperationPending",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "isOperationReady",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155BatchReceived",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC721Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "predecessor",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "delay",
        "type": "uint256"
      }
    ],
    "name": "schedule",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes[]",
        "name": "payloads",
        "type": "bytes[]"
      },
      {
        "internalType": "bytes32",
        "name": "predecessor",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "delay",
        "type": "uint256"
      }
    ],
    "name": "scheduleBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newDelay",
        "type": "uint256"
      }
    ],
    "name": "updateDelay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const

export const motifIdentityAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "moderator",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "AlreadyRegistered",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "handle",
        "type": "string"
      }
    ],
    "name": "HandleIsBlocked",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "handle",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "HandleTaken",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "handle",
        "type": "string"
      }
    ],
    "name": "InvalidHandle",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "NotRegistered",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "NothingToModerate",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "SafeCastOverflowedUintToInt",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "handle",
        "type": "string"
      }
    ],
    "name": "HandleChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "handle",
        "type": "string"
      }
    ],
    "name": "HandleUnblocked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "metadataHash",
        "type": "bytes32"
      }
    ],
    "name": "MetadataUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "handle",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "reasonHash",
        "type": "bytes32"
      }
    ],
    "name": "ProfileModerated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "handle",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "metadataHash",
        "type": "bytes32"
      }
    ],
    "name": "ProfileRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "delta",
        "type": "int256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "total",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "reason",
        "type": "bytes32"
      }
    ],
    "name": "ReputationChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "HANDLE_MAX_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "HANDLE_MIN_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ISSUER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MODERATOR_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "reason",
        "type": "bytes32"
      }
    ],
    "name": "award",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "handle",
        "type": "string"
      }
    ],
    "name": "changeHandle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "handleKey",
        "type": "bytes32"
      }
    ],
    "name": "handleBlocked",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "handleKey",
        "type": "bytes32"
      }
    ],
    "name": "handleOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "reasonHash",
        "type": "bytes32"
      }
    ],
    "name": "moderateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "reason",
        "type": "bytes32"
      }
    ],
    "name": "penalize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "profileOf",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "handle",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "metadataHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint64",
            "name": "registeredAt",
            "type": "uint64"
          }
        ],
        "internalType": "struct MotifIdentity.Profile",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "handle",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "metadataHash",
        "type": "bytes32"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "reputationOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "handle",
        "type": "string"
      }
    ],
    "name": "unblockHandle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "metadataHash",
        "type": "bytes32"
      }
    ],
    "name": "updateMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const motifRegistryAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "moderator",
        "type": "address"
      },
      {
        "internalType": "bytes32[]",
        "name": "licenses",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "ContentAlreadyRegistered",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "parentId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "parentVersion",
        "type": "uint32"
      }
    ],
    "name": "InvalidParent",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "slug",
        "type": "string"
      }
    ],
    "name": "InvalidSlug",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "enum MotifRegistry.Status",
        "name": "from",
        "type": "uint8"
      },
      {
        "internalType": "enum MotifRegistry.Status",
        "name": "to",
        "type": "uint8"
      }
    ],
    "name": "InvalidStatusTransition",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidUpstream",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "ItemIsDelisted",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "license",
        "type": "bytes32"
      }
    ],
    "name": "LicenseNotAllowed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "NoApprovedVersion",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "NotMaintainer",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "NotPendingMaintainer",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "slug",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "SlugTaken",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "UnknownItem",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "UnknownVersion",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "VersionPending",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroContentHash",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "slug",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "maintainer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "parentId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "parentVersion",
        "type": "uint32"
      }
    ],
    "name": "ItemCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "delisted",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "reasonHash",
        "type": "bytes32"
      }
    ],
    "name": "ItemDelisted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "license",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "allowed",
        "type": "bool"
      }
    ],
    "name": "LicenseAllowedSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "MaintainerTransferStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "MaintainerTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "slug",
        "type": "string"
      }
    ],
    "name": "SlugReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "enum MotifRegistry.Status",
        "name": "status",
        "type": "uint8"
      }
    ],
    "name": "VersionStatusChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "license",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "upstreamRepo",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes20",
        "name": "upstreamCommit",
        "type": "bytes20"
      }
    ],
    "name": "VersionSubmitted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CURATION_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MODERATOR_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SLUG_MAX_LENGTH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "acceptMaintainer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "license",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "upstreamRepo",
            "type": "string"
          },
          {
            "internalType": "bytes20",
            "name": "upstreamCommit",
            "type": "bytes20"
          }
        ],
        "internalType": "struct MotifRegistry.VersionInput",
        "name": "input",
        "type": "tuple"
      }
    ],
    "name": "addVersion",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "slug",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "parentId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "parentVersion",
        "type": "uint32"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "license",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "upstreamRepo",
            "type": "string"
          },
          {
            "internalType": "bytes20",
            "name": "upstreamCommit",
            "type": "bytes20"
          }
        ],
        "internalType": "struct MotifRegistry.VersionInput",
        "name": "input",
        "type": "tuple"
      }
    ],
    "name": "createItem",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "getItem",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "maintainer",
            "type": "address"
          },
          {
            "internalType": "uint32",
            "name": "versionCount",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "currentVersion",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "parentVersion",
            "type": "uint32"
          },
          {
            "internalType": "uint256",
            "name": "parentId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "pendingMaintainer",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "delisted",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "slug",
            "type": "string"
          }
        ],
        "internalType": "struct MotifRegistry.Item",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "getVersion",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "license",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "submittedAt",
            "type": "uint64"
          },
          {
            "internalType": "enum MotifRegistry.Status",
            "name": "status",
            "type": "uint8"
          }
        ],
        "internalType": "struct MotifRegistry.Version",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "name": "isListed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "itemCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      }
    ],
    "name": "itemIdOfContent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "slug",
        "type": "string"
      }
    ],
    "name": "itemIdOfSlug",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "license",
        "type": "bytes32"
      }
    ],
    "name": "licenseAllowed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "delisted",
        "type": "bool"
      },
      {
        "internalType": "bytes32",
        "name": "reasonHash",
        "type": "bytes32"
      }
    ],
    "name": "setDelisted",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "license",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "allowed",
        "type": "bool"
      }
    ],
    "name": "setLicenseAllowed",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "internalType": "enum MotifRegistry.Status",
        "name": "status",
        "type": "uint8"
      }
    ],
    "name": "setVersionStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "transferMaintainer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const motifCurationAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "token_",
        "type": "address"
      },
      {
        "internalType": "contract MotifRegistry",
        "name": "registry_",
        "type": "address"
      },
      {
        "internalType": "contract MotifIdentity",
        "name": "identity_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "treasury_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "moderator",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "curators",
        "type": "address[]"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "bond",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "quorum",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "reviewPeriod",
            "type": "uint32"
          },
          {
            "internalType": "uint256",
            "name": "publishReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "remixReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "publishReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "remixReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "curatorReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "violationPenalty",
            "type": "uint256"
          }
        ],
        "internalType": "struct MotifCuration.Params",
        "name": "params_",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "internalType": "address",
        "name": "curator",
        "type": "address"
      }
    ],
    "name": "AlreadyVoted",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "internalType": "address",
        "name": "curator",
        "type": "address"
      }
    ],
    "name": "ConflictOfInterest",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "requested",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "available",
        "type": "uint256"
      }
    ],
    "name": "InsufficientRewardPool",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "enum MotifCuration.Outcome",
        "name": "outcome",
        "type": "uint8"
      }
    ],
    "name": "InvalidOutcome",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidParams",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "NotSubmitter",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "ReviewHasVotes",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "ReviewNotOpen",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "ReviewPeriodNotOver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "ReviewPeriodOver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddress",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "bond",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "quorum",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "reviewPeriod",
            "type": "uint32"
          },
          {
            "internalType": "uint256",
            "name": "publishReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "remixReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "publishReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "remixReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "curatorReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "violationPenalty",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct MotifCuration.Params",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "ParamsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "enum MotifCuration.Outcome",
        "name": "outcome",
        "type": "uint8"
      }
    ],
    "name": "ReviewClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "submitter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bond",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "deadline",
        "type": "uint64"
      }
    ],
    "name": "ReviewOpened",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "paid",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "owed",
        "type": "uint256"
      }
    ],
    "name": "RewardPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RewardsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "treasury",
        "type": "address"
      }
    ],
    "name": "TreasuryUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "curator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum MotifCuration.Verdict",
        "name": "verdict",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "noteHash",
        "type": "bytes32"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CURATOR_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_REVIEW_PERIOD",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_REVIEW_PERIOD",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MODERATOR_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REASON_CURATE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REASON_PUBLISH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REASON_REMIX",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REASON_VIOLATION",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "expire",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getParams",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "bond",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "quorum",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "reviewPeriod",
            "type": "uint32"
          },
          {
            "internalType": "uint256",
            "name": "publishReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "remixReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "publishReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "remixReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "curatorReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "violationPenalty",
            "type": "uint256"
          }
        ],
        "internalType": "struct MotifCuration.Params",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "getReview",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "submitter",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "deadline",
            "type": "uint64"
          },
          {
            "internalType": "uint8",
            "name": "quorum",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "approvals",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "rejections",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "violations",
            "type": "uint8"
          },
          {
            "internalType": "enum MotifCuration.Outcome",
            "name": "outcome",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "bond",
            "type": "uint256"
          }
        ],
        "internalType": "struct MotifCuration.Review",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "internalType": "address",
        "name": "curator",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "identity",
    "outputs": [
      {
        "internalType": "contract MotifIdentity",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "registry",
    "outputs": [
      {
        "internalType": "contract MotifRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "internalType": "enum MotifCuration.Outcome",
        "name": "outcome",
        "type": "uint8"
      }
    ],
    "name": "resolve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardPool",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "bond",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "quorum",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "reviewPeriod",
            "type": "uint32"
          },
          {
            "internalType": "uint256",
            "name": "publishReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "remixReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "publishReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "remixReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "curatorReputation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "violationPenalty",
            "type": "uint256"
          }
        ],
        "internalType": "struct MotifCuration.Params",
        "name": "params_",
        "type": "tuple"
      }
    ],
    "name": "setParams",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "treasury_",
        "type": "address"
      }
    ],
    "name": "setTreasury",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "slug",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "parentId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "parentVersion",
        "type": "uint32"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "license",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "upstreamRepo",
            "type": "string"
          },
          {
            "internalType": "bytes20",
            "name": "upstreamCommit",
            "type": "bytes20"
          }
        ],
        "internalType": "struct MotifRegistry.VersionInput",
        "name": "input",
        "type": "tuple"
      }
    ],
    "name": "submit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "license",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "upstreamRepo",
            "type": "string"
          },
          {
            "internalType": "bytes20",
            "name": "upstreamCommit",
            "type": "bytes20"
          }
        ],
        "internalType": "struct MotifRegistry.VersionInput",
        "name": "input",
        "type": "tuple"
      }
    ],
    "name": "submitVersion",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBonded",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "treasury",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      },
      {
        "internalType": "enum MotifCuration.Verdict",
        "name": "verdict",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "noteHash",
        "type": "bytes32"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "version",
        "type": "uint32"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const
