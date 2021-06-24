// pages/login/login.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkSessionAndLogin();
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

  //以下部分为微信登录模块

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
          });
          that.getUserInfoFromServer(thisOpenId);
        },
        fail: function () {
          console.log("but session_key expired");
          // session_key 已经失效，需要重新执行登录流程
          wx.removeStorageSync("openid");
          that.setData({
            isLogin: false,
          });
          that.checkSessionAndLogin();
        },
      });
    } else {
      // 没有进行登录则先进行登录操作
      console.log("do not have openid");
      that.setData({
        isLogin: false,
      });
      that.loginAndGetOpenid();
    }
  },
  // 执行登录操作并获取用户openId
  loginAndGetOpenid: function () {
    var that = this;
    var openId;
    wx.login({
      success: function (res) {
        openId = res.data;
        if (res.code) {
          console.log(res.code);
          wx.request({
            url: "http://localhost:8080/login/onLogin",
            data: {
              code: res.code,
            },
            success: function (res) {
              console.log(res);
              // 保存openId，并将用户信息发送给后端
              that.setData({
                isLogin: true,
              });
              openId = res.data;
              wx.setStorageSync("openid", openId);
              if (res.statusCode === 200) {
                // wx.showModal({
                //   title: "set openid",
                //   content: res.data,
                // });
                // 判断这个用户是否是第一次进入小程序，如果是的话将用户信息存入数据库
                that.isUserExistReturnBool(res.data).then(function (data) {
                  var flag = data;
                  console.log(flag);
                  if (!flag) {
                    console.log("从来没登陆过，将用户信息传入数据库");
                    wx.getUserInfo({
                      success: function (res) {
                        var userInfo = res.userInfo;
                        console.log(userInfo);
                        wx.request({
                          url: "http://localhost:8080/user/register",
                          data: {
                            avatarurl: userInfo.avatarUrl,
                            city: userInfo.city,
                            country: userInfo.country,
                            gender: userInfo.gender,
                            nickname: userInfo.nickName,
                            province: userInfo.province,
                            openId: openId,
                          },
                          success: function (res) {
                            console.log(res);
                            console.log("注册成功");
                          },
                          complete: function () {
                            that.getUserInfoFromServer(openId);
                          },
                        });
                      },
                    });
                  }
                  //如果登陆过直接将userinfo展示
                  else {
                    console.log("登陆过直接展示");
                    that.getUserInfoFromServer(openId);
                  }
                });

                // that.sendUserInfoToServer();
              } else {
                wx.showModal({
                  title: "Sorry",
                  content: "用户登录失败~",
                });
              }
            },
            complete: function () {},
          });
        }
      },
    });
  },

  // 判断用户是否存在
  isUserExistReturnBool(open_id) {
    var code;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: "http://localhost:8080/user/isUserExist",
        data: {
          open_id: open_id,
        },
        success: function (res) {
          var res = res.data;
          code = res.code;
        },
        fail: function () {
          wx.showModal({
            title: "ERROR",
            content: "服务器请求失败!",
          });
          reject(error);
        },
        complete: function () {
          if (code === 200) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  },

  getUserInfoFromServer: function (open_id) {
    var that = this;
    wx.request({
      url: "http://localhost:8080/user/getUserInfoByOpenId",
      data: {
        openid: open_id,
      },
      success: function (res) {
        var userInfo = res.data;
        wx.setStorageSync("userInfo", userInfo);
        that.setData({
          userInfo: userInfo,
        });
      },
    });
  },

  // sendUserInfoToServer: function () {
  //   console.log("now send user info to server");
  //   let userInfo = wx.getStorageSync("userInfo");
  //   let thisOpenId = wx.getStorageSync("openid");

  //   userInfo.openid = thisOpenId;

  //   wx.request({
  //     url: Domain + "/user/updateUser",
  //     method: "POST",
  //     dataType: "json",
  //     data: userInfo,
  //     success: function (res) {
  //       res = res.data;
  //       if (res.code === 0) {
  //         // wx.navigateBack({});
  //       } else {
  //         wx.showModal({
  //           title: "Sorry",
  //           content: "同步信息出错~",
  //         });
  //       }
  //     },
  //   });
  // },
});
