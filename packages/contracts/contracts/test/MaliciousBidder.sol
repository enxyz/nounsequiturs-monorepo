// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

import { INounSequiturAuctionHouse } from '../interfaces/INounSequiturAuctionHouse.sol';

contract MaliciousBidder {
    function bid(INounSequiturAuctionHouse auctionHouse, uint256 tokenId) public payable {
        auctionHouse.createBid{ value: msg.value }(tokenId);
    }

    receive() external payable {
        assembly {
            invalid()
        }
    }
}
