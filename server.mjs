import {createServer} from "http"
const PORT = 3000
const WEBSOCKET_MAGIC_STRING_KEY = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
import crypto from 'crypto'
const SEVEN_BITS_INTEGER_MARKER = 125
const SIXTEEN_BITS_INTEGER_MARKER = 126
const SIXTYFOUR_BITS_INTEGER_MARKER = 127


const MAXIMUM_SIXTEEN_BITS_INTEGER = 2 ** 16 // 0 to 65536
const MASK_KEY_BYTES_LENGTH = 4
const OPCODE_TEXT = 0x01 // 1 bit in binary 1

// parseInt('10000000', 2)
const FIRST_BIT = 128

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
   socket.on('readable', () => onSocketReadable(socket))
}

function onSocketReadable(socket) {

    socket.read(1)

    const [markerAndPayloadLength] = socket.read(1)
    const lengthIndicatorInBits = markerAndPayloadLength - FIRST_BIT
    
   let messageLength = 0
  if (lengthIndicatorInBits <= SEVEN_BITS_INTEGER_MARKER) {
    messageLength = lengthIndicatorInBits
  } 
  else if(lengthIndicatorInBits === SIXTEEN_BITS_INTEGER_MARKER) {
    messageLength = socket.read(2).readUint16BE(0)
  }
  else {
    throw new Error(`your message is too long! we don't handle 64-bit messages`) 
  }

  const maskey = socket.read(MASK_KEY_BYTES_LENGTH)
  const encoded = socket.read(messageLength)
  const decoded = unmask(encoded, maskKey)
  const received = decoded.toString('utf8')

  const data = JSON.parse(received)
  console.log('message received!', data)

  const msg = JSON.stringify({
    message: data,
    at: new Date().toISOString()
  })
  sendMessage(msg, socket) 
}

function unmask(encodedBuffer, maskKey) {
    const finalbuffer = Buffer.from(encodedBuffer)
    const fillWithEightZeros = (t) => t.padStart(8, "0")
    const toBinary = (t) => fillWithEightZeros(t.toString(2))
    const fromBinaryToDecimal = (t) => parseInt(toBinary(t), 2)
    const getCharFromBinary = (t) => String.fromCharCode(fromBinaryToDecimal(t))
  
    for (let index =0; index< encodedBuffer.length; index++) {
      finalBuffer[index] = encodedBuffer[index] ^ maskKey[index % MASK_KEY_BYTES_LENGTH];
  
      const logger = {
        unmaskingCalc: `${toBinary(encodedBuffer[index])} ^ ${toBinary(maskKey[index % MASK_KEY_BYTES_LENGTH])} = ${toBinary(finalBuffer[index])}`,
        decoded: getCharFromBinary(finalBuffer[index])
      }
      console.log(logger)
    }
  
    return finalbuffer
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