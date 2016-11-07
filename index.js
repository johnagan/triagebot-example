/* 
 * This is a very basic webserver and HTTP Client.
 * In production, you may want to use something like Express.js
 * or Botkit to host a webserver and manage API calls
 */
const {TOKEN, PORT} = process.env,
      triage = require('./triage'),
      qs = require('querystring'),
      axios = require('axios'),
      http = require('http');


// Handle any request to this server and parse the POST
function handleRequest(req, res){
  let body = "";
  req.on('data', data => body += data);
  req.on('end', () => handleCommand(qs.parse(body)));
  res.end('');
}


// Get channel history, build triage report, and respond with results
function handleCommand(payload) {
  let {channel_id, response_url} = payload;

  // load channel history
  let params = qs.stringify({ count: 1000, token: TOKEN, channel: channel_id });
  let getHistory = axios.post('https://slack.com/api/channels.history', params);

  // build the triage report
  let buildReport = result => Promise.resolve( triage(payload, result.data.messages) );
  
  // post back to channel
  let postResults = results => axios.post(response_url, results);

  // execute
  getHistory.then(buildReport).then(postResults);
}

// start server
http.createServer(handleRequest).listen(PORT, () => console.log(`server started on ${PORT}`));
