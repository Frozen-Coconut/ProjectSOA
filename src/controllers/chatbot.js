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
            return res.status(401).json({message: "API Key is required"});
        }

        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) {
            return res.status(401).json({message: "Invalid API Key"})
        }

        let count_chat_room = await db.Chat.count({where: {username: user.username}});
        if (count_chat_room >= 10) {
            return res.status(400).json({message: "You already create 10 chat room"})
        }

        let id_chat = ""

        do {
            id_chat = `${user.username.substring(0,2).toUpperCase()}${makeid(4)}`
            let cari_chat = await db.Chat.findOne({where:{id_room:id_chat}});
            if(!cari_chat) break
        } while(true)

        await db.Chat.create({
            id_room:id_chat,
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
            return res.status(401).json({message: "API Key is required"});
        }

        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) {
            return res.status(401).json({message: "Invalid API Key"})
        }

        let {id_chat} = req.params;
        let {profile} = req.body;
        if(!id_chat) {
            return res.status(400).json({message:"Chat ID is required"});
        }

        let chat = await db.Chat.findOne({where:{id_room:id_chat}});
        if(chat == null) {
            return res.status(404).json({message: "Invalid Chat ID"});
        }

        if(chat.username != user.username) return res.status(404).json({message: "This chat is not yours!"});

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
    endpoint14: async(req, res) => {
        let api_key = req.header("Authorization")
        if (!api_key) {
            return res.status(401).json({message: "API Key is required"});
        }

        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) {
            return res.status(401).json({message: "Invalid API Key"})
        }

        let {id_chat} = req.params;
        let {text} = req.body;
        if(!id_chat) {
            return res.status(400).json({message:"Chat ID is required"});
        }

        let chat = await db.Chat.findOne({where:{id_room:id_chat}});
        if(chat == null) {
            return res.status(404).json({message: "Invalid Chat ID"});
        }

        if(chat.username != user.username) return res.status(404).json({message: "This chat is not yours!"});

        let url = baseUrl + "gpt2"

        let inputs = `Bot name is Bob. Bot is ${chat.profile}. Please continue this chat:\nUser:${text}\nBot:`

        let data = {
            "inputs":inputs,
            "return_full_text":true,
            "wait_for_model":true,
            "temperature":1,
            "max_new_tokens":150,
        }

        let result = (await axios.post(url, data, {headers: {"Authorization": "Bearer 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"}})).data

        console.log(result)

        let reply = result[0].generated_text.replace(inputs,"").split("\n")[0].split("User:")[0].trim();

        console.log(reply)

        let all_chat_text = await db.Chattext.findAll({where:{id_chat:id_chat}})

        user.api_token -= 1;

        if(user.api_token < 0) return res.status(403).json({message:"Please recharge your API Token"})

        await user.save();

        await db.Chattext.create({
            id_chat:id_chat,
            input:text,
            reply:reply,
            datetime:new Date()
        });

        return res.status(200).send({
            Reply:reply
        });
    },
    endpoint15: async(req,res) => {
        let api_key = req.header("Authorization")
        if (!api_key) {
            return res.status(401).json({message: "API Key is required"});
        }

        let user = await db.User.findOne({where: {api_key: api_key}})

        if (user == null) {
            return res.status(401).json({message: "Invalid API Key"})
        }

        let {id_chat} = req.params;
        if(!id_chat) {
            return res.status(400).json({message:"Chat ID is required"});
        }

        let chat = await db.Chat.findOne({where:{id_room:id_chat}});

        if(chat == null) {
            return res.status(400).json({message: "Invalid Chat ID"});
        }

        let all_chat_text = await db.Chattext.findAll({
            attributes:{
                include:["input","reply",[
                    db.sequelize.fn("DATE_FORMAT",db.sequelize.col("datetime"), "%d-%m-%Y %H:%i:%s"),"datetime"
                ]]
            },
            where:{id_chat:id_chat}});

        let chat_log = {}
        all_chat_text.forEach(chat => {
            chat_log[chat.datetime.toString()] = {
                "user":chat.input,
                "bot":chat.reply
            };
        });

        return res.status(200).json({
            message:`Chat log of chat ${id_chat}`,
            chat_log
        })
    }
}
