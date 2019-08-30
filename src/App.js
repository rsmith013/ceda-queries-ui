import React from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

class ResultAggregateVariables extends React.Component {
  render() {
    return (
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>{this.props.item.key.agg_string}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Documents: {this.props.item.doc_count}</Card.Subtitle>
          </Card.Body>
        </Card>
      </Container>
    )
  }
}

class ResultCoverage extends React.Component {
  render() {
    if (this.props.results.total_files !== undefined) {
      return(
        <Container>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>Files: <strong>{numberWithCommas(this.props.results.total_files)}</strong></ListGroup.Item>
              <ListGroup.Item>Parameter files: <strong>{numberWithCommas(this.props.results.parameter_files)}</strong></ListGroup.Item>
              <ListGroup.Item>Coverage: <strong>{this.props.results.percentage_coverage.toFixed(2)}%</strong></ListGroup.Item>
            </ListGroup>
          </Card>
        </Container>
      )
    } else {
      return(
        <Container>
          <Card>
            <Card.Title>Loading...</Card.Title>
          </Card>
        </Container>
      )
    }
  }
}

class ResultExtensions extends React.Component {
  render() {
    return (
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>{this.props.item.key.extension}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Documents: {this.props.item.doc_count}</Card.Subtitle>
          </Card.Body>
        </Card>
      </Container>
    )
  }
}

class ResultsList extends React.Component {
  render() {
    if (this.props.type === "agg_variables"){
      return (
        <Container>
          {this.props.results.map(item => <ResultAggregateVariables item={item} />)}
        </Container>
      )
    } else if (this.props.type === "extensions"){
      return (
        <Container>
          {this.props.results.map(item => <ResultExtensions item={item} />)}
        </Container>
      )
    } else if (this.props.type === "coverage"){
      return (
        <Container>
          <ResultCoverage results={this.props.results} />
        </Container>
      )
    } else {
      return (
        <Container>
          <p>No Results</p>
        </Container>
      )
    }
  }
}

class QueryAggregateVariables extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    fetch("api/agg_variables" + this.props.file_path)
      .then(res => res.json())
      .then(
        (result) => {
          this.props.updateResults(result.agg_variables, "agg_variables")
        },
        (error) => {
        }
      )
  }

  render() {
    return (
      <Container>
        <Button type='button' variant='outline-primary btn-lg w-100' onClick={this.handleClick}>Aggregate Variables</Button>
      </Container>
    )
  }
}

class QueryCoverage extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    fetch("api/coverage" + this.props.file_path)
      .then(res => res.json())
      .then(
        (result) => {
          this.props.updateResults(result, "coverage")
        },
        (error) => {
        }
      )
  }
  render() {
    return (
      <Container>
        <Button type='submit' variant='outline-primary btn-lg w-100' onClick={this.handleClick}>Coverage</Button>
      </Container>
    )
  }
}

class QueryExtensions extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    fetch("api/extensions" + this.props.file_path)
      .then(res => res.json())
      .then(
        (result) => {
          this.props.updateResults(result.file_extensions, "extensions")
        },
        (error) => {
        }
      )
  }

  render() {
    return (
      <Container>
        <Button type='submit' variant='outline-primary btn-lg w-100' onClick={this.handleClick}>Extensions</Button>
      </Container>
    )
  }
}

class QueryList extends React.Component {
  render() {
    return (
      <ButtonGroup vertical>
        <QueryExtensions updateResults={this.props.updateResults} file_path={this.props.file_path}/>
        <QueryCoverage updateResults={this.props.updateResults} file_path={this.props.file_path}/>
        <QueryAggregateVariables updateResults={this.props.updateResults} file_path={this.props.file_path}/>
      </ButtonGroup>
    )
  }
}

