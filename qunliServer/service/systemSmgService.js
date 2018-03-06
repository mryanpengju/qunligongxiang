/**
 * 系统公告处理器
 * Created by chenda on 2017/3/9.
 */

const dao = require("../dao/dao");

//添加公告信息
exports.addSystemSmg = async function(request,reply){
    var systemSmg = request.payload;
    systemSmg.createTime = new Date().getTime();
    var result = await dao.save(request,"systemSmg",systemSmg);
    if(result==null){
        reply({"message":"添加公告信息失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加公告信息成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//添加站内信
exports.addSystemSmgInternal = async function(request, reply){
    var systemSmg = request.payload;
    systemSmg.createTime = new Date().getTime();
    var result = await dao.save(request,"systemSmgInternal",systemSmg);
    if(result==null){
        reply({"message":"添加站内信失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加站内信成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//删除公告信息
exports.delSystemSmg = async function(request,reply){

    var result = await dao.delOne(request,"systemSmg",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除公告信息失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除公告信息成功","statusCode":103,"status":true});
    }
}

//删除站内信
exports.delInternalSystemSmg = async function(request,reply){
    var result = await dao.delOne(request,"systemSmgInternal",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除站内信失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除站内信成功","statusCode":103,"status":true});
    }
}

//更新公告信息
exports.updateSystemSmg = async function(request,reply){
    var result = await dao.updateOne(request,"systemSmg",{"_id":request.params.id},request.payload);

    if(result==null){
        reply({"message":"更新公告信息失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新公告信息成功","statusCode":105,"status":true});
    }
}

//更新站内信
exports.updateInternalSystemSmg = async function(request, reply){
    var result = await dao.updateOne(request,"systemSmgInternal",{"_id":request.params.id},request.payload);
    if(result==null){
        reply({"message":"更新站内信失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新站内信成功","statusCode":105,"status":true});
    }
}

//获取最新的系统公告
exports.getSystemSmgNews = async function(request, reply){
    var result = await dao.find(request,"systemSmg",{},{},{createTime:-1},parseInt(1),parseInt(1));
    if(result==null){
        reply({"message":"获取最新公告信息失败","statusCode":108,"status":false});
        return;
    }else{
        /*var loginTime = format("yyyy/M/d",new Date()); //今天的时间
        var lastTime = format("yyyy/M/d",new Date(user.readSysSmgTime));
        if(loginTime != lastTime){
            var u = await dao.updateOne(request,"user",{"_id":user._id+""},{readSysSmgTime:new Date().getTime()}); 
        }else{
           result = [];
        }*/
        //var u = await dao.updateOne(request,"user",{"_id":user._id+""},{readSysSmgTime:new Date().getTime()}); 

        /*if(!user.readSysSmgTime || user.readSysSmgTime<result[0].createTime){
           var u = await dao.updateOne(request,"user",{"_id":user._id+""},{readSysSmgTime:new Date().getTime()}); 
        }else{
          result = []; 
        }*/
        reply({"message":"获取最新公告信息成功","statusCode":107,"status":true,"resource":result});
        return;
    }
}

// 搜索 系统公告列表
exports.adminSearchSystemSmg = async function(request, reply){
    var data = await dao.find(request,"systemSmg",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"systemSmg",request.payload.where);

    if(data == null){
        reply({"message":"查找公告信息列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找公告信息列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

// 搜索 站内信列表
exports.adminSearchInternalSystemSmg = async function(request, reply){
    var data = await dao.find(request,"systemSmgInternal",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"systemSmgInternal",request.payload.where);

    if(data == null){
        reply({"message":"查找站内信列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找站内信列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取systemSmglist
exports.getSystemSmgList = async function(request,reply){
    var user = request.auth.credentials;
    var data;
    var sum
    data = await dao.find(request,"systemSmg",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    sum = await dao.findCount(request,"systemSmg",{});

    if(data == null){
        reply({"message":"查找公告信息列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找公告信息列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取站内信列表
exports.getSystemSmgInternalList = async function(request, reply){
    var data = await dao.find(request,"systemSmgInternal",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"systemSmgInternal",{});

    if(data == null){
        reply({"message":"查找公告信息列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找公告信息列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取systemSmglist
exports.getSystemSmg = async function(request,reply){
    //列表
    var result = await dao.findById(request,"systemSmg",request.params.id);
    if(result == null){
        reply({"message":"查找公告信息列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找公告信息列表成功","statusCode":107,"status":true,"resource":result});
    }
}

//获取某个站内信
exports.getInternalSystemSmg = async function(request,reply){
    //列表
    var result = await dao.findById(request,"systemSmgInternal",request.params.id);
    if(result == null){
        reply({"message":"查找公告信息列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找公告信息列表成功","statusCode":107,"status":true,"resource":result});
    }
}


//获取getSmgNoReadlList
exports.getSmgNoReadlList = async function(request,reply){
    var user = request.auth.credentials;
    var sum; 
    //总数
    if(user.readSysSmgTime){
       sum = await dao.findCount(request,"systemSmg",{createTime:{$gt:user.readSysSmgTime}});
    }else{
        sum = await dao.findCount(request,"systemSmg");
    }
    if(sum == null){
        reply({"message":"获取未读信息数","statusCode":108,"status":false});
    }else{
        reply({"message":"获取未读信息数","statusCode":107,"status":true,"sum":sum});
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
