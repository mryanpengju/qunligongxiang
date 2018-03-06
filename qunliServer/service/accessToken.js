/**
 * Created by shichenda on 2016/6/30.
 */

const dao = require("../dao/dao");

var AccessToken = function(relation_gid,request) {
    AccessToken.prototype.relation_gid = relation_gid;
    AccessToken.prototype.request = request;
}

module.exports = AccessToken;

AccessToken.prototype.get =async function(callback) {

    var result = await dao.findOne(AccessToken.prototype.request,"access_token",{"relation_gid":AccessToken.prototype.relation_gid});

    if(result!=null){
        delete result._id;
        delete result.relation_gid;
        return callback(null, result);
    }else{
        console.log('accessToken没有获取到');
        return callback(null);
    }
}

AccessToken.prototype.save =async function(token, callback) {

    var expireTime = (new Date().getTime()) + 7100 * 1000;
    var postData = {
        'relation_gid': AccessToken.prototype.relation_gid,
        'accessToken': token.accessToken,
        'expireTime': token.expireTime
    };

    var result = await dao.findOne(AccessToken.prototype.request,"access_token",{"relation_gid":AccessToken.prototype.relation_gid});

    if(result==null){
        var accessToken =await dao.save(AccessToken.prototype.request,"access_token",postData);
        if(accessToken==null){
            callback("保存失败。");
        }else{
            callback(null)
        }
    }else{
        var accessToken =await dao.updateOne(AccessToken.prototype.request,"access_token",{_id:result._id},postData);
        if(accessToken==null){
            callback("保存失败。");
        }else{
            callback(null)
        }
    }
}