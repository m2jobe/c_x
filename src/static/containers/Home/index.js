import React from 'react';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import './style.scss';
import reactLogo from './images/react-logo.png';
import reduxLogo from './images/redux-logo.png';
import Select from 'react-select';
import ccxt from 'ccxt';
//import ReactHighcharts from 'react-highcharts';
import moment from 'moment';
const OrderBook = require('react-trading-ui')

const ReactHighcharts = require("react-highcharts");
require("highcharts/js/highcharts-more")(ReactHighcharts.Highcharts);
require("highcharts/js/modules/stock.js")(ReactHighcharts.Highcharts);
const log       = require ('ololog').configure ({ locate: false })


class HomeView extends React.Component {
    static propTypes = {
        statusText: PropTypes.string,
        userName: PropTypes.string,
        dispatch: PropTypes.func.isRequired
    };

    static defaultProps = {
        statusText: '',
        userName: ''
    };

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            chartName: '',
            asks: null,
            bids: null,
            currentSymbol : 'BTC/USD',
            tickerBid: '',
            tickerAsk: '',
            tickerLast : '',
            selectedOption :'BTC/USD',
            balance: '',
            total: 0
        };
    }

    goToProtected = () => {
        this.props.dispatch(push('/calculator'));
    };
    barWidth(size) {
      const damper = 160000 / this.state.bids[0][0]; //get price not size
      return {
        height: '10px',
        width: `${30*Math.pow(size, 2) / (Math.pow(size, 2) + damper)}px`,
        display: 'block',
        background: '#e67e22'
      }
    }
    barWidthBid(size) {
      const damper = 160000 / this.state.bids[0][0]; //get price not size
      return {
        height: '10px',
        width: `${30*Math.pow(size, 2) / (Math.pow(size, 2) + damper)}px`,
        display: 'block',
        background: '#2ecc71'
      }
    }

    async fetchTicker () {
      var symbol = this.state.currentSymbol;
      // instantiate the exchange by id
      let exchange = new ccxt['gdax'] ({ enableRateLimit: true })
      // load all markets from the exchange
      let markets = await exchange.loadMarkets ()

      while (true) {
          var symbol = this.state.currentSymbol;
          const ticker = await exchange.fetchTicker (symbol)

          this.setState({tickerBid: ticker.bid,tickerAsk: ticker.ask, tickerLast: ticker.last});

      }

    }

    async fetchBalance() {
        // instantiate the exchange
      let gdax = new ccxt.gdax  ({ // ... or new ccxt.gdax ()
          'apiKey': '72df3c869ecd9bec44afa1bd18a9847f', // standard
          'secret': 'rJ1wu/ZoD/66yIuAcrE2EsNkMJXkto6Z14ytJOaAGppIeaYwZWnMzPOK9axCWLRYMOi20mTnBvJ4/ZktyqMosA==',
          'password': 'c2xmqas0ljv', // GDAX requires a password!
      })

      // use the testnet for GDAX
      //gdax.urls['api'] = 'https://api-public.sandbox.gdax.com'

      try {

          // fetch account balance from the exchange
          let gdaxBalance = await gdax.fetchBalance ()

          // output the result
          log (gdax.name.green, 'balance', gdaxBalance.info);
          this.setState({balance: JSON.stringify(gdaxBalance.info)})

      } catch (e) {

          if (e instanceof ccxt.DDoSProtection || e.message.includes ('ECONNRESET')) {
              log.bright.yellow ('[DDoS Protection] ' + e.message)
          } else if (e instanceof ccxt.RequestTimeout) {
              log.bright.yellow ('[Request Timeout] ' + e.message)
          } else if (e instanceof ccxt.AuthenticationError) {
              log.bright.yellow ('[Authentication Error] ' + e.message)
          } else if (e instanceof ccxt.ExchangeNotAvailable) {
              log.bright.yellow ('[Exchange Not Available Error] ' + e.message)
          } else if (e instanceof ccxt.ExchangeError) {
              log.bright.yellow ('[Exchange Error] ' + e.message)
          } else if (e instanceof ccxt.NetworkError) {
              log.bright.yellow ('[Network Error] ' + e.message)
          } else {
              throw e;
          }
      }
    }

    async printOrderBook (id, symbol, depth) {

        // check if the exchange is supported by ccxt
        let exchangeFound = ccxt.exchanges.indexOf (id) > -1
        if (exchangeFound) {

            //log ('Instantiating', id.green, 'exchange')

            // instantiate the exchange by id
            let exchange = new ccxt[id] ({ enableRateLimit: true })

            // load all markets from the exchange
            let markets = await exchange.loadMarkets ()

            // // output a list of all market symbols
            // log (id.green, 'has', exchange.symbols.length, 'symbols:', exchange.symbols.join (', ').yellow)

            if (symbol in exchange.markets) {

                const market = exchange.markets[symbol]
                const pricePrecision = market.precision ? market.precision.price : 8
                const amountPrecision = market.precision ? market.precision.amount : 8

                // Object.values (markets).forEach (market => log (market))

                // make a table of all markets
                // const table = asTable.configure ({ delimiter: ' | ' }) (Object.values (markets))
                // log (table)


                const cursorUp = '\u001b[1A'
                const tableHeight = depth * 2 + 4 // bids + asks + headers


                while (true) {

                    const orderbook = await exchange.fetchOrderBook (symbol);

                    console.log( orderbook.bids);
                    this.setState({asks: orderbook.asks.slice (0, depth).reverse (), bids: orderbook.bids.slice (0, depth)});


                    //log (cursorUp.repeat (tableHeight))
                }

            } else {
              alert("Symbol not found");
                //log.error ('Symbol', symbol.bright, 'not found')
            }


        } else {
            alert("exchange not found")
            //printSupportedExchanges ()
        }
    }

    async fetchChart() {
      const index = 4 // [ timestamp, open, high, low, close, volume ]


      const ohlcv = await new ccxt.gdax ().fetchOHLCV (this.state.currentSymbol, '1m')


      const lastPrice = ohlcv[ohlcv.length - 1][index] // closing price
      const series = ohlcv.slice (-80).map (x => [ moment(x[0]).format('YYYY-MM-DD HH:mm:ss'), x[1], x[2], x[3],x[4] ])         // closing price
      console.log(series);
      const bitcoinRate = ('₿ = $' + lastPrice).green
      this.setState({data: series, chartName: 'GDAX OHLC'})
    }

    componentWillMount () {
      this.fetchChart();
      this.printOrderBook ("gdax", this.state.currentSymbol, 10)
    }

    componentDidMount () {
      this.fetchTicker();
      this.fetchBalance();
    }

    componentDidUpdate() {

    }

    toggleCurrencyPairing () {

    }

    handleChange = (selectedOption) => {
      this.setState({ selectedOption, currentSymbol: selectedOption.value});
    }

    handleOrderInput = (event) => {
      console.log(event.target.value);
      var price = this.state.tickerLast * parseFloat(event.target.value);
      this.setState({total: price.toFixed(2)})
    }


    render() {
        if(this.state.data) {
          var config = {
            rangeSelector: {
                selected: 1
            },

            title: {
                text: this.state.chartName
            },
            series: [{
                name: this.state.chartName,
                data: this.state.data,
                dataGrouping: {

                }
            }]
          }
        }

        const { selectedOption } = this.state;
      	const value = selectedOption && selectedOption.value;
        return (
            <div className="container">
              <div className="row">
                <div style={{marginBottom: '5vh'}} className="col-md-4 pull-left">
                <Select
                  name="form-field-name"
                  value={value}
                  onChange={this.handleChange}
                  options={[
                    { value: 'BTC/USD', label: 'BTC/USD' },
                    { value: 'LTC/USD', label: 'LTC/USD' },
                  ]}
                />
                  <p> Bid: ${this.state.tickerBid} </p>
                  <p> Ask: ${this.state.tickerAsk} </p>
                  <p> Last: ${this.state.tickerLast} </p>
                </div>


                <div className="col-md-8 pull-right">
                  <div style={{minHeight: '30vh', width: '100%', border: '1px solid #ccc', font: '16px/26px Georgia, Garamond, Serif', overflow: 'auto'}}>
                    {this.state.balance}
                  </div>
                </div>

              </div>
              <div className="row">
                <div className="col-sm-6 margin-top-medium text-center">
                {this.state.data == null ?
            			 <div>Loading...</div>
            		:
                  <ReactHighcharts config = {config}></ReactHighcharts>


            		}
                <br/><br/><br/>

                <div className="table-dark p-2 flex-1">
                    <div className=" px-1">
                      <button className="col-sm-6 btn order ">Market</button>
                      <button className="col-sm-6 btn order text-gray bg-dark">Limit</button>
                    </div>
                    <div className=" px-1">
                      <button className="col-sm-6 btn buy bg-green">Buy</button>
                      <button className="col-sm-6 btn sell text-gray bg-dark">Sell</button>
                    </div>

                    <div style={{marginTop:'5vh', marginBottom:'5vh', display:'inline-block'}} className="form-group">
                        <div className=" px-1"><label className="form-label text-light">Amount {this.state.currentSymbol.slice(0,3)}</label>
                          {/*<button className="btn btn-order btn-nofocus m-2">Max</button>*/}
                        </div>
                        <input style={{color: '#232323'}}  onChange={this.handleOrderInput}  type="number" step="any" className="form-input" />
                    </div>
                    <br/>
                    <div  style={{marginBottom:'5vh', display:'inline-block'}} className="form-group"><label className="form-label text-light">Total ${this.state.total}</label></div>
                    <div className=" px-1"><button className="col-sm-6 col-mx-auto btn">Place Order</button></div>
                </div>

                </div>
                <div className="col-sm-6 margin-top-medium text-center">
                {this.state.asks == null ?
                   <div>Loading...</div>
                :
                  <table className="table table-dark">
                    <thead style={{color: 'white'}}>
                      <tr>
                        <th scope="col">Ask</th>
                        <th scope="col"></th>
                        <th scope="col"></th>
                      </tr>
                    </thead>
                    <tbody>
                      { this.state.asks &&
                                this.state.asks.map((ask, i) => (
                                  <tr style={{color: '#e67e22'}}   key={i}>
                                    <td> <div  className="ask bar-container"><span style={this.barWidth(ask[1])} className="bar"/></div> </td>
                                    <td className="ask size">{`${(ask[1])}`}</td>
                                    <td className="ask price">{`${(ask[0])}`}</td>
                                  </tr>

                              ))

                      }
                    </tbody>
                  </table>


                }


                { this.state.asks && this.state.asks.length > 0 &&
                  <div className="orderbook-row spread">
                    <div className="columns px-1">
                      <span className="col-2" />
                      <span className="col-5">SPREAD</span>
                      <span className="col-5">
                        ${(this.state.asks[this.state.asks.length - 1][0]
                            - this.state.bids[0][0]).toFixed(2) }
                      </span>
                    </div>
                  </div>
                }

                {this.state.bids == null ?
                   <div>Loading...</div>
                :
                  <table className="table table-dark">
                    <thead style={{color: 'white'}}>
                      <tr>
                        <th scope="col">Bid</th>
                        <th scope="col"></th>
                        <th scope="col"></th>
                      </tr>
                    </thead>
                    <tbody>
                      { this.state.bids &&
                        this.state.bids.map((bid, i) => (
                          <tr style={{color: '#2ecc71'}} key={i} ref={(c) => { if (i === 11) this.focus = c; }}>
                            <td> <div  className="bid bar-container"><span style={this.barWidthBid(bid[1])} className="bar"/></div> </td>
                            <td className="bid size">{`${(bid[1])}`}</td>
                            <td className="bid price">{`${(bid[0])}`}</td>
                          </tr>

                      ))}
                    </tbody>
                  </table>


                }




                </div>
              </div>
              <br/><br/><br/>
              <div className="row">
                <div className="container d-flex order-list table-dark">
                  <div className="flex-1 scroll-y">
                    <div className="row border-bottom-thick px-2">
                      <div className="col-sm-1 text-center text-light">Type</div>
                      <div className="col-sm-2 text-center text-light">Size</div>
                      <div className="col-sm-2 text-center text-light">Filled (BTC)</div>
                      <div className="col-sm-2 text-center text-light">Price (USD)</div>
                      <div className="col-sm-2 text-center text-light">Fee (USD)</div>
                      <div className="col-sm-1 text-center text-light">Time</div>
                      <div className="col-sm-1 text-center text-light">Status</div>
                    </div>
                    <hr/>
                    <div className="row border-bottom-thick px-2">
                      <div className="col-sm-1 text-center text-light">plchd</div>
                      <div className="col-sm-2 text-center text-light">plchd</div>
                      <div className="col-sm-2 text-center text-light">plchd</div>
                      <div className="col-sm-2 text-center text-light">plchd</div>
                      <div className="col-sm-2 text-center text-light">plchd</div>
                      <div className="col-sm-1 text-center text-light">plchd</div>
                      <div className="col-sm-1 text-center text-light">plchd</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userName: state.auth.userName,
        statusText: state.auth.statusText
    };
};

export default connect(mapStateToProps)(HomeView);
export { HomeView as HomeViewNotConnected };
