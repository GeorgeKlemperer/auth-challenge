const {
  listConfessions,
  createConfession,
} = require("../model/confessions.js");
const { Layout } = require("../templates.js");
const { getSession } = require("../model/session.js");

function get(req, res) {
  /**
   * Currently any user can view any other user's private confessions!
   * We need to ensure only the logged in user can see their page.
   * [1] Get the session ID from the cookie
   * [2] Get the session from the DB
   * [3] Get the logged in user's ID from the session
   * [4] Get the page owner from the URL params
   * [5] If the logged in user is not the page owner send a 401 response
   */
  const sid = req.signedCookies.sid;
  const session = getSession(sid);
  const user_id = session && session.user_id;
  const page_owner = req.params.user_id;

  if (user_id !== page_owner) {
    return res.status(401).send("<h1>Unauthorized access</h1>");
  }

  const confessions = listConfessions(req.params.user_id);
  const title = "Your secrets";
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      <form method="POST" class="Stack" style="--gap: 0.5rem">
        <textarea name="content" aria-label="your confession" rows="4" cols="30" style="resize: vertical"></textarea>
        <button class="Button">Confess 🤫</button>
      </form>
      <ul class="Center Stack">
        ${confessions
          .map(
            (entry) => `
            <li>
              <h2>${entry.created_at}</h2>
              <p>${entry.content}</p>
            </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
  const body = Layout({ title, content });
  res.send(body);
}

function post(req, res) {
  /**
   * Currently any user can POST to any other user's confessions (this is bad!)
   * We can't rely on the URL params. We can only trust the cookie.
   * [1] Get the session ID from the cookie
   * [2] Get the session from the DB
   * [3] Get the logged in user's ID from the session
   * [4] Use the user ID to create the confession in the DB
   * [5] Redirect back to the logged in user's confession page
   */
  const sid = req.signedCookies.sid;
  const session = getSession(sid);
  const user_id = session && session.user_id;

  if (!user_id) {
    return res.status(401).send("<h1>Unauthorized access</h1>");
  }

  createConfession(req.body.content, user_id);

  res.redirect(`/confessions/${user_id}`);
}

module.exports = { get, post };
