import debug from "debug";
import { DbActivityThreadType } from "../../Types";
import pool from "../pool";
import sql from "./sql";
import { encodeCursor, decodeCursor } from "../queries-utils";

const log = debug("bobaserver:users:queries-log");
const error = debug("bobaserver:users:queries-error");
const info = debug("bobaserver:users:queries-info");

export const getUserFromFirebaseId = async ({
  firebaseId,
}: {
  firebaseId: string;
}): Promise<any> => {
  const query = "SELECT * FROM users WHERE firebase_id = $1 LIMIT 1";

  try {
    const user = await pool.one(query, [firebaseId]);
    info(`Fetched user data: `, user);
    return user;
  } catch (e) {
    error(`Error while fetching users.`);
    error(e);
    return null;
  }
};

export const dismissAllNotifications = async ({
  firebaseId,
}: {
  firebaseId: string;
}): Promise<any> => {
  const dismissNotifications = `
    INSERT INTO dismiss_notifications_requests(user_id, dismiss_request_time) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
         DEFAULT)
    ON CONFLICT(user_id) DO UPDATE 
        SET dismiss_request_time = DEFAULT
        WHERE dismiss_notifications_requests.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)`;

  try {
    await pool.none(dismissNotifications, { firebase_id: firebaseId });
    info(`Dismissed all notifications for user with firebaseId: `, firebaseId);
    return true;
  } catch (e) {
    error(`Error while dismissing notifications.`);
    error(e);
    return false;
  }
};

export const updateUserData = async ({
  firebaseId,
  username,
  avatarUrl,
}: {
  firebaseId: string;
  username: string;
  avatarUrl: string;
}): Promise<{
  username: string;
  avatarUrl: string;
} | null> => {
  const updateUserDataQuery = `
    UPDATE users
    SET username = $/username/,
        avatar_reference_id = $/avatar_url/
    WHERE firebase_id = $/firebase_id/`;

  try {
    await pool.none(updateUserDataQuery, {
      firebase_id: firebaseId,
      username,
      avatar_url: avatarUrl,
    });
    info(`Updated user data for user with firebaseId: `, firebaseId);
    return {
      username,
      avatarUrl,
    };
  } catch (e) {
    error(`Error while updating user data.`);
    error(e);
    return null;
  }
};

export const getInviteDetails = async ({
  nonce,
}: {
  nonce: string;
}): Promise<{
  email: string;
  used: boolean;
  expired: boolean;
  inviter: number;
} | null> => {
  const query = `
    SELECT 
      inviter,
      invitee_email,
      created + duration < NOW() as expired,
      used 
    FROM account_invites WHERE nonce = $/nonce/ 
    ORDER BY created LIMIT 1`;
  try {
    const inviteDetails = await pool.one(query, {
      nonce,
    });
    log(`Fetched details for invite ${nonce}:`);
    log(inviteDetails);
    return {
      email: inviteDetails.invitee_email,
      expired: inviteDetails.expired,
      used: inviteDetails.used,
      inviter: inviteDetails.inviter,
    };
  } catch (e) {
    error(`Error while getting invite details.`);
    error(e);
    return null;
  }
};

export const markInviteUsed = async ({
  nonce,
}: {
  nonce: string;
}): Promise<boolean> => {
  const query = `
    UPDATE account_invites
    SET used = TRUE
    WHERE nonce = $/nonce/`;
  try {
    await pool.none(query, {
      nonce,
    });
    log(`Marking invite ${nonce} as used.`);
    return true;
  } catch (e) {
    error(`Error while marking invite as used.`);
    error(e);
    return false;
  }
};

export const createNewUser = async (user: {
  firebaseId: string;
  invitedBy: number;
  createdOn: string;
}) => {
  const query = `
    INSERT INTO users(firebase_id, invited_by, created_on)
    VALUES ($/firebase_id/, $/invited_by/, $/created_on/)`;
  try {
    await pool.none(query, {
      firebase_id: user.firebaseId,
      invited_by: user.invitedBy,
      created_on: user.createdOn,
    });
    log(`Added new user in DB for firebase ID ${user.firebaseId}`);
    return true;
  } catch (e) {
    error(`Error creating a new user.`);
    error(e);
    return false;
  }
};

export const getBobadexIdentities = async ({
  firebaseId,
}: {
  firebaseId: string;
}) => {
  const query = `      
      SELECT 
        COUNT(*) AS identities_count,
        jsonb_agg(identities.IDENTITY) FILTER (WHERE (identities.identity->'caught')::boolean = TRUE) AS user_identities
      FROM (
        SELECT
          jsonb_build_object(
            'index', ROW_NUMBER() OVER (ORDER BY si .id),
            'name', si.display_name,
            'avatarUrl', si.avatar_reference_id,
            'caught', bool_or(uti.user_id IS NOT NULL)) AS identity
        FROM secret_identities si
        LEFT JOIN user_thread_identities uti ON uti.identity_id = si.id AND uti.user_id = (SELECT id FROM users WHERE firebase_id = $/firebase_id/)
        GROUP BY si.id) AS identities`;
  try {
    log(`Getting boba identities firebase ID ${firebaseId}`);
    return await pool.one(query, {
      firebase_id: firebaseId,
    });
  } catch (e) {
    error(`Error getting boba identities.`);
    error(e);
    return false;
  }
};

const DEFAULT_PAGE_SIZE = 10;
export const getUserActivity = async ({
  firebaseId,
  cursor,
  pageSize,
  updatedOnly,
  ownOnly,
}: {
  firebaseId: string;
  updatedOnly: boolean;
  ownOnly: boolean;
  cursor: string | null;
  pageSize?: number;
}): Promise<
  | {
      cursor: string | null;
      activity: DbActivityThreadType[];
    }
  | false
> => {
  try {
    const decodedCursor = cursor && decodeCursor(cursor);

    const finalPageSize =
      decodedCursor?.page_size || pageSize || DEFAULT_PAGE_SIZE;
    const rows = await pool.manyOrNone(sql.getUserFeedActivity, {
      firebase_id: firebaseId,
      last_activity_cursor: decodedCursor?.last_activity_cursor || null,
      page_size: finalPageSize,
      updated_only: updatedOnly,
      own_only: ownOnly,
    });

    if (rows.length == 1 && rows[0].thread_id == null) {
      // Only one row with just the null thread)
      log(`Feed empty.`);
      return { cursor: undefined, activity: [] };
    }

    let result = rows;
    let nextCursor = null;
    log(`Got getBoardActivityBySlug query result`, result);
    if (result.length > finalPageSize) {
      nextCursor = encodeCursor({
        last_activity_cursor: result[result.length - 1].thread_last_activity,
        page_size: finalPageSize,
      });
      // remove last element from array
      result.pop();
    }

    return { cursor: nextCursor, activity: rows };
  } catch (e) {
    error(`Error while fetching activity for user (${firebaseId}).`);
    error(e);
    return false;
  }
};
