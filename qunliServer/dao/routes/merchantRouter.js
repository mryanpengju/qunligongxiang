const Joi = require('joi');
const roleService = require('../service/roleService');
const merchantService = require('../service/merchantService');
const token = require('../service/validate');

module.exports = [

/* ---- 前台商户信息   start ---- */ 
    // 前台 商户行业分类列表
    {   
        method:'GET',
        path:'/user/merchant/class/list',
        handler:merchantService.merchantTypeListAct,
        config:{
            auth:false,
            description: '前台商户分类列表',
            notes: '前台商户分类列表',
            tags: ['api'],
            validate: {

            }
        }
    }, 

    // 前台商户列表
    {   
        method:'GET',
        path:'/user/merchant/list/{page}/{size}',
        handler:merchantService.merchantListAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '前台商户列表',
            notes: '前台商户列表',
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

    // 前台 根据分类查找商户列表
    {
        method:'GET',
        path:'/user/merchant/class/list/{id}/{page}/{size}',
        handler:merchantService.merchantClassListAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '根据分类查找商户列表',
            notes: '根据分类查找商户列表',
            tags: ['api'],
            validate: {
                params:{
                    id : Joi.string().required().description("商户的分类ID"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 前台 根据所属城市获取商户列表
    {
        method:'POST',
        path:'/merchant/city/list/{page}/{size}',
        handler:merchantService.searchMerchantCityListAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '根据城市搜索商户',
            notes: '根据城市搜索商户',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    keyWords: Joi.string().description('城市名称'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //搜索商户  根据商户名称
    {
        method:'POST',
        path:'/merchant/search/list/{page}/{size}',
        handler:merchantService.searchMerchantListAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '根据名称搜索商户',
            notes: '根据名称搜索商户',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    keyWords: Joi.string().description('商户名称'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 商家报单  会员线下消费  商家对平台报单
    {
        method:'POST',
        path:'/merchant/add/declaration',
        handler:merchantService.merchantAddOrderAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["MERCHANT"]
            },
            description: '商家报单',
            notes: '商家报单',
            tags: ['api'],
            validate: {
                payload: {
                    mobile: Joi.string().required().description("消费者系统ID"),
                    gold_xf: Joi.number().required().description('消费者消费金额'),
                    rebatesRate: Joi.number().required().description('商家让利比例 1，2，4，5....24'),
                    payType: Joi.number().required().description('付款类型 1线下'),
                    voucherImg1: Joi.string().default("").description('凭证1'),
                    voucherImg2: Joi.string().default("").description('凭证2'),
                    pay_password: Joi.string().required().description('商家支付密码'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 前台 商家报单记录
    {   
        method:'GET',
        path:'/merchant/declaration/{state}/{page}/{size}',
        handler:merchantService.merchantDeclarationList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["MERCHANT"] //or ["user",admin]
            },
            description: '获取商户报单列表',
            notes: '获取商户报单列表',
            tags: ['api'],
            validate: {
                params:{
                    state: Joi.string().required().description("订单状态 1待审核  2审核通过 3审核驳回"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    
    //获取商家的信息
    {
        method: 'GET',
        path: '/merchant/info/{id}',
        handler:merchantService.merchantInfo,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '查询商户信息接口',
            notes: '查询商户信息接口',
            tags: ['api'],
            validate: {
                params:{
                    id : Joi.string().required().description("商户ID")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 前台 某用户的推荐记录
    {
        method:'GET',
        path:'/user/distribute/record/{userType}/{page}/{size}',
        //异步控制方法
        handler: merchantService.userDistributeList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取用户或商户的派发推荐记录',
            notes: '获取用户或商户的派发推荐记录',
            tags: ['api'],
            validate: {
                params:{
                    userType : Joi.string().required().description("用户类型 1用户 2商户"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

/* ----  前台商户信息   end  ---- */



//商户登录后台
    {
        method:'GET',
        path:'/merchant/login',
        handler:merchantService.userLogin,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'MERCHANT'
            },
            description: '用户登陆接口',
            notes: '用户登陆接口',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //用户申请成为商户
    {
        method:'PUT',
        path:'/merchant/audit',
        handler:merchantService.addMerchantAudit,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '申请成为商户',
            notes: '申请成为商户',
            tags: ['api'],
            validate: {
                payload: {
                    name: Joi.string().required().description('商户名称'),
                    area: Joi.any().default("").description('地区'),
                    city: Joi.string().default("").required().description('城市'),
                    province: Joi.string().default("").required().description('省份'),
                    address: Joi.string().required().description('商户地址'),
                    describe: Joi.string().required().description('商户描述'),
                    logo: Joi.string().required().description('商户Logo'),
                    merchat_lng: Joi.number().required().description("商户经度"),
                    merchat_lat: Joi.number().required().description("商户维度"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    // 后台 用户申请角色 列表
    {
        method:'POST',
        path:'/merchant/apply/{page}/{size}',
        handler:merchantService.merchantApplyList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","AUDITOR"] //or ["user",admin]
            },
            description: '获取角色申请列表',
            notes: '获取角色申请列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload:{
                    where: Joi.object().required().description("搜索角色申请的条件"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 用户申请成为商户列表
    /*{
        method:'GET',
        path:'/merchant/apply/{page}/{size}',
        handler:merchantService.merchantApplyList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"] //or ["user",admin]
            },
            description: '获取申请商户列表',
            notes: '获取申请商户列表',
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
    },*/



    // 后台 更新商户申请状态
    {
        method:'PUT',
        path:'/apply/merchant/update',
        handler:merchantService.updateApplyMerchantItem,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","AUDITOR"]
            },
            description: '更新申请商户',
            notes: '更新申请商户',
            tags: ['api'],
            validate: {
                payload: {
                    id: Joi.string().required().description('申请ID'),
                    state: Joi.number().required().description('状态'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    // 前台 获取用户的报单列表 （商户给用户报的单子）
    {
        method:'GET',
        path:'/user/merchant/declaration/{state}/{page}/{size}',
        handler:merchantService.userDeclarationList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取用户的报单列表',
            notes: '获取用户的报单列表',
            tags: ['api'],
            validate: {
                params:{
                    state: Joi.string().required().description("订单状态 1待审核 2审核通过 3审核驳回"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 后台 获取商户报单列表
    {
        method:'POST',
        path:'/admin/merchant/declaration/{page}/{size}',
        handler:merchantService.adminDeclarationList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","CAIWU"] //or ["user",admin]
            },
            description: '获取商户报单申请列表',
            notes: '获取商户报单申请列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload:{
                    where: Joi.object().required().description("搜索报单申请的条件"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //更新商户报单状态
    {
        method:'PUT',
        path:'/apply/declaration/update',
        handler:merchantService.updateApplyDeclarationItem,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","CAIWU"]
            },
            description: '更新商户报单的状态',
            notes: '更新商户报单的状态',
            tags: ['api'],
            validate: {
                payload: {
                    id: Joi.string().required().description('申请ID'),
                    state: Joi.number().required().description('状态'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    

    // 商户后台获取商户信息
    {
        method: 'GET',
        path: '/merchant/admin/info',
        handler:merchantService.merchantAdminInfo,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '查询商户信息接口',
            notes: '查询商户信息接口',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取商户商品列表
    {
        method:'GET',
        path:'/merchant/goods/{id}/{page}/{size}',
        handler:merchantService.merchantGoods,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"] //or ["user",admin]
            },
            description: '获取商户商品列表',
            notes: '获取商户商品资源列表',
            tags: ['api'],
            validate: {
                params:{
                    id : Joi.string().required().description("商户ID"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //更新商户资料
    {
        method:'PUT',
        path:'/merchant/info/{id}',
        handler:merchantService.updateMerchantInfo,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '修改商户资料',
            notes: '修改商户资料',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商户id')
                },
                payload: {
                    merchat: Joi.object().description('商户资料信息'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    // 获取某用户的 激活中的福袋 明细
    {
        method: 'GET',
        path: '/user/fudai/detail/{type}/{page}/{size}',
        handler:merchantService.getFudaiList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取某用户的 激活中福袋 明细',
            notes: '获取某用户的 激活中福袋 明细',
            tags: ['api'],
            validate: {
                params: {
                    type: Joi.string().required().description('用户的类型'),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取某用户的 待激活福袋 明细
    {
        method: 'GET',
        path: '/user/sumFudai/detail/{type}/{page}/{size}',
        handler:merchantService.getSumFudaiList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取某用户的 待激活福袋 明细',
            notes: '获取某用户的 待激活福袋 明细',
            tags: ['api'],
            validate: {
                params: {
                    type: Joi.string().required().description('用户的类型'),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取某用户的 普通福星 明细
    {
        method: 'GET',
        path: '/user/fuxing/detail/{type}/{page}/{size}',
        handler:merchantService.getFuxingDetailList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取某用户的 普通福星 明细',
            notes: '获取某用户的 普通福星 明细',
            tags: ['api'],
            validate: {
                params: {
                    type: Joi.string().required().description('用户的类型'),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取某用户的 代缴税福星 明细
    {
        method: 'GET',
        path: '/user/unfuxing/detail/{type}/{page}/{size}',
        handler:merchantService.getUnfuxingDetailList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取某用户的 代缴税福星 明细',
            notes: '获取某用户的 代缴税福星 明细',
            tags: ['api'],
            validate: {
                params: {
                    type: Joi.string().required().description('用户的类型'),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取某用户的 待激活福星 明细
    {
        method: 'GET',
        path: '/user/dfuxing/detail/{type}/{page}/{size}',
        handler:merchantService.getDfuxingDetailList,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取某用户的 待激活福星 明细',
            notes: '获取某用户的 待激活福星 明细',
            tags: ['api'],
            validate: {
                params: {
                    type: Joi.string().required().description('用户的类型'),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
]