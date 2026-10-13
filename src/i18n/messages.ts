import admin from './messages/es/admin.json';
import common from './messages/es/common.json';
import errors from './messages/es/errors.json';
import member from './messages/es/member.json';
import publicArea from './messages/es/public.json';

export const locale = 'es';

export const messages = {
  common,
  errors,
  public: publicArea,
  member,
  admin,
};

export type Messages = typeof messages;
