/*
    Chatroom 服务断逻辑
 */

"use strict";

const socketio = require('socket.io');

module.exports = {

    listen: function(server) {

        let io = socketio(server);
        let num = 0;
        let userlist = new Array();

        // 移除数组元素
        let removeArr = function(arr, el) {
            let new_arr = new Array();
            for (var i = 0; i < arr.length; i++) {
                if (el != arr[i]) {
                    new_arr.push(arr[i]);
                }
            }
            return new_arr;
        };

        io.on('connection', function(socket) {
            let addedUser = false;

            // 用户进入事件
            socket.on('join', function(username) {
                if (addedUser) {
                    return;
                }

                // 检查名字是否重复
                for (let i = 0; i < userlist.length; i++) {
                    if (userlist[i] == username) {
                        username = username + Math.ceil(Math.random() * 10000);
                        break;
                    }
                }

                socket.username = username;
                num++;
                addedUser = true;

                userlist.push(username);

                // 告知用户登录成功
                socket.emit('login', {
                    username: socket.username,
                    numUsers: num,
                });

                // 广播告知所有用户
                io.emit('user_joined', {
                    username: socket.username,
                    msg: '欢迎 ' + socket.username + ' 进入聊天室',
                    type: 'BROADCAST',
                    numUsers: num,
                });
            });

            // 用户退出
            socket.on('disconnect', function() {
                if (addedUser) {
                    num--;

                    userlist = removeArr(userlist, socket.username);

                    socket.broadcast.emit('user_left', {
                        username: socket.username,
                        msg: socket.username + "离开了聊天室！",
                        type: "BROADCAST",
                        numUsers: num,
                    });
                }
            });

            // 用户发言
            socket.on('send_msg', function(msg) {
                if (addedUser) {

                    // 广播所有人信息
                    socket.broadcast.emit('msg_sent', {
                        username: socket.username,
                        msg: msg,
                        type: 'BROADCAST',
                    });
                }
            });
        });
    },
}
