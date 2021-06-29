// pages/learn/learn.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    content: null,
    note: null,
    isLogin: false,
    isSignIn: false,
  },

  //今天签到
  SignInToday: function () {
    var that = this;
    var userInfo = that.data.userInfo;
    wx.showModal({
      title: "签到确认",
      content: "确定要签到?",
      showCancel: true, //是否显示取消按钮
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "request",
            data: {
              url: "sign/SignInToday",
              data: {
                user_id: userInfo.id,
              },
            },
            success: function (res) {
              var title;
              var res = res.result;
              // console.log(res);
              title = res.msg;
              that.setData({
                isSignIn: true,
              });
              wx.showToast({
                title: title, //提示文字
                duration: 500, //显示时长
                mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false
                icon: res.code == 200 ? "success" : "error", //图标，支持"success"、"loading"
              });
            },
          });
        }
      },
    });
  },

  //检查今天是否签到过
  CheckIsSignIn: function () {
    // 检查是否已经签到
    var that = this;
    return new Promise(function (resolve, reject) {
      if (!that.data.isLogin) {
        console.log("还没登录,无法查看是否签到");
        return;
      } else {
        console.log("已经登陆,进行签到检查");
        var userInfo = that.data.userInfo;
        wx.cloud.callFunction({
          name: "request",
          data: {
            url: "sign/isSignInToday",
            data: {
              user_id: userInfo.id,
            },
          },
          success: function (res) {
            var res = res.result;
            console.log(res);
            if (res.code === -1) {
              that.setData({
                isSignIn: true,
              });
            }
          },
          complete: function () {
            resolve();
          },
        });
      }
    });
  },

  //检查是否登录
  checkSessionAndLogin: function () {
    let that = this;
    let thisOpenId = wx.getStorageSync("openid");
    // 已经进行了登录，检查登录是否过期
    if (thisOpenId) {
      console.log("have openid");
      wx.checkSession({
        success: function () {
          //session_key 未过期，并且在本生命周期一直有效
          that.setData({
            isLogin: true,
            userInfo: wx.getStorageSync("userInfo"),
          });
          that.CheckIsSignIn();
        },
        fail: function () {
          console.log("but session_key expired");
          // session_key 已经失效，需要重新执行登录流程
          wx.removeStorageSync("openid");
          that.setData({
            isLogin: false,
          });
        },
      });
    } else {
      // 没有进行登录则先进行登录操作
      console.log("do not have openid");
      that.setData({
        isLogin: false,
      });
      // that.loginAndGetOpenid();
    }
  },

  learnBtn: function (options) {
    var that = this;
    var isLogin = that.data.isLogin;
    if (!isLogin) {
      wx.showModal({
        title: "ERROR",
        content: "您还没有登录或登录已经过期",
        showCancel: false,
        confirmText: "前往登录",
        confirmColor: "#3CC51F",
        success: (result) => {
          if (result.confirm) {
            wx.switchTab({
              url: "../user/user",
            });
          }
        },
      });
    } else {
      wx.navigateTo({
        url: "../words/words",
      });
    }
  },

  //获取每日一句
  getEveryDayNode: function () {
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
    // console.log(url);
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.init();
    this.getEveryDayNode();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.checkSessionAndLogin();
  },

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
