/**
 * 用户数据处理文件
 * Created by chenda on 2016/4/14.
 */
var uploadFile =require("./fileService");
const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");
var svgCaptcha = require('svg-captcha');

//添加用户
exports.addUser = async function(request,reply){
    var data = request.payload;
    var user = await dao.find(request, "user", {"username":data.username});
    if(user.length>0){
        reply({"message":"账号已存在，请重新输入","statusCode":102,"status":false});
        return;
    }
    //查看验证码是否正确
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":data.mobile,"type":"register","code":parseInt(data.smsCode)});
    if(smsVerification==null){
        reply({"message":"验证码不正确，请重新输入。","statusCode":102,"status":false});
        return;
    }else{
        dao.del(request,"smsVerification",{"_id":smsVerification._id+""})
    }
    if(data.parentUser){
        var userRoleStr = data.parentUser.replace(/[^a-z]+/ig,"");
        var parent = null;
        if(userRoleStr == "C"){  // 获赠人为 会员

            parent = await dao.findOne(request, "user", {"user_id":data.parentUser});
            if(parent != null){
                data.parentUser = parent.username;
                data.parentId = parent._id+"";
                data.parentNumber = parent.user_id;
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }
        if(userRoleStr == "B"){  // 获赠人为 商户
            parent = await dao.findOne(request, "user", {"merchat.user_id":data.parentUser});
            if(parent != null){
                data.parentUser = parent.merchat.username;
                data.parentId = parent._id+"";
                data.parentNumber = parent.merchat.user_id;
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }

        }
        if(userRoleStr == "AB"){  // 获赠人为 服务商
            parent = await dao.findOne(request, "user", {"serverPeople.user_id":data.parentUser});
            if(parent != null){
                data.parentUser = parent.serverPeople.username;
                data.parentId = parent._id+"";
                data.parentNumber = parent.serverPeople.user_id;
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }
        if(userRoleStr == "ABC"){  // 获赠人为 服务中心
            parent = await dao.findOne(request, "user", {"serverCenter.user_id":data.parentUser});
            if(parent != null){
                data.parentUser = parent.serverCenter.username;
                data.parentId = parent._id+"";
                data.parentNumber = parent.serverCenter.user_id;
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }
        if(parent == null){
            reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
            return;
        }
    }else{
        data.parentUser = "";
        data.parentId = "";
        data.parentNumber = "";
    }
    data.createTime = new Date().getTime();
    data.auth_user = false;
    data.headImg = ""
    data.fudai = 0;       //激励中的福袋 （激励中的福袋数）
    data.sumFudai = 0;    //累加中的福袋 （满1之后放入激励中）
    data.delFudai = 0;    // 已经激活过的福袋
    data.fuxing = 0;      //福星
    data.zfuxing = 0;     //累计福星
    data.unfuxing = 0;    //代缴税福星
    data.dfuxing = 0;     //冻结福星
    data.achievement = 0; //累计消费额
    data.sumTixian = 0;   //累计回购(提现)金额
    var tongyi_number = await dao.inc(request,'qunli_ids','qunli_id', 100001);
    data.user_id = "C"+tongyi_number;
    data.password = CryptoJS.AES.encrypt(data.password,"{b^`)v?H&Ko*jGa1")+"";
    var result = null;
    var commonUser = await dao.findOne(request, "user",{"common_username":data.username+""});   //查找有没有公共账号存在
    if(commonUser == null){
        data.common_username = data.username;
        var saveResult = await dao.save(request,"user",{...data, 'scope':["USER"]});
        result = saveResult.ops[0];
    }else{
        var scopeArray = commonUser.scope;
        scopeArray.push("USER");
        await dao.updateOne(request,"user",{"_id":commonUser._id+""},{...data,'scope': scopeArray})
        result = await dao.findById(request,"user",commonUser._id+"");
    }
    if(result==null){
        reply({"message":"添加用户成功失败","statusCode":102,"status":false});
    }else{
        if(data.parentUser != "" && data.parentNumber != ""){
            var recommendData = {
                username: data.parentUser,        // 推荐人的账号
                userId: data.parentId+"",            // 推荐人的ID
                user_code: data.parentNumber,        // 推荐人的编号
                recommendUser: result.username,   // 被推荐人的账号
                recommendMobile: result.mobile,   // 被推荐人的手机号
                recommendId: result._id+"",       // 被推荐人的ID
                recommendCode: result.user_id,   // 被推荐人的ID
                recommendType: 1,                // 被推荐人的类型  // 1用户 2商户 3服务商
                createTime: new Date().getTime(),       
            }
            await dao.save(request, "recommendRecord",recommendData);   //生成推荐记录
        }
        reply({"message":"添加用户成功","statusCode":107,"status":true,"resource":result});
    }
}

// 申请成为 商家  服务商 市级服务中心 提交申请
exports.addUserWithRoleAct = async function(request, reply){
    var sendData = request.payload;
    var systemSetData = await dao.find(request,"systemSet");
    var systemSet = systemSetData[0].systemSet;
    //查看验证码是否正确
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":sendData.mobile,"type":"register","code":parseInt(sendData.smsCode)});
    if(smsVerification==null){
        reply({"message":"验证码不正确，请重新输入。","statusCode":102,"status":false});
        return;
    }else{
        dao.del(request,"smsVerification",{"_id":smsVerification._id+""})
    }

    var searchUser = [];
    if(sendData.type == 2){
        searchUser = await dao.find(request, "user", {"merchat.username":sendData.mobile});
        if(searchUser.length>0){
            reply({"message":"账号已存在2，请重新输入","statusCode":102,"status":false});
            return;
        }
    }else if(sendData.type == 3){
        searchUser = await dao.find(request, "user", {"serverPeople.username":sendData.mobile});
        if(searchUser.length>0){
            reply({"message":"账号已存在1，请重新输入","statusCode":102,"status":false});
            return;
        }
    }else if(sendData.type == 4){
        searchUser = await dao.find(request, "user", {"serverCenter.username":sendData.mobile});
        if(searchUser.length>0){
            reply({"message":"账号已存在3，请重新输入","statusCode":102,"status":false});
            return;
        }
    }
    if(sendData.type < 2 || sendData.type > 4){
       reply({"message":"申请失败，您选择正确的角色申请","statusCode":108,"status":false});
        return; 
    }
    if(sendData.parentUser){
        var userRoleStr = sendData.parentUser.replace(/[^a-z]+/ig,"");
        var parent = null;
        if(userRoleStr == "C"){
            reply({"message":"申请失败，推荐人权限不足","statusCode":108,"status":false});
            return;
        }
        if(userRoleStr == "B"){
            reply({"message":"申请失败，推荐人权限不足","statusCode":108,"status":false});
            return;
        }
        if(userRoleStr == "AB"){
            if(parseInt(sendData.type) ==2){
                parent = await dao.findOne(request, "user", {"serverPeople.user_id":sendData.parentUser});
                if(parent != null){
                    sendData.parentNumber = parent.serverPeople.user_id;
                    sendData.parentUser = parent.serverPeople.username;
                    sendData.parentId = parent._id+"";
                }else{
                    reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                    return;
                }
            }else{
                reply({"message":"申请失败，推荐人权限不足","statusCode":108,"status":false});
                return;
            }
        }
        if(userRoleStr == "ABC"){
            if(parseInt(sendData.type)==3 || parseInt(sendData.type)==2 ){
                parent = await dao.findOne(request, "user", {"serverCenter.user_id":sendData.parentUser});
                if(parent != null){
                    sendData.parentNumber = parent.serverCenter.user_id;
                    sendData.parentUser = parent.serverCenter.username;
                    sendData.parentId = parent._id+"";
                }else{
                    reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                    return;
                }
            }else{
                reply({"message":"申请失败，推荐人权限不足","statusCode":108,"status":false});
                return;
            }
        }
        
    }else{
        sendData.parentNumber = "";
        sendData.parentUser = "";
        sendData.parentId = "";
    }
    var applyArray = await dao.find(request,"applyMerchant", {"applyUser":sendData.username, "ApplyType":sendData.type, 'applyState':1});
    if(applyArray.length>0){
        reply({"message":"您已经在申请了，请等待结果","statusCode":108,"status":false});
        return;
    }
    var merchantClassData = null;
    if(!sendData.businessType){
        reply({"message":"请先选择经营类型","statusCode":108,"status":false});
        return;
    }else{
        merchantClassData = await dao.findById(request, "merchantCategory", sendData.businessType+"");
        if(merchantClassData == null){
            reply({"message":"未找到该分类，请重新选择","statusCode":108,"status":false});
            return;
        }
    }

    var createTime = new Date().getTime();
    var saveData = {};
    var merchat = {
        auth_user: false,
        merchant_name: sendData.merchant_name,
        merchant_leader: sendData.merchant_leader,
        username: sendData.mobile,
        name: sendData.name,
        password : CryptoJS.AES.encrypt(sendData.password,"{b^`)v?H&Ko*jGa1")+"",
        pay_password: sendData.pay_password,
        mobile: sendData.mobile,
        merchant_idCard: sendData.merchant_idCard,
        /*merchant_bankCard: sendData.merchant_bankCard,
        merchant_bankType: sendData.merchant_bankType,
        merchant_bankName: sendData.merchant_bankName,*/
        merchant_area: sendData.merchant_area,
        merchant_city: sendData.merchant_city,
        merchant_province: sendData.merchant_province,
        merchant_address: sendData.merchant_address,
        merchant_tell: sendData.merchant_tell?sendData.merchant_tell:sendData.mobile,
        merchant_description: sendData.merchant_description,
        businessType: (merchantClassData==null)?"":merchantClassData.className,
        businessTypeId: (merchantClassData==null)?"":merchantClassData._id+"",
        transferModel: sendData.transferModel,
        idCord_zm: sendData.idCord_zm,
        idCord_fm: sendData.idCord_fm,
        businessLicense: sendData.businessLicense,
        logoImg: sendData.logoImg,
        promiss: sendData.promiss,
        apply: createTime,  //申请时间
        recommendId: sendData.parentId,
        recommendUser: sendData.parentUser,
        recommendCode: sendData.parentNumber,
    }
    if(sendData.type==2){
        merchat.merchat_fudai = 0;       //激励中的福袋 （激励中的福袋数）
        merchat.merchat_sumFudai = 0;       //累加中的福袋 （满1之后放入激励中）
        merchat.merchat_delFudai = 0;    // 已经激活过的福袋
        merchat.merchat_fuxing = 0;      //福星
        merchat.merchat_zfuxing = 0;     //累计福星
        merchat.merchat_unfuxing = 0;    //代缴税福星
        merchat.merchat_dfuxing = 0;     //冻结福星
        merchat.merchat_achievement = 0;  // 总的让利金额
        merchat.merchat_allYingYe = 0;    // 商家总的营业额
        merchat.merchat_sumTixian = 0;    // 商家累计回购金额
        merchat.merchat_yesRL = 0;          // 商家昨日让利总金额
        merchat.merchat_zrl = 0;          // 商家历史总让利
        merchat.merchat_drl = 0;          // 商家历史 单日 最高让利
        merchat.merchat_days = 0;          // 商家距离下一周期还剩 多少天
        merchat.merchat_dabiao = 0;       // 商家距离 达标还差 多少万
        merchat.merchant_cycle = systemSet.cycle;      // 商户的让利周期
        merchat.merchant_RLState = true;    // 商家周期让利 开始和关闭状态
    }else{
        merchat.fuxing = 0;      //福星
        merchat.zfuxing = 0;     //累计福星
        merchat.unfuxing = 0;    //代缴税福星
        merchat.dfuxing = 0;     //冻结福星
        merchat.sumTixian = 0;   // 累计回购金额
    }

    if(sendData.type==2){
        saveData.merchantInfo = merchat;    //商户
    }else if(sendData.type==3){
        saveData.merchantInfo = merchat;    // 服务商
    }else if(sendData.type==4){
        saveData.merchantInfo = merchat;    // 服务中心
    }
    saveData.ApplyType = sendData.type;
    saveData.applyUser = sendData.mobile;
    saveData.applyState = 1;  // 1等待审核  2通过审核  3驳回审核
    saveData.applyUserCode = sendData.parentNumber;   //推荐人的code
    saveData.createTime = createTime;
    var result = await dao.save(request,"applyMerchant",saveData);
    if(result==null){
        reply({"message":"申请失败","statusCode":102,"status":false});
    }else{ 
        reply({"message":"申请成功,请等待审核","statusCode":107,"status":true});
    }
}

//登录验证
exports.userLogin = async function(request,reply){
    var user = request.auth.credentials;
    var systemSetData = await dao.find(request,"systemSet");
    var systemSet = systemSetData[0].systemSet;
    if(user.state==0){
        reply({"message":"您的账号被冻结，请联系管理员！","statusCode":102,"status":false});
        return;
    }
    if(parseInt(request.params.userType) == 2){
        if(!user.merchat){
            reply({"message":"登录失败，您还不是商户！","statusCode":102,"status":false});
            return;
        }
    }
    if(parseInt(request.params.userType) == 3){
        if(!user.serverPeople){
            reply({"message":"登录失败，您还不是服务商！","statusCode":102,"status":false});
            return;
        }
    }
    if(parseInt(request.params.userType) == 4){
        if(!user.serverCenter){
            reply({"message":"登录失败，您还不是市级服务中心！","statusCode":102,"status":false});
            return;
        }
    }
    delete user.password;
    user.systemSet = systemSet;
    reply({"message":"用户登陆成功","statusCode":107,"status":true,"resource":user});
}

// 更新用户资料
exports.updateUserInfoAct = async function(request, reply){
    var user = request.auth.credentials;
    var sendData = request.payload;
    //查看验证码是否正确
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":sendData.mobile,"type":"reEditUser","code":parseInt(sendData.smsCode)});
    if(smsVerification==null){
        reply({"message":"验证码不正确，请重新输入。","statusCode":102,"status":false});
        return;
    }else{
        dao.del(request,"smsVerification",{"_id":smsVerification._id+""})
    }
    /*if(sendData.mobile){
        var userArr = await dao.find(request, "user", {"common_username":sendData.mobile});
        if(userArr.length>0){
            reply({"message":"该手机号已注册","statusCode":108,"status":false});
            return;
        }
    }*/
    if(sendData.password){
        sendData.password = CryptoJS.AES.encrypt(sendData.password,"{b^`)v?H&Ko*jGa1")+"";
    }
    var result = null;
    if(parseInt(request.params.userType) == 1){
        result = await dao.updateOne(request, "user",{"_id":user._id+""},sendData);
    }else if(parseInt(request.params.userType) == 2){
        var updata = {};
        sendData.name?updata["merchat.name"]=sendData.name:"";
        sendData.password?updata["merchat.password"]=sendData.password:"";
        sendData.pay_password?updata["merchat.pay_password"]=sendData.pay_password:"";
        sendData.mobile?updata["merchat.mobile"]=sendData.mobile:"";
        result = await dao.updateOne(request, "user",{"_id":user._id+""},updata);
    }else if(parseInt(request.params.userType) == 3){
        var updata = {};
        sendData.name?updata["serverPeople.name"]=sendData.name:"";
        sendData.password?updata["serverPeople.password"]=sendData.password:"";
        sendData.pay_password?updata["serverPeople.pay_password"]=sendData.pay_password:"";
        sendData.mobile?updata["serverPeople.mobile"]=sendData.mobile:"";
        result = await dao.updateOne(request, "user",{"_id":user._id+""},updata);
    }else if(parseInt(request.params.userType) == 4){
        var updata = {};
        sendData.name?updata["serverCenter.name"]=sendData.name:"";
        sendData.password?updata["serverCenter.password"]=sendData.password:"";
        sendData.pay_password?updata["serverCenter.pay_password"]=sendData.pay_password:"";
        sendData.mobile?updata["serverCenter.mobile"]=sendData.mobile:"";
        result = await dao.updateOne(request, "user",{"_id":user._id+""},updata);
    }else{
        reply({"message":"数据错误，请重新提交","statusCode":108,"status":false});
        return;
    }
    
    
    /*
    //查看验证码是否正确
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":sendData.mobile,"type":"register","code":parseInt(sendData.smsCode)});
    if(smsVerification==null){
        reply({"message":"验证码不正确，请重新输入。","statusCode":102,"status":false});
        return;
    }else{
        dao.del(request,"smsVerification",{"_id":smsVerification._id+""})
    }*/

    /*if(sendData.password){
        sendData.password = CryptoJS.AES.encrypt(sendData.password,"{b^`)v?H&Ko*jGa1")+"";
    }
    var result = await dao.updateOne(request, "user",{"_id":user._id+""},sendData);*/
    if(result==null){
        reply({"message":"更新用户失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新用户成功","statusCode":105,"status":true});
    }
}

//用户申请
exports.userApply = async function(request,reply){
    var data = request.payload;
    var user = await dao.find(request, "user", {"username":data.username});
    if(user.length>0){
        reply({"message":"账号已存在，请重新输入","statusCode":102,"status":false});
        return;
    }else{
        data.createTime = new Date().getTime();
        data.fudai = 0;       //福袋
        data.fuxing = 0;      //福星
        data.zfuxing = 0;     //累计福星
        data.unfuxing = 0;    //代缴税福星
        data.dfuxing = 0;     //冻结福星
        data.scope =["USER"];
        if(data.type==2){
          data.business = {
            fudai: 0,       //福袋
            fuxing: 0,      //福星
            zfuxing: 0,     //累计福星
            unfuxing: 0,    //代缴税福星
            dfuxing: 0,     //冻结福星
          }
        }
        data.password = CryptoJS.AES.encrypt(data.password,"{b^`)v?H&Ko*jGa1")+"";
        var result = await dao.save(request,"user",data);
        if(result==null){
            reply({"message":"添加用户成功失败","statusCode":102,"status":false});
        }else{
            reply({"message":"添加用户成功失败","statusCode":101,"status":true,"resource":result.ops[0]});
        }
    }
}

//更新用户地址
exports.updateUserAddress = async function(request, reply){
  var user = request.auth.credentials;
  if(user.state==0){
    reply({"message":"您的账号被冻结，请联系管理员！","statusCode":102,"status":false});
    return;
  }
  var result = await dao.updateTow(request, "user",{"_id":user._id+""}, {$set:{"address":request.payload.noto}});
  if(result==null){
        reply({"message":"更新用户失败","statusCode":108,"status":false});
    }else{
        reply({"message":"更新用户成功","statusCode":107,"status":true});
    }
}

//更新用户密码
exports.updateUserPasd = async function(request, reply){
    var sendData = request.payload;
    var user = null;
    if(parseInt(sendData.userType) == 1){
        user = await dao.findOne(request, "user",{'username':request.payload.mobile});
    }else if(parseInt(sendData.userType) == 2){
        user = await dao.findOne(request, "user",{'merchat.username':request.payload.mobile});
    }else if(parseInt(sendData.userType) == 3){
        user = await dao.findOne(request, "user",{'serverPeople.username':request.payload.mobile});
    }else if(parseInt(sendData.userType) == 4){
        user = await dao.findOne(request, "user",{'serverCenter.username':request.payload.mobile});
    }
    if(user == null){
        reply({"message":"用户查找失败，未找到该用户","statusCode":108,"status":false});
    }
    if(user.state==0){
        reply({"message":"您的账号被冻结，请联系管理员！","statusCode":102,"status":false});
        return;
    }
    //查看验证码是否正确
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":sendData.mobile,"type":"reEditUser","code":parseInt(request.payload.code)});
    if(smsVerification==null){
        reply({"message":"验证码不正确，请重新输入。","statusCode":102,"status":false});
        return;
    }else{
        dao.del(request,"smsVerification",{"_id":smsVerification._id+""})
    }
  var result = null;
  if(parseInt(sendData.userType) == 1){
    result = await dao.updateOne(request,"user",{"_id":user._id},{"password":CryptoJS.AES.encrypt(request.payload.password,"{b^`)v?H&Ko*jGa1")+""});
  }else if(parseInt(sendData.userType) == 2){
    result = await dao.updateOne(request,"user",{"_id":user._id},{"merchat.password":CryptoJS.AES.encrypt(request.payload.password,"{b^`)v?H&Ko*jGa1")+""});
  }else if(parseInt(sendData.userType) == 3){
    result = await dao.updateOne(request,"user",{"_id":user._id},{"serverPeople.password":CryptoJS.AES.encrypt(request.payload.password,"{b^`)v?H&Ko*jGa1")+""});
  }else if(parseInt(sendData.userType) == 4){
    result = await dao.updateOne(request,"user",{"_id":user._id},{"serverCenter.password":CryptoJS.AES.encrypt(request.payload.password,"{b^`)v?H&Ko*jGa1")+""});
  }
  if(result==null){
      reply({"message":"更新用户密码失败","statusCode":108,"status":false});
  }else{
      reply({"message":"更新用户密码成功","statusCode":107,"status":true});
  }
}

// 前台 用户推荐商户或者服务商
exports.addUserRecommenMoredAct = async function(request, reply){
    var user = request.auth.credentials;
    var systemSetData = await dao.find(request,"systemSet");
    var systemSet = systemSetData[0].systemSet;
    var data = request.payload;
    //查看验证码是否正确
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":data.mobile,"type":"register","code":parseInt(data.smsCode)});
    if(smsVerification==null){
        reply({"message":"验证码不正确，请重新输入。","statusCode":102,"status":false});
        return;
    }else{
        dao.del(request,"smsVerification",{"_id":smsVerification._id+""})
    }
    if(data.parentUser){
        var userRoleStr = data.parentUser.replace(/[^a-z]+/ig,"");
        var parent = null;
        if(userRoleStr == "C"){  // 获赠人为 会员
            if(parseInt(data.type) != 1){
                reply({"message":"申请失败，您的权限不足","statusCode":108,"status":false});
                return;
            }
            parent = await dao.findOne(request, "user", {"user_id":data.parentUser});
            if(parent != null){
                data.parentNumber = parent.user_id;
                data.parentUser = parent.username;
                data.parentId = parent._id+"";
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }else if(userRoleStr == "B"){  // 获赠人为 商户
            if(parseInt(data.type) != 1){
                reply({"message":"申请失败，您的权限不足","statusCode":108,"status":false});
                return;
            }
            parent = await dao.findOne(request, "user", {"merchat.user_id":data.parentUser});
            if(parent != null){
                data.parentNumber = parent.merchat.user_id;
                data.parentUser = parent.merchat.username;
                data.parentId = parent._id+"";
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }else if(userRoleStr == "AB"){  // 获赠人为 服务商
            if(parseInt(data.type)>2){
                reply({"message":"申请失败，您的权限不足","statusCode":108,"status":false});
                return;
            }
            parent = await dao.findOne(request, "user", {"serverPeople.user_id":data.parentUser});
            if(parent != null){
                data.parentNumber = parent.serverPeople.user_id;
                data.parentUser = parent.serverPeople.username;
                data.parentId = parent._id+"";
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }else if(userRoleStr == "ABC"){  // 获赠人为 服务中心
            if(parseInt(data.type)>3){
                reply({"message":"申请失败，您的权限不足","statusCode":108,"status":false});
                return;
            }
            parent = await dao.findOne(request, "user", {"serverCenter.user_id":data.parentUser});
            if(parent != null){
                data.parentNumber = parent.serverCenter.user_id;
                data.parentUser = parent.serverCenter.username;
                data.parentId = parent._id+"";
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }else{
            reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
            return;
        }
    }else{
        reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
        return;
    }

    
    if(data.type < 2 || data.type > 3){
       reply({"message":"申请失败，您选择正确的角色申请","statusCode":108,"status":false});
        return; 
    }
    if(data.type == 2){
        var searchUser = await dao.find(request, "user", {"merchat.username":data.username});
        if(searchUser.length>0){
            reply({"message":"账号已存在，请重新输入","statusCode":102,"status":false});
            return;
        }
    }
    if(data.type == 3){
        var searchUser = await dao.find(request, "user", {"serverPeople.username":data.username});
        if(searchUser.length>0){
            reply({"message":"账号已存在，请重新输入","statusCode":102,"status":false});
            return;
        }
    }
    var merchantClassData = null;
    if(!data.businessType){
        reply({"message":"请先选择经营类型","statusCode":108,"status":false});
        return;
    }else{
        merchantClassData = await dao.findById(request, "merchantCategory", data.businessType+"");
        if(merchantClassData == null){
            reply({"message":"未找到该分类，请重新选择","statusCode":108,"status":false});
            return;
        }
    }
    var createTime = new Date().getTime();
    // //先 生成用户资料
    // var saveUser = {};
    // saveUser.username = data.username;
    // saveUser.mobile = data.mobile;
    // saveUser.pay_password = data.pay_password;
    // saveUser.name = data.name;
    // saveUser.type = 1;
    // saveUser.status = data.status;
    // saveUser.createTime = createTime;
    // saveUser.headImg = ""
    // saveUser.fudai = 0;       //激励中的福袋 （激励中的福袋数）
    // saveUser.sumFudai = 0;    //累加中的福袋 （满1之后放入激励中）
    // saveUser.fuxing = 0;      //福星
    // saveUser.zfuxing = 0;     //累计福星
    // saveUser.unfuxing = 0;    //代缴税福星
    // saveUser.dfuxing = 0;     //冻结福星
    // saveUser.achievement = 0; //累计消费额
    // saveUser.sumTixian = 0;   // 累计回购金额

    // saveUser.scope =["USER"];
    // var tongyi_number = await dao.inc(request,'qunli_ids','qunli_id', 100001);
    // saveUser.user_id = "C"+tongyi_number;
    // saveUser.password = CryptoJS.AES.encrypt(data.password,"{b^`)v?H&Ko*jGa1")+"";
    // var resultSaveUser = await dao.save(request,"user",saveUser);

    var saveData = {};
    var merchat = {
        auth_user: false,
        merchant_name: data.merchant_name,
        merchant_leader: data.merchant_leader,
        username: data.mobile,
        name: data.name,
        password : CryptoJS.AES.encrypt(data.password,"{b^`)v?H&Ko*jGa1")+"",
        pay_password: data.pay_password,
        mobile: data.mobile,
        merchant_idCard: data.merchant_idCard,
        /*merchant_bankCard: data.merchant_bankCard,
        merchant_bankType: data.merchant_bankType,
        merchant_bankName: data.merchant_bankName,*/
        merchant_area: data.merchant_area,
        merchant_city: data.merchant_city,
        merchant_province: data.merchant_province,
        merchant_address: data.merchant_address,
        merchant_tell: data.merchant_tell,
        merchant_description: data.merchant_description,
        businessType: (merchantClassData==null)?"":merchantClassData.className,
        businessTypeId: (merchantClassData==null)?"":merchantClassData._id+"",
        transferModel: data.transferModel,
        idCord_zm: data.idCord_zm,
        idCord_fm: data.idCord_fm,
        businessLicense: data.businessLicense,
        logoImg: data.logoImg,
        promiss: data.promiss,
        apply: createTime,  //申请时间
        recommendId: data.parentId,
        recommendUser: data.parentUser,
        recommendCode: data.parentNumber,
    }
    if(data.type==2){
        merchat.merchat_fudai = 0;       //激励中的福袋 （激励中的福袋数）
        merchat.merchat_sumFudai = 0;       //累加中的福袋 （满1之后放入激励中）
        merchat.merchat_delFudai = 0;    // 已经激活过的福袋
        merchat.merchat_fuxing = 0;      //福星
        merchat.merchat_zfuxing = 0;     //累计福星
        merchat.merchat_unfuxing = 0;    //代缴税福星
        merchat.merchat_dfuxing = 0;     //冻结福星
        merchat.merchat_achievement = 0;  // 总的让利金额
        merchat.merchat_allYingYe = 0;    // 商家总的营业额
        merchat.merchat_sumTixian = 0;    // 商家累计回购金额
        merchat.merchat_yesRL = 0;          // 商家昨日让利总金额
        merchat.merchat_zrl = 0;          // 商家历史总让利
        merchat.merchat_drl = 0;          // 商家历史 单日 最高让利
        merchat.merchat_days = 0;          // 商家距离下一周期还剩 多少天
        merchat.merchat_dabiao = 0;       // 商家距离 达标还差 多少万
        merchat.merchant_cycle = systemSet.cycle;      // 商户的让利周期
        merchat.merchant_RLState = true;    // 商家周期让利 开始和关闭状态
        
    }else{
        merchat.fuxing = 0;      //福星
        merchat.zfuxing = 0;     //累计福星
        merchat.unfuxing = 0;    //代缴税福星
        merchat.dfuxing = 0;     //冻结福星
        merchat.sumTixian = 0;   // 累计回购金额
    }

    if(data.type==2){
        saveData.merchantInfo = merchat;    //商户
    }else if(data.type==3){
        saveData.merchantInfo = merchat;    // 服务商
    }else if(data.type==4){
        saveData.merchantInfo = merchat;    // 服务中心
    }
    saveData.ApplyType = data.type;
    saveData.applyUser = data.username;
    saveData.applyState = 1;  // 1等待审核  2通过审核  3驳回审核
    saveData.applyUserCode = data.parentNumber;   //推荐人的code
    saveData.createTime = createTime;
    var result = await dao.save(request,"applyMerchant",saveData);
    if(result==null){
        reply({"message":"推荐失败","statusCode":102,"status":false});
    }else{
        /*var recommendData = {
            username: user.username,        // 推荐人的账号
            userId: user._id+"",            // 推荐人的ID
            user_code: user.user_id,        // 推荐人的编号
            recommendUser: resultSaveUser.ops[0].username,   // 被推荐人的账号
            recommendMobile: resultSaveUser.ops[0].mobile,   // 被推荐人的手机号
            recommendId: resultSaveUser.ops[0]._id+"",       // 被推荐人的ID
            recommendType: data.type,                // 被推荐人的类型  // 1用户 2商户 3服务商
            createTime: createTime,       
        }
        await dao.save(request, "recommendRecord",recommendData);   //生成推荐记录*/
        reply({"message":"推荐成功,请等待审核","statusCode":107,"status":true});
    }
}

// 前台 用户推荐注册会员
exports.addUserRecommendUserAct = async function(request, reply){
    var user = request.auth.credentials;
    var data = request.payload;
    var searchUser = await dao.find(request, "user", {"username":data.username});
    if(searchUser.length>0){
        reply({"message":"账号已存在，请重新输入","statusCode":102,"status":false});
        return;
    }
    //查看验证码是否正确
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":data.mobile,"type":"register","code":parseInt(data.smsCode)});
    if(smsVerification==null){
        reply({"message":"验证码不正确，请重新输入。","statusCode":102,"status":false});
        return;
    }else{
        dao.del(request,"smsVerification",{"_id":smsVerification._id+""})
    }
    if(data.parentUser){
        var userCodeStr = data.parentUser;
        var userRoleStr = userCodeStr.replace(/[^a-z]+/ig,"");
        var parent = null;
        if(userRoleStr == "C"){  // 获赠人为 会员
            parent = await dao.findOne(request, "user", {"user_id":data.parentUser});
            if(parent != null){
                data.parentNumber = parent.user_id;
                data.parentUser = parent.username;
                data.parentId = parent._id+"";
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }else if(userRoleStr == "B"){  // 获赠人为 商户
            parent = await dao.findOne(request, "user", {"merchat.user_id":data.parentUser});
            if(parent != null){
                data.parentNumber = parent.merchat.user_id;
                data.parentUser = parent.merchat.username;
                data.parentId = parent._id+"";
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }else if(userRoleStr == "AB"){  // 获赠人为 服务商
            parent = await dao.findOne(request, "user", {"serverPeople.user_id":data.parentUser});
            if(parent != null){
                data.parentNumber = parent.serverPeople.user_id;
                data.parentUser = parent.serverPeople.username;
                data.parentId = parent._id+"";
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }else if(userRoleStr == "ABC"){  // 获赠人为 服务中心
            parent = await dao.findOne(request, "user", {"serverCenter.user_id":data.parentUser});
            if(parent != null){
                data.parentNumber = parent.serverCenter.user_id;
                data.parentUser = parent.serverCenter.username;
                data.parentId = parent._id+"";
            }else{
                reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
                return;
            }
        }else{
            reply({"message":"推荐人不存在，请重新输入","statusCode":102,"status":false});
            return;
        }
    }else{
        data.parentNumber = "";
        data.parentUser = "";
        data.parentId = "";
    }
    var createTime = new Date().getTime();
    data.auth_user = false;
    data.createTime = createTime;
    data.headImg = ""
    data.fudai = 0;       //激励中的福袋 （激励中的福袋数）
    data.sumFudai = 0;    //累加中的福袋 （满1之后放入激励中）
    data.fuxing = 0;      //福星
    data.zfuxing = 0;     //累计福星
    data.unfuxing = 0;    //代缴税福星
    data.dfuxing = 0;     //冻结福星
    data.achievement = 0; //累计消费额
    data.sumTixian = 0;   // 累计回购金额
    data.scope =["USER"];
    var tongyi_number = await dao.inc(request,'qunli_ids','qunli_id', 100001);
    data.user_id = "C"+tongyi_number;
    data.password = CryptoJS.AES.encrypt(data.password,"{b^`)v?H&Ko*jGa1")+"";
    var result = null;
    var addUser = await dao.findOne(request, "user",{"common_username":data.username+""});
    if(addUser != null){
        var scopeArray = addUser.scope;
        scopeArray.push("USER");
        result = await dao.updateOne(request,"user",{"_id":addUser._id+""},{...data,'scope': scopeArray})
    }else{
        var scopeArray = [];
        scopeArray.push("USER");
        result = await dao.save(request, "user",{...data,'scope': scopeArray, "common_username": data.username+""});  //生成公共的账号
    }
    //var result = await dao.save(request,"user",data);
    if(result==null){
        reply({"message":"推荐用户失败","statusCode":102,"status":false});
    }else{
        var recommendData = {
            username: user.username,        // 推荐人的账号
            userId: user._id+"",            // 推荐人的ID
            user_code: data.parentNumber,        // 推荐人的编号
            recommendUser: result.ops[0].username,   // 被推荐人的账号
            recommendMobile: result.ops[0].mobile,   // 被推荐人的手机号
            recommendId: result.ops[0]._id+"",       // 被推荐人的ID
            recommendCode: result.ops[0].user_id,   // 被推荐人的ID
            recommendType: data.type,                // 被推荐人的类型  // 1用户 2商户 3服务商
            createTime: createTime,       
        }
        await dao.save(request, "recommendRecord",recommendData);   //生成推荐记录 
        reply({"message":"推荐用户成功","statusCode":107,"status":true});
    }
}

// 前台 用户的推荐记录
exports.getUserRecommendList = async function(request, reply){
    var user = request.auth.credentials;
    var userType = parseInt(request.params.userType);
    if(userType<1 || userType>4){
        reply({"message":"查找失败，您的身份验证失败","statusCode":108,"status":false});
        return;
    }
    var arrayType = [], userCode="";
    if(userType == 4){
        if(!user.serverCenter){
            reply({"message":"查找失败，您的身份验证失败","statusCode":108,"status":false});
            return;
        }
        arrayType =[1,2,3];
        userCode = user.serverCenter.user_id;
    }
    if(userType == 3){
        if(!user.serverPeople){
            reply({"message":"查找失败，您的身份验证失败","statusCode":108,"status":false});
            return;
        }
        arrayType =[1,2];
        userCode = user.serverPeople.user_id;
    }
    if(userType == 2){
        if(!user.merchat){
            reply({"message":"查找失败，您的身份验证失败","statusCode":108,"status":false});
            return;
        }
        arrayType =[1];
        userCode = user.merchat.user_id;
    }
    if(userType == 1){
        if(!user.user_id){
            reply({"message":"查找失败，您的身份验证失败","statusCode":108,"status":false});
            return;
        }
        arrayType =[1];
        userCode = user.user_id;
    }
    var result = await dao.find(request, "recommendRecord", {"user_code": userCode+"","recommendType":{$in:arrayType}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"recommendRecord",{"user_code": userCode+"","recommendType":{$in:arrayType}});
    if(result == null){
        reply({"message":"查找用户的推荐记录失败！","statusCode":102,"status":false});
        return;
    }else{
        reply({"message":"查找用户的推荐记录成功","statusCode":107,"status":true,"resource":result,"sum":sum});
        return;
    }
}

// 用户添加转账
exports.addGiveAwayAct = async function(request, reply){
    var user = request.auth.credentials;
    var sendData = request.payload;
    if(user.state==0){
        reply({"message":"您的账号被冻结，请联系管理员！","statusCode":102,"status":false});
        return;
    }
    //查看验证码是否正确
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":sendData.mobile,"type":"reEditUser","code":parseInt(sendData.smsCode)});
    if(smsVerification==null){
        reply({"message":"验证码不正确，请重新输入。","statusCode":102,"status":false});
        return;
    }else{
        dao.del(request,"smsVerification",{"_id":smsVerification._id+""})
    }

    if(parseInt(sendData.roleType)>4 || parseInt(sendData.roleType)<1){
        reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
        return;
    }
    if(parseInt(sendData.roleType) == 1){
        if(user.pay_password != sendData.pay_password){
            reply({"message":"支付密码不正确，请重新输入！","statusCode":102,"status":false});
            return;
        }
    }else if(parseInt(sendData.roleType) == 2){
        if(user.merchat.pay_password != sendData.pay_password){
            reply({"message":"支付密码不正确，请重新输入！","statusCode":102,"status":false});
            return;
        }
    }else if(parseInt(sendData.roleType) == 3){
        if(user.serverPeople.pay_password != sendData.pay_password){
            reply({"message":"支付密码不正确，请重新输入！","statusCode":102,"status":false});
            return;
        }
    }else if(parseInt(sendData.roleType) == 4){
        if(user.serverCenter.pay_password != sendData.pay_password){
            reply({"message":"支付密码不正确，请重新输入！","statusCode":102,"status":false});
            return;
        }
    }
    
    var userRoleStr = sendData.getUser.replace(/[^a-z]+/ig,"");
    if(userRoleStr == "C"){  // 获赠人为 会员
        var getUser = await dao.findOne(request, "user", {"user_id":sendData.getUser});
        if(getUser == null){
            reply({"message":"转增失败，未找到该用户！","statusCode":102,"status":false});
            return;
        }
        if(parseInt(sendData.type) == 1){  //普通福星
            if(sendData.roleType == 1){         //普通用户
                if(user.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 2){   //代缴税福星
            if(sendData.roleType == 1){         //普通用户
                if(user.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 3){   // 冻结福星
            if(sendData.roleType == 1){         //普通用户
                if(user.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 4){   // 福袋
            if(sendData.roleType == 1){         //普通用户
                if(user.fudai < sendData.number || user.fudai-sendData.number < 1){
                    reply({"message":"您的福袋不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"fudai":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"fudai":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: sendData.number,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: 0,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 10,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.name,
                        userMobile: getUser.mobile,
                        userCode: getUser.user_id,
                        fudai: sendData.number,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: 0,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 10,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType > 1){         //商户
                reply({"message":"同等价值的福袋才可以相互转增！","statusCode":102,"status":false});
                return;
            }
        }
        var fromUseRoleStr = "", fromUseStr="", fromMobileStr="";
        if(sendData.roleType == 1){
            fromUseRoleStr = user.user_id;
            fromUseStr = user.username;
            fromMobileStr = user.mobile;
        }else if(sendData.roleType == 2){
            fromUseRoleStr = user.merchat.user_id;
            fromUseStr = user.merchat.merchant_name;
            fromMobileStr = user.merchat.merchant_tell;
        }else if(sendData.roleType == 3){
            fromUseRoleStr = user.serverPeople.user_id;
            fromUseStr = user.serverPeople.merchant_name;
            fromMobileStr = user.serverPeople.merchant_tell;
        }else if(sendData.roleType == 4){
            fromUseRoleStr = user.serverCenter.user_id;
            fromUseStr = user.serverCenter.merchant_name;
            fromMobileStr = user.serverCenter.merchant_tell;
        }
        var saveData = {
            fromUser: fromUseStr,
            fromMobile: fromMobileStr,
            fromUserId: user._id+"",
            fromUserqlId: fromUseRoleStr,
            gold: sendData.number,
            getUser: getUser.username,
            getMobile: getUser.mobile,
            getUserId: getUser._id+"",
            getUserqlId: getUser.user_id,
            roleType: sendData.roleType,    //roleType: Joi.number().required('转增人的身份 1普通用户 2商户 3服务商 4服务中心'),
            type: parseInt(sendData.type),
            createTime: new Date().getTime(),
        }
        await dao.save(request, "giveAwayFXRecord",saveData);
        reply({"message":"转增成功！","statusCode":107,"status":true});
        return;
    }
    if(userRoleStr == "B"){  // 商户
        var getUser = await dao.findOne(request, "user", {"merchat.user_id":sendData.getUser});
        if(getUser == null){
            reply({"message":"转增失败，未找到该用户！","statusCode":102,"status":false});
            return;
        }
        if(parseInt(sendData.type) == 1){  //普通福星
            if(sendData.roleType == 1){         //普通用户
                if(user.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 2){   //代缴税福星
            if(sendData.roleType == 1){         //普通用户
                if(user.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 3){   // 冻结福星
            if(sendData.roleType == 1){         //普通用户
                if(user.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 4){   // 福袋
            if(sendData.roleType == 2){         //商户
                if(user.merchat.merchat_fudai < sendData.number || user.merchat.merchat_fudai-sendData.number < 1){
                    reply({"message":"您的福袋不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_fudai":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"merchat.merchat_fudai":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: sendData.number,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: 0,   // 冻结福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 10,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.merchat.merchant_name,
                        userMobile: getUser.merchat.merchant_tell,
                        userCode: getUser.merchat.user_id,
                        fudai: sendData.number,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: 0,   // 冻结福星
                        userType: 2,               // 1用户 2商户 3服务商 4服务中心
                        type: 10,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType != 2){         //商户
                reply({"message":"同等价值的福袋才可以相互转增！","statusCode":102,"status":false});
                return;
            }
        }
        var fromUseRoleStr = "", fromUseStr="", fromMobileStr="";
        if(sendData.roleType == 1){
            fromUseRoleStr = user.user_id;
            fromUseStr = user.username;
            fromMobileStr = user.mobile;
        }else if(sendData.roleType == 2){
            fromUseRoleStr = user.merchat.user_id;
            fromUseStr = user.merchat.merchant_name;
            fromMobileStr = user.merchat.merchant_tell;
        }else if(sendData.roleType == 3){
            fromUseRoleStr = user.serverPeople.user_id;
            fromUseStr = user.serverPeople.merchant_name;
            fromMobileStr = user.serverPeople.merchant_tell;
        }else if(sendData.roleType == 4){
            fromUseRoleStr = user.serverCenter.user_id;
            fromUseStr = user.serverCenter.merchant_name;
            fromMobileStr = user.serverCenter.merchant_tell;
        }
        var saveData = {
            fromUser: fromUseStr,
            fromMobile: fromMobileStr,
            fromUserId: user._id+"",
            fromUserqlId: fromUseRoleStr,
            gold: sendData.number,
            getUser: getUser.merchat.merchant_name,
            getMobile: getUser.merchat.merchant_tell,
            getUserId: getUser._id+"",
            getUserqlId: getUser.merchat.user_id,
            roleType: sendData.roleType,    //roleType: Joi.number().required('转增人的身份 1普通用户 2商户 3服务商 4服务中心'),
            type: parseInt(sendData.type),
            createTime: new Date().getTime(),
        }
        await dao.save(request, "giveAwayFXRecord",saveData);
        reply({"message":"转增成功！","statusCode":107,"status":true});
        return;
    }
    if(userRoleStr == "AB"){  // 服务商
        var getUser = await dao.findOne(request, "user", {"serverPeople.user_id":sendData.getUser});
        if(getUser == null){
            reply({"message":"转增失败，未找到该用户！","statusCode":102,"status":false});
            return;
        }
        if(parseInt(sendData.type) == 1){  //普通福星
            if(sendData.roleType == 1){         //普通用户
                if(user.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 2){   //代缴税福星
            if(sendData.roleType == 1){         //普通用户
                if(user.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 3){   // 冻结福星
            if(sendData.roleType == 1){         //普通用户
                if(user.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverPeople.dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverPeople.merchant_name,
                        userMobile: getUser.serverPeople.merchant_tell,
                        userCode: getUser.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 4){   // 福袋
            reply({"message":"同等价值的福袋才可以相互转增！","statusCode":102,"status":false});
            return;
        }
        var fromUseRoleStr = "", fromUseStr="", fromMobileStr="";
        if(sendData.roleType == 1){
            fromUseRoleStr = user.user_id;
            fromUseStr = user.username;
            fromMobileStr = user.mobile;
        }else if(sendData.roleType == 2){
            fromUseRoleStr = user.merchat.user_id;
            fromUseStr = user.merchat.merchant_name;
            fromMobileStr = user.merchat.merchant_tell;
        }else if(sendData.roleType == 3){
            fromUseRoleStr = user.serverPeople.user_id;
            fromUseStr = user.serverPeople.merchant_name;
            fromMobileStr = user.serverPeople.merchant_tell;
        }else if(sendData.roleType == 4){
            fromUseRoleStr = user.serverCenter.user_id;
            fromUseStr = user.serverCenter.merchant_name;
            fromMobileStr = user.serverCenter.merchant_tell;
        }
        var saveData = {
            fromUser: fromUseStr,
            fromMobile: fromMobileStr,
            fromUserId: user._id+"",
            fromUserqlId: fromUseRoleStr,
            gold: sendData.number,
            getUser: getUser.serverPeople.merchant_name,
            getMobile: getUser.serverPeople.merchant_tell,
            getUserId: getUser._id+"",
            getUserqlId: getUser.serverPeople.user_id,
            roleType: sendData.roleType,    //roleType: Joi.number().required('转增人的身份 1普通用户 2商户 3服务商 4服务中心'),
            type: parseInt(sendData.type),
            createTime: new Date().getTime(),
        }
        await dao.save(request, "giveAwayFXRecord",saveData);
        reply({"message":"转增成功！","statusCode":107,"status":true});
        return;
    }
    if(userRoleStr == "ABC"){  // 服务中心
        var getUser = await dao.findOne(request, "user", {"serverCenter.user_id":sendData.getUser});
        if(getUser == null){
            reply({"message":"转增失败，未找到该用户！","statusCode":102,"status":false});
            return;
        }
        if(parseInt(sendData.type) == 1){  //普通福星
            if(sendData.roleType == 1){         //普通用户
                if(user.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.fuxing < sendData.number){
                    reply({"message":"您的福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.fuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.fuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: sendData.number,          // 每天派发的福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 7,                    // 转增 福星
                        formState: false,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 2){   //代缴税福星
            if(sendData.roleType == 1){         //普通用户
                if(user.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.unfuxing < sendData.number){
                    reply({"message":"您的代缴税福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.unfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.unfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: sendData.number,   // 代缴税
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 8,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 3){   // 冻结福星
            if(sendData.roleType == 1){         //普通用户
                if(user.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 2){         //商户
                if(!user.merchat){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.merchat.merchat_dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 3){         //服务商
                if(!user.serverPeople){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverPeople.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
            if(sendData.roleType == 4){         //服务中心
                if(!user.serverCenter){
                    reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
                    return;
                }
                if(user.serverCenter.dfuxing < sendData.number){
                    reply({"message":"您的冻结福星不足，请重新输入！","statusCode":102,"status":false});
                    return;
                }else{
                    await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.dfuxing":-sendData.number}});
                    await dao.updateTow(request, "user", {"_id":getUser._id+""},{$inc:{"serverCenter.dfuxing":sendData.number}});
                    var saveData={
                        username: user.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,                       // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,   // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: true,               // true 为转出  false 转入
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记
                    var saveData={
                        username: getUser.username,
                        userId: getUser._id+"",
                        name: getUser.serverCenter.merchant_name,
                        userMobile: getUser.serverCenter.merchant_tell,
                        userCode: getUser.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: 0,          // 每天派发的福星
                        unfuxing: 0,        // 代缴税
                        dfuxing: sendData.number,   // 冻结福星
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: 9,                    // 转增 代缴税福星
                        formState: false,               // true 为转出  false 转入 是否为转出
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData);   //生成派发记录
                }
            }
        }
        if(parseInt(sendData.type) == 4){   // 福袋
            reply({"message":"同等价值的福袋才可以相互转增！","statusCode":102,"status":false});
            return;
        }
        var fromUseRoleStr = "", fromUseStr="", fromMobileStr="";
        if(sendData.roleType == 1){
            fromUseRoleStr = user.user_id;
            fromUseStr = user.username;
            fromMobileStr = user.mobile;
        }else if(sendData.roleType == 2){
            fromUseRoleStr = user.merchat.user_id;
            fromUseStr = user.merchat.merchant_name;
            fromMobileStr = user.merchat.merchant_tell;
        }else if(sendData.roleType == 3){
            fromUseRoleStr = user.serverPeople.user_id;
            fromUseStr = user.serverPeople.merchant_name;
            fromMobileStr = user.serverPeople.merchant_tell;
        }else if(sendData.roleType == 4){
            fromUseRoleStr = user.serverCenter.user_id;
            fromUseStr = user.serverCenter.merchant_name;
            fromMobileStr = user.serverCenter.merchant_tell;
        }
        var saveData = {
            fromUser: fromUseStr,
            fromMobile: fromMobileStr,
            fromUserId: user._id+"",
            fromUserqlId: fromUseRoleStr,
            gold: sendData.number,
            getUser: getUser.serverCenter.merchant_name,
            getMobile: getUser.serverCenter.merchant_tell,
            getUserId: getUser._id+"",
            getUserqlId: getUser.serverCenter.user_id,
            roleType: sendData.roleType,    //roleType: Joi.number().required('转增人的身份 1普通用户 2商户 3服务商 4服务中心'),
            type: parseInt(sendData.type),
            createTime: new Date().getTime(),
        }
        await dao.save(request, "giveAwayFXRecord",saveData);
        reply({"message":"转增成功！","statusCode":107,"status":true});
        return;
    }else{
        reply({"message":"请填写正确的用户ID编号！","statusCode":102,"status":false});
        return;
    }
}

// 前台 某用户的转增列表
exports.addGiveAwayListAct = async function(request, reply){
    var user = request.auth.credentials;
    if(parseInt(request.params.userType) == 1){  //普通会员
        var result = await dao.find(request, "giveAwayFXRecord", {"roleType": parseInt(request.params.userType),"fromUser": user.username},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
        var sum = await dao.findCount(request,"giveAwayFXRecord",{"roleType": parseInt(request.params.userType),"fromUser": user.username});
        if(result == null){
            reply({"message":"查找会员转增列表失败！","statusCode":102,"status":false});
            return;
        }else{
            reply({"message":"查找会员转增列表成功","statusCode":107,"status":true,"resource":result,"sum":sum});
            return;
        }
    }
    if(parseInt(request.params.userType) == 2){  //商户
        var result = await dao.find(request, "giveAwayFXRecord", {"roleType": parseInt(request.params.userType),"fromUser": user.merchat.merchant_name},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
        var sum = await dao.findCount(request,"giveAwayFXRecord",{"roleType": parseInt(request.params.userType),"fromUser": user.merchat.merchant_name});
        if(result == null){
            reply({"message":"查找会员转增列表失败！","statusCode":102,"status":false});
            return;
        }else{
            reply({"message":"查找会员转增列表成功","statusCode":107,"status":true,"resource":result,"sum":sum});
            return;
        }
    }
    if(parseInt(request.params.userType) == 3){  //服务商
        var result = await dao.find(request, "giveAwayFXRecord", {"roleType": parseInt(request.params.userType),"fromUser": user.serverPeople.merchant_name},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
        var sum = await dao.findCount(request,"giveAwayFXRecord",{"roleType": parseInt(request.params.userType),"fromUser": user.serverPeople.merchant_name});
        if(result == null){
            reply({"message":"查找会员转增列表失败！","statusCode":102,"status":false});
            return;
        }else{
            reply({"message":"查找会员转增列表成功","statusCode":107,"status":true,"resource":result,"sum":sum});
            return;
        }
    }
    if(parseInt(request.params.userType) == 4){  //服务中心
        var result = await dao.find(request, "giveAwayFXRecord", {"roleType": parseInt(request.params.userType),"fromUser": user.serverCenter.merchant_name},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
        var sum = await dao.findCount(request,"giveAwayFXRecord",{"roleType": parseInt(request.params.userType),"fromUser": user.serverCenter.merchant_name});
        if(result == null){
            reply({"message":"查找会员转增列表失败！","statusCode":102,"status":false});
            return;
        }else{
            reply({"message":"查找会员转增列表成功","statusCode":107,"status":true,"resource":result,"sum":sum});
            return;
        }
    }
}

// 前台 某用户添加银行卡
exports.userAddBankCardAct = async function(request, reply){
    var user = request.auth.credentials;
    var sendData = request.payload;
    var authUser = await dao.findOne(request, "authenticationRecord", {"userId": user._id+""});
    if(authUser == null){
        reply({"message":"您还没有实名认证，请先实名认证","statusCode":102,"status":false});
        return;
    }
    if(sendData.bankUserName != authUser.trueName){
        reply({"message":"请添加本人实名认证的银行卡，请重新输入","statusCode":102,"status":false});
        return;
    }
    var searchData = await dao.find(request, "bankCardRecord", {"userId": user._id+"", "bankCardNumber": sendData.bankCardNumber});
    if(searchData.length > 0){
        reply({"message":"银行卡已存在，请重新输入","statusCode":102,"status":false});
        return;
    }
    sendData.userId = user._id+"";
    sendData.username = user.username;
    var result2 = await dao.save(request, "bankCardRecord", sendData);
    if(result2 == null){
        reply({"message":"添加银行卡失败","statusCode":102,"status":false});
        return;
    }else{
        reply({"message":"添加银行卡成功","statusCode":107,"status":true});
        return;
    }
}

// 前台 删除某用户的银行卡
exports.userDelBankCardAct = async function(request, reply){
    var result = await dao.del(request,"bankCardRecord",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除银行卡失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除银行卡成功","statusCode":103,"status":true});
    }
}

// 前台 某用户的银行卡列表
exports.addBankcardListAct = async function(request, reply){
    var user = request.auth.credentials;
    var searchData = await dao.find(request, "bankCardRecord", {"userId": user._id+""});
    if(searchData == null){
        reply({"message":"获取银行卡列表失败","statusCode":102,"status":false});
        return;
    }else{
        reply({"message":"获取银行卡列表成功","statusCode":107,"status":true, "resource":searchData});
        return;
    }
}

// 前台 用户申请回购
exports.userApplyWithdrawals = async function(request, reply){
    var user = request.auth.credentials;
    var sendData = request.payload;
    var systemSetData = await dao.find(request,"systemSet");
    var systemSet = systemSetData[0].systemSet;
    if(user.state==0){
        reply({"message":"您的账号被冻结，请联系管理员！","statusCode":102,"status":false});
        return;
    }
    if(parseInt(sendData.roleType)>4 || parseInt(sendData.roleType)<1){
        reply({"message":"身份认证失败，转增失败！","statusCode":102,"status":false});
        return;
    }
    if(sendData.roleType == 1){ //会员
        if(user.pay_password != sendData.pay_password){
            reply({"message":"支付密码不正确，请重新输入！","statusCode":102,"status":false});
            return;
        }
    }else if(sendData.roleType == 2){ //商户
        if(user.merchat.pay_password != sendData.pay_password){
            reply({"message":"支付密码不正确，请重新输入！","statusCode":102,"status":false});
            return;
        }
    }else if(sendData.roleType == 3){ //服务商
        if(user.serverPeople.pay_password != sendData.pay_password){
            reply({"message":"支付密码不正确，请重新输入！","statusCode":102,"status":false});
            return;
        }
    }else if(sendData.roleType == 4){ //服务中心
        if(user.serverCenter.pay_password != sendData.pay_password){
            reply({"message":"支付密码不正确，请重新输入！","statusCode":102,"status":false});
            return;
        }
    }
    var searchBankCardInfo = await dao.findById(request, "bankCardRecord", sendData.bankCardId+"");
    if(searchBankCardInfo == null){
        reply({"message":"未找到该银行卡，请重新选择！","statusCode":102,"status":false});
        return;
    }else{
        sendData.bankCardNumber = searchBankCardInfo.bankCardNumber;
        sendData.bankCardName = searchBankCardInfo.bankCardName;
        sendData.bankSubBranch = searchBankCardInfo.bankSubBranch;
        sendData.bankUserName = searchBankCardInfo.bankUserName;
    }
    if(sendData.applyGold<=0){
        reply({"message":"请输入正确的金额","statusCode":102,"status":false});
        return;
    }
    if(sendData.applyGold ==0 || sendData.applyGold%systemSet.hg_baseNum!=0){
        reply({"message":"回购数量必须为"+systemSet.hg_baseNum+"的整数倍","statusCode":102,"status":false});
        return;
    }
    if(sendData.applyType == 1){    // 1普通福星
        if(sendData.roleType == 1){ //会员
            if(!user.auth_user){
                reply({"message":"回购失败，您还没有实名认证！","statusCode":102,"status":false});
                return;
            }
            if(user.fuxing < sendData.applyGold){
                reply({"message":"回购失败，您还没有足够的福星！","statusCode":102,"status":false});
                return;
            }else{
                var result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"fuxing":-sendData.applyGold}});
                if(result == null){
                    reply({"message":"系统错误,回购失败！","statusCode":102,"status":false});
                    return;
                }else{
                    var saveData = {
                        username: user.username,        //用户账号
                        qunli_id: user.user_id,         // 用户群里ID
                        mobile: user.mobile,            // 用户的手机号
                        name: user.name,                // 用户的名字
                        userId: user._id+"",
                        bankCardNum: sendData.bankCardNumber,       //银行卡号
                        bankCardName: sendData.bankCardName,       //所属银行
                        bankSubBranch: sendData.bankSubBranch,      // 开户支行
                        bankUserName: sendData.bankUserName,       // 真实姓名
                        bankCardId: sendData.bankCardId,       //银行卡号Id
                        applyType: sendData.applyType,          // 1普通福星 2代缴税福星
                        applyGold: sendData.applyGold,          // 回购金额
                        sxf: systemSet.hg_sxf,                  // 手续费
                        actualGold: Math.round(parseFloat((sendData.applyGold-systemSet.hg_sxf)*100))/100,   //实际到账的金额
                        state: 1,           // 1 申请回购  2 通过申请  3 驳回申请
                        createTime: new Date().getTime()
                    }
                    var saveData2={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: parseInt(sendData.applyType) == 1?sendData.applyGold:0,          // 每天派发的福星
                        unfuxing: parseInt(sendData.applyType) == 2?sendData.applyGold:0,
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: parseInt(sendData.applyType) == 1? 11:12,                    // 转增 福星
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData2);   //生成派发记录

                    await dao.save(request, "withdrawalsApplyRecord", saveData);
                    var newUser = await dao.findById(request,'user',user._id+"");
                    user.systemSet = systemSet;
                    newUser.systemSet = systemSet;
                    if(newUser == null){
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":user});
                        return;
                    }else{
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":newUser});
                        return;
                    }
                }
            }
        }
        if(sendData.roleType == 2){ //商户
            if(!user.auth_user){
                reply({"message":"回购失败，您还没有实名认证！","statusCode":102,"status":false});
                return;
            }
            if(user.merchat.merchat_fuxing < sendData.applyGold){
                reply({"message":"回购失败，您还没有足够的福星！","statusCode":102,"status":false});
                return;
            }else{
                var result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_fuxing":-sendData.applyGold}});
                if(result == null){
                    reply({"message":"系统错误,回购失败！","statusCode":102,"status":false});
                    return;
                }else{
                    var saveData = {
                        username: user.merchat.username,        //用户账号
                        qunli_id: user.merchat.user_id,         // 用户群里ID
                        mobile: user.merchat.merchant_tell,            // 用户的手机号
                        name: user.merchat.merchant_name,                // 用户的名字
                        userId: user._id+"",
                        bankCardNum: sendData.bankCardNumber,       //银行卡号
                        bankCardName: sendData.bankCardName,       //所属银行
                        bankSubBranch: sendData.bankSubBranch,      // 开户支行
                        bankUserName: sendData.bankUserName,       // 真实姓名
                        bankCardId: sendData.bankCardId,       //银行卡号Id
                        applyType: sendData.applyType,          // 1普通福星 2代缴税福星
                        applyGold: sendData.applyGold,          // 回购金额
                        sxf: systemSet.hg_sxf,                  // 手续费
                        actualGold: Math.round(parseFloat((sendData.applyGold-systemSet.hg_sxf)*100))/100,   //实际到账的金额
                        state: 1,           // 1 申请回购  2 通过申请  3 驳回申请
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "withdrawalsApplyRecord", saveData);
                    var saveData2={
                        username: user.merchat.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: parseInt(sendData.applyType) == 1?sendData.applyGold:0,          // 每天派发的福星
                        unfuxing: parseInt(sendData.applyType) == 2?sendData.applyGold:0,
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: parseInt(sendData.applyType) == 1? 11:12,                    // 转增 福星
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
                    var newUser = await dao.findById(request,'user',user._id+"");
                    user.systemSet = systemSet;
                    newUser.systemSet = systemSet;
                    if(newUser == null){
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":user});
                        return;
                    }else{
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":newUser});
                        return;
                    }
                }

            }
        }
        if(sendData.roleType == 3){ //服务商
            if(!user.auth_user){
                reply({"message":"回购失败，您还没有实名认证！","statusCode":102,"status":false});
                return;
            }
            if(user.serverPeople.fuxing < sendData.applyGold){
                reply({"message":"回购失败，您还没有足够的福星！","statusCode":102,"status":false});
                return;
            }else{
                var result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.fuxing":-sendData.applyGold}});
                if(result == null){
                    reply({"message":"系统错误,回购失败！","statusCode":102,"status":false});
                    return;
                }else{
                    var saveData = {
                        username: user.serverPeople.username,        //用户账号
                        qunli_id: user.serverPeople.user_id,         // 用户群里ID
                        mobile: user.serverPeople.merchant_tell,            // 用户的手机号
                        name: user.serverPeople.merchant_name,                // 用户的名字
                        userId: user._id+"",
                        bankCardNum: sendData.bankCardNumber,       //银行卡号
                        bankCardName: sendData.bankCardName,       //所属银行
                        bankSubBranch: sendData.bankSubBranch,      // 开户支行
                        bankUserName: sendData.bankUserName,       // 真实姓名
                        bankCardId: sendData.bankCardId,       //银行卡号Id
                        applyType: sendData.applyType,          // 1普通福星 2代缴税福星
                        applyGold: sendData.applyGold,          // 回购金额
                        sxf: systemSet.hg_sxf,                  // 手续费
                        actualGold: Math.round(parseFloat((sendData.applyGold-systemSet.hg_sxf)*100))/100,   //实际到账的金额
                        state: 1,           // 1 申请回购  2 通过申请  3 驳回申请
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "withdrawalsApplyRecord", saveData);
                    var saveData2={
                        username: user.serverPeople.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: parseInt(sendData.applyType) == 1?sendData.applyGold:0,          // 每天派发的福星
                        unfuxing: parseInt(sendData.applyType) == 2?sendData.applyGold:0,
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: parseInt(sendData.applyType) == 1? 11:12,                    // 转增 福星
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
                    var newUser = await dao.findById(request,'user',user._id+"");
                    user.systemSet = systemSet;
                    newUser.systemSet = systemSet;
                    if(newUser == null){
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":user});
                        return;
                    }else{
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":newUser});
                        return;
                    }
                }
            }
        }
        if(sendData.roleType == 4){ //服务中心
            if(!user.auth_user){
                reply({"message":"回购失败，您还没有实名认证！","statusCode":102,"status":false});
                return;
            }
            if(user.serverCenter.fuxing < sendData.applyGold){
                reply({"message":"回购失败，您还没有足够的福星！","statusCode":102,"status":false});
                return;
            }else{
                var result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.fuxing":-sendData.applyGold}});
                if(result == null){
                    reply({"message":"系统错误,回购失败！","statusCode":102,"status":false});
                    return;
                }else{
                    var saveData = {
                        username: user.serverCenter.username,        //用户账号
                        qunli_id: user.serverCenter.user_id,         // 用户群里ID
                        mobile: user.serverCenter.merchant_tell,            // 用户的手机号
                        name: user.serverCenter.merchant_name,                // 用户的名字
                        userId: user._id+"",
                        bankCardNum: sendData.bankCardNumber,       //银行卡号
                        bankCardName: sendData.bankCardName,       //所属银行
                        bankSubBranch: sendData.bankSubBranch,      // 开户支行
                        bankUserName: sendData.bankUserName,       // 真实姓名
                        bankCardId: sendData.bankCardId,       //银行卡号Id
                        applyType: sendData.applyType,          // 1普通福星 2代缴税福星
                        applyGold: sendData.applyGold,          // 回购金额
                        sxf: systemSet.hg_sxf,                  // 手续费
                        actualGold: Math.round(parseFloat((sendData.applyGold-systemSet.hg_sxf)*100))/100,   //实际到账的金额
                        state: 1,           // 1 申请回购  2 通过申请  3 驳回申请
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "withdrawalsApplyRecord", saveData);
                    var saveData2={
                        username: user.serverCenter.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: parseInt(sendData.applyType) == 1?sendData.applyGold:0,          // 每天派发的福星
                        unfuxing: parseInt(sendData.applyType) == 2?sendData.applyGold:0,
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: parseInt(sendData.applyType) == 1? 11:12,                    // 转增 福星
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
                    var newUser = await dao.findById(request,'user',user._id+"");
                    user.systemSet = systemSet;
                    newUser.systemSet = systemSet;
                    if(newUser == null){
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":user});
                        return;
                    }else{
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":newUser});
                        return;
                    }
                }
            }
        }
    }
    if(sendData.applyType == 2){    // 2代缴税福星
        if(sendData.roleType == 1){
            if(!user.auth_user){
                reply({"message":"回购失败，您还没有实名认证！","statusCode":102,"status":false});
                return;
            }
            if(user.unfuxing < sendData.applyGold){
                reply({"message":"回购失败，您还没有足够的代缴税福星！","statusCode":102,"status":false});
                return;
            }else{
                var result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"unfuxing":-sendData.applyGold}});
                if(result == null){
                    reply({"message":"系统错误,回购失败！","statusCode":102,"status":false});
                    return;
                }else{
                    var saveData = {
                        username: user.username,        //用户账号
                        qunli_id: user.user_id,         // 用户群里ID
                        mobile: user.mobile,            // 用户的手机号
                        name: user.name,                // 用户的名字
                        userId: user._id+"",
                        bankCardNum: sendData.bankCardNumber,       //银行卡号
                        bankCardName: sendData.bankCardName,       //所属银行
                        bankSubBranch: sendData.bankSubBranch,      // 开户支行
                        bankUserName: sendData.bankUserName,       // 真实姓名
                        bankCardId: sendData.bankCardId,       //银行卡号Id
                        applyType: sendData.applyType,          // 1普通福星 2代缴税福星
                        applyGold: sendData.applyGold,          // 回购金额
                        sxf: Math.round(parseFloat((systemSet.hg_rate*sendData.applyGold)*100))/100,                  // 手续费
                        actualGold: Math.round(parseFloat((sendData.applyGold-systemSet.hg_rate*sendData.applyGold)*100))/100,   //实际到账的金额
                        state: 1,           // 1 申请回购  2 通过申请  3 驳回申请
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "withdrawalsApplyRecord", saveData);
                    var saveData2={
                        username: user.username,
                        userId: user._id+"",
                        name: user.name,
                        userMobile: user.mobile,
                        userCode: user.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: parseInt(sendData.applyType) == 1?sendData.applyGold:0,          // 每天派发的福星
                        unfuxing: parseInt(sendData.applyType) == 2?sendData.applyGold:0,
                        userType: 1,                // 1用户 2商户 3服务商 4服务中心
                        type: parseInt(sendData.applyType) == 1? 11:12,                    // 转增 福星
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
                    var newUser = await dao.findById(request,'user',user._id+"");
                    user.systemSet = systemSet;
                    newUser.systemSet = systemSet;
                    if(newUser == null){
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":user});
                        return;
                    }else{
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":newUser});
                        return;
                    }
                }
            }
        }
        if(sendData.roleType == 2){
            if(!user.auth_user){
                reply({"message":"回购失败，您还没有实名认证！","statusCode":102,"status":false});
                return;
            }
            if(user.merchat.merchat_unfuxing < sendData.applyGold){
                reply({"message":"回购失败，您还没有足够的代缴税福星！","statusCode":102,"status":false});
                return;
            }else{
                var result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"merchat.merchat_unfuxing":-sendData.applyGold}});
                if(result == null){
                    reply({"message":"系统错误,回购失败！","statusCode":102,"status":false});
                    return;
                }else{
                    var saveData = {
                        username: user.merchat.username,        //用户账号
                        qunli_id: user.merchat.user_id,         // 用户群里ID
                        mobile: user.merchat.merchant_tell,            // 用户的手机号
                        name: user.merchat.merchant_name,                // 用户的名字
                        userId: user._id+"",
                        bankCardNum: sendData.bankCardNumber,       //银行卡号
                        bankCardName: sendData.bankCardName,       //所属银行
                        bankSubBranch: sendData.bankSubBranch,      // 开户支行
                        bankUserName: sendData.bankUserName,       // 真实姓名
                        bankCardId: sendData.bankCardId,       //银行卡号Id
                        applyType: sendData.applyType,          // 1普通福星 2代缴税福星
                        applyGold: sendData.applyGold,          // 回购金额
                        sxf: Math.round(parseFloat((systemSet.hg_rate*sendData.applyGold)*100))/100,                  // 手续费
                        actualGold: Math.round(parseFloat((sendData.applyGold-systemSet.hg_rate*sendData.applyGold)*100))/100,   //实际到账的金额
                        state: 1,           // 1 申请回购  2 通过申请  3 驳回申请
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "withdrawalsApplyRecord", saveData);
                    var saveData2={
                        username: user.merchat.username,
                        userId: user._id+"",
                        name: user.merchat.merchant_name,
                        userMobile: user.merchat.merchant_tell,
                        userCode: user.merchat.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: parseInt(sendData.applyType) == 1?sendData.applyGold:0,          // 每天派发的福星
                        unfuxing: parseInt(sendData.applyType) == 2?sendData.applyGold:0,
                        userType: 2,                // 1用户 2商户 3服务商 4服务中心
                        type: parseInt(sendData.applyType) == 1? 11:12,                    // 转增 福星
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
                    var newUser = await dao.findById(request,'user',user._id+"");
                    user.systemSet = systemSet;
                    newUser.systemSet = systemSet;
                    if(newUser == null){
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":user});
                        return;
                    }else{
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":newUser});
                        return;
                    }
                }
            }
        }
        if(sendData.roleType == 3){
            if(!user.auth_user){
                reply({"message":"回购失败，您还没有实名认证！","statusCode":102,"status":false});
                return;
            }
            if(user.serverPeople.unfuxing < sendData.applyGold){
                reply({"message":"回购失败，您还没有足够的代缴税福星！","statusCode":102,"status":false});
                return;
            }else{
                var result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverPeople.unfuxing":-sendData.applyGold}});
                if(result == null){
                    reply({"message":"系统错误,回购失败！","statusCode":102,"status":false});
                    return;
                }else{
                    var saveData = {
                        username: user.serverPeople.username,        //用户账号
                        qunli_id: user.serverPeople.user_id,         // 用户群里ID
                        mobile: user.serverPeople.merchant_tell,            // 用户的手机号
                        name: user.serverPeople.merchant_name,                // 用户的名字
                        userId: user._id+"",
                        bankCardNum: sendData.bankCardNumber,       //银行卡号
                        bankCardName: sendData.bankCardName,       //所属银行
                        bankSubBranch: sendData.bankSubBranch,      // 开户支行
                        bankUserName: sendData.bankUserName,       // 真实姓名
                        bankCardId: sendData.bankCardId,       //银行卡号Id
                        applyType: sendData.applyType,          // 1普通福星 2代缴税福星
                        applyGold: sendData.applyGold,          // 回购金额
                        sxf: Math.round(parseFloat((systemSet.hg_rate*sendData.applyGold)*100))/100,                  // 手续费
                        actualGold: Math.round(parseFloat((sendData.applyGold-systemSet.hg_rate*sendData.applyGold)*100))/100,   //实际到账的金额
                        state: 1,           // 1 申请回购  2 通过申请  3 驳回申请
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "withdrawalsApplyRecord", saveData);
                    var saveData2={
                        username: user.serverPeople.username,
                        userId: user._id+"",
                        name: user.serverPeople.merchant_name,
                        userMobile: user.serverPeople.merchant_tell,
                        userCode: user.serverPeople.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: parseInt(sendData.applyType) == 1?sendData.applyGold:0,          // 每天派发的福星
                        unfuxing: parseInt(sendData.applyType) == 2?sendData.applyGold:0,
                        userType: 3,                // 1用户 2商户 3服务商 4服务中心
                        type: parseInt(sendData.applyType) == 1? 11:12,                    // 转增 福星
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
                    var newUser = await dao.findById(request,'user',user._id+"");
                    user.systemSet = systemSet;
                    newUser.systemSet = systemSet;
                    if(newUser == null){
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":user});
                        return;
                    }else{
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":newUser});
                        return;
                    }
                }
            }
        }
        if(sendData.roleType == 4){
            if(!user.auth_user){
                reply({"message":"回购失败，您还没有实名认证！","statusCode":102,"status":false});
                return;
            }
            if(user.serverCenter.unfuxing < sendData.applyGold){
                reply({"message":"回购失败，您还没有足够的代缴税福星！","statusCode":102,"status":false});
                return;
            }else{
                var result = await dao.updateTow(request, "user", {"_id":user._id+""},{$inc:{"serverCenter.unfuxing":-sendData.applyGold}});
                if(result == null){
                    reply({"message":"系统错误,回购失败！","statusCode":102,"status":false});
                    return;
                }else{
                    var saveData = {
                        username: user.serverCenter.username,        //用户账号
                        qunli_id: user.serverCenter.user_id,         // 用户群里ID
                        mobile: user.serverCenter.merchant_tell,            // 用户的手机号
                        name: user.serverCenter.merchant_name,                // 用户的名字
                        userId: user._id+"",
                        bankCardNum: sendData.bankCardNumber,       //银行卡号
                        bankCardName: sendData.bankCardName,       //所属银行
                        bankSubBranch: sendData.bankSubBranch,      // 开户支行
                        bankUserName: sendData.bankUserName,       // 真实姓名
                        bankCardId: sendData.bankCardId,       //银行卡号Id
                        applyType: sendData.applyType,          // 1普通福星 2代缴税福星
                        applyGold: sendData.applyGold,          // 回购金额
                        sxf: Math.round(parseFloat((systemSet.hg_rate*sendData.applyGold)*100))/100,                  // 手续费
                        actualGold: Math.round(parseFloat((sendData.applyGold-systemSet.hg_rate*sendData.applyGold)*100))/100,   //实际到账的金额
                        state: 1,           // 1 申请回购  2 通过申请  3 驳回申请
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "withdrawalsApplyRecord", saveData);
                    var saveData2={
                        username: user.serverCenter.username,
                        userId: user._id+"",
                        name: user.serverCenter.merchant_name,
                        userMobile: user.serverCenter.merchant_tell,
                        userCode: user.serverCenter.user_id,
                        fudai: 0,            // 每天扣除的福袋
                        fuxing: parseInt(sendData.applyType) == 1?sendData.applyGold:0,          // 每天派发的福星
                        unfuxing: parseInt(sendData.applyType) == 2?sendData.applyGold:0,
                        userType: 4,                // 1用户 2商户 3服务商 4服务中心
                        type: parseInt(sendData.applyType) == 1? 11:12,                    // 转增 福星
                        createTime: new Date().getTime()
                    }
                    await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
                    var newUser = await dao.findById(request,'user',user._id+"");
                    user.systemSet = systemSet;
                    newUser.systemSet = systemSet;
                    if(newUser == null){
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":user});
                        return;
                    }else{
                        reply({"message":"回购申请提交成功，等待审核！","statusCode":107,"status":true,"resource":newUser});
                        return;
                    }
                }
            }
        }
    }else{
        reply({"message":"选择有误，请重新申请","statusCode":102,"status":false});
        return;
    }
}

// 后台 获取所有用户的回购记录
exports.adminWithdrawalsList = async function(request, reply){
    var merchantGoods = await dao.find(request,"withdrawalsApplyRecord",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"withdrawalsApplyRecord",request.payload.where);
    var everyDayAddGold = await dao.findSum(request,"withdrawalsApplyRecord",{$match:{...request.payload.where}},{$group:{_id:null,toGold:{$sum:"$applyGold"}}});
    if(merchantGoods == null){
        reply({"message":"查找用户回购列表失败","statusCode":108,"status":false});
    }else{
        if(everyDayAddGold.length>0){
            reply({"message":"查找用户回购列表成功","statusCode":107,"status":true,"resource":merchantGoods,"sum":sum,"total":everyDayAddGold[0].toGold});
        }else{
            reply({"message":"查找用户回购列表成功","statusCode":107,"status":true,"resource":merchantGoods,"sum":sum,"total":0});
        }
    }
}

// 后台 更新用户的回购状态
exports.adminUpdateWithdrawalsStateAct = async function(request, reply){
    var adminManager = request.auth.credentials;
    var WithdrawalsData = await dao.findById(request, "withdrawalsApplyRecord", request.payload.id);
    if(WithdrawalsData == null){
        reply({"message":"更新回购失败","statusCode":108,"status":false});
        return;
    }else{
        if(request.payload.state == 2){    // 回购申请通过
            // 提现申请 后台审核通过
            var userRoleStr = WithdrawalsData.qunli_id.replace(/[^a-z]+/ig,"");
            if(userRoleStr == "C"){
                await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"sumTixian": WithdrawalsData.applyGold}});
            }
            if(userRoleStr == "B"){
                await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"merchat.merchat_sumTixian": WithdrawalsData.applyGold}});
            }
            if(userRoleStr == "AB"){
                await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"serverPeople.sumTixian": WithdrawalsData.applyGold}});
            }
            if(userRoleStr == "ABC"){
                await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"serverCenter.sumTixian": WithdrawalsData.applyGold}});
            }
        }
        if(request.payload.state == 3){    // 回购申请驳回
            var userRoleStr = WithdrawalsData.qunli_id.replace(/[^a-z]+/ig,"");
            if(userRoleStr == "C"){
                if(parseInt(WithdrawalsData.applyType) == 1){
                    await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"fuxing": WithdrawalsData.applyGold}});
                }
                if(parseInt(WithdrawalsData.applyType) == 2){
                    await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"unfuxing": WithdrawalsData.applyGold}});
                }
            }
            if(userRoleStr == "B"){
                if(parseInt(WithdrawalsData.applyType) == 1){
                    await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"merchat.merchat_fuxing": WithdrawalsData.applyGold}});
                }
                if(parseInt(WithdrawalsData.applyType) == 2){
                    await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"merchat.merchat_unfuxing": WithdrawalsData.applyGold}});
                }
            }
            if(userRoleStr == "AB"){
                if(parseInt(WithdrawalsData.applyType) == 1){
                    await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"serverPeople.fuxing": WithdrawalsData.applyGold}});
                }
                if(parseInt(WithdrawalsData.applyType) == 2){
                    await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"serverPeople.unfuxing": WithdrawalsData.applyGold}});
                }
            }
            if(userRoleStr == "ABC"){
                if(parseInt(WithdrawalsData.applyType) == 1){
                    await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"serverCenter.fuxing": WithdrawalsData.applyGold}});
                }
                if(parseInt(WithdrawalsData.applyType) == 2){
                    await dao.updateTow(request, "user", {"_id": WithdrawalsData.userId},{$inc:{"serverCenter.unfuxing": WithdrawalsData.applyGold}});
                }
            }
        }
        var result = await dao.updateTow(request,"withdrawalsApplyRecord",{"_id": request.payload.id+""},{$set:{"state": request.payload.state, "operationUser":adminManager.username+"", "operationTimer": new Date().getTime()}});
        //var result = await dao.updateOne(request,"withdrawalsApplyRecord",{"_id": request.payload.id+""},{"state": request.payload.state});
        if(result == null){
            reply({"message":"更新失败","statusCode":108,"status":false});
        }else{
            reply({"message":"更新成功","statusCode":107,"status":true});
        }
    }
}

// 前台 用户的回购记录
exports.userWithdrawalsList = async function(request, reply){
    var user = request.auth.credentials;
    if(parseInt(request.params.userType) == 1){  //普通会员
        var result = await dao.find(request, "withdrawalsApplyRecord", {"qunli_id": user.user_id+"", "state": parseInt(request.params.state)},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
        var sum = await dao.findCount(request,"withdrawalsApplyRecord",{"qunli_id": user.user_id+"", "state": parseInt(request.params.state)});
        var totalGold = await dao.findSum(request,"withdrawalsApplyRecord",{$match:{"qunli_id": user.user_id+"", "state": parseInt(request.params.state)}},{$group:{_id:null,toGold:{$sum:"$applyGold"}}});
        if(result == null){
            reply({"message":"查找会员回购列表失败！","statusCode":102,"status":false});
            return;
        }else{
            reply({"message":"查找会员回购列表成功","statusCode":107,"status":true,"resource":result,"sum":sum, "totalGold":(totalGold!=null&&totalGold.length>0)?totalGold[0].toGold:0});
            return;
        }
    }
    if(parseInt(request.params.userType) == 2){  //商户
        var result = await dao.find(request, "withdrawalsApplyRecord", {"qunli_id": user.merchat.user_id+"", "state": parseInt(request.params.state)},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
        var sum = await dao.findCount(request,"withdrawalsApplyRecord",{"qunli_id": user.merchat.user_id+"", "state": parseInt(request.params.state)});
        var totalGold = await dao.findSum(request,"withdrawalsApplyRecord",{$match:{"qunli_id": user.merchat.user_id+"", "state": parseInt(request.params.state)}},{$group:{_id:null,toGold:{$sum:"$applyGold"}}});
        if(result == null){
            reply({"message":"查找会员回购列表失败！","statusCode":102,"status":false});
            return;
        }else{
            reply({"message":"查找会员回购列表成功","statusCode":107,"status":true,"resource":result,"sum":sum, "totalGold":(totalGold!=null&&totalGold.length>0)?totalGold[0].toGold:0});
            return;
        }
    }
    if(parseInt(request.params.userType) == 3){  //服务商
        var result = await dao.find(request, "withdrawalsApplyRecord", {"qunli_id": user.serverPeople.user_id+"", "state": parseInt(request.params.state)},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
        var sum = await dao.findCount(request,"withdrawalsApplyRecord",{"qunli_id": user.serverPeople.user_id+"", "state": parseInt(request.params.state)});
        var totalGold = await dao.findSum(request,"withdrawalsApplyRecord",{$match:{"qunli_id": user.serverPeople.user_id+"", "state": parseInt(request.params.state)}},{$group:{_id:null,toGold:{$sum:"$applyGold"}}});
        if(result == null){
            reply({"message":"查找会员回购列表失败！","statusCode":102,"status":false});
            return;
        }else{
            reply({"message":"查找会员回购列表成功","statusCode":107,"status":true,"resource":result,"sum":sum, "totalGold":(totalGold!=null&&totalGold.length>0)?totalGold[0].toGold:0});
            return;
        }
    }
    if(parseInt(request.params.userType) == 4){  //服务中心
        var result = await dao.find(request, "withdrawalsApplyRecord", {"qunli_id": user.serverCenter.user_id+"", "state": parseInt(request.params.state)},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
        var sum = await dao.findCount(request,"withdrawalsApplyRecord",{"qunli_id": user.serverCenter.user_id+"", "state": parseInt(request.params.state)});
        var totalGold = await dao.findSum(request,"withdrawalsApplyRecord",{$match:{"qunli_id": user.serverCenter.user_id+"", "state": parseInt(request.params.state)}},{$group:{_id:null,toGold:{$sum:"$applyGold"}}});
        if(result == null){
            reply({"message":"查找会员回购列表失败！","statusCode":102,"status":false});
            return;
        }else{
            reply({"message":"查找会员回购列表成功","statusCode":107,"status":true,"resource":result,"sum":sum, "totalGold":(totalGold!=null&&totalGold.length>0)?totalGold[0].toGold:0});
            return;
        }
    }
}

// 前台 用户实名认证
exports.userCertification = async function(request, reply){
    var user = request.auth.credentials;
    var sendData = request.payload;
    //查看验证码是否正确
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":sendData.mobile,"type":"authentication","code":parseInt(sendData.smsCode)});
    if(smsVerification==null){
        reply({"message":"验证码不正确，请重新输入。","statusCode":102,"status":false});
        return;
    }else{
        dao.del(request,"smsVerification",{"_id":smsVerification._id+""})
    }

    /*var userRoleStr = sendData.userCode.replace(/[^a-z]+/ig,"");
    var authResult = null;
    if(userRoleStr == "C"){
        if(user.auth_user){
            reply({"message":"您已经认证过了","statusCode":108,"status":false});
            return;
        }else{
            authResult = await dao.updateTow(request,"user",{"_id":user._id},{$set:{"auth_user":true}})
        }
    }
    if(userRoleStr == "B"){
        if(user.merchat.auth_user){
            reply({"message":"您已经认证过了","statusCode":108,"status":false});
            return;
        }else{
            authResult = await dao.updateTow(request,"user",{"_id":user._id},{$set:{"merchat.auth_user":true}})
        }
    }
    if(userRoleStr == "AB"){
        if(user.serverPeople.auth_user){
            reply({"message":"您已经认证过了","statusCode":108,"status":false});
            return;
        }else{
            authResult = await dao.updateTow(request,"user",{"_id":user._id},{$set:{"serverPeople.auth_user":true}})
        }
    }
    if(userRoleStr == "ABC"){
        if(user.serverCenter.auth_user){
            reply({"message":"您已经认证过了","statusCode":108,"status":false});
            return;
        }else{
            authResult = await dao.updateTow(request,"user",{"_id":user._id},{$set:{"serverCenter.auth_user":true}})
            
        }
    }*/
    var searchData = await dao.findOne(request, "authenticationRecord", {"userId":user._id+""});
    if(searchData!= null){
        reply({"message":"实名认证失败,您已经认证过了","statusCode":108,"status":false});
        return;
    }
    var authResult = await dao.updateTow(request,"user",{"_id":user._id},{$set:{"auth_user":true,"truename": sendData.trueName}});
    if(authResult == null){
        reply({"message":"实名认证失败","statusCode":108,"status":false});
        return;
    }else{
        var saveData = {
            userCode: sendData.userCode,
            username: user.common_username,     //账号
            userId: user._id+"",
            trueName: sendData.trueName,
            idCard: sendData.idCard,
            mobile: sendData.mobile,
            createTime: new Date().getTime()
        }
        await dao.save(request, "authenticationRecord", saveData);   //生成认证记录
        reply({"message":"实名认证成功","statusCode":107,"status":true});
        return;
    }
}


//获取平台统计信息
exports.getPlatformStatistics = async function(request, reply){
    var user_sum = await dao.findCount(request,"user",{"fudai":{$exists:true}});
    //var everyDayAddGold = await dao.findSum(request,"shopGoldRecord",{$match:{"toUser":next.mobile+"", type:2, "createTime":{$gte:time}}},{$group:{_id:null,toGold:{$sum:"$toGold"}}});
    var merchant_sum = await dao.findCount(request,"user",{"merchat":{$exists:true}});
    //var userFudai = await dao.findSum(request,"user",{$match:{"fudai":{$gt:0}}},{$group:{_id:null,toGold:{$sum:"$fudai"}}});   //统计用户的福袋数量
    //var merchatFudai = await dao.findSum(request,"user",{$match:{"merchat.merchat_fudai":{$gt:0}}},{$group:{_id:null,toGold:{$sum:"$merchat.merchat_fudai"}}});   //统计用户的福袋数量
    var todayTime = new Date(format("yyyy/M/d",new Date())).getTime();          //获取今日 00：00的时间戳
    var historyTotal = await dao.findSum(request, "cityListRecord",{$match:{"sumXiaoFei":{$gt: 0}}},{$group:{_id:null,toGold:{$sum:"$sumXiaoFei"}}}); //统计历史营业额
    //var todayTotal = await dao.findSum(request, "declarationRecord",{$match:{"createTime":{$gte: todayTime},"state":2}},{$group:{_id:null,toGold:{$sum:"$gold_xf"}}}); //统计今日营业额
    var todayTotal = await dao.findSum(request, "cityListRecord",{$match:{"today.sumXiaoFei":{$gt: 0}}},{$group:{_id:null,toGold:{$sum:"$today.sumXiaoFei"}}});

    var todayPTTotal = await dao.findSum(request, "declarationRecord",{$match:{"state":2}},{$group:{_id:null,toGold:{$sum:"$rangli_gold"}}}); //统计平台总的业绩

    var sum1 = await dao.findSum(request, "distributeRecord",{$match:{"type":1}},{$group:{_id:null,toGold:{$sum:"$fuxing"}}}); //统计平台每日派发出来的福星（用户和商户）
    var sum2 = await dao.findSum(request, "distributeRecord",{$match:{"type":{$in:[3,5,6]}}},{$group:{_id:null,toGold:{$sum:"$unfuxing"}}}); //统计报单成功给推荐人
    var sum = 0;
    if(sum1!=null&& sum1.length>0){ sum = sum1[0].toGold+sum }
    if(sum2!=null&& sum2.length>0){ sum = sum2[0].toGold+sum }

    var systemSetData = await dao.find(request,"systemSet");
    var systemSet = systemSetData[0].systemSet;

    var data = {
        all_user: user_sum,             // 所有的用户
        all_merchant: merchant_sum,               // 所有的商户
        all_achievement: (todayPTTotal!=null&& todayPTTotal.length>0)?todayPTTotal[0].toGold/0.24:0,             // 平台总业绩
        ready_achievement: sum/0.24,                                                                             // 已经结算业绩
        warit_achievement: (todayPTTotal!=null&& todayPTTotal.length>0)?(todayPTTotal[0].toGold-sum)/0.24:0,        // 待结算业绩
        today_turnover: (todayTotal!=null&& todayTotal.length>0)?todayTotal[0].toGold:0,          // 今日营业额
        all_turnover: (historyTotal!=null&& historyTotal.length>0)?historyTotal[0].toGold:0,               // 历史营业额
        merchat_fd: systemSet.yes_merchantIndex,                 // 商家福袋
        user_fd: systemSet.yes_userIndex,                    // 用户福袋
    }
    reply({"message":"获取平台信息成功","statusCode":107,"status":true, "resource":data});
}

// 统计 平台 今日营业额
exports.todayTotalAchievement = async function(request, reply){
    var todayTime = new Date(format("yyyy/M/d",new Date())).getTime();
    var allData = await dao.find(request, "declarationRecord", {"state":2, "chuliTime":{$gte:todayTime}});
    if(allData==null){
        reply({"message":"获取今日营业额失败","statusCode":108,"status":false});
        return;
    }else{
        reply({"message":"获取今日营业额成功","statusCode":107,"status":true, "resource":allData});
        return;
    }
}

//统计 城市历史让利排行
exports.cityRLRankingList = async function(request, reply){
    var cityData = await dao.find(request, "cityListRecord",{"sumRangLi":{$gte:0}},{},{sumRangLi:-1});
    if(cityData==null){
        reply({"message":"获取历史城市排行失败","statusCode":108,"status":false});
        return;
    }else{
        reply({"message":"获取历史城市排行成功","statusCode":107,"status":true, "resource":cityData});
        return;
    }
}

//统计 城市历史消费排行
exports.cityXFRankingList = async function(request, reply){
    var cityData = await dao.find(request, "cityListRecord",{"sumXiaoFei":{$gte:0}},{},{sumXiaoFei:-1});
    if(cityData==null){
        reply({"message":"获取历史城市排行失败","statusCode":108,"status":false});
        return;
    }else{
        reply({"message":"获取历史城市排行成功","statusCode":107,"status":true, "resource":cityData});
        return;
    }
}

//统计 城市今日让利排行
exports.cityTodayRLRankingList = async function(request, reply){
    var cityData = await dao.find(request, "cityListRecord",{"today.sumRangLi":{$gte:0}},{},{"today.sumRangLi":-1});
    if(cityData==null){
        reply({"message":"获取今日城市排行失败","statusCode":108,"status":false});
        return;
    }else{
        reply({"message":"获取今日城市排行成功","statusCode":107,"status":true, "resource":cityData});
        return;
    }
}

//统计 城市今日消费排行
exports.cityTodayXFRankingList = async function(request, reply){
    var cityData = await dao.find(request, "cityListRecord",{"today.sumXiaoFei":{$gte:0}},{},{"today.sumXiaoFei":-1});
    if(cityData==null){
        reply({"message":"获取今日城市排行失败","statusCode":108,"status":false});
        return;
    }else{
        reply({"message":"获取今日城市排行成功","statusCode":107,"status":true, "resource":cityData});
        return;
    }
}

// 获取平台指数记录
exports.platformIndexList = async function(request, reply){
    var cityData = await dao.find(request, "indexRecord",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"indexRecord",{});
    if(cityData==null){
        reply({"message":"获取平台指数记录失败","statusCode":108,"status":false});
        return;
    }else{
        reply({"message":"获取平台指数记录成功","statusCode":107,"status":true, "resource":cityData,"sum":sum});
        return;
    }
}

// 服务商或者服务中心的推荐商户业绩
exports.getMerchantTJYeJiRecordList = async function(request, reply){
    var user = request.auth.credentials;
    var result = null, sum = 0;
    if(parseInt(request.params.type) == 3){
        if(user.serverPeople && user.serverPeople.user_id){
            //result = await dao.find(request, "declarationRecord", {"merchant_peopleCode": user.serverPeople.user_id+"", "state": 2},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
            //sum = await dao.findCount(request,"declarationRecord",{"merchant_peopleCode": user.serverPeople.user_id+"", "state": 2});
            result = await dao.find(request, "yejiRecord", {"userCode": user.serverPeople.user_id+"", "type":{$in:[ 3]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
            sum = await dao.findCount(request,"yejiRecord",{"userCode": user.serverPeople.user_id+"", "type":{$in:[ 3]}});
        }
    }else if(parseInt(request.params.type) == 4){
        if(user.serverCenter && user.serverCenter.user_id){
            //result = await dao.find(request, "declarationRecord", {"merchant_centerCode": user.serverCenter.user_id+"", "state": 2},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
            //sum = await dao.findCount(request,"declarationRecord",{"merchant_centerCode": user.serverCenter.user_id+"", "state": 2});
            result = await dao.find(request, "yejiRecord", {"userCode": user.serverCenter.user_id+"", "type":{$in:[ 4,5]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
            sum = await dao.findCount(request,"yejiRecord",{"userCode": user.serverCenter.user_id+"", "type":{$in:[ 4,5]}});
        }
    }
    if(result == null){
        reply({"message":"获取业绩记录失败","statusCode":108,"status":false});
        return;
    }else{
        reply({"message":"获取业绩记录成功","statusCode":107,"status":true,"resource":result,"sum":sum});
        return;
    }
}

// 服务商或者服务中心的推荐消费者业绩
exports.getUserTJYeJiRecordList = async function(request, reply){
    var user = request.auth.credentials;
    var result = null, sum = 0;
    if(parseInt(request.params.type) == 3){
        if(user.serverPeople && user.serverPeople.user_id){
            // result = await dao.find(request, "declarationRecord", {"user_tjCode": user.serverPeople.user_id+"", "state": 2},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
            // sum = await dao.findCount(request,"declarationRecord",{"user_tjCode": user.serverPeople.user_id+"", "state": 2});
            result = await dao.find(request, "yejiRecord", {"userCode": user.serverPeople.user_id+"", "type":{$in:[1]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
            sum = await dao.findCount(request,"yejiRecord",{"userCode": user.serverPeople.user_id+"", "type":{$in:[1]}});
        }
    }else if(parseInt(request.params.type) == 4){
        if(user.serverCenter && user.serverCenter.user_id){
            // result = await dao.find(request, "declarationRecord", {"user_tjCode": user.serverCenter.user_id+"", "state": 2},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
            // sum = await dao.findCount(request,"declarationRecord",{"user_tjCode": user.serverCenter.user_id+"", "state": 2});
            result = await dao.find(request, "yejiRecord", {"userCode": user.serverCenter.user_id+"", "type":{$in:[1]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
            sum = await dao.findCount(request,"yejiRecord",{"userCode": user.serverCenter.user_id+"", "type":{$in:[1]}});
        }
    }
    if(result == null){
        reply({"message":"获取业绩记录失败","statusCode":108,"status":false});
        return;
    }else{
        reply({"message":"获取业绩记录成功","statusCode":107,"status":true,"resource":result,"sum":sum});
        return;
    }
}

exports.deleteAllUserInfo = async function(request){
    var db = request.server.plugins['hapi-mongodb'].db;
    db.collection("user").drop();
}

///时间格式化
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

//更新用户的收货地址
exports.updateUserAddressListAct = async function(request, reply){
    var user = request.auth.credentials;
    var result = await dao.updateTow(request, "user", {"_id": user._id+""},{$set:{"address": request.payload.address}});
    if(result == null){
        reply({"message":"更新用户收获地址失败，请重新尝试","statusCode":108,"status":false});
    }else{
        reply({"message":"更新用户收获地址成功","statusCode":107,"status":true});
    }
}




