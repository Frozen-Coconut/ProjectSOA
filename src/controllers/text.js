// srcpath
const __srcpath = __dirname.replace("\\controllers", "")

// db
const db = require(__srcpath + "/models/index.js")
const Text = require(__srcpath + "/models/text");

// utilities
const fileUtil = require(__srcpath + "/utilities/file.js")

// imports
const axios = require("axios")
const baseUrl = "https://api-inference.huggingface.co/models/"
const path = require("path")
const fs = require("fs")
const uuid = require("uuid").v4
const { Op } = require("sequelize");

module.exports = {
    endpoint4: async (req, res) => {
        let {text} = req.body;
        let api_key = req.header("Authorization");

        if(!text){
            return res.status(400).json({
                message: "Ada field kosong"
            })  
        }
        if(!api_key){
            return res.status(400).json({
                message: "Api key tidak boleh kosong"
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
        try {
                    let temp = await db.Text.create({
                        text: text,
                        username: checkUser.username
                    });
        } catch (error) {
            return res.status(400).send({
              message: error
            });
        }
        
        return res.status(200).json({
            message: "Berhasil add text"
        })  
    },
    endpoint5: async (req, res) => {
        let {text} = req.body;
        let {id} = req.params;
        let api_key = req.header("Authorization");

        if(!text||!id){
            return res.status(400).json({
                message: "Ada field kosong"
            })  
        }
        if(!api_key){
            return res.status(400).json({
                message: "Api key tidak boleh kosong"
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

        let checkText;
        checkText = await db.User.findOne({
            where:{
              id: id
            }
        })
        if(!checkText){
            return res.status(400).json({
                message: "text tidak ditemukan"
            })  
        }

        try {
            let curuser;
            curuser = await db.Text.update(
                {
                  text: text
                },
                {
                  where: {
                    id: id
                  }
                }
              );
        } catch (error) {
            return res.status(400).send({
              message: error
            });
        }
        
        return res.status(200).json({
            message: "Berhasil update text"
        })  
    }

}