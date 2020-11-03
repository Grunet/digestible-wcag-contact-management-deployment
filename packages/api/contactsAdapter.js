const { getSubscribers } = require("digestible-wcag-contact-management");

const { getMailchimpSecrets } = require("../../lib/config.js");

async function __getSubscribersData() {
  const { apiKey, listId } = getMailchimpSecrets();

  const { subscribers } = await getSubscribers({
    mailchimp: {
      apiKey: apiKey,
      listId: listId,
    },
  });

  //Can't pass Sets through GraphQL
  const subscriberArray = Array.from(subscribers);

  return subscriberArray;
}

module.exports = {
  getSubscribersData: __getSubscribersData,
};
