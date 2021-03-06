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
  width: 300
}, {
  Header: 'Price',
  accessor: 'price'
},{
  Header: 'Filled',
  accessor: 'filled', // String-based value accessors!,
  width:200
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
            asks: null,
            bids: null,
            currentSymbol : null,
            currentExchange: null,
            tickerBid: '',
            tickerAsk: '',
            tickerLast : '',
            selectedOption :'',
            selectedOption2 :'',
            balance: '',
            total: 0,
            setAmount: 0,
            setPriceLimit:0,
            currentOrders: null,
            marketOrLimit: "market",
            buyOrSell: "buy",
            bestBid: '',
            bestAsk: '',
            bestSomething: '',
            keepLooping: true,
            currentApiKey: null,
            currentSecretKey : null,
            currentPassword : null,
            allSymbols: null,
            loadExchange:false
        };

        this.setMarketOrLimit = this.setMarketOrLimit.bind(this);
        this.setBuyOrSell = this.setBuyOrSell.bind(this);
        this.placeOrder = this.placeOrder.bind(this);
        this.loadExchange = this.loadExchange.bind(this);

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
      let exchange = new ccxt[this.state.currentExchange] ({ enableRateLimit: true })
      // load all markets from the exchange
      let markets = await exchange.loadMarkets ()

      while (true) {
          var symbol = this.state.currentSymbol;
          const ticker = await exchange.fetchTicker (symbol);
          console.log(ticker);
          this.setState({tickerBid: ticker.bid,tickerAsk: ticker.ask, tickerLast: ticker.last});

      }

    }

    async fetchBalance() {
        // instantiate the exchange
      let exchange = new ccxt[this.state.currentExchange]   ({ // ... or new ccxt[this.state.currentExchange]  ()
          'apiKey': this.state.currentApiKey, // standard
          'secret': this.state.currentSecretKey,
          'password': this.state.currentPassword, //  requires a password!
      })

      // use the testnet for
      //exchange.urls['api'] = 'https://api-public.sandbox.exchange.com'
      console.log(this.state.currentExchange)
      var orders = [ { symbol: 'Exchange', amount: 'does', cost: 'not', datetime: 'support', price: 'fetch', filled: 'orders', price: '', remaining: '', side: '', status: '', }]

      if(this.state.currentExchange !== "kucoin") {
        orders = await exchange.fetchOrders ()
      } else {
      }
      //orders.map (order => console.log(order));

      //this.setState({currentOrders: orders})


      try {

          // fetch account balance from the exchange
          let exchangeBalance = await exchange.fetchBalance ()

          // output the result
          this.setState({balance: exchangeBalance.info,currentOrders: orders})

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

    async printOrderBook (symbol, depth) {

        // check if the exchange is supported by ccxt
        var id = this.state.currentExchange;
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

                    const orderbook = await exchange.fetchOrderBook (this.state.currentSymbol );

                    console.log( orderbook);

                    var bestBid = orderbook.bids[0];
                    var bestAsk = orderbook.asks.slice (0, depth)[depth-1];

                    if(this.state.buyOrSell === "buy") {
                      this.setState({asks: orderbook.asks.slice (0, depth).reverse (), bids: orderbook.bids.slice (0, depth), bestSomething: bestBid});
                    }
                    if(this.state.buyOrSell === "sell") {
                      this.setState({asks: orderbook.asks.slice (0, depth).reverse (), bids: orderbook.bids.slice (0, depth), bestSomething: bestAsk});
                    }



                    //log (cursorUp.repeat (tableHeight))
                }

            } else {
              alert("Symbol not found, pelase refresh page and try another");
                //log.error ('Symbol', symbol.bright, 'not found')
            }


        } else {
            alert("exchange not found, please refresh page and try another")
            //printSupportedExchanges ()
        }
    }

    async fetchChart() {
      const index = 4 // [ timestamp, open, high, low, close, volume ]


      const ohlcv = await new ccxt[this.state.currentExchange]  ().fetchOHLCV (this.state.currentSymbol, '1h')


      const lastPrice = ohlcv[ohlcv.length - 1][index] // closing price
      const series = ohlcv.slice (-80).map (x => [ moment(x[0]).format('YYYY-MM-DD HH:mm:ss'), x[1], x[2], x[3],x[4] ])         // closing price
      console.log(series);
      const bitcoinRate = ('₿ = $' + lastPrice).green
      this.setState({data: series})
    }

    componentWillMount () {
      //this.fetchChart();
      ///
    }

    componentDidMount () {
        //this.fetchBalance();
    }

    componentDidUpdate(prevProps, prevState) {
      if(prevState.data == null ){
        if(prevState.data != this.state.data) {
          this.fetchTicker();
          this.printOrderBook (this.state.currentSymbol, 10);

        }
      }
      if(prevState.currentSymbol != this.state.currentSymbol && prevState.currentSymbol != null) {
        this.fetchChart();
      }

      if(prevState.setAmount != this.state.setAmount || prevState.setPriceLimit != this.state.setPriceLimit) {
        var total = this.state.setPriceLimit * this.state.setAmount; // + his "mining" fee
        this.setState({total: total});
      }

      if(prevState.currentExchange != this.state.currentExchange) {
        this.setSymbols(this.state.currentExchange);
      }

    }

    toggleCurrencyPairing () {

    }

    handleChange = (selectedOption) => {
      this.setState({ selectedOption, currentSymbol: selectedOption.value});
    }

    handleOrderInput = (event) => {
      this.setState({setAmount:parseFloat(event.target.value) })
    }

    setNewPriceLimit = (event) => {
      //var price = this.state.tickerLast * parseFloat(event.target.value);
      this.setState({setPriceLimit: parseFloat(event.target.value)})
    }

    setMarketOrLimit = (val) => {
      console.log(val);
      if(val === "market") {
        document.getElementById("marketDiv").style.backgroundColor = "blue";
        document.getElementById("limitDiv").style.backgroundColor = "white";
        document.getElementById("bestPrice").style.display = "none";
      }
      if(val === "limit") {
        document.getElementById("marketDiv").style.backgroundColor = "white";
        document.getElementById("limitDiv").style.backgroundColor = "blue";
        document.getElementById("bestPrice").style.display = "block";
      }

      this.setState({marketOrLimit: val });
    }

    setBuyOrSell = (val) => {
      console.log(val);

      if(val === "buy") {
        document.getElementById("buyDiv").style.backgroundColor = "#2ecc71";
        document.getElementById("sellDiv").style.backgroundColor = "white";
      } else {
        document.getElementById("buyDiv").style.backgroundColor = "white";
        document.getElementById("sellDiv").style.backgroundColor = "#e67e22";
      }
      this.setState({buyOrSell: val})

    }

    placeOrder () {
      //alert("Note, that some exchanges will not accept market orders (they allow limit orders only).");
      let exchange = new ccxt[this.state.currentExchange]   ({ // ... or new ccxt[this.state.currentExchange]  ()
          'apiKey': this.state.currentApiKey, // standard
          'secret': this.state.currentSecretKey,
          'password': this.state.currentPassword, //  requires a password!
      })

      if(this.state.marketOrLimit === "market") {
        if(this.state.buyOrSell === "buy") {
          //.createMarketBuyOrder (this.state.currentSymbol, this.state.total)
          alert("market order currently disabled");
        }
        if(this.state.buyOrSell === "sell") {
          //exchange.createMarketSellOrder (this.state.currentSymbol, this.state.total)
          alert("market order currently disabled");
        }
      }

      if(this.state.marketOrLimit === "limit") {
        if(this.state.buyOrSell === "buy") {
          exchange.createLimitSellOrder (this.state.currentSymbol, this.setPriceLimit, this.state.total)
          exchange.createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })

        }
        if(this.state.buyOrSell === "sell") {
          exchange.createLimitSellOrder (this.state.currentSymbol, this.state.total)

        }
      }
    }

    async setSymbols(eid) {
      let exchange = new ccxt[eid] ({
      })
      let markets = await exchange.loadMarkets ()
      // make a table of all markets
      let symbolsTable =  ccxt.sortBy (Object.values (markets), 'symbol');

      var symbols = []

      for(var i in symbolsTable) {

          var item = symbolsTable[i];

          symbols.push({
              "value" : item.symbol,
              "label"  : item.symbol,
          });
      }

      console.log(symbols);


      this.setState({allSymbols: symbols,currentSymbol:symbols[0].value});

    }

    handleExchangeSelection = (selectedOption2) => {
      this.setState({selectedOption2, currentExchange: selectedOption2.value});
    }

    setApiKey = (event) => {
      this.setState({currentApiKey:event.target.value })
    }
    setSecretKey = (event) => {
      this.setState({currentSecretKey:event.target.value })
    }
    setPassword = (event) => {
      this.setState({currentPassword:event.target.value })
    }

    loadExchange() {
      this.fetchChart();
      this.fetchBalance();
      this.setState({loadExchange: true})
    }

    render() {
        if(this.state.data) {
          var config = {
            rangeSelector: {
                selected: 1
            },

            title: {
                text: this.state.currentSymbol.toUpperCase() + " OHLC - " + this.state.currentSymbol
            },
            series: [{
                name: this.state.currentSymbol.toUpperCase() + " OHLC - " + this.state.currentSymbol,
                data: this.state.data,
                dataGrouping: {

                }
            }]
          }
        }

        const { selectedOption,selectedOption2 } = this.state;
      	//const value = selectedOption && selectedOption.value;
        return (
            <div style={{padding:'30px'}} className="container table-dark">
              {this.state.loadExchange == false ?

                <div>
                  <div className="row">
                    <div className="col-sm-12">
                    <label> Select an exchange to begin trading </label>
                      <Select
                        name="form-field-name"
                        value={selectedOption2}
                        onChange={this.handleExchangeSelection}
                        options={[
                          { value: 'gdax', label: 'GDAX' },
                          { value: 'cryptopia', label: 'Cryptopia' },
                          { value: 'kucoin', label: 'Kucoin' },
                          { value: 'poloniex', label: 'Poloniex' },
                          { value: 'bittrex', label: 'Bittrex' },

                        ]}
                      />
                    </div>
                  </div>
                  <br/>
                  <div className="row" style= {{marginTop: '10vh'}}>
                    <div className="col-sm-4">
                      <label> API Key </label><br/>
                      <input style={{color: '#232323', marginTop:'5vh'}}  onChange={this.setApiKey}  type="text" className="form-input" />
                    </div>
                    <div className="col-sm-4">
                      <label> Secret Key </label><br/>
                      <input style={{color: '#232323', marginTop:'5vh'}}  onChange={this.setSecretKey}  type="text"  className="form-input" />
                    </div>
                    <div className="col-sm-4">
                      <label> Password (should only be for gdax) </label><br/>
                      <input style={{color: '#232323', marginTop:'5vh'}}  onChange={this.setPassword}  type="text"  className="form-input" />
                    </div>
                  </div>
                  <br/>
                  <div className="row" style= {{marginTop: '10vh'}}>
                    <div className="col-sm-3">
                      <button className="btn btn-default" onClick={this.loadExchange}> Load Exchange </button>
                    </div>
                  </div>
                </div>
                :
                <div>
                  <div className="row">
                    <div style={{marginBottom: '5vh'}} className="col-md-4 pull-left">
                    <Select
                      name="form-field-name"
                      value={selectedOption}
                      onChange={this.handleChange}
                      options={this.state.allSymbols}
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
                      :
                      <div>Loading...</div>
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
                          <button className="col-sm-6 btn  "  id="marketDiv" onClick = {() => this.setMarketOrLimit("market")}>Market</button>
                          <button className="col-sm-6 btn  text-gray bg-dark" id="limitDiv"  onClick = {() => this.setMarketOrLimit("limit")} >Limit</button>
                        </div>
                        <div className=" px-1">
                          <button className="col-sm-6 btn " id="buyDiv" onClick = {() => this.setBuyOrSell("buy")} >Buy</button>
                          <button className="col-sm-6 btn  text-gray bg-dark" id="sellDiv" onClick = {() => this.setBuyOrSell("sell")} >Sell</button>
                        </div>

                        <div style={{marginTop:'5vh', marginBottom:'5vh', display:'inline-block'}} className="form-group">

                            <div className=" px-1"><label className="form-label text-light">Amount {this.state.currentSymbol.slice(0,3)}</label>
                              {/*<button className="btn btn-order btn-nofocus m-2">Max</button>*/}
                            </div>
                            <input style={{color: '#232323'}}  onChange={this.handleOrderInput}  type="number" step="any" className="form-input" />

                            <div id="bestPrice" style={{display:'none'}} className=" px-1">
                              <label style={{marginTop:'2vh'}} className="form-label text-light">Best Price: {this.state.bestSomething}</label>
                              <hr/>
                              <label style={{marginTop:'2vh'}} className="form-label text-light">Set Price Limit </label>
                              <input style={{color: '#232323'}}  onChange={this.setNewPriceLimit}  type="number" step="any" className="form-input" />

                            </div>
                        </div>
                        <br/>
                        <hr/>
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
                            <th scope="col">{this.state.currentSymbol} - Ask</th>
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
                            <th scope="col">{this.state.currentSymbol} - Bid</th>
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
                    :
                    <div> Loading... </div>
                  }
                  </div>
                </div>
              }
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
