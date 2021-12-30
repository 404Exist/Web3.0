require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/V4a0uhtXX2bUsJkIt0JGwvwITyGUyLnw',
      accounts: ['5cf1f390e624379fa91cfed1eba7e0b6d083b5a29f2c559c4313ed6274deec94'] // this is private key from my acccount metamask wallet
    }
  }
}