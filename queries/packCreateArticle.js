const CREATE_ARTICLE = gql`
  mutation ArticleCreate($input: ArticleCreateInput!) {
    articleCreate(input: $input) {
      id
      title
      handle
      description
      status
      seo {
        title
        description
        image
        keywords
        noIndex
        noFollow
      }
    }
  }
`;

export const packCreateArticle = async (packClient, newArticleInput) => {

    // Expected Format
    // {
    //   title,
    //   handle,
    //   description,
    //   seo: {
    //     title,
    //     description,
    //     image,
    //     noIndex: !!noIndex,
    //     noFollow: !!noFollow,
    //   },
    //   bodyHtml,   //←--------------- THIS HERE can be the HTML body of the shopify article if you want to use it
    //   sectionIds: sectionsToAddToPage,
    // }

    await packClient.mutate({
      mutation: CREATE_ARTICLE,
      variables: {
        input: newArticleInput,
      },
    });
}