// pages/main/main.js

const app = getApp();
const util = require("../../utils/util.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //上方超链接栏
    navigators: [
      {
        id: 1,
        text: "查分",
        img_class: "icon-A",
        targetUrl: "../../pages/query/query",
      },
      // {
      //   id: 2,
      //   text: "考试日历",
      //   img_class: "icon-kaoshi",
      //   targetUrl: "#",
      // },
      {
        id: 3,
        text: "刷真题",
        img_class: "icon-kaoshi",
        targetUrl: "../../pages/Real_questions/Real_questions",
      },
      {
        id: 4,
        text: "翻译",
        img_class: "icon-tubiao-fanyi",
        targetUrl: "/pages/translate/translate",
      },
    ],
    select: 0,
    height: 0,
    sortList: [
      {
        name: "推荐",
      },
      {
        name: "热点",
      },
      {
        name: "考试",
      },
      {
        name: "资料",
      },
    ],
    placeList: [1, 2, 3, 4],
    newsUrl: "https://www.chsi.com.cn/cet/",
    datetimeTo: "下一次四六级考试 2021/6/12", // 秒杀开始时间
    timeLeft: "", // 剩下的时间（天时分秒）
  },

  dayClick: function (event) {
    console.log(event.detail);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.watchHeight();
  },
  onLoad() {
    // this.watchHeight();
  },

  //查询四六级分数
  queryCet() {},
  // 触发tab导航栏
  activeTab(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      select: index,
    });
    this.generalEv();
    this.watchHeight();
  },

  // 滑动swiper
  activeSw(e) {
    var index = e.detail.current;
    this.setData({
      select: index,
    });
    this.generalEv();
    this.watchHeight();
  },

  // 监听swiper高度
  watchHeight() {
    var query = wx.createSelectorQuery();
    query
      .select(".box")
      .boundingClientRect((res) => {
        this.setData({
          height: parseInt(res.height),
        });
      })
      .exec();
  },

  // 初始化值
  generalEv() {
    this.setData({
      placeList: [1, 2, 3, 4],
    });
    // 回到顶部
    wx.pageScrollTo({
      scrollTop: 0,
    });
  },

  onReachBottom: function () {
    var list = this.data.placeList;
    list.push(1, 2, 3, 4);
    this.setData({
      placeList: list,
    });
    this.watchHeight();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.data.timer = setInterval(() => {
      //注意箭头函数！！
      this.setData({
        timeLeft: util.getTimeLeft(this.data.datetimeTo), //使用了util.getTimeLeft
      });
      if (this.data.timeLeft == "0天0时0分0秒") {
        clearInterval(this.data.timer);
      }
    }, 1000);
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
