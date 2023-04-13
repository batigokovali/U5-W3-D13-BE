let onlineUsers = []

export const newConnectionHandler = socket => {
    // "connection" is a socket.io event. This will get triggered every time a new client connects.
    console.log("A new client connected! it's id is:", socket.id)

    // 1. Emit a "welcome" event to the connected client
    socket.emit("welcome", { message: `${socket.id}` })

    // 2. Listens to event emitted from FE, called "setUsername" (it has to be same!). This event contains the username in the payload
    socket.on("setUsername", payload => {
        console.log(payload)

        // 2.1 When the username is received, it needs to be tracked together with socket.id
        onlineUsers.push({ username: payload.username, socketId: socket.id })

        // 2.2 BE sends the list of online users to the user that currently logged in
        socket.emit("loggedIn", onlineUsers)

        // 2.3 BE also needs to inform every online user that new user which just logged in
        socket.broadcast.emit("updateOnlineUsersList", onlineUsers)
    })

    // 3. Listens for an event called "sendMessage" (it has to be same!). This will get triggered when a user sends a new message
    socket.on("sendMessage", message => {

        // 3.1 When the new message is received, it needs to be "propagate" to the all logged in users 
        socket.broadcast.emit("newMessage", message)
    })

    // 4. "disconnect" is a socket.io event. This event gets triggered when an user closes the browser/tab/window
    socket.on("disconnect", () => {
        // 4.1 Server needs to update the online users list, because of disconnected users. Basically removes the disconnected online user from he onlineUsers array.
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)

        // 4.2 Since the onlineUsers array has been changed, current online users needs to be notified.
        socket.broadcast.emit("updateOnlineUsersList", onlineUsers)
    })
}
