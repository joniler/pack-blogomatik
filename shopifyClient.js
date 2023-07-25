export const shopifyClient = (shopifyEndpoint, storefrontApiKey) => {
  return new ApolloClient({
    link: createHttpLink({
      uri: `https://${shopifyEndpoint}/api/2023-07/graphql.json`,
      headers: {
        "X-Shopify-Storefront-Access-Token": storefrontApiKey,
      },
      fetch,
    }),
    cache: new InMemoryCache(),
  });
}