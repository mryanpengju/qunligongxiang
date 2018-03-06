/**
 * 管理员服务层
 * Created by chenda on 2016/4/30.
 */

const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");

//管理员登录
exports.Login = function(request,reply){
    var admin = request.auth.credentials;
    delete admin.password;
    reply({"message":"用户登陆成功","statusCode":107,"status":true,"resource":request.auth.credentials});
}

//添加管理员
exports.addAdmin = async function(request,reply){
    var admin = request.payload;
    var adminUser = await dao.find(request, "admin", {"username":admin.username});
    if(adminUser.length>0){
        reply({"message":"账号已存在，请重新输入","statusCode":102,"status":false});
        return;
    }else{
        var role = await dao.findById(request, "role", admin.roleId);
        admin.roleName = role.name;
        admin.createTime = new Date().getTime();
        admin.scope = role.scope;
        admin.password = CryptoJS.AES.encrypt(admin.password,"{b^`)v?H&Ko*jGa1")+"";
        var result = await dao.save(request,"admin",admin);
        if(result==null){
            reply({"message":"添加管理员失败","statusCode":102,"status":false});
        }else{
            reply({"message":"添加管理员成功","statusCode":101,"status":true,"resource":result.ops[0]});
        }
    }
}

//获取管理员list
exports.getAdminList = async function(request,reply){
        var admin = request.auth.credentials;
        //列表
        var data = await dao.find(request,"admin",{"state":1},{"password":0},{createTime:-1});
        //总数
        var sum = await dao.findCount(request,"admin",{"state":1});
        
        if(data == null){
            reply({"message":"查找管理员列表失败","statusCode":108,"status":false});
        }else{
            reply({"message":"查找管理员列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
        }
}

//更新管理员
exports.updateAdmin = async function(request,reply){
    var admin = request.payload;
    var role = await dao.findById(request, "role", admin.roleId);
    admin.roleName = role.name;
    admin.scope = role.scope;
    if(admin.password){
        admin.password = CryptoJS.AES.encrypt(admin.password,"AiMaGoo2016!@.")+"";
    }
    var result = await dao.updateOne(request,"admin",{"_id":request.params.id},admin);
    if(result==null){
        reply({"message":"更新管理员失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新管理员成功","statusCode":105,"status":true});
    }
}

//删除管理员
exports.delAdmin = async function(request,reply){
    var admin = request.auth.credentials;
    if(request.params.id+"" == admin._id+""){
      reply({"message":"超级管理员不允许删除","statusCode":104,"status":false});
      return;
    }
    var plant = await dao.find(request,"customer",{"ascription":request.params.id+""});
    if(plant.length>0){
        reply({"message":"删除管理员失败,管理员下面有客户","statusCode":104,"status":false});
        return;
    }
    var result = await dao.del(request,"admin",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除管理员失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除管理员成功","statusCode":103,"status":true});
    }
}

//转移客户
exports.userTransfer = async function(request,reply){
    var data = request.payload;
    var admin = await dao.findById(request,"admin",data.toId);
    var update = await dao.updateMore(request,"customer",{"ascription":data.fromId},{"ascription":data.toId,"ascriptionName":admin.name});
    if(update==null){
        reply({"message":"转移失败！","statusCode":106,"status":false});
    }else{
        reply({"message":"转移成功！","statusCode":105,"status":true});
    }
}


