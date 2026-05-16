import type {
  AuthorizationCodeModel,
  ClientCredentialsModel,
  RefreshTokenModel,
  PasswordModel,
  ExtensionModel,
  User,
} from '@node-oauth/oauth2-server';

type Oauth2ServerModel =
  | AuthorizationCodeModel
  | ClientCredentialsModel
  | RefreshTokenModel
  | PasswordModel
  | ExtensionModel;

export type FacebookUserData = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
};

export type Model = Oauth2ServerModel & {
  facebookGrantType?: {
    fields?: string[];
  };
  getUserWithFacebook: (data: FacebookUserData) => Promise<User>;
};
