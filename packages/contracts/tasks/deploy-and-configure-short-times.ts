// Based on NounsDAO's deploy-and-configure.ts

import { task, types } from 'hardhat/config';
import { printContractsTable } from './utils';

task(
  'deploy-and-configure-short-times',
  'Deploy and configure all contracts with short gov times for testing',
)
  .addFlag('startAuction', 'Start the first auction upon deployment completion')
  .addFlag('autoDeploy', 'Deploy all contracts without user interaction')
  // .addFlag('updateConfigs', 'Write the deployed addresses to the SDK and subgraph configs')
  .addOptionalParam('weth', 'The WETH contract address')
  .addOptionalParam('soundersdao', 'The Sounders DAO contract address')
  .addOptionalParam(
    'auctionTimeBuffer',
    'The auction time buffer (seconds)',
    30 /* 30 seconds */,
    types.int,
  )
  .addOptionalParam(
    'auctionReservePrice',
    'The auction reserve price (wei)',
    1 /* 1 wei */,
    types.int,
  )
  .addOptionalParam(
    'auctionMinIncrementBidPercentage',
    'The auction min increment bid percentage (out of 100)',
    2 /* 2% */,
    types.int,
  )
  .addOptionalParam(
    'auctionDuration',
    'The auction duration (seconds)',
    60 * 2 /* 2 minutes */,
    types.int,
  )
  .setAction(async (args, { run }) => {
    // Deploy the Sounders DAO contracts and return deployment information
    const contracts = await run('deploy-short-times', args);

    // Verify the contracts on Etherscan
    await run('verify-etherscan', {
      contracts,
    });

    // Optionally kick off the first auction
    if (args.startAuction) {
      const auctionHouse = contracts.AuctionHouse.instance;
      await auctionHouse.unpause({
        gasLimit: 1_000_000,
      });
      console.log('Started the first auction.');
    }

    printContractsTable(contracts);
    console.log('Deployment Complete.');
  });
