// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Token contract that will be deployed
contract CustomToken is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}

// Factory contract to deploy new tokens
contract TokenFactory is Ownable {
    constructor(address initialOwner) Ownable(initialOwner) {
        //super();
    }

    // Event emitted when a new token is created
    event TokenCreated(address tokenAddress, string name, string symbol);
    
    // Array to store all deployed token addresses
    address[] public deployedTokens;
    
    /**
     * @dev Creates a new token with specified name and symbol
     * @param tokenName Name of the token
     * @param tokenSymbol Symbol of the token
     * @return address The address of the deployed token contract
     */
    function createToken(
        string memory tokenName,
        string memory tokenSymbol
    ) public returns (address) {
        // Deploy new token with 1 million initial supply
        CustomToken newToken = new CustomToken(
            tokenName,
            tokenSymbol,
            1000000
        );
        
        // Store the token address
        deployedTokens.push(address(newToken));
        
        // Emit event
        emit TokenCreated(address(newToken), tokenName, tokenSymbol);
        
        return address(newToken);
    }
    
    /**
     * @dev Returns the number of tokens deployed
     */
    function getDeployedTokensCount() public view returns (uint256) {
        return deployedTokens.length;
    }
}
