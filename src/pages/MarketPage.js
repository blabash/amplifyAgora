import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
// import { getMarket } from '../graphql/queries';
import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
} from '../graphql/subscriptions';
import { Loading, Tabs, Icon } from 'element-react';
import { Link } from 'aws-amplify-react';
import NewProduct from '../components/NewProduct';
import Product from '../components/Product';

const getMarket = `query GetMarket($id: ID!) {
  getMarket(id: $id) {
    id
    name
    products(sortDirection: DESC, limit: 999) {
      items {
        id
        description
        price
        shipped
        owner
        file {
          key
        }
        createdAt
      }
      nextToken
    }
    tags
    owner
    createdAt
  }
}
`;

class MarketPage extends React.Component {
  state = {
    market: null,
    isLoading: true,
    isMarketOwner: false
  };

  checkMarketOwner = () => {
    const { user } = this.props;
    const { market } = this.state;
    if (user) {
      this.setState({ isMarketOwner: user.username === market.owner });
    }
  };

  handleGetMarket = async () => {
    const input = {
      id: this.props.marketId
    };
    const res = await API.graphql(graphqlOperation(getMarket, input));

    this.setState({ market: res.data.getMarket, isLoading: false }, () => {
      this.checkMarketOwner();
    });
  };

  componentDidMount() {
    this.handleGetMarket();

    console.log(this.props.user);

    const {
      attributes: { sub }
    } = this.props.user;

    this.createProductListener = API.graphql(
      graphqlOperation(onCreateProduct, { owner: sub })
    ).subscribe({
      next: productData => {
        const createdProduct = productData.value.data.onCreateProduct;
        const prevProducts = this.state.market.products.items.filter(
          item => item.id !== createdProduct.id
        );
        const updatedProducts = [createdProduct, ...prevProducts];
        const market = { ...this.state.market };
        market.products.items = updatedProducts;
        this.setState({ market });
      }
    });

    this.updateProductListener = API.graphql(
      graphqlOperation(onUpdateProduct, { owner: sub })
    ).subscribe({
      next: productData => {
        const updatedProduct = productData.value.data.onUpdateProduct;
        const updatedIndex = this.state.market.products.items.findIndex(
          item => item.id === updatedProduct.id
        );
        const updatedProducts = [
          ...this.state.market.products.items.slice(0, updatedIndex),
          updatedProduct,
          ...this.state.market.products.items.slice(updatedIndex + 1)
        ];
        const market = { ...this.state.market };
        market.products.items = updatedProducts;
        this.setState({ market });
      }
    });

    this.deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct, { owner: sub })
    ).subscribe({
      next: productData => {
        const deletedProduct = productData.value.data.onDeleteProduct;
        const updatedProducts = this.state.market.products.items.filter(
          item => item.id !== deletedProduct.id
        );
        const market = { ...this.state.market };
        market.products.items = updatedProducts;
        this.setState({ market });
      }
    });
  }

  componentWillUnmount() {
    this.createProductListener.unsubscribe();
    this.updateProductListener.unsubscribe();
    this.deleteProductListener.unsubscribe();
  }

  render() {
    const { market, isLoading, isMarketOwner } = this.state;
    return isLoading ? (
      <Loading fullscreen />
    ) : (
      <>
        <Link className='link' to='/'>
          Back to Markets List
        </Link>
        <span className='items-center pt-2'>
          <h2 className='mb-mr'>{market.name}</h2>- {market.owner}
        </span>
        <div className='items-center pt-2'>
          <span style={{ color: 'var(--lightSquidInk', paddingBottom: '1em' }}>
            <Icon name='date' className='icon' />
            {market.createdAt}
          </span>
        </div>

        {/* New Product */}
        <Tabs type='border-card' value={isMarketOwner ? '1' : '2'}>
          {isMarketOwner && (
            <Tabs.Pane
              label={
                <>
                  <Icon name='plus' className='icon' /> Add Product
                </>
              }
              name='1'
            >
              <NewProduct marketId={this.props.marketId} />
            </Tabs.Pane>
          )}

          {/* Products List */}
          <Tabs.Pane
            label={
              <>
                <Icon name='menu' className='icon' />
                Products ({market.products.items.length})
              </>
            }
            name='2'
          >
            <div className='product-list'>
              {market.products.items.map(product => (
                <Product key={product.id} product={product} />
              ))}
            </div>
          </Tabs.Pane>
        </Tabs>
      </>
    );
  }
}

export default MarketPage;
