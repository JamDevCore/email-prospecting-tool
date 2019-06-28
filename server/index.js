const airtable = require('airtable');
const axios = require('axios');
const express = require('express');
const bodyParser = require("body-parser");

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(allowCrossDomain);


// Serve the static files from the React app

// An api endpoint that returns a short list of items
app.post('/api/get-emails', (req,res) => {
  var searchQuery = req.body.searchQuery;
  const REACT_APP_GOOGLE_KEY = req.body.googleApiKey;
  const REACT_APP_SNOVID = req.body.snovClientId;
  const REACT_APP_SNOV_SECRET = req.body.snovSecretKey;
  const REACT_APP_AIRTABLE_API = req.body.airtableApiKey;
  const airbase = req.body.airtableBase;
  const airtable = req.body.airtableTable;
  const pages = [1,11,21,31,41];
    pages.forEach((page) => {
      axios.post(`https://app.snov.io/oauth/access_token`, {
        "grant_type": "client_credentials",
        "client_id": REACT_APP_SNOVID,
        "client_secret": REACT_APP_SNOV_SECRET,
      })
      .then((res) => {
        console.log(res)
      const googleSearch = `https://www.googleapis.com/customsearch/v1?key=${REACT_APP_GOOGLE_KEY}&cx=016562955967256087618:cvjcq8gnhhq&q=${searchQuery}&start=${page}`
      axios.get(googleSearch)
      .then((result) => {
        console.log(result)
        result.data.items.forEach((item) => {
          axios.post('https://app.snov.io/restapi/get-domain-emails-with-info', {
            "domain": item.link,
            "type": "all",
            "limit": 20,
            "access_token": res.data.access_token,
          })
          .then((finalRes) => {
            console.log(finalRes)
            var base = new airtable({ apiKey: REACT_APP_AIRTABLE_API }).base(airbase);
            let emails = 0;
            finalRes.data.emails.forEach((email) => {
              if(email.status === 'verified' && email.firstName && email.position) {
                emails += 1;
                console.log(email);
                base(airtable).create({
                  "First Name": email && email.firstName,
                  "Last Name": email && email.lastName,
                  "Email": email.email,
                  "Position": email.position,
                  "Company": email.companyName,
                }, function(err, record) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  console.log(record.getId());
                });
                console.log(email)
                }
              })
              res.end(emails);
          })
          .catch(err => console.log(err));
        })
      })
      .catch(err => console.log(err))
    })
    .catch()
  });
});

// Handles any requests that don't match the ones above

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);
