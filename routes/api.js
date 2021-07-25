
'use strict';
const axios = require('axios');

const Stock = require('../models/Stock');

async function getPrice(symbol) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
  
    const res = await axios.get(url).catch(e=>console.log(e));
    const price = await res.data.latestPrice;
  
  const data =  {stock:symbol, price:price};

  return data;
}


async function getLikes(symbol, ip, isLiked) {

  //TODO: find data if exist
  const data = await Stock.findOne({stock: symbol}).catch(e=>console.log(e));

   //TODO: if data && isLiked 
  //if ip exist return likes
  //else add address return likes
  //TODO: if data && !isLiked return likes
  if(data){
    if(isLiked) {
      if(data.likes.indexOf(ip) == -1) {
      
        const myQuery = {stock:symbol} ;
        const newValues = { $push: { likes: [ip] } };
        const options = {new: true};
        const newData = await Stock.findOneAndUpdate(myQuery,newValues,options).catch(e=>console.log(e));
        
        return {likes : newData.likes.length};
      } else return {likes : data.likes.length};
    } else return {likes : data.likes.length};   
  }

  //TODO: if !data && isLiked create new like, return like 1
  //TODO: if !data && !isLiked create new like, return like 0
  else{

    const address = isLiked ? ip : [];
    
    const newStock = new Stock({
      stock:symbol,
      likes: address
    });

    const data = await newStock.save().catch(e=>console.log(e));

    return {likes : data.likes.length};

  }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function ({ip, query}, res){
      
      //if returns single item convert it to array state
      const stocks = Array.isArray(query.stock) ? query.stock : [query.stock];
      const isLiked = query.like;

      (async () => { 
      let data = await Promise.all(
        stocks.map(
          async symbol => {
            const price = await getPrice(symbol).catch(e=>console.log(e));
            const like = await getLikes(symbol, ip, isLiked).catch(e=>console.log(e));
            
            let stockData = price;
            
            stockData.price ?
              stockData.likes = like.likes : stockData = like;
            
            return stockData;
      })).catch(e=>console.log(e));
    
    //if single remove to array state
    if(data.length > 1) {
      const stockLikes = data.map( val => {
        
        return val.likes;  
      });
      
      //swap array
      [stockLikes[0], stockLikes[1]] = [stockLikes[1],stockLikes[0]];

      data = data.map( (val, index) =>{
        val.rel_likes = val.likes -stockLikes[index] ;
        delete val.likes;
        
        return val;
      })

      } else {
      data = data[0];
    }
    res.send({stockData:data});
      }) ();
    });
  
    
};