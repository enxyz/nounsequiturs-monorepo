# Contracts

## Development

### Install dependencies

```sh
yarn
```

### Compile typescript, contracts, and generate typechain wrappers

```sh
yarn build
```

### Run tests

Using parallel for faster test runs.

```sh
yarn test
```

Test specific file:

```sh
yarn run hardhat test ./test/path-to-file
```

Show gas report:

#TODO: fix bigint error

```sh
REPORT_GAS=true yarn test
```

### Environment Setup

Copy `.env.example` to `.env` and fill in fields

### Commands

```sh
# Compile Solidity
yarn build:sol

# Command Help
yarn task:[task-name] --help

# Deploy & Configure for Local Development (Hardhat)
yarn task:run-local

# Deploy & Configure (Testnet/Mainnet)
# This task deploys and verifies the contracts, and transfers contract ownership.
# For parameter and flag information, run `yarn task:deploy-and-configure --help`.
yarn task:deploy-and-configure --network [network] --update-configs

# Verify by hand
npx hardhat verify --network [network] [contract_address] [constructor_args]
```

### Automated Testnet Deployments

The contracts are deployed to Rinkeby on each push to master and each PR using the account `0x387d301d92AE0a87fD450975e8Aef66b72fBD718`. This account's mnemonic is stored in GitHub Actions as a secret and is injected as the environment variable `MNEMONIC`. This mnemonic _shouldn't be considered safe for mainnet use_.

## Troubleshooting

Node

Set node version with brew

```sh
brew unlink node
brew link --overwrite node@18

# echo 'export PATH="/opt/homebrew/opt/node@18/bin:$PATH"' >> ~/.zshrc
```
