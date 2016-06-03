Meteor.methods({
  msGraphExchangeRefreshToken: function(userId) {
    this.unblock();

    if (this.connection) {
      if (this.userId) {
        userId = this.userId;
      } else {
        throw new Meteor.Error(403, "Must be signed in to use Microsoft Graph.");
      }
    }

    var user;
    if (userId && Meteor.isServer) {
      user = Meteor.users.findOne({_id: userId});
    } else {
      user = Meteor.user();
    }

    var config = Accounts.loginServiceConfiguration.findOne({service: "azureAd"});
    if (! config)
      throw new Meteor.Error(500, "Azure AD service not configured.");

    if (! user.services || ! user.services.azureAd || ! user.services.azureAd.refreshToken)
      throw new Meteor.Error(500, "Refresh token not found.");

    try {
      var result = Meteor.http.call("POST",
        "https://login.microsoftonline.com/common/oauth2/token",
        {
          params: {
            'client_id': config.clientId,
            'client_secret': config.secret,
            'refresh_token': user.services.azureAd.refreshToken,
            'grant_type': 'refresh_token',
            'resource': 'https://graph.microsoft.com/'
          }
      });
    } catch (e) {
      var code = e.response ? e.response.statusCode : 500;
      throw new Meteor.Error(code, 'Unable to exchange Azure AD refresh token.', e.response)
    }

    if (result.statusCode === 200) {
      Meteor.users.update(user._id, {
        '$set': {
          'services.azureAd.accessToken': result.data.access_token,
          'services.azureAd.refreshToken': result.data.refresh_token,
          'services.azureAd.expiresAt': (+new Date) + (1000 * result.data.expires_in),
        }
      });

      return result.data;
    } else {
      throw new Meteor.Error(result.statusCode, 'Unable to exchange google refresh token.', result);
    }
  }
});