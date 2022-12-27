// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

import { INounsSequiturAuctionHouse } from '../interfaces/INounsSequiturAuctionHouse.sol';

contract MaliciousBidder {
    function bid(INounsSequiturAuctionHouse auctionHouse, uint256 tokenId) public payable {
        auctionHouse.createBid{ value: msg.value }(tokenId);
    }

    receive() external payable {
        assembly {
            invalid()
        }
    }
}
