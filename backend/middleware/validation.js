const validateUser = (req, res, next) => {
  const { name, email, password, address } = req.body;
  const errors = [];

  if (!name || name.length < 20 || name.length > 60) {
    errors.push('Name must be between 20 and 60 characters');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }
  
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    errors.push('Password must be 8-16 characters with at least one uppercase letter and one special character');
  }

  if (!address || address.length > 400) {
    errors.push('Address is required and must be less than 400 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

module.exports = { validateUser };