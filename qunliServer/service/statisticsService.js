
/**
 * 信息处理器
 * Created by chenda on 2017/3/9.
 */
 const dao = require("../dao/dao");

//返回数据
exports.today = async function (request,reply){
    var admin = request.auth.credentials;
    let dateTime = new Date(format("yyyy/M/d",new Date())).getTime();
    let resource = {}
    if(dao.contains(admin.scope,"CUSTOMER_ALL")){
        //客户总数
        resource.userSum = await dao.findCount(request,"customer");
        //成交客户
        resource.chengjiao = await dao.findCount(request,"customer",{"cooperation_state":1});
        //意向客户
        resource.yixiang = await dao.findCount(request,"customer",{"cooperation_state":0,"cooperation_level":1});
        //今日新增客户
        resource.todayAddUser = await dao.findCount(request,"customer",{createTime:{$gt:dateTime}});
    }else{
        //客户总数
        resource.userSum = await dao.findCount(request,"customer",{"ascription":admin._id+""});
        //成交客户
        resource.chengjiao = await dao.findCount(request,"customer",{"cooperation_state":1,"ascription":admin._id+""});
        //意向客户
        resource.yixiang = await dao.findCount(request,"customer",{"cooperation_state":0,"cooperation_level":1,"ascription":admin._id+""});
        //今日新增客户
        resource.todayAddUser = await dao.findCount(request,"customer",{createTime:{$gt:dateTime},"ascription":admin._id+""});
    }
    if(dao.contains(admin.scope,"TODOS_ALL")){
        //今日跟进
        resource.todosTodos = await dao.findCount(request,"todos",{createTime:{$gt:dateTime}});
    }else{
        //今日跟进
        resource.todosTodos = await dao.findCount(request,"todos",{createTime:{$gt:dateTime},"addUser":admin.username});
    }
    //共享客户
    resource.share = await dao.findCount(request,"customer",{"state":2});
    //代办事项
    resource.reminds = await dao.findCount(request,"remind",{"addUserId":admin._id+"","remindTime":{$lt:new Date().getTime()}});
    reply({"message":"查询统计资源成功！","statusCode":107,"status":true,resource:resource});
}

// //统计今日新增用户数据
async function todayAddUser(request){
    let dateTime = new Date(format("yyyy/M/d",new Date())).getTime();
	//总数
    var sum = await dao.findCount(request,"user",{createTime:{$gt:dateTime}});
    return sum;
}


//近七日新增用户数量查询
async function weekAddUser(request){
    //查询倒叙
    var users = await dao.find(request,"userRecord",{},{},{createTime:-1},12,1);
    return users;
}
//
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
