// pages/complete_word_list/complete_word_list.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    wordlist: null,
    complete_word_list: null,
    show_info_word: null,
    hideFlag: true, //true-隐藏  false-显示
    queryWord: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.cloud.init();
    var userInfo = wx.getStorageSync("userInfo");
    that.setData({
      userInfo: userInfo,
    });
    wx.showLoading({
      title: "加载单词数据中",
      mask: true,
    });

    //请求单词数据
    that.getCompleteWordsFromServer().then(function (res) {
      console.log(res);
      that.setData({
        complete_word_list: res.result,
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 500);
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

  //从服务器中获取学习完的单词
  getCompleteWordsFromServer: function () {
    var that = this;
    var userInfo = that.data.userInfo;
    var queryWord = that.data.queryWord;
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: "request",
        data: {
          url: "word/getCompleteWordsByUserId",
          data: {
            user_id: userInfo.id,
            query: queryWord,
          },
        },
        success: function (res) {
          resolve(res);
        },
        fail: function (err) {
          console.log(err);
          reject(err);
        },
      });
    });
  },

  deleteWord: function (event) {
    let that = this;
    let index = event.currentTarget.dataset.index;
    let user_id = that.data.complete_word_list[index].userId;
    let word_id = that.data.complete_word_list[index].wordId;

    wx.showModal({
      title: "提示",
      content: "你确定要删除该单词吗?删除后该单词会重新加入学习计划",
      showCancel: true,
      cancelText: "取消",
      confirmText: "确定",
      confirmColor: "#3CC51F",
      success: (result) => {
        if (result.confirm) {
          wx.cloud.callFunction({
            name: "request",
            data: {
              url: "word/deleteCompleteWord",
              data: {
                user_id: user_id,
                word_id: word_id,
              },
            },
            success: function (res) {
              let resultObj = res.result;
              let icon;
              if (resultObj.code === 200) {
                icon = "success";
              } else {
                icon = "error";
              }
              wx.showToast({
                title: resultObj.msg,
                icon: icon,
                duration: 1500,
                mask: true,
              });

              that.search_word();
            },
            fail: function (err) {
              console.log("请求错误");
              wx.showToast({
                title: "服务器请求失败",
                icon: "error",
                duration: 1500,
                mask: true,
              });
            },
          });
        }
      },
    });
  },

  //更换搜索关键词
  changeQueryWord: function (event) {
    let queryWord = event.detail.value;
    this.setData({
      queryWord: queryWord,
    });
  },

  //搜索单词
  search_word: function () {
    var that = this;
    wx.showLoading({
      title: "加载单词数据中",
      mask: true,
    });
    that.getCompleteWordsFromServer().then(function (res) {
      that.setData({
        complete_word_list: res.result,
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 500);
    });
  },

  // 点击音标播放声音
  symbol_play: function () {
    const innerAudioContext = wx.createInnerAudioContext();
    var url =
      "https://fanyi.baidu.com/gettts?lan=uk&text=" +
      this.data.show_info_word.word +
      "&spd=3&source=web";
    innerAudioContext.src = url;
    innerAudioContext.onPlay(() => {
      console.log("开始播放");
    });
    innerAudioContext.onError((res) => {
      console.log(res.errMsg);
      console.log(res.errCode);
    });
    innerAudioContext.play();
  },
  //播放例句
  playex() {
    const innerAudioContext = wx.createInnerAudioContext();
    var url =
      "https://fanyi.baidu.com/gettts?lan=uk&text=" +
      this.data.show_info_word.ex +
      "&spd=3&source=web";
    innerAudioContext.src = url;
    innerAudioContext.onPlay(() => {
      console.log("开始播放");
    });
    innerAudioContext.onError((res) => {
      console.log(res.errMsg);
      console.log(res.errCode);
    });
    innerAudioContext.play();
  },

  //弹出下拉框，获取单词信息
  getInfo: function (event) {
    let index = event.currentTarget.dataset.index;
    let complete_word_list = this.data.complete_word_list;
    console.log(index);
    this.setData({
      show_info_word: complete_word_list[index].word,
    });
    this.showModal();
  },

  // 上拉框代码
  //取消
  mCancel: function () {
    var that = this;
    that.changeCurrentWord();
    that.hideModal();
  },

  // ----------------------------------------------------------------------modal
  // 显示遮罩层
  showModal: function () {
    var that = this;
    that.setData({
      hideFlag: false,
    });
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间
      timingFunction: "ease", //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    });
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn(); //调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100);
  },

  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间 默认400ms
      timingFunction: "ease", //动画的效果 默认值是linear
    });
    this.animation = animation;
    that.slideDown(); //调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        hideFlag: true,
      });
      clearTimeout(time1);
      time1 = null;
    }, 220); //先执行下滑动画，再隐藏模块
  },
  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step(); // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export(),
    });
  },
  //动画 -- 滑出
  slideDown: function () {
    this.animation.translateY(300).step();
    this.setData({
      animationData: this.animation.export(),
    });
  },
});
