export default {
  events: {
    app: {
      ON_UPDATE_ACTIVITY_LOG: "activityLog:update",
      STATUS_UPDATED: "status:update",
      ON_NEW_MESSAGE: "message:new",
      MESSAGE_SENT: "message:sent",
    },
    socket: {},
  },
};
