const fetch = require("node-fetch");

function StockHandler() {
  this.getPrice = async function(stockName) {
    let price;
    await fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stockName}/quote`)
      .then(response => response.json())
      .then(data => {
        price = Number(data.latestPrice).toFixed(2);
      });
    return price;
  };

  this.getIp = function(req) {
    return req.header("x-forwarded-for")
      ? req.header("x-forwarded-for").split(",")[0] : "";
  };

  this.getOneWithoutLike = async function(stock, db) {
    stock = stock.toUpperCase();
    try {
      if (!await db.collection("stock").findOne({ _id: stock })) {
        await db.collection("stock").insert({ _id: stock, ips: [] });
      }
      let result = await db
        .collection("stock")
        .aggregate([
          { $match: { _id: stock } },
          { $project: { _id: 0, stock: "$_id", likes: { $size: "$ips" } } }
        ])
        .toArray();
      return result;
    } catch (err) {
      console.log(err);
    }
  };

  this.getOneWithLike = async function(stock, db, ip) {
    stock = stock.toUpperCase();
    try {
      if (!await db.collection("stock").findOne({ _id: stock })) {
        await db.collection("stock").insert({ _id: stock, ips: [] });
      }
      await db
        .collection("stock")
        .update({ _id: stock }, { $addToSet: { ips: ip } });
      var result = await db
        .collection("stock")
        .aggregate([
          { $match: { _id: stock } },
          { $project: { _id: 0, stock: "$_id", likes: { $size: "$ips" } } }
        ])
        .toArray();
      return result;
    } catch (err) {
      console.log(err);
    }
  };
}
module.exports = StockHandler;