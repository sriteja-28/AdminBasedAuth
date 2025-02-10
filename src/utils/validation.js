// src/utils/validation.js
export const validatePassword = (password) => {
  // Must be at least 8 characters and include one uppercase, one lowercase, one digit, and one symbol.
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

export const generatePassword = () => {
  // Generate a password that satisfies the requirements.
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits + symbols;

  let password = "";
  // Ensure each required type is included:
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill remaining characters (adjust length as needed)
  for (let i = 0; i < 4; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password;
};
