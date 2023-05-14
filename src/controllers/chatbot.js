// srcpath
const __srcpath = __dirname.replace("\\controllers", "")

// db
const db = require(__srcpath + "/models/index.js")

// imports
const axios = require("axios")
const baseUrl = "https://api-inference.huggingface.co/models/"

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

module.exports = {
    endpoint12: async (req, res) => {
        let api_key = req.header("Authorization")
        if (!api_key) {
            return res.status(400).json({message: "API Key is required"});
        }

        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) {
            return res.status(400).json({message: "Invalid API Key"})
        }

        let count_chat_room = await db.Chat.count({where: {username: user.username}});
        if (count_chat_room >= 10) {
            return res.status(400).json({message: "You already create 10 chat room"})
        }

        let id_chat = ""

        do {
            id_chat = `${user.username.substring(0,2).toUpperCase()}${makeid(4)}`
            let cari_chat = await db.Chat.findOne({where:{id:id_chat}});
            if(!cari_chat) break
        } while(true)

        await db.Chat.create({
            id:id_chat,
            username:user.username,
            profile:""
        });

        return res.status(200).send({
            message:"Chat room has been created",
            id: id_chat
        });
    },
    endpoint13: async (req, res) => {
        let api_key = req.header("Authorization")
        if (!api_key) {
            return res.status(400).json({message: "API Key is required"});
        }

        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) {
            return res.status(400).json({message: "Invalid API Key"})
        }

        let {id_chat, profile} = req.body;
        if(!id_chat) {
            return res.status(400).json({message:"Chat ID is required"});
        }

        let chat = await db.Chat.findOne({where:{id:id_chat}});
        if(chat == null) {
            return res.status(400).json({message: "Invalid Chat ID"});
        }

        if(!profile) {
            return res.status(400).json({message:"Text Profile is required"})
        }

        chat.profile = profile;
        await chat.save();

        return res.status(200).json({
            message:`Bot Profile has been updated for ${id_chat}`,
            profile: profile
        });
    },
}