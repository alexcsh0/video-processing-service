import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin";
import * as logger from "firebase-functions/logger";

export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoUrl: user.photoURL,
  };

  logger.info(`User Created: ${JSON.stringify(userInfo)}`);
  return;
});
