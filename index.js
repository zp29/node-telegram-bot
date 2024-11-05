
var TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const https = require('https');

var token = '7580922585:AAEg6t5WsExm86x5jiIygH-dqOnvPy5JuwA';
//括號裡面的內容需要改為在第5步獲得的Token
var bot = new TelegramBot(token, { polling: true });
//使用Long Polling的方式與Telegram伺服器建立連線

//收到Start訊息時會觸發這段程式
bot.onText(/\/start/, function (msg) {
    var chatId = msg.chat.id; //用戶的ID
    var resp = '你好'; //括號裡面的為回應內容，可以隨意更改
    bot.sendMessage(chatId, resp); //發送訊息的function
});

// //收到/cal開頭的訊息時會觸發這段程式
// bot.onText(/\/cal (.+)/, function (msg, match) {
//     var fromId = msg.from.id; //用戶的ID
//     var resp = match[1].replace(/[^-()\d/*+.]/g, '');
//     // match[1]的意思是 /cal 後面的所有內容ß
//     resp = '計算結果為: ' + eval(resp);
//     console.log('index.js resp -> ', resp);
//     // eval是用作執行計算的function
//     bot.sendMessage(fromId, resp); //發送訊息的function
// });

bot.on('message', (msg) => {
    console.log('index.js msg -> ', msg);

    const chatId = msg.chat.id;

    // 检查消息是否包含视频
    if (msg.video) {
        downloadVideo(msg)
        bot.sendMessage(chatId, '视频已下载');
        return
    }

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
});

async function downloadVideo(msg) {
    const fileId = msg.video.file_id;

    // 使用getFile方法获取文件信息
    bot.getFile(fileId).then((fileInfo) => {
        const filePath = fileInfo.file_path;
        const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

        // 下载文件到本地
        const fileStream = fs.createWriteStream(`./${msg.video.file_name}`);
        https.get(fileUrl, (response) => {
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                console.log(`视频已下载: ${msg.video.file_name}`);
                return msg.video.file_name;
            });
        }).on('error', (err) => {
            console.error('下载出错:', err);
            return false;
        });
    }).catch((error) => {
        console.error('获取文件信息失败:', error);
        return false;
    });
}