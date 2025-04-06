import tyypin from "./tyypin.js";
export default class poid {
  constructor(UserId, PostTime) {
    if (tyypin("String", UserId) || tyypin("String", PostTime)) {
      return UserId + PostTime;
    } else {
      if (!tyypin("String", UserId)) {
        console.error("argument.UserId should be passed as a String.");
      } else if (!tyypin("String", PostTime)) {
        console.error("argument.PostTime should be passed as a String.");
      } else {
        console.error("argument.UserId should be passed as a String.");
        console.error("argument.PostTime should be passed as a String.");
      }
    }
  }
}
