import {
  AuthorizationCodeModel,
  ClientCredentialsModel,
  RefreshTokenModel,
  PasswordModel,
  ExtensionModel,
} from 'oauth2-server';

type Oauth2ServerModel =
  | AuthorizationCodeModel
  | ClientCredentialsModel
  | RefreshTokenModel
  | PasswordModel
  | ExtensionModel;

type FacebookTokenData = {
  first_name: string;
  last_name: string;
  email: string;
  id: string;
};

export type Model = Oauth2ServerModel & {
  facebookGrantType: {
    fields?: string[];
  };
  getUserWithFacebook: (data: FacebookTokenData) => any;
};
