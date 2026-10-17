import admin from './messages/es/admin.json';
import auth from './messages/es/auth.json';
import common from './messages/es/common.json';
import correction from './messages/es/correction.json';
import errors from './messages/es/errors.json';
import member from './messages/es/member.json';
import plans from './messages/es/plans.json';
import publicArea from './messages/es/public.json';
import registration from './messages/es/registration.json';

export const locale = 'es';

export const messages = {
  common,
  errors,
  public: publicArea,
  member,
  admin,
  auth,
  registration,
  correction,
  plans,
};

export type Messages = typeof messages;
