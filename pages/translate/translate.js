// pages/translate/translate.js
var CryptoJS = require("../../utils/Crypto");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    origin_info: "",
    result_info: "",
  },

  change_origin: function (e) {
    const res = e.detail.value;
    this.setData({
      origin_info: res,
    });
  },

  translate: function () {
    const temp = this.data.origin_info;

    //下方为原api,不知什么时候会过期

    var urlParams =
      "https://fanyi.youdao.com/openapi.do?keyfrom=f2ec-org&key=1787962561&type=data&doctype=json&version=1.1&q=";
    wx.request({
      url: urlParams + temp,
      // data: params.data,
      header: { "content-type": "application/x-www-form-urlencoded" },
      method: "GET",
      success: (res) => {
        const resData = res.data.basic;
        if (resData) {
          this.setData({
            result_info: resData.explains[0],
          });
        } else {
          this.setData({
            result_info: "sorry,暂无该翻译,我们会很快完善",
          });
        }
      },
    });

    //如果过期了使用这个，但是需要付费

    // var appKey = "6d61952fcf4ee912";
    // var key = "Tb2ZZv5gmu8YMVXjx2j6Qgm62Cil0ldw"; //注意：暴露appSecret，有被盗用造成损失的风险
    // var salt = new Date().getTime();
    // var curtime = Math.round(new Date().getTime() / 1000);
    // var query = temp;
    // // var query = '您好，欢迎再次使用有道智云文本翻译API接口服务';
    // // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    // var str1 = appKey + truncate(query) + salt + curtime + key;
    // var vocabId = "您的用户词表ID";
    // var sign = CryptoJS.SHA256(str1).toString();
    // wx.request({
    //   url: "http://openapi.youdao.com/api",
    //   type: "post",
    //   header: { "content-type": "application/x-www-form-urlencoded" },
    //   dataType: "jsonp",
    //   data: {
    //     q: query,
    //     appKey: appKey,
    //     salt: salt,
    //     sign: sign,
    //     signType: "v3",
    //     curtime: curtime,
    //     strict: false,
    //     vocabId: vocabId,
    //   },
    //   success: (res) => {
    //     var result = JSON.parse(res.data);
    //     console.log(result);
    //     this.setData({
    //       result_info: result.translation,
    //     });
    //   },
    // });

    // function truncate(q) {
    //   var len = q.length;
    //   if (len <= 20) return q;
    //   return q.substring(0, 10) + len + q.substring(len - 10, len);
    // }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
