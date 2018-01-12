import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import ccxt from 'ccxt';

import * as actionCreators from '../../actions/data';

class ProtectedView extends React.Component {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        data: PropTypes.string,
        //token: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            dataFetchProtectedData: PropTypes.func.isRequired
        }).isRequired
    };

    static defaultProps = {
        data: ''
    };

    constructor(props) {
      super(props);
      this.state = {
        startUSD: 15000,
        startBTC: 16805,
        startLTC : 327.6,
        startCryptopia: 0.019678,
        finishUSD: 0,
        finishDollarChange:0,
        finishPercChange:0,
        usdToBTCBidOrAskPrice: 0,
        usdToBTCPoint5PercFee:0,
        usdToBTCAfterFeeMultiplier: 0,
        usdToBTCAfterFeeTotal: 0,

        btcCoinBToCryptopiaBTC : 0,
        btcCoinBToCryptopiaBTCFee: 0,
        btcCoinBToCryptopiaBTCFeeTotal:0,
        btcCoinBToCryptopiaBTCAfterFee: 0,
        btcCoinBToCryptopiaBTCAfterFeeTotal: 0,

        crytopiaBTCToLTCFEE: 0,
        crytopiaBTCToLTCFEETotal: 0,
        crytopiaBTCToLTCFEEPoint5Perc: 0,
        crytopiaBTCToLTCAfterFEE: 0,
        crytopiaBTCToLTCAfterFEETotal: 0,

        sendLTCToCoinbaseLTCVal1: 0,
        sendLTCToCoinbaseLTCVal2 :0,
        sendLTCToCoinbaseLTCFeePoint2 :0,
        sendLTCToCoinbaseLTCFeePoint2Total: 0,
        sendLTCToCoinbaseLTCAfterFee :0,
        sendLTCToCoinbaseLTCAfterFeeTotal: 0,

        sellOnCoinbaseForUSDLTCVal1: 0,
        sellOnCoinbaseForUSDLTCVal2: 0,
        sellOnCoinBaseBidAskPrice:0,
        sellOnCoinBasePoint5PercFee:0,
        sellOnCoinBaseAfterFee: 0,
      };
    }


    // Note: have to use componentWillMount, if I add this in constructor will get error:
    // Warning: setState(...): Cannot update during an existing state transition (such as within `render`).
    // Render methods should be a pure function of props and state.
    componentWillMount() {
        //const token = this.props.token;
        //this.props.actions.dataFetchProtectedData(token);
    }

    handleInputChange = (event) => {
      const usd = event.target.value;
      this.setState(prevState => ({
        startUSD: usd,
      }));
    }

    handleCalculate = () => {
      var startBTC = this.state.startBTC;
      var startLTC = this.state.startLTC;
      var startUSD = this.state.startUSD;
      var startCryptopia = this.state.startCryptopia;
      var toIncrease = 0.005;
      var finishUSD = 0;
      var finishDollarChange = 0;
      var finishPercChange = 0;


      var usdToBTCBidOrAskPrice=  0;
      var      usdToBTCPoint5PercFee= 0;
      var      usdToBTCAfterFeeMultiplier=  0;
      var      usdToBTCAfterFeeTotal=  0;

      usdToBTCBidOrAskPrice = parseFloat(startBTC + (startBTC * 0.002));
      usdToBTCPoint5PercFee = (startUSD/usdToBTCBidOrAskPrice) * toIncrease;
      console.log("start usd " +startUSD)
      console.log("start usd " +usdToBTCBidOrAskPrice)
      console.log("start usd " +toIncrease)


      usdToBTCAfterFeeMultiplier = (startUSD/usdToBTCBidOrAskPrice) - usdToBTCPoint5PercFee;
      usdToBTCAfterFeeTotal = usdToBTCAfterFeeMultiplier * startBTC;

      var      btcCoinBToCryptopiaBTC =  0;
      var      btcCoinBToCryptopiaBTCFee=  0;
      var      btcCoinBToCryptopiaBTCFeeTotal= 0;
      var      btcCoinBToCryptopiaBTCAfterFee=  0;
      var      btcCoinBToCryptopiaBTCAfterFeeTotal=  0;

      btcCoinBToCryptopiaBTC = usdToBTCAfterFeeMultiplier;
      btcCoinBToCryptopiaBTCFee = 0.0009431;
      btcCoinBToCryptopiaBTCFeeTotal = btcCoinBToCryptopiaBTCFee * startBTC;
      btcCoinBToCryptopiaBTCAfterFee = btcCoinBToCryptopiaBTC - btcCoinBToCryptopiaBTCFee;
      btcCoinBToCryptopiaBTCAfterFeeTotal = btcCoinBToCryptopiaBTCAfterFee * startBTC;


      var      crytopiaBTCToLTCFEE=  0;
      var      crytopiaBTCToLTCFEETotal=  0;
      var      crytopiaBTCToLTCFEEPoint5Perc=  0;
      var      crytopiaBTCToLTCAfterFEE=  0;
      var      crytopiaBTCToLTCAfterFEETotal=  0;

      crytopiaBTCToLTCFEE = btcCoinBToCryptopiaBTCAfterFee;
      crytopiaBTCToLTCFEETotal = btcCoinBToCryptopiaBTCAfterFee * startBTC;
      crytopiaBTCToLTCFEEPoint5Perc = btcCoinBToCryptopiaBTCAfterFee * toIncrease;
      crytopiaBTCToLTCAfterFEE = (crytopiaBTCToLTCFEE - crytopiaBTCToLTCFEEPoint5Perc) / startCryptopia;
      crytopiaBTCToLTCAfterFEETotal = crytopiaBTCToLTCAfterFEE * startLTC;

      var      sendLTCToCoinbaseLTCVal1=  0;
      var      sendLTCToCoinbaseLTCVal2 = 0;
      var      sendLTCToCoinbaseLTCFeePoint2 = 0;
      var      sendLTCToCoinbaseLTCFeePoint2Total=  0;
      var      sendLTCToCoinbaseLTCAfterFee = 0;
      var      sendLTCToCoinbaseLTCAfterFeeTotal=  0;

      sendLTCToCoinbaseLTCVal1 = crytopiaBTCToLTCAfterFEE;
      sendLTCToCoinbaseLTCVal2 = sendLTCToCoinbaseLTCVal1 * startLTC;
      sendLTCToCoinbaseLTCFeePoint2 = 0.02;
      sendLTCToCoinbaseLTCFeePoint2Total = sendLTCToCoinbaseLTCFeePoint2 * startLTC;
      sendLTCToCoinbaseLTCAfterFee = crytopiaBTCToLTCAfterFEE - sendLTCToCoinbaseLTCFeePoint2;
      sendLTCToCoinbaseLTCAfterFeeTotal = sendLTCToCoinbaseLTCAfterFee * startLTC;

      var      sellOnCoinbaseForUSDLTCVal1=  0;
      var      sellOnCoinbaseForUSDLTCVal2=  0;
      var      sellOnCoinBaseBidAskPrice= 0;
      var      sellOnCoinBasePoint5PercFee= 0;
      var      sellOnCoinBaseAfterFee=  0;

      sellOnCoinbaseForUSDLTCVal1 = sendLTCToCoinbaseLTCAfterFee;
      sellOnCoinbaseForUSDLTCVal2 = sellOnCoinbaseForUSDLTCVal1 * startLTC;
      sellOnCoinBaseBidAskPrice = startLTC-(startLTC*0.0025);
      sellOnCoinBasePoint5PercFee = (sellOnCoinbaseForUSDLTCVal1*sellOnCoinBaseBidAskPrice) * toIncrease;
      sellOnCoinBaseAfterFee = (sellOnCoinbaseForUSDLTCVal1*sellOnCoinBaseBidAskPrice) - sellOnCoinBasePoint5PercFee;

      finishUSD = sellOnCoinBaseAfterFee;
      finishDollarChange = finishUSD - startUSD;
      finishPercChange = (finishDollarChange / startUSD) * 100;

      finishUSD = finishUSD.toFixed(2)
      finishDollarChange = finishDollarChange.toFixed(2)
      finishPercChange = finishPercChange.toFixed(2)



      this.setState({finishUSD,finishDollarChange,finishPercChange,usdToBTCBidOrAskPrice,usdToBTCPoint5PercFee,usdToBTCAfterFeeMultiplier,usdToBTCAfterFeeTotal,btcCoinBToCryptopiaBTC ,btcCoinBToCryptopiaBTCFee,btcCoinBToCryptopiaBTCFeeTotal,btcCoinBToCryptopiaBTCAfterFee,btcCoinBToCryptopiaBTCAfterFeeTotal,crytopiaBTCToLTCFEE,crytopiaBTCToLTCFEETotal,crytopiaBTCToLTCFEEPoint5Perc,crytopiaBTCToLTCAfterFEE,crytopiaBTCToLTCAfterFEETotal,sendLTCToCoinbaseLTCVal1,sendLTCToCoinbaseLTCVal2,sendLTCToCoinbaseLTCFeePoint2,sendLTCToCoinbaseLTCFeePoint2Total,sendLTCToCoinbaseLTCAfterFee,sendLTCToCoinbaseLTCAfterFeeTotal,sellOnCoinbaseForUSDLTCVal1,sellOnCoinbaseForUSDLTCVal2,sellOnCoinBaseBidAskPrice,sellOnCoinBasePoint5PercFee,sellOnCoinBaseAfterFee})

    }


    async fetchTicker () {
      var symbol1 = "BTC/USD";
      var symbol2 = "LTC/USD";
      var cryptopiaSymbol = "LTC/BTC";

      // instantiate the exchange by id
      let exchange = new ccxt['gdax'] ({ enableRateLimit: true })
      let exchange2 = new ccxt['cryptopia'] ({ enableRateLimit: true })



      while (true) {
          var ticker = [];

          ticker.push(await exchange.fetchTicker (symbol1));
          ticker.push(await exchange.fetchTicker (symbol2));
          ticker.push(await exchange.fetchTicker (cryptopiaSymbol));

          if(ticker) {
          var btcAsk = ticker[0].ask;
          var btcBid = ticker[0].bid;

          var ltcAsk = ticker[1].ask;
          var ltcBid = ticker[1].bid;

          var cryptopiaBid = ticker[2].bid;

          console.log(btcAsk);
          console.log(ltcAsk);
          if(btcAsk && ltcAsk) {
            this.setState({startBTC: btcAsk, startLTC: ltcAsk, startCryptopia: cryptopiaBid});
            this.handleCalculate();
          }
          }

      }

    }

    componentWillMount() {
      this.fetchTicker();
    }



    render() {
        return (
            <div className="protected">
              <div style={{padding: '40px' }} className="container table-dark">
                    <div className="row">
                      <button type="submit" className="col-sm-12 btn btn-primary" onClick={this.handleCalculate}>
                        Calculate
                      </button>
                    </div>
                    <br/>
                    <div className="row" style={{marginTop:'7vh'}}>
                      <label className="form-label col-sm-2 text-light" htmlFor="session">Start USD</label>
                      <input
                        className="col-sm-10 form-control"
                        name="startUSD"
                        placeholder="Start USD"
                        value={String(this.state.startUSD)}
                        onChange={this.handleInputChange}
                        type="number" step="any"
                      />
                    </div>
                    <table className="table" style={{marginTop:'5vh' }}>
                      <tbody>
                        <tr>
                          <th>Start USD</th>
                          <th>BTC</th>
                          <th>LTC</th>
                          <th>Cryptopia</th>
                        </tr>
                        <tr>
                          <td style={{backgroundColor: '#2ecc71', color: 'white'}}>{this.state.startUSD}</td>
                          <td style={{backgroundColor: '#2ecc71', color: 'white'}}>{this.state.startBTC}</td>
                          <td style={{backgroundColor: '#2ecc71', color: 'white'}}>{this.state.startLTC}</td>
                          <td style={{backgroundColor: '#2ecc71', color: 'white'}} >{this.state.startCryptopia}</td>
                        </tr>
                      </tbody>
                    </table>
                    <hr style={{color: "white", marginTop:'5vh', marginBottom: '5vh', display:'block'}} />
                    <table className="table" style={{marginTop:'5vh' }}>
                      <tbody>
                        <tr>
                          <th>Finish USD</th>
                          <th>Dollar Change</th>
                          <th>Percentage Change</th>
                        </tr>
                        <tr>
                          <td style={{fontWeight:'900'}}>{this.state.finishUSD}</td>
                          { this.state.finishDollarChange < 0 ?
                          <td style={{backgroundColor: '#e74c3c', color:'white '}}>{this.state.finishDollarChange}</td>
                          :
                          <td style={{backgroundColor: '#2ecc71', color: 'white '}} >{this.state.finishDollarChange}</td>

                          }
                          { this.state.finishPercChange < 0 ?
                          <td style={{backgroundColor: '#e74c3c', color:'white '}}>{this.state.finishPercChange}</td>
                          :
                          <td style={{backgroundColor: '#2ecc71', color: 'white '}} >{this.state.finishPercChange}</td>

                          }

                        </tr>
                      </tbody>
                    </table>
                    <hr style={{color: "white", marginTop:'5vh', marginBottom: '5vh', display:'block'}} />
                    <label style={{color: "white", marginTop:'1vh', marginBottom: '1vh', display:'block'}} > Use USD on CoinBase To buy BTC </label>
                    <table className="table" style={{marginTop:'5vh' }}>
                      <tbody>
                        <tr>
                          <th>USD</th>
                          <th>{this.state.startUSD}</th>
                          <th>{this.state.startUSD}</th>
                        </tr>
                        <tr>
                          <td>BID/ASK Price</td>
                          <td>{this.state.usdToBTCBidOrAskPrice}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Fee .5% </td>
                          <td>{this.state.usdToBTCPoint5PercFee}  </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>BTC After Fee</td>
                          <td>{this.state.usdToBTCAfterFeeMultiplier}</td>
                          <td>{this.state.usdToBTCAfterFeeTotal}</td>
                        </tr>
                      </tbody>
                    </table>
                    <hr style={{color: "white", marginTop:'5vh', marginBottom: '5vh', display:'block'}} />
                    <label style={{color: "white", marginTop:'1vh', marginBottom: '1vh', display:'block'}} > Send BTC from CoinBase to Cryptopia </label>
                    <table className="table" style={{marginTop:'5vh' }}>
                      <tbody>
                        <tr>
                          <th>BTC</th>
                          <th>{this.state.btcCoinBToCryptopiaBTC}</th>
                          <th></th>
                        </tr>
                        <tr>
                          <td>Fee</td>
                          <td>{this.state.btcCoinBToCryptopiaBTCFee}</td>
                          <td>{this.state.btcCoinBToCryptopiaBTCFeeTotal}</td>
                        </tr>
                        <tr>
                          <td>After Fee</td>
                          <td>{this.state.btcCoinBToCryptopiaBTCAfterFee}</td>
                          <td>{this.state.btcCoinBToCryptopiaBTCAfterFeeTotal}</td>
                        </tr>
                      </tbody>
                    </table>
                    <hr style={{color: "white", marginTop:'5vh', marginBottom: '5vh', display:'block'}} />
                    <label style={{color: "white", marginTop:'1vh', marginBottom: '1vh', display:'block'}} > Use BTC on Cryptopia to buy LTC </label>
                    <table className="table" style={{marginTop:'5vh' }}>
                      <tbody>
                        <tr>
                          <th>BTC</th>
                          <th>{this.state.crytopiaBTCToLTCFEE}</th>
                          <th>{this.state.crytopiaBTCToLTCFEETotal}</th>
                        </tr>
                        <tr>
                          <td>Fee .05%</td>
                          <td>{this.state.crytopiaBTCToLTCFEEPoint5Perc}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>LTC After Fee</td>
                          <td>{this.state.crytopiaBTCToLTCAfterFEE}</td>
                          <td>{this.state.crytopiaBTCToLTCAfterFEETotal}</td>
                        </tr>
                      </tbody>
                    </table>

                    <hr style={{color: "white", marginTop:'5vh', marginBottom: '5vh', display:'block'}} />
                    <label style={{color: "white", marginTop:'1vh', marginBottom: '1vh', display:'block'}} > Send LTC to Coinbase </label>
                    <table className="table" style={{marginTop:'5vh' }}>
                      <tbody>
                        <tr>
                          <th>LTC</th>
                          <th>{this.state.sendLTCToCoinbaseLTCVal1}</th>
                          <th>{this.state.sendLTCToCoinbaseLTCVal2}</th>
                        </tr>
                        <tr>
                          <td>Fee .02 LTC</td>
                          <td>{this.state.sendLTCToCoinbaseLTCFeePoint2}</td>
                          <td>{this.state.sendLTCToCoinbaseLTCFeePoint2Total}</td>
                        </tr>
                        <tr>
                          <td>LTC After Fee</td>
                          <td>{this.state.sendLTCToCoinbaseLTCAfterFee}</td>
                          <td>{this.state.sendLTCToCoinbaseLTCAfterFeeTotal}</td>
                        </tr>
                      </tbody>
                    </table>

                    <hr style={{color: "white", marginTop:'5vh', marginBottom: '5vh', display:'block'}} />
                    <label style={{color: "white", marginTop:'1vh', marginBottom: '1vh', display:'block'}} > Send on CoinBase for USD </label>
                    <table className="table" style={{marginTop:'5vh' }}>
                      <tbody>
                        <tr>
                          <th>LTC</th>
                          <th>{this.state.sellOnCoinbaseForUSDLTCVal1}</th>
                          <th>{this.state.sellOnCoinbaseForUSDLTCVal2}</th>
                        </tr>
                        <tr>
                          <td>Bid/Ask Price</td>
                          <td>{this.state.sellOnCoinBaseBidAskPrice}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>.5%</td>
                          <td>{this.state.sellOnCoinBasePoint5PercFee}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>After Fee</td>
                          <td>{this.state.sellOnCoinBaseAfterFee}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
              </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        data: state.data.data,
        isFetching: state.data.isFetching
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(actionCreators, dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProtectedView);
export { ProtectedView as ProtectedViewNotConnected };
