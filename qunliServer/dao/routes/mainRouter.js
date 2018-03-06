/**
 * 路由文件
 * Created by chenda on 2016/4/14.
 */
const Joi = require('joi');
const roleService = require('../service/roleService');
const adminService = require('../service/adminService')
const userService = require('../service/userService');
const smsService = require('../service/smsService');
const token = require('../service/validate');

module.exports = [

    //测试接口
    /*{
        method:'post',
        path:'/',
        config:{
            auth:false,
            description: '测试接口',
            notes: '测试接口',
            tags: ['api'],
            handler:function(request,reply){
                console.log(request.payload);
                reply({"ceshi":"访问成功！"});
            }
        }
    },*/

    //token生成器
    {
        method:'POST',
        path:'/get/token',
        config:{
            auth:false,
            handler:token.getToken,
            description: '获取token接口',
            notes: '获取token接口',
            tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().default('admin').description('用户名'),
                    pwd: Joi.string().default('123456').description('密码'),
                    userType: Joi.string().default('1').description('登录用户的类型 1消费者 2商户 3服务商 4服务中心  n后台管理员待定'),
                    url:Joi.string().required().description("要访问的路径"),
                    userORadmin:Joi.string().default('admin').description('管理员还是用户 admin or user')
                }
            }
        }
    },

/**  SMS 短信接口  start **/

    {
        method:'POST',
        path:'/sms/reg',
        config:{
            auth:false,
            handler:smsService.sendRegSMS,
            description: '发送注册验证码',
            notes: '发送注册验证码API',
            tags: ['api'],
            validate: {
                payload: {
                    userType: Joi.number().required().description('用户类型 1消费者 2商户 3服务商 4服务中心'),
                    mobile: Joi.string().required().description('电话号码'),
                }
            }
        }
    },

    {
        method:'POST',
        path:'/sms/edit',
        config:{
            auth:false,
            handler:smsService.sendEditSMS,
            description: '发送修改用户资料验证码',
            notes: '发送修改用户资料验证码API',
            tags: ['api'],
            validate: {
                payload: {
                    userType: Joi.number().required().description('用户类型 1消费者 2商户 3服务商 4服务中心'),
                    mobile: Joi.string().required().description('电话号码'),
                }
            }
        }
    },

    {
        method:'POST',
        path:'/sms/edit/mobile',
        config:{
            auth:false,
            handler:smsService.sendEditMobileSMS,
            description: '发送修改用户手机号',
            notes: '发送修改用户手机号API',
            tags: ['api'],
            validate: {
                payload: {
                    mobile: Joi.string().required().description('电话号码'),
                }
            }
        }
    },
    {
        method:'POST',
        path:'/sms/authUSer',
        config:{
            auth:false,
            handler:smsService.sendAuthenSMS,
            description: '发送验证用户资料验证码',
            notes: '发送验证用户资料验证码API',
            tags: ['api'],
            validate: {
                payload: {
                    mobile: Joi.string().required().description('电话号码'),
                }
            }
        }
    },
    

/**  SMS 短信接口  end **/

