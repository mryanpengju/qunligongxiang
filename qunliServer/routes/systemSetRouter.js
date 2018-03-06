/**
 * 系统设置路由管理
 * Created by chenda on 2016/10/23.
 */

const Joi = require('joi');
const systemSetService = require('../service/systemSetService');

module.exports = [

    //获取系统设置列表
    {
        method:'GET',
        path:'/systemSet/list',
        handler:systemSetService.getSystemSetList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER"]
            },
            description: '获取所有系统设置列表',
            notes: '获取所有系统设置列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //前台 获取系统设置列表
    {
        method:'GET',
        path:'/systemSet/user/list',
        handler:systemSetService.getSystemSetUserList,
        config:{
            auth:false,
            description: '获取所有系统设置列表',
            notes: '获取所有系统设置列表',
            tags: ['api'],
            validate: {
            }
        }
    },

    //添加系统设置
    {
        method:'POST',
        path:'/systemSet',
        handler:systemSetService.addSystemSet,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '添加系统设置',
            notes: '添加系统设置',
            tags: ['api'],
            validate: {
                payload: {
                    userLevel:Joi.object().description("大转盘概率设置"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //更新系统设置
    {
        method:'PUT',
        path:'/systemSet/{id}',
        handler:systemSetService.updateSystemSet,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '修改系统设置',
            notes: '修改系统设置',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('系统设置id')
                },
                payload: {
                    systemSet: Joi.object().description("系统设置"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
]
