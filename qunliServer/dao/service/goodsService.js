/**
 * 商品管理器
 * Created by shichenda on 2016/5/17.
 */

const dao = require("../dao/dao");


//添加商品
exports.addGoods = async function(request,reply){

    var goods = request.payload;
    goods["createTime"] = new Date().getTime();
    var type = await dao.findById(request,"goodsCategory",goods.category);
    goods.type = type;
    var result = await dao.save(request,"goods",goods);

    if(result==null){
        reply({"message":"添加商品失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加商品成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}


//删除商品
exports.delGoods = async function(request,reply){

    var result = await dao.del(request,"goods",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除商品失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除商品成功","statusCode":103,"status":true});
    }
}

//更新商品
exports.updateGoods = async function(request,reply){

    if(request.payload.category){
        request.payload.type = await dao.findById(request,"goodsCategory",request.payload.category);
    }

    var result = await dao.updateOne(request,"goods",{"_id":request.params.id},request.payload);

    if(result==null){
        reply({"message":"更新商品失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新商品成功","statusCode":105,"status":true});
    }
}

//获取某个goods
exports.getGoods =async function(request,reply){
    if(!request.params.id){
        reply({"message":"没有查到该商品！","statusCode":108,"status":false});
        return;
    }
    const goods = await dao.findById(request,"goods",request.params.id);
    if(goods == null){
        reply({"message":"没有查到该商品！","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品成功","statusCode":107,"status":true,"resource":goods});
    }
}

//获取goodslist
exports.getGoodsList = async function(request,reply){
    //列表
    var data = await dao.find(request,"goods",{"state":1},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"state":1});

    if(data == null){
        reply({"message":"查找商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取商品下架列表
exports.getGoodsLowerList = async function(request,reply){
    //列表
    var data = await dao.find(request,"goods",{"state":0},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"state":0});

    if(data == null){
        reply({"message":"查找下架商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找下架商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取某分类下的商品列表
exports.getGoodsTypeList = async function(request,reply){
    //列表
    var data = await dao.find(request,"goods",{"state":1,"category":request.params.categoryId},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"state":1,"category":request.params.categoryId});

    if(data == null){
        reply({"message":"查找商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//搜索商品下架列表
exports.searchGoods = async function(request,reply){
    //列表
    var data = await dao.find(request,"goods",{"state":1,"name":eval("/"+request.payload.keyword+"/")},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"state":1,"name":eval("/"+request.payload.keyword+"/")});

    if(data == null){
        reply({"message":"搜索商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取推荐商品列表
exports.recommendGoods = async function(request, reply){
    var data = await dao.find(request,"goods",{"tuijian":1,"state":1},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"tuijian":1,"state":1});

    if(data == null){
        reply({"message":"搜索推荐商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索推荐商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取热门商品列表
exports.hotGoods = async function(request, reply){
    var data = await dao.find(request,"goods",{"remen":1,"state":1},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"remen":1,"state":1});

    if(data == null){
        reply({"message":"搜索推荐商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索推荐商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

/* ******  超管   *********/

// 添加 提货卷商品 和 爱车基金商品
exports.addAdminGoods = async function(request, reply){
    var goods = request.payload;
    goods["createTime"] = new Date().getTime();
    var result = await dao.save(request,"goods",goods);
    if(result==null){
        reply({"message":"添加商品失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加商品成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

exports.getAdminGoodsList = async function(request, reply){
    //列表
    var data = await dao.find(request,"goods",{"state":1},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"state":1});

    if(data == null){
        reply({"message":"查找商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//主后台根据商品名字搜索
exports.searchAdminGoodsListAct = async function(request, reply){
    var data = await dao.find(request, "goods", request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"goods",request.payload.where);
    if(data == null){
        reply({"message":"查找商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取某个goods
exports.getAdminGoods =async function(request,reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    const goods = await dao.findById(request,"goods",request.params.id+"");
    if(goods == null){
        reply({"message":"没有查到该商品！","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品成功","statusCode":107,"status":true,"resource":goods});
    }
}

//更新商品
exports.updateAdminGoods = async function(request,reply){

    if(request.payload.category){
        request.payload.type = await dao.findById(request,"goodsCategory",request.payload.category);
    }

    var result = await dao.updateOne(request,"goods",{"_id":request.params.id},request.payload);

    if(result==null){
        reply({"message":"更新商品失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新商品成功","statusCode":105,"status":true});
    }
}

//获取商品下架列表
exports.getAdminGoodsLowerList = async function(request,reply){
    //列表
    var data = await dao.find(request,"goods",{"state":0},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"state":0});

    if(data == null){
        reply({"message":"查找下架商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找下架商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//删除商品
exports.delAdminGoods = async function(request,reply){

    var result = await dao.del(request,"goods",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除商品失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除商品成功","statusCode":103,"status":true});
    }
}

//后台删除商户的商品
exports.delGoodsFromAdmin = async function(request, reply){
    var result = await dao.del(request,"goods",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除商品失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除商品成功","statusCode":103,"status":true});
    }
}

//获取某专区下的商品列表
exports.getAdminGoodsTypeList = async function(request,reply){
    //列表
    var data = await dao.find(request,"goods",{"state":1,"category":request.params.categoryId},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"state":1,"category":request.params.categoryId});

    if(data == null){
        reply({"message":"查找商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}


//exports.updataAll =async function(request,reply){
//    var datas = await dao.find(request,"goods");
//    if(datas == null){
//        reply({"message":"更新商品列表失败","statusCode":108,"status":false});
//    }else{
//        for(let i=0;i<datas.length;i++){
//            var type = await dao.findById(request,"goodsCategory",datas[i].category);
//            dao.updateOne(request,"goods",{"_id":datas[i]._id+""},{type:type});
//        }
//        reply({"message":"更新商品列表成功","statusCode":107,"status":true});
//    }
//}



/*********    商户   **********/


// 商户添加商品
exports.addMerchantGoods = async function (request,reply){
    var merchant = request.auth.credentials;
    var goods = request.payload;
    goods["createTime"] = new Date().getTime();
    var type = await dao.findById(request,"goodsCategory",goods.category);
    var merchatInfo = await dao.findById(request,"user", merchant._id+'');
    goods.type = type;
    goods.merchatInfo = merchatInfo.merchat;
    goods.merchatId = merchant._id+"";
    var result = await dao.save(request,"goods",goods);
    if(result==null){
        reply({"message":"商户添加商品失败","statusCode":102,"status":false});
    }else{
        reply({"message":"商户添加商品成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//商户更新商品
exports.updateMerchantGoods = async function(request,reply){
    var goods = request.payload;
    if(request.payload.category){
        goods.type = await dao.findById(request,"goodsCategory",request.payload.category);
    }
    var merchant = request.auth.credentials;
    var merchatInfo = await dao.findById(request,"user", merchant._id);
    goods.merchatInfo = merchatInfo.merchat;
    goods.merchatId = merchant._id;
    var result = await dao.updateOne(request,"goods",{"_id":request.params.id},goods);

    if(result==null){
        reply({"message":"商户更新商品失败","statusCode":106,"status":false});
    }else{
        reply({"message":"商户更新商品成功","statusCode":105,"status":true});
    }
}

//获取商户的商品列表
exports.getMerchatGoodsList = async function (request,reply){
    var merchant = request.auth.credentials;
    //列表
    var data = await dao.find(request,"goods",{"state":1, "merchatId": merchant._id+''},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"state":1, "merchatId": merchant._id+''});

    if(data == null){
        reply({"message":"查找商户商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取商户下架商品列表
exports.getMerchatGoodsLowerList = async function (request,reply){
    var merchant = request.auth.credentials;
    //列表
    var data = await dao.find(request,"goods",{"state":0,"merchatId":merchant._id+''},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"goods",{"state":0, "merchatId":merchant._id+''});

    if(data == null){
        reply({"message":"查找商户下架商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户下架商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//后台 获取所有的 正常 商品列表
exports.getAllGoodsListAct = async function(request, reply){
    var data = await dao.find(request,"goods",{"state":1,"merchatId":{$exists:true}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"goods",{"state":1,"merchatId":{$exists:true}});
    if(data == null){
        reply({"message":"查找所有正常商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找所有正常商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//主后台 下架商品
exports.getAllGoodsOutAct =async function(request, reply){
    var goods = await dao.findById(request, "goods", request.params.id);
    if(goods == null){
        reply({"message":"该商品不存在","statusCode":108,"status":false});
        return;
    }else{
       var result = await dao.updateTow(request, "goods", {"_id":request.params.id+""},{$set:{"state":0}});
       if(result == null){
            reply({"message":"下架商品失败","statusCode":108,"status":false});
       }else{
            reply({"message":"下架商品成功","statusCode":107,"status":true});
       } 
    }
}

//主后台根据商品名字搜索
exports.searchGoodsListAct = async function(request, reply){
    var data = await dao.find(request, "goods", request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"goods",request.payload.where);
    if(data == null){
        reply({"message":"查找商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//后台 获取所有的 下架 商品列表
exports.getAllLowerGoodsListAct = async function(request, reply){
    var data = await dao.find(request,"goods",{"state":0,"merchatId":{$exists:true}},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"goods",{"state":0,"merchatId":{$exists:true}});
    if(data == null){
        reply({"message":"查找所有下架商品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找所有下架商品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//主后台 更新商品的热门和推荐 
exports.updateGoodsStatusAct = async function(request, reply){
    var goods = await dao.findById(request, "goods", request.params.id);
    if(goods == null){
        reply({"message":"该商品不存在","statusCode":108,"status":false});
        return;
    }else{
        var result = await dao.updateTow(request, "goods", {"_id":request.params.id+""},{$set:{"tuijian":request.payload.tuijian, "remen":request.payload.remen}});
        if(result == null){
            reply({"message":"更新失败，请重新更新","statusCode":108,"status":false});
            return;
        }else{
            reply({"message":"更新成功","statusCode":107,"status":true});
            return; 
        }
    }
}


