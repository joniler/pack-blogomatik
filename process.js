import chalk from "chalk";
import { Spinner } from "cli-spinner";
import { input, confirm } from "@inquirer/prompts";
import { shopifyGetBlog } from "./queries/shopifyGetBlog.js";
import { shopifyGetBlogs } from "./queries/shopifyGetBlogs.js";
import { shopifyGetArticles } from "./queries/shopifyGetArticles.js";
import { packCreateBlog } from "./queries/packCreateBlog.js";
import { packGetBlogs } from "./queries/packGetBlogs.js";
import { promptWait } from "./utils/promptWait.js";

export const processBlogs = () => {
  return new Promise(async (resolve, reject) => {
    // Set up spinner and start while fetching blogs
    const blogsSpinner = new Spinner({
      text: `%s ${chalk.yellow.italic.bold("Fetching blog handles from Shopify & Pack...")}`,
      Spinner: "dots",
    });
    blogsSpinner.start();

    // Fetch all blogs from Shopify & Pack
    const shopifyBlogs = await shopifyGetBlogs();
    const packBlogs = await packGetBlogs();

    // Stop spinner
    blogsSpinner.stop(true);

    // Compare blogs from Shopify to blogs currently live on Pack
    const newBlogs = shopifyBlogs.filter((shopifyBlog) => {
      return !packBlogs.includes(shopifyBlog);
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
              console.log(`${chalk.white.italic(`Adding blog with handle "${blog}" to Pack...\n`)}`);

              // Get full blog data from Shopify
              const shopifyBlog = await shopifyGetBlog(blog);
              // Add blog to Pack
              const packBlog = await packCreateBlog(shopifyBlog);
              // Wait one second to avoid blowing up hamster wheels
              promptWait(() => {}, 1000);

              // Notify user of success or failure, resolve or reject promise
              if(packBlog) {
                console.log(`${chalk.green.bold(`Successfully added "${blog}" to Pack!\n`)}`);
                return resolve();
              } else {
                console.log(`${chalk.red.bold(`Failed to add "${blog}" to Pack.\n`)}`);
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
      console.log(`${chalk.bgGreen.white.italic("\n\nNo new blogs to add to Pack. Continuing to Articles...\n\n")}`)
      return resolve();
    }
  });
};

export const processArticles = () => {
  return new Promise(async (resolve, reject) => {
    // Set up spinner and start while fetching blogs
    const blogsSpinner = new Spinner({
      text: `%s ${chalk.yellow.italic.bold("Verifying all blogs from Shopify exist in Pack...")}`,
      Spinner: "dots",
    });
    blogsSpinner.start();

     // Fetch all blogs from Shopify & Pack
    const shopifyBlogs = await shopifyGetBlogs();
    const packBlogs = await packGetBlogs();

    const allBlogsExist = shopifyBlogs.every((shopifyBlog) => {
      return packBlogs.includes(shopifyBlog);
    });

    // Stop spinner
    blogsSpinner.stop(true);

    if(!allBlogsExist) {
      shopifyBlogs.forEach(async (shopifyBlog) => {
        const articles = [];

        // Fetch all articles from Shopify for current blog
        const shopifyArticles = await shopifyGetArticles(shopifyBlog, 1, null, null);

        console.log(shopifyArticles)
      });
    };


    // If blogs exist, loop through each blog's articles and add to Pack in association with the blog to which it belongs

      // Timeout of one second per blog posted to Pack to avoid blowing up hamster wheels

    // If no, exit
  });
};