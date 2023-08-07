import chalk from "chalk";
import { Spinner } from "cli-spinner";
import { input, confirm } from "@inquirer/prompts";
import { shopifyGetBlog } from "./queries/shopifyGetBlog.js";
import { shopifyGetBlogs } from "./queries/shopifyGetBlogs.js";
import { shopifyGetArticles } from "./queries/shopifyGetArticles.js";
import { packGetBlogs } from "./queries/packGetBlogs.js";
import { packCreateBlog } from "./queries/packCreateBlog.js";
import { packGetArticle } from "./queries/packGetArticle.js";
import { packCreateArticle } from "./queries/packCreateArticle.js";
import { promptWait } from "./utils/promptWait.js";

Spinner.setDefaultSpinnerString(18);

export const processBlogs = () => {
  return new Promise(async (resolve, reject) => {
    // Set up spinner and start while fetching blogs
    const blogsSpinner = new Spinner({
      text: `%s ${chalk.yellow.italic.bold("Fetching blog handles from Shopify & Pack...")}`
    });
    blogsSpinner.start();

    // Fetch all blogs from Shopify & Pack
    const shopifyBlogs = await shopifyGetBlogs();
    const packBlogs = await packGetBlogs();
    const packBlogHandles = packBlogs.map((blog) => blog.handle);

    // Stop spinner
    blogsSpinner.stop(true);

    // Compare blogs from Shopify to blogs currently live on Pack
    const newBlogs = shopifyBlogs.filter((shopifyBlog) => {
      return !packBlogHandles.includes(shopifyBlog);
    });

    // Display blogs to user with indication of which blogs are new and will be added to pack
    if(newBlogs.length > 0) {
      const confirmNewBlogs = await confirm(
        { message: `${chalk.white.italic("The following blogs will be added to Pack:")} \n\n- ${chalk.bold(newBlogs.toString().replaceAll(",", "\n- "))} \n\n ${chalk.bgGreen(" Press enter to continue or ctrl+c to exit ")}\n`},
        { clearPromptOnDone: true }
      );

      // If user confirms, add new blogs to Pack
      if(confirmNewBlogs) {
        console.clear();
        // Fetch each blog's full data from Shopify and add to Pack
        await Promise.all(newBlogs.map((blog) => {
          return new Promise(async (resolve, reject) => {
            try {
              // Notify user of blog being added to Pack
              console.log(`${chalk.white.italic(`\nAdding blog with handle "${blog}" to Pack...\n`)}`);

              // Wait 1/2 second to avoid blowing up hamster wheels
              await promptWait(() => {}, 500);
              // Get full blog data from Shopify
              const shopifyBlog = await shopifyGetBlog(blog);
              // Add blog to Pack
              const packBlog = await packCreateBlog(shopifyBlog);
              // Wait 1/2 second to avoid blowing up hamster wheels
              await promptWait(() => {}, 500);

              // Notify user of success or failure, resolve or reject promise
              if(packBlog) {
                console.log(`${chalk.green.bold(`\nSuccessfully added "${blog}" to Pack!\n`)}`);
                return resolve();
              } else {
                console.log(`${chalk.red.bold(`\nFailed to add "${blog}" to Pack.\n`)}`);
                return reject();
              }
            } catch (error) {
              console.log(error);
              return reject();
            }
          });
        }));

        // Once all blogs are added, resolve promise
        console.log(`${chalk.bgGreen.white.bold("🎉 Successfully added all blogs to Pack! 🎉")}`);
        return resolve();
      }

      // If user does not confirm, skip adding new blogs to Pack
      if(!confirmNewBlogs) {
        console.log("\n\n Skipping blog sync... \n\n")
        return resolve();
      }
    } else {
      // If no new blogs, skip adding new blogs to Pack and resolve promise
      console.log(`${chalk.bgGreen.white.italic("\nNo new blogs to add to Pack. Continuing to Articles...\n")}`)
      return resolve();
    }
  });
};

