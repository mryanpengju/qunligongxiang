/**
 * 商品分类管理
 * Created by shichenda on 2016/5/21.
 */

const dao = require("../dao/dao");

//添加商品分类
exports.addCategory = async function(request,reply){

    var Category = await dao.save(request,"goodsCategory",request.payload);

    if(Category==null){
        reply({"message":"添加商品分类失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加商品分类成功","statusCode":101,"status":true,"resource":Category.ops[0]});
    }
}

//删除商品分类
exports.delCategory = async function(request,reply){

    var shops = await dao.findCount(request,"goods",{"category":request.params.id});
    var types = await dao.findCount(request,"goodsCategory",{"parentId":request.params.id});

    if(shops!=0||types!=0){
        if(shops!=0){
            reply({"message":"该分类下还有商品，请先将商品转移或者删除。","statusCode":104,"status":false});
        }else{
            reply({"message":"该分类下还有子分类，请先将子分类转移或者删除。","statusCode":104,"status":false});
        }
    }else{
        var result = await dao.del(request,"goodsCategory",{"_id":request.params.id});
        if(result==null){
            reply({"message":"删除商品分类失败","statusCode":104,"status":false});
        }else{
            reply({"message":"删除商品分类成功","statusCode":103,"status":true});
        }
    }

}

//更新商品分类
exports.updateCategory = async function(request,reply){

    var result = await dao.updateOne(request,"goodsCategory",{"_id":request.params.id},request.payload);

    if(result==null){
        reply({"message":"更新商品分类失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新商品分类成功","statusCode":105,"status":true});
    }
}

//获取某个Category
exports.getCategory = function(request,reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    db.collection('goodsCategory').findOne({"_id":new ObjectID(request.params.id)},{"password":0},function(err,result){
        if(err){
            request.server.log(['error'],err);
            throw err;
            reply({"message":"查找商品分类失败","statusCode":108,"status":false});
        }else{
            reply({"message":"查找商品分类成功","statusCode":107,"status":true,"resource":result});
        }
    });
}

//获取Categorylist
exports.getCategoryList = async function(request,reply){

    //列表
    var data = await dao.find(request,"goodsCategory");

    if(data == null){
        reply({"message":"查找商品分类列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品分类列表成功","statusCode":107,"status":true,"resource":data});
    }
}

exports.getFourCategoryList = async function(request, reply){
    var number = request.params.number;
    //列表
    var data = await dao.find(request,"goodsCategory",{parentId: {$exists: true}},{},{},parseInt(number),parseInt(1));
    if(data == null ){
        reply({"message":"查找商品分类列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商品分类列表成功","statusCode":107,"status":true, "resource":data});
    }
}

