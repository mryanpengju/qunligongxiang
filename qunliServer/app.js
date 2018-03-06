/**
 * Created by chenda on 2016/4/14.
 */

'use strict';

require("babel-core/register");
require("babel-polyfill");
var schedule = require("node-schedule");
const merchantService = require('./service/merchantService');

 const Hapi = require('hapi');

 const Good = require('good');

 var time = new Date().getTime();

//  var AES = require("crypto-js/aes");
//  console.log("bearer "+"admin:"+AES.encrypt("/admin/login:"+time, "e3704f875c5de47c8c2589bbd0e455ec")+":admin");
//  console.log(AES.encrypt("123456","AiMaGoo2016!@.")+"");

 const server = new Hapi.Server();

/** 跨域请求配置 **/
  var corsConfig = {
        "maxAge": 86400,
        "headers": ["Accept", "Authorization", "Content-Type", "If-None-Match","cross-origin"],
        "additionalHeaders": [],
        "exposedHeaders": ["WWW-Authenticate", "Server-Authorization"],
        "additionalExposedHeaders": [],
        "credentials": true,
        "origin" : ["*"],
    }

    server.connection({port : 3000, routes: { cors: corsConfig }});

    server.register(require('inert'), () => {});

    /** 数据库连接 start **/
    var dbOpts = {
        "url":"mongodb://127.0.0.1:27017/qunli",
    };

    server.register({
        register:require('hapi-mongodb'),
        options:dbOpts
    },function(err){
        if(err){
            server.log(['error'], err);
            throw err;
        }
    });
    /** 数据库连接 end **/

    /** 异步流程库 start **/
    //server.register([
    //    require('hapi-async-handler')
    //], function(err) {
    //    if(err){
    //        server.log(['error'], err);
    //        throw err;
    //    }
    //});
    /** 异步流程库 end **/


   /** 拦截验证 start **/
    server.register(require('hapi-auth-bearer-simple'), function (err) {

        if (err) {
            throw err;
        }

        server.auth.strategy('bearer', 'bearerAuth', {
            validateFunction: require('./service/validate').validateFunc,
            exposeRequest: true
        });
    });

    /** 拦截验证 end **/


   /** 路由 start **/
    server.register({
        register:require('hapi-router'),
        options:{
            routes:'routes/*.js'
        }
    },function(err){
        if(err){
            server.log(['error'],err);
            throw err;
        }
    });

    /** 路由 start  end**/


    /** api文档系统 start **/
    const doc = {
        info: {
            'title': '农场 API 文档',
            'version': '1.0'
        },
        documentationPath:"/doc",
        tags: [{
            'name': 'sms',
            'description': '短信操作接口'
        },{
            'name': 'privilage',
            'description': '权限操作接口'
        },{
            'name': 'role',
            'description': '角色资源操作接口'
        },{
            'name': 'admin',
            'description': '管理员资源操作接口'
        },{
            'name': 'user',
            'description': '用户数据操作接口'
        },{
            'name': 'goods',
            'description': '商品数据操作接口'
        },{
            'name':'dishes',
            'description': '菜品数据操作接口'
        },{
            'name':'recruit',
            'description': '求职招聘数据操作接口'
        }]
    };

    server.register([
        require('inert'),
        require('vision'),
        {
            'register': require('hapi-swagger'),
            'options': doc
        }], function(err) {
        server.log(['error'],err);
    });

    // /** api文档系统 end **/


    /** 日志系统 start **/
    var options = {
        reporters:[{
            reporter:require('good-console'),
            events:{response:'*', log:'*'}
        },{
            reporter:require('good-file'),
            events:{log:'debug'},
            config:'log/debug_log.log'
        }, {
            reporter: require('good-file'),
            events: {log: 'error'},
            config: 'log/error_log.log'
        }]
    }

    server.register({
        register:Good,
        options:options
    },function(err) {
        if(err){
            server.log(['error'],err);
            //throw err;
        }

        server.start(function(err){
            if(err){
                server.log(['error'], err);
                //throw err;
            }
            console.log('Server runing at:',server.info.uri);
            server.log(['debug'], 'Started...');

            schedule.scheduleJob("0 7 10 * * *", function(){
                // 每天00:00计算昨日商户的返利总额
                merchantService.totalAllMerchantRangLiAct({server:server});
            });
            schedule.scheduleJob("0 8 10 * * *", function(){
                //每天00:00:00 计算派发金额
                merchantService.totalYesterdayFudaiAct({server:server});
            });
        });

    });
