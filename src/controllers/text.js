// srcpath
const __srcpath = __dirname.replace("\\controllers", "")

// db
const db = require(__srcpath + "/models/index.js")

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
    },
    endpoint6: async (req, res) => {
        let {id} = req.params;
        let api_key = req.header("Authorization");

        if(!id){
            return res.status(400).json({
                message: "Ada field kosong"
            })
        }

        let user = await db.User.findOne({
            where: {
                api_key: api_key
            }
        })

        if(!user){
            return res.status(404).json({
                message: "User tidak ditemukan"
            })
        }
        
        await db.Text.destroy({
            where: {
                id: id,
                username: user.username
            }
        })

        return res.status(200).send({
            message: "Berhasil delete text"
        })
    },
    endpoint7: async (req, res) => {
        let { text } = req.query
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(403).send({
                message: "Unauthorized"
            })
        }

        let user = await db.User.findOne({
            where: {
                api_key: api_key
            }
        })

        let texts = await db.Text.findAll({
            where: {
                username: user.username,
                text: {
                    [Op.like]: `%${text}%`
                }
            }
        })

        return res.status(200).send({
            texts
        })

    },
    endpoint8: async (req, res) => {
        let api_key = req.header("Authorization");
        if(!api_key){
            return res.status(403).send({
                message: "Unauthorized"
            })
        }

        let user = await db.User.findOne({
            where: {
                api_key: api_key
            }
        })

        if(!user){
            return res.status(404).send({
                message: "User tidak ditemukan"
            })
        }

        let texts = await db.Text.findAll({
            where: {
                username: user.username
            }
        })

        return res.status(200).send({
            texts
        })
    },
    endpoint9: async (req, res) => {
        let { id_text } = req.params
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(403).send({
                message: "Unauthorized"
            })
        }

        let text = await db.Text.findOne({
            where: {
                id: id_text
            }
        })

        let url = baseUrl + "distilbert-base-uncased-finetuned-sst-2-english"

        const result = (await axios.post(url, {inputs: text.text}, {headers: {"Authorization": "Bearer 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"}})).data
        return res.status(200).send({
            result
        })
    },
    endpoint10: async (req, res) => {
        let { id_text } = req.params
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(403).send({
                message: "Unauthorized"
            })
        }

        let text = await db.Text.findOne({
            where: {
                id: id_text
            }
        })

        let url = baseUrl + "gpt2"

        const result = (await axios.post(url, {inputs: text.text}, {headers: {"Authorization": "Bearer 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"}})).data
        return res.status(200).send({
            result
        })
    },
    endpoint11: async(req, res) => {
        let { id_text } = req.params
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(403).send({
                message: "Unauthorized"
            })
        }

        let text = await db.Text.findOne({
            where: {
                id: id_text
            }
        })

        if(text == null) {
            return res.status(404).send({message:"Invalid Text ID"})
        }

        let url = baseUrl + "dbmdz/bert-large-cased-finetuned-conll03-english"

        const result = (await axios.post(url, {inputs: text.text}, {headers: {"Authorization": "Bearer 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"}})).data
        return res.status(200).send({
            result
        });
    }
}