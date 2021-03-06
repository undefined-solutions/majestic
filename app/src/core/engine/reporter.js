const WebSocket = require('ws');

let connectionPromise = new Promise(resolve => {
  let connection = new WebSocket('ws://localhost:' + process.env.serverPort);
  connection.on('open', function open() {
    resolve(connection);
    console.log('connection is open from repoter');
  });
});

class MyCustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.testStartQueue = [];
    this.testResultQueue = [];
    this.onRunStartQueue = [];
  }

  onTestStart(test) {
    connectionPromise.then(connection => {
      connection.send(
        JSON.stringify({
          source: 'jest-test-reporter',
          event: 'onTestStart',
          payload: {
            test
          }
        })
      );
    });
  }

  onTestResult(test, testResult, aggregatedResult) {
    this.testResultQueue.unshift({
      test,
      testResult,
      aggregatedResult
    });
    connectionPromise.then(connection => {
      connection.send(
        JSON.stringify({
          source: 'jest-test-reporter',
          event: 'onTestResult',
          payload: this.testResultQueue
        })
      );
      this.testResultQueue = [];
    });
  }

  onRunStart(results) {
    connectionPromise.then(connection => {
      connection.send(
        JSON.stringify({
          source: 'jest-test-reporter',
          event: 'onRunStart',
          payload: {
            results
          }
        })
      );
    });
  }

  onRunComplete(contexts, results) {
    connectionPromise.then(connection => {
      connection.send(
        JSON.stringify({
          source: 'jest-test-reporter',
          event: 'onRunComplete',
          payload: {
            results,
            contexts
          }
        })
      );
    });
  }
}

module.exports = MyCustomReporter;
