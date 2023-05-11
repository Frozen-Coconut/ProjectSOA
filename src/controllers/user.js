// srcpath
const __srcpath = __dirname.replace("\\controllers", "")

// db
const db = require(__srcpath + "/models/index.js")
const User = require(__srcpath + "/models/user");

// utilities
const fileUtil = require(__srcpath + "/utilities/file.js")

// imports
const axios = require("axios")
const baseUrl = "https://api-inference.huggingface.co/models/"
const path = require("path")
const fs = require("fs")
const uuid = require("uuid").v4
const { Op } = require("sequelize");
const crypto = require('crypto');

module.exports = {
    endpoint1: async (req, res) => {
        let {username, password} = req.body;

        if(!username||!password){
            return res.status(400).json({
                message: "Ada field kosong"
            })  
        }
        let temp = String(crypto.randomUUID());
        try {
                    let user = await db.User.create({
                      username: username,
                      password: password,
                      api_key: temp,
                      api_token: 0
                    });
        } catch (error) {
            return res.status(400).send({
              message: error
            });
        }
        
        return res.status(200).json({
            message: "Berhasil register"
        })  
    },
    endpoint2: async (req, res) => {
        let api_key = req.header("Authorization");
        let {api_token} = req.body;

        if(!api_key){
            return res.status(400).json({
                message: "Api key tidak boleh kosong"
            }) 
        }
        if(!api_token){
            return res.status(400).json({
                message: "Api token tidak boleh kosong"
            }) 
        }
        if(isNaN(api_token)){
            return res.status(400).json({
                message: "Api token harus angka"
            }) 
        }
        if(api_token<=0){
            return res.status(400).json({
                message: "Api token harus diatas 0"
            }) 
        }
        let checkUser;
        checkUser = await db.User.findOne({
            where:{
              api_key: api_key
            }
        })
        if(!checkUser){
            return res.status(400).json({
                message: "user tidak ditemukan"
            })  
        }
        let curuser;
        curuser = await db.User.update(
            {
              api_token: parseInt(parseInt(api_token)+parseInt(checkUser.api_token))
            },
            {
              where: {
                api_key: api_key
              }
            }
          );
        
        return res.status(200).json({
            message: "berhasil recharge",
            api_token: parseInt(parseInt(api_token)+checkUser.api_token)
        })  
    },
    endpoint3: async (req, res) => {
        let {username, password} = req.body;

        if(!username||!password){
            return res.status(400).json({
                message: "Ada field kosong"
            })  
        }

        let checkUser;
        try {
            checkUser = await db.User.findOne({
                where:{
                  username: username
                }
            })

            if(!checkUser){
                return res.status(400).send({
                    message: "user tidak ditemukan"
                });
            }

            if(checkUser.password!=password){
                return res.status(400).send({
                    message: "password salah"
                });
            }
        } catch (error) {
            return res.status(400).send({
              error
            });
        }
        
        return res.status(200).json({
            message: "Berhasil login",
            api_key: checkUser.api_key
        })  
    },

}