/*******  ROLE API 角色资源操作接口  start *******/

    //获取权限组列表
    {
        method:'GET',
        path:'/privilage/group',
        //异步控制方法
        handler: roleService.getPrivilageGroup,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '获取权限组',
            notes: '获取权限组',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取某个角色信息
    {
        method:'GET',
        path:'/role/{roleId}',
        handler: roleService.getRole,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: "获取角色资源",
            notes: '获取角色资源',
            tags: ['api'],
            validate: {
                params:{
                    roleId : Joi.string().required().description("路径参数：角色id，类型：字符串")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取角色列表
    {
        method:'GET',
        path:'/role/list',
        handler: roleService.roleList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '获取角色列表',
            notes: '获取角色资源列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //增加角色
    {
        method:'POST',
        path:'/role',
        handler: roleService.addRole,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '增加角色资源',
            notes: '增加角色资源',
            tags: ['api'],
            validate: {
                payload: {
                    name: Joi.string().required().description('角色名称'),
                    note: Joi.string().description('角色描述'),
                    isShow: Joi.number().default(1).description('是否显示'),
                    level: Joi.number().default(1).description('角色等级'),
                    scope: Joi.array().required().description('权限字符串数组如：["ADMIN_ADD_EDUT","ROLE_MANAGE"]')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //修改角色
    {
        method:'PUT',
        path:'/role/{roleId}',
        handler: roleService.updateRole,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '修改角色资源',
            notes: '修改角色资源',
            tags: ['api'],
            validate: {
                params:{
                    roleId : Joi.string().required().description("路径参数：角色id，类型：字符串")
                },
                payload: {
                    name: Joi.string().description('角色名称'),
                    note: Joi.string().description('角色描述'),
                    level: Joi.number().description('角色级别'),
                    scope: Joi.array().description('权限字符串数组如：["ADMIN_ADD_EDUT","ROLE_MANAGE"]')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //删除角色
    {
        method:'DELETE',
        path:'/role/{roleId}',
        handler: roleService.delRole,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '删除角色资源',
            notes: '删除角色资源',
            tags: ['api'],
            validate: {
                params:{
                    roleId : Joi.string().required().description("路径参数：角色id，类型：字符串")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },


/*******  ROLE API 角色资源操作接口  end *******/


/*******  ADMIN API 管理员资源接口  start *******/
    //管理员登陆接口
    {
        method:'GET',
        path:'/admin/login',
        handler: adminService.Login,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ['ADMIN',"CAIWU","AUDITOR"]
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

    //获取管理员列表
    {
        method:'GET',
        path:'/admin/list',
        handler: adminService.getAdminList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '获取管理员列表',
            notes: '获取管理员资源列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    {
        method:'POST',
        path:'/admin',
        handler: adminService.addAdmin,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN_ADD_EDIT'
            },
            description: '管理员添加',
            notes: '管理员添加接口',
            tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().required().description('管理员账号'),
                    password: Joi.string().required().description('管理员密码'),
                    name: Joi.string().description('真实名称'),
                    state: Joi.number().default(1).description('管理员状态 0冻结 1 正常'),
                    headImg: Joi.string().default("").description('管理员头像'),
                    telephone: Joi.string().description('管理员手机号'),
                    roleId: Joi.string().description('角色id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    {
        method:'PUT',
        path:'/admin/{id}',
        handler: adminService.updateAdmin,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN_ADD_EDIT'
            },
            description: '管理员修改',
            notes: '管理员修改接口',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('管理员id')
                },
                payload: {
                    username: Joi.string().description('管理员账号'),
                    password: Joi.string().description('管理员密码'),
                    name: Joi.string().description('真实名称'),
                    state: Joi.number().description('管理员状态'),
                    headImg: Joi.string().description('管理员头像'),
                    telephone: Joi.string().description('管理员手机号'),
                    roleId: Joi.string().description('角色id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //删除某个管理员
    {
        method:'DELETE',
        path:'/admin/{id}',
        handler:adminService.delAdmin,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN_DELETE"
            },
            description: '添加用户',
            notes: '添加用户',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('用户id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    {
        method:'PUT',
        path:'/admin/users/transfer',
        handler: adminService.userTransfer,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN_ADD_EDIT'
            },
            description: '管理员客户转移',
            notes: '管理员修改接口',
            tags: ['api'],
            validate: {
                payload: {
                    fromId: Joi.string().required().description('客户来源'),
                    toId: Joi.string().required().description('要转移的客户')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // {
    //     method: 'GET',
    //     path: '/user/check/all',
    //     handler: userService.deleteAllUserInfo,
    //     config: {
    //         auth: false,
    //         description: '检查用户信息',
    //         notes: '检查用户信息',
    //         tags: ['api'],
    //         validate: {}
    //     }
    // },
    {
        method:'GET',
        path:'/user/check/all',
        config:{
            auth:false,
            handler:userService.deleteAllUserInfo,
            description: '检查用户信息',
            notes: '检查用户信息',
            tags: ['api'],
            validate: {
            }
        }
    },

/*******  ADMIN API 管理员资资源接口  end *******/

]
