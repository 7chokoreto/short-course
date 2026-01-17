export const SIMPLE_STORAGE_ABI = [
  {
    "type": "function",
    "name": "getValue",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "ValueUpdated",
    "inputs": [
      {
        "name": "newValue",
        "type": "uint256",
        "indexed": false
      }
    ]
  }
] as const;