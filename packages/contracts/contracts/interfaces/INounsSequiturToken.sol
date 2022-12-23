// SPDX-License-Identifier: GPL-3.0

/// @title Interface for NounsSequiturToken
/// Based on NounsDAO

// @krel img here

pragma solidity ^0.8.17;

import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';

interface INounsSequiturToken is IERC721 {
    event NounsSequiturCreated(uint256 indexed tokenId);

    event NounsSequiturBurned(uint256 indexed tokenId);

    event NounsSequiturFoundersDAOUpdated(address noundersDAO);

    event MinterUpdated(address minter);

    event MinterLocked();

    function mint() external returns (uint256);

    function burn(uint256 tokenId) external;

    function setNounSequiturFoundersDAO(address noundersDAO) external;

    function setMinter(address minter) external;

    function lockMinter() external;
}
