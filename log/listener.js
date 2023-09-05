const log = require('./index')
const fs = require('fs')

////////////////////////////// Update Log 
const updateLog = (up)=>{
    log.on("update",()=>{
    fs.appendFileSync('./data/log.txt',`info: "${up.url}" url hit at date: ${new Date()} with action ${up.method}\n`)
    })
    log.update();
}







module.exports = {updateLog}


