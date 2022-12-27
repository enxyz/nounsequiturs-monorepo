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

    // @enx - possible place for IPFS image CID during testing
    // Populate the on-chain art
    // await run('populate-descriptor', {
    //   nftDescriptor: contracts.NFTDescriptorV2.address,
    //   nounsDescriptor: contracts.NounsDescriptorV2.address,
    // });

    // Transfer ownership of all contract except for the auction house.
    // We must maintain ownership of the auction house to kick off the first auction.
    const executorAddress = contracts.NounsDAOExecutor.address;
    await contracts.NounsToken.instance.transferOwnership(executorAddress);
    await contracts.NounsAuctionHouseProxyAdmin.instance.transferOwnership(executorAddress);
    console.log(
      'Transferred ownership of the descriptor, token, and proxy admin contracts to the executor.',
    );

    // Optionally kick off the first auction and transfer ownership of the auction house
    // to the Nouns DAO executor.
    if (args.startAuction) {
      const auctionHouse = contracts.NounsAuctionHouse.instance.attach(
        contracts.NounsAuctionHouseProxy.address,
      );
      await auctionHouse.unpause({
        gasLimit: 1_000_000,
      });
      await auctionHouse.transferOwnership(executorAddress);
      console.log(
        'Started the first auction and transferred ownership of the auction house to the executor.',
      );
    }

    // Optionally write the deployed addresses to the SDK and subgraph configs.
    // if (args.updateConfigs) {
    //   await run('update-configs-daov2', {
    //     contracts,
    //   });
    // }

    printContractsTable(contracts);
    console.log('Deployment Complete.');
  });
