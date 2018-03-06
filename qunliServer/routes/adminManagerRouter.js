//后台管理

const Joi = require('joi');
const adminManagerServer = require('../service/adminManagerServer');

module.exports = [
	//管理员登录
    {
          method:'GET',
          path:'/admin/new/login',
          handler:adminManagerServer.Login,
          config:{
              //拦截器
              auth: {
                  strategy: 'bearer',
                  scope: 'ADMIN'
              },
              description: '管理员登陆接口',
              notes: '管理员登陆接口',
              tags: ['api'],
              validate: {
                  headers: Joi.object({
                      'authorization': Joi.string().required().description('需要加token请求头')
                  }).unknown()
              }
          }
    },
	//搜索商户  根据商户名称
    {
        method:'POST',
        path:'/admin/user/list/{page}/{size}',
        handler:adminManagerServer.adminUserListAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '后台管理获取用户列表',
            notes: '后台管理获取用户列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().description('条件'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 后台 获取用户列表
    {
        method:'GET',
        path:'/user/list/{page}/{size}',
        handler:adminManagerServer.getUserList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"] //or ["user",admin]
            },
            description: '获取用户列表',
            notes: '获取用户资源列表',
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

    // 后台查找某个用户
    {
        method:'GET',
        path:'/user/admin/finduser/{id}',
        handler:adminManagerServer.getUserInfoToAdmin,
        config:{
          auth:{
              strategy: 'bearer',
              scope: ["ADMIN"]
          },
            description: '获取用户信息',
            notes: '获取用户信息',
            tags: ['api'],
            validate: {
                params:{
                    id : Joi.string().required().description("ID"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //后台更新用户信息
    {
       method:'POST',
        path:'/user/admin/update/{id}',
        handler:adminManagerServer.adminUpdateUserInfo,
        config:{
          auth:{
              strategy: 'bearer',
              scope: ["ADMIN"]
          },
            description: '后台更新用户信息',
            notes: '后台更新用户信息',
            tags: ['api'],
            validate: {
                params:{
                    id : Joi.string().required().description("用户ID"),
                },
                payload:{
                    username: Joi.string().required().description("账号"),
                    name: Joi.string().required().description("昵称"),
                    mobile: Joi.string().required().description("电话号"),
                    pay_password: Joi.string().required().description("支付密码"),
                    password: Joi.string().required().description("密码"),
                    state: Joi.number().required().description("用户是否冻结 1为正常 0为冻结"),
                    userType: Joi.number().required().description("更新的用户类型 类型"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        } 
    },

    // 后台充值
    {
        method:'POST',
        path:'/statistics/adminPay/{id}',
        handler: adminManagerServer.adminChongZhiAct,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员充值福星等',
            notes: '管理员充值福星等',
            tags: ['api'],
            validate: {
                params:{
                    id: Joi.string().required().description("用户ID"),
                },
                payload: {
                    sumFudai: Joi.number().default(0).description('充值的待激活福袋'),
                    dfuxing: Joi.number().default(0).description('充值的待激活福星'),
                    userType: Joi.number().required().description('用户的角色 1会员 2商户 3服务商 4服务中心'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 后台充值记录
    {
        method:'POST',
        path:'/admin/chongzhi/list/search/{page}/{size}',
        handler: adminManagerServer.adminChongZhiListAct,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ['ADMIN',"CAIWU"]
            },
            description: '管理员充值福星列表',
            notes: '管理员充值福星列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().description('条件'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 后台 获取所有商户列表
    {
        method:'GET',
        path:'/admin/mechant/list/{page}/{size}',
        handler:adminManagerServer.getAllMerchantListAct,
        config:{
          auth:{
              strategy: 'bearer',
              scope: ["ADMIN"]
          },
            description: '获取所有商户列表',
            notes: '获取所有商户列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    // 后台 获取所有服务商列表
    {
        method:'GET',
        path:'/admin/serverPeople/list/{page}/{size}',
        handler:adminManagerServer.getAllServerPeopleListAct,
        config:{
          auth:{
              strategy: 'bearer',
              scope: ["ADMIN"]
          },
            description: '获取所有服务商列表',
            notes: '获取所有服务商列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    // 后台 获取所有服务中心列表
    {
        method:'GET',
        path:'/admin/serverCenter/list/{page}/{size}',
        handler:adminManagerServer.getAllServerCenterListAct,
        config:{
          auth:{
              strategy: 'bearer',
              scope: ["ADMIN"]
          },
            description: '获取所有服务中心列表',
            notes: '获取所有服务中心列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    // 后台 获取用户
    {
        method:'POST',
        path:'/user/search/{page}/{size}',
        handler:adminManagerServer.searchUserItemAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN"
            },
            description: '搜索用户',
            notes: '搜索用户',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload:{
                    where: Joi.object().required().description("搜索用户的条件"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

]