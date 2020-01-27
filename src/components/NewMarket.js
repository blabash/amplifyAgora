import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { createMarket } from '../graphql/mutations';
// prettier-ignore
import { Form, Button, Dialog, Input, Notification } from 'element-react'
import CreatableSelect from 'react-select/creatable';
import { UserContext } from '../App';

export const tagOptions = [
  { value: 'web dev', label: 'Web Dev', color: '#00B8D9' },
  { value: 'arts', label: 'Arts', color: '#0052CC' },
  { value: 'crafts', label: 'Crafts', color: '#5243AA' },
  { value: 'technology', label: 'Technology', color: '#FF5630' },
  { value: 'automotive', label: 'Automotive', color: '#FF8B00' },
  { value: 'gaming', label: 'Gaming', color: '#FFC400' },
  { value: 'home', label: 'Home', color: '#36B37E' },
  { value: 'garden', label: 'Garden', color: '#00875A' }
];

class NewMarket extends React.Component {
  state = {
    name: '',
    selectedTags: [],
    addMarketDialog: false
  };

  handleAddMarket = async user => {
    try {
      this.setState({ addMarketDialog: false });
      const input = {
        name: this.state.name,
        tags: this.state.selectedTags.map(tag => tag.value.toLowerCase()),
        owner: user.username
      };
      const res = await API.graphql(graphqlOperation(createMarket, { input }));
      console.info(`Created market: id ${res.data.createMarket.id}`);
      this.setState({ name: '', selectedTags: [] });
    } catch (error) {
      console.error('Error adding new market', error);
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error adding market'}`
      });
    }
  };

  handleTagChange = async (newValue, actionMeta) => {
    await this.setState({ selectedTags: newValue });
  };

  render() {
    return (
      <UserContext.Consumer>
        {({ user }) => (
          <>
            <div className='market-header'>
              <h1 className='market-title'>
                Create Your MarketPlace
                <Button
                  type='text'
                  icon='edit'
                  className='market-title-button'
                  onClick={() => this.setState({ addMarketDialog: true })}
                />
              </h1>

              <Form inline onSubmit={this.props.handleSearch}>
                <Form.Item>
                  <Input
                    placeholder='Search Markets...'
                    icon='circle-cross'
                    onIconClick={this.props.handleClearSearch}
                    value={this.props.searchTerm}
                    onChange={this.props.handleSearchChange}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type='info'
                    icon='search'
                    onClick={this.props.handleSearch}
                    loading={this.props.isSearching}
                  >
                    Search
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <Dialog
              title='Create New Market'
              visible={this.state.addMarketDialog}
              onCancel={() => this.setState({ addMarketDialog: false })}
              size='large'
              customClass='dialog'
            >
              <Dialog.Body>
                <Form labelPosition='top'>
                  <Form.Item label='Add Market Name'>
                    <Input
                      placeholder='Market Name'
                      trim={true}
                      onChange={name => this.setState({ name })}
                      value={this.state.name}
                    ></Input>
                  </Form.Item>
                  <Form.Item label='Add Tags'>
                    <CreatableSelect
                      isMulti
                      onChange={this.handleTagChange}
                      options={tagOptions}
                      value={this.state.selectedTags}
                    />
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() => this.setState({ addMarketDialog: false })}
                >
                  Cancel
                </Button>
                <Button
                  type='primary'
                  disabled={!this.state.name}
                  onClick={() => this.handleAddMarket(user)}
                >
                  Add
                </Button>
              </Dialog.Footer>
            </Dialog>
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default NewMarket;
