// 云函数入口文件
const cloud = require("wx-server-sdk");
cloud.init();
var rp = require("request-promise");

var URLhead = "http://139.198.171.181:8080/";
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  var option = {
    method: "POST",
    uri: URLhead + event.url,
    body: event.data,
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
