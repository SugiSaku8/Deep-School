export default function tyypin(obj, type) {
  var clas = Object.prototype.toString.call(obj).slice(8, -1);
  return obj !== undefined && obj !== null && clas === type;
}

/*
API refa
- type_list:
    String
    Number
    Boolean
    Date
    Error
    Array
    Function
    RegExp
    Object
*/