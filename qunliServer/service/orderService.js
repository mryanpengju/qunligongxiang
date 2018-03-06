/**
 * 订单管理器
 * Created by shichenda on 2016/5/17.
 */

const dao = require("../dao/dao");

//添加订单
exports.addOrder = async function(request,reply){

    var order = request.payload;
    var orderPayload = request.payload;
    var amount = 0;
    var orderItems = [];
    var zhuAmount = 0; //生成主订单需要用到
    var zhuOrderItems = []; //生成主订单需要用到
    var goodsList = []; //生成主订单需要用到

    var isErr = false;

    for(let i=0;i<order.goodsList.length;i++){

        var item = order.goodsList[i];
        var goods = await dao.findById(request,"goods",item.goodsId);

        if(goods!=null && goods.state!=0){
            var price = 0;
            var goodsModel = null;
            if(item.type){
                for(let i=0;i<goods.model.length;i++){
                    if(item.type==goods.model[i].guigeText){
                        if(goods.model[i].guigeNumber==0){
                            isErr = true;
                            reply({"message":"抱歉"+item.goods.name+"太受欢迎了，已经卖完了，请选择其他商品进行购买。","statusCode":102,"status":false});
                            return;
                        }
                        if(item.number > goods.model[i].guigeNumber){
                            isErr = true;
                            reply({"message":"抱歉"+item.goods.name+"太受欢迎了，库存不足，请修改该买数量。","statusCode":102,"status":false});
                            return;
                        }
                        goodsModel = goods.model[i];
                        price = goods.model[i].guigePrice;
                        break;
                    }
                }
            }else{
                price = goods.price;
            }

            // 生成主订单
            goodsList[item.goodsId] = {stock:goods.stock-item.number,sales:goods.sales+item.number}
            var zhuSendItem = {"id":item.goodsId,"name":goods.name, "price":price,"cover":goods.cover,"guigeText":item.type,"state":1,"number":parseInt(item.number)};
            zhuOrderItems.push(zhuSendItem);
            zhuAmount = zhuAmount + (price * 100 * zhuSendItem.number);

            /*var sendItem;
            if(goods.merchatId){
                if(item.number*price != item.total){
                    isErr = true;
                    reply({"message":"添加订单失败,计算金额有误。","statusCode":102,"status":false});
                    return;
                }else{
                    sendItem = {"id":item.goodsId,"merchatId":goods.merchatId,"name":item.goods.name, "price":price,"cover":item.goods.cover,"state":1,"number":item.number,"total": item.total};
                }
            }
            if(orderItems.length>0){
                var addStatus = false; //判断是否存在同一家的商品
                for(var n=0; n<orderItems.length; n++){
                    if(orderItems[n].merchatId == sendItem.merchatId){
                        orderItems[n].goods.push(sendItem);
                        orderItems[n].total = orderItems[n].total+item.total;
                        addStatus = true;
                        break;
                    }
                }
                if(!addStatus){
                    var orderObj = {
                        goods: [],
                        merchatId: goods.merchatId,
                        total: item.total
                    }
                    orderObj.goods.push(sendItem);
                    orderItems.push(orderObj); 
                }
            }else{
                var orderObj = {
                    goods: [],
                    merchatId: goods.merchatId,
                    total: item.total
                }
                orderObj.goods.push(sendItem);
                orderItems.push(orderObj);
            }*/
        }else{
            isErr = true;
            reply({"message":"抱歉"+item.goods.name+"已下架，请选择其他商品进行购买！","statusCode":102,"status":false});
            return;
        }
    }

    if(isErr){
        return;
    }else{
        //生成主订单
        order.goodsList = zhuOrderItems;
        zhuAmount = zhuAmount / 100;
        if(zhuAmount != order.paid){
            reply({"message":"添加订单失败,计算金额有误。","statusCode":102,"status":false});
            return;
        }
        order["orderNumber"] = new Date().getTime()+"";
        order["orderMain"] = 1;  //1 表示主订单及用户自己的订单
        order["createTime"] = new Date().getTime();
        var resultInfo = await dao.save(request,"order",order);
        //delete order._id;

        /*//生成商户订单
        //var resultInfo = [];
        for(var m=0; m<orderItems.length; m++){
            var orderDataItem = Object.assign({},orderPayload, orderItems[m]);
            orderDataItem["orderNumber"] = new Date().getTime()+"";
            orderDataItem["userId"] = order.userId;
            orderDataItem["createTime"] = new Date().getTime();
            orderDataItem["orderMain"] = 0;  //0 表示商户订单
            orderDataItem["mainOrderId"] =  orderDataItem._id+"";
            delete orderDataItem.goodsList;
            delete orderDataItem._id;
            await dao.save(request,"order",orderDataItem);
            //resultInfo.push(orderDataItem);
        }*/
        reply({"message":"添加订单成功","statusCode":101,"status":true,"resource":resultInfo.ops[0]});
        request.payload.goodsList.map(function(goods){   // 删除购物车里的数据
            dao.del(request,"shoppingCart",{"userId":order.userId,"goodsId":goods.id, "type.guigeText": goods.guigeText});
        });
    }

    /*order.goodsList = orderItems;

    amount = amount / 100;

    if(amount != order.paid){
        reply({"message":"添加订单失败,计算金额有误。","statusCode":102,"status":false});
        return;
    }

    order["orderNumber"] = new Date().getTime()+"";
    var result = await dao.save(request,"order",order);

    if(result==null){
        reply({"message":"添加订单失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加订单成功","statusCode":101,"status":true,"resource":result.ops[0]});
        order.goodsList.map(function(goods){
            dao.del(request,"shoppingCart",{"userId":order.userId,"goodsId":goods.id});
        });
    }*/
}

