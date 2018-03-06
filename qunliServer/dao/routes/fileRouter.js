/**
 * Created by shichenda on 2016/5/17.
 */

const Joi = require('joi');
const fileService = require('../service/fileService');

module.exports = [

    //文件上传
    {
        method:'POST',
        path:'/files',
        handler:fileService.uploadImg,
        config:{
            auth:false,
            description: '获取商品列表',
            notes: '获取商品资源列表',
            tags: ['api'],
            payload:{
                maxBytes:5242880
            }
        }
    },

    {
        method:'GET',
        path:'/upload/img/{path}/{fileName}',
        handler: function (request, reply) {
            let path = __dirname+'/../upload/img/'+request.params.path+'/'+request.params.fileName;
            return reply.file(path);
        }
    },

    {
        method:'POST',
        path:'/file',
        handler:fileService.uploadFile,
        config:{
            auth:false,
            description: '获取商品列表',
            notes: '获取商品资源列表',
            tags: ['api'],
            payload:{
                maxBytes:5242880
            }
        }
    },
    {
        method:'POST',
        path:'/admin/file',
        handler:fileService.uploadFileAdmin,
        config:{
            auth:false,
            description: '获取商品列表',
            notes: '获取商品资源列表',
            tags: ['api'],
            payload:{
                maxBytes:5242880
            }
        }
    },
    {
        method:'POST',
        path:'/file/more',
        handler:fileService.uploadFileTextAndPic,
        config:{
            auth:false,
            description: '获取商品列表',
            notes: '获取商品资源列表',
            tags: ['api'],
            payload:{
                maxBytes:5242880
            }
        }
    },

    // 更新消费者头像
    {
       method:'POST',
        path:'/update/headimg/1',
        handler:fileService.uploadUserHeadImg,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '更新用户头像',
            notes: '更新用户头像',
            tags: ['api'],
            payload:{
                maxBytes:5242880
            },
            validate: {
                  headers: Joi.object({
                      'authorization': Joi.string().required().description('需要加token请求头')
                  }).unknown()
              }
        } 
    },

    // 更新商户头像
    {
       method:'POST',
        path:'/update/headimg/2',
        handler:fileService.uploadMerchatHeadImg,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'MERCHANT'
            },
            description: '更新商户头像',
            notes: '更新商户头像',
            tags: ['api'],
            payload:{
                maxBytes:5242880
            },
            validate: {
                  headers: Joi.object({
                      'authorization': Joi.string().required().description('需要加token请求头')
                  }).unknown()
              }
        } 
    },

    // 更新服务商头像
    {
       method:'POST',
        path:'/update/headimg/3',
        handler:fileService.uploadPeopleHeadImg,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'SERVER_PEOPLE'
            },
            description: '更新服务商头像',
            notes: '更新服务商头像',
            tags: ['api'],
            payload:{
                maxBytes:5242880
            },
            validate: {
                  headers: Joi.object({
                      'authorization': Joi.string().required().description('需要加token请求头')
                  }).unknown()
              }
        } 
    },

    // 更新服务中心头像
    {
       method:'POST',
        path:'/update/headimg/4',
        handler:fileService.uploadCenterHeadImg,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'SERVER_CENTER'
            },
            description: '更新服务中心头像',
            notes: '更新服务中心头像',
            tags: ['api'],
            payload:{
                maxBytes:5242880
            },
            validate: {
                  headers: Joi.object({
                      'authorization': Joi.string().required().description('需要加token请求头')
                  }).unknown()
              }
        } 
    },

]