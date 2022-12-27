import { Result } from 'ethers/lib/utils';
import { task, types } from 'hardhat/config';

task('mint', 'Mints a Nouns Sequitur')
  .addOptionalParam(
    'nounsSequiturToken',
    'The `NounsSequiturToken` contract address',
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    types.string,
  )
  .setAction(async ({ nounsSequiturToken }, { ethers }) => {
    const nftFactory = await ethers.getContractFactory('NounsSequiturToken');
    const nftContract = nftFactory.attach(nounsSequiturToken);

    const receipt = await (await nftContract.mint()).wait();
    const nounsSequiturCreated = receipt.events?.[1];
    const { tokenId } = nounsSequiturCreated?.args as Result;

    console.log(`Nouns Sequitur minted with ID: ${tokenId.toString()}.`);
  });
