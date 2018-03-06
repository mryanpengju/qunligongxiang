/**
 * Created by shichenda on 2016/5/21.
 */

const Joi = require('joi');
const goodsCategoryService = require('../service/goodsCategoryService');

module.exports = [

    //获取所有商品分类列表
    {
        method:'GET',
        path:'/goods/category/list',
        handler:goodsCategoryService.getCategoryList,
        config:{
            auth:false,
            description: '获取商品分类列表',
            notes: '获取商品分类资源列表',
            tags: ['api'],
        }
    },

    // 获取首页4个分类
    {
        method:'GET',
        path:'/goods/category/four/list/{number}',
        handler:goodsCategoryService.getFourCategoryList,
        config:{
            auth:false,
            description: '获取商品分类列表',
            notes: '获取商品分类资源列表',
            tags: ['api'],
            validate: {
                params: {
                    number: Joi.number().required().description('商品分类id')
                },
            }
        }
    },

    //添加商品分类
    {
        method:'POST',
        path:'/goods/category',
        handler:goodsCategoryService.addCategory,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '添加商品分类',
            notes: '添加商品分类',
            tags: ['api'],
            validate: {
                payload: {
                    name: Joi.string().required().description('商品分类名称'),
                    state:Joi.number().default(1).description("商品分类状态0为隐藏，1显示"),
                    parentId:Joi.string().description("父分类id"),
                    icon:Joi.string().description("图标"),
                    describe:Joi.string().description("商品分类描述")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //删除某个商品分类
    {
        method:'DELETE',
        path:'/goods/category/{id}',
        handler:goodsCategoryService.delCategory,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN"
            },
            description: '添加商品分类',
            notes: '添加商品分类',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商品分类id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //更新某个商品分类
    {
        method:'PUT',
        path:'/goods/category/{id}',
        handler:goodsCategoryService.updateCategory,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN"
            },
            description: '添加商品分类',
            notes: '添加商品分类',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商品分类id')
                },
                payload: {
                    name: Joi.string().description('商品分类名称'),
                    state:Joi.number().description("商品分类状态0为隐藏，1显示"),
                    parentId:Joi.string().description("父分类id"),
                    icon:Joi.string().description("封面"),
                    describe:Joi.string().description("商品分类描述")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取某个商品分类
    {
        method: 'GET',
        path: '/goods/category/info/{id}',
        handler:goodsCategoryService.getCategory,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: ['USER','ADMIN']
            },
            description: '查询商品分类接口',
            notes: '查询商品分类接口',
            tags: ['api'],
            validate: {
                params:{
                    id : Joi.string().required().description("分类ID")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

]
