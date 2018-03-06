/**
 * 系统配置资源处理器
 * Created by chenda on 2017/3/9.
 */

const dao = require("../dao/dao");

//添加系统信息
exports.addSystemSet = async function(request,reply){
    var systemSet = request.payload;
    var result = await dao.save(request,"systemSet",systemSet);
    if(result==null){
        reply({"message":"添加系统信息失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加系统信息成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//更新系统信息
exports.updateSystemSet = async function(request,reply){
    let systemSet = request.payload.systemSet;
    console.log(systemSet);
    var result = await dao.updateOne(request,"systemSet",{"_id":request.params.id},{"systemSet":systemSet});
    if(result==null){
        reply({"message":"更新系统信息失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新系统信息成功","statusCode":105,"status":true});
    }
}
//获取systemSetlist
exports.getSystemSetList = async function(request,reply){
    var systemSetData = await dao.find(request,"systemSet");
    var systemSet = systemSetData[0].systemSet;
    var aaa = format("yyyy/M/d",new Date());
    var currentTime = new Date(aaa).getTime();
    var yesterdayTime = currentTime - 86400000; //昨天的时间戳
    //统计昨日有效让利金额
    var totalRanLi = await dao.findSum(request,"declarationRecord",{$match:{"chuliTime":{$gte:yesterdayTime}, "state":2}},{$group:{_id:null,toGold:{$sum:"$rangli_gold"}}});   
    if(totalRanLi!= null && totalRanLi.length>0 ){
        var S1 = totalRanLi[0].toGold/systemSet.turnover_rate*0.1;  //派发总额S1
        var userIndex = 0, merchantIndex = 0;
        //统计当前消费者的福袋个数 取 整数部分
        var userTotalFudai = await dao.findSum(request,"user",{$match:{"fudai":{$gt:0}}},{$group:{_id:null,toGold:{$sum:"$fudai"}}});
        if(userTotalFudai != null && userTotalFudai.length>0){
            userTotalFudai = parseInt(userTotalFudai[0].toGold);  // 取整数部分
            userIndex = S1/userTotalFudai;   //消费者福袋指数
        }

        //统计当前商户的福袋个数 取 整数部分
        var merchantTotalFudai = await dao.findSum(request,"user",{$match:{"merchat.merchat_fudai":{$gt:0}}},{$group:{_id:null,toGold:{$sum:"$merchat.merchat_fudai"}}});
        if(merchantTotalFudai != null && merchantTotalFudai.length>0){
            merchantTotalFudai = parseInt(merchantTotalFudai[0].toGold);  // 取整数部分
            merchantIndex = S1/merchantTotalFudai;   //消费者福袋指数
        }
        await dao.updateTow(request,"systemSet",{"_id":systemSetData[0]._id+""},{$set:{"smgUserIndex":userIndex,"smgMerchantIndex":merchantIndex}});
    }
    //列表
    var data = await dao.find(request,"systemSet");
    if(data == null){
        reply({"message":"查找系统设置信息失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找系统设置信息成功","statusCode":107,"status":true,"resource":data});
    }
}

//获取系统设置
exports.getSystemSetUserList = async function(request, reply){
    var systemSetData = await dao.find(request,"systemSet");
    if(systemSetData == null){
        reply({"message":"查找系统设置信息失败","statusCode":108,"status":false});
    }else{
        var systemSet = systemSetData[0].systemSet;
        var data = {
            "serverPeople": systemSet.alertMessage?systemSet.alertMessage:"",
            "serverCenter": systemSet.alertMessage2?systemSet.alertMessage2:"",
        }
        reply({"message":"查找系统设置信息成功","statusCode":107,"status":true,"resource":data});
    }
}

//时间格式化
function format(fmt,data) { //author: meizz
    var o = {
        "M+": data.getMonth() + 1, //月份
        "d+": data.getDate(), //日
        "h+": data.getHours(), //小时
        "m+": data.getMinutes(), //分
        "s+": data.getSeconds(), //秒
        "q+": Math.floor((data.getMonth() + 3) / 3), //季度
        "S": data.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (data.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
