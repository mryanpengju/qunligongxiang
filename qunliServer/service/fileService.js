var uploadFile =require("./fileService");
const dao = require("../dao/dao");
var settings = require('../settings.js');

var hosts = settings.host+":"+settings.hostPort;

exports.uploadImg = async function(request,reply){
    var imgPaths = [];
    var path = "/upload/img/user";
    var keys = Object.keys(request.payload);
    for(let i=0;i<keys.length;i++){
        //let result = await uploadFile.saveImg(keys[i],path,request.payload[keys[i]], request.server.log);
        let result = await uploadFile.saveImg(keys[i],__dirname+"/.."+path,request.payload[keys[i]], request.server.log);
        if(result){
            imgPaths.push(path+result);
        }
    }
    reply({paths:imgPaths});
}

exports.saveImg = function(imgName,path,data,log){
    var fs = require('fs');
    var fileName = new Date().getTime()+"original."+imgName.split(".")[imgName.split(".").length-1];
    return new Promise(function(resolve, reject){
        fs.exists(path,function(exist){
            if(!exist){
                fs.mkdir(path,function(err){
                    if(err){
                        log(['error'],err);
                        throw err;
                        resolve(null);
                    }else {
                        writeFile(resolve)
                    }
                });
            }else{
                writeFile(resolve);
            }
        });
    });

    function writeFile(resolve){
        fs.writeFile(path+fileName,data,function(err){
            if(err){
                log(['error'],err);
                throw err;
                resolve(null);
            }else{
                resolve(fileName);
            }
        });
    }
}

exports.uploadFileAdmin = async function(request,reply){
    var path = "/upload/img/goods/";
    var imgName = request.payload.localUrl?request.payload.localUrl:request.payload.Filename;
    //var result = await uploadFile.saveImg(imgName,path,request.payload.imgFile,request.server.log);
    var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path,request.payload.imgFile,request.server.log);
    if(result){
        reply({"error":0,"url":path+result});
    }else{
        reply({"error":1,"message":"上传失败"});
    }
}

exports.uploadFile = async function(request,reply){
    var path = "/upload/img/goods/";
    var imgName = request.payload.localUrl?request.payload.localUrl:request.payload.Filename;
    var imgData = new Buffer(request.payload.imgFile.replace(/^data:image\/\w+;base64,/,""), 'base64');
    var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path, imgData ,request.server.log);
    if(result){
        reply({"error":0,"url":path+result});
    }else{
        reply({"error":1,"message":"上传失败"});
    }
}

/*exports.uploadFile = async function(request,reply){
    console.log(request.payload);
    var path = "/upload/img/goods/";
    var imgName = request.payload.localUrl?request.payload.localUrl:request.payload.Filename;
    console.log('@______',request.payload.imgFile);
    //var result = await uploadFile.saveImg(imgName,path,request.payload.imgFile,request.server.log);
    var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path,request.payload.imgFile,request.server.log);
    if(result){
        console.log(path+result);
        reply({"error":0,"url":path+result});
    }else{
        reply({"error":1,"message":"上传失败"});
    }
}*/



exports.uploadFileTextAndPic = async function(request,reply){
    var path = "/upload/img/goods/";
    var imgName = request.payload.localUrl?request.payload.localUrl:request.payload.Filename;
    var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path,request.payload.usr_file,request.server.log);
    //var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path,request.payload.imgFile,request.server.log);
    if(result){
        reply({"error":0,"url":hosts+path+result});
    }else{
        reply({"error":1,"message":"上传失败"});
    }
}
//上传消费者的头像
exports.uploadUserHeadImg = async function(request, reply){
    var userInfo = request.auth.credentials;
    var path = "/upload/img/goods/";
    var imgName = request.payload.localUrl?request.payload.localUrl:request.payload.Filename;
    var imgData = new Buffer(request.payload.imgFile.replace(/^data:image\/\w+;base64,/,""), 'base64');
    var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path, imgData ,request.server.log);
    if(result){
        var updateResult = await dao.updateOne(request, "user",{"_id":userInfo._id+""},{"headImg":path+result});
        if(updateResult == null){
            reply({"message":"上传头像失败","error":1,"statusCode":108,"status":false});
            return;
        }else{
           reply({"message":"上传头像成功","error":0,"statusCode":107,"status":true,"url":path+result});
            return; 
        }
        
    }else{
        reply({"message":"上传头像失败","error":1,"statusCode":108,"status":false});
        return;
    }
}
//上传商户的头像
exports.uploadMerchatHeadImg = async function(request, reply){
    var userInfo = request.auth.credentials;
    var path = "/upload/img/goods/";
    var imgName = request.payload.localUrl?request.payload.localUrl:request.payload.Filename;
    var imgData = new Buffer(request.payload.imgFile.replace(/^data:image\/\w+;base64,/,""), 'base64');
    var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path, imgData ,request.server.log);
    if(result){
        var updateResult = await dao.updateOne(request, "user",{"_id":userInfo._id+""},{"merchat.logoImg":path+result});
        if(updateResult == null){
            reply({"message":"上传头像失败","error":1,"statusCode":108,"status":false});
            return;
        }else{
           reply({"message":"上传头像成功","error":0,"statusCode":107,"status":true,"url":path+result});
            return; 
        }
    }else{
        reply({"message":"上传头像失败","error":1,"statusCode":108,"status":false});
        return;
    }
}
//上传服务商的头像
exports.uploadPeopleHeadImg = async function(request, reply){
    var userInfo = request.auth.credentials;
    var path = "/upload/img/goods/";
    var imgName = request.payload.localUrl?request.payload.localUrl:request.payload.Filename;
    var imgData = new Buffer(request.payload.imgFile.replace(/^data:image\/\w+;base64,/,""), 'base64');
    var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path, imgData ,request.server.log);
    if(result){
        var updateResult = await dao.updateOne(request, "user",{"_id":userInfo._id+""},{"serverPeople.logoImg":path+result});
        if(updateResult == null){
            reply({"message":"上传头像失败","error":1,"statusCode":108,"status":false});
            return;
        }else{
           reply({"message":"上传头像成功","error":0,"statusCode":107,"status":true,"url":path+result});
            return; 
        }
        
    }else{
        reply({"message":"上传头像失败","error":1,"statusCode":108,"status":false});
        return;
    }
}
//上传服务中心的头像
exports.uploadCenterHeadImg = async function(request, reply){
    var userInfo = request.auth.credentials;
    var path = "/upload/img/goods/";
    var imgName = request.payload.localUrl?request.payload.localUrl:request.payload.Filename;
    var imgData = new Buffer(request.payload.imgFile.replace(/^data:image\/\w+;base64,/,""), 'base64');
    var result = await uploadFile.saveImg(imgName,__dirname+"/.."+path, imgData ,request.server.log);
    if(result){
        var updateResult = await dao.updateOne(request, "user",{"_id":userInfo._id+""},{"serverCenter.logoImg":path+result});
        if(updateResult == null){
            reply({"message":"上传头像失败","error":1,"statusCode":108,"status":false});
            return;
        }else{
           reply({"message":"上传头像成功","error":0,"statusCode":107,"status":true,"url":path+result});
            return; 
        }
        
    }else{
        reply({"message":"上传头像失败","error":1,"statusCode":108,"status":false});
        return;
    }
}

