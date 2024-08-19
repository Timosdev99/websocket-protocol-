import {createServer} from "http"
const PORT = 3000

const server = createServer((req, res)=>{
    res.writeHead(200);
    res.send('server is working')
}).listen(PORT, ()=>{
    console.log('server running on', PORT)
})

server.on('upgrade', (req, socket, res) => {
   console.log(req, socket, res)
})

// [
//     'uncaughtException',
//     'unhandledRejection'
// ].forEach(event => {
//     process.on(event, (err) => {
//         console.error(`something went wrong: ${event}, msg: ${err}`)
//     })
// });