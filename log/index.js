const EventEmitter = require('events');


class Log extends EventEmitter {

    // addition Emitter 
    add(){
        this.emit("add")
    }

    // Update Emitter 
    update(){
        this.emit("update")
    }
    

     // Update Emitter 
    delete(){
        this.emit("delete")
    }


    /// Backup Emitter
    backup(){
        this.emit("backup")
    }
}

module.exports = new Log();


