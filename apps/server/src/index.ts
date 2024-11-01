import http from "http";
import SocketService from "./services/socket";
import dotenv from 'dotenv';
import { startMessageConsumer } from "./services/kafka";

//[Load environment from .env files]
dotenv.config();


async function init() {
    startMessageConsumer();
    const socketservice = new SocketService();

    const httpServer = http.createServer();
    const PORT = process.env.PORT || 8000;

    socketservice.io.attach(httpServer);

    httpServer.listen(PORT, ()=>console.log(`Server is running on PORT: ${PORT}`)); 

    socketservice.initListeners();
}

init();