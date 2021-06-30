// pages/review/review.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hideFlag: true, //true-隐藏  false-显示
    rightFlag: false,
    current_word: null,
    userInfo: null,
    inputWord: null,
    inputRightFlag: true,
    inputValue: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.cloud.init();

    that.setData({
      userInfo: wx.getStorageSync("userInfo"),
    });
    that.getCompleteWord();
    // this.showModal();
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

  //还未开发的设置功能
  setting:function(){
    wx.showModal({
      title: 'SORRY',
      content: '该功能开发中,敬请期待',
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#3CC51F',
    });
  },

  //对比用户输入的单词进行比对
  submitTestWord: function () {
    let that = this;
    let inputWord = that.data.inputWord;
    let rightWord = that.data.current_word.word;
    if (inputWord === rightWord) {
      that.showModal();
    } else {
      that.setData({
        inputRightFlag: false,
        rightFlag: false,
      });
    }
  },

  //从服务器中获取完成单词
  getCompleteWord: function () {
    let that = this;
    let userInfo = that.data.userInfo;
    that.setData({
      rightFlag: false,
      inputValue: "",
    });
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: "request",
        data: {
          url: "word/getCompleteWordByUserId",
          data: {
            user_id: userInfo.id,
          },
        },
        success: function (res) {
          var res = res.result;
          that.setData({
            current_word: res,
          });
          that.symbol_play();
        },
      });
    });
  },

  //获取input输入框中的值
  changeTestWord: function (event) {
    let that = this;
    that.setData({
      inputRightFlag: true,
      inputWord: event.detail.value,
    });
  },

  // 点击音标播放声音
  symbol_play: function () {
    const innerAudioContext = wx.createInnerAudioContext();
    var url =
      "https://fanyi.baidu.com/gettts?lan=uk&text=" +
      this.data.current_word.word +
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
      this.data.current_word.ex +
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

  //取消
  mCancel: function () {
    var that = this;
    that.getCompleteWord();
    that.hideModal();
  },

  // ----------------------------------------------------------------------modal
  // 显示遮罩层
  showModal: function () {
    var that = this;
    that.setData({
      hideFlag: false,
      rightFlag: true,
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
