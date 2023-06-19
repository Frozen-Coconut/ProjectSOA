// srcpath
const __srcpath = __dirname.replace("\\controllers", "")

// db
const db = require(__srcpath + "/models/index.js")

// imports
const crypto = require('crypto');
const Joi = require('joi')

module.exports = {
    endpoint1: async (req, res) => {
        let {username, password} = req.body;


        const schema = Joi.object({
            username: Joi.string().required().messages({
                "any.required":"Username is required",
                "string.empty":"Username is required"
            }),
            password: Joi.string().required().messages({
                "any.required":"Password is required",
                "string.empty":"Password is required"
            }),
          })

          try {
            await schema.validateAsync(req.body)
          } catch (error) {
            return res.status(403).send(error.toString())
          }

        let checkUser;
        checkUser = await db.User.findOne({
            where:{
              username: username
            }
        })
        if(checkUser){
            return res.status(400).json({
                message: "Username is not available"
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
            message: "User registered successfully"
        })  
    },
    endpoint2: async (req, res) => {
        let api_key = req.header("Authorization");
        let {api_token} = req.body;

        if(!api_key){
            return res.status(401).json({
                message: "API Key is required"
            }) 
        }

        const schema = Joi.object({
            // api_key: Joi.string().required,
            api_token: Joi.number().min(1).required().messages({
                "any.required":"api_token is required",
                "number.empty":"api_token is required"
            }),
          })

          try {
            await schema.validateAsync(req.body)
          } catch (error) {
            return res.status(403).send(error.toString())
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
            message: "API Token recharged successfully",
            api_token: parseInt(parseInt(api_token)+checkUser.api_token)
        })  
    },
    endpoint3: async (req, res) => {
        let {username, password} = req.body;

        const schema = Joi.object({
            username: Joi.string().required().messages({
                "any.required":"Username is required",
                "string.empty":"Username is required"
            }),
            password: Joi.string().required().messages({
                "any.required":"Password is required",
                "string.empty":"Password is required"
            }),
          })

          try {
            await schema.validateAsync(req.body)
          } catch (error) {
            return res.status(403).send(error.toString())
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
                    message: "User is not found"
                });
            }

            if(checkUser.password!=password){
                return res.status(400).send({
                    message: "Incorrect password"
                });
            }
        } catch (error) {
            return res.status(400).send({
              error
            });
        }
        
        return res.status(200).json({
            message: "User logged in successfully",
            api_key: checkUser.api_key,
            api_token: checkUser.api_token
        })  
    },

}
