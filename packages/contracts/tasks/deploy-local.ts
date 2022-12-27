import { task, types } from 'hardhat/config';
import { Contract as EthersContract } from 'ethers';
import { ContractNames } from './types';

type LocalContractName = ContractNames | 'WETH' | 'Multicall2';
// type LocalContractName = ContractNames | 'WETH';

interface Contract {
  args?: (string | number | (() => string | undefined))[];
  instance?: EthersContract;
  libraries?: () => Record<string, string>;
  waitForConfirmation?: boolean;
}

task('deploy-local', 'Deploy contracts to hardhat')
  .addOptionalParam('soundersdao', 'The nounders DAO contract address')
  .addOptionalParam('auctionTimeBuffer', 'The auction time buffer (seconds)', 30, types.int) // Default: 30 seconds
  .addOptionalParam('auctionReservePrice', 'The auction reserve price (wei)', 1, types.int) // Default: 1 wei
  .addOptionalParam(
    'auctionMinIncrementBidPercentage',
    'The auction min increment bid percentage (out of 100)', // Default: 5%
    5,
    types.int,
  )
  .addOptionalParam('auctionDuration', 'The auction duration (seconds)', 60 * 2, types.int) // Default: 2 minutes
  .setAction(async (args, { ethers }) => {
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 31337) {
      console.log(`Invalid chain id. Expected 31337. Got: ${network.chainId}.`);
      return;
    }

    const proxyRegistryAddress = '0xa5409ec958c83c3f309868babaca7c86dcb077c1';

    const [deployer] = await ethers.getSigners();

    const contracts: Record<LocalContractName, Contract> = {
      WETH: {},
      NounsSequiturToken: {
        args: [args.soundersdao || deployer.address, deployer.address, proxyRegistryAddress],
      },
      AuctionHouse: {
        args: [
          () => contracts.NounsSequiturToken.instance?.address,
          () => contracts.WETH.instance?.address,
          args.auctionTimeBuffer,
          args.auctionReservePrice,
          args.auctionMinIncrementBidPercentage,
          args.auctionDuration,
        ],
        waitForConfirmation: true,
      },
      Multicall2: {},
    };

    for (const [name, contract] of Object.entries(contracts)) {
      const factory = await ethers.getContractFactory(name, {
        libraries: contract?.libraries?.(),
      });

      const deployedContract = await factory.deploy(
        ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
      );

      if (contract.waitForConfirmation) {
        await deployedContract.deployed();
      }

      contracts[name as LocalContractName].instance = deployedContract;

      console.log(`${name} contract deployed to ${deployedContract.address}`);
    }

    return contracts;
  });
