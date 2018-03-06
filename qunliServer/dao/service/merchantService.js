var uploadFile =require("./fileService");
const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");

/*******
		distributeRecord    type 类型
		formState: true,    // true 为转出  false 转入  转增时为转出还是转入
		type: 1		// 每日派发 
		type: 2		// 消费增加的福袋
		type: 3 	// 消费增加用户推荐人的代缴税福星
		type: 4 	// 消费增加商户的福袋
		type: 5 	// 消费增加商户推荐人的代缴税福星
		type: 6 	// 消费增加商户所属市级服务中心的代缴税福星

		type: 7 	// 用户转增 福星
		type: 8 	// 用户转增 代缴税福星
		type: 9 	// 用户转增 冻结福星
		type: 10 	// 用户（商户）转增 福袋

		type: 11 	// 用户回购 福星
		type: 12 	// 用户回购 代缴税福星

		type:13     // 后台充值 待激活福袋
		type:14     // 后台充值 待激活福星
		type: 15		// 前台 消费累加 待激活福袋
		type:16		// 前台 待激活福袋 转入 激活福袋

		type:17		// 前台 商户加 待激活福袋
		type:18		// 前台 商户 待激活福袋 转入 激活福袋



	yejiRecord     type 类型
	type: 0		// 消费 增加 消费者 的业绩
	type: 1     // 推荐消费者消费增加的业绩  （服务中心 或者 服务商）
	type: 2 	// 消费 增加 商户的业绩
	type: 3     // 增加商户 推荐人（服务商的）的业绩
	type: 4,    // 增加商户 推荐人（服务中心）的业绩
	type: 5, 	// 增加商户 所在（服务中心）的业绩

********/
// 某用户的 激活中 福袋
exports.getFudaiList = async function(request, reply){
	var user = request.auth.credentials;
	var result = null, sum = 0;
	if(parseInt(request.params.type) == 1){  //普通用户
		result = await dao.find(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[1, 10, 16, 18]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
		sum = await dao.findCount(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[1, 10, 16, 18]}});
	}
	if(parseInt(request.params.type) == 2){  //商户
		if(user.merchat && user.merchat.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[1, 10, 16, 18]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[1, 10, 16, 18]}});
		}
	}
	if(result == null){
		reply({"message":"获取激活中福袋列表失败","statusCode":105,"status":false});
		return;
	}else{
		reply({"message":"获取激活中福袋列表成功","statusCode":107,"status":true,"resource": result, "sum":sum});
	}
}

// 某用户的 待激活福袋
exports.getSumFudaiList = async function(request, reply){
	var user = request.auth.credentials;
	var result = null, sum = 0;
	if(parseInt(request.params.type) == 1){  //普通用户
		result = await dao.find(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[13, 16,15]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
		sum = await dao.findCount(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[13, 16,15]}});
	}
	if(parseInt(request.params.type) == 2){  //商户
		if(user.merchat && user.merchat.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[13, 18,17]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[13, 18,17]}});
		}
	}
	if(result == null){
		reply({"message":"获取待激活福袋列表失败","statusCode":105,"status":false});
		return;
	}else{
		reply({"message":"获取待激活福袋列表成功","statusCode":107,"status":true,"resource": result, "sum":sum});
	}
}

//	某用户的 普通福星 明细
exports.getFuxingDetailList = async function(request, reply){
	var user = request.auth.credentials;
	var result = null, sum = 0;
	if(parseInt(request.params.type) == 1){  //普通用户
		result = await dao.find(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[1,7,11]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
		sum = await dao.findCount(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[1, 7, 11]}});
	}
	if(parseInt(request.params.type) == 2){  //普通用户
		if(user.merchat && user.merchat.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[1,7,11]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[1, 7, 11]}});
		}
	}
	if(parseInt(request.params.type) == 3){  //普通用户
		if(user.serverPeople && user.serverPeople.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.serverPeople.user_id+"", "type":{$in:[1,7,11]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.serverPeople.user_id+"", "type":{$in:[1, 7, 11]}});
		}
	}
	if(parseInt(request.params.type) == 4){  //普通用户
		if(user.serverCenter && user.serverCenter.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.serverCenter.user_id+"", "type":{$in:[1,7,11]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.serverCenter.user_id+"", "type":{$in:[1, 7, 11]}});
		}
	}
	if(result == null){
		reply({"message":"获取商户分类列表","statusCode":105,"status":false});
		return;
	}else{
		reply({"message":"获取商户分类列表","statusCode":107,"status":true,"resource": result, "sum":sum});
	}
}

//	某用户的 代缴税福星 明细
exports.getUnfuxingDetailList = async function(request, reply){
	var user = request.auth.credentials;
	var result = null, sum=0;
	if(parseInt(request.params.type) == 1){  //普通用户
		result = await dao.find(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[3,5,6,8,12]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
		sum = await dao.findCount(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[3, 5, 6,8,12]}});
	}
	if(parseInt(request.params.type) == 2){  //普通用户
		if(user.merchat && user.merchat.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[3,5,6,8,12]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[3,5,6,8,12]}});
		}
	}
	if(parseInt(request.params.type) == 3){  //普通用户
		if(user.serverPeople && user.serverPeople.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.serverPeople.user_id+"", "type":{$in:[3,5,6,8,12]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.serverPeople.user_id+"", "type":{$in:[3,5,6,8,12]}});
		}
	}
	if(parseInt(request.params.type) == 4){  //普通用户
		if(user.serverCenter && user.serverCenter.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.serverCenter.user_id+"", "type":{$in:[3,5,6,8,12]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.serverCenter.user_id+"", "type":{$in:[3,5,6,8,12]}});
		}
	}
	if(result == null){
		reply({"message":"获取商户分类列表","statusCode":105,"status":false});
		return;
	}else{
		reply({"message":"获取商户分类列表","statusCode":107,"status":true,"resource": result, "sum":sum});
	}
}

