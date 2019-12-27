import * as React from 'react';
import { Button, Icon, Popover, Col, Row, Popconfirm, Tooltip } from 'antd';
import * as childProcess from 'child_process';

interface LoginItemProps {
  login: Login;
  onLogout: () => void
  onError: (err: string) => void;
  onFix: (login: Login) => void
}

interface LoginItemState {
  opening: boolean;
}

export class LoginItem extends React.Component<LoginItemProps, LoginItemState> {
  constructor(props: LoginItemProps) {
    super(props);
    this.state = {
      opening: false
    }
  }
  public render() {
    return (

      <Row type="flex" justify="space-between" align="middle" style={{ width: '100%' }}>
        <Col span={2}>
          {this.props.login.connectedStatus !== 'Connected' && <Button icon='tool' type='danger' onClick={() => this.props.onFix(this.props.login)} />}
          {this.props.login.connectedStatus === 'Connected' && <Button icon='select' loading={this.state.opening} type="primary" onClick={() => { this.login() }} />}
          {this.props.login.isProduction && <Tooltip placement="top" title='production'><Icon type="cloud-o" style={{ color: '#21A0DF', fontWeight: 'bold' }} /> </Tooltip>}
        </Col>
        <Col span={20}>
          <Popover placement="top" title='Details' content={this.renderDetails()} trigger='hover'>
            {this.props.login.alias ? this.props.login.alias + ' - ' : ''} {this.props.login.username}
          </Popover>
        </Col>
        <Col span={2}>
          <Popconfirm placement="top" title={'Are sure you want to remove this connection?'} onConfirm={this.logout} okText="Logout" cancelText="Cancel">
            <Button type='danger' icon='delete' />
          </Popconfirm>
        </Col>
      </Row>
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

  private login = () => {
    this.setState({ opening: true }, () => {
      const cmd = 'sfdx force:org:open -u "' + this.props.login.username + '"';
      console.log(cmd);
      childProcess.exec(cmd, (error, stdout, stderr) => {
        this.setState({ opening: false });
        if (error) {
          this.props.onError(stderr);
        }
      });
    })
  }

  private logout = () => {
    const cmd = 'sfdx force:auth:logout -p -u "' + this.props.login.username + '"';
    console.log(cmd);

    childProcess.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        this.props.onError(stderr);
      }
      this.props.onLogout();
    });
  }
}
