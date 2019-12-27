import * as React from 'react';
import { Button, Drawer, Form, Row, Col, Input, Spin, Select } from 'antd';
import * as childProcess from 'child_process';

export interface AddLoginProps {
  onSuccess: () => void;
  onError: (err: string) => void;
  onOpen: () => void;
  onClose: () => void;
  onLogin: () => void;
  onUpdateInstanceUrl: (s: string) => void;
  onUpdateAlias: (s: string) => void;
  visible: boolean;
  alias: string;
  instanceUrl: string;
  waiting: boolean;
}


const formItemLayout = {
  labelCol: {
    xs: { span: 12 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

export class AddLogin extends React.Component<AddLoginProps, never> {

  constructor(props: AddLoginProps) {
    super(props);
  }

  private launchAuth = () => {
    this.props.onLogin();
  }

  private renderDrawer = () => {
    if (this.props.waiting) {
      return (
        <Row type="flex" justify="center">
          <Col>
            <Spin spinning={true} tip='Please Login using browser!' />
          </Col>
        </Row>
      )
    }  {
      const val = this.props.instanceUrl === 'login.salesforce.com'
        || this.props.instanceUrl === 'test.salesforce.com' ? this.props.instanceUrl : undefined;
      const defaultInstances = (
        <Select
          style={{ width: 150 }}
          value={val}
          onSelect={(val: string) => this.props.onUpdateInstanceUrl(val)}
          placeholder={'default instances'}
        >
          <Select.Option value="login.salesforce.com">production</Select.Option>
          <Select.Option value="test.salesforce.com">sandbox</Select.Option>
        </Select>
      )
      return (
        <div>
          <Form hideRequiredMark={true}>

            <Form.Item {...formItemLayout} label="Alias">
              <Input
                value={this.props.alias}
                onChange={(e) => { this.props.onUpdateAlias(e.target.value) }}
                placeholder="enter optional short hand alias"
              />
            </Form.Item>

            <Form.Item {...formItemLayout} label="Instance Url">
              <Input
                value={this.props.instanceUrl}
                onChange={(e) => { this.props.onUpdateInstanceUrl(e.target.value) }}
                addonBefore="https://" addonAfter={defaultInstances}
                placeholder="enter login url"
              />
            </Form.Item>

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
              onClick={this.props.onClose}
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
        <Button onClick={this.props.onOpen} icon='plus' type='primary'>New</Button>
        <Drawer
          title="Create"
          width={720}
          placement="right"
          onClose={this.props.onClose}
          maskClosable={false}
          visible={this.props.visible}
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