//	某用户的 待激活福星 明细
exports.getDfuxingDetailList = async function(request, reply){
	var user = request.auth.credentials;
	var result = null, sum = 0;
	if(parseInt(request.params.type) == 1){  //普通用户
		result = await dao.find(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[9,14]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
		sum = await dao.findCount(request,"distributeRecord",{"userCode": user.user_id+"", "type":{$in:[9,14]}});
	}
	if(parseInt(request.params.type) == 2){  //普通用户
		if(user.merchat && user.merchat.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[9,14]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.merchat.user_id+"", "type":{$in:[9,14]}});
		}
	}
	if(parseInt(request.params.type) == 3){  //普通用户
		if(user.serverPeople && user.serverPeople.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.serverPeople.user_id+"", "type":{$in:[9,14]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.serverPeople.user_id+"", "type":{$in:[9,14]}});
		}
	}
	if(parseInt(request.params.type) == 4){  //普通用户
		if(user.serverCenter && user.serverCenter.user_id){
			result = await dao.find(request,"distributeRecord",{"userCode": user.serverCenter.user_id+"", "type":{$in:[9,14]}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
			sum = await dao.findCount(request,"distributeRecord",{"userCode": user.serverCenter.user_id+"", "type":{$in:[9,14]}});
		}
	}
	if(result == null){
		reply({"message":"获取冻结福星列表","statusCode":105,"status":false});
		return;
	}else{
		reply({"message":"获取冻结福星列表","statusCode":107,"status":true,"resource": result, "sum": sum});
	}
}

// 前台获取商户分类列表
exports.merchantTypeListAct = async function(request, reply){
	var result = await dao.find(request, "merchantCategory",{"state":1});
	if(result == null){
		reply({"message":"获取商户分类列表","statusCode":105,"status":false});
		return;
	}else{
		reply({"message":"获取商户分类列表","statusCode":107,"status":true,"resource": result});
	}
}

//用户登录
exports.userLogin = function(request,reply){
    var user = request.auth.credentials;
    reply({"message":"用户登陆成功","statusCode":101,"status":true,"resource":request.auth.credentials});
}

exports.merchantInfo = async function(request, reply){
	var merchantId = request.params.id;
	if(!merchantId){
		reply({"message":"查询商户失败","statusCode":105,"status":false});
		return;
	}
	var merchantInfo = await dao.findById(request,"user",merchantId);
	if(merchantInfo == null){
		reply({"message":"查询商户失败","statusCode":105,"status":false});
		return;
	}else{
		reply({"message":"查询商户成功","statusCode":107,"status":true,"resource": merchantInfo});
	}
}

exports.merchantAdminInfo = async function(request, reply){
	var user = request.auth.credentials;
	var merchantInfo = await dao.findById(request,"user",user._id);
	if(merchantInfo == null){
		reply({"message":"查询商户失败","statusCode":105,"status":false});
		return;
	}else{
		reply({"message":"查询商户成功","statusCode":107,"status":true,"resource": merchantInfo});
	}
}

exports.updateMerchantInfo = async function(request, reply){
	var merchantId = request.params.id;
	var merchantInfo = request.payload;
	var data = await dao.updateOne(request,"user",{"_id":merchantId+""},{"merchat":merchantInfo.merchat});
	if(data == null){
		reply({"message":"更新商户资料失败","statusCode":105,"status":false});
		return;
	}else{
		reply({"message":"更新商户资料成功","statusCode":107,"status": true});
		return;
	}

}

exports.merchantGoods = async function(request, reply){
	var merchantId = request.params.id;
	var merchantGoods = await dao.find(request,"goods",{"merchatId":merchantId+"", "state":1},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	//总数
    var sum = await dao.findCount(request,"goods",{"merchatId":merchantId+"", "state":1});
    if(merchantGoods == null){
        reply({"message":"查找商户商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户商品列表成功","statusCode":107,"status":true,"resource":merchantGoods,"sum":sum});
    }
}

exports.addMerchantAudit = async function(request, reply){
	var user = request.auth.credentials;
	var merchantInfo = request.payload;
	if(user.merchat){
		reply({"message":"您已经是商户了","statusCode":102,"status":false});
		return;
	}else{
		var selectData = await dao.find(request,"applyMerchant",{userId: user._id+"", state:1});
		if(selectData.length>0){
			reply({"message":"您已经申请过了,请等待结果","statusCode":102,"status":false});
			return;
		}else{
			var auditRecord = {
				userId: user._id+"",
				mobile: user.mobile,
				name: merchantInfo.name,
				address: merchantInfo.address,
				describe: merchantInfo.describe,
				area: merchantInfo.area,
                city: merchantInfo.city,
                province: merchantInfo.province,
				logo: merchantInfo.logo,
				merchat_lng: merchantInfo.merchat_lng,
                merchat_lat: merchantInfo.merchat_lat,
				state: 1,  // 1 等待审核  2.通过审核  3.驳回审核
				createTime: new Date().getTime()
			}
			var result = await dao.save(request,"applyMerchant",auditRecord);
			if(result==null){
		        reply({"message":"申请成为商户失败","statusCode":102,"status":false});
		    }else{
		        reply({"message":"申请成为商户成功","statusCode":107,"status":true});
		    }
		}
	}
}

// 后台 角色申请 列表
exports.merchantApplyList = async function(request, reply){

	var merchantGoods = await dao.find(request,"applyMerchant",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	//总数
    var sum = await dao.findCount(request,"applyMerchant",request.payload.where);
    if(merchantGoods == null){
        reply({"message":"查找申请商户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找申请商户列表成功","statusCode":107,"status":true,"resource":merchantGoods,"sum":sum});
    }
}

// 后台更新用户（商户 服务商 服务中心）的申请状态
exports.updateApplyMerchantItem = async function(request, reply){
	var adminManager = request.auth.credentials;
	var merchantInfo = request.payload;
	if(merchantInfo.state == 2){  //更新用户成为商户
		var applyMerchant = await dao.findById(request,"applyMerchant",merchantInfo.id+"");
		if(applyMerchant == null){
			reply({"message":"更新失败","statusCode":108,"status":false});
			return;
		}else{
			//  common_username  表示 一个账号4中身份 公用的账号 创建第一个角色时就生成一个公用账号
			var storeData = {};
			var scopeStr = "";
			if(applyMerchant.ApplyType == 2){	//申请成为商户
				var tongyi_number = await dao.inc(request,'qunli_ids','qunli_id', 100001);
    			applyMerchant.merchantInfo['user_id']= "B"+tongyi_number;
				storeData = {
					"merchat" : applyMerchant.merchantInfo   // 商户
				}
				scopeStr = "MERCHANT";
				var merchant = await dao.findOne(request, "user",{"merchat.username":applyMerchant.applyUser+""});
				if(merchant == null){
					var user = await dao.findOne(request, "user",{"common_username":applyMerchant.applyUser+""});
					if(user != null){
						var scopeArray = user.scope;
						scopeArray.push(scopeStr);
						await dao.updateOne(request,"user",{"_id":user._id+""},{...storeData,'scope': scopeArray})
						//生成商户所在地的 城市的记录
						var cityRecordOne = await dao.findOne(request, "cityListRecord", {"city": applyMerchant.merchantInfo.merchant_city});
						if(cityRecordOne == null){
							var saveCity = {
								city: applyMerchant.merchantInfo.merchant_city,			// 区
								area: applyMerchant.merchantInfo.merchant_area,			// 市
								province: applyMerchant.merchantInfo.merchant_province,	//省
								sumRangLi: 0,				// 让利总金额
								sumXiaoFei: 0,				// 消费总金额
								createTime: new Date().getTime(),
							}
							await dao.save(request, "cityListRecord", saveCity);
						}
					}else{
						var scopeArray = [];
						scopeArray.push(scopeStr);
						await dao.save(request, "user",{...storeData,'scope': scopeArray, "common_username": applyMerchant.applyUser+""});  //生成公共的账号
						//生成商户所在地的 城市的记录
						var cityRecordOne = await dao.findOne(request, "cityListRecord", {"city": applyMerchant.merchantInfo.merchant_city});
						if(cityRecordOne == null){
							var saveCity = {
								city: applyMerchant.merchantInfo.merchant_city,			// 区
								area: applyMerchant.merchantInfo.merchant_area,			// 市
								province: applyMerchant.merchantInfo.merchant_province,	//省
								sumRangLi: 0,				// 让利总金额
								sumXiaoFei: 0,				// 消费总金额
								createTime: new Date().getTime(),
							}
							await dao.save(request, "cityListRecord", saveCity);
						}
					}
				}else{
					reply({"message":"更新失败,该账号已经是商户了","statusCode":108,"status":false});
					return;
				}
			}
			if(applyMerchant.ApplyType == 3){	//申请成为服务商
				var tongyi_number = await dao.inc(request,'qunli_ids','qunli_id', 100001);
    			applyMerchant.merchantInfo['user_id']= "AB"+tongyi_number;
				storeData = {
					"serverPeople" : applyMerchant.merchantInfo	// 服务器商
				}
				scopeStr = "SERVER_PEOPLE";
				var serverPeople = await dao.findOne(request, "user",{"serverPeople.username":applyMerchant.applyUser+""});
				if(serverPeople == null){
					var user = await dao.findOne(request, "user",{"common_username":applyMerchant.applyUser+""});
					if(user != null){
						var scopeArray = user.scope;
						scopeArray.push(scopeStr);
						await dao.updateOne(request,"user",{"_id":user._id+""},{...storeData,'scope': scopeArray})
					}else{
						var scopeArray = [];
						scopeArray.push(scopeStr);
						await dao.save(request, "user",{...storeData,'scope': scopeArray, "common_username": applyMerchant.applyUser+""});  //生成公共的账号
					}
				}else{
					reply({"message":"更新失败,该账号已经是服务商了","statusCode":108,"status":false});
					return;
				}
			}
			if(applyMerchant.ApplyType == 4){	//申请成为服务中心
				var tongyi_number = await dao.inc(request,'qunli_ids','qunli_id', 100001);
    			applyMerchant.merchantInfo['user_id']= "ABC"+tongyi_number;
				storeData = {
					"serverCenter" : applyMerchant.merchantInfo	// 服务中心
				}
				scopeStr = "SERVER_CENTER";
				var serverCenter = await dao.findOne(request, "user",{"serverCenter.username":applyMerchant.applyUser+""});
				if(serverCenter == null){
					var user = await dao.findOne(request, "user",{"common_username":applyMerchant.applyUser+""});
					if(user != null){
						var scopeArray = user.scope;
						scopeArray.push(scopeStr);
						await dao.updateOne(request,"user",{"_id":user._id+""},{...storeData,'scope': scopeArray})
					}else{
						var scopeArray = [];
						scopeArray.push(scopeStr);
						await dao.save(request, "user",{...storeData,'scope': scopeArray, "common_username": applyMerchant.applyUser+""});  //生成公共的账号
					}
				}else{
					reply({"message":"更新失败,该账号已经是市级服务中心了","statusCode":108,"status":false});
					return;
				}
			}
			//判断有没有推荐人 生成推荐记录
			if(applyMerchant.merchantInfo.recommendCode != "" && applyMerchant.merchantInfo.recommendId != ""){
				var recommendData = {
		            username: applyMerchant.applyUser,        // 推荐人的账号
		            userId: applyMerchant.merchantInfo.recommendId,            // 推荐人的ID
		            user_code: applyMerchant.applyUserCode,        // 推荐人的编号
		            recommendUser: applyMerchant.merchantInfo.username,   // 被推荐人的账号
		            recommendMobile: applyMerchant.merchantInfo.mobile,   // 被推荐人的手机号
		            recommendCode: applyMerchant.merchantInfo.user_id,   // 被推荐人的ID
		            recommendType: applyMerchant.ApplyType,                // 被推荐人的类型  // 1用户 2商户 3服务商
		            createTime: new Date().getTime(),       
		        }
		        await dao.save(request, "recommendRecord",recommendData);   //生成推荐记录
		    }
		}	
	}
	var result = await dao.updateTow(request, "applyMerchant", {_id: merchantInfo.id+""}, {$set:{"applyState": merchantInfo.state, "operationUser":adminManager.username+"", "operationTimer": new Date().getTime()}})
	//var result = await dao.updateOne(request,"applyMerchant",{_id: merchantInfo.id+""},{"applyState": merchantInfo.state});
	if(result==null){
        reply({"message":"更新商品申请失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新商品申请成功","statusCode":107,"status":true});
    }
}


//________   商家前台  ___________

// 前台 商户列表
exports.merchantListAct = async function(request, reply){
	var data = await dao.find(request,"user",{"merchat":{$exists:true }},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	var sum = await dao.findCount(request,"user",{"merchat":{$exists:true }});
    if(data == null){
        reply({"message":"查找商户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

// 前台 根据分类查找商户列表
exports.merchantClassListAct = async function(request, reply){
	var id = request.params.id;
	var data = await dao.find(request,"user",{"merchat":{$exists:true}, "merchat.businessTypeId":request.params.id+""},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	var sum = await dao.findCount(request,"user",{"merchat":{$exists:true }, "merchat.businessTypeId":request.params.id+""});
    if(data == null){
        reply({"message":"查找商户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//前台 根据城市搜索商户列表
exports.searchMerchantCityListAct = async function(request, reply){
	var data = await dao.find(request,"user",{"merchat":{$exists:true },"merchat.merchant_city":eval("/"+request.payload.keyWords+"/")},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	var sum = await dao.findCount(request,"user",{"merchat":{$exists:true },"merchat.merchant_city":eval("/"+request.payload.keyWords+"/")});
    if(data == null){
        reply({"message":"查找商户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

// 前台 搜索商家
exports.searchMerchantListAct = async function(request, reply){
	var data = await dao.find(request,"user",{"merchat":{$exists:true },"merchat.merchant_name":eval("/"+request.payload.keyWords+"/")},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	var sum = await dao.findCount(request,"user",{"merchat":{$exists:true },"merchat.merchant_name":eval("/"+request.payload.keyWords+"/")});
    if(data == null){
        reply({"message":"查找商户列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

// 前台 商家报单
exports.merchantAddOrderAct = async function(request, reply){
	var merchant = request.auth.credentials;
	var sendData = request.payload;
	/*if(merchant.mobile == sendData.mobile){
		reply({"message":"报单失败，商家不能给自己报单","statusCode":108,"status":false});
		return;
	}*/
	if(sendData.gold_xf>5000){
		if(sendData.voucherImg1 == "" || sendData.voucherImg2 == ""){
			reply({"message":"报单失败，请上传凭证","statusCode":108,"status":false});
			return;
		}
	}
	var user = await dao.findOne(request, "user", {"user_id": sendData.mobile});
	if(user == null){
		reply({"message":"报单失败，未找到该会员","statusCode":108,"status":false});
		return;
	}else{
		if(sendData.gold_xf<0.01){
			reply({"message":"报单失败，请输入正确的消费金额","statusCode":108,"status":false});
			return;
		}
		if(sendData.pay_password != merchant.merchat.pay_password){
			reply({"message":"报单失败，支付密码错误","statusCode":108,"status":false});
			return;
		}
		if(sendData.rebatesRate<1 || sendData.rebatesRate>24){
			reply({"message":"报单失败，请选择正确的让利比","statusCode":108,"status":false});
			return;
		}

		var centerCode = "", peopleCode = "", userTJCode = "";
		var userCodeStr = user.parentNumber;
		var userRoleStr = userCodeStr.replace(/[^a-z]+/ig,"");
		if(userRoleStr == "AB"){
			var serverPeopleItem = await dao.findOne(request, "user", {"serverPeople":{$exists: true}, "serverPeople.user_id":user.parentNumber});
			if(serverPeopleItem != null){
				userTJCode = serverPeopleItem.serverPeople.user_id;
			}
		}else if(userRoleStr == "ABC"){
			var serverCenterItem = await dao.findOne(request, "user", {"serverCenter":{$exists: true}, "serverCenter.user_id":user.parentNumber});
			if(serverCenterItem != null){
				userTJCode = serverCenterItem.serverCenter.user_id;
			}
		}
		var serverPeopleItem = await dao.findOne(request, "user", {"serverPeople":{$exists: true}, "serverPeople.user_id":merchant.merchat.recommendCode});
		if(serverPeopleItem!= null){
			peopleCode = serverPeopleItem.serverPeople.user_id;
		}
		var serverCenterArr = await dao.find(request, "user", {"serverCenter":{$exists:true },"serverCenter.merchant_city":eval("/"+merchant.merchat.merchant_city+"/")});
		if(serverCenterArr == null || serverCenterArr.length<1){

		}else{
			centerCode = serverCenterArr[0].serverCenter.user_id;
		}

		var declarationData = {
			username: user.username,
			userId: user._id+"",
			truename: user.truename,
			userCode: user.user_id,
			mobile: user.mobile,
			user_tjCode: userTJCode,			// 消费者 推荐人 的Code
			gold_xf: sendData.gold_xf,			// 消费金额
			rebatesRate: sendData.rebatesRate,	// 让利比例
			rangli_gold: Math.round(parseFloat(sendData.gold_xf*sendData.rebatesRate*0.01)*100)/100,   //让利金额
			voucherImg1: sendData.voucherImg1,		// 凭证1
			voucherImg2: sendData.voucherImg2,		// 凭证2
			merchantId: merchant._id+"",
			merchant: merchant.merchat.username,				// 商户账号
			merchant_mobile: merchant.merchat.mobile,			// 商户手机号
			merchant_code: merchant.merchat.user_id,		// 商户的编号
			inCity: merchant.merchat.merchant_city, 		// 商户所属城市
			merchant_name: merchant.merchat.merchant_name,	// 商户名称
			merchant_peopleCode: peopleCode,							// 商户的推荐人为服务商时  服务商的ID
			merchant_centerCode: centerCode,							// 所在城市的市级服务中心
			state: 1,							// 1 等待审核  2通过审核  3驳回审核
			createTime: new Date().getTime(),
		}
		var result = await dao.save(request, "declarationRecord", declarationData);
		if(result == null){
	        reply({"message":"报单失败","statusCode":108,"status":false});
	    }else{
	        reply({"message":"报单成功，等待审核","statusCode":107,"status":true});
	    }
	}
}

// 前台 商户报单列表
exports.merchantDeclarationList = async function(request, reply){
	var merchant = request.auth.credentials;
	var merchantGoods = await dao.find(request,"declarationRecord",{"merchant_code":merchant.merchat.user_id,"state":parseInt(request.params.state)},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	//总数
    var sum = await dao.findCount(request,"declarationRecord",{"merchant_code":merchant.merchat.user_id,"state":parseInt(request.params.state)});
    var totalGold = await dao.findSum(request,"declarationRecord",{$match:{"merchant_code":merchant.merchat.user_id,"state":parseInt(request.params.state)}},{$group:{_id:null,toGold:{$sum:"$gold_xf"}}});
    var totalGoldRL = await dao.findSum(request,"declarationRecord",{$match:{"merchant_code":merchant.merchat.user_id,"state":parseInt(request.params.state)}},{$group:{_id:null,toGold:{$sum:"$rangli_gold"}}});
    if(merchantGoods == null){
        reply({"message":"查找某商户报单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找某商户报单列表成功","statusCode":107,"status":true,"resource":merchantGoods,"sum":sum, "totalGold":(totalGold!=null && totalGold.length>0)?totalGold[0].toGold:0, "totalGoldRL":(totalGoldRL!=null && totalGoldRL.length>0)?totalGoldRL[0].toGold:0});
    }
}

// 前台 获取用户的报单列表 （商户给用户报的单子）
exports.userDeclarationList = async function(request, reply){
	var user = request.auth.credentials;
	var merchantGoods = await dao.find(request,"declarationRecord",{"userCode":user.user_id, "state":parseInt(request.params.state)},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	//总数
    var sum = await dao.findCount(request,"declarationRecord",{"userCode":user.user_id, "state":parseInt(request.params.state)});
    if(merchantGoods == null){
        reply({"message":"查找商户报单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户报单列表成功","statusCode":107,"status":true,"resource":merchantGoods,"sum":sum});
    }
}

// 后台 商户报单申请列表
exports.adminDeclarationList = async function(request, reply){
	var merchantGoods = await dao.find(request,"declarationRecord",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	//总数
    var sum = await dao.findCount(request,"declarationRecord",request.payload.where);
    if(merchantGoods == null){
        reply({"message":"查找商户报单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户报单列表成功","statusCode":107,"status":true,"resource":merchantGoods,"sum":sum});
    }
}

// 后台 更新商户报单的状态
exports.updateApplyDeclarationItem = async function(request, reply){
	var adminManager = request.auth.credentials;
	var systemSetData = await dao.find(request,"systemSet");
	var systemSet = systemSetData[0].systemSet;
	var declarationData = await dao.findById(request, "declarationRecord", request.payload.id);
	if(declarationData == null){
		reply({"message":"更新报单失败","statusCode":108,"status":false});
		return;
	}else{
		if(request.payload.state == 2){
			// 商家报单通过审核
			// 计算消费者的福袋数  和  累加消费者的消费总金额
			var user = await dao.findById(request, "user", declarationData.userId+"");
			if(user == null){
				reply({"message":"更新报单失败,未找到该消费者","statusCode":108,"status":false});
				return;
			}
			// 计算消费者的福袋数
			var currentSum = user.sumFudai+declarationData.rangli_gold/systemSet.fudai_rate;  //计算出当前累计的福袋数   systemSet.fudai_rate 为 120
			var addFudai = parseInt(currentSum/1);
			var saveFudai = currentSum%1;
			await dao.updateTow(request, "user",{"_id":user._id+""},{$inc:{"achievement":declarationData.gold_xf,"fudai":addFudai},$set:{"sumFudai":saveFudai}})
			var saveData0={
				username: user.username,
				userId: user._id+"",
				name: user.name,
				userMobile: user.mobile,
				userCode: user.user_id,
				yeji: declarationData.gold_xf,  // 消费者消费增加推荐人的业绩
				userType: 1,			// 1用户 2商户 3服务商 4服务中心
				type: 0, 					// 消费 增加 消费者 的业绩
				fromUser: user.username,
				fromCode: user.user_id,
				createTime: new Date().getTime()
			}
			await dao.save(request, "yejiRecord", saveData0);   //生成消费者的业绩

			var saveData={
				username: user.username,
				userId: user._id+"",
				name: user.name,
				userMobile: user.mobile,
				userCode: user.user_id,
				fudai: 0,			// 福袋
				sumFudai: declarationData.rangli_gold/systemSet.fudai_rate,		// 待激活福袋
				fuxing: 0,					// 每天派发的福星
				userType: 1,				// 1用户 2商户 3服务商 4服务中心
				type: 15, 					// 消费累加待激活福袋
				createTime: new Date().getTime()
			}
			await dao.save(request, "distributeRecord", saveData);   //生成派发记录
			if(currentSum>1){
				var saveData={
					username: user.username,
					userId: user._id+"",
					name: user.name,
					userMobile: user.mobile,
					userCode: user.user_id,
					fudai: addFudai,			// 福袋
					sumFudai: addFudai,		// 待激活福袋
					fuxing: 0,					// 每天派发的福星
					userType: 1,				// 1用户 2商户 3服务商 4服务中心
					type: 16, 					// 带激活福袋转入激活福袋
					createTime: new Date().getTime()
				}
				await dao.save(request, "distributeRecord", saveData);   //生成派发记录
			}

			/*var saveData={
				username: user.username,
				userId: user._id+"",
				name: user.name,
				userMobile: user.mobile,
				userCode: user.user_id,
				fudai: addFudai,			// 福袋
				sumFudai: 0,		// 待激活福袋
				fuxing: 0,					// 每天派发的福星
				userType: 1,				// 1用户 2商户 3服务商 4服务中心
				type: 2, 					// 消费增加的福袋
				createTime: new Date().getTime()
			}
			await dao.save(request, "distributeRecord", saveData);   //生成派发记录*/

			//计算消费者的推荐人的分销	0.005
			if(user.parentId && user.parentNumber != null){
				var parentUser = await dao.findById(request, "user", user.parentId);
				var userCodeStr = user.parentNumber;
				var userRoleStr = userCodeStr.replace(/[^a-z]+/ig,"");
				var nameStr = "", userMobileStr = "", userCodeStr="", userNum =1;
				if(userRoleStr == "C"){
					var unfuxingNum = declarationData.rangli_gold/systemSet.turnover_rate*0.005;
					await dao.updateTow(request, "user",{"_id":parentUser._id+""},{$inc:{"unfuxing":unfuxingNum}})  //待缴税福星
					nameStr = parentUser.name;
					userMobileStr = parentUser.mobile;
					userCodeStr = parentUser.user_id;
					userNum =1;
				}
				if(userRoleStr == "B"){
					var unfuxingNum = declarationData.rangli_gold/systemSet.turnover_rate*0.005;
					await dao.updateTow(request, "user",{"_id":parentUser._id+""},{$inc:{"merchat.merchat_unfuxing":unfuxingNum}})  //待缴税福星
					nameStr = parentUser.merchat.merchant_name;
					userMobileStr = parentUser.merchat.merchant_tell;
					userCodeStr = parentUser.merchat.user_id;
					userNum =2;
				}
				if(userRoleStr == "AB"){
					var unfuxingNum = declarationData.rangli_gold/systemSet.turnover_rate*0.005;
					await dao.updateTow(request, "user",{"_id":parentUser._id+""},{$inc:{"serverPeople.unfuxing":unfuxingNum, "serverPeople.totalYeJi": declarationData.gold_xf}})  //待缴税福星
					nameStr = parentUser.serverPeople.merchant_name;
					userMobileStr = parentUser.serverPeople.merchant_tell;
					userCodeStr = parentUser.serverPeople.user_id;
					userNum =3;
				}
				if(userRoleStr == "ABC"){
					var unfuxingNum = declarationData.rangli_gold/systemSet.turnover_rate*0.005;
					await dao.updateTow(request, "user",{"_id":parentUser._id+""},{$inc:{"serverCenter.unfuxing":unfuxingNum, "serverCenter.totalYeJi": declarationData.gold_xf}})  //待缴税福星
					nameStr = parentUser.serverCenter.merchant_name;
					userMobileStr = parentUser.serverCenter.merchant_tell;
					userCodeStr = parentUser.serverCenter.user_id;
					userNum =4;
				}
				
				var saveData2={
					username: parentUser.username,
					userId: parentUser._id+"",
					name: nameStr,
					userMobile: userMobileStr,
					userCode: userCodeStr,
					fudai: 0,					// 福袋
					fuxing: 0,					// 福星
					unfuxing: unfuxingNum,		// 代缴税福星
					userType: userNum,			// 1用户 2商户 3服务商 4服务中心
					type: 3, 					// 消费增加消费者推荐人的代缴税福星
					createTime: new Date().getTime()
				}
				await dao.save(request, "distributeRecord", saveData2);   //生成派发记录
				if(userNum>2){
					var saveData3={
						username: parentUser.username,
						userId: parentUser._id+"",
						name: nameStr,
						userMobile: userMobileStr,
						userCode: userCodeStr,
						yeji: declarationData.gold_xf,  // 消费者消费增加推荐人的业绩
						userType: userNum,			// 1用户 2商户 3服务商 4服务中心
						type: 1, 					// 消费增加消费者推荐人的业绩
						fromUser: user.username,
						fromCode: user.user_id,
						createTime: new Date().getTime()
					}
					await dao.save(request, "yejiRecord", saveData3);   //生成消费者推荐人的业绩
				}
			}

			// 计算商户的福袋数
			var merchant = await dao.findById(request, "user", declarationData.merchantId);
			var currentSum2 = merchant.merchat.merchat_sumFudai+declarationData.rangli_gold/systemSet.fudai_rate;  //计算出当前累计的福袋数  systemSet.fudai_rate 为 120
			var addFudai2 = parseInt(currentSum2/1);
			var saveFudai2 = currentSum2%1;
			await dao.updateTow(request, "user",{"_id":merchant._id+""},{$inc:{"merchat.merchat_allYingYe":declarationData.gold_xf,"merchat.merchat_achievement":declarationData.rangli_gold,"merchat.merchat_fudai":addFudai2},$set:{"merchat.merchat_sumFudai":saveFudai2}})
			var saveDataM={
				username: merchant.merchat.username,
				userId: merchant._id+"",
				name: merchant.merchat.merchant_name,
				userMobile: merchant.merchat.merchant_tell,
				userCode: merchant.merchat.user_id,
				yeji: declarationData.gold_xf,  // 消费者消费增加推荐人的业绩
				userType: 2,			// 1用户 2商户 3服务商 4服务中心
				type: 2, 					// 消费 增加 商户的业绩
				fromUser: merchant.merchat.username,
				fromCode: merchant.merchat.user_id,
				createTime: new Date().getTime()
			}
			await dao.save(request, "yejiRecord", saveDataM);   //生成商户的业绩
			var saveData={
				username: merchant.merchat.username,
				userId: merchant._id+"",
				name: merchant.merchat.merchant_name,
				userMobile: merchant.merchat.merchant_tell,
				userCode: merchant.merchat.user_id,
				fudai: 0,			// 福袋
				sumFudai: declarationData.rangli_gold/systemSet.fudai_rate,		// 待激活福袋
				fuxing: 0,					// 每天派发的福星
				userType: 2,				// 1用户 2商户 3服务商 4服务中心
				type: 17, 					// 消费累加待激活福袋
				createTime: new Date().getTime()
			}
			await dao.save(request, "distributeRecord", saveData);   //生成派发记录
			if(currentSum2>1){
				var saveData={
					username: merchant.username,
					userId: merchant._id+"",
					name: merchant.merchat.merchant_name,
					userMobile: merchant.merchat.merchant_tell,
					userCode: merchant.merchat.user_id,
					fudai: addFudai2,			// 福袋
					sumFudai: addFudai2,		// 待激活福袋
					fuxing: 0,					// 每天派发的福星
					userType: 2,				// 1用户 2商户 3服务商 4服务中心
					type: 18, 					// 带激活福袋转入激活福袋
					createTime: new Date().getTime()
				}
				await dao.save(request, "distributeRecord", saveData);   //生成派发记录
			}
			/*var saveData3={
				username: merchant.username,
				userId: merchant._id+"",
				name: merchant.merchat.merchant_name,
				userMobile: merchant.merchat.merchant_tell,
				userCode: merchant.merchat.user_id,
				fudai: addFudai2,			// 每天扣除的福袋
				sumFudai: 0, 		// 待激活福袋
				fuxing: 0,					// 每天派发的福星
				unfuxing: 0,		// 代缴税福星
				userType: 2,				// 1用户 2商户 3服务商 4服务中心
				type: 4, 					// 消费增加商户的福袋
				createTime: new Date().getTime()
			}
			await dao.save(request, "distributeRecord", saveData3);   //生成派发记录*/
			//计算 商家的 开发者服务商  0.008
			if(merchant.merchat && merchant.merchat.recommendCode != null){  //商家的服务商
				var parentNumberStr = merchant.merchat.recommendCode;
				var userRoleStr = parentNumberStr.replace(/[^a-z]+/ig,"");
				if(userRoleStr == "AB"){
					var merchatServer = await dao.findOne(request,"user", {"serverPeople.user_id": merchant.merchat.recommendCode+""});
					if(merchatServer != null){
						var unfuxingNum = declarationData.rangli_gold/systemSet.turnover_rate*0.008;
						await dao.updateTow(request, "user",{"_id":merchatServer._id+""},{$inc:{"serverPeople.unfuxing":unfuxingNum, "serverPeople.totalYeJi":declarationData.gold_xf}})  //待缴税福星
						var saveData4={
							username: merchatServer.serverPeople.username,
							userId: merchatServer._id+"",
							name: merchatServer.serverPeople.merchant_name,
							userMobile: merchatServer.serverPeople.merchant_tell,
							userCode: merchatServer.serverPeople.user_id,
							fudai: 0,					// 福袋
							fuxing: 0,					// 福星
							unfuxing: unfuxingNum,		// 代缴税福星
							userType: 3,				// 1用户 2商户 3服务商 4服务中心
							type: 5, 					// 消费增加商户推荐人的代缴税福星
							createTime: new Date().getTime()
						}
						await dao.save(request, "distributeRecord", saveData4);   //生成派发记录


						var saveData3={
							username: merchatServer.serverPeople.username,
							userId: merchatServer._id+"",
							name: merchatServer.serverPeople.merchant_name,
							userMobile: merchatServer.serverPeople.merchant_tell,
							userCode: merchatServer.serverPeople.user_id,
							yeji: declarationData.gold_xf,  // 消费者消费增加推荐人的业绩
							userType: 3,			// 1用户 2商户 3服务商 4服务中心
							type: 3, 					// 增加商户 推荐人（服务商的）的业绩
							fromUser: merchant.merchat.username,
							fromCode: merchant.merchat.user_id,
							createTime: new Date().getTime()
						}
						await dao.save(request, "yejiRecord", saveData3); //生成商户推荐人（服务商）的业绩
				
					}
				}
				if(userRoleStr == "ABC"){
					var merchatServer = await dao.findOne(request,"user", {"serverCenter.user_id": merchant.merchat.recommendCode+""});
					if(merchatServer != null){
						var unfuxingNum = declarationData.rangli_gold/systemSet.turnover_rate*0.008;
						await dao.updateTow(request, "user",{"_id":merchatServer._id+""},{$inc:{"serverCenter.unfuxing":unfuxingNum, "serverCenter.totalYeJi":declarationData.gold_xf}})  //待缴税福星
						var saveData4={
							username: merchatServer.serverCenter.username,
							userId: merchatServer._id+"",
							name: merchatServer.serverCenter.merchant_name,
							userMobile: merchatServer.serverCenter.merchant_tell,
							userCode: merchatServer.serverCenter.user_id,
							fudai: 0,					// 福袋
							fuxing: 0,					// 福星
							unfuxing: unfuxingNum,		// 代缴税福星
							userType: 4,				// 1用户 2商户 3服务商 4服务中心
							type: 5, 					// 消费增加商户推荐人的代缴税福星
							createTime: new Date().getTime()
						}
						await dao.save(request, "distributeRecord", saveData4);   //生成派发记录
						var saveData3={
							username: merchatServer.serverCenter.username,
							userId: merchatServer._id+"",
							name: merchatServer.serverCenter.merchant_name,
							userMobile: merchatServer.serverCenter.merchant_tell,
							userCode: merchatServer.serverCenter.user_id,
							yeji: declarationData.gold_xf,  // 消费者消费增加推荐人的业绩
							userType: 4,			// 1用户 2商户 3服务商 4服务中心
							type: 4, 					// 增加商户 推荐人（服务中心）的业绩
							fromUser: merchant.merchat.username,
							fromCode: merchant.merchat.user_id,
							createTime: new Date().getTime()
						}
						await dao.save(request, "yejiRecord", saveData3); //生成商户推荐人（服务中心）的业绩
					}
				}
			}
			//计算 商家所在地的市服务中心  0.005
			var serverCenterArr = await dao.find(request, "user", {"serverCenter":{$exists:true },"serverCenter.merchant_city":eval("/"+merchant.merchat.merchant_city+"/")});
			if(serverCenterArr.length>0){
				var serverCenter = serverCenterArr[0];
				var unfuxingNum = declarationData.rangli_gold/systemSet.turnover_rate*0.005;
				await dao.updateTow(request, "user",{"_id":serverCenter._id+""},{$inc:{"serverCenter.unfuxing":unfuxingNum, "serverCenter.totalYeJi":declarationData.gold_xf}})  //待缴税福星
				var saveData5={
					username: serverCenter.serverCenter.username,
					userId: serverCenter._id+"",
					name: serverCenter.serverCenter.merchant_name,
					userMobile: serverCenter.serverCenter.merchant_tell,
					userCode: serverCenter.serverCenter.user_id,
					fudai: 0,					// 福袋
					fuxing: 0,					// 福星
					unfuxing: unfuxingNum,		// 代缴税福星
					userType: 4,				// 1用户 2商户 3服务商 4服务中心
					type: 6, 					// 消费增加商户所属市级服务中心的代缴税福星
					createTime: new Date().getTime()
				}
				await dao.save(request, "distributeRecord", saveData5);   //生成派发记录
				var saveData3={
					username: serverCenter.serverCenter.username,
					userId: serverCenter._id+"",
					name: serverCenter.serverCenter.merchant_name,
					userMobile: serverCenter.serverCenter.merchant_tell,
					userCode: serverCenter.serverCenter.user_id,
					yeji: declarationData.gold_xf,  // 消费者消费增加推荐人的业绩
					userType: 4,			// 1用户 2商户 3服务商 4服务中心
					type: 5, 					// 增加商户 所在（服务中心）的业绩
					fromUser: merchant.merchat.username,
					fromCode: merchant.merchat.user_id,
					createTime: new Date().getTime()
				}
				await dao.save(request, "yejiRecord", saveData3); //生成商户所在地（服务中心）的业绩
			}
			var cityArray = await dao.findOne(request, "cityListRecord",{"city": declarationData.inCity});
			if(cityArray != null){
				await dao.updateTow(request, "cityListRecord", {"_id": cityArray._id+""},{$inc:{"today.sumRangLi": declarationData.rangli_gold, "today.sumXiaoFei": declarationData.gold_xf}});  //城市累计总让利和总消费
			}
		}
		var result = await dao.updateTow(request, "declarationRecord", {"_id": request.payload.id+""}, {$set:{"state": request.payload.state, "operationUser":adminManager.username+"", "chuliTime": new Date().getTime()}});
		//var result = await dao.updateOne(request,"declarationRecord",{"_id": request.payload.id+""},{"state": request.payload.state});
		if(result == null){
	        reply({"message":"更新失败","statusCode":108,"status":false});
	    }else{

	        reply({"message":"更新成功","statusCode":107,"status":true});
	    }
	}
}

// 每天 00:00 计算昨日所有商家的让利情况
exports.totalAllMerchantRangLiAct = async function(request, reply){
	var systemSetData = await dao.find(request,"systemSet");
	var systemSet = systemSetData[0].systemSet;
	var currentTime = new Date().getTime();
	var yesterdayTime = currentTime - 86400000; //昨天的时间戳
	var allMerchant = await dao.find(request, "user",{"merchat":{$exists:true}});
	for(var i=0; i<allMerchant.length;i++){
		var item = allMerchant[i];
		//某商户昨日让利 总金额
		var totalRanLi = await dao.findSum(request,"declarationRecord",{$match:{"chuliTime":{$gte:yesterdayTime}, "state":2, "merchantId":item._id+""}},{$group:{_id:null,toGold:{$sum:"$rangli_gold"}}}); 
		if(totalRanLi!= null && totalRanLi.length>0){
			if(totalRanLi[0].toGold>0){
				if(totalRanLi[0].toGold>item.merchat.merchat_drl){   //刷新单日最高让利
					await dao.updateTow(request,"user",{"_id":item._id+""},{$inc:{"merchat.merchat_zrl":totalRanLi[0].toGold},$set:{"merchat.merchat_yesRL":totalRanLi[0].toGold, "merchat.merchat_drl":totalRanLi[0].toGold}});
				}else{
					await dao.updateTow(request,"user",{"_id":item._id+""},{$inc:{"merchat.merchat_zrl":totalRanLi[0].toGold},$set:{"merchat.merchat_yesRL":totalRanLi[0].toGold}});
				}
				if(!item.merchat.merchant_RLState){  //表示该商家停止派发
					if(totalRanLi[0].toGold<item.merchat.merchat_dabiao){
						var dayRangli = item.merchat.merchat_dabiao-totalRanLi[0].toGold; // 差多少达标 减去 今日的返利
						await dao.updateTow(request,"user",{"_id":item._id+""},{$set:{"merchat.merchat_dabiao":dayRangli}});
					}else{
						var dayRangli = totalRanLi[0].toGold > item.merchat.merchat_drl ? totalRanLi[0].toGold : item.merchat.merchat_drl;
						await dao.updateTow(request,"user",{"_id":item._id+""},{$set:{"merchat.merchant_RLState":true, "merchat.merchant_cycle":systemSet.cycle, "merchat.merchant_cycleNum":0, "merchat.merchat_dabiao":dayRangli}});
					}
				}
				var saveData = {
					merchatId: item._id+"",
					merchatName: item.merchat.merchant_name,
					merchatUserName: item.merchat.username,
					merchatCode: item.merchat.user_id,
					inCity: item.merchat.merchant_city,				// 商户所在城市
					totalRanLi: totalRanLi[0].toGold,				// 商户昨日让利总金额
					createTime: new Date().getTime(),
				}
				await dao.save(request,"rangliRecord", saveData);			// 生成 商户让利记录
			}	
		}

		// 城市累加昨日的营业额
		//某商户昨日营业 总金额
		var totalYingYe = await dao.findSum(request,"declarationRecord",{$match:{"chuliTime":{$gte:yesterdayTime}, "state":2, "merchantId":item._id+""}},{$group:{_id:null,toGold:{$sum:"$gold_xf"}}}); 
		var cityArray = await dao.findOne(request, "cityListRecord",{"city": item.merchat.merchant_city});
		if(cityArray != null){
			var rangli = 0, yingye = 0;
			if(totalRanLi!= null && totalRanLi.length>0){
				if(totalRanLi[0].toGold>0){
					rangli = totalRanLi[0].toGold;
				}
			}
			if(totalYingYe!= null && totalYingYe.length>0){
				if(totalYingYe[0].toGold>0){
					yingye = totalYingYe[0].toGold;
				}
			}
			if(yingye>0 || rangli >0){
				await dao.updateTow(request, "cityListRecord", {"_id": cityArray._id+""},{$inc:{"sumRangLi": rangli, "sumXiaoFei": yingye}});  //城市累计总让利和总消费
			}
		}	
	}

	//每日00:00清楚今日营业额
	await dao.updateMore(request, "cityListRecord", {},{$set:{"today.sumRangLi": 0, "today.sumXiaoFei": 0}});

	var saveIndexData = {
		userIndex: systemSet.yes_userIndex?systemSet.yes_userIndex:0,
		merchantIndex: systemSet.yes_merchantIndex?systemSet.yes_merchantIndex:0,
		createTime: new Date().getTime()
	}
	await dao.save(request, "indexRecord", saveIndexData);  //生成指数变动记录
	// 更新昨日用户和商户的指数
	await dao.updateTow(request, "systemSet", {"_id": systemSetData[0]._id+""}, {$set:{"systemSet.yes_userIndex": systemSet.userIndex, "systemSet.yes_merchantIndex": systemSet.merchantIndex}}); 
}

// 每天 03:00 计算昨日的福袋发放
exports.totalYesterdayFudaiAct= async function(request, reply){
	var systemSetData = await dao.find(request,"systemSet");
	var systemSet = systemSetData[0].systemSet;
	var currentTime = new Date().getTime();
	var yesterdayTime = currentTime - 86400000; //昨天的时间戳
	if(parseInt(systemSet.allSwitch) === 1){		//平台总返利开关
		//统计昨日有效让利金额
		/*var totalRanLi = await dao.findSum(request,"declarationRecord",{$match:{"createTime":{$gte:yesterdayTime}, "state":2}},{$group:{_id:null,toGold:{$sum:"$rangli_gold"}}});   
		if(totalRanLi!= null && totalRanLi.length>0){
			var S1 = totalRanLi[0].toGold/systemSet.turnover_rate*0.1;  //派发总额S1
			//统计当前消费者的福袋个数 取 整数部分
			var userTotalFudai = await dao.findSum(request,"user",{$match:{"fudai":{$gt:0}}},{$group:{_id:null,toGold:{$sum:"$fudai"}}});
			if(userTotalFudai != null){
				userTotalFudai = parseInt(userTotalFudai[0].toGold);  // 取整数部分
				var userIndex = S1/userTotalFudai;   //消费者福袋指数
				userIndex = systemSet.userIndex;
				var allUser = await dao.find(request, 'user', {"fudai":{$gt:0}});
				for(var i=0; i<allUser.length;i++){
					var objUser = allUser[i];
					//给用户派发福星 同时扣除福袋数量
					var js_fudai = objUser.fudai*userIndex/300;
					var js_fuxing = objUser.fudai*userIndex;
					await dao.updateTow(request,'user', {"_id": objUser._id+""},{$inc:{"fudai":-js_fudai,"fuxing":js_fuxing, "zfuxing":js_fuxing, "delFudai": js_fudai},$set:{"yesJiLi":js_fuxing}});
					var saveData={
						username: objUser.username,
						userId: objUser._id+"",
						name: objUser.name,
						userMobile: objUser.mobile,
						userCode: objUser.user_id,
						fudai: js_fudai,			// 每天扣除的福袋
						fuxing: js_fuxing,			// 每天派发的福星
						userType: 1,				// 1用户 2商户 3服务商 4服务中心
						type: 1, 					// 每日派发
						createTime: new Date().getTime()
					}
					await dao.save(request, "distributeRecord", saveData);   //生成派发记录
				}
			}
			var userIndex = systemSet.userIndex;
			var allUser = await dao.find(request, 'user', {"fudai":{$gt:0}});
			for(var i=0; i<allUser.length;i++){
				var objUser = allUser[i];
				//给用户派发福星 同时扣除福袋数量
				var js_fudai = objUser.fudai*userIndex/300;
				var js_fuxing = objUser.fudai*userIndex;
				await dao.updateTow(request,'user', {"_id": objUser._id+""},{$inc:{"fudai":-js_fudai,"fuxing":js_fuxing, "zfuxing":js_fuxing, "delFudai": js_fudai},$set:{"yesJiLi":js_fuxing}});
				var saveData={
					username: objUser.username,
					userId: objUser._id+"",
					name: objUser.name,
					userMobile: objUser.mobile,
					userCode: objUser.user_id,
					fudai: js_fudai,			// 每天扣除的福袋
					fuxing: js_fuxing,			// 每天派发的福星
					userType: 1,				// 1用户 2商户 3服务商 4服务中心
					type: 1, 					// 每日派发
					createTime: new Date().getTime()
				}
				await dao.save(request, "distributeRecord", saveData);   //生成派发记录
			}
			
			if(parseInt(systemSet.merchatSwitch) === 1){	// 周期考核 开关	开启	
				//统计当前商户的福袋个数 取 整数部分
				var merchantTotalFudai = await dao.findSum(request,"user",{$match:{"merchat.merchat_fudai":{$gt:0}}},{$group:{_id:null,toGold:{$sum:"$merchat.merchat_fudai"}}});
				if(merchantTotalFudai != null && merchantTotalFudai.length>0){
					merchantTotalFudai = parseInt(merchantTotalFudai[0].toGold);  // 取整数部分
					var merchantIndex = S1/merchantTotalFudai;   //消费者福袋指数
					merchantIndex = systemSet.merchantIndex;
					var allMerchant = await dao.find(request, 'user', {"merchat":{$exists:true},"merchat.merchat_fudai":{$gt:0}, "merchat.merchant_RLState": true});
					for(var i=0; i<allMerchant.length;i++){
						var objUser = allMerchant[i];
						//给商户派发福星 同时扣除福袋数量
						var js_fudai = objUser.merchat.merchat_fudai*userIndex/150;
						var js_fuxing = objUser.merchat.merchat_fudai*userIndex;
						if(objUser.merchat.merchat_fudai>js_fudai){			// 保证福袋 不会有负数
							// 计算周期问题
							var cycleDays = objUser.merchat.merchant_cycle;   //商户当前的返利周期的天数
							if(cycleDays-1 == 0){   // 一个周期结束 判断下一个周期是否能够返利
								// 统计过去 15天的让利总和
								var rangliArr = await dao.find(request, "rangliRecord", {"merchatId":objUser._id+""},{},{createTime:-1},parseInt(objUser.merchat.merchant_cycleNum?objUser.merchat.merchant_cycleNum:0),parseInt(1));
								var rangliSum = 0;
								//计算一个周期内的总让利
								for(var n=0; n<rangliArr.length;n++){
									rangliSum = rangliArr[n].totalRanLi+rangliSum;
								}
								if(rangliSum<objUser.merchat.merchat_drl){
									await dao.updateTow(request,"user",{"_id":objUser._id},{$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing, "merchat.merchat_zfuxing":js_fuxing},$set:{"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":false, "merchat.merchant_cycle":0, "merchat.merchat_dabiao":objUser.merchat.merchat_drl-rangliSum}});
								}else{
									await dao.updateTow(request,"user",{"_id":objUser._id},{$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing, "merchat.merchat_zfuxing":js_fuxing},$set:{"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":true, "merchat.merchant_cycle":systemSet.cycle, "merchat.merchant_cycleNum":0, "merchat.merchat_dabiao":objUser.merchat.merchat_drl }});
								}
								var saveData={
									username: objUser.merchat.username,
									userId: objUser._id+"",
									name: objUser.merchat.merchant_name,
									userMobile: objUser.merchat.merchant_tell,
									userCode: objUser.merchat.user_id,
									fudai: js_fudai,			// 每天扣除的福袋
									fuxing: js_fuxing,			// 每天派发的福星
									userType: 2,				// 1用户 2商户 3服务商 4服务中心
									type: 1, 					// 每日派发
									createTime: new Date().getTime()
								}
								await dao.save(request, "distributeRecord", saveData);   //生成派发记录
								// 后续研究   新 写法
								//await dao.findSum(request,"rangliRecord",{ $match:{"merchatId":objUser._id+""}, $sort:{createTime:-1}, $skip:1, $limit:15 },{$group: {_id:null,toGold:{$sum:"$totalRanLi"}} });
							}else{
								//await dao.updateTow(request,'user', {"_id": objUser._id+""}, {$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_fuxing":js_fuxing, "merchat.merchant_cycle":-1}, {$set:{"merchat.merchant_RLState":true}}});
								await dao.updateTow(request,'user', {"_id": objUser._id+""}, {$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing,  "merchat.merchat_zfuxing":js_fuxing, "merchat.merchant_cycle":-1,"merchat.merchant_cycleNum":1},$set:{"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":true, "merchat.merchat_dabiao":objUser.merchat.merchat_drl-rangliSum<=0?0:objUser.merchat.merchat_drl-rangliSum}});
								var saveData={
									username: objUser.username,
									userId: objUser._id+"",
									name: objUser.merchat.merchant_name,
									userMobile: objUser.merchat.merchant_tell,
									userCode: objUser.merchat.user_id,
									fudai: js_fudai,			// 每天扣除的福袋
									fuxing: js_fuxing,			// 每天派发的福星
									userType: 2,				// 1用户 2商户 3服务商 4服务中心
									type: 1, 					// 每日派发
									createTime: new Date().getTime()
								}
								await dao.save(request, "distributeRecord", saveData);   //生成派发记录
							}
						}
					}
				}
				var merchantIndex = systemSet.merchantIndex;
				var allMerchant = await dao.find(request, 'user', {"merchat":{$exists:true},"merchat.merchat_fudai":{$gt:0}, "merchat.merchant_RLState": true});
				for(var i=0; i<allMerchant.length;i++){
					var objUser = allMerchant[i];
					//给商户派发福星 同时扣除福袋数量
					var js_fudai = objUser.merchat.merchat_fudai*userIndex/150;
					var js_fuxing = objUser.merchat.merchat_fudai*userIndex;
					if(objUser.merchat.merchat_fudai>js_fudai){			// 保证福袋 不会有负数
						// 计算周期问题
						var cycleDays = objUser.merchat.merchant_cycle;   //商户当前的返利周期的天数
						if(cycleDays-1 == 0){   // 一个周期结束 判断下一个周期是否能够返利
							// 统计过去 15天的让利总和
							var rangliArr = await dao.find(request, "rangliRecord", {"merchatId":objUser._id+""},{},{createTime:-1},parseInt(objUser.merchat.merchant_cycleNum?objUser.merchat.merchant_cycleNum:0),parseInt(1));
							var rangliSum = 0;
							//计算一个周期内的总让利
							for(var n=0; n<rangliArr.length;n++){
								rangliSum = rangliArr[n].totalRanLi+rangliSum;
							}
							if(rangliSum<objUser.merchat.merchat_drl){
								await dao.updateTow(request,"user",{"_id":objUser._id},{$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing, "merchat.merchat_zfuxing":js_fuxing},$set:{"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":false, "merchat.merchant_cycle":0, "merchat.merchat_dabiao":objUser.merchat.merchat_drl-rangliSum}});
							}else{
								await dao.updateTow(request,"user",{"_id":objUser._id},{$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing, "merchat.merchat_zfuxing":js_fuxing},$set:{"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":true, "merchat.merchant_cycle":systemSet.cycle, "merchat.merchant_cycleNum":0, "merchat.merchat_dabiao":objUser.merchat.merchat_drl }});
							}
							var saveData={
								username: objUser.merchat.username,
								userId: objUser._id+"",
								name: objUser.merchat.merchant_name,
								userMobile: objUser.merchat.merchant_tell,
								userCode: objUser.merchat.user_id,
								fudai: js_fudai,			// 每天扣除的福袋
								fuxing: js_fuxing,			// 每天派发的福星
								userType: 2,				// 1用户 2商户 3服务商 4服务中心
								type: 1, 					// 每日派发
								createTime: new Date().getTime()
							}
							await dao.save(request, "distributeRecord", saveData);   //生成派发记录
							// 后续研究   新 写法
							//await dao.findSum(request,"rangliRecord",{ $match:{"merchatId":objUser._id+""}, $sort:{createTime:-1}, $skip:1, $limit:15 },{$group: {_id:null,toGold:{$sum:"$totalRanLi"}} });
						}else{
							//await dao.updateTow(request,'user', {"_id": objUser._id+""}, {$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_fuxing":js_fuxing, "merchat.merchant_cycle":-1}, {$set:{"merchat.merchant_RLState":true}}});
							await dao.updateTow(request,'user', {"_id": objUser._id+""}, {$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing,  "merchat.merchat_zfuxing":js_fuxing, "merchat.merchant_cycle":-1,"merchat.merchant_cycleNum":1},$set:{"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":true, "merchat.merchat_dabiao":objUser.merchat.merchat_drl-rangliSum<=0?0:objUser.merchat.merchat_drl-rangliSum}});
							var saveData={
								username: objUser.username,
								userId: objUser._id+"",
								name: objUser.merchat.merchant_name,
								userMobile: objUser.merchat.merchant_tell,
								userCode: objUser.merchat.user_id,
								fudai: js_fudai,			// 每天扣除的福袋
								fuxing: js_fuxing,			// 每天派发的福星
								userType: 2,				// 1用户 2商户 3服务商 4服务中心
								type: 1, 					// 每日派发
								createTime: new Date().getTime()
							}
							await dao.save(request, "distributeRecord", saveData);   //生成派发记录
						}
					}
				}
			}else{
				var merchantTotalFudai = await dao.findSum(request,"user",{$match:{"merchat.merchat_fudai":{$gt:0}}},{$group:{_id:null,toGold:{$sum:"$merchat.merchat_fudai"}}});
				if(merchantTotalFudai != null && merchantTotalFudai.length>0){
					merchantTotalFudai = parseInt(merchantTotalFudai[0].toGold);  // 取整数部分
					if(merchantTotalFudai>0){
						var merchantIndex = S1/merchantTotalFudai;   //消费者福袋指数
						merchantIndex = systemSet.merchantIndex;
						var allMerchant = await dao.find(request, 'user', {"merchat":{$exists:true},"merchat.merchat_fudai":{$gt:0}, "merchat.merchant_RLState": true});
						for(var i=0; i<allMerchant.length;i++){
							var objUser = allMerchant[i];
							//给商户派发福星 同时扣除福袋数量
							var js_fudai = objUser.merchat.merchat_fudai*userIndex/150;
							var js_fuxing = objUser.merchat.merchat_fudai*userIndex;
							if(objUser.merchat.merchat_fudai>js_fudai){			// 保证福袋 不会有负数
								await dao.updateTow(request,'user', {"_id": objUser._id+""}, {$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing,  "merchat.merchat_zfuxing":js_fuxing},$set:{"merchat.merchant_cycle":systemSet.cycle,"merchat.merchant_cycleNum":0,"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":true, "merchat.merchat_dabiao":0}});
								var saveData={
									username: objUser.username,
									userId: objUser._id+"",
									name: objUser.merchat.merchant_name,
									userMobile: objUser.merchat.merchant_tell,
									userCode: objUser.merchat.user_id,
									fudai: js_fudai,			// 每天扣除的福袋
									fuxing: js_fuxing,			// 每天派发的福星
									userType: 2,				// 1用户 2商户 3服务商 4服务中心
									type: 1, 					// 每日派发
									createTime: new Date().getTime()
								}
								await dao.save(request, "distributeRecord", saveData);   //生成派发记录
							}
						}
					}
				}

				var merchantIndex = systemSet.merchantIndex;
				var allMerchant = await dao.find(request, 'user', {"merchat":{$exists:true},"merchat.merchat_fudai":{$gt:0}, "merchat.merchant_RLState": true});
				for(var i=0; i<allMerchant.length;i++){
					var objUser = allMerchant[i];
					//给商户派发福星 同时扣除福袋数量
					var js_fudai = objUser.merchat.merchat_fudai*userIndex/150;
					var js_fuxing = objUser.merchat.merchat_fudai*userIndex;
					if(objUser.merchat.merchat_fudai>js_fudai){			// 保证福袋 不会有负数
						await dao.updateTow(request,'user', {"_id": objUser._id+""}, {$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing,  "merchat.merchat_zfuxing":js_fuxing},$set:{"merchat.merchant_cycle":systemSet.cycle,"merchat.merchant_cycleNum":0,"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":true, "merchat.merchat_dabiao":0}});
						var saveData={
							username: objUser.username,
							userId: objUser._id+"",
							name: objUser.merchat.merchant_name,
							userMobile: objUser.merchat.merchant_tell,
							userCode: objUser.merchat.user_id,
							fudai: js_fudai,			// 每天扣除的福袋
							fuxing: js_fuxing,			// 每天派发的福星
							userType: 2,				// 1用户 2商户 3服务商 4服务中心
							type: 1, 					// 每日派发
							createTime: new Date().getTime()
						}
						await dao.save(request, "distributeRecord", saveData);   //生成派发记录
					}
				}
			}
		}*/

		var userIndex = systemSet.userIndex;
		var allUser = await dao.find(request, 'user', {"fudai":{$gt:0}});
		for(var i=0; i<allUser.length;i++){
			var objUser = allUser[i];
			//给用户派发福星 同时扣除福袋数量
			var js_fudai = objUser.fudai*userIndex/systemSet.userPaiFa;
			var js_fuxing = objUser.fudai*userIndex;
			await dao.updateTow(request,'user', {"_id": objUser._id+""},{$inc:{"fudai":-js_fudai,"fuxing":js_fuxing, "zfuxing":js_fuxing, "delFudai": js_fudai},$set:{"yesJiLi":js_fuxing}});
			var saveData={
				username: objUser.username,
				userId: objUser._id+"",
				name: objUser.name,
				userMobile: objUser.mobile,
				userCode: objUser.user_id,
				fudai: js_fudai,			// 每天扣除的福袋
				fuxing: js_fuxing,			// 每天派发的福星
				userType: 1,				// 1用户 2商户 3服务商 4服务中心
				type: 1, 					// 每日派发
				createTime: new Date().getTime()
			}
			await dao.save(request, "distributeRecord", saveData);   //生成派发记录
		}
		if(parseInt(systemSet.merchatSwitch) === 1){	// 周期考核 开关	开启	
			var merchantIndex = systemSet.merchantIndex;
			var allMerchant = await dao.find(request, 'user', {"merchat":{$exists:true},"merchat.merchat_fudai":{$gt:0}, "merchat.merchant_RLState": true});
			for(var i=0; i<allMerchant.length;i++){
				var objUser = allMerchant[i];
				//给商户派发福星 同时扣除福袋数量
				var js_fudai = objUser.merchat.merchat_fudai*merchantIndex/systemSet.merchantPaiFa;
				var js_fuxing = objUser.merchat.merchat_fudai*merchantIndex;
				if(objUser.merchat.merchat_fudai>js_fudai){			// 保证福袋 不会有负数
					// 计算周期问题
					var cycleDays = objUser.merchat.merchant_cycle;   //商户当前的返利周期的天数
					if(cycleDays-1 == 0){   // 一个周期结束 判断下一个周期是否能够返利
						// 统计过去 15天的让利总和
						var rangliArr = await dao.find(request, "rangliRecord", {"merchatId":objUser._id+""},{},{createTime:-1},parseInt(objUser.merchat.merchant_cycleNum?objUser.merchat.merchant_cycleNum:0),parseInt(1));
						var rangliSum = 0;
						//计算一个周期内的总让利
						for(var n=0; n<rangliArr.length;n++){
							rangliSum = rangliArr[n].totalRanLi+rangliSum;
						}
						if(rangliSum<objUser.merchat.merchat_drl){
							await dao.updateTow(request,"user",{"_id":objUser._id},{$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing, "merchat.merchat_zfuxing":js_fuxing},$set:{"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":false, "merchat.merchant_cycle":0, "merchat.merchat_dabiao":objUser.merchat.merchat_drl-rangliSum}});
						}else{
							await dao.updateTow(request,"user",{"_id":objUser._id},{$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing, "merchat.merchat_zfuxing":js_fuxing},$set:{"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":true, "merchat.merchant_cycle":systemSet.cycle, "merchat.merchant_cycleNum":0, "merchat.merchat_dabiao":objUser.merchat.merchat_drl }});
						}
						var saveData={
							username: objUser.merchat.username,
							userId: objUser._id+"",
							name: objUser.merchat.merchant_name,
							userMobile: objUser.merchat.merchant_tell,
							userCode: objUser.merchat.user_id,
							fudai: js_fudai,			// 每天扣除的福袋
							fuxing: js_fuxing,			// 每天派发的福星
							userType: 2,				// 1用户 2商户 3服务商 4服务中心
							type: 1, 					// 每日派发
							createTime: new Date().getTime()
						}
						await dao.save(request, "distributeRecord", saveData);   //生成派发记录
						// 后续研究   新 写法
						//await dao.findSum(request,"rangliRecord",{ $match:{"merchatId":objUser._id+""}, $sort:{createTime:-1}, $skip:1, $limit:15 },{$group: {_id:null,toGold:{$sum:"$totalRanLi"}} });
					}else{
						//await dao.updateTow(request,'user', {"_id": objUser._id+""}, {$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_fuxing":js_fuxing, "merchat.merchant_cycle":-1}, {$set:{"merchat.merchant_RLState":true}}});
						await dao.updateTow(request,'user', {"_id": objUser._id+""}, {$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing,  "merchat.merchat_zfuxing":js_fuxing, "merchat.merchant_cycle":-1,"merchat.merchant_cycleNum":1},$set:{"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":true, "merchat.merchat_dabiao":objUser.merchat.merchat_drl-rangliSum<=0?0:objUser.merchat.merchat_drl-rangliSum}});
						var saveData={
							username: objUser.username,
							userId: objUser._id+"",
							name: objUser.merchat.merchant_name,
							userMobile: objUser.merchat.merchant_tell,
							userCode: objUser.merchat.user_id,
							fudai: js_fudai,			// 每天扣除的福袋
							fuxing: js_fuxing,			// 每天派发的福星
							userType: 2,				// 1用户 2商户 3服务商 4服务中心
							type: 1, 					// 每日派发
							createTime: new Date().getTime()
						}
						await dao.save(request, "distributeRecord", saveData);   //生成派发记录
					}
				}
			}
		}else{
			var merchantIndex = systemSet.merchantIndex;
			var allMerchant = await dao.find(request, 'user', {"merchat":{$exists:true},"merchat.merchat_fudai":{$gt:0}, "merchat.merchant_RLState": true});
			for(var i=0; i<allMerchant.length;i++){
				var objUser = allMerchant[i];
				//给商户派发福星 同时扣除福袋数量
				var js_fudai = objUser.merchat.merchat_fudai*merchantIndex/systemSet.merchantPaiFa;
				var js_fuxing = objUser.merchat.merchat_fudai*merchantIndex;
				if(objUser.merchat.merchat_fudai>js_fudai){			// 保证福袋 不会有负数
					await dao.updateTow(request,'user', {"_id": objUser._id+""}, {$inc:{"merchat.merchat_fudai":-js_fudai, "merchat.merchat_delFudai":js_fudai, "merchat.merchat_fuxing":js_fuxing,  "merchat.merchat_zfuxing":js_fuxing},$set:{"merchat.merchant_cycle":systemSet.cycle,"merchat.merchant_cycleNum":0,"merchat.merchat_yesJiLi":js_fuxing, "merchat.merchant_RLState":true, "merchat.merchat_dabiao":0}});
					var saveData={
						username: objUser.username,
						userId: objUser._id+"",
						name: objUser.merchat.merchant_name,
						userMobile: objUser.merchat.merchant_tell,
						userCode: objUser.merchat.user_id,
						fudai: js_fudai,			// 每天扣除的福袋
						fuxing: js_fuxing,			// 每天派发的福星
						userType: 2,				// 1用户 2商户 3服务商 4服务中心
						type: 1, 					// 每日派发
						createTime: new Date().getTime()
					}
					await dao.save(request, "distributeRecord", saveData);   //生成派发记录
				}
			}
		}
	}
}

// 获取某用户或者商户的派发的福袋或者福星
exports.userDistributeList = async function(request, reply){
	var user = request.auth.credentials;
	var userType = parseInt(request.params.userType);
	if(userType == 1){  //用户
		var result = await dao.find(request, "distributeRecord", {"userId": user._id+"","userType":userType},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	    var sum = await dao.findCount(request,"distributeRecord",{"userId": user._id+"","userType":userType});
	    if(result == null){
	        reply({"message":"查找用户的福袋派发失败！","statusCode":102,"status":false});
	        return;
	    }else{
	        reply({"message":"查找用户的福袋派发成功！","statusCode":107,"status":true,"resource":result,"sum":sum});
	        return;
	    }
	}
	if(userType == 2){  //商户
		var result = await dao.find(request, "distributeRecord", {"userId": user._id+"","userType":userType},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	    var sum = await dao.findCount(request,"distributeRecord",{"userId": user._id+"","userType":userType});
	    if(result == null){
	        reply({"message":"查找用户的福袋派发失败！","statusCode":102,"status":false});
	        return;
	    }else{
	        reply({"message":"查找用户的福袋派发成功！","statusCode":107,"status":true,"resource":result,"sum":sum});
	        return;
	    }
	}

	if(userType == 3){  //服务商
		var result = await dao.find(request, "distributeRecord", {"userId": user._id+"","userType":userType},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	    var sum = await dao.findCount(request,"distributeRecord",{"userId": user._id+"","userType":userType});
	    if(result == null){
	        reply({"message":"查找用户的福袋派发失败！","statusCode":102,"status":false});
	        return;
	    }else{
	        reply({"message":"查找用户的福袋派发成功！","statusCode":107,"status":true,"resource":result,"sum":sum});
	        return;
	    }
	}
	if(userType == 4){  //服务中心
		var result = await dao.find(request, "distributeRecord", {"userId": user._id+"","userType":userType},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
	    var sum = await dao.findCount(request,"distributeRecord",{"userId": user._id+"","userType":userType});
	    if(result == null){
	        reply({"message":"查找用户的福袋派发失败！","statusCode":102,"status":false});
	        return;
	    }else{
	        reply({"message":"查找用户的福袋派发成功！","statusCode":107,"status":true,"resource":result,"sum":sum});
	        return;
	    }
	}
}