export const processArticles = () => {
  return new Promise(async (resolve, reject) => {
    // Set up spinner and start while fetching blogs
    const blogsSpinner = new Spinner({
      text: `%s ${chalk.yellow.italic.bold("Verifying all blogs from Shopify exist in Pack...\n")}`
    });
    blogsSpinner.start();

     // Fetch all blogs from Shopify & Pack
    const shopifyBlogs = await shopifyGetBlogs();
    const packBlogs = await packGetBlogs();
    const packBlogHandles = packBlogs.map((blog) => blog.handle);

    const allBlogsExist = shopifyBlogs.every((shopifyBlog) => {
      return packBlogHandles.includes(shopifyBlog);
    });

    // Stop spinner
    blogsSpinner.stop(true);
    console.clear();

    // If not all blogs exist, notify user and exit
    if(!allBlogsExist) {
      console.log(`${chalk.bgRed.white.bold("\nNot all blogs from Shopify exist in Pack. Please run blog sync again.\n")}`);
      process.exit(0);
    };

    // If all blogs exist, fetch all articles from Shopify & Pack
    if(allBlogsExist) {
      for (const blog of shopifyBlogs) {
        let hasNextPage = true
        let endCursor = null
        let currentRequest
        const articles = [];
        const packBlogId = packBlogs.find((packBlog) => packBlog.handle === blog).id;

        // Set up spinner and start while fetching blogs
        const articleSpinner = new Spinner({
          text: `%s ${chalk.yellow.italic.bold(`Fetching all articles in "${blog}"...`)}`,
          Spinner: "dots",
        });
        articleSpinner.start();

        do {
          // Fetch all articles from Shopify for current blog
          await promptWait(() => {}, 500);
          currentRequest = await shopifyGetArticles(blog, 100, endCursor || null);

          if(currentRequest?.pageInfo?.hasNextPage) {
            currentRequest.edges.forEach(({ node }) => {
              articles.push(node);
            });

            endCursor = currentRequest.pageInfo.endCursor
          } else {
            if(currentRequest?.edges?.length > 0) {
              currentRequest.edges.forEach(({ node }) => {
                articles.push(node);
              });
            }

            hasNextPage = false
          }
        } while (hasNextPage);

        articleSpinner.stop();

        if(!hasNextPage && articles.length > 0) {
          console.log(chalk.bgGreen.white.bold(`Successfully fetched ${articles.length} articles from "${blog}"!`))
          console.log(chalk.yellow.italic.bold(`Adding ${articles.length} articles from ${blog} to Pack...`))

          // Loop through each article from last to first and add it to Pack
          for (const article of articles.reverse()) {
            await new Promise(async (resolve, reject) => {
              try {
                // Notify user of article being added to Pack
                console.log(chalk.yellow.italic(`\nAdding article with handle "${article.handle}" from "${blog}" to Pack...\n`));

                // Wait 1/2 second to avoid blowing up hamster wheels
                await promptWait(() => {}, 1000);

                // Add article to Pack
                await packCreateArticle(packBlogId, article);
                console.log(`${chalk.green.bold(`Successfully added "${article.handle}" from "${blog}" to Pack!\n`)}`);
                return resolve();

              } catch (error) {
                if(error.message.includes("Content already exists")) {
                  console.log(chalk.bgYellow.bold(`\nArticle with handle "${article.handle}" already exists in Pack. Skipping...\n`));
                  return resolve();
                } else {
                  console.log(`${chalk.red.bold(`Failed to add "${article.handle}" from "${blog}" to Pack.\n`)}`);
                  console.log(error);
                  return reject();
                }
              }
            }).catch((error) => {
              console.log(error);
            });
          }
        } else {
          console.log(chalk.bgRed.white.bold(`No articles found in ${blog}.`))
        }
      };

      // Once all articles are added, resolve promise
      console.log(`${chalk.bgGreen.white.bold("🎉 Successfully added all articles to Pack! 🎉")}`);
      await promptWait(() => {}, 5000);
      console.clear();
      return resolve();
    }
  });
};