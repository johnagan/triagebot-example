const {TOKEN, PORT} = process.env,
      triage = require('./index'),
      qs = require('querystring'),
      axios = require('axios'),
      http = require('http');


function handleRequest(req, res){
  let body = "";
  req.on('data', data => body += data);
  req.on('end', () => handleCommand(qs.parse(body)));
  res.end('');
}


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


http.createServer(handleRequest).listen(PORT, () => console.log(`started on ${PORT}`));