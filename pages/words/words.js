// pages/words/words.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 准备学习的单词
    waittingnode: 1,
    // 学完的单词
    waiting_word: [],
    //现在在学的单词
    complete_word: [],
    current_word: {},
    RightId: 0,
    ErrorId: ["", "", "", ""],
    options: [],
    learnCountIcon: ["display:none", "display:none", "display:none"],
    answerbtn: "clickAnswer",
    reuqestNumber: 10,
    hideFlag: true, //true-隐藏  false-显示
    animationData: {}, //
    rightFlag: false,
    userInfo: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.init();
    this.setData({
      userInfo: wx.getStorageSync("userInfo"),
    });
    this.getWords(this.data.reuqestNumber);
    /* seting watting_word */
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
  setting: function () {
    wx.showModal({
      title: "SORRY",
      content: "该功能开发中,敬请期待",
      showCancel: false,
      confirmText: "确定",
      confirmColor: "#3CC51F",
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

  // 学习完了，跳转到学习完成页
  learnComplete: function () {
    var that = this;
    var complete_wordList = [];
    var complete_word = this.data.complete_word;
    var userInfo = this.data.userInfo;
    for (var i = 0; i < complete_word.length; i++) {
      var word = {
        word_id: complete_word[i].id,
        user_id: userInfo.id,
      };
      complete_wordList.push(word);
    }
    //上传学习完的单词数据
    wx.cloud.callFunction({
      name: "request_post",
      data: {
        url: "word/learnCompleteWordsByIds",
        data: {
          words: complete_wordList,
        },
      },
      success: function (res) {
        var res = res.result;
        console.log(res);
        if (res.code != 200) {
          wx.showModal({
            title: "ERROR",
            content: "服务器请求错误",
            showCancel: false,
            confirmText: "确定",
            confirmColor: "#3CC51F",
            success: (result) => {
              if (result.confirm) {
                wx.switchTab({
                  url: "../learn/learn",
                });
              }
            },
          });
        } else {
          wx.redirectTo({
            url:
              "../words_complete/words_complete?requestNumber=" +
              that.data.reuqestNumber,
          });
        }
      },
      fail: function () {
        wx.showModal({
          title: "ERROR",
          content: "服务器请求错误",
          showCancel: false,
          confirmText: "确定",
          confirmColor: "#3CC51F",
          success: (result) => {
            if (result.confirm) {
              wx.switchTab({
                url: "../learn/learn",
              });
            }
          },
        });
      },
      complete: function () {
        console.log("completeWord!!");
      },
    });
  },

  //向服务器获取选项数据
  getOptions: function (word) {
    var that = this;
    wx.cloud.callFunction({
      name: "request",
      data: {
        url: "word/getAnswersByWords",
        data: {
          word: word,
        },
      },
      success: (res) => {
        var res = res.result;
        console.log(res);
        that.setData({
          options: res.means,
          RightId: res.rightIndex,
        });
      },
    });
  },

  //下一单词
  changeCurrentWord: function () {
    // 正确页面跳转之后
    var current_word = this.data.current_word;
    var waitting_word = this.data.waiting_word;
    var complete_word = this.data.complete_word;
    var waittingnode = this.data.waittingnode;
    var reuqestNumber = this.data.reuqestNumber;
    var learnCountIcon = ["display:none", "display:none", "display:none"];
    // 将按钮全部恢复原样
    this.setData({
      ErrorId: ["", "", "", ""],
    });
    current_word.learnCount += 1;
    if (current_word.learnCount == 3) {
      complete_word.push(current_word);
    } else {
      waitting_word.push(current_word);
    }
    // 这组单词学完了，然后进行数据处理（将学完的单词上传到数据库统计），跳转到学习成功页，
    if (complete_word.length === reuqestNumber) {
      console.log("学完了");
      that.learnComplete();
      return;
    }
    current_word = waitting_word[waittingnode];
    waittingnode++;
    // 更换单词选项
    this.getOptions(current_word.word);
    for (var i = 0; i < current_word.learnCount; i++) {
      learnCountIcon[i] = "";
    }
    this.setData({
      current_word: current_word,
      waitting_word: waitting_word,
      complete_word: complete_word,
      waittingnode: waittingnode,
      answerbtn: "clickAnswer",
      learnCountIcon: learnCountIcon,
      rightFlag: false,
    });
    this.symbol_play();
  },

  //点击选项按钮
  clickAnswer(event) {
    let id = event.currentTarget.dataset.id;
    console.log(id);
    var ErrorId = this.data.ErrorId;
    if (id != this.data.RightId) {
      ErrorId[id] = "warn";
      this.setData({
        ErrorId: ErrorId,
      });
    } else {
      wx.showToast({
        title: "选择正确",
        icon: "success",
        duration: 500,
        mask: false,
        success: (result) => {},
        fail: () => {},
        complete: () => {
          // 让按钮不可以点击,防止多次触发
          this.setData({
            answerbtn: "",
            rightFlag: true,
          });
          // 弹出下拉框
          this.showModal();
        },
      });
    }
  },

  //从服务器中获取单词
  getWords: function (number) {
    var that = this;
    let userInfo = this.data.userInfo;
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    wx.cloud.callFunction({
      name: "request",
      data: {
        url: "word/getWordsByNumber",
        data: {
          user_id: userInfo.id,
          number: number,
        },
      },
      success: function (res) {
        console.log("调用成功");
        console.log(res);
        that.setData({
          waiting_word: res.result,
          current_word: res.result[0],
        });
        that.getOptions(that.data.current_word.word);
        that.symbol_play();
        wx.hideLoading();
      },
      fail: function (err) {
        console.log("调用失败");
        wx.hideLoading();
        wx.showToast({
          title: "单词数据请求失败",
          icon: "error",
          duration: 1500,
          mask: true,
          complete: () => {
            setTimeout(function () {
              wx.navigateBack({
                delta: 1,
              });
            }, 1000);
          },
        });
      },
      complete: function (res) {
        console.log("调用结束");
        console.log(res);
      },
    });

    //因为微信不能对没有域名的服务器进行请求，所以转成再云函数中对没有域名的服务器进行请求，
    //然后就可以让代码上线，很卑微，为此我将之前写的代码全部重构。。。。。

    // wx.request({
    //   url: "http://localhost:8080/",
    //   data: { number: number },
    //   header: { "content-type": "application/json" },
    //   method: "GET",
    //   dataType: "json",
    //   success: (result) => {
    //     // console.log(result);
    //     this.setData({
    //       waiting_word: result.data,
    //       current_word: result.data[0],
    //     });
    //   },
    //   fail: () => {
    //     console.log("请求单词数据失败");
    //   },
    //   complete: () => {
    //     this.getOptions(this.data.current_word.word);
    //     this.symbol_play();
    //   },
    // });
  },

  deleteWord() {
    var that = this;
    wx.showModal({
      title: "草莓酱英语",
      content: "确认已掌握该单词?",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          console.log("点击确认回调");
          console.log(that);
          var current_word = that.data.current_word;
          var waitting_word = that.data.waiting_word;
          var complete_word = that.data.complete_word;
          var waittingnode = that.data.waittingnode;
          var reuqestNumber = that.data.reuqestNumber;
          var learnCountIcon = ["display:none", "display:none", "display:none"];
          complete_word.push(current_word);
          if (complete_word.length === reuqestNumber) {
            console.log("学完了");
            that.learnComplete();
            return false;
          }
          current_word = waitting_word[waittingnode];
          waittingnode++;
          // 更换单词选项
          that.getOptions(current_word.word);
          // 如果waittingnode = waitting_word.length
          // 这组单词学完了，然后进行数据处理（将学完的单词上传到数据库统计），跳转到学习成功页，
          for (var i = 0; i < current_word.learnCount; i++) {
            learnCountIcon[i] = "";
          }
          that.setData({
            current_word: current_word,
            waitting_word: waitting_word,
            complete_word: complete_word,
            waittingnode: waittingnode,
            answerbtn: "clickAnswer",
            learnCountIcon: learnCountIcon,
          });
          that.symbol_play();
        } else {
          console.log("点击取消回调");
        }
      },
    });
  },

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
      duration: 300, //动画的持续时间
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
