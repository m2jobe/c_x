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
import ReactTable from 'react-table'
const ReactHighcharts = require("react-highcharts");
require("highcharts/js/highcharts-more")(ReactHighcharts.Highcharts);
require("highcharts/js/modules/stock.js")(ReactHighcharts.Highcharts);
const log       = require ('ololog').configure ({ locate: false })

const columns = [ {
  Header: 'Symbol',
  accessor: 'symbol'
},{
  Header: 'Amount',
  accessor: 'amount' // String-based value accessors!
}, {
  Header: 'Cost',
  accessor: 'cost',
  width:150
},{
  Header: 'Date',
  accessor: 'datetime', // String-based value accessors!,
  width: 150
}, {
  Header: 'Price',
  accessor: 'price'
},{
  Header: 'Filled',
  accessor: 'filled' // String-based value accessors!
}, {
  Header: 'Price',
  accessor: 'price'
},{
  Header: 'Remaining',
  accessor: 'remaining' // String-based value accessors!
}, {
  Header: 'Side',
  accessor: 'side'
}, {
  Header: 'Status',
  accessor: 'status'
},];

const columnsBalance = [ {
  Header: 'Currency',
  accessor: 'currency'
},{
  Header: 'Balance',
  accessor: 'balance' // String-based value accessors!
}, {
  Header: 'Available',
  accessor: 'available',
},{
  Header: 'Hold',
  accessor: 'hold', // String-based value accessors!,
},]


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
            total: 0,
            currentOrders: null,
            marketOrLimit: "market",
            buyOrSell: "buy",
            bestBid: '',
            bestAsk: '',
            bestSomething: '',
            keepLooping: true
        };

        this.setMarketOrLimit = this.setMarketOrLimit.bind(this);
        this.setBuyOrSell = this.setBuyOrSell.bind(this);

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

      while (this.state.keepLooping) {
          var symbol = this.state.currentSymbol;
          const ticker = await exchange.fetchTicker (symbol);
          console.log(ticker);
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
      const orders = await gdax.fetchOrders ()
      console.log(orders);
      //orders.map (order => console.log(order));

      this.setState({currentOrders: orders})


      try {

          // fetch account balance from the exchange
          let gdaxBalance = await gdax.fetchBalance ()

          // output the result
          //log (gdax.name.green, 'balance', gdaxBalance.info);
          this.setState({balance: gdaxBalance.info})

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


                while (this.state.keepLooping) {

                    const orderbook = await exchange.fetchOrderBook (this.state.currentSymbol );

                    console.log( orderbook);

                    var bestBid = orderbook.bids[0];
                    var bestAsk = orderbook.asks[0];

                    if(this.state.buyOrSell === "buy") {
                      this.setState({asks: orderbook.asks.slice (0, depth).reverse (), bids: orderbook.bids.slice (0, depth), bestSomething: bestBid});
                    }
                    if(this.state.buyOrSell === "sell") {
                      this.setState({asks: orderbook.asks.slice (0, depth).reverse (), bids: orderbook.bids.slice (0, depth), bestSomething: bestAsk});
                    }



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
      this.printOrderBook ("gdax", this.state.currentSymbol, 10);
    }

    componentDidMount () {
      this.fetchTicker();
      this.fetchBalance();
    }

    componentDidUpdate(prevState, prevProps) {
      if(prevState.currentSymbol != this.state.currentSymbol) {
        this.setState({keepLooping: false});
      }
      if(prevState.keepLooping != this.state.keepLooping) {
        if(this.state.keepLooping == false) {
          this.setState({keepLooping: true})
        } else {
          this.fetchChart();
          this.printOrderBook ("gdax", this.state.currentSymbol, 10);
        }
      }

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

    setMarketOrLimit = (val) => {
      console.log(val);
      if(val === "market") {
        document.getElementById("bestPrice").style.display = "none";
      }
      if(val === "limit") {
        document.getElementById("bestPrice").style.display = "block";
      }
      this.setState({marketOrLimit: val });
    }

    setBuyOrSell = (val) => {
      console.log(val);

      this.setState({buyOrSell: val})

    }

    placeOrder () {
      alert("Note, that some exchanges will not accept market orders (they allow limit orders only).");
      let gdax = new ccxt.gdax  ({ // ... or new ccxt.gdax ()
          'apiKey': '72df3c869ecd9bec44afa1bd18a9847f', // standard
          'secret': 'rJ1wu/ZoD/66yIuAcrE2EsNkMJXkto6Z14ytJOaAGppIeaYwZWnMzPOK9axCWLRYMOi20mTnBvJ4/ZktyqMosA==',
          'password': 'c2xmqas0ljv', // GDAX requires a password!
      })

      if(this.state.marketOrLimit === "market") {
        if(this.state.buyOrSell === "buy") {
          gdax.createMarketBuyOrder (this.state.currentSymbol, this.state.total)
        }
        if(this.state.buyOrSell === "sell") {
          gdax.createMarketSellOrder (this.state.currentSymbol, this.state.total)
        }
      }

      if(this.state.marketOrLimit === "limit") {
        if(this.state.buyOrSell === "buy") {

        }
        if(this.state.buyOrSell === "sell") {

        }
      }
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
            <div style={{padding:'30px'}} className="container table-dark">
              <div className="row">
                <div style={{marginBottom: '5vh'}} className="col-md-4 pull-left">
                <Select
                  name="form-field-name"
                  value={this.state.currentSymbol}
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

                <div style={{marginBottom: '5vh'}} className="col-md-8 pull-right">

                { this.state.balance ?

                  <ReactTable
                    data={this.state.balance}
                    columns={columnsBalance}
                    pageSize={4}
                  />
                  :null
                }
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
                      <button className="col-sm-6 btn buy bg-green"  onClick = {() => this.setMarketOrLimit("market")}>Market</button>
                      <button className="col-sm-6 btn sell text-gray bg-dark" onClick = {() => this.setMarketOrLimit("limit")} >Limit</button>
                    </div>
                    <div className=" px-1">
                      <button className="col-sm-6 btn buy bg-green" onClick = {() => this.setBuyOrSell("buy")} >Buy</button>
                      <button className="col-sm-6 btn sell text-gray bg-dark" onClick = {() => this.setBuyOrSell("sell")} >Sell</button>
                    </div>

                    <div style={{marginTop:'5vh', marginBottom:'5vh', display:'inline-block'}} className="form-group">

                        <div className=" px-1"><label className="form-label text-light">Amount {this.state.currentSymbol.slice(0,3)}</label>
                          {/*<button className="btn btn-order btn-nofocus m-2">Max</button>*/}
                        </div>
                        <input style={{color: '#232323'}}  onChange={this.handleOrderInput}  type="number" step="any" className="form-input" />

                        <div className=" px-1">
                          <label id="bestPrice" style={{display:'none', marginTop:'2vh'}} className="form-label text-light">Best Price: {this.state.bestSomething}</label>
                        </div>
                    </div>
                    <br/>
                    <div  style={{marginBottom:'5vh', display:'inline-block'}} className="form-group"><label className="form-label text-light">Total ${this.state.total}</label></div>
                    <div className=" px-1"><button onClick={this.placeOrder} className="col-sm-6 col-mx-auto btn">Place Order</button></div>
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
              { this.state.currentOrders ?

                <ReactTable
                  data={this.state.currentOrders}
                  columns={columns}
                />
                :null
              }
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
