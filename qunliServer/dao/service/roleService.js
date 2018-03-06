/**
 * 角色管理
 * Created by chenda on 2016/4/30.
 */

const dao = require("../dao/dao");

//获取权限组
exports.getPrivilageGroup = async function(request,reply) {

    var grousList = await dao.find(request,"privilegeGroup");
    if(grousList==null){
        reply({"message":"查找权限组列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找权限组列表成功","statusCode":107,"status":true,"resource":grousList});
    }
};

//获角色列表
exports.getRole = async function (request,reply) {
    var role = await dao.findById(request,"role",request.params.roleId);

    if(role==null){
        reply({"message":"查找角色失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找角色成功","statusCode":107,"status":true,"resource":role});
    }
}


//获角色列表
exports.roleList = async function (request,reply) {

    var roleList = await dao.find(request,"role");

    if(roleList==null){
        reply({"message":"查找角色列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找角色列表成功","statusCode":107,"status":true,"resource":roleList});
    }
}


//添加角色
exports.addRole = async function(request,reply){
    var role = request.payload;
    var result = await dao.save(request,"role",role);
    if(result==null){
        reply({"message":"添加角色失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加角色成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//更新角色
exports.updateRole = async function(request,reply){
    var newRole = request.payload;
    var result = await dao.updateOne(request,"role",{"_id":request.params.roleId},newRole);
    if(result!=null){
        reply({"message":"更新角色成功","statusCode":105,"status":true});
    }else{
        reply({"message":"更新角色失败","statusCode":106,"status":false});
    }
}

//删除角色
exports.delRole = async function(request,reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    //统计用户
    var sysCount = await dao.findCount(request,"admin",{"roleId":new ObjectID(request.params.roleId)})
    if(sysCount && sysCount!=0){
        reply({"message":"删除用户失败，该角色下有管理员，请先将管理员设置为其他角色","statusCode":104,"status":false});
    }
    db.collection('role').deleteOne({"_id":new ObjectID(request.params.roleId)},function(err,result){
        if(err){
            request.server.log(['error'],err);
            throw err;
            reply({"message":"删除用户失败","statusCode":104,"status":false});
        }else{
            reply({"message":"删除用户成功","statusCode":103,"status":true});
        }
    });

}