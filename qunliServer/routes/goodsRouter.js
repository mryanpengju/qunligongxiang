/**
 * 商品路由管理
 */

const Joi = require('joi');
const goodsService = require('../service/goodsService');

module.exports = [

    //获取所有商品列表
    {
        method:'GET',
        path:'/goods/list/{page}/{size}',
        handler:goodsService.getGoodsList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"] //or ["goods",admin]
            },
            description: '获取商品列表',
            notes: '获取商品资源列表',
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

    //获取下架商品列表
    {
        method:'GET',
        path:'/goods/lower/list/{page}/{size}',
        handler:goodsService.getGoodsLowerList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"] //or ["goods",admin]
            },
            description: '获取下架商品列表',
            notes: '获取下架商品列表',
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

    //获取某分类下的商品列表
    {
        method:'GET',
        path:'/goods/list/{categoryId}/{page}/{size}',
        handler:goodsService.getGoodsTypeList,
        config:{
            auth:false,
            description: '获取某分类下的商品列表',
            notes: '获取某分类下的商品列表',
            tags: ['api'],
            validate: {
                params:{
                    categoryId:Joi.string().default("0").description("品类id"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                }
            }
        }
    },

    //添加商品
    {
        method:'POST',
        path:'/goods',
        handler:goodsService.addGoods,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN"
            },
            description: '添加商品',
            notes: '添加商品',
            tags: ['api'],
            validate: {
                payload: {
                    name: Joi.string().required().description('商品名称'),
                    state:Joi.number().default(1).description("商品状态0为下架，1上架"),
                    category:Joi.string().required().description("分类id"),
                    brand:Joi.string().description("品牌id"),
                    price:Joi.number().required().description("价格"),
                    originalPrice:Joi.number().description("原价格"),
                    preferentialPrice:Joi.number().description("优惠价"),
                    stock:Joi.number().default(9999).description("库存"),
                    sales:Joi.number().default(0).description("销量"),
                    cover:Joi.string().required().description("封面"),
                    multiple:Joi.array().items(Joi.string()).description("多图"),
                    introduction:Joi.string().description("商品简介"),
                    describe:Joi.string().description("商品描述"),
                    model:Joi.array().items(Joi.object({
                        'guigeNumber':Joi.number().description("数量"),
                        'guigePrice':Joi.number().description("价格"),
                        'guigeText':Joi.string().description("文本"),
                    })).default([]).description("规格模型"),
                    remen: Joi.number().description("热门"),
                    tuijian: Joi.number().description("推荐")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //主后台搜索商品   
    {
        method:'POST',
        path:'/admin/adminGoods/search/list/{page}/{size}',
        handler:goodsService.searchAdminGoodsListAct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '更新商品的热门和推荐 状态',
            notes: '更新商品的热门和推荐 状态',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload:{
                    where: Joi.object().required().description("搜索的条件"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //获取某个商品
    {
        method:'GET',
        path:'/admin/goods/{id}',
        handler:goodsService.getAdminGoods,
        config:{
            auth:false,
            description: '查询某个商品',
            notes: '查询某个商品',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商品id')
                }
            }
        }
    },

    //更新某个商品
    {
        method:'PUT',
        path:'/admin/goods/{id}',
        handler:goodsService.updateAdminGoods,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN"
            },
            description: '更新商品',
            notes: '更新商品',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商品id')
                },
                payload: {
                    name: Joi.string().description('商品名称'),
                    state:Joi.number().description("商品状态0为下架，1上架"),
                    category:Joi.string().description("分类id"),
                    brand:Joi.string().description("品牌id"),
                    price:Joi.number().description("价格"),
                    originalPrice:Joi.number().description("原价格"),
                    preferentialPrice:Joi.number().description("优惠价"),
                    stock:Joi.number().description("库存"),
                    sales:Joi.number().description("销量"),
                    postage: Joi.number().default(0).description("邮费"),
                    cover:Joi.string().description("封面"),
                    multiple:Joi.array().description("多图"),
                    introduction:Joi.string().description("商品简介"),
                    describe:Joi.string().description("商品描述"),
                    model:Joi.array().items(Joi.object({
                        'guigeNumber':Joi.number().description("数量"),
                        'guigePrice':Joi.number().description("价格"),
                        'guigeText':Joi.string().description("文本"),
                    })).description("规格模型"),
                    remen: Joi.number().description('热门 1为是  0为否'),
                    tuijian: Joi.number().description('热门 1为是  0为否'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    // //获取下架商品列表
    // {
    //     method:'GET',
    //     path:'/admin/goods/lower/list/{page}/{size}',
    //     handler:goodsService.getAdminGoodsLowerList,
    //     config:{
    //         auth:{
    //             strategy: 'bearer',
    //             scope: ["ADMIN"] //or ["goods",admin]
    //         },
    //         description: '获取下架商品列表',
    //         notes: '获取下架商品列表',
    //         tags: ['api'],
    //         validate: {
    //             params:{
    //                 page : Joi.string().default("0").description("页数"),
    //                 size : Joi.string().default("0").description("长度")
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
    //         }
    //     }
    // },

    //删除某个商品
    {
        method:'DELETE',
        path:'/admin/goods/{id}',
        handler:goodsService.delAdminGoods,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN"
            },
            description: '删除商品',
            notes: '删除商品',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商品id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

  

    //获取某分类下的商品列表
    {
        method:'GET',
        path:'/admin/goods/list/{categoryId}/{page}/{size}',
        handler:goodsService.getAdminGoodsTypeList,
        config:{
            auth:false,
            description: '获取某分类下的商品列表',
            notes: '获取某分类下的商品列表',
            tags: ['api'],
            validate: {
                params:{
                    categoryId:Joi.number().default("0").description("品类id"),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                }
            }
        }
    },


    //删除某个商品
    {
        method:'DELETE',
        path:'/goods/{id}',
        handler:goodsService.delGoods,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "GOODS_DELETE"
            },
            description: '删除商品',
            notes: '删除商品',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商品id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //更新某个商品
    {
        method:'PUT',
        path:'/goods/{id}',
        handler:goodsService.updateGoods,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "GOODS_ADD_EDIT"
            },
            description: '更新商品',
            notes: '更新商品',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商品id')
                },
                payload: {
                    name: Joi.string().description('商品名称'),
                    state:Joi.number().description("商品状态0为下架，1上架"),
                    category:Joi.string().description("分类id"),
                    brand:Joi.string().description("品牌id"),
                    price:Joi.number().description("价格"),
                    originalPrice:Joi.number().description("原价格"),
                    preferentialPrice:Joi.number().description("优惠价"),
                    stock:Joi.number().description("库存"),
                    sales:Joi.number().description("销量"),
                    cover:Joi.string().description("封面"),
                    multiple:Joi.array().description("多图"),
                    introduction:Joi.string().description("商品简介"),
                    describe:Joi.string().description("商品描述"),
                    model:Joi.array().items(Joi.object({
                        'guigeNumber':Joi.number().description("数量"),
                        'guigePrice':Joi.number().description("价格"),
                        'guigeText':Joi.string().description("文本"),
                    })).description("规格模型"),
                    remen: Joi.number().description('热门 1为是  0为否'),
                    tuijian: Joi.number().description('热门 1为是  0为否'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //获取某个商品
    {
        method:'GET',
        path:'/goods/{id}',
        handler:goodsService.getGoods,
        config:{
            auth:false,
            description: '查询某个商品',
            notes: '查询某个商品',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商品id')
                }
            }
        }
    },

    //根据关键字搜索商品
    {
        method:'POST',
        path:'/goods/search/{page}/{size}',
        handler:goodsService.searchGoods,
        config:{
            auth:false,
            description: '根据关键字搜索商品',
            notes: '根据关键字搜索商品',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    keyword: Joi.string().description('搜索关键词')
                }
            }
        }
    },

    //获取所有推荐商品列表
    {
        method:'GET',
        path:'/goods/recommend/{page}/{size}',
        handler:goodsService.recommendGoods,
        config:{
            auth:false,
            description: '搜索商品列表',
            notes: '搜索商品资源列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                }
            }
        }
    },

    //获取所有remen商品列表
    {
        method:'GET',
        path:'/goods/hot/{page}/{size}',
        handler:goodsService.hotGoods,
        config:{
            auth:false,
            description: '搜索商品列表',
            notes: '搜索商品资源列表',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                }
            }
        }
    },


    //更新某个商品
    //{
    //    method:'GET',
    //    path:'/goods/updata',
    //    handler:goodsService.updataAll,
    //    config:{
    //        auth:false,
    //        description: '更新商品',
    //        notes: '更新商品',
    //        tags: ['api'],
    //    }
    //},




