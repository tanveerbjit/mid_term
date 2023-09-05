const express = require("express");
const bcrypt = require("bcrypt");


var salt = bcrypt.genSaltSync(10);



var hash = bcrypt.hashSync("B4c0/\/", salt);


let compare = bcrypt.compareSync("B4c0/\/", hash); // true
console.log(compare)
compare = bcrypt.compareSync("not_bacon", hash); // false

console.log(compare)

