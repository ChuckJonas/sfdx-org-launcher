import * as React from 'react';
import { Button, Drawer, Form, Row, Col, Input, Spin } from 'antd';
import * as childProcess from 'child_process';

export interface AddLoginProps {
  onSuccess: () => void;
  onError: (err: string) => void;
}

export interface AddLoginState {
  visible: boolean;
  alias: string;
  instanceUrl: string;
  waiting: boolean;
}

export class AddLogin extends React.Component<AddLoginProps, AddLoginState> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      alias: '',
      instanceUrl: '',
      waiting: false
    }
  }

  public closeDrawer = () => {
    this.setState({ visible: false });
  }

  public openDrawer = () => {
    this.setState({ visible: true });
  }

  private launchAuth = () => {
    this.setState({ waiting: true }, () => {
      let params = '';
      if(this.state.alias){
        params += `-a '${this.state.alias}'`
      }

      if(this.state.instanceUrl){
        params += `-r '${this.state.instanceUrl}'`
      }
      childProcess.exec(`sfdx force:auth:web:login ${params}`, (error, stdout, stderr) => {
        this.closeDrawer();
        if (error) {
          console.log(error);
          return this.props.onError(stderr);
        }

        this.setState({ waiting: false, alias: '', instanceUrl: '' }, ()=>{
          this.closeDrawer();
          this.props.onSuccess();
        })
      });
    });
  }

  private updateAlias = (alias: string) => {
    this.setState({ alias });
  }

  private updateInstanceUrl = (instanceUrl: string) => {
    this.setState({ instanceUrl });
  }

  private renderDrawer = () => {
    if (this.state.waiting) {
      return (
        <Row type="flex" justify="center">
          <Col>
            <Spin spinning={true} tip='Please Login using browser!' />
          </Col>
        </Row>
      )
    } else {
      return (
        <div>
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Alias">
                  <Input value={this.state.alias} onChange={(e) => { this.updateAlias(e.target.value) }} placeholder="enter optional short hand alias" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Instance Url">
                  <Input value={this.state.instanceUrl} onChange={(e) => { this.updateInstanceUrl(e.target.value) }} addonBefore="https://" placeholder="enter login url" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.closeDrawer}
            >
              Cancel
            </Button>
            <Button onClick={this.launchAuth} type="primary">Login</Button>
          </div>
        </div>
      )
    }
  }

  public render() {
    return (
      <div>
        <Button onClick={this.openDrawer} icon='plus' type='primary'>New</Button>
        <Drawer
          title="Create"
          width={720}
          placement="right"
          onClose={this.closeDrawer}
          maskClosable={false}
          visible={this.state.visible}
          style={{
            height: 'calc(100% - 100px)',
            overflow: 'auto',
            paddingBottom: 53,
          }}
        >
          {this.renderDrawer()}
        </Drawer>
      </div>
    );
  }
}
