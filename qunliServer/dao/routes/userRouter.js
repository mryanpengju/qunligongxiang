const Joi = require('joi');
const userService = require('../service/userService');

module.exports = [
/*******  USER API 用户资源接口  start *******/

    //注册用户
    {
        method:'POST',
        path:'/user',
        handler:userService.addUser,
        config:{
            auth:false,
            description: '注册用户',
            notes: '注册用户',
            tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().required().description('用户账号'),
                    mobile: Joi.string().required().description('用户手机号'),
                    password: Joi.string().required().description('用户密码'),
                    pay_password: Joi.string().required().description('支付密码'),
                    name: Joi.string().required().description('用户姓名'),
                    parentUser: Joi.string().default("").description('推荐人'),
                    type: Joi.number().default(1).description('用户类型 1 消费者，2 商家 3 服务商 4 服务中心'),
                    smsCode: Joi.number().description('短信验证码'),
                    state: Joi.number().default(1).description('用户状态 0冻结，1正常'),
                },
            }
        }
    },

    //用户登录
    {
          method:'GET',
          path:'/user/login/{userType}',
          handler:userService.userLogin,
          config:{
              //拦截器
              auth: {
                  strategy: 'bearer',
                  scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
              },
              description: '用户登陆接口',
              notes: '用户登陆接口',
              tags: ['api'],
              validate: {
                    params:{
                        userType : Joi.string().required().description("用户类型 1用户 2商户 3服务商 4服务中心"),
                    },
                    headers: Joi.object({
                        'authorization': Joi.string().required().description('需要加token请求头')
                    }).unknown()
              }
          }
    },

    //更新用户信息
    {
        method:'PUT',
        path:'/user/update/info/{userType}',
        handler:userService.updateUserInfoAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '修改用户信息',
            notes: '修改用户信息',
            tags: ['api'],
            validate: {
                params:{
                    userType: Joi.number().required().description("用户类型"),
                },
                payload: {
                    name: Joi.string().description('用户姓名'),
                    mobile: Joi.string().description('手机号'),
                    idCard: Joi.string().description('身份证号'),
                    smsCode: Joi.number().description('短信验证码'),
                    password: Joi.string().description('用户密码'),
                    pay_password: Joi.string().description('支付密码'),
                    smsCode: Joi.number().description('短信验证码'), 
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //更新某个用户的密码(修改密码)
    {
        method:'POST',
        path:'/user/repasd',
        handler:userService.updateUserPasd,
        config:{
            auth:false,
            description: '修改用户密码',
            notes: '修改用户密码',
            tags: ['api'],
            validate: {
                payload: {
                    userType: Joi.number().required().description('用户类型'),
                    password: Joi.string().required().description('新密码'),
                    mobile: Joi.string().required().description("电话号码"),
                    code: Joi.number().required().description("验证码"),
                }
            }
        }
    },

    // 申请成为 商家 2 商家 3 服务商 4 服务中心 (需要审核)
    {
        method:'POST',
        path:'/user/role',
        handler:userService.addUserWithRoleAct,
        config:{
            auth:false,
            description: '注册2 商家 3 服务商 4 服务中心',
            notes: '注册2 商家 3 服务商 4 服务中心',
            tags: ['api'],
            validate: {
                payload: {
                    parentUser: Joi.string().description("推荐人的编号"),
                    mobile: Joi.string().required().description('用户手机号'),
                    password: Joi.string().required().description('用户密码'),
                    pay_password: Joi.string().required().description('支付密码'),
                    name: Joi.string().required().description('用户昵称'),
                    state: Joi.number().default(1).description('用户状态 0冻结，1正常'),
                    merchant_name: Joi.string().description("商户名称"),
                    merchant_leader: Joi.string().description("负责人姓名"),
                    type: Joi.number().default(1).description('2 商家 3 服务商 4 服务中心'),
                    merchant_idCard: Joi.string().description("身份证号码"),
                    /*merchant_bankCard: Joi.string().description("银行卡号"),
                    merchant_bankType: Joi.string().description("所属银行"),
                    merchant_bankName: Joi.string().description("开户行"),*/
                    merchant_area: Joi.any().default("").description('地区'),
                    merchant_city: Joi.string().default("").required().description('城市'),
                    merchant_province: Joi.string().default("").required().description('省份'),
                    merchant_address: Joi.string().required().description('详细地址'),
                    merchant_tell: Joi.string().description('座机号'),
                    merchant_description: Joi.string().required().description('描述'),
                    businessType: Joi.string().required().description('经营类型'),
                    transferModel: Joi.number().description('让利模式 1 24%  目前只有一种'),
                    //code: Joi.number().required().description('短信验证码'),
                    idCord_zm: Joi.string().required().description("法人身份证正面"),
                    idCord_fm: Joi.string().required().description("法人身份证反面"),
                    businessLicense: Joi.string().required().description("营业执照"),
                    logoImg: Joi.string().required().description("店铺封面照"),
                    promiss: Joi.string().required().description("商家承诺书"),
                    smsCode: Joi.number().description('短信验证码'),
                },
            }
        }
    },

    // 用户添加 转账 
    {
        method:'POST',
        path:'/user/giveAway/fusion',
        handler:userService.addGiveAwayAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '用户添加转账',
            notes: '用户添加转账',
            tags: ['api'],
            validate: {
                payload: {
                    roleType: Joi.number().required('转增人的身份 1普通用户 2商户 3服务商 4服务中心'),
                    type: Joi.number().required().description('转增类型 1普通福星 2代缴税福星 3冻结福星 4福袋'),
                    number: Joi.number().required().description('转增数量'),
                    getUser: Joi.string().required().description('获赠人ID'),
                    pay_password: Joi.string().required().description('支付密码'),
                    mobile: Joi.string().required().description('用户手机号'),
                    smsCode: Joi.number().description('短信验证码'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 某用户的转增记录
    {
        method:'GET',
        path:'/user/giveAway/list/{userType}/{page}/{size}',
        handler:userService.addGiveAwayListAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER","MERCHANT","SERVER_PEOPLE","SERVER_CENTER"] //or ["user",admin]
            },
            description: '获取某用户的转账列表',
            notes: '获取某用户的转账列表',
            tags: ['api'],
            validate: {
                params:{
                    userType : Joi.string().required().description("用户类型 1用户 2商户 3服务商 4服务中心"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 用户添加银行卡
    {
        method:'POST',
        path:'/user/add/bankcard',
        handler:userService.userAddBankCardAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '用户添加银行卡',
            notes: '用户添加银行卡',
            tags: ['api'],
            validate: {
                payload: {
                    bankCardNumber: Joi.string().required().description("银行卡卡号"),
                    bankCardName: Joi.string().required().description("所属银行"),
                    bankSubBranch: Joi.string().required().description("支行"),
                    bankUserName: Joi.string().required().description("开户人姓名"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 用户删除银行卡
    {
        method:'DELETE',
        path:'/user/delete/bankcard/{id}',
        handler:userService.userDelBankCardAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '用户删除银行卡',
            notes: '用户删除银行卡',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('银行卡id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 某用户的银行卡列表
    {
        method:'GET',
        path:'/user/bankcard/list',
        handler:userService.addBankcardListAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER","MERCHANT","SERVER_PEOPLE","SERVER_CENTER"] //or ["user",admin]
            },
            description: '某用户的银行卡列表',
            notes: '某用户的银行卡列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 用户添加回购  (提现申请)
    {
        method:'POST',
        path:'/user/apply/withdrawals',
        handler:userService.userApplyWithdrawals,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER","MERCHANT","SERVER_PEOPLE","SERVER_CENTER"]
            },
            description: '用户添加回购  (提现申请)',
            notes: '用户添加回购  (提现申请)',
            tags: ['api'],
            validate: {
                payload: {
                    roleType : Joi.number().required().description("用户类型 1用户 2商户 3服务商 4服务中心"),
                    bankCardNumber: Joi.string().description("银行卡卡号"),
                    bankCardName: Joi.string().description("所属银行"),
                    bankCardId: Joi.string().required().description("银行卡Id"),
                    applyType: Joi.number().required().description('回购类型 1普通福星 2代缴税福星'),
                    applyGold: Joi.number().required().description('回购金额'),
                    pay_password: Joi.string().required().description('支付密码'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 后台 获取所有用户的回购记录
    {
       method:'POST',
        path:'/apply/withdrawals/list/{page}/{size}',
        handler:userService.adminWithdrawalsList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","CAIWU"] //or ["user",admin]
            },
            description: '获取所有用户的回购记录',
            notes: '获取所有用户的回购记录',
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

    //后台 更新回购记录的状态
    {
        method:'PUT',
        path:'/apply/cashWithdrawal/update',
        handler:userService.adminUpdateWithdrawalsStateAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","CAIWU"]
            },
            description: '更新用户的回购申请',
            notes: '更新用户的回购申请',
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

    //用户的回购记录
    {
       method:'GET',
        path:'/user/Withdrawals/list/{userType}/{state}/{page}/{size}',
        handler:userService.userWithdrawalsList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER","MERCHANT","SERVER_PEOPLE","SERVER_CENTER"] //or ["user",admin]
            },
            description: '获取某用户的回购记录',
            notes: '获取某用户的回购记录',
            tags: ['api'],
            validate: {
                params:{
                    userType : Joi.string().required().description("用户类型 1用户 2商户 3服务商 4服务中心"),
                    state: Joi.string().default("1").description('回购的状态 1等待审核 2审核通过 3审核驳回'),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        } 
    },

    // 前台 推荐用户注册（商户和服务商）
    {
        method:'POST',
        path:'/user/recommend/more',
        handler:userService.addUserRecommenMoredAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER","MERCHANT","SERVER_PEOPLE","SERVER_CENTER"] //or ["user",admin]
            },
            description: '用户推荐注册(商户和服务商)',
            notes: '用户推荐注册',
            tags: ['api'],
            validate: {
                payload: {
                    parentUser: Joi.string().description("推荐人的编号"),
                    username: Joi.string().required().description('用户账号'),
                    mobile: Joi.string().required().description('用户手机号'),
                    password: Joi.string().required().description('用户密码'),
                    pay_password: Joi.string().required().description('支付密码'),
                    name: Joi.string().required().description('用户姓名'),
                    type: Joi.number().default(2).description('用户类型 2商户 3服务商'),
                    state: Joi.number().default(1).description('用户状态 0冻结，1正常'),

                    merchant_name: Joi.string().description("商户名称"),
                    merchant_leader: Joi.string().description("负责人姓名"),
                    type: Joi.number().default(1).description('2 商家 3 服务商 4 服务中心'),
                    merchant_idCard: Joi.string().description("身份证号码"),
                    merchant_bankCard: Joi.string().description("银行卡号"),
                    merchant_bankType: Joi.string().description("所属银行"),
                    merchant_bankName: Joi.string().description("开户行"),
                    merchant_area: Joi.any().default("").description('地区'),
                    merchant_city: Joi.string().default("").required().description('城市'),
                    merchant_province: Joi.string().default("").required().description('省份'),
                    merchant_address: Joi.string().required().description('详细地址'),
                    merchant_tell: Joi.string().required().description('联系方式'),
                    merchant_description: Joi.string().required().description('描述'),
                    businessType: Joi.string().required().description('经营类型'),
                    transferModel: Joi.number().required().description('让利模式 1 24%  目前只有一种'),
                    //code: Joi.number().required().description('短信验证码'),
                    idCord_zm: Joi.string().required().description("法人身份证正面"),
                    idCord_fm: Joi.string().required().description("法人身份证反面"),
                    businessLicense: Joi.string().required().description("营业执照"),
                    logoImg: Joi.string().required().description("店铺封面照"),
                    promiss: Joi.string().required().description("商家承诺书"),
                    smsCode: Joi.number().description('短信验证码'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 前台 推荐用户注册（用户）
    {
        method:'POST',
        path:'/user/recommend/user',
        handler:userService.addUserRecommendUserAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER","MERCHANT","SERVER_PEOPLE","SERVER_CENTER"] //or ["user",admin]
            },
            description: '用户推荐注册(商户和服务商)',
            notes: '用户推荐注册',
            tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().required().description('用户账号'),
                    mobile: Joi.string().required().description('用户手机号'),
                    password: Joi.string().required().description('用户密码'),
                    pay_password: Joi.string().required().description('支付密码'),
                    name: Joi.string().required().description('用户姓名'),
                    parentUser: Joi.string().required().description('推荐人的编号'),
                    type: Joi.number().default(1).description('用户类型 1'),
                    smsCode: Joi.number().description('短信验证码'),
                    state: Joi.number().default(1).description('用户状态 0冻结，1正常'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 更新用户的收货地址
    {
        method: 'PUT',
        path: '/user/address/List/{id}',
        handler:userService.updateUserAddressListAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"] //or ["user",admin]
            },
            description: '更新用户的收货地址',
            notes: '更新用户的收货地址',
            tags: ['api'],
            validate: {
                params:{
                    id: Joi.string().required().description('用户的ID'),
                },
                payload: {
                    address:Joi.array().description("用户地址列表"),
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
        path:'/user/recommend/record/{userType}/{page}/{size}',
        //异步控制方法
        handler: userService.getUserRecommendList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER","MERCHANT","SERVER_PEOPLE","SERVER_CENTER"]
            },
            description: '获取用户推荐记录',
            notes: '获取用户推荐记录',
            tags: ['api'],
            validate: {
                params:{
                    userType : Joi.string().required().description("用户类型 1用户 2商户 3服务商 4服务中心"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 前台 服务商或者服务中心的推荐商户业绩
    {
        method:'GET',
        path:'/user/merchat/tj/record/{type}/{page}/{size}',
        //异步控制方法
        handler: userService.getMerchantTJYeJiRecordList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER","MERCHANT","SERVER_PEOPLE","SERVER_CENTER"]
            },
            description: '获取服务商或者服务中心的推荐商户业绩',
            notes: '获取服务商或者服务中心的推荐商户业绩',
            tags: ['api'],
            validate: {
                params:{
                    type : Joi.string().required().description("用户类型 3服务商 4服务中心"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 前台 服务商或者服务中心的推荐消费者业绩
    {
        method:'GET',
        path:'/user/user/tj/record/{type}/{page}/{size}',
        //异步控制方法
        handler: userService.getUserTJYeJiRecordList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER","MERCHANT","SERVER_PEOPLE","SERVER_CENTER"]
            },
            description: '获取服务商或者服务中心的推荐消费者业绩',
            notes: '获取服务商或者服务中心的推荐消费者业绩',
            tags: ['api'],
            validate: {
                params:{
                    type : Joi.string().required().description("用户类型 3服务商 4服务中心"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },



    //用户申请成为商家或者成为服务商，市、县服务中心
    {
        method:'POST',
        path:'/user/apply',
        handler:userService.userApply,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '添加用户',
            notes: '添加用户',
            tags: ['api'],
            validate: {
                payload: {
                    type: Joi.number().default(1).description('用户类型 2 商家 3 服务商 4 服务中心'),

                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //实名认证
    {
        method:'POST',
        path:'/user/certification',
        handler:userService.userCertification,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '实名认证',
            notes: '实名认证',
            tags: ['api'],
            validate: {
                payload: {
                    trueName: Joi.string().required().description('真实姓名'),
                    idCard: Joi.string().required().description('身份证号'),
                    mobile: Joi.string().required().description('手机号'),
                    smsCode: Joi.string().required().description('短信验证码'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取平台 今日营业额
    {
        method:'GET',
        path:'/today/achievement',
        //异步控制方法
        handler: userService.todayTotalAchievement,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取平台 金额营业额',
            notes: '获取平台 金额营业额',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取平台 城市历史让利排行
    {
        method:'GET',
        path:'/platform/city/rl',
        //异步控制方法
        handler: userService.cityRLRankingList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取平台 城市历史让利排行',
            notes: '获取平台 城市历史让利排行',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取平台 城市历史消费排行
    {
        method:'GET',
        path:'/platform/city/xf',
        //异步控制方法
        handler: userService.cityXFRankingList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取平台 城市历史消费排行',
            notes: '获取平台 城市历史消费排行',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取平台 城市今日让利排行
    {
        method:'GET',
        path:'/platform/city/today/rl',
        //异步控制方法
        handler: userService.cityTodayRLRankingList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取平台 城市今日让利排行',
            notes: '获取平台 城市今日让利排行',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取平台 城市今日消费排行
    {
        method:'GET',
        path:'/platform/city/today/xf',
        //异步控制方法
        handler: userService.cityTodayXFRankingList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取平台 城市今日消费排行',
            notes: '获取平台 城市今日消费排行',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // 获取平台 平台指数记录
    {
        method:'GET',
        path:'/platform/index/record/list/{page}/{size}',
        //异步控制方法
        handler: userService.platformIndexList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取平台 平台指数记录',
            notes: '获取平台 平台指数记录',
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

    // 获取平台信息 平台统计
    {
        method:'GET',
        path:'/platform/statistics',
        //异步控制方法
        handler: userService.getPlatformStatistics,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER"]
            },
            description: '获取平台统计',
            notes: '获取平台统计',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
 

/*******  USER API 用户资源接口  end *******/

]
