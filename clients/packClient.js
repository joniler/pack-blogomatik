import pkg from '@apollo/client/core/core.cjs';
const { ApolloClient, from, InMemoryCache, createHttpLink } = pkg;
import { onError } from "apollo-link-error";

export const packClient = (packStorefrontSecret) => {
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    // if (graphQLErrors)
    //   graphQLErrors.forEach(({ message, locations, path }) =>
    //     console.log(
    //       `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
    //     )
    //   );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const httpLink = createHttpLink({
    uri: "https://app.packdigital.com/graphql",
    headers: {
      "Authorization": `Bearer ${packStorefrontSecret}`,
    },
  })

  return new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
  });
};