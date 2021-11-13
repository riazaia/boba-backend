import debug from "debug";
import request from "supertest";
import router from "../../routes";
import { startTestServer } from "utils/test-utils";

const log = debug("bobaserver:board:routes");

describe("Tests boards REST API", () => {
  const server = startTestServer(router);

  test("should return activity data", async () => {
    const res = await request(server.app).get("/boards/gore");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      cursor: {
        next: null,
      },
      activity: [
        {
          id: "8b2646af-2778-487e-8e44-7ae530c2549c",
          parent_board_slug: "gore",
          starter: {
            id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
            parent_post_id: null,
            parent_thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
            content:
              '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
            created_at: "2020-09-25T05:42:00.00Z",
            new_comments_amount: 0,
            secret_identity: {
              avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
              name: "GoreMaster5000",
              accessory: null,
              color: "red",
            },
            own: false,
            friend: false,
            new: false,
            tags: {
              category_tags: [],
              content_warnings: ["harassment PSA"],
              index_tags: [],
              whisper_tags: ["An announcement from your headmaster!"],
            },
            // TODO[realms]: this is not accurate and should be rethought
            total_comments_amount: 0,
          },
          direct_threads_amount: 0,
          last_activity_at: "2020-10-04T05:44:00.00Z",
          new_comments_amount: 0,
          new_posts_amount: 0,
          total_comments_amount: 2,
          total_posts_amount: 1,
          muted: false,
          new: false,
          hidden: false,
          starred: false,
          default_view: "thread",
        },
        {
          id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          parent_board_slug: "gore",
          starter: {
            id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
            parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
            parent_post_id: null,
            created_at: "2020-04-30T03:23:00.00Z",
            content: '[{"insert":"Favorite character to maim?"}]',
            tags: {
              index_tags: ["evil", "bobapost"],
              whisper_tags: [],
              category_tags: ["bruises"],
              content_warnings: [],
            },
            // TODO[realms]: this is not accurate and should be rethought
            total_comments_amount: 0,
            new_comments_amount: 0,
            secret_identity: {
              name: "DragonFucker",
              avatar:
                "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
              accessory:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
              color: null,
            },
            own: false,
            friend: false,
            new: false,
          },
          new_posts_amount: 0,
          new_comments_amount: 0,
          total_comments_amount: 2,
          total_posts_amount: 3,
          last_activity_at: "2020-05-23T05:52:00.00Z",
          direct_threads_amount: 2,
          muted: false,
          hidden: false,
          starred: false,
          new: false,
          default_view: "thread",
        },
        {
          id: "a5c903df-35e8-43b2-a41a-208c43154671",
          starter: {
            id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
            parent_thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
            parent_post_id: null,
            created_at: "2020-04-24T05:42:00.00Z",
            content: '[{"insert":"Favorite murder scene in videogames?"}]',
            secret_identity: {
              name: "DragonFucker",
              avatar:
                "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
              accessory: null,
              color: null,
            },
            new: false,
            own: false,
            friend: false,
            tags: {
              index_tags: [],
              whisper_tags: ["mwehehehehe"],
              category_tags: ["blood", "bruises"],
              content_warnings: [],
            },
            total_comments_amount: 0,
            new_comments_amount: 0,
          },
          parent_board_slug: "gore",
          new_posts_amount: 0,
          new_comments_amount: 0,
          total_comments_amount: 0,
          total_posts_amount: 3,
          last_activity_at: "2020-05-03T09:47:00.00Z",
          direct_threads_amount: 2,
          muted: false,
          hidden: false,
          starred: false,
          new: false,
          default_view: "thread",
        },
      ],
    });
  });
});
