// pages/learn/learn.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    content: null,
    note: null,
  },
  learnBtn: function (options) {
    wx.navigateTo({
      url: "../words/words",
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var time = new Date();
    time.setTime(time.getTime());
    var year = time.getFullYear();
    var month = time.getMonth();
    var day = time.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (day >= 0 && day <= 9) {
      day = "0" + day;
    }
    var url =
      "https://sentence.iciba.com/index.php?c=dailysentence&m=getdetail&title=" +
      year +
      "-" +
      month +
      "-" +
      day;
    console.log(url);
    var reqTask = wx.request({
      url: url,
      method: "GET",
      success: (result) => {
        console.log(result);
        this.setData({
          content: result.data.content,
          note: result.data.note,
        });
      },
    });
  },

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
