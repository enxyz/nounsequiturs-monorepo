// SPDX-License-Identifier: GPL-3.0

import chai, { expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { constants } from 'ethers';
import { ethers } from 'hardhat';
import {
  AuctionHouse,
  MaliciousBidder__factory as MaliciousBidderFactory,
  NounSequiturToken,
  NounSequiturToken__factory as NounSequiturTokenFactory,
  WETH,
} from '../typechain';
import { deployNounSequiturToken, deployWeth } from './utils';

describe('auctionHouse', () => {
  let auctionHouse: AuctionHouse;
  let nounsToken: NounSequiturToken;
  let weth: WETH;
  let deployer: SignerWithAddress;
  let noundersDAO: SignerWithAddress;
  let bidderA: SignerWithAddress;
  let bidderB: SignerWithAddress;
  let snapshotId: number;

  const TIME_BUFFER = 15 * 60;
  const RESERVE_PRICE = 2;
  const MIN_INCREMENT_BID_PERCENTAGE = 5;
  const DURATION = 60 * 60 * 24;

  async function deploy(deployer?: SignerWithAddress) {
    const auctionHouseFactory = await ethers.getContractFactory('AuctionHouse', deployer);
    return auctionHouseFactory.deploy(
      nounsToken.address,
      weth.address,
      TIME_BUFFER,
      RESERVE_PRICE,
      MIN_INCREMENT_BID_PERCENTAGE,
      DURATION,
    ) as Promise<AuctionHouse>;
  }

  before(async () => {
    [deployer, noundersDAO, bidderA, bidderB] = await ethers.getSigners();

    nounsToken = await deployNounSequiturToken(deployer, noundersDAO.address, deployer.address);
    weth = await deployWeth(deployer);
    auctionHouse = await deploy(deployer);

    await nounsToken.setMinter(auctionHouse.address);
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  // deploy

  it('should allow the noundersDAO to unpause the contract and create the first auction', async () => {
    const tx = await auctionHouse.unpause();
    await tx.wait();

    const auction = await auctionHouse.auction();
    expect(auction.startTime.toNumber()).to.be.greaterThan(0);
  });

  it('should emit an `AuctionCreated` event upon creation of first auction', async () => {
    const tx = await auctionHouse.unpause();
    const receipt = await tx.wait();
    const { tokenId } = await auctionHouse.auction();

    const { timestamp } = await ethers.provider.getBlock(receipt.blockHash);
    const createdEvent = receipt.events?.find(e => e.event === 'AuctionCreated');

    expect(createdEvent?.args?.tokenId).to.equal(tokenId);
    expect(createdEvent?.args?.startTime).to.equal(timestamp);
    expect(createdEvent?.args?.endTime).to.equal(timestamp + DURATION);
  });

  // artwork
  it('should revert if no artwork for the NFT is provided and initialize aution is called', async () => {});

  it('should not be possible to change the artwork after auction is started', async () => {});

  // bids
  it('should revert if a user creates a bid for an inactive auction', async () => {
    await (await auctionHouse.unpause()).wait();

    const { tokenId } = await auctionHouse.auction();
    const tx = auctionHouse.connect(bidderA).createBid(tokenId.add(1), {
      value: RESERVE_PRICE,
    });

    await expect(tx).to.be.revertedWith('Noun Sequitur not up for auction');
  });

  it('should revert if a user creates a bid for an expired auction', async () => {
    await (await auctionHouse.unpause()).wait();

    await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours

    const { tokenId } = await auctionHouse.auction();
    const tx = auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });

    await expect(tx).to.be.revertedWith('Auction expired');
  });

  it('should revert if a user creates a bid with an amount below the reserve price', async () => {
    await (await auctionHouse.unpause()).wait();

    const { tokenId } = await auctionHouse.auction();
    const tx = auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE - 1,
    });

    await expect(tx).to.be.revertedWith('Must send at least reservePrice');
  });

  it('should revert if a user creates a bid less than the min bid increment percentage', async () => {
    await (await auctionHouse.unpause()).wait();

    const { tokenId } = await auctionHouse.auction();
    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE * 50,
    });
    const tx = auctionHouse.connect(bidderB).createBid(tokenId, {
      value: RESERVE_PRICE * 51,
    });

    await expect(tx).to.be.revertedWith(
      'Must send more than last bid by minBidIncrementPercentage amount',
    );
  });

  it('should refund the previous bidder when the following user creates a bid', async () => {
    await (await auctionHouse.unpause()).wait();

    const { tokenId } = await auctionHouse.auction();
    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });

    const bidderAPostBidBalance = await bidderA.getBalance();
    await auctionHouse.connect(bidderB).createBid(tokenId, {
      value: RESERVE_PRICE * 2,
    });
    const bidderAPostRefundBalance = await bidderA.getBalance();

    expect(bidderAPostRefundBalance).to.equal(bidderAPostBidBalance.add(RESERVE_PRICE));
  });

  it('should cap the maximum bid griefing cost at 30K gas + the cost to wrap and transfer WETH', async () => {
    await (await auctionHouse.unpause()).wait();

    const { tokenId } = await auctionHouse.auction();

    const maliciousBidderFactory = new MaliciousBidderFactory(bidderA);
    const maliciousBidder = await maliciousBidderFactory.deploy();

    const maliciousBid = await maliciousBidder.connect(bidderA).bid(auctionHouse.address, tokenId, {
      value: RESERVE_PRICE,
    });
    await maliciousBid.wait();

    const tx = await auctionHouse.connect(bidderB).createBid(tokenId, {
      value: RESERVE_PRICE * 2,
      gasLimit: 1_000_000,
    });
    const result = await tx.wait();

    expect(result.gasUsed.toNumber()).to.be.lessThan(200_000);
    expect(await weth.balanceOf(maliciousBidder.address)).to.equal(RESERVE_PRICE);
  });

  it('should emit an `AuctionBid` event on a successful bid', async () => {});

  it('should emit an `AuctionExtended` event if the auction end time is within the time buffer', async () => {});

  // settlement
  it('should revert if auction settlement is attempted while the auction is still active', async () => {});

  it('should transfer the Noun to the highest bidder on auction settlement', async () => {});

  it('should burn a Noun on auction settlement if no bids are received', async () => {});

  it('should emit `AuctionSettled` and `AuctionCreated` events if all conditions are met', async () => {
    await (await auctionHouse.unpause()).wait();

    const { tokenId } = await auctionHouse.auction();

    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });

    await ethers.provider.send('evm_increaseTime', [60 * 60 * 25]); // Add 25 hours
    const tx = await auctionHouse.connect(bidderA).settleCurrentAndCreateNewAuction();

    const receipt = await tx.wait();
    const { timestamp } = await ethers.provider.getBlock(receipt.blockHash);

    const settledEvent = receipt.events?.find(e => e.event === 'AuctionSettled');
    const createdEvent = receipt.events?.find(e => e.event === 'AuctionCreated');

    expect(settledEvent?.args?.tokenId).to.equal(tokenId);
    expect(settledEvent?.args?.winner).to.equal(bidderA.address);
    expect(settledEvent?.args?.highestBid).to.equal(RESERVE_PRICE);

    expect(createdEvent?.args?.tokenId).to.equal(tokenId.add(1));
    expect(createdEvent?.args?.startTime).to.equal(timestamp);
    expect(createdEvent?.args?.endTime).to.equal(timestamp + DURATION);
  });

  // sounders
  it('should send the correct number of NFTs to the founders DAO', async () => {});

  // termination
  // 401 https://discord.com/channels/1027658604335071373/1027658604792270868/1028080888887660614
  it('should end after 401 strips', async () => {});

  // edge cases
  it('should not create a new auction if the auction house is paused and unpaused while an auction is ongoing', async () => {});
  it('should create a new auction if the auction house is paused and unpaused after an auction is settled', async () => {});
  it('should settle the current auction and pause the contract if the minter is updated while the auction house is unpaused', async () => {});
});
