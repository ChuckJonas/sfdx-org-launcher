import * as React from 'react';
import { Button, Icon, Popover, Col, Row, Popconfirm } from 'antd';
import * as childProcess from 'child_process';

interface LoginItemProps {
  login: NonScratchOrg;
  onLogout: () => void
  onError: (err: string) => void;
}

interface LoginItemState {
  opening: boolean;
}

export class LoginItem extends React.Component<LoginItemProps, LoginItemState> {
  constructor(props) {
    super(props);
    this.state = {
      opening: false
    }
  }
  public render() {
    return (
      <Popover placement="top" title='Details' content={this.renderDetails()} trigger='hover'>
        <Row type="flex" justify="space-between" style={{width:'100%'}}>
          <Col span={16}>
            {this.props.login.connectedStatus !== 'Connected' && <Button icon='tool' type='danger' onClick={this.fix} />}
            {this.props.login.connectedStatus === 'Connected' && <Button icon='select' loading={this.state.opening} type="primary" onClick={() => { this.login() }} />}
            <span style={{ marginLeft: 10 }}>
              {this.props.login.alias ? `${this.props.login.alias} - ` : ''} {this.props.login.username}
            </span>
          </Col>
          <Col span={2}>
          <Popconfirm placement="top" title={'Are sure you want to remove this connection?'} onConfirm={this.logout} okText="Logout" cancelText="Cancel">
            <Button onClick={this.logout} type='danger' icon='close' />
          </Popconfirm>
          </Col>
        </Row>
      </Popover>
    );
  }

  private renderDetails = () => {
    return (
      <div>
        <p>Instance URL: {this.props.login.instanceUrl}</p>
        <p>Last Login: {this.props.login.lastUsed}</p>
      </div>
    )
  }

  private fix = () => {
    childProcess.exec(`sfdx force:auth:web:login -r ${this.props.login.loginUrl} -a '${this.props.login.alias}'`, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        this.props.onError(stderr);
      }
    });
  }

  private login = () => {
    this.setState({ opening: true }, () => {
      childProcess.exec(`sfdx force:org:open -u ${this.props.login.username}`, (error, stdout, stderr) => {
        this.setState({ opening: false });
        if (error) {
          console.log(error);
          this.props.onError(stderr);
        }
      });
    })
  }

  private logout = () => {
    childProcess.exec(`sfdx force:auth:logout -p -u '${this.props.login.username}'`, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        this.props.onError(stderr);
      }
      this.props.onLogout();
    });
  }
}
