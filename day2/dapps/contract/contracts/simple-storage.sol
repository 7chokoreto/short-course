// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private storedValue;
    string public message; // State tambahan
    address public owner;

    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event ValueUpdated(uint256 newValue);
    event MessageUpdated(string newMessage); // Event untuk message

    // Modifier untuk access control
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnerSet(address(0), msg.sender);
    }

    // Hanya owner yang bisa set value
    function setValue(uint256 _value) public onlyOwner {
        storedValue = _value;
        emit ValueUpdated(_value);
    }

    function getValue() public view returns (uint256) {
        return storedValue;
    }

    // Fungsi tambahan untuk message
    function setMessage(string memory _message) public onlyOwner {
        message = _message;
        emit MessageUpdated(_message);
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}