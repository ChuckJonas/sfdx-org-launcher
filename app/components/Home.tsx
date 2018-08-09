import * as React from 'react';
import * as childProcess from 'child_process';
import { Alert, Button, List, Card, Layout, Spin, Icon, Row, Col, Input } from 'antd'
import { LoginItem } from './LoginItem';
import { AddLogin } from './AddLogin';

interface AppState {
  logins: NonScratchOrg[];
  search: string;
  error?: string;
}

export default class Home extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      logins: [],
      search: ''
    }
    this.loadLogins();
  }

  private loadLogins = () => {
    childProcess.exec('sfdx force:org:list --json', (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        return this.setState({ error: stderr })
      }
      let results = JSON.parse(stdout) as OrgListResult
      this.setState({ logins: results.result.nonScratchOrgs, error: undefined })
    });
  }

  private setSearch = (search: string) => {
    this.setState({ search });
  }

  private setError = (error: string) => {
    this.setState({ error });
  }

  private refreshLogins = () => {
    this.setState({ logins: [] }, this.loadLogins)
  }

  public render() {

    return (
      <Layout>
        {this.state.error && <Alert type='error' message={this.state.error} />}

        <Card title="LOGINS" extra={<AddLogin onError={this.setError} onSuccess={this.refreshLogins} />}>
          <Row type="flex" justify="space-between">
            <Col span={12}>
              <Input value={this.state.search} onChange={(e)=>{this.setSearch(e.target.value)}} placeholder='search' />
            </Col>
            <Col>
              <Button icon='reload' shape='circle' onClick={this.refreshLogins} />
            </Col>
          </Row>
          {this.renderBody()}
        </Card>
      </Layout>
    );
  }

  private renderBody = () => {
    if (!this.state.logins.length && !this.state.error) {
      return(
        <Row type="flex" justify="center">
          <Col>
            <Spin tip="loading" spinning={true} />
          </Col>
        </Row>
      )
    }
    //do filtering
    let logins = [...this.state.logins];
    if(this.state.search){
        logins = this.state.logins.filter(l => {
          return l.username.indexOf(this.state.search) > -1
                  || (l.alias && l.alias.indexOf(this.state.search) > -1);
        });
    }
    return (
      <List
        dataSource={logins}
        renderItem={this.renderLogin}
      />
    );
  }

  private renderLogin = (login: NonScratchOrg) => {
    return (
      <List.Item>
        <LoginItem onLogout={this.refreshLogins} onError={this.setError} login={login} />
      </List.Item>
    )

  }
}
