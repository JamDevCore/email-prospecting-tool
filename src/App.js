import React from 'react';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/styles';
import Input from '@material-ui/core/Input';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import './App.css';

const styles = {
  card: {
    minHeight: 275,
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    marginTop: 50,
    width: 200,
    margin: '50px auto 10px auto',
  },
  button: {
    width: 200,
    margin: '10px auto 10px auto',
  }
}

const {
  REACT_APP_GOOGLE_KEY, REACT_APP_SNOVID, REACT_APP_SNOV_SECRET, REACT_APP_AIRTABLE_API,
  REACT_APP_AIRBASE, REACT_APP_AIRTABLE,
} = process.env;



class App extends React.Component {
  constructor() {
    super();
    this.state = {
      searchResults: [],
      searchQuery: '',
      emails: [],
      searchComplete: false,
      emailQuantity: 0,
    }
  }

  updateQuery() {
    const query = document.querySelector('[name="query"]').value
    this.setState({
      searchQuery: query,
    })
  }

  getEmails() {
    const { searchQuery } = this.state;
    axios.post('http://localhost:5000/api/get-emails', {
      searchQuery,
      googleApiKey: REACT_APP_GOOGLE_KEY,
      snovClientId: REACT_APP_SNOVID,
      snovSecretKey: REACT_APP_SNOV_SECRET,
      airtableApiKey: REACT_APP_AIRTABLE_API,
      airtableBase: REACT_APP_AIRBASE,
      airtableTable: REACT_APP_AIRTABLE,
    })
    .then((res) => {
      console.log(res)
      this.setState({ emailsQuantity: res })
    })
  }

render() {
  const { classes } = this.props;
    return (
      <div className="App">
        <div className="search">
          <Container

          >
            <Card className={classes.card}>
              <h2>Prospect emails</h2>
              <p>Emails collected so far: {this.state.emailQuantity}</p>
              <Input
                name="query"
                onChange={() => this.updateQuery()}
                className={classes.input}
                />
              <Button
                onClick={()=> this.getEmails()}
                className={classes.button}>Search</Button>
            </Card>
          </Container>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(App);
