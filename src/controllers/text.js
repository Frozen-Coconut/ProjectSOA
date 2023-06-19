// srcpath
const __srcpath = __dirname.replace("\\controllers", "")

// db
const db = require(__srcpath + "/models/index.js")

// imports
const axios = require("axios")
const baseUrl = "https://api-inference.huggingface.co/models/"
const { Op } = require("sequelize");
const Joi = require('joi');

module.exports = {
    endpoint4: async (req, res) => {
        let {text} = req.body;
        let api_key = req.header("Authorization");

        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
            }) 
        }

        const schema = Joi.object({
            text:Joi.string().required().messages({
                "any.required":"Text is required",
                "string.empty":"Text is required"
            })
        });

        try {
            await schema.validateAsync(req.body);
        } catch (error) {
            return res.status(401).send({message:error.details[0].message})
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

        let temp = ""

        try {
            temp = await db.Text.create({
                text: text,
                username: checkUser.username
            });
        } catch (error) {
            return res.status(400).json({
              message: error
            });
        }
        
        return res.status(200).json({
            message: "Text added successfully",
            id : temp.id
        })  
    },
    endpoint5: async (req, res) => {
        let {text} = req.body;
        let {id} = req.params;
        let api_key = req.header("Authorization");

        const schema = Joi.object({
            text:Joi.string().required().messages({
                "any.required":"Text is required",
                "string.empty":"Text is required"
            }),
            id:Joi.string().required().messages({
                "any.required":"ID is required",
                "string.empty":"ID is required"
            })
        });

        try {
            await schema.validateAsync(req.body);
        } catch (error) {
            return res.status(401).send({message:error.details[0].message})
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
	
	if(!user){
            return res.status(401).json({
                message: "Invalid API Key"
            })
        }

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

        if(user.api_token < 1) return res.status(403).json({message:"Please recharge your API Token"})

        user.api_token -= 1;

        await user.save();

        let url = baseUrl + "distilbert-base-uncased-finetuned-sst-2-english"

        const result = (await axios.post(url, {inputs: text.text}, {headers: {"Authorization": "Bearer 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"}})).data
        
        let result_sentiment = result[0][0].score > result[0][1].score ? result[0][0].label : result[0][1].label;

        const history = await db.Historytext.create({
            text:text,
            result:result_sentiment,
            type:"SA",
            datetime:new Date()
        });
        
        return res.status(200).json({
	        message: `Text analyzed successfully, the text has been classified as ${result_sentiment}`,
            result
        });
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

        if(user.api_token < 1) return res.status(403).json({message:"Please recharge your API Token"})

        user.api_token -= 1;

        await user.save();

        let url = baseUrl + "gpt2"

        const history = await db.Historytext.create({
            text:text,
            result:result[0].generated_text.replace(text.text, ""),
            type:"TG",
            datetime:new Date()
        });

        const result = (await axios.post(url, {inputs: text.text}, {headers: {"Authorization": "Bearer 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"}})).data
        return res.status(200).json({
            message: "Text generated successfully",
            result: {
                input: text.text,
                generated: result[0].generated_text.replace(text.text, ""),
                output: result[0].generated_text
            }
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

        if(user.api_token < 1) return res.status(403).json({message:"Please recharge your API Token"})
        
	user.api_token -= 1;

        await user.save();

        let url = baseUrl + "dbmdz/bert-large-cased-finetuned-conll03-english"

        const result = (await axios.post(url, {inputs: text.text}, {headers: {"Authorization": "Bearer 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"}})).data
        
        let text_anonymized = text.text;

        let obj_viewed = []

        result.forEach(entity => {
            text_anonymized.replace(entity.word, `<${entity.entity_group}>`)

            obj_viewed.push({
                entity:`${entity.word} => ${entity.entity_group}`,
                confident:`${(score*100).toFixed(2)}%`
            })
        });

        const history = await db.Historytext.create({
            text:text,
            result:text_anonymized,
            type:"NER",
            datetime:new Date()
        });

        return res.status(200).json({
            message:"Text has been identified",
            result:{
                list_entity:obj_viewed,
                original_text:text.text,
                anonymized_text:text_anonymized
            }
        });
    },
    endpoint21: async(req,res) => {
        const schema = Joi.object({
            type:Joi.any().when('type', {is:Joi.exist(), then:Joi.valid('SA', 'TG', 'NER')})
        });

        try {
            await schema.validateAsync(req.body);
        } catch (error) {
            return res.status(401).send({message:"Type should be inserted or not at all"})
        }

        let type = req.query.type;

        let obj_viewed = []

        if (!type || type == "") {
            let all_text_history = await db.Historytext.findAll();

            history.forEach(all_text_history => {
                let type_text_analysis = history.type == "SA" ? "Sentiment Analysis" : (history.type == "TG" ? "Text Generation" : "Named Entity Recognition / Anonymization") 
                obj_viewed.push({
                    type : type_text_analysis,
                    original_text : history.text,
                    result : history.result,
                    datetime : history.datetime
                });
            });
        } else {
            let all_text_history = await db.Historytext.findAll({
                where: {
                    type:type
                }
            });

            history.forEach(all_text_history => {
                let type_text_analysis = history.type == "SA" ? "Sentiment Analysis" : (history.type == "TG" ? "Text Generation" : "Named Entity Recognition / Anonymization") 
                obj_viewed.push({
                    type : type_text_analysis,
                    original_text : history.text,
                    result : history.result,
                    datetime : history.datetime
                });
            });
        }

        return res.status(200).send({
            obj_viewed
        })
    }
}
