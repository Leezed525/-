// pages/login/login.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: null,
    isSignIn: false,
    SignDaysFromLastDay: 0,
    SignDaysFromToday: 0,
    completeWordsNumber: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.init();
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

  //跳转到单词列表
  toCompleteWordList: function () {
    wx.navigateTo({
      url: "../complete_word_list/complete_word_list",
    });
  },

  //获取该用户到现在为止学了多少个单词
  getCompleteWordsNumber: function () {
    var that = this;
    var user_id = that.data.userInfo.id;
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: "request",
        data: {
          url: "word/getCompleteWordsNumberByUser_id",
          data: {
            user_id: user_id,
          },
        },
        success: function (res) {
          var res = res.result;
          // console.log(res);
          that.setData({
            completeWordsNumber: res,
          });
        },
        complete: function () {
          resolve();
        },
      });
    });
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
              that.getSignDaysFromToday();
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

  //到今天为止的签到天数
  getSignDaysFromToday: function () {
    var that = this;
    wx.cloud.callFunction({
      name: "request",
      data: {
        url: "sign/querySignInDaysToday",
        data: {
          user_id: that.data.userInfo.id,
        },
      },
      success: function (res) {
        // console.log(res);
        that.setData({
          SignDaysFromToday: res.result,
        });
      },
    });
  },

  //获取只到昨天的签到数
  getSignDaysFromLastDay: function () {
    var that = this;
    wx.cloud.callFunction({
      name: "request",
      data: {
        url: "sign/querySignInDaysLastDay",
        data: {
          user_id: that.data.userInfo.id,
        },
      },
      success: function (res) {
        console.log(res);
        // console.log(res);
        that.setData({
          SignDaysFromLastDay: res.result,
        });
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
              that.getSignDaysFromToday();
            } else {
              that.getSignDaysFromLastDay();
            }
          },
          complete: function () {
            resolve();
          },
        });
      }
    });
  },

  //以下部分为微信登录模块

  //检查是否登录和登陆是否还有效
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
          that.getUserInfoFromServer(thisOpenId).then(function (data) {
            wx.showLoading({
              title: "加载用户数据中",
              mask: true,
            });
            Promise.all([
              that.CheckIsSignIn(),
              that.getCompleteWordsNumber(),
            ]).then(function (res) {
              setTimeout(function () {
                wx.hideLoading();
              }, 500);
            });
          });
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
      // that.loginAndGetOpenid();
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
          // console.log(res.code);
          wx.cloud.callFunction({
            name: "request",
            data: {
              url: "login/onLogin",
              data: {
                code: res.code,
              },
            },
            success: function (res) {
              console.log(res);
              // 保存openId，并将用户信息发送给后端
              that.setData({
                isLogin: true,
              });
              openId = res.result;
              // 判断这个用户是否是第一次进入小程序，如果是的话将用户信息存入数据库
              that.isUserExistReturnBool(openId).then(function (data) {
                var flag = data;
                // console.log(flag);
                if (!flag) {
                  var userInfo;
                  console.log("从来没登陆过，将用户信息传入数据库");
                  wx.showModal({
                    title: "温馨提示",
                    content: "亲，授权微信登录后才能正常使用小程序功能",
                    success(res) {
                      //如果用户点击了确定按钮
                      if (res.confirm) {
                        wx.getUserProfile({
                          desc: "获取你的昵称、头像、地区及性别",
                          success: (res) => {
                            console.log("收到的用户信息为：");
                            console.log(res);
                            userInfo = res.userInfo;
                            console.log(userInfo);
                            wx.setStorageSync("openid", openId);
                            wx.cloud.callFunction({
                              name: "request",
                              data: {
                                url: "user/register",
                                data: {
                                  avatarurl: userInfo.avatarUrl,
                                  city: userInfo.city,
                                  country: userInfo.country,
                                  gender: userInfo.gender,
                                  nickname: userInfo.nickName,
                                  province: userInfo.province,
                                  openId: openId,
                                },
                              },
                              success: function (res) {
                                // console.log(res);
                                console.log("注册成功");
                              },
                              complete: function () {},
                            });
                            that.getUserInfoFromServer(openId);
                          },
                          fail: (res) => {
                            wx.showToast({
                              title: "您拒绝了请求,不能正常使用小程序",
                              icon: "error",
                              duration: 2000,
                            });
                          },
                        });
                      } else if (res.cancel) {
                        //如果用户点击了取消按钮
                        console.log(3);
                        wx.showToast({
                          title: "您拒绝了请求,不能正常使用小程序",
                          icon: "error",
                          duration: 2000,
                        });
                      }
                    },
                  });
                }
                //如果登陆过直接将userinfo展示
                else {
                  console.log("登陆过直接展示");
                  wx.setStorageSync("openid", openId);
                  that.getUserInfoFromServer(openId).then(function (res) {
                    console.log(res);
                    that.checkSessionAndLogin();
                  });
                }
              });
            },
          });
        }
      },
    });
    //再去检查是否登陆成功
  },

  // 判断用户是否存在
  isUserExistReturnBool(open_id) {
    var code;
    console.log("验证存在接受的id是" + open_id);
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: "request",
        data: {
          url: "user/isUserExist",
          data: {
            open_id: open_id,
          },
        },
        success: function (res) {
          var res = res.result;
          console.log(res);
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
            console.log("注册过");
            resolve(true);
          } else {
            console.log("没注册过");
            resolve(false);
          }
        },
      });
    });
  },

  //从服务器中获取用户信息
  getUserInfoFromServer: function (open_id) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: "request",
        data: {
          url: "user/getUserInfoByOpenId",
          data: {
            openid: open_id,
          },
        },
        success: function (res) {
          var userInfo = res.result;
          wx.setStorageSync("userInfo", userInfo);
          that.setData({
            userInfo: userInfo,
          });
          resolve(userInfo);
        },
      });
    });
  },

  // sendUserInfoToServer: function () {
  //   console.log("now send user info to server");
  //   let userInfo = wx.getStorageSync("userInfo");
  //   let thisOpenId = wx.getStorageSync("openid");

  //   userInfo.openid = thisOpenId;

  //   wx.request({
  //     url: URLhead + "/user/updateUser",
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
