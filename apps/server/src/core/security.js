import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const security = {
  hashPassword: async (password) => {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    return passwordHash;
  },
  verifyPassword: async (password, passwordHash) => {
    return await bcrypt.compare(password, passwordHash);
  },
};
