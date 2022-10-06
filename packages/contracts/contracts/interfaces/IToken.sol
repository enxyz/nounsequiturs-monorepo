// SPDX-License-Identifier: GPL-3.0

/// @title Interface for Token
/// Based on NounsDAO

// @krel img here

pragma solidity ^0.8.6;

import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';

interface IToken is IERC721 {
    event TokenCreated(uint256 indexed tokenId);

    event TokenBurned(uint256 indexed tokenId);

    event MinterUpdated(address minter);

    event MinterLocked();

    function mint() external returns (uint256);

    function burn(uint256 tokenId) external;

    function setMinter(address minter) external;

    function lockMinter() external;
}