class LiveVolume extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      volume: 0,
      extra: "",
    };
  }

  fetchcall = () => {
    fetch("/api/total_size" + this.props.file_path)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            volume: result.total_file_size
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  componentDidMount() {
    setInterval(this.fetchcall, 1000)
  }

  render() {
    let extra = this.state.extra;
    const volume = this.state.volume;
    if (this.state.error) {
      extra = "Error: " + this.state.error.message;
    } else if (!this.state.isLoaded) {
      extra = "Loading..."
    } else {
      extra = numberWithCommas(volume) + " bytes";
    }
    return (
      <Container>
        <p>Live Volume:</p>
        <strong>
          <p>{extra}</p>
          <p>{formatBytes(volume)}</p>
        </strong>
      </Container>
    )
  }
}

class LiveDirectoryCount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      directories: 0,
      extra: "",
    };
  }

  fetchcall = () => {
    fetch("/api/count" + this.props.file_path)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            directories: result.directories
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  componentDidMount() {
    setInterval(this.fetchcall, 1000)
  }

  render() {
    let extra = this.state.extra;
    const directories = this.state.directories;
    if (this.state.error) {
      extra = "Error: " + this.state.error.message;
    } else if (!this.state.isLoaded) {
      extra = "Loading..."
    } else {
      extra = numberWithCommas(directories) + " directories";
    }
    return (
      <Container>
        <p>Live Directory Count:</p>
        <strong>
          <p>{extra}</p>
        </strong>
      </Container>
    )
  }
}

class LiveFileCount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      files: 0,
      extra: "",
    };
  }

  fetchcall = () => {
    fetch("api/count" + this.props.file_path)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            files: result.files
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  componentDidMount() {
    setInterval(this.fetchcall, 1000)
  }

  render() {
    let extra = this.state.extra;
    const files = this.state.files;
    if (this.state.error) {
      extra = "Error: " + this.state.error.message;
    } else if (!this.state.isLoaded) {
      extra = "Loading..."
    } else {
      extra = numberWithCommas(files) + " files";
    }
    return (
      <Container>
        <p>Live File Count:</p>
        <strong>
          <p>{extra}</p>
        </strong>
      </Container>
    )
  }
}

class LiveContent extends React.Component{
  render() {
    return (
      <Container>
        <Row>
          <Col md>
            <LiveFileCount file_path={this.props.file_path}/>
          </Col>
          <Col md>
            <LiveDirectoryCount file_path={this.props.file_path}/>
          </Col>
          <Col md>
            <LiveVolume file_path={this.props.file_path}/>
          </Col>
        </Row>
      </Container>
    )
  }
}

class SearchBar extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      file_path: '',
    }

    this.updateInput = this.updateInput.bind(this)
    this.handleClick = this.handleClick.bind(this);
  }

  updateInput(event) {
    this.setState({
      file_path: event.target.value
    })
  }

  handleClick(event){
    event.preventDefault();
    this.props.updateFilePath(this.state.file_path);
  }

  render() {
    return (
      <Form onSubmit={this.handleClick}>
        <Form.Group>
          <Container>
            <Row>
              <Col sm={10}>
                <Form.Control className='text' type='search' placeholder='File path' onChange={this.updateInput}/>
              </Col>
              <Col sm={2}>
                <Button type='submit' className="searchbutton" variant='outline-dark'>Search</Button>
              </Col>
            </Row>
          </Container>
        </Form.Group>
      </Form>
    )
  }
}

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      file_path: "",
      results: [],
      type: "",
    }
    this.updateFilePath = this.updateFilePath.bind(this)
    this.updateResults = this.updateResults.bind(this)
  }

  updateFilePath(file_path) {
    this.setState ({
      file_path: file_path
    })
  }

  updateResults(results, type) {
    this.setState({
      results: results,
      type: type
    })
  }

  render () {
    return (
      <Container>
        <Row>
          <Col>
            <h1>CEDA Elasticsearch Common Queries</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <SearchBar updateFilePath={this.updateFilePath}/>
          </Col>
        </Row>
        <Row>
          <Col lg={4}>
            <QueryList updateResults={this.updateResults} file_path={this.state.file_path}/>
          </Col>
          <Col lg={8}>
            <LiveContent file_path={this.state.file_path}/>
            <ResultsList results={this.state.results} type={this.state.type}/>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
