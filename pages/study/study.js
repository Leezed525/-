var word_ListStatic = [
  {
    word_word: "光",
    word_PartOfSpeech: "名词",
    word_Sense: "月光",
    word_RemberedTimes: 0,
    word_RemberedTimesChange: 0,
    word_Show: false,
  },
  {
    word_word: "为",
    word_Sentence: "武陵人捕鱼为业",
    word_PartOfSpeech: "动词",
    word_Sense: "把……作为职业，以……为生。为，作为。",
    word_RemberedTimes: 0,
    word_RemberedTimesChange: 0,
    word_Show: false,
  },
];

var util = require("../../utils/util.js");
var app = getApp();
let touchDotX = 0; //X按下时坐标
let touchDotY = 0; //y按下时坐标
let card_color = new Array(
  "#baddf7",
  "#baddf7",
  "#baddf7",
  "#baddf7",
  "#ffffff"
);

Page({
  /**
   * 页面的初始数据
   */
  data: {
    word_todayRemembered: 0, // number 当日已经背诵的几个单词
    word_list: null, // 单词表
    word: new Array(),
    word_head: null, // 背诵队列头
    word_tail: null, // 背诵队列尾
    word_que: new Array(),
    word_startTime: 0,
    animationData: {},
    card_color1: card_color[0],
    card_color2: card_color[1],
    card_color3: card_color[2],
    card3_show: true,
    MainorBack: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    // 前端静态文件模拟获取
    /*
    that.setData({
      word_list: word_ListStatic,
      word_now: 0
    })
    */

    var date = new Date();
    var startTime =
      date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    console.log(startTime);

    this.setData({
      word_startTime: startTime,
    });

    wx.request({
      url: "http://zhiduoshao.xyz:8888/api/getwords/", //请求地址
      data: {
        //发送给后台的数据
        userID: 2,
      },
      method: "POST", //get为默认方法/POST
      success: function (res) {
        that.setData({
          word_list: res.data.data.word_List,
          word_head: 0,
        });
      },
      fail: function (err) {
        console.log(err);
      }, //请求失败
      complete: function () {
        var que = new Array();
        var tail = -1;
        for (var i = 0; i < that.data.word_list.length; i++)
          if (
            that.data.word_list[i].word_Show == false ||
            (that.data.word_list[i].word_Show == true &&
              that.data.word_list[i].word_RemberedTimesChange == -1)
          ) {
            que[++tail] = i;
          }
        for (var i = 0, j, c; i <= tail; ++i) {
          j = Math.floor(Math.random() * (i + 1));
          c = que[j];
          que[j] = que[i];
          que[i] = c;
        }

        that.setData({
          word_todayRemembered: that.data.word_list.length - que.length,
          word_tail: tail,
          word_que: que,
        });
      }, //请求完成后执行的函数
    });
    console.log(this.data);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1,
      });
    }
  },

  onUnload: function () {
    /*
      规范后端的接口 
    */

    var date = new Date();
    var endTime =
      date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    console.log(endTime);

    var studytime =
      ((endTime - this.data.word_startTime + 24 * 3600) % (24 * 3600)) +
      app.globalData.studyTime;
    getApp().globalData.studyTime = studytime;

    console.log(getApp().globalData);
    wx.request({
      url: "http://zhiduoshao.xyz:8888/api/save/",
      data: {
        userID: 2,
        data: this.data.word_list,
      },
      method: "POST",
      fail: function (err) {
        console.log("save -- error");
        console.log(err);
      },
      success: function (ress) {
        console.log("save -- success");
        //console.log(ress.data)
      },
    });
  },

  // 触摸函数
  touchstart: function (event) {
    touchDotX = event.touches[0].pageX; // 获取触摸时的原点
    touchDotY = event.touches[0].pageY;
    console.log("起始点的坐标X:" + touchDotX);
    console.log("起始点的坐标Y:" + touchDotY);
  },

  touchend: function (event) {
    // 手指离开屏幕时记录的坐标
    let touchMoveX = event.changedTouches[0].pageX;
    let touchMoveY = event.changedTouches[0].pageY;
    // 起始点的坐标(x0,y0)和手指离开时的坐标(x1,y1)之差
    let tmX = touchMoveX - touchDotX;
    let tmY = touchMoveY - touchDotY;

    console.log("tmX:" + tmX);
    console.log("tmY:" + tmY);
    // 两点横纵坐标差的绝对值
    let absX = Math.abs(tmX);
    let absY = Math.abs(tmY);
    //起始点的坐标(x0,y0)和手指离开时的坐标(x1,y1)之间的距离
    let delta = Math.sqrt(absX * absX + absY * absY);
    console.log("起始点和离开点距离:" + delta + "px");
    // 如果delta超过60px（可以视情况自己微调）,判定为手势触发
    if (delta >= 60) {
      if (tmY > 0) {
        tmY += app.globalData.windowHeight;
      } else {
        tmY -= app.globalData.windowHeight;
      }
      console.log("tmx tmxy", tmX, tmY);
      if (tmX < 0) {
        tmX -= app.globalData.windowWidth;
        console.log("tmx tmxy", tmX, tmY);
        this._UnKnow(null, tmX, tmY);
      } else {
        tmX += app.globalData.windowWidth;
        console.log("tmx tmxy", tmX, tmY);
        this._Know(null, tmX, tmY);
      }
    } else {
      console.log("手势未触发=====");
    }

    // 让上一张卡片展现正面（如果之前翻转过的话）
    this.setData({
      isFront3: true,
    });
  },

  Animation: function (translateXX, translateYY) {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
    });
    this.animation = animation;

    if (translateXX > 0) {
      this.animation
        .translateY(translateYY)
        .rotate(20)
        .translateX(translateXX)
        .opacity(1)
        .step({ duration: 300 });
    } else {
      this.animation
        .translateY(translateYY)
        .rotate(-20)
        .translateX(translateXX)
        .opacity(1)
        .step({ duration: 300 });
    }

    /*this.animation.translateY(0).translateX(0).opacity(1).rotate(0).step({
      duration: 30
    });*/

    let color1 = this.data.card_color2,
      color2 = this.data.card_color3;

    this.setData({
      animationData: this.animation.export(),
      card_color1: color1,
      card_color2: color2,
    });

    this.animation.translateY(0).translateX(0).opacity(1).rotate(0).step({
      duration: 0,
    });

    setTimeout(() => {
      this.setData({
        animationData: this.animation.export(),
        card_color3: card_color[Math.floor(Math.random() * card_color.length)],
        //card_color3: card_color[(++card_color_index) % card_color.length]
      });
    }, 600);
  },
  rotateFn: function () {
    this.animation_main = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
    });
    this.animation_back = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
    });
    // 点击正面

    if (this.data.MainorBack) {
      this.animation_main.rotateY(180).step();
      this.animation_back.rotateY(0).step();
      this.setData({
        animationData: this.animation_main.export(),
        MainorBack: false,
      });
    }
    // 点击背面
    else {
      this.animation_main.rotateY(0).step();
      this.animation_back.rotateY(-180).step();
      this.setData({
        animationData: this.animation_main.export(),
        MainorBack: true,
      });
    }
  },
  //相关操作函数

  _Know: function (
    _,
    translateXX = app.globalData.windowWidth * 1.5,
    translateYY = -app.globalData.windowHeight * 1.5
  ) {
    var list = this.data.word_list;
    var que = this.data.word_que;
    var head = this.data.word_head,
      tail = this.data.word_tail;
    var todayRemembered = this.data.word_todayRemembered;

    list[que[head % que.length]].word_Show = true;
    list[que[head % que.length]].word_RemberedTimesChange++;
    head++;
    todayRemembered++;

    this.Animation(translateXX, translateYY);
    if (head > tail) {
      wx.redirectTo({
        url: "./words_finish",
      });
    }
    this.setData({
      word_list: list,
      word_head: head,
      word_todayRemembered: todayRemembered,
      MainorBack: true,
    });
    console.log(this.data);
  },

  _UnKnow: function (
    _,
    translateXX = -app.globalData.windowWidth * 1.5,
    translateYY = -app.globalData.windowHeight * 1.5
  ) {
    console.log(this.data);
    var list = this.data.word_list;
    var head = this.data.word_head,
      tail = this.data.word_tail;
    var que = this.data.word_que;

    console.log(233);

    list[que[head % que.length]].word_RemberedTimesChange = -1;
    que[++tail % que.length] = que[head++ % que.length];

    this.Animation(translateXX, translateYY);
    this.setData({
      word_list: list,
      word_head: head,
      word_tail: tail,
      word_que: que,
      MainorBack: true,
    });

    console.log(this.data);
  },
});
