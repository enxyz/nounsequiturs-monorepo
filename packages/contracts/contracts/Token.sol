// SPDX-License-Identifier: GPL-3.0

/// @title Interface for Generic Token

pragma solidity ^0.8.6;

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { IToken } from './interfaces/IToken.sol';
// `_safeMint` and `_mint` contain an additional `creator` argument and
// emit two `Transfer` logs, rather than one
import { ERC721 } from './base/ERC721.sol';
import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { IProxyRegistry } from './external/opensea/IProxyRegistry.sol';

// TODO: @enx ERC721Checkpointable ?
contract Token is IToken, Ownable, ERC721 {
    // Admin address
    address public admin;

    // An address who has permissions to mint
    address public minter;

    // Whether the minter can be updated
    bool public isMinterLocked;

    // The internal ID tracker
    uint256 private _currentId;

    // IPFS content hash of contract-level metadata
    string private _contractURIHash = 'QID';

    // OpenSea's Proxy Registry
    IProxyRegistry public proxyRegistry;

    /**
     * @notice Require that the minter has not been locked.
     */
    modifier whenMinterNotLocked() {
        require(!isMinterLocked, 'Minter is locked');
        _;
    }

    /**
     * @notice Require that the sender is the minter.
     */
    modifier onlyMinter() {
        require(msg.sender == minter, 'Sender is not the minter');
        _;
    }

    /**
     * @notice Construct a new Token contract.
     * @param _proxyRegistry The address of the OpenSea proxy registry.
     */
    constructor(
        address _admin,
        address _minter,
        IProxyRegistry _proxyRegistry
    ) ERC721('Token Name', 'TOKEN') {
        admin = _admin;
        minter = _minter;
        proxyRegistry = _proxyRegistry;
    }

    /**
     * @notice The IPFS URI of contract-level metadata.
     */
    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked('ipfs://', _contractURIHash));
    }

    /**
     * @notice Set the _contractURIHash.
     * @dev Only callable by the owner.
     */
    function setContractURIHash(string memory newContractURIHash) external onlyOwner {
        _contractURIHash = newContractURIHash;
    }

    /**
     * @notice Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator) public view override(IERC721, ERC721) returns (bool) {
        // Whitelist OpenSea proxy contract for easy trading.
        if (proxyRegistry.proxies(owner) == operator) {
            return true;
        }
        return super.isApprovedForAll(owner, operator);
    }

    /**
     * @dev Call _mintTo with the to address(es).
     */
    function mint() public override onlyMinter returns (uint256) {
        return _mintTo(minter, _currentId++);
    }

    /**
     * @notice Burn a Token.
     */
    function burn(uint256 tokenId) public override onlyMinter {
        _burn(tokenId);
        emit TokenBurned(tokenId);
    }

    /**
     * @notice Set the token minter.
     * @dev Only callable by the owner when not locked.
     */
    function setMinter(address _minter) external override onlyOwner whenMinterNotLocked {
        minter = _minter;

        emit MinterUpdated(_minter);
    }

    /**
     * @notice Lock the minter.
     * @dev This cannot be reversed and is only callable by the owner when not locked.
     */
    function lockMinter() external override onlyOwner whenMinterNotLocked {
        isMinterLocked = true;

        emit MinterLocked();
    }

    /**
     * @notice Mint a Token with `tokenId` to the provided `to` address.
     */
    function _mintTo(address to, uint256 tokenId) internal returns (uint256) {
        _mint(owner(), to, tokenId);

        emit TokenCreated(tokenId);

        return tokenId;
    }
}
