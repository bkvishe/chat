var mongo = require('mongodb').MongoClient,
    client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://130.211.207.39/chat', function(err, db){
    
    if(err) throw err;

    client.on('connection', function(socket){

        var col = db.collection('messages'),

            sendStatus = function(s){
                socket.emit('status', s);
            };

        //Emit all messages
        col.find().limit(100).sort({ _id:1}).toArray(function(err, data){

            if(err) throw err;
            socket.emit('output', data);
        });

        //wait for input
        socket.on('input', function(data){

            var name = data.name,
                message = data.message;
                whitespacePattern = /^\s*$/;

            if(whitespacePattern.test(name) || whitespacePattern.test(message)){
                sendStatus('Name and Message is required.');
            }
            else{
                col.insert({name:name, message:message}, function(){

                    //Emits latest messages to All clients
                    client.emit('output', [data]);

                    sendStatus({
                        message:'Message Sent !',
                        clear : true
                    });
                });
            }
        });
    });
});
