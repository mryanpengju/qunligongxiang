/**
 * 系统公告路由
 * Created by chenda on 2017/3/9.
 */

const Joi = require('joi');
const systemSmgService = require('../service/systemSmgService');

module.exports = [
    //获取最新的系统公告
    {
        method:'GET',
        path:'/systemSmg/news',
        handler:systemSmgService.getSystemSmgNews,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER", "ADMIN"]
            },
            description: '获取最新的系统公告',
            notes: '获取最新系统公告',
            tags: ['api'],
            validate: {
                params:{
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //获取系统公告列表
    {
        method:'GET',
        path:'/systemSmg/all/{page}/{size}',
        handler:systemSmgService.getSystemSmgList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER", "ADMIN"]
            },
            description: '获取所有系统公告列表',
            notes: '获取所有系统公告列表',
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

    //查找某个系统公告
    {
        method:'POST',
        path:'/systemSmg/search/{page}/{size}',
        handler:systemSmgService.adminSearchSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '添加系统公告',
            notes: '添加系统公告',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().required().description("公告标题"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //获取某个系统公告
    {
        method:'GET',
        path:'/systemSmg/{id}',
        handler:systemSmgService.getSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER", "ADMIN"]
            },
            description: '获取某个系统公告',
            notes: '获取某个系统公告',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('系统公告 id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },


    //添加系统公告
    {
        method:'POST',
        path:'/systemSmg',
        handler:systemSmgService.addSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '添加系统公告',
            notes: '添加系统公告',
            tags: ['api'],
            validate: {
                payload: {
                    title:Joi.string().required().description("公告标题"),
                    content:Joi.string().required().description("公告内容"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //删除某个系统公告
    {
        method:'DELETE',
        path:'/systemSmg/{id}',
        handler:systemSmgService.delSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '删除某个系统公告',
            notes: '删除某个系统公告',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('系统公告 id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //修改系统公告
    {
        method:'PUT',
        path:'/systemSmg/{id}',
        handler:systemSmgService.updateSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '修改系统公告',
            notes: '修改系统公告',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('系统公告id')
                },
                payload: {
                    title: Joi.string().required().description('标题'),
                    content:Joi.string().required().description('内容')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

/***************       站内信         ******************************/
 
    //添加站内信
    {
        method:'POST',
        path:'/systemSmg/internal',
        handler:systemSmgService.addSystemSmgInternal,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '添加站内信',
            notes: '添加站内信',
            tags: ['api'],
            validate: {
                payload: {
                    title:Joi.string().required().description("站内信标题"),
                    content:Joi.string().required().description("站内信内容"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //获取站内信列表
    {
        method:'GET',
        path:'/systemSmg/internal/list/{page}/{size}',
        handler:systemSmgService.getSystemSmgInternalList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER", "ADMIN"]
            },
            description: '获取站内信列表',
            notes: '获取站内信列表',
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

    //修改站内信
    {
        method:'PUT',
        path:'/systemSmg/internal/{id}',
        handler:systemSmgService.updateInternalSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '修改站内信',
            notes: '修改站内信',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('修改站内信id')
                },
                payload: {
                    title: Joi.string().required().description('标题'),
                    content:Joi.string().required().description('内容')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //删除某个站内信
    {
        method:'DELETE',
        path:'/systemSmg/internal/{id}',
        handler:systemSmgService.delInternalSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '删除某个站内信',
            notes: '删除某个站内信',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('站内信 id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取某个站内信
    {
        method:'GET',
        path:'/systemSmg/internal/{id}',
        handler:systemSmgService.getInternalSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER", "SERVER_PEOPLE", "MERCHANT", "SERVER_CENTER", "ADMIN"]
            },
            description: '获取某个系统公告',
            notes: '获取某个系统公告',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('系统公告 id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //查找站内信
    {
        method:'POST',
        path:'/systemSmg/search/internal/{page}/{size}',
        handler:systemSmgService.adminSearchInternalSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '查找某个站内信',
            notes: '查找某个站内信',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().required().description("站内信"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

]
