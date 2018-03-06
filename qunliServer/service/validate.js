
/**
 * 验证服务器
 * auth加密方式 密码加密 访问地址:UID或者时间戳
 * auth信息格式：bearer 用户名:加密字符串:(管理员需要加最后一个参数admin)
 * Created by chenda on 2016/4/16.
 */

var CryptoJS = require("crypto-js");

//验证函数
exports.validateFunc = function(token, request, callback){
    var user;
    var tokens = token.split(":");
    console.log('$$$$$-----',tokens);
    var db = request.server.plugins['hapi-mongodb'].db;
    var collectionName, searchObj;
    if(tokens.length==3){
        collectionName = 'user';
        if(tokens[2] == 1){
            searchObj = {"username":tokens[0]}
        }else if(tokens[2] == 2){
            searchObj = {"merchat.username":tokens[0]}
        }else if(tokens[2] == 3){
            searchObj = {"serverPeople.username":tokens[0]}
        }else if(tokens[2] == 4){
            searchObj = {"serverCenter.username":tokens[0]}
        }
        
    }else if(tokens.length==4){
        collectionName = 'admin';
        searchObj = {"username":tokens[0]}
    }else{
        console.log('0000000');
        callback(null, false, null);
        return;
    }
    //查询用户是否存在
    db.collection(collectionName).findOne(searchObj,function(err,result){
        if(err){
            request.server.log(['error'],err);
            throw err;
            console.log(111111);
            callback(null, false, null);
            return;
        }
        if(result){
            user = result;
            var decoded;
            try {
                var password = "";
                if(tokens[2] == 1){
                    password = CryptoJS.AES.decrypt(result.password,"{b^`)v?H&Ko*jGa1").toString(CryptoJS.enc.Utf8);
                }else if(tokens[2] == 2){
                    password = CryptoJS.AES.decrypt(result.merchat.password,"{b^`)v?H&Ko*jGa1").toString(CryptoJS.enc.Utf8);
                }else if(tokens[2] == 3){
                    password = CryptoJS.AES.decrypt(result.serverPeople.password,"{b^`)v?H&Ko*jGa1").toString(CryptoJS.enc.Utf8);
                }else if(tokens[2] == 4){
                    password = CryptoJS.AES.decrypt(result.serverCenter.password,"{b^`)v?H&Ko*jGa1").toString(CryptoJS.enc.Utf8);
                }else{
                    password = CryptoJS.AES.decrypt(result.password,"{b^`)v?H&Ko*jGa1").toString(CryptoJS.enc.Utf8);
                }
                //var password = CryptoJS.AES.decrypt(result.password,"{b^`)v?H&Ko*jGa1").toString(CryptoJS.enc.Utf8);
                var passwordmd5 = CryptoJS.HmacMD5(password,password).toString();
                decoded = CryptoJS.AES.decrypt(tokens[1], passwordmd5).toString(CryptoJS.enc.Utf8).split(":");
            }catch (e){
                console.log(22222);
                callback(null, false, null);
                request.server.log(["error"],e);
                return;
            }
            //对比访问的url是否与token中的url相等
            if(decoded[0]!=request.url.path){
                console.log(333333);
                callback(null, false, null);
                return;
            }
            //查询之前是否访问过
            db.collection('access_record').findOne({"guid":decoded[1]},function(err,result){
                if(err){
                    request.server.log(['error'],err);
                    throw err;
                    console.log(44444444);
                    callback(null, false, null);
                    return;
                }
                if(result){
                    console.log(55555555);
                    callback(null, false, null);
                    return;
                }
                //存储唯一路径
                db.collection('access_record').save({guid:decoded[1]},function(err,result){
                    if(err) {
                        request.server.log(['error'], err);
                        throw err;
                    }
                });
                console.log(777777);
                callback(null, true, user);
            });
        }else{
            console.log(66666666);
           callback(null, false, null);
        }
    });
}


exports.getToken = function(request,reply){
    var time = new Date().getTime();
    var admin = "";
    if(request.payload.userORadmin == "admin"){
        admin = ":admin"
    }
    admin = ":"+request.payload.userType+admin;
    var token = "bearer "+request.payload.username+":"+CryptoJS.AES.encrypt(request.payload.url+":"+time,CryptoJS.HmacMD5(request.payload.pwd,request.payload.pwd).toString())+admin;
    reply({"toekn":token});
}