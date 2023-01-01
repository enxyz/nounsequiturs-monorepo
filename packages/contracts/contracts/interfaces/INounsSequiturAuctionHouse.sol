// SPDX-License-Identifier: GPL-3.0

/// @title Interface for Noun Sequitur Auction Houses

pragma solidity 0.8.17;

interface INounsSequiturAuctionHouse {
    struct Auction {
        // The ID of the NounsSequitur
        uint256 tokenId;
        // The current highest bid
        uint256 highestBid;
        // The time that the auction was created
        uint256 startTime;
        // The time the auction is scheduled to end
        uint256 endTime;
        // The address of the current highest bidder
        address payable bidder;
        // Whether the auction is active
        bool isSettled;
    }

    event AuctionCreated(uint256 indexed tokenId, uint256 startTime, uint256 endTime);

    event AuctionBid(uint256 indexed tokenId, address sender, uint256 value, bool extended);

    event AuctionExtended(uint256 indexed tokenId, uint256 endTime);

    event AuctionSettled(uint256 indexed tokenId, address winner, uint256 highestBid);

    event AuctionTimeBufferUpdated(uint256 timeBuffer);

    event AuctionReservePriceUpdated(uint256 reservePrice);

    event AuctionMinBidIncrementPercentageUpdated(uint256 minBidIncrementPercentage);

    function settleAuction() external;

    function settleCurrentAndCreateNewAuction() external;

    function createBid(uint256 tokenId) external payable;

    function pause() external;

    function unpause() external;

    function setTimeBuffer(uint256 timeBuffer) external;

    function setReservePrice(uint256 reservePrice) external;

    function setMinBidIncrementPercentage(uint8 minBidIncrementPercentage) external;
}