//直接购买
exports.addOneOrder = async function(request,reply){

    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    var order = request.payload;

    //查看商品库存是否够数
    var goods =await dao.findById(request,"goods",order.goodsList[0].goodsId);

    if(goods!=null && goods.state!=0){
        var item = order.goodsList[0];
        if(item.type){
            for(let i=0;i<goods.model.length;i++){
                if(item.type==goods.model[i].guigeText){
                    if(goods.model[i].guigeNumber==0){
                        reply({"message":"抱歉"+goods.name+"太受欢迎了，已经卖完了，请选择其他商品进行购买。","statusCode":102,"status":false});
                        return;
                    }
                    if(order.goodsList[0].number > goods.model[i].guigeNumber){
                        reply({"message":"抱歉"+goods.name+"太受欢迎了，库存不足，请修改该买数量。","statusCode":102,"status":false});
                        return;
                    }
                }
            }
        }
    }else{
        reply({"message":"抱歉"+goods.name+"已下架，请选择其他商品进行购买！","statusCode":102,"status":false});
        return;
    }

    const now = new Date().getTime();
    var ifEckill = false;
    //判断是否是限时特卖产品。
    if(goods.eckill){
        if(order.goodsList[0].number>goods.eckill.limit){
            reply({"message":"抱歉"+order.goodsList[0].goods.name+"是秒杀商品，每人限购"+goods.eckill.limit+"件。","statusCode":102,"status":false});
            return;
        }

        if(goods.eckill.startTime<now&&goods.eckill.endTime>now){
            //获取某人订单为
            const orderList = await dao.findCount(request,"order",{eckill:1,goodsList:{$elemMatch:{id:order.goodsList[0].goods._id+""}},orderNumber:{$gt:goods.eckill.startTime+"",$lt:goods.eckill.endTime+""}});
            if(orderList<goods.eckill.limit){
                ifEckill=true;
                order.eckill = 1;
            }else{
                reply({"message":"抱歉"+order.goodsList[0].goods.name+"是秒杀商品，每人限购"+goods.eckill.limit+"件。","statusCode":102,"status":false});
                return;
            }
        }else if(goods.eckill.endTime<now){
            db.collection("goods").updateOne({"_id":new ObjectID(order.goodsList[0].goods._id)},{$unset:{eckill:1}});
        }
    }
    //判断是否是活动产品，如果不是判断是否有规格等信息，如果没有价格按照产品价格计算。
    var price = 0;
    if(ifEckill){
        price = goods.eckill.price
    }else if(order.goodsList[0].type){
        for(let i=0;i<goods.model.length;i++){
            if(order.goodsList[0].type==goods.model[i].guigeText){
                price = goods.model[i].guigePrice;
                break;
            }
        }
    }else{
        price = goods.price
    }
    /*
    var merchatOrderItem ={
        "goods":[{"id":order.goodsList[0].goods._id,"name":goods.name, "price":price,"cover":goods.cover,"guigeText":order.goodsList[0].type,"state":1,"number":order.goodsList[0].number,"total": order.paid}],
        "total": order.paid
    };
    */

    var orderItems = [{"id":goods._id,"name":goods.name,
        "price":price,"cover":goods.cover,"guigeText":order.goodsList[0].type,"state":1,"number":order.goodsList[0].number}];
    order.goodsList = orderItems;

    var amount = (orderItems[0].price * 100 * orderItems[0].number)/100;

    if(amount != order.paid){
        reply({"message":"添加订单失败,计算金额有误。","statusCode":102,"status":false});
        return;
    }

    order["orderNumber"] = new Date().getTime()+"";
    order["createTime"] = new Date().getTime();
    order["orderMain"] = 1;  //1 表示主订单及用户自己的订单
    var result = await dao.save(request,"order",order)


    /*
    var orderDataItem = Object.assign({},order, merchatOrderItem);
    orderDataItem["orderNumber"] = new Date().getTime()+"";
    orderDataItem["userId"] = order.userId;
    orderDataItem["createTime"] = new Date().getTime();
    orderDataItem["orderMain"] = 0;  //0 表示商户订单
    orderDataItem["mainOrderId"] =  orderDataItem._id+"";
    delete orderDataItem.goodsList;
    delete orderDataItem._id;
    await dao.save(request,"order",orderDataItem);
    */

    if(result==null){
        reply({"message":"添加订单失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加订单成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//删除订单
exports.delOrder = async function(request,reply){
    var result = await dao.del(request,"order",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除订单失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除订单成功","statusCode":103,"status":true});
    }
}

//更新订单
exports.updateOrder = async function(request,reply){

    var result = await dao.updateOne(request,"order",{"_id":request.params.id},request.payload);

    if(result==null){
        reply({"message":"更新订单失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新订单成功","statusCode":105,"status":true});
    }
}

//用户更新订单状态
exports.userUpdateOrder = async function(request,reply){
    if(request.payload.state<4 || request.payload.state>5){
        reply({"message":"更新订单状态失败","statusCode":106,"status":false});
        return;
    }
    var result = await dao.updateOne(request,"order",{"_id":request.params.id},request.payload);
    if(result==null){
        reply({"message":"更新订单失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新订单成功","statusCode":105,"status":true});
    }
}

//获取某个订单
exports.getOrder =async function(request,reply){
    // var db = request.server.plugins['hapi-mongodb'].db;
    // var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    // db.collection('order').findOne({"_id":new ObjectID(request.params.id)},{"password":0},function(err,result){
    //     if(err){
    //         request.server.log(['error'],err);
    //         throw err;
    //         reply({"message":"查找订单失败","statusCode":108,"status":false});
    //     }else{
    //         reply({"message":"查找订单成功","statusCode":107,"status":true,"resource":result});
    //     }
    // });
    var findResult = await dao.findById(request, "order", request.params.id);
    if(findResult == null){
        reply({ "message": "查找订单失败", "statusCode": 108, "status": false });
    }else{
        reply({ "message": "查找订单成功", "statusCode": 107, "status": true, "resource": findResult });
    }
}

//获取所有订单
exports.getOrderList = async function(request,reply){
    //列表
    var data = await dao.find(request,"order",{},{},{orderNumber:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"order",{});

    if(data == null){
        reply({"message":"查找订单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找订单列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

exports.getMerchatOrderList = async function(request, reply){

    //列表
    var data = await dao.find(request,"order",{merchatId:request.auth.credentials._id+""},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"order",{merchatId:request.auth.credentials._id+""});

    if(data == null){
        reply({"message":"查找商户订单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找商户订单列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取某个用户的所有订单
exports.getUserOrderList = async function(request,reply){

    //列表
    var data = await dao.find(request,"order",{userId:request.auth.credentials._id+"","orderMain":1},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"order",{userId:request.auth.credentials._id+"","orderMain":1});

    if(data == null){
        reply({"message":"查找订单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找订单列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取某个用户某些状态的订单
exports.getUserStateOrderList = async function(request,reply){

    //列表
    var data = await dao.find(request,"order",{userId:request.auth.credentials._id+"","orderMain":1,state:parseInt(request.params.state)},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"order",{userId:request.auth.credentials._id+"","orderMain":1,state:parseInt(request.params.state)});

    if(data == null){
        reply({"message":"查找订单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找订单列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//支付前判断是否可以正常支付。
exports.getIfpay = async function(request,reply){
    var order = await dao.findById(request,"order",request.params.id);
    for(let i=0;i<order.goodsList.length;i++){
        var goods = await dao.findById(request,"goods",order.goodsList[i].id);
        if(goods.state==0){
            reply({"message":goods.name+"商品已下架，请您重新下单。","status":false});
            dao.del(request,"order",{"_id":request.params.id});
            return;
        }
        if(goods.stock<order.goodsList[i].number){
            reply({"message":goods.name+"库存不足，请您重新下单。","status":false});
            dao.del(request,"order",{"_id":request.params.id});
            return;
        }
    }
    reply({"message":"订单有效。","status":true});
}

