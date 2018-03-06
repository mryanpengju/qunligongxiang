/**
 * 订单路由管理
 * Created by shichenda on 2016/5/17.
 */

const Joi = require('joi');
const orderService = require('../service/orderService');

module.exports = [

    //获取所有订单列表
    {
        method:'GET',
        path:'/order/list/{page}/{size}',
        handler:orderService.getOrderList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"] //or ["order",admin]
            },
            description: '获取订单列表',
            notes: '获取订单资源列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取某商户所有订单列表
    {
        method:'GET',
        path:'/merchat/order/list/{page}/{size}',
        handler:orderService.getMerchatOrderList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["MERCHANT"] //or ["order",admin]
            },
            description: '获取订单列表',
            notes: '获取订单资源列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取某个用户的所有订单
    {
        method:'GET',
        path:'/order/list/user/{page}/{size}',
        handler:orderService.getUserOrderList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"] //or ["order",admin]
            },
            description: '获取某个用户的所有订单',
            notes: '获取某个用户的所有订单',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取某个用户某些状态的订单
    {
        method:'GET',
        path:'/order/list/user/state/{state}/{page}/{size}',
        handler:orderService.getUserStateOrderList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"] //or ["order",admin]
            },
            description: '获取某个用户某些状态的订单',
            notes: '获取某个用户某些状态的订单',
            tags: ['api'],
            validate: {
                params:{
                    state : Joi.string().default(1).description("订单状态"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //添加订单
    {
        method:'POST',
        path:'/order',
        handler:orderService.addOrder,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ORDER_ADD_EDIT","USER"]
            },
            description: '添加订单',
            notes: '添加订单',
            tags: ['api'],
            validate: {
                payload: {
                    goodsList:Joi.array().required().description('商品列表'),
                    state:Joi.number().default(1).description("订单状态1 未付款，2（已付款，未发货），3（已发货），4 已收货，5 完成，6 关闭交易"),
                    userId:Joi.string().required().description("下单人id"),
                    userName:Joi.string().description("收件人姓名"),
                    address:Joi.object().required().description("收件人地址"),
                    userTelephone:Joi.string().required().description("收件人手机号码"),
                    payable:Joi.number().description("订单应付总额"),
                    paid:Joi.number().description("实际付款"),
                    paymentWay:Joi.number().default(1).description("支付方式  1微信 2支付宝 3余额支付"),
                    shipping:Joi.number().default(1).description("配送方式 1 送货上门 2进店自提"),
                    message:Joi.string().description("买家留言"),
                    deliveryTime:Joi.string().description("配送时间"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //直接/快速购买
    {
        method:'POST',
        path:'/order/direct',
        handler:orderService.addOneOrder,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ORDER_ADD_EDIT","USER"]
            },
            description: '直接/快速购买',
            notes: '直接/快速购买',
            tags: ['api'],
            validate: {
                payload: {
                    goodsList:Joi.array().required().description('商品列表'),
                    state:Joi.number().default(1).description("订单状态1 未付款，2（已付款，未发货），3（已发货），4 已收货，5 完成，6 关闭交易"),
                    userId:Joi.string().required().description("下单人id"),
                    userName:Joi.string().description("收件人姓名"),
                    address:Joi.object().required().description("收件人地址"),
                    userTelephone:Joi.string().required().description("收件人手机号码"),
                    payable:Joi.number().description("订单应付总额"),
                    paid:Joi.number().description("实际付款"),
                    message:Joi.string().description("买家留言"),
                    paymentWay:Joi.number().default(1).description("支付方式  1 微信 2 货到付款"),
                    shipping:Joi.number().default(1).description("配送方式 1 送货上门 2 进店自提"),
                    deliveryTime:Joi.string().description("配送时间"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    

    //删除某个订单
    {
        method:'DELETE',
        path:'/order/{id}',
        handler:orderService.delOrder,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ORDER_DELETE","USER"]
            },
            description: '删除订单',
            notes: '删除订单',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('订单id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //更新某个订单
    {
        method:'PUT',
        path:'/order/{id}',
        handler:orderService.updateOrder,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ORDER_ADD_EDIT"
            },
            description: '更新订单',
            notes: '更新订单',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('订单id')
                },
                payload: {
                    state:Joi.number().default(1).description("订单状态1 未付款，2（已付款，未发货），3（已发货），4 已收货，5 完成，6 关闭交易"),
                    userName:Joi.string().description("收件人姓名"),
                    address:Joi.string().description("收件人地址"),
                    userTelephone:Joi.string().description("收件人手机号码"),
                    payable:Joi.number().description("订单应付总额"),
                    paid:Joi.number().description("实际付款"),
                    message:Joi.string().description("买家留言"),
                    paymentWay:Joi.number().default(1).description("支付方式  1 微信 2 货到付款"),
                    shipping:Joi.number().default(1).description("配送方式 1 送货上门 2 进店自提"),
                    deliveryTime:Joi.string().description("配送时间"),
                    type:Joi.string().description("类型如颜色，尺码等。"),
                    express: Joi.string().description("快递公司"),
                    expressNumber: Joi.string().description("快递订单号"),

                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //更新订单的快递信息
    {
        method:'PUT',
        path:'/order/courier/{id}',
        handler:orderService.updateOrder,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ORDER_ADD_EDIT"
            },
            description: '更新订单',
            notes: '更新订单',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('订单id')
                },
                payload: {
                    state:Joi.number().default(1).description("订单状态1 未付款，2（已付款，未发货），3（已发货），4 已收货，5 完成，6 关闭交易"),
                    express: Joi.string().description("快递公司"),
                    expressNumber: Joi.string().description("快递订单号"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        } 
    },

    //更新订单的状态
    {
        method:'PUT',
        path:'/order/user/update/{id}',
        handler:orderService.userUpdateOrder,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "USER"
            },
            description: '用户更新订单状态',
            notes: '用户更新订单状态',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('订单id')
                },
                payload: {
                    state:Joi.number().default(1).description("订单状态4 已收货，5 完成，6 关闭交易"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取是否可以支付判断
    {
        method:'GET',
        path:'/order/ifpay/{id}',
        handler:orderService.getIfpay,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '获取是否可以支付判断',
            notes: '获取是否可以支付判断',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('订单id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },


    //获取某个订单
    //{
    //    method:'GET',
    //    path:'/order/{id}',
    //    handler:orderService.getOrder,
    //    config:{
    //        auth:false
    //    }
    //},
]