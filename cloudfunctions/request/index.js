// 云函数入口文件
const cloud = require("wx-server-sdk");
cloud.init();
var rp = require("request-promise");

var URLhead = "http://localhost:8080/";
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  var option = {
    uri: URLhead + event.url,
    qs: event.data,
    json: true,
  };
  console.log(option);
  return rp(option)
    .then(function (res) {
      console.log(res);
      return res;
    })
    .catch(function (err) {
      console.log(err);
      var result = {
        code: -1,
        msg: err,
      };
      return result;
    });
};
