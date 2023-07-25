const CREATE_BLOG = gql`
  mutation BlogCreate($input: BlogCreateInput!) {
    blogCreate(input: $input) {
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

export const packCreateBlog = async (packClient, newBlogInput) => {
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
  //   sectionIds: [],
  // }

  await packClient.mutate({
    mutation: CREATE_BLOG,
    variables: {
      input: newBlogInput,
    },
  });
};