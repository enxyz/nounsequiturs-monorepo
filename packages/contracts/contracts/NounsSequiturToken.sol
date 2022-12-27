// SPDX-License-Identifier: GPL-3.0

/// @title Interface for NounsSequiturToken
/// Based on NounsDAO

// @krel img here

pragma solidity ^0.8.17;

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { ERC721Enumerable } from './base/ERC721Enumerable.sol';
import { INounsSequiturToken } from './interfaces/INounsSequiturToken.sol';
// `_safeMint` and `_mint` contain an additional `creator` argument and
// emit two `Transfer` logs, rather than one
import { ERC721 } from './base/ERC721.sol';
import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { IProxyRegistry } from './external/opensea/IProxyRegistry.sol';

contract NounsSequiturToken is INounsSequiturToken, Ownable, ERC721Enumerable {
    // The Sounders DAO address (creators org)
    address public soundersDAO;

    // An address who has permissions to mint Nouns Sequitur Tokens
    address public minter;

    // Whether the minter can be updated
    bool public isMinterLocked;

    /**
     * The internal noun sequitur ID tracker
     *
     * @dev Start with #0 as 1st, end with #400 as 401st.
     *
     * */

    uint256 private _currentNounsSequiturId;

    // IPFS content hash of contract-level metadata
    string private _contractURIHash = 'QmZi1n79FqWt2tTLwCqiy6nLM6xLGRsEPQ5JmReJQKNNzX'; // TODO: @enx

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
     * @notice Require that the sender is the Noun Sequitur Founders DAO.
     */
    modifier onlySoundersDAO() {
        require(msg.sender == soundersDAO, 'Sender is not the Nouns Sequitur Founders DAO');
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
     * @notice Construct a new NounsSequiturToken contract.
     * @param _proxyRegistry The address of the OpenSea proxy registry.
     */
    constructor(
        address _soundersDAO,
        address _minter,
        IProxyRegistry _proxyRegistry
    ) ERC721('Nouns Sequitur', 'NOUNSSEQUITUR') {
        soundersDAO = _soundersDAO;
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

    // TODO: @enx: update quantity and logic of total supply
    /**
     * @notice Mint a Nouns Sequitur to the minter, along with a possible noun sequitur founders
     * reward Nouns Sequitur. Nouns Sequitur Founders reward Nouns Sequitur are minted every 10 Nouns, starting at 0.
     * No more than 401 Nouns Sequitur Tokens can be minted.
     * @dev Call _mintTo with the to address(es).
     */
    function mint() public override onlyMinter returns (uint256) {
        require(_currentNounsSequiturId < 401, 'All Nouns Sequitur have been minted');
        if (_currentNounsSequiturId == 400) {
            return _mintTo(soundersDAO, _currentNounsSequiturId++);
        }

        if (_currentNounsSequiturId % 10 == 0) {
            _mintTo(soundersDAO, _currentNounsSequiturId++);
        }
        return _mintTo(minter, _currentNounsSequiturId++);
    }

    /**
     * @notice Burn a Noun Sequitur.
     */
    function burn(uint256 tokenId) public override onlyMinter {
        _burn(tokenId);
        emit NounsSequiturBurned(tokenId);
    }

    /**
     * @notice Set the sounders DAO.
     * @dev Only callable by the Sounders DAO when not locked.
     */
    function setSoundersDAO(address _soundersDAO) external override onlySoundersDAO {
        soundersDAO = _soundersDAO;

        emit SoundersDAOUpdated(_soundersDAO);
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
     * @notice Mint a Noun Sequitur with `nounSequiturId` to the provided `to` address.
     */
    function _mintTo(address to, uint256 nounsSequiturId) internal returns (uint256) {
        _mint(owner(), to, nounsSequiturId);
        emit NounsSequiturCreated(nounsSequiturId);

        return nounsSequiturId;
    }
}
