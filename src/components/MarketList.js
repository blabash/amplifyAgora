import React from 'react';
import { graphqlOperation } from 'aws-amplify';
import { Connect } from 'aws-amplify-react';
import { listMarkets } from '../graphql/queries';
import { onCreateMarket } from '../graphql/subscriptions';
import { Loading, Card, Icon, Tag } from 'element-react';
import { Link } from 'react-router-dom';
import Error from './Error';

const MarketList = ({ searchResults, searchTerm, executedSearchTerm }) => {
  console.log(searchResults);
  const onNewMarket = (prevQuery, newData) => {
    let updatedQuery = { ...prevQuery };
    console.log(prevQuery, 'prev');
    console.log(newData, 'newD');
    const updatedMarketList = [
      newData.onCreateMarket,
      ...prevQuery.listMarkets.items
    ];
    updatedQuery.listMarkets.items = updatedMarketList; //combine market list from prevQ with newData
    return updatedQuery;
  };

  return (
    <Connect
      query={graphqlOperation(listMarkets)}
      subscription={graphqlOperation(onCreateMarket)}
      onSubscriptionMsg={onNewMarket} //run this function whenever a subscription runs
    >
      {({ data, loading, errors }) => {
        if (errors.length > 0) return <Error errors={errors} />;
        if (loading || !data.listMarkets) return <Loading fullscreen={true} />;
        const markets =
          searchResults.length > 0 ? searchResults : data.listMarkets.items;

        if (executedSearchTerm && searchResults.length === 0)
          return (
            <h2 className='text-red'>0 Results for "{executedSearchTerm}"</h2>
          );

        return (
          <>
            {searchResults.length > 0 ? (
              <h2 className='text-green'>
                <Icon type='success' name='check' className='icon' />
                {searchResults.length} Results for "{executedSearchTerm}"
              </h2>
            ) : (
              <h2 className='header'>
                <img
                  src='https://icon.now.sh/store_mall_directory/527FFF'
                  alt='Store Icon'
                  className='large-icon'
                />
                Markets
              </h2>
            )}
            {markets.map(market => (
              <div className='my-2' key={market.id}>
                <Card
                  bodyStyle={{
                    padding: '0.7em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span className='flex'>
                      <Link className='link' to={`/markets/${market.id}`}>
                        {market.name}
                      </Link>
                      <span style={{ color: 'var(--darkAmazonOrange)' }}>
                        {market.products.items
                          ? market.products.items.length
                          : 0}
                      </span>
                      <img
                        src='https://icon.now.sh/shopping_cart/f60'
                        alt='Shopping Cart'
                      />
                    </span>
                    <div style={{ color: 'var(--lightSquidInk)' }}>
                      {market.owner}
                    </div>
                  </div>
                  <div>
                    {market.tags &&
                      market.tags.map(tag => (
                        <Tag key={tag} type='danger' className='mx-1'>
                          {tag}
                        </Tag>
                      ))}
                  </div>
                </Card>
              </div>
            ))}
          </>
        );
      }}
    </Connect>
  );
};

export default MarketList;
