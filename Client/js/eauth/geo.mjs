import { consta } from "../console.mjs";
function checkBrowser() {
  var result = "un";

  var agent = window.navigator.userAgent.toLowerCase();
  var version = window.navigator.appVersion.toLowerCase();

  if (agent.indexOf("msie") > -1) {
    if (version.indexOf("msie 6.") > -1) {
      result = "IE6";
    } else if (version.indexOf("msie 7.") > -1) {
      result = "IE7";
    } else if (version.indexOf("msie 8.") > -1) {
      result = "IE8";
    } else if (version.indexOf("msie 9.") > -1) {
      result = "IE9";
    } else if (version.indexOf("msie 10.") > -1) {
      result = "IE10";
    } else {
      result = "IE(バージョン不明)";
    }
  } else if (agent.indexOf("trident/7") > -1) {
    result = "IE";
  } else if (agent.indexOf("edge") > -1) {
    result = "Edge";
  } else if (agent.indexOf("chrome") > -1) {
    result = "Chrome";
  } else if (agent.indexOf("safari") > -1) {
    result = "Safari";
  } else if (agent.indexOf("opera") > -1) {
    result = "Opera";
  } else if (agent.indexOf("firefox") > -1) {
    result = "Firefox";
  }
  return result;
}
function orgFloor(value, base) {
  return Math.floor(value * base) / base;
}
class geo_auth {
  constructor() {
    if ("geolocation" in navigator) {
    } else {
      let nowtime = new Date();
      console.group("Logs related to navigator.geolocation");
      console.info("%c navigator.geolocation may not be.", consta.binf);
      console.log("Retrying...");
      if ("geolocation" in navigator) {
      } else {
        console.log("%c navigator.geolocation does not exist.", consta.binf);
        let bname = checkBrowser;
        if (bname === "un" || bname === "IE") {
          console.log(
            "%c It appears to be an unsupported browser.",
            consta.binf
          );
          console.log("Report this result to the user.");
          console.groupEnd("Logs related to navigator.geolocation");
          //↓ is error report
          console.group("ERROR_REPORT");
          console.error("An error has occurred.");
          console.info("Error occurred in geo_auth.");
          console.error("Failed to acquire location information.");
          console.error(
            "%c The location system is not available on unsupported browsers.",
            consta.binf
          );
          console.error(
            "%c 位置情報認証システムは、サポートされていないブラウザでは利用できません。",
            consta.binf
          );

          console.error("%c 不支援的瀏覽器無法使用位置驗證系統。", consta.binf);
          console.error(
            "%c 위치 인증 시스템은 지원되지 않는 브라우저에서는 사용할 수 없습니다.",
            consta.binf
          );

          console.info(
            "%c This error is not a Deep-School ISSUE.",
            consta.binf
          );
          console.info(
            "There is either a problem with the user's settings or the environment in which the user is using the system."
          );
          console.info("Error Report End");
          console.groupEnd("ERROR_REPORT");
        } else {
          console.info(
            "%c Location information is not available or not allowed.",
            consta.binf
          );
          console.log(
            "%c Location-based authentication is not available.",
            consta.err
          );
          console.log("An error report is issued.");
          console.groupEnd("Logs related to navigator.geolocation");
          //↓ is error report
          console.group("ERROR_REPORT");
          console.error("An error has occurred.");
          console.info("Error occurred in geo_auth.");
          console.error("Failed to acquire location information.");
          console.error(
            "%c Location information is either unavailable or not allowed.",
            consta.binf
          );
          console.error(
            "%c 位置情報は利用できないか、許可されていません。",
            consta.binf
          );
          console.error("%c 位置信息不可用或不允许使用。", consta.binf);
          console.error(
            "%c 위치 정보를 사용할 수 없거나 허용되지 않습니다.",
            consta.binf
          );
          console.info(
            "%c This error is not a Deep-School ISSUE.",
            consta.binf
          );
          console.info(
            "There is either a problem with the user's settings or the environment in which the user is using the system."
          );
          console.info("Error Report End");
          console.groupEnd("ERROR_REPORT");
        }
      }
    }
    navigator.geolocation.getCurrentPosition(this.setup, this.geo_error);
  }
  setup(position) {
    this.latitude = position.coords.latitude;
    this.latitude = orgFloor(10, this.latitude);
    this.longitude = position.coords.longitude;
    this.longitude = orgFloor(10, this.longitude);
    console.info(
      "%c 위치 정보를 업데이트하려면 약간의 운동이 필요합니다.",
      consta.small
    );
  }
  geo_error() {
    console.info(
      "%c Location information is not available or not allowed.",
      consta.binf
    );
    console.log(
      "%c Location-based authentication is not available.",
      consta.err
    );
    console.log("An error report is issued.");
    console.groupEnd("Logs related to navigator.geolocation");
    //↓ is error report
    console.group("ERROR_REPORT");
    console.error("An error has occurred.");
    console.info("Error occurred in geo_auth.");
    console.error("Failed to acquire location information.");
    console.error(
      "%c Location information is either unavailable or not allowed.",
      consta.binf
    );
    console.error(
      "%c 位置情報は利用できないか、許可されていません。",
      consta.binf
    );
    console.error("%c 位置信息不可用或不允许使用。", consta.binf);
    console.error(
      "%c 위치 정보를 사용할 수 없거나 허용되지 않습니다.",
      consta.binf
    );
    console.info("%c This error is not a Deep-School ISSUE.", consta.binf);
    console.info(
      "There is either a problem with the user's settings or the environment in which the user is using the system."
    );
    console.info("Error Report End");
    console.groupEnd("ERROR_REPORT");
  }
  auth(lattitude, longitude) {
    let a_latti = orgFloor(10, lattitude);
    let a_longi = orgFloor(10, longitude);
    let tester;
    if (this.latitude === a_latti) {
      tester += 1;
    }
    if (this.longitude === a_longi) {
      tester += 1;
    }
    if (tester === 2) {
      return true;
    } else {
      return false;
    }
  }
}
function init_geo() {
  const now_geo = new geo_auth();
  return now_geo;
}
init_geo();
export default geo_auth;
