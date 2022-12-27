import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  NounsSequiturToken,
  NounsSequiturToken__factory as NounsSequiturTokenFactory,
  WETH,
  WETH__factory as WethFactory,
} from '../typechain';

export type TestSigners = {
  deployer: SignerWithAddress;
  account0: SignerWithAddress;
  account1: SignerWithAddress;
  account2: SignerWithAddress;
};

export const getSigners = async (): Promise<TestSigners> => {
  const [deployer, account0, account1, account2] = await ethers.getSigners();
  return {
    deployer,
    account0,
    account1,
    account2,
  };
};

export const deployNounsSequiturToken = async (
  deployer?: SignerWithAddress,
  soundersDAO?: string,
  minter?: string,
  proxyRegistryAddress?: string,
): Promise<NounsSequiturToken> => {
  const signer = deployer || (await getSigners()).deployer;
  const factory = new NounsSequiturTokenFactory(signer);

  return factory.deploy(
    soundersDAO || signer.address,
    minter || signer.address,
    proxyRegistryAddress || address(0),
  );
};

export const address = (n: number): string => {
  return `0x${n.toString(16).padStart(40, '0')}`;
};

export const deployWeth = async (deployer?: SignerWithAddress): Promise<WETH> => {
  const factory = new WethFactory(deployer || (await getSigners()).deployer);

  return factory.deploy();
};
