import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { searchMarkets } from '../graphql/queries';
import NewMarket from '../components/NewMarket';
import MarketList from '../components/MarketList';

class HomePage extends React.Component {
  state = {
    searchTerm: '',
    searchResults: [],
    isSearching: false,
    executedSearchTerm: ''
  };

  handleSearchChange = searchTerm => this.setState({ searchTerm });

  handleClearSearch = () =>
    this.setState({
      searchTerm: '',
      searchResults: [],
      executedSearchTerm: ''
    });

  handleSearch = async e => {
    try {
      e.preventDefault();
      this.setState({ isSearching: true });
      const res = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: this.state.searchTerm } },
              { owner: { match: this.state.searchTerm } },
              { tags: { match: this.state.searchTerm } }
            ]
          },
          sort: {
            field: 'createdAt',
            direction: 'desc'
          }
        })
      );
      this.setState({
        searchResults: res.data.searchMarkets.items,
        isSearching: false,
        executedSearchTerm: this.state.searchTerm
      });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <>
        <NewMarket
          searchTerm={this.state.searchTerm}
          handleSearchChange={this.handleSearchChange}
          handleClearSearch={this.handleClearSearch}
          handleSearch={this.handleSearch}
          isSearching={this.state.isSearching}
        />
        <MarketList
          searchResults={this.state.searchResults}
          searchTerm={this.state.searchTerm}
          executedSearchTerm={this.state.executedSearchTerm}
        />
      </>
    );
  }
}

export default HomePage;
