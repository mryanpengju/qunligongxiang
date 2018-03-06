/**
 * 作物种类路由管理
 * Created by chenda on 2016/10/23.
 */
    
const Joi = require('joi');
const statisticsService = require('../service/statisticsService');

module.exports = [
    //获取某个作物种类
    {
        method:'GET',
        path:'/statistics',
        handler:statisticsService.today,
        config:{
             auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: "获取表格数据!",
            notes: '获取表格数据！',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
   
]