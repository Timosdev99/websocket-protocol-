import {createServer} from "http"
const PORT = 3000
const WEBSOCKET_MAGIC_STRING_KEY = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
import crypto from 'crypto'

const server = createServer((req, res)=>{
    res.writeHead(200);
    res.end('server is working')
}).listen(PORT, ()=>{
    console.log('server running on', PORT)
})

server.on("upgrade", upgrade)

function upgrade (req, socket, head) {
    const {"sec-websocket-key":webclientsocketkey } = req.headers
   console.log(`${webclientsocketkey} connected`)
   const headers = handshake(webclientsocketkey) 
   console.log(headers)

   socket.write(headers)
}

function handshake(id) {
const acceptkey = createsocketaccept(id)
return acceptkey
const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    ''
  ].map(line => line.concat('\r\n')).join('')

  return headers
}

function createsocketaccept(id) {
   const shan =  crypto.createHash('sha1')
   shan.update(id + WEBSOCKET_MAGIC_STRING_KEY)
   return shan.digest('base64')
}

// [
//     'uncaughtException',
//     'unhandledRejection'
// ].forEach(event => {
//     process.on(event, (err) => {
//         console.error(`something went wrong: ${event}, msg: ${err}`)
//     })
// });