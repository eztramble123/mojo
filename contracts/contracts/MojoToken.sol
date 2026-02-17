// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MojoToken is ERC20, Ownable {
    mapping(address => bool) public authorizedMinters;

    constructor() ERC20("MojoToken", "MOJO") Ownable(msg.sender) {}

    modifier onlyMinter() {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _;
    }

    function setMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
