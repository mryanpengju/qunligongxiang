
const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");

//管理员登录
exports.Login = function(request,reply){
    var admin = request.auth.credentials;
    delete admin.password;
    reply({"message":"登陆成功","statusCode":107,"status":true,"resource":request.auth.credentials});
}

//获取用户列表
exports.adminUserListAct = async function(request,reply){
    var data = await dao.find(request, 'user', request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"user",request.payload.where);
    if(data == null){
        reply({"message":"查找用户失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找用户成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

// 后台查找某个用户
exports.getUserInfoToAdmin = async function(request, reply){
    var data = await dao.findById(request, "user", request.params.id);
    if(data == null){
        reply({"message":"获取用户信息失败","statusCode":108,"status":false});
    }else{
        reply({"message":"获取用户信息成功","statusCode":107,"status":true,"resource":data});
    }
}

// 后台查找某个用户
exports.adminUpdateUserInfo = async function(request, reply){
    var data = await dao.findById(request, "user", request.params.id);
    var sendData = request.payload;
    if(data == null){
        reply({"message":"未找到该用户","statusCode":108,"status":false});
        return;
    }else{
        var result = null;
        if(parseInt(sendData.userType) == 1){
            var scope = [];
           if(request.payload.state == 0){
                var scope = data.scope;
                var index = scope.indexOf("USER");
                scope.splice(index, 1);
                // sendData["scope"] =  scope;
                // delete sendData.userType;
                // result = await dao.updateOne(request,"user",{_id: request.params.id+""},sendData);
            }else{
                var scope = data.scope;
                var index = scope.indexOf("USER");
                if(index>-1){
                }else{
                    scope.push("USER");
                }
                // sendData["scope"] =  scope;
                // delete sendData.userType;
                // result = await dao.updateOne(request,"user",{_id: request.params.id+""},request.payload); 
            } 
            result = await dao.updateOne(request,"user",{_id: request.params.id+""},{"scope":scope, "name": sendData.name, "mobile": sendData.mobile, "pay_password": sendData.pay_password, "password": sendData.password});
        }else if(parseInt(sendData.userType) == 2){
            var scope = [];
           if(request.payload.state == 0){
                scope = data.scope;
                var index = scope.indexOf("MERCHANT");
                scope.splice(index, 1);
            }else{
                scope = data.scope;
                var index = scope.indexOf("MERCHANT");
                if(index>-1){
                }else{
                    scope.push("MERCHANT");
                }
            }
            result = await dao.updateOne(request,"user",{_id: request.params.id+""},{"scope":scope, "merchat.name": sendData.name, "merchat.mobile": sendData.mobile, "merchat.pay_password": sendData.pay_password, "merchat.password": sendData.password});
        }else if(parseInt(sendData.userType) == 3){
            var scope = [];
           if(request.payload.state == 0){
                scope = data.scope;
                var index = scope.indexOf("SERVER_PEOPLE");
                scope.splice(index, 1);
            }else{
                scope = data.scope;
                var index = scope.indexOf("SERVER_PEOPLE");
                if(index>-1){
                }else{
                    scope.push("SERVER_PEOPLE");
                }
            }
            result = await dao.updateOne(request,"user",{_id: request.params.id+""},{"scope":scope, "serverPeople.name": sendData.name, "serverPeople.mobile": sendData.mobile, "serverPeople.pay_password": sendData.pay_password, "serverPeople.password": sendData.password});
        }else if(parseInt(sendData.userType) == 4){
            var scope = [];
           if(request.payload.state == 0){
                scope = data.scope;
                var index = scope.indexOf("SERVER_CENTER");
                scope.splice(index, 1);
            }else{
                scope = data.scope;
                var index = scope.indexOf("SERVER_CENTER");
                if(index>-1){
                }else{
                    scope.push("SERVER_CENTER");
                }
            }
            result = await dao.updateOne(request,"user",{_id: request.params.id+""},{"scope":scope, "serverCenter.name": sendData.name, "serverCenter.mobile": sendData.mobile, "serverCenter.pay_password": sendData.pay_password, "serverCenter.password": sendData.password});
        }
        if(result == null){
           reply({"message":"未找到该用户","statusCode":108,"status":false});
           return;
        }else{
            reply({"message":"更新用户资料成功","statusCode":107,"status":true});
        }
    }
}

// 后台 获取用户列表
exports.getUserList = async function(request,reply){
    //列表
    var data = await dao.find(request,"user",{"user_id":{ $exists: true }},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"user",{"user_id":{ $exists: true }});
    if(data == null){
        reply({"message":"查找用户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找用户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

// 后台 充值操作
exports.adminChongZhiAct = async function(request, reply){
    var admin = request.auth.credentials;
    var sendData = request.payload;
    var user = await dao.findById(request, "user", request.params.id+"");
    if(user == null){
        reply({"message":"充值失败，未找到该用户","statusCode":108,"status":false});
    }else{
        var result = null, userCode = "", mobile="";
        if(parseInt(sendData.userType) == 1){
            userCode = user.user_id;
            mobile = user.mobile;
            result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"sumFudai":sendData.sumFudai,"dfuxing":sendData.dfuxing}});
        }else if(parseInt(sendData.userType) == 2){
            userCode = user.merchat.user_id;
            mobile = user.merchat.mobile;
            result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_sumFudai":sendData.sumFudai,"merchat.merchat_dfuxing":sendData.dfuxing}});
        }else if(parseInt(sendData.userType) == 3){
            userCode = user.serverPeople.user_id;
            mobile = user.serverPeople.mobile;
            result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.dfuxing":sendData.dfuxing}});
        }else if(parseInt(sendData.userType) == 4){
            userCode = user.serverCenter.user_id;
            mobile = user.serverCenter.mobile;
            result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.dfuxing":sendData.dfuxing}});
        }
        if(result == null){
            reply({"message":"充值失败","statusCode":108,"status":false});
        }else{
            var saveData = {
                "username": user.common_username,
                "userCode": userCode,
                "mobile": mobile,
                "userId": user._id+"",
                "sumFudai": (parseInt(sendData.userType)<3)?sendData.sumFudai:0,
                "dfuxing": sendData.dfuxing,
                operationUser: admin.username,   //操作人
                createTime: new Date().getTime(),
            }
            await dao.save(request, "adminCZRecord", saveData);

            if(sendData.sumFudai>0){
                var saveData2={
                    username: user.common_username,
                    userId: user._id+"",
                    name: user.name,
                    userMobile: mobile,
                    userCode: userCode,
                    sumFudai:  (parseInt(sendData.userType)<3)?sendData.sumFudai:0,            // 福袋
                    fuxing: 0,                  // 每天派发的福星
                    userType: 1,                // 1用户 2商户 3服务商 4服务中心
                    type: 13,                    // 带激活福袋
                    createTime: new Date().getTime()
                }
                await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
            }

            if(sendData.dfuxing>0){
                var saveData2={
                    username: user.common_username,
                    userId: user._id+"",
                    name: user.name,
                    userMobile: mobile,
                    userCode: userCode,
                    fudai: 0,            // 福袋
                    dfuxing: sendData.dfuxing,                  // 待交税福星
                    userType: 1,                // 1用户 2商户 3服务商 4服务中心
                    type: 14,                    // 带激活福袋
                    createTime: new Date().getTime()
                }
                await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
            }
            reply({"message":"充值成功","statusCode":107,"status":true});
            return;
        }
    }
}

// 后台 充值操作列表
exports.adminChongZhiListAct = async function(request, reply){
    var data = await dao.find(request, 'adminCZRecord', request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"adminCZRecord",request.payload.where);
    var sumFudaiTotal = null;
    if(request.payload.where.dfuxing){
        sumFudaiTotal = await dao.findSum(request,"adminCZRecord",{$match:request.payload.where},{$group:{_id:null,toGold:{$sum:"$dfuxing"}}});
    }else{
        sumFudaiTotal = await dao.findSum(request,"adminCZRecord",{$match:request.payload.where},{$group:{_id:null,toGold:{$sum:"$sumFudai"}}});
    }
    if(data == null){
        reply({"message":"查找用户失败","statusCode":108,"status":false});
    }else{
        if(sumFudaiTotal != null && sumFudaiTotal.length>0){
            reply({"message":"查找用户成功","statusCode":107,"status":true,"resource":data,"sum":sum, "total":sumFudaiTotal[0].toGold});
        }else{
            reply({"message":"查找用户成功","statusCode":107,"status":true,"resource":data,"sum":sum, "total":0});
        }
    }
}

//后台 获取商户列表
exports.getAllMerchantListAct =async function(request, reply){
    var data = await dao.find(request,"user",{"merchat":{$exists:true}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"user",{"merchat":{$exists:true}});
    if(data == null){
        reply({"message":"查找商户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    } 
}

// 后台 获取所有服务商列表
exports.getAllServerPeopleListAct =async function(request, reply){
    var data = await dao.find(request,"user",{"serverPeople":{$exists:true}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"user",{"serverPeople":{$exists:true}});
    if(data == null){
        reply({"message":"查找商户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    } 
}

// 后台 获取所有服务中心列表
exports.getAllServerCenterListAct =async function(request, reply){
    var data = await dao.find(request,"user",{"serverCenter":{$exists:true}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"user",{"serverCenter":{$exists:true}});
    if(data == null){
        reply({"message":"查找商户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    } 
}

// 后台 搜索用户资料
exports.searchUserItemAct = async function(request, reply){
    var data = await dao.find(request, 'user', request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"user",request.payload.where);
    if(data == null){
        reply({"message":"搜索用户","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索用户成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}


