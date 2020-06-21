import "mocha";
import { expect } from "chai";

import { getThreadByStringId } from "../queries";

const extractActivityFromThread = (thread: any) => {
  return {
    string_id: thread.string_id,
    new_comments: thread.new_comments,
    new_posts: thread.new_posts,
    posts: thread.posts?.map((post: any) => ({
      id: post.id,
      is_new: post.is_new,
      new_comments: post.new_comments,
      comments: post.comments?.map((comment: any) => ({
        id: comment.id,
        is_new: comment.is_new,
      })),
    })),
  };
};

describe("threads activity queries", () => {
  it("gets correct amounts with no visit", async () => {
    // Since there was no visit we expect every post/comment to be marked as new
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Jersey Devil
      firebaseId: "fb2",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).to.eql({
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      new_comments: 2,
      new_posts: 3,
      posts: [
        {
          id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: true,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: true,
          new_comments: 0,
        },
        {
          comments: [
            {
              id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: true,
            },
            {
              id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: true,
            },
          ],
          id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: true,
          new_comments: 2,
        },
      ],
    });
  });
  it("gets correct amounts with new comments (self)", async () => {
    // The only new comments are from the user itself
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).to.eql({
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      new_comments: 0,
      new_posts: 0,
      posts: [
        {
          id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: false,
          new_comments: 0,
        },
        {
          comments: [
            {
              id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: false,
            },
            {
              id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: false,
            },
          ],
          id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: false,
          new_comments: 0,
        },
      ],
    });
  });

  it("gets correct amounts with new comments (not self)", async () => {
    // The new comments are not from the user itself
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Oncest
      firebaseId: "fb3",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).to.eql({
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      new_comments: 2,
      new_posts: 0,
      posts: [
        {
          id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: false,
          new_comments: 0,
        },
        {
          comments: [
            {
              id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: true,
            },
            {
              id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: true,
            },
          ],
          id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: false,
          new_comments: 2,
        },
      ],
    });
  });

  it("gets correct amounts with new posts (self)", async () => {
    // Since we made the last posts since the visit we expect no new ones
    const thread = await getThreadByStringId({
      threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
      // Jersey Devil
      firebaseId: "fb2",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).to.eql({
      new_comments: 0,
      new_posts: 0,
      posts: [
        {
          comments: undefined,
          id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "08f25ef1-82dc-4202-a410-c0723ef76789",
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
          is_new: false,
          new_comments: 0,
        },
      ],
      string_id: "a5c903df-35e8-43b2-a41a-208c43154671",
    });
  });

  it("gets correct amounts with new posts (not self)", async () => {
    // We expect new posts after the last visit
    const thread = await getThreadByStringId({
      threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
      // Oncest
      firebaseId: "fb3",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).to.eql({
      new_comments: 0,
      new_posts: 1,
      posts: [
        {
          comments: undefined,
          id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "08f25ef1-82dc-4202-a410-c0723ef76789",
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
          is_new: true,
          new_comments: 0,
        },
      ],
      string_id: "a5c903df-35e8-43b2-a41a-208c43154671",
    });
  });

  it("gets correct amounts with no updates", async () => {
    // Since the last visit was after the last post we expect no updates
    const thread = await getThreadByStringId({
      threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).to.eql({
      new_comments: 0,
      new_posts: 0,
      posts: [
        {
          comments: undefined,
          id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "08f25ef1-82dc-4202-a410-c0723ef76789",
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
          is_new: false,
          new_comments: 0,
        },
      ],
      string_id: "a5c903df-35e8-43b2-a41a-208c43154671",
    });
  });

  it("gets correct amounts (logged out)", async () => {
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      firebaseId: undefined,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).to.eql({
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      new_comments: 0,
      new_posts: 0,
      posts: [
        {
          id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: false,
          new_comments: 0,
        },
        {
          comments: [
            {
              id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: false,
            },
            {
              id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: false,
            },
          ],
          id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: false,
          new_comments: 0,
        },
      ],
    });
  });

  it("gets correct amounts with dismiss notifications (new)", async () => {
    // The only new comments are from the user itself
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // SexyDaddy69
      firebaseId: "fb4",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).to.eql({
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      new_comments: 2,
      new_posts: 2,
      posts: [
        {
          id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: false,
          new_comments: 0,
        },
        {
          comments: undefined,
          id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: true,
          new_comments: 0,
        },
        {
          comments: [
            {
              id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: true,
            },
            {
              id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: true,
            },
          ],
          id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: true,
          new_comments: 2,
        },
      ],
    });
  });

  it("gets correct amounts with dismiss notifications (no new)", async () => {
    // The only new comments are from the user itself
    const thread = await getThreadByStringId({
      // Anime board
      threadId: "b27710a8-0a9f-4c09-b3a5-54668bab7051",
      // SexyDaddy69
      firebaseId: "fb4",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).to.eql({
      string_id: "b27710a8-0a9f-4c09-b3a5-54668bab7051",
      new_comments: 0,
      new_posts: 0,
      posts: [
        {
          id: "987f795b-d60d-4016-af82-8684411f7785",
          comments: undefined,
          is_new: false,
          new_comments: 0,
        },
      ],
    });
  });
});