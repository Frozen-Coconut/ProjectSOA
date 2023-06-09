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
                message: "Text is required"
            })  
        }
        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
            }) 
        }

        let checkUser;
        checkUser = await db.User.findOne({
            where:{
              api_key: api_key
            }
        })
        if(!checkUser){
            return res.status(401).json({
                message: "Invalid API Key"
            })  
        }
        try {
                    let temp = await db.Text.create({
                        text: text,
                        username: checkUser.username
                    });
        } catch (error) {
            return res.status(400).json({
              message: error
            });
        }
        
        return res.status(200).json({
            message: "Text added successfully"
        })  
    },
    endpoint5: async (req, res) => {
        let {text} = req.body;
        let {id} = req.params;
        let api_key = req.header("Authorization");

        if(!text||!id){
            return res.status(400).json({
                message: "Text is required"
            })  
        }
        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
            }) 
        }

        let checkUser;
        checkUser = await db.User.findOne({
            where:{
              api_key: api_key
            }
        })
        if(!checkUser){
            return res.status(401).json({
                message: "Invalid API Key"
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
                message: "Text is not found"
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
            return res.status(400).json({
              message: error
            });
        }
        
        return res.status(200).json({
            message: "Text updated successfully"
        })  
    },
    endpoint6: async (req, res) => {
        let {id} = req.params;
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
            })
        }

        let user = await db.User.findOne({
            where: {
                api_key: api_key
            }
        })

        if(!user){
            return res.status(401).json({
                message: "Invalid API Key"
            })
        }
        
        await db.Text.destroy({
            where: {
                id: id,
                username: user.username
            }
        })

        return res.status(200).json({
            message: "Text deleted successfully"
        })
    },
    endpoint7: async (req, res) => {
        let { text } = req.query
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
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

        return res.status(200).json({
            texts
        })

    },
    endpoint8: async (req, res) => {
        let api_key = req.header("Authorization");
        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
            })
        }

        let user = await db.User.findOne({
            where: {
                api_key: api_key
            }
        })

        if(!user){
            return res.status(401).json({
                message: "Invalid API Key"
            })
        }

        let texts = await db.Text.findAll({
            where: {
                username: user.username
            }
        })

        return res.status(200).json({
            texts
        })
    },
    endpoint9: async (req, res) => {
        let { id_text } = req.params
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
            })
        }

        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) {
            return res.status(401).json({message: "Invalid API Key"})
        }

        let text = await db.Text.findOne({
            where: {
                id: id_text
            }
        })

        if(text == null) {
            return res.status(404).json({message:"Invalid Text ID"})
        }

        user.api_token -= 1;

        if(user.api_token < 0) return res.status(403).json({message:"Please recharge your API Token"})

        await user.save();

        let url = baseUrl + "distilbert-base-uncased-finetuned-sst-2-english"

        const result = (await axios.post(url, {inputs: text.text}, {headers: {"Authorization": "Bearer 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"}})).data
        return res.status(200).json({
	    message: "Text analyzed successfully",
            result
        })
    },
    endpoint10: async (req, res) => {
        let { id_text } = req.params
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
            })
        }

        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) {
            return res.status(401).json({message: "Invalid API Key"})
        }

        let text = await db.Text.findOne({
            where: {
                id: id_text
            }
        })

        if(text == null) {
            return res.status(404).json({message:"Invalid Text ID"})
        }

        user.api_token -= 1;

        if(user.api_token < 0) return res.status(403).json({message:"Please recharge your API Token"})

        await user.save();

        let url = baseUrl + "gpt2"

        const result = (await axios.post(url, {inputs: text.text}, {headers: {"Authorization": "Bearer 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"}})).data
        return res.status(200).json({
	    message: "Text generated successfully",
            result
        })
    },
    endpoint11: async(req, res) => {
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
            })
        }

        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) {
            return res.status(401).json({message: "Invalid API Key"})
        }

        let { id_text } = req.params
        let text = await db.Text.findOne({
            where: {
                id: id_text
            }
        })

        if(text == null) {
            return res.status(404).json({message:"Invalid Text ID"})
        }

        user.api_token -= 1;

        if(user.api_token < 0) return res.status(403).json({message:"Please recharge your API Token"})

        await user.save();

        let url = baseUrl + "dbmdz/bert-large-cased-finetuned-conll03-english"

        const result = (await axios.post(url, {inputs: text.text}, {headers: {"Authorization": "Bearer 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"}})).data
        
        let text_anonymized = text;

        let obj_viewed = []

        result.forEach(entity => {
            text_anonymized.replace(entity.word, `<${entity.entity_group}>`)

            obj_viewed.push({
                entity:`${entity.word} => ${entity.entity_group}`,
                confident:`${(score*100).toFixed(2)}%`
            })
        });

        return res.status(200).json({
            message:"Text has been identified",
            list_entity:obj_viewed,
            original_text:text,
            anonymized_text:text_anonymized
        });
    }
}
