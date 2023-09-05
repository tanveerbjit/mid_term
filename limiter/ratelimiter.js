const fs = require("fs").promises;
const path = require("path");
class RateLimiter {
  constructor(req) {
    this.ip = req.connection.remoteAddress;
  }

  permission() {}

  async findByArg(arg) {
    let col = await this._readCollection();
    
    if(col.length>0){
        this.data = col.map((element)=>{
            if(element.ip == this.ip){
                if(element.cnt < 6 &&  ((new Date(element.f_t) -  new Date())/1000) < 10 && element.penalty == false){
                    return { ...element, cnt: element.cnt + 1};
                }else if (
                  element.cnt < 6 &&
                  (new Date(element.f_t) - new Date()) / 1000  > 10 &&
                  element.penalty == false
                ) {
                  return { ...element, cnt: 1, f_t: new Date() };
                } else {
                  return { ...element, cnt: 1, f_t: new Date(), penalty: true };
                }
            }
        })
    }
    

    return this.data;
  }

  configpath() {
    this.path = path.join(__dirname, "..", "data", `blockList.json`);
    return this.path;
  }

  async _readCollection() {
    try {
      const data = await fs.readFile(this.configpath(), "utf8");
      return JSON.parse(data);
    } catch (err) {
      throw err;
    }
  }

  async _writeCollection(col) {
    await fs.writeFile(this.configpath(), JSON.stringify(col));
  }
}
