import * as React from 'react';
import * as childProcess from 'child_process';
import { Alert, Button, List, Card, Layout, Spin, Icon, Row, Col, Input } from 'antd'
import { LoginItem } from './LoginItem';
import { AddLogin } from './AddLogin';
import * as os from 'os'

interface AppState {
  logins: Login [];
  search: string;
  error?: string;
  refreshing: boolean;
  showingAdd: boolean;
  waitingForAuth: boolean;
  alias: string,
  instanceUrl: string
}

export default class Home extends React.Component<{}, AppState> {

  // private store: Store;
  private currentProcess: childProcess.ChildProcess;
  constructor(props: any) {
    super(props);

    // this.store = new Store({
    //   configName: 'user-preferences',
    //   defaults: {
    //     logins: []
    //   }
    // });

    // let logins = this.store.get('logins') || [];
    this.state = {
      refreshing: false,
      logins: [],
      search: '',
      showingAdd: false,
      waitingForAuth: false,
      alias: '',
      instanceUrl: ''
    }
  }

  public componentDidMount() {
    this.loadLogins();
  }

  private loadLogins = () => {
    this.setState({refreshing: true}, () => {
      let cmd = 'sfdx force:org:list --json';
      console.log(cmd);
      childProcess.exec(cmd, (error, stdout, stderr) => {
        if (error && !stderr.includes('noOrgsFound')) {
          console.log(error);
          return this.setState({ error: stderr })
        }
        let logins: Login [] = [];
        if(stdout){
          let results = JSON.parse(stdout) as OrgListResult
          logins = results.result.nonScratchOrgs.map(org=>{
            return {...org, ...{isProduction: !(/\.?cs[1-9]{1,3}\./g.test(org.instanceUrl))}}
          });
        }

        this.setState({ logins, refreshing: false, error: undefined })
      });
    });
  }

  private setSearch = (search: string) => {
    this.setState({ search });
  }

  private setError = (error: string) => {
    this.setState({ error });
  }

  private showAdd = () => {
    this.setState({ showingAdd: true });
  }

  public closeAdd = () => {
    if(this.currentProcess && !this.currentProcess.killed){
      this.currentProcess.kill();
    }

    this.setState({ waitingForAuth: false, showingAdd: false });
  }

  private updateAlias = (alias: string) => {
    this.setState({ alias });
  }

  private updateInstanceUrl = (instanceUrl: string) => {
    this.setState({ instanceUrl });
  }

  private launchAuth = () => {
    this.setState({ waitingForAuth: true }, () => {
      let params = '';
      if(this.state.alias){
        params += ' -a \"' + this.state.alias + '\"'
      }

      if(this.state.instanceUrl){
        let instanceUrl = this.state.instanceUrl.startsWith('https://') ? this.state.instanceUrl : 'https://' + this.state.instanceUrl;
        params += ' -r ' + instanceUrl
      }

      let cmd = "sfdx force:auth:web:login " + params
      
      console.log(cmd);

      const defaults = {
        shell: process.env.ComSpec
      };

      this.currentProcess = childProcess.exec(cmd, defaults, (error, stdout, stderr) => {
        this.closeAdd();
        if (error) {
          console.log(error);
          this.setState({waitingForAuth: false});
          let stdErrors = stderr.split(os.EOL);
          stdErrors = stdErrors.filter(err => !err.includes('update available from'));
          return this.setError(stdErrors.join(os.EOL));
        }

        this.setState({ waitingForAuth: false, alias: '', instanceUrl: '' }, ()=>{
          this.closeAdd();
          this.loadLogins();
        })
      });

    });
  }

  private fixLogin = (login: Login) => {
    this.setState({
      showingAdd:true,
      alias: login.alias || '',
      instanceUrl: login.loginUrl
    }, this.launchAuth)
  }

  public render() {
    let addLogin = (
      <AddLogin
        onError={this.setError}
        onSuccess={this.loadLogins}
        onOpen={this.showAdd}
        onClose={this.closeAdd}
        onLogin={this.launchAuth}
        visible={this.state.showingAdd}
        instanceUrl={this.state.instanceUrl}
        onUpdateInstanceUrl={this.updateInstanceUrl}
        alias={this.state.alias}
        onUpdateAlias={this.updateAlias}
        waiting={this.state.waitingForAuth}
      />
    )
    return (
      <Layout>
        {this.state.error && <Alert type='error' message={this.state.error} />}

        <Card title="LOGINS" extra={addLogin}>
          <Row type="flex" justify="space-between">
            <Col span={12}>
              <Input value={this.state.search} onChange={(e) => { this.setSearch(e.target.value) }} placeholder='search' />
            </Col>
            <Col>
              <Button loading={this.state.refreshing} icon='reload' shape='circle' onClick={this.loadLogins} />
            </Col>
          </Row>
          {this.renderBody()}
        </Card>
      </Layout>
    );
  }

  private renderBody = () => {
    let logins = [...this.state.logins].filter(ln => {
      if(!this.state.search.length) return true;

      return ln.username.includes(this.state.search) || (ln.alias && ln.alias.includes(this.state.search));
    }).sort((a, b) => {
      return a.username.localeCompare(b.username);
    });

    return (
      <List
        loading={this.state.refreshing}
        dataSource={logins}
        renderItem={this.renderLogin}
      />
    );
  }

  private renderLogin = (login: Login) => {

    return (
      <List.Item>
        <LoginItem onLogout={this.loadLogins} onError={this.setError} login={login} onFix={this.fixLogin} />
      </List.Item>
    )
  }

}
