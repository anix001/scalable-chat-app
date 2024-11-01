import { Server } from "socket.io";
import Redis from "ioredis";
import {produceMessage} from './kafka';

const pub = new Redis({
    host: process.env.REDIS_HOST as string , 
    port: parseInt(process.env.REDIS_PORT as string) ,
    username: process.env.REDIS_USERNAME as string  ,
    password: process.env.REDIS_PASSWORD as string
});
const sub = new Redis({
    host: process.env.REDIS_HOST as string ,
    port: parseInt(process.env.REDIS_PORT as string) ,
    username: process.env.REDIS_USERNAME as string ,
    password: process.env.REDIS_PASSWORD as string
});

class SocketService {
    private _io:Server;

    constructor(){
        console.log("Init Socket Service ...");
        this._io = new Server({
            cors: {
                origin: "*",
                allowedHeaders:['*']
            }
        });

        sub.subscribe("MESSAGES");

    }

    public initListeners(){
        const io = this.io;
        console.log("Init Socket Listeners ....");

        io.on("connect",(socket)=>{
            console.log(`New Socket Connected`, socket.id);

            socket.on('event:message', async({message}:{message:string})=>{
                console.log("New Message Received", message);

                //publish message to redis
                await pub.publish('MESSAGES', JSON.stringify({message}));
            })
        })
        
        sub.on("message", async(channel, message)=>{

            if(channel === "MESSAGES"){
                console.log("New message from redis", message);
                io.emit("message", message);
                await produceMessage(message);
                console.log("Message produced to kafka broker");
            }
        })
    }

    get io(){
        return this._io;
    }
}

export default SocketService;