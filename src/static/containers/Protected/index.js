import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import * as actionCreators from '../../actions/data';

class ProtectedView extends React.Component {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        data: PropTypes.string,
        token: PropTypes.string.isRequired,
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
        const token = this.props.token;
        //this.props.actions.dataFetchProtectedData(token);
    }

    render() {
        return (
            <div className="protected">
              <div className="container table-dark">
                <div className="rows">
                  <div className="form-horizontal col-mx-auto col-sm-6 col-md-10" >
                    <div className="form-group">
                      <button type="submit" className="col-sm-3 col-mx-auto btn btn-primary" onClick={this.handleCalculate}>
                        Calculate
                      </button>
                    </div>
                    <div className="form-group">
                      <label className="form-label col-sm-2 text-light" htmlFor="session">Start USD</label>
                      <input
                        className="col-10 mx-2"
                        name="startUSD"
                        placeholder="Start USD"
                        value={String(this.state.startUSD)}
                        onChange={this.handleInputChange}
                      />
                    </div>
                    <table>
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
                    <table>
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
                    <table>
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
                    <table>
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
                    <table>
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
                    <table>
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
                    <table>
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