/**********  商户 ***************/



    //添加商品
    {
        method:'POST',
        path:'/merchat/goods',
        handler:goodsService.addMerchantGoods,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN"
            },
            description: '商户添加商品',
            notes: '商户添加商品',
            tags: ['api'],
            validate: {
                payload: {
                    name: Joi.string().required().description('商品名称'),
                    state:Joi.number().default(1).description("商品状态0为下架，1上架"),
                    category:Joi.string().required().description("分类id"),
                    brand:Joi.string().description("品牌id"),
                    price:Joi.number().required().description("价格"),
                    originalPrice:Joi.number().description("原价格"),
                    preferentialPrice:Joi.number().description("优惠价"),
                    stock:Joi.number().default(9999).description("库存"),
                    sales:Joi.number().default(0).description("销量"),
                    cover:Joi.string().required().description("封面"),
                    multiple:Joi.array().items(Joi.string()).description("多图"),
                    introduction:Joi.string().description("商品简介"),
                    describe:Joi.string().description("商品描述"),
                    model:Joi.array().items(Joi.object({
                        'guigeNumber':Joi.number().description("数量"),
                        'guigePrice':Joi.number().description("价格"),
                        'guigeText':Joi.string().description("文本"),
                    })).default([]).description("规格模型"),
                    remen: Joi.number().description("热门"),
                    tuijian: Joi.number().description("推荐")
                    //merchatId: Joi.string().required().description('商户ID'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    //获取所有商品列表
    {
        method:'GET',
        path:'/merchat/goods/list/{page}/{size}',
        handler:goodsService.getMerchatGoodsList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"] //or ["goods",admin]
            },
            description: '获取商户商品列表',
            notes: '获取商户商品资源列表',
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

    //获取下架商品列表
    {
        method:'GET',
        path:'/merchat/goods/lower/list/{page}/{size}',
        handler:goodsService.getMerchatGoodsLowerList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"] //or ["goods",admin]
            },
            description: '获取商户下架商品列表',
            notes: '获取商户下架商品列表',
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
// *********************************************
    // 获取所有的 正常 商品
    {
        method:'GET',
         path:'/admin/all/goods/list/{page}/{size}',
         handler:goodsService.getAllGoodsListAct,
         config:{
           auth:{
               strategy: 'bearer',
               scope: ["ADMIN"]
           },
             description: '获取所有的正常商品列表',
             notes: '获取所有的正常商品列表',
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
     // 获取所有的 下架 商品
     {
        method:'GET',
         path:'/admin/all/lower/goods/list/{page}/{size}',
         handler:goodsService.getAllLowerGoodsListAct,
         config:{
           auth:{
               strategy: 'bearer',
               scope: ["ADMIN"]
           },
             description: '获取所有的下架商品列表',
             notes: '获取所有的下架商品列表',
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
     // 下架商品
     {
         method:'GET',
         path:'/admin/goods/out/{id}',
         handler:goodsService.getAllGoodsOutAct,
         config:{
           auth:{
               strategy: 'bearer',
               scope: ["ADMIN"]
           },
             description: '主后台商品下架',
             notes: '主后台商品下架',
             tags: ['api'],
             validate: {
                 params:{
                     id : Joi.string().required().description("商品ID"),
                 },
                 headers: Joi.object({
                     'authorization': Joi.string().required().description('需要加token请求头'),
                 }).unknown()
             }
         }
     },
     // 根据商品名字搜索商品
     {
         method:'POST',
         path:'/admin/goods/search/list/{page}/{size}',
         handler:goodsService.searchGoodsListAct,
         config:{
           auth:{
               strategy: 'bearer',
               scope: ["ADMIN","USER"]
           },
             description: '根据商品名字搜索商品',
             notes: '根据商品名字搜索商品',
             tags: ['api'],
             validate: {
                 params:{
                     page : Joi.string().default("0").description("页数"),
                     size : Joi.string().default("0").description("长度")
                 },
                 payload:{
                     where: Joi.object().required().description("搜索的条件"),
                 },
                 headers: Joi.object({
                     'authorization': Joi.string().required().description('需要加token请求头'),
                 }).unknown()
             }
         }
     },
     // 更新商品的热门和推荐 状态
     {
         method:'POST',
         path:'/admin/goods/update/{id}',
         handler:goodsService.updateGoodsStatusAct,
         config:{
           auth:{
               strategy: 'bearer',
               scope: ["ADMIN"]
           },
             description: '更新商品的热门和推荐 状态',
             notes: '更新商品的热门和推荐 状态',
             tags: ['api'],
             validate: {
                 params:{
                     id : Joi.string().required().description("页数"),
                 },
                 payload:{
                     tuijian: Joi.number().required().description("推荐状态 1为推荐 0为未推荐"),
                     remen: Joi.number().required().description("热门状态 1为推荐 0为未推荐"),
                 },
                 headers: Joi.object({
                     'authorization': Joi.string().required().description('需要加token请求头'),
                 }).unknown()
             }
         }
     },

]

