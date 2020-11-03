const { get: getSecretOrEnvVar } = require("docker-secrets-nodejs");

function getMailchimpSecrets() {
  return {
    //The env variable fallbacks are the uppercase versions of the secret names
    apiKey: getSecretOrEnvVar("dwcag_apikeys_mailchimp_default"),
    listId: getSecretOrEnvVar("dwcag_locatorIds_mailchimp_listId"),
  };
}

module.exports = {
  getMailchimpSecrets: getMailchimpSecrets,
};
