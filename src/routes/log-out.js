const { removeSession } = require("../model/session");

function post(req, res) {
  /**
   * [1] Get the session ID from the cookie
   * [2] Remove that session from the DB
   * [3] Remove the session cookie
   * [4] Redirect back home
   */

  // Below now handled with middleware
  // const sid = req.signedCookies.sid;
  // removeSession(sid);

  removeSession(req.session.id);

  res.clearCookie("sid");

  res.redirect("/");
}

module.exports = { post };
