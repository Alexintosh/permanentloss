import { useQuery } from "@apollo/react-hooks";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider, Web3Provider } from "@ethersproject/providers";
import { formatEther, parseEther } from "@ethersproject/units";
import { abis, addresses, MAINNET_ID } from "@uniswap-v2-app/contracts";
import React, { useCallback, useEffect, useState } from "react";
import Plot from 'react-plotly.js';
import { Body, Button, Header, Image, Link } from "./components";
import GET_AGGREGATED_UNISWAP_DATA from "./graphql/subgraph";
import { logoutOfWeb3Modal, web3Modal } from './utils/web3Modal';
import { optionsContracts } from './stubs/optionsContractsGraphQl'; 

const NETWORK = "homestead" // mainnet
const DEFAULT_PROVIDER = getDefaultProvider(NETWORK, {
  etherscan: process.env.REACT_APP_ETHERSCAN_API_KEY,
  // infura: process.env.REACT_APP_INFURA_PROJECT_ID,
  // alchemy: process.env.REACT_APP_ALCHEMY_API_KEY,
  quorum: 1 // Otherwise getEthToTokenInputPrice() "throws Unhandled Rejection (Error): failed to meet quorum"
});
const WETH_CONTRACT = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC_CONTRACT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const CURRENT_ETH_PRICE = 375;
const OPYN_UNISWAP_EXCHANGE = "0xc0a47dfe034b400b47bdad5fecda2621de6c4d95";
const OPYN_UNISWAP_CONTRACT = new Contract(OPYN_UNISWAP_EXCHANGE, abis.uniswapv1_factory, DEFAULT_PROVIDER);

async function readOnChainData() {
  // Should replace with the end-user wallet, e.g. Metamask
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const daiWethExchangeContract = new Contract(addresses[MAINNET_ID].pairs["DAI-WETH"], abis.pair, DEFAULT_PROVIDER);
  // Reserves held in the DAI-WETH pair contract
  const reserves = await daiWethExchangeContract.getReserves();
  console.log({ reserves });
}

function WalletButton({ provider, loadWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function getImpermanentLossPoints() {
  const x = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 3, 4, 5];
  // Equation from https://uniswap.org/docs/v2/advanced-topics/understanding-returns/
  const y = x.map(x => 2 * Math.sqrt(x) / (1+x) - 1);
  return [x, y];
}

function getEthPutOptions() {
  // const wethPutOptions = optionsContracts.data.optionsContracts.filter(
  //   x => x.underlying === WETH_CONTRACT 
  //   && x.underlying !== '0x0000000000000000000000000000000000000000'
  //   && isEpochInFuture(x.expiry));
  //   wethPutOptions.forEach(async(option) => {
  //   console.log(`put option:${JSON.stringify(option)}`);
  //   const exchangeAddress = await OPYN_UNISWAP_CONTRACT.getExchange(option.address);
  //   const optionMarket = new Contract(exchangeAddress, abis.uniswapv1_market, DEFAULT_PROVIDER);
  //   const price = await optionMarket.getEthToTokenInputPrice(parseEther("1.0"));
  //   const strikePrice = option.strikePriceValue * 10; // for some reason they store it like this
  //   console.log(`strikePrice:${strikePrice}   price:${price}`);
  // });
  // console.log(`oToken address:${wethPutOptions[0].address}`)
  
  // console.log(`price:${price}`);
  // return wethPutOptions[0].strikePriceValue, price/8;

  // TODO re-enable live data
  return [
    [320/CURRENT_ETH_PRICE, 360/CURRENT_ETH_PRICE],
    [1/28.2702* CURRENT_ETH_PRICE, 1/21.5 * CURRENT_ETH_PRICE]
  ];
}

function getEthCallOptions() {
  // const wethCallOptions = optionsContracts.data.optionsContracts.filter(
  //   x => x.strike === "0x0000000000000000000000000000000000000000" 
  //   && x.underlying === USDC_CONTRACT
  //   && isEpochInFuture(x.expiry));
  // wethCallOptions.forEach(async(option) => {
  //   console.log(`call option:${JSON.stringify(option)}`);
  //   const exchangeAddress = await OPYN_UNISWAP_CONTRACT.getExchange(option.address);
  //   const optionMarket = new Contract(exchangeAddress, abis.uniswapv1_market, DEFAULT_PROVIDER);
  //   const price = await optionMarket.getEthToTokenInputPrice(parseEther("1.0"));
  //   const strikePrice = option.strikePriceValue * 10; // for some reason they store it like this
  //   console.log(`strikePrice:${strikePrice}   price:${price}`);

  // });
  // // TODO re-enable live data
  return [
    [400/CURRENT_ETH_PRICE, 500/CURRENT_ETH_PRICE],
    [1/4561.26 * CURRENT_ETH_PRICE, 1/14485.4 * CURRENT_ETH_PRICE]
  ];
}

function isEpochInFuture(epoch)
{
  return epoch > new Date().getTime() / 1000;
}

function handlePlotClick(target) {
  console.log(target);
}

function App() {
  const { loading, error, data } = useQuery(GET_AGGREGATED_UNISWAP_DATA);
  const [provider, setProvider] = useState();
  const impermanentLossPoints = getImpermanentLossPoints();
  const impermanentLossPlotData = {
    x: impermanentLossPoints[0],
    y: impermanentLossPoints[1],
    type: 'scatter',
    mode: 'lines',
    name: 'IP Loss',
    line: {'shape': 'spline', 'smoothing': .5},
    marker: {color: 'blue'},
  };

  const putOptions = getEthPutOptions();
  const putOptionPlotData = {
    x: putOptions[0],
    y: putOptions[1],
    name: 'Put Price',
    yaxis: 'y2',
    type:' scatter',
    marker: {color: 'green'},
  }

  const callOptions = getEthCallOptions();
  const callOptionPlotData = {
    x: callOptions[0],
    y: callOptions[1],
    name: 'Call Price',
    yaxis: 'y3',
    type:' scatter',
    marker: {color: 'orange'},
  }

  const layout={
    responsive: true,
    title: 'Impermanent Loss',
    xaxis: {
      title: 'ETH Value',
      tickformat: ',.0%',
    },
    yaxis: {
      title: 'Δ Value',
      tickformat: ',.0%',
    },
    yaxis2: {
      title: 'oToken Price',
      overlaying: 'y',
      side: 'right' 
    },
    yaxis3: {
      title: 'oToken Price',
      overlaying: 'y',
      side: 'right' 
    }
  }
  
  /* Open wallet selection modal. */
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    setProvider(new Web3Provider(newProvider));
  }, []);

  /* If user has loaded a wallet before, load it automatically. */
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  React.useEffect(() => {
    if (!loading && !error && data && data.uniswapFactories) {
      console.log({ uniswapFactories: data.uniswapFactories });
    }
  }, [loading, error, data]);

  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} />
      </Header>
      <Body>
      <Plot
        data={[impermanentLossPlotData, putOptionPlotData, callOptionPlotData]}
        layout={layout}
        onClick={handlePlotClick}
      />
      </Body>
    </div>
  );
}

export default App;